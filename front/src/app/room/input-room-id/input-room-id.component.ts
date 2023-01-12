import {Component, OnInit} from '@angular/core';
import {SocketsService} from '../../shared/services/sockets.service';
import {ApiService} from '../../shared/services/api.service';

@Component({
  selector: 'app-input-room-id',
  templateUrl: './input-room-id.component.html',
  styleUrls: ['./input-room-id.component.scss'],
})
export class InputRoomIDComponent implements OnInit{

  public inputRoomID = '';

  constructor(
    public socketsService: SocketsService,
    private apiService: ApiService
  ) { }

  ngOnInit() {
    document.getElementById('roomID').addEventListener('keyup', (e) => {
      if(e.key==='Enter' && !this.socketsService.inARoom){
        this.socketsService.removeAllListeners();
        this.socketsService.joinRoom(this.inputRoomID);
      }
    });
  }

  createRoom = () => {
    this.socketsService.removeAllListeners();
    this.socketsService.createRoom();
  };
}
