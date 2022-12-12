import { Component, OnInit } from '@angular/core';
import {SocketsService} from '../shared/services/sockets.service';
import {Router} from '@angular/router';
import {CookiesService} from '../shared/services/cookies.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage implements OnInit {

  public inARoom = false;

  constructor(
    private socketsService: SocketsService,
    private router: Router,
    public cookiesService: CookiesService
  ) {}

  async ngOnInit() {
    this.socketsService.initSocket();
    this.socketsService.setRoomSockets();
    this.cookiesService.username =  await this.cookiesService.getFromCookies('username');
  }

  toggleInARoom() {
    this.inARoom = !this.inARoom;
  }

}
