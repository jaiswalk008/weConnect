import { Request, Response } from 'express';
import agoraService from '../services/agora.service';

export const generateToken = async (req: Request, res: Response) => {
  try {
    const { channelName, uid } = req.body;

    if (!channelName || !uid) {
      res.status(400).json({ success: false, error: 'channelName and uid are required' });
      return;
    }

    const token = agoraService.generateRtcToken(channelName, Number(uid));
    const appId = agoraService.getAppId();

    res.json({
      success: true,
      token,
      channel: channelName,
      uid: Number(uid),
      appId,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to generate token' });
  }
};
