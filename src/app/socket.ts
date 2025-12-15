import { io, Socket } from 'socket.io-client';
import { environment } from '../environments/environment';

const URL = environment.apiUrl;

export const socket: Socket = io(URL, {
  autoConnect: false,
});
export default socket;