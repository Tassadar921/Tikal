import { Injectable } from '@angular/core';
import {Socket} from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketsService {

  constructor(
    private socket: Socket
  ) {}

  initSocket = () => this.socket.connect();

  setRoomSockets = () => {
    this.socket.emit('enterRoom', 'Tassadar');
  };
}
