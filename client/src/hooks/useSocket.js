import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
    });
  }
  return socket;
}

export function useSocket(deptId) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    if (!deptId) {
      return;
    }

    const s = getSocket();

    if (!s.connected) {
      s.connect();
    }

    function joinRoom() {
      s.emit('join:department', { deptId });
    }

    function handleConnect() {
      setIsConnected(true);
      setIsReconnecting(false);
      joinRoom();
    }

    function handleDisconnect() {
      setIsConnected(false);
      setIsReconnecting(true);
    }

    function handleConnectError() {
      setIsConnected(false);
      setIsReconnecting(true);
    }

    function handleQueueUpdated(payload) {
      const id = payload?.deptId || deptId;
      queryClient.invalidateQueries({ queryKey: ['queue', id] });
      queryClient.invalidateQueries({ queryKey: ['queue', id, 'stats'] });
    }

    s.on('connect', handleConnect);
    s.on('disconnect', handleDisconnect);
    s.on('connect_error', handleConnectError);
    s.on('queue:updated', handleQueueUpdated);

    if (s.connected) {
      handleConnect();
    }

    return () => {
      s.emit('leave:department', { deptId });
      s.off('connect', handleConnect);
      s.off('disconnect', handleDisconnect);
      s.off('connect_error', handleConnectError);
      s.off('queue:updated', handleQueueUpdated);
    };
  }, [deptId, queryClient]);

  return {
    isConnected,
    isReconnecting,
    socket: getSocket(),
  };
}

export default useSocket;
