import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { socketService } from '@/services/socket';
import { useSelector } from 'react-redux';
import type { RootState } from '@/context/store';
import type { ReactNode } from 'react';
import { SocketContext } from './socket-context';
import { SOCKET_EVENTS } from '@/types/socket';

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);
  useEffect(() => {
    if (!token) {
      setError('No authentication token available');
      return;
    }

    let socketInstance: Socket;
    try {
      socketInstance = socketService.connect(token);
      setSocket(socketInstance);

      const handleConnect = () => {
        setIsConnected(true);
        setSocketId(socketInstance.id || null);
        setError(null);
      };
      const handleDisconnect = () => {
        setIsConnected(false);
        setSocketId(null);
      };
      const handleConnectError = (error: Error) => {
        setError(`Connection error: ${error.message}`);
      };

      if (socketInstance.connected) handleConnect();

      socketInstance.on(SOCKET_EVENTS.CONNECTION, handleConnect);
      socketInstance.on(SOCKET_EVENTS.DISCONNECT, handleDisconnect);
      socketInstance.on(SOCKET_EVENTS.ERROR, handleConnectError);

      return () => {
        socketInstance.off(SOCKET_EVENTS.CONNECTION, handleConnect);
        socketInstance.off(SOCKET_EVENTS.DISCONNECT, handleDisconnect);
        socketInstance.off(SOCKET_EVENTS.ERROR, handleConnectError);
        socketService.disconnect();
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to socket');
    }
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, error, socketId }}>
      {children}
    </SocketContext.Provider>
  );
};
