import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_BACKEND_URL 
  ? process.env.REACT_APP_BACKEND_URL.replace('/api', '')
  : 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
  transports: ['websocket']
});

export default socket;