import { Injectable } from '@angular/core';
import {Socket} from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketsService {

  public roomID;

  constructor(
    private socket: Socket
  ) {}

  initSocket = () => this.socket.connect();

  setRoomSockets = () => {
    this.socket.on('roomCreated', (roomID) => {
      this.roomID = roomID;
    });
    this.socket.emit('createRoom');
  };
}
