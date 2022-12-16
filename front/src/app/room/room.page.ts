import { Component, OnInit } from '@angular/core';
import {SocketsService} from '../shared/services/sockets.service';
import {CookiesService} from '../shared/services/cookies.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage implements OnInit {

  public inARoom = false;
  public tmpRoomID = '';
  public output = '';

  constructor(
    public socketsService: SocketsService,
    public cookiesService: CookiesService
  ) {}

  async ngOnInit() {
    this.cookiesService.username =  await this.cookiesService.getFromCookies('username');
    this.socketsService.initSocket();
    document.getElementById('roomID').addEventListener('keyup', (e) => {
      if(e.key==='Enter' && !this.inARoom){
        if(!this.socketsService.joinRoom(this.tmpRoomID)){
          this.output = 'Room not found';
        }
      }
    });
  }

  toggleInARoom = () => this.inARoom = !this.inARoom;

  createRoom = () => {
    this.toggleInARoom();
    this.socketsService.createRoom();
  }

}
