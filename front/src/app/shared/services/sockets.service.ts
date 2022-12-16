import { Injectable } from '@angular/core';
import {Socket} from 'ngx-socket-io';
import {CookiesService} from './cookies.service';

@Injectable({
  providedIn: 'root'
})
export class SocketsService {

  public roomID;
  public playersInRoom = [];
  public host = '';

  constructor(
    private socket: Socket,
    private cookiesService: CookiesService
  ) {}

  initSocket = () => {
    this.socket.connect();
    this.socket.emit('getUsername', this.cookiesService.username);
    this.socket.on('roomCreated', async (roomID) => {
      this.roomID = roomID;
      this.playersInRoom.push(await this.cookiesService.getFromCookies('username'));
    });
  }

  joinRoom = (roomID) => {
    this.socket.on('roomJoined', (data) => {
      this.roomID = data.roomID;
      this.playersInRoom = data.playersInRoom;
      this.playersInRoom.push(this.cookiesService.username);
    });
    this.socket.emit('joinRoom', {roomID, username: this.cookiesService.username});
    return !!this.roomID; //string to boolean TOO SMART
  };

  createRoom = () => {
    this.socket.emit('createRoom', {username: this.cookiesService.username});
    this.socket.on('getPlayerList', () => {
      this.socket.emit('playersInRoom', this.playersInRoom);
    });
  }

}
