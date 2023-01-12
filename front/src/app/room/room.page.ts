import {Component, AfterViewInit, OnDestroy} from '@angular/core';
import {SocketsService} from '../shared/services/sockets.service';
import {CookiesService} from '../shared/services/cookies.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage implements AfterViewInit {
  public output = '';

  constructor(
    public socketsService: SocketsService,
    public cookiesService: CookiesService
  ) {}

  async ngAfterViewInit() {
    // this.cookiesService.username =  await this.cookiesService.getFromCookies('username');
    this.cookiesService.username = (Math.random() + 1).toString(36).substring(2);
    this.socketsService.initSocket();
  }


  toggleInARoom = () => this.socketsService.inARoom = !this.socketsService.inARoom;


  setEventRoomID = () => {

  };



}
