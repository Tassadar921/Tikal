import { Injectable } from '@angular/core';
import {Socket} from 'ngx-socket-io';
import {CookiesService} from './cookies.service';
import {ToastService} from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class SocketsService {

  public roomID;
  public playersInRoom = [];
  public host = '';
  public inARoom = false;
  public ready = false;

  constructor(
    private socket: Socket,
    private cookiesService: CookiesService,
    private toastService: ToastService
  ) {}

  initSocket = () => {
    this.socket.connect();
    this.socket.on('usernameLost', () => {
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
    });
    this.socket.on('roomNotFound', async () => {
      await this.toastService.displayToast('Room not found', 3000, 'bottom');
    });
    this.socket.emit('joinRoom', {roomID, username: this.cookiesService.username});
  };

  createRoom = () => {
    this.socket.on('roomCreated', async roomID => {
      this.roomID = roomID;
      this.playersInRoom.push({username: this.cookiesService.username, ready:false});
    });
    this.socket.emit('createRoom', {username: this.cookiesService.username});
    this.inARoom = true;
    this.enterRoom();
  };

  enterRoom = () => {
    this.socket.on('playerJoined', username => this.playersInRoom.push({username, ready:false}));
    this.socket.on('playerReady', data => {
      this.playersInRoom.forEach(player => {
        if(player.username === data.username){
          player.ready = data.ready;
        }
      });
    });
    this.socket.on('playerLeft', data => {
      this.playersInRoom = this.playersInRoom.filter(player => player.username !== data.username);
    });
    this.socket.on('kicked', async () => {
      this.leaveRoom();
      await this.toastService.displayToast('You have been kicked from the room', 3000, 'bottom');
    });
  };

  leaveRoom = () => {
    this.socket.emit('leaveRoom');
    this.roomID = '';
    this.playersInRoom = [];
    this.inARoom = false;
    this.ready = false;
  };

  toggleReady = () => {
    this.ready = !this.ready;
    this.socket.emit('toggleReady', this.ready);
  };

}
