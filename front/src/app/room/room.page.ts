import {Component, AfterViewInit, OnDestroy} from '@angular/core';
import {SocketsService} from '../shared/services/sockets.service';
import {CookiesService} from '../shared/services/cookies.service';
import {ApiService} from '../shared/services/api.service';
import {ViewWillLeave} from '@ionic/angular';
import {Platform} from '@ionic/angular';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage implements AfterViewInit, OnDestroy, ViewWillLeave {
  public output = '';

  constructor(
    public socketsService: SocketsService,
    public cookiesService: CookiesService,
    private apiService: ApiService,
    private platform: Platform
  ) {}

  async ngAfterViewInit() {
    // this.cookiesService.username =  await this.cookiesService.getFromCookies('username');
    this.cookiesService.username = (Math.random() + 1).toString(36).substring(2);
    this.socketsService.initSocket();
    document.addEventListener('close', async () => {
      await this.apiService.disconnect();
    });
  }

  async ngOnDestroy() {
    // await this.apiService.disconnect();
  }

  async ionViewWillLeave() {
    await this.apiService.disconnect();
  }


  toggleInARoom = () => this.socketsService.inARoom = !this.socketsService.inARoom;


  setEventRoomID = () => {

  };



}
