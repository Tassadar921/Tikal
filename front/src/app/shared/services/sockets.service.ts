import { Injectable } from '@angular/core';
import {Socket} from 'ngx-socket-io';
import {CookiesService} from './cookies.service';

@Injectable({
  providedIn: 'root'
})
export class SocketsService {

  public roomID;
  public roomNumber;
  public playersInRoom = [];

  constructor(
    private socket: Socket,
    private cookiesService: CookiesService
  ) {}

  initSocket = () => this.socket.connect();
  roomCreated = () => this.socket.emit('createRoom');

  setRoomSockets = () => {
    this.socket.on('roomCreated', async (data) => {
      this.roomID = data.id;
      this.roomNumber = data.roomNumber;
      this.playersInRoom.push(await this.cookiesService.getFromCookies('username'));
    });
    this.socket.on('playerJoined', (player) => {
      this.playersInRoom.push(player);
    });
  };
}
