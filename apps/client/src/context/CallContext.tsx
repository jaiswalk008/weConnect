import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import AgoraRTC, { IAgoraRTCClient, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { useSocket } from './socket-context';
import {
  SOCKET_EVENTS,
  CallType,
  CallIncomingData,
  CallAnsweredData,
  CallRejectedData,
  CallEndedData,
  CallUserEventData,
  CallInitiateResponse,
  CallAnswerResponse,
} from '@/types/socket';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import type { RootState } from '@/context/store';

// Call status types
export type CallStatus = 'idle' | 'ringing' | 'incoming' | 'connecting' | 'active' | 'no_answer';

const RING_TIMEOUT_MS = 60_000; // 1 minute

export interface CallParticipant {
  id: number;
  name: string;
  username?: string;
  profileImage?: string;
}

interface CallState {
  status: CallStatus;
  callId: string | null;
  chatId: number | null;
  callType: CallType | null;
  /** For incoming calls: the caller. For outgoing calls: the person being called. */
  peerInfo: {
    name: string;
    username?: string;
    profileImage?: string;
  } | null;
  isMuted: boolean;
  callDuration: number;
  /** Users currently active in the call */
  activeParticipants: CallParticipant[];
  showParticipantsPanel: boolean;
}

interface CallContextType extends CallState {
  initiateCall: (chatId: number, callType: CallType, peerInfo: { name: string; username?: string; profileImage?: string }) => void;
  answerCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleParticipantsPanel: () => void;
  retryCall: () => void;
  dismissCall: () => void;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error('useCall must be used within CallProvider');
  return context;
};

const initialCallState: CallState = {
  status: 'idle',
  callId: null,
  chatId: null,
  callType: null,
  peerInfo: null,
  isMuted: false,
  callDuration: 0,
  activeParticipants: [],
  showParticipantsPanel: false,
};

interface CallProviderProps {
  children: ReactNode;
}

export const CallProvider = ({ children }: CallProviderProps) => {
  const { socket } = useSocket();
  const [callState, setCallState] = useState<CallState>(initialCallState);
  const userData = useSelector((state: RootState) => state.auth.userData);

  // Refs for Agora resources (avoid stale closures)
  const agoraClientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ringTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callStateRef = useRef(callState);
  callStateRef.current = callState;

  // ── Agora helpers ──

  const createAgoraClient = useCallback(() => {
    if (agoraClientRef.current) return agoraClientRef.current;
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    agoraClientRef.current = client;
    return client;
  }, []);

  const joinChannel = useCallback(
    async (token: string, channel: string, uid: number, appId: string) => {
      const client = createAgoraClient();
      await client.join(appId, channel, token, uid);

      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioTrackRef.current = audioTrack;
      await client.publish([audioTrack]);

      durationIntervalRef.current = setInterval(() => {
        setCallState((prev) => ({ ...prev, callDuration: prev.callDuration + 1 }));
      }, 1000);

      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      });

      client.on('user-left', (user) => {
        setCallState((prev) => ({
          ...prev,
          activeParticipants: prev.activeParticipants.filter((p) => p.id !== user.uid),
        }));
      });
    },
    [createAgoraClient],
  );

  const clearRingTimeout = useCallback(() => {
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    clearRingTimeout();
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.close();
      localAudioTrackRef.current = null;
    }
    if (agoraClientRef.current) {
      agoraClientRef.current.leave().catch(() => {});
      agoraClientRef.current = null;
    }
    setCallState(initialCallState);
  }, [clearRingTimeout]);

  // ── Shared helper: start ringing after joining Agora channel ──

  /**
   * After successfully joining Agora, add self to participant list and
   * start the 60-second ring timeout. Used by initiateCall and retryCall.
   */
  const startRinging = useCallback(
    (response: CallInitiateResponse) => {
      const selfParticipant: CallParticipant = {
        id: response.uid!,
        name: userData?.name || 'You',
        username: userData?.username || undefined,
        profileImage: userData?.profile_image || undefined,
      };

      setCallState((prev) => ({
        ...prev,
        status: 'ringing',
        activeParticipants: [selfParticipant],
      }));

      // Start ring timeout — 1 minute max
      clearRingTimeout();
      ringTimeoutRef.current = setTimeout(() => {
        if (callStateRef.current.status === 'ringing') {
          // Stop Agora but keep call state for retry UI
          if (localAudioTrackRef.current) {
            localAudioTrackRef.current.close();
            localAudioTrackRef.current = null;
          }
          if (agoraClientRef.current) {
            agoraClientRef.current.leave().catch(() => {});
            agoraClientRef.current = null;
          }
          // Emit end to server so it cleans up
          if (socket && callStateRef.current.callId && callStateRef.current.chatId) {
            (socket as any).emit(SOCKET_EVENTS.CALL_END, {
              callId: callStateRef.current.callId,
              chatId: callStateRef.current.chatId,
            });
          }
          setCallState((prev) => ({ ...prev, status: 'no_answer' }));
        }
      }, RING_TIMEOUT_MS);
    },
    [userData, clearRingTimeout, socket],
  );

  // ── Call actions ──

  const initiateCall = useCallback(
    (chatId: number, callType: CallType, peerInfo: { name: string; username?: string; profileImage?: string }) => {
      if (!socket) {
        toast.error('Not connected to server');
        return;
      }
      if (callStateRef.current.status !== 'idle') {
        toast.error('Already in a call');
        return;
      }

      setCallState({
        ...initialCallState,
        status: 'ringing',
        chatId,
        callType,
        peerInfo,
      });

      socket.emit(SOCKET_EVENTS.CALL_INITIATE, { chatId, callType }, (response: CallInitiateResponse) => {
        if (response.success && response.callId && response.token && response.channel && response.uid && response.appId) {
          setCallState((prev) => ({
            ...prev,
            callId: response.callId!,
          }));
          joinChannel(response.token, response.channel, response.uid, response.appId)
            .then(() => startRinging(response))
            .catch((error) => {
              console.error('Failed to join channel:', error);
              toast.error('Failed to start call');
              cleanup();
            });
        } else {
          toast.error(response.error || 'Failed to initiate call');
          setCallState(initialCallState);
        }
      });
    },
    [socket, joinChannel, cleanup, startRinging],
  );

  const answerCall = useCallback(() => {
    if (!socket || !callStateRef.current.callId || !callStateRef.current.chatId) return;

    const { callId, chatId } = callStateRef.current;

    setCallState((prev) => ({ ...prev, status: 'connecting' }));

    socket.emit(SOCKET_EVENTS.CALL_ANSWER, { callId, chatId }, (response: CallAnswerResponse) => {
      if (response.success && response.token && response.channel && response.uid && response.appId) {
        // Populate participant list from the server's full snapshot
        const participants = (response.activeParticipants || []).map((p) => ({
          id: p.id,
          name: p.name,
          username: p.username,
          profileImage: p.profileImage,
        }));

        joinChannel(response.token, response.channel, response.uid, response.appId)
          .then(() => {
            setCallState((prev) => ({ ...prev, status: 'active', activeParticipants: participants }));
          })
          .catch((error) => {
            console.error('Failed to join channel:', error);
            toast.error('Failed to join call');
            cleanup();
          });
      } else {
        toast.error(response.error || 'Failed to answer call');
        cleanup();
      }
    });
  }, [socket, joinChannel, cleanup]);

  const rejectCall = useCallback(() => {
    if (!socket || !callStateRef.current.callId || !callStateRef.current.chatId) return;

    (socket as any).emit(SOCKET_EVENTS.CALL_REJECT, {
      callId: callStateRef.current.callId,
      chatId: callStateRef.current.chatId,
    });
    cleanup();
  }, [socket, cleanup]);

  const endCall = useCallback(() => {
    if (!socket || !callStateRef.current.callId || !callStateRef.current.chatId) return;

    (socket as any).emit(SOCKET_EVENTS.CALL_END, {
      callId: callStateRef.current.callId,
      chatId: callStateRef.current.chatId,
    });
    cleanup();
  }, [socket, cleanup]);

  const toggleMute = useCallback(() => {
    if (localAudioTrackRef.current) {
      const newMuted = !callStateRef.current.isMuted;
      localAudioTrackRef.current.setEnabled(!newMuted);
      setCallState((prev) => ({ ...prev, isMuted: newMuted }));
    }
  }, []);

  const toggleParticipantsPanel = useCallback(() => {
    setCallState((prev) => ({ ...prev, showParticipantsPanel: !prev.showParticipantsPanel }));
  }, []);

  /** Retry the call after no_answer — stay on the call screen (no flicker) */
  const retryCall = useCallback(() => {
    const { chatId, callType, peerInfo } = callStateRef.current;
    if (!chatId || !callType || !peerInfo || !socket) return;

    // Go straight to ringing (UI stays mounted)
    setCallState((prev) => ({
      ...prev,
      status: 'ringing',
      callId: null,
      isMuted: false,
      callDuration: 0,
      activeParticipants: [],
      showParticipantsPanel: false,
    }));

    // Re-initiate the call via socket
    socket.emit(SOCKET_EVENTS.CALL_INITIATE, { chatId, callType }, (response: CallInitiateResponse) => {
      if (response.success && response.callId && response.token && response.channel && response.uid && response.appId) {
        setCallState((prev) => ({ ...prev, callId: response.callId! }));

        joinChannel(response.token, response.channel, response.uid, response.appId)
          .then(() => startRinging(response))
          .catch((error) => {
            console.error('Failed to join channel:', error);
            toast.error('Failed to start call');
            cleanup();
          });
      } else {
        toast.error(response.error || 'Failed to initiate call');
        cleanup();
      }
    });
  }, [socket, joinChannel, cleanup, startRinging]);

  /** Dismiss the no_answer screen and go back to idle */
  const dismissCall = useCallback(() => {
    setCallState(initialCallState);
  }, []);

  // ── Socket listeners ──

  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (data: CallIncomingData) => {
      if (callStateRef.current.status !== 'idle') {
        (socket as any).emit(SOCKET_EVENTS.CALL_REJECT, { callId: data.callId, chatId: data.chatId });
        return;
      }

      setCallState({
        ...initialCallState,
        status: 'incoming',
        callId: data.callId,
        chatId: data.chatId,
        callType: data.callType,
        peerInfo: {
          name: data.chatInfo.chatName,
          profileImage: data.chatInfo.chatImage,
          // For personal chats, show caller's username; for groups, no username
          username: data.chatInfo.chatType === 'PERSONAL' ? data.caller.username : undefined,
        },
      });
    };

    const handleAnswered = (data: CallAnsweredData) => {
      if (callStateRef.current.callId === data.callId) {
        // Someone answered — clear ring timeout
        clearRingTimeout();
        setCallState((prev) => ({
          ...prev,
          status: 'active',
          activeParticipants: [
            ...prev.activeParticipants.filter((p) => p.id !== data.userId),
            { id: data.userId, name: data.username, username: data.username },
          ],
        }));
      }
    };

    const handleRejected = (data: CallRejectedData) => {
      if (callStateRef.current.callId === data.callId) {
        toast.info(`${data.username} declined the call`);
        // Only cleanup if this was a 1:1 call (caller is alone, the only recipient rejected)
        // For group calls, the call continues for other participants
        if (callStateRef.current.activeParticipants.length <= 1 && callStateRef.current.status === 'ringing') {
          cleanup();
        }
      }
    };

    const handleEnded = (data: CallEndedData) => {
      if (callStateRef.current.callId === data.callId) {
        toast.info('Call ended');
        cleanup();
      }
    };

    const handleUserLeft = (data: CallUserEventData) => {
      if (callStateRef.current.callId === data.callId) {
        setCallState((prev) => ({
          ...prev,
          activeParticipants: prev.activeParticipants.filter((p) => p.id !== data.userId),
        }));
      }
    };

    socket.on(SOCKET_EVENTS.CALL_INCOMING, handleIncoming);
    socket.on(SOCKET_EVENTS.CALL_ANSWERED, handleAnswered);
    socket.on(SOCKET_EVENTS.CALL_REJECTED, handleRejected);
    socket.on(SOCKET_EVENTS.CALL_ENDED, handleEnded);
    socket.on(SOCKET_EVENTS.CALL_USER_LEFT, handleUserLeft);

    return () => {
      socket.off(SOCKET_EVENTS.CALL_INCOMING, handleIncoming);
      socket.off(SOCKET_EVENTS.CALL_ANSWERED, handleAnswered);
      socket.off(SOCKET_EVENTS.CALL_REJECTED, handleRejected);
      socket.off(SOCKET_EVENTS.CALL_ENDED, handleEnded);
      socket.off(SOCKET_EVENTS.CALL_USER_LEFT, handleUserLeft);
    };
  }, [socket, cleanup, clearRingTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const contextValue: CallContextType = {
    ...callState,
    initiateCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleParticipantsPanel,
    retryCall,
    dismissCall,
  };

  return <CallContext.Provider value={contextValue}>{children}</CallContext.Provider>;
};
