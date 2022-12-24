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
  public output = '';
  public inARoom = false;

  constructor(
    private socket: Socket,
    private cookiesService: CookiesService
  ) {}

  initSocket = () => {
    this.socket.connect();
    console.log('test');
    this.socket.on('usernameLost', () => {
      console.log('on demande le username');
      this.sendUsername();
    });
  };

  sendUsername = () => this.socket.emit('getUsername', this.cookiesService.username);

  joinRoom = (roomID) => {
    this.socket.on('roomJoined', (data) => {
      this.roomID = data.roomID;
      this.playersInRoom = data.playersInRoom;
      this.inARoom = true;
      this.enterRoom();
      console.log(this.playersInRoom);
    });
    this.socket.on('roomNotFound', () => {
      this.output = 'Room not found';
    });
    this.socket.emit('joinRoom', {roomID, username: this.cookiesService.username});
  };

  createRoom = () => {
    this.socket.on('roomCreated', async (roomID) => {
      this.roomID = roomID;
      this.playersInRoom.push(await this.cookiesService.getFromCookies('username'));
    });
    this.socket.emit('createRoom', {username: this.cookiesService.username});
    this.enterRoom();
  }

  enterRoom = () => {
    this.socket.on('playerJoined', username => this.playersInRoom.push(username));
  }

}
