import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { socketService } from '@/services/socket';
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/socket';
import { useSelector } from 'react-redux';
import type { RootState } from '@/context/store';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(
    null,
  );
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (!token) {
      setError('No authentication token available');
      return;
    }

    let socketInstance: Socket<ServerToClientEvents, ClientToServerEvents>;

    try {
      socketInstance = socketService.connect(token);
      setSocket(socketInstance);

      const handleConnect = () => {
        // console.log('Socket connected successfully');
        setIsConnected(true);
        setError(null);
        // socketService.setOnline();
      };

      const handleDisconnect = () => {
        // console.log('Socket disconnected');
        setIsConnected(false);
      };

      const handleConnectError = (error: Error) => {
        // console.error('Socket connection error:', error);
        setError(`Connection error: ${error.message}`);
      };

      socketInstance.on('connect', handleConnect);
      socketInstance.on('disconnect', handleDisconnect);
      socketInstance.on('connect_error', handleConnectError);

      return () => {
        socketInstance.off('connect', handleConnect);
        socketInstance.off('disconnect', handleDisconnect);
        socketInstance.off('connect_error', handleConnectError);
        socketService.disconnect();
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to socket';
      // console.error('Socket initialization error:', errorMessage);
      setError(errorMessage);
    }
  }, [token]);

  return { socket, isConnected, error };
};
