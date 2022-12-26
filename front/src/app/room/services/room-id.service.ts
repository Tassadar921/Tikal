import { Injectable } from '@angular/core';
import {SocketsService} from '../../shared/services/sockets.service';

@Injectable({
  providedIn: 'root'
})
export class RoomIDService {

  public inputRoomID = '';
  constructor(
    private socketsService: SocketsService,
  ) {}

  setEventRoomID = () => {

  }
}
