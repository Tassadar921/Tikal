import { Component, OnInit } from '@angular/core';
import {SocketsService} from '../shared/services/sockets.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage implements OnInit {

  public inARoom = false;

  constructor(
    private socketsService: SocketsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.socketsService.initSocket();
    this.socketsService.setRoomSockets();
  }

  toggleInARoom() {
    this.inARoom = !this.inARoom;
  }

}
