import { Injectable } from '@angular/core';
import {Socket} from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketsService {

  constructor(
    private socket: Socket
  ) {}

  setRoomSockets = () => {
    this.socket.connect();
    this.socket.emit('enterRoom', 'Tassadar');
  };
}
