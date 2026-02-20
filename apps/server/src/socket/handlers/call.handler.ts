import { CustomSocket, CustomServer } from '../../types/socket';
import { SOCKET_EVENTS } from '../events';
import {
  CallInitiatePayload,
  CallAnswerPayload,
  CallRejectPayload,
  CallEndPayload,
} from '../../types/call';
import agoraService from '../../services/agora.service';
import prisma from '../../config/database';
import logger from '../../config/logger';
import { v4 as uuidv4 } from 'uuid';

interface CallParticipantInfo {
  id: number;
  name: string;
  username?: string;
  profileImage?: string;
}

interface ActiveCall {
  chatId: number;
  callerId: number;
  callType: 'VOICE' | 'VIDEO';
  channelName: string;
  /** Map<userId, userInfo> for rich participant data */
  participants: Map<number, CallParticipantInfo>;
  /** Server-side timeout to auto-cleanup stale calls */
  staleTimeoutId: ReturnType<typeof setTimeout> | null;
}

// 90 seconds — slightly longer than client's 60s ring timeout
const STALE_CALL_TIMEOUT_MS = 90_000;

// In-memory store for active calls
const activeCalls = new Map<string, ActiveCall>();

// ── Helpers ──

/** Verify that a user is a member of the given chat */
async function verifyMembership(userId: number, chatId: number): Promise<boolean> {
  const participant = await prisma.chatParticipant.findFirst({
    where: { chat_id: chatId, user_id: userId },
    select: { id: true },
  });
  return !!participant;
}

/** Clear the stale-call timeout for a given call */
function clearStaleTimeout(call: ActiveCall) {
  if (call.staleTimeoutId) {
    clearTimeout(call.staleTimeoutId);
    call.staleTimeoutId = null;
  }
}

/** Remove a user from a call and handle cleanup / notifications */
function removeUserFromCall(io: CustomServer, callId: string, userId: number, username: string) {
  const activeCall = activeCalls.get(callId);
  if (!activeCall) return;

  activeCall.participants.delete(userId);

  if (activeCall.participants.size === 0) {
    // Last person left — fully end the call
    clearStaleTimeout(activeCall);

    prisma.chatParticipant
      .findMany({
        where: { chat_id: activeCall.chatId },
        select: { user_id: true },
      })
      .then((chatMembers) => {
        for (const p of chatMembers) {
          if (p.user_id !== userId) {
            io.to(`user:${p.user_id}`).emit(SOCKET_EVENTS.CALL_ENDED as any, {
              callId,
              chatId: activeCall.chatId,
              userId,
            });
          }
        }
      });

    activeCalls.delete(callId);
    logger.info(`Call ${callId} ended — last participant (user ${userId}) left`);
  } else {
    // User left but others remain — notify remaining participants
    for (const [participantId] of activeCall.participants) {
      io.to(`user:${participantId}`).emit(SOCKET_EVENTS.CALL_USER_LEFT as any, {
        callId,
        chatId: activeCall.chatId,
        userId,
        username,
      });
    }
    logger.info(`User ${userId} left call ${callId}, ${activeCall.participants.size} remaining`);
  }
}

export class CallHandler {
  constructor(
    private io: CustomServer,
    private socket: CustomSocket,
  ) {}

  async handleInitiate(data: CallInitiatePayload, callback: (response: any) => void) {
    try {
      const callerId = this.socket.data.user.id;
      const { chatId, callType } = data;

      if (!chatId) {
        callback({ success: false, error: 'Chat ID is required' });
        return;
      }

      // ── Security: verify caller belongs to this chat ──
      const isMember = await verifyMembership(callerId, chatId);
      if (!isMember) {
        callback({ success: false, error: 'You are not a member of this chat' });
        return;
      }

      // Get chat details for display
      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        select: {
          chat_type: true,
          chat_name: true,
          chat_image: true,
        },
      });

      if (!chat) {
        callback({ success: false, error: 'Chat not found' });
        return;
      }

      // Get chat participants from DB
      const chatParticipants = await prisma.chatParticipant.findMany({
        where: { chat_id: chatId },
        select: {
          user_id: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              profile_image: true,
            },
          },
        },
      });

      if (chatParticipants.length < 2) {
        callback({ success: false, error: 'Not enough participants in this chat' });
        return;
      }

      // Generate call ID and channel name
      const callId = uuidv4();
      const channelName = agoraService.getChannelName(chatId, callId);

      // Generate token for the caller
      const callerToken = agoraService.generateRtcToken(channelName, callerId);
      const appId = agoraService.getAppId();

      // Get caller info
      const callerUser = chatParticipants.find((p) => p.user_id === callerId);
      const callerInfo: CallParticipantInfo = {
        id: callerId,
        name: callerUser?.user.name || 'Unknown',
        username: callerUser?.user.username || undefined,
        profileImage: callerUser?.user.profile_image || undefined,
      };

      // Store active call with participant info map
      const participantMap = new Map<number, CallParticipantInfo>();
      participantMap.set(callerId, callerInfo);

      const activeCall: ActiveCall = {
        chatId,
        callerId,
        callType,
        channelName,
        participants: participantMap,
        staleTimeoutId: null,
      };

      // Server-side stale call timeout — auto-cleanup if nobody answers
      activeCall.staleTimeoutId = setTimeout(() => {
        const call = activeCalls.get(callId);
        if (call && call.participants.size <= 1) {
          logger.info(`Call ${callId} stale — no one answered, auto-cleaning`);
          // Notify remaining participants (caller) that call ended
          for (const [pid] of call.participants) {
            this.io.to(`user:${pid}`).emit(SOCKET_EVENTS.CALL_ENDED as any, {
              callId,
              chatId,
              userId: callerId,
            });
          }
          activeCalls.delete(callId);
        }
      }, STALE_CALL_TIMEOUT_MS);

      activeCalls.set(callId, activeCall);

      // Build chat display info
      const chatInfo = {
        chatType: chat.chat_type,
        chatName: chat.chat_type === 'GROUP' ? chat.chat_name || 'Group Call' : callerInfo.name,
        chatImage:
          chat.chat_type === 'GROUP' ? chat.chat_image || '' : callerInfo.profileImage || '',
      };

      // Get recipient user IDs (everyone except the caller)
      const recipientIds = chatParticipants
        .filter((p) => p.user_id !== callerId)
        .map((p) => p.user_id);

      // Notify all other participants about incoming call
      const callSignalData = {
        callId,
        chatId,
        callType,
        caller: callerInfo,
        chatInfo,
        participants: recipientIds,
        token: '',
        channel: channelName,
        appId,
      };

      for (const recipientId of recipientIds) {
        this.io.to(`user:${recipientId}`).emit(SOCKET_EVENTS.CALL_INCOMING as any, callSignalData);
      }

      logger.info(`Call ${callId} initiated by user ${callerId} in chat ${chatId}`);

      callback({
        success: true,
        callId,
        token: callerToken,
        channel: channelName,
        uid: callerId,
        appId,
      });
    } catch (error: any) {
      logger.error('Error initiating call:', error);
      callback({ success: false, error: error.message || 'Failed to initiate call' });
    }
  }

  async handleAnswer(data: CallAnswerPayload, callback: (response: any) => void) {
    try {
      const userId = this.socket.data.user.id;
      const { callId, chatId } = data;

      const activeCall = activeCalls.get(callId);
      if (!activeCall) {
        callback({ success: false, error: 'Call not found or already ended' });
        return;
      }

      // ── Security: verify answerer belongs to this chat ──
      const isMember = await verifyMembership(userId, activeCall.chatId);
      if (!isMember) {
        callback({ success: false, error: 'You are not a member of this chat' });
        return;
      }

      // Someone answered — clear the stale timeout
      clearStaleTimeout(activeCall);

      // Generate token for the answerer
      const token = agoraService.generateRtcToken(activeCall.channelName, userId);
      const appId = agoraService.getAppId();

      // Build this user's info
      const userInfo: CallParticipantInfo = {
        id: userId,
        name: this.socket.data.user.name || 'Unknown',
        username: this.socket.data.user.username || undefined,
        profileImage: this.socket.data.user.profile_image || undefined,
      };

      // Snapshot current participants BEFORE adding the new user
      const currentParticipants = Array.from(activeCall.participants.values());

      // Add user to active participants
      activeCall.participants.set(userId, userInfo);

      // Notify existing participants that someone answered
      const username = this.socket.data.user.username || this.socket.data.user.name;
      for (const [participantId] of activeCall.participants) {
        if (participantId !== userId) {
          this.io.to(`user:${participantId}`).emit(SOCKET_EVENTS.CALL_ANSWERED as any, {
            callId,
            chatId,
            userId,
            username,
          });
        }
      }

      logger.info(`Call ${callId} answered by user ${userId}`);

      // Send token, channel, AND full current participant list to the answerer
      callback({
        success: true,
        token,
        channel: activeCall.channelName,
        uid: userId,
        appId,
        activeParticipants: [...currentParticipants, userInfo],
      });
    } catch (error: any) {
      logger.error('Error answering call:', error);
      callback({ success: false, error: error.message || 'Failed to answer call' });
    }
  }

  async handleReject(data: CallRejectPayload) {
    try {
      const userId = this.socket.data.user.id;
      const { callId, chatId } = data;

      const activeCall = activeCalls.get(callId);
      if (!activeCall) return;

      // ── Security: verify user belongs to this chat ──
      const isMember = await verifyMembership(userId, activeCall.chatId);
      if (!isMember) return;

      const username = this.socket.data.user.username || this.socket.data.user.name;

      // Notify the caller that the call was rejected
      this.io.to(`user:${activeCall.callerId}`).emit(SOCKET_EVENTS.CALL_REJECTED as any, {
        callId,
        chatId,
        userId,
        username,
      });

      // For 1:1 calls where the only person in the call is the caller, clean up
      if (activeCall.participants.size <= 1) {
        clearStaleTimeout(activeCall);
        activeCalls.delete(callId);
      }

      logger.info(`Call ${callId} rejected by user ${userId}`);
    } catch (error) {
      logger.error('Error rejecting call:', error);
    }
  }

  async handleEnd(data: CallEndPayload) {
    try {
      const userId = this.socket.data.user.id;
      const { callId, chatId } = data;

      const activeCall = activeCalls.get(callId);
      if (!activeCall) return;

      // ── Security: verify user belongs to this chat ──
      const isMember = await verifyMembership(userId, activeCall.chatId);
      if (!isMember) return;

      const username = this.socket.data.user.username || this.socket.data.user.name;

      removeUserFromCall(this.io, callId, userId, username);
    } catch (error) {
      logger.error('Error ending call:', error);
    }
  }

  /**
   * Called when a socket disconnects — remove user from any active calls.
   * This is a static method so it can be called from the disconnect handler
   * without needing the original CallHandler instance.
   */
  static handleDisconnect(io: CustomServer, userId: number) {
    for (const [callId, activeCall] of activeCalls) {
      if (activeCall.participants.has(userId)) {
        const name = activeCall.participants.get(userId)?.name || 'Unknown';
        logger.info(`User ${userId} disconnected, removing from call ${callId}`);
        removeUserFromCall(io, callId, userId, name);
      }
    }
  }

  registerEvents() {
    this.socket.on(SOCKET_EVENTS.CALL_INITIATE as any, (data: CallInitiatePayload, callback: any) =>
      this.handleInitiate(data, callback),
    );
    this.socket.on(SOCKET_EVENTS.CALL_ANSWER as any, (data: CallAnswerPayload, callback: any) =>
      this.handleAnswer(data, callback),
    );
    this.socket.on(SOCKET_EVENTS.CALL_REJECT as any, (data: CallRejectPayload) =>
      this.handleReject(data),
    );
    this.socket.on(SOCKET_EVENTS.CALL_END as any, (data: CallEndPayload) => this.handleEnd(data));
  }
}
