export type CallType = 'VOICE' | 'VIDEO';

export interface CallInitiatePayload {
  chatId: number;
  callType: CallType;
}

export interface CallSignalData {
  callId: string;
  chatId: number;
  callType: CallType;
  caller: {
    id: number;
    name: string;
    username?: string;
    profileImage?: string;
  };
  participants: number[];
}

export interface CallAnswerPayload {
  callId: string;
  chatId: number;
}

export interface CallRejectPayload {
  callId: string;
  chatId: number;
}

export interface CallEndPayload {
  callId: string;
  chatId: number;
}

export interface CallTokenResponse {
  token: string;
  channel: string;
  uid: number;
  appId: string;
}

export interface CallUserEvent {
  callId: string;
  chatId: number;
  userId: number;
  username: string;
}
