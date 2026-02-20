import { RtcTokenBuilder, RtcRole } from 'agora-token';
import config from '../config/environment';

class AgoraService {
  private appId: string;
  private appCertificate: string;

  constructor() {
    this.appId = config.agoraAppId;
    this.appCertificate = config.agoraAppCertificate;
  }

  /**
   * Generate an RTC token for a user to join a channel.
   * @param channelName - The Agora channel name (format: call-{chatId}-{callId})
   * @param uid - The user's numeric UID (we use their DB user ID)
   * @param role - Publisher (can send audio) or Subscriber (can only receive)
   * @param expireSeconds - Token validity in seconds (default 1 hour)
   */
  generateRtcToken(
    channelName: string,
    uid: number,
    role: 'publisher' | 'subscriber' = 'publisher',
    expireSeconds: number = 3600,
  ): string {
    const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expireSeconds;

    return RtcTokenBuilder.buildTokenWithUid(
      this.appId,
      this.appCertificate,
      channelName,
      uid,
      agoraRole,
      expireSeconds,
      privilegeExpiredTs,
    );
  }

  /**
   * Generate the channel name for a call session.
   */
  getChannelName(chatId: number, callId: string): string {
    return `call-${chatId}-${callId}`;
  }

  getAppId(): string {
    return this.appId;
  }
}

const agoraService = new AgoraService();
export default agoraService;
