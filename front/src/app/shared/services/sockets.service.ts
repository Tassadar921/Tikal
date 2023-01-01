import {Injectable} from '@angular/core';
import {Socket} from 'ngx-socket-io';
import {CookiesService} from './cookies.service';
import {ToastService} from './toast.service';
import {AlertController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class SocketsService {

  public roomID;
  public playersInRoom = [];
  public inARoom = false;
  public ready = false;

  constructor(
    private socket: Socket,
    private cookiesService: CookiesService,
    private toastService: ToastService,
    private alertController: AlertController
  ) {
  }

  initSocket = () => {
    this.socket.connect();
    this.socket.on('usernameLost', () => {
      this.sendUsername();
    });
  };

  removeAllListeners = () => {
    this.socket.removeAllListeners();
  }

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
    this.socket.on('roomFull', async () => {
      await this.toastService.displayToast('Room is full', 3000, 'bottom');
    });
    this.socket.emit('joinRoom', {roomID, username: this.cookiesService.username});
  };

  createRoom = () => {
    this.socket.on('roomCreated', async roomID => {
      this.roomID = roomID;
    });
    this.socket.emit('createRoom', {username: this.cookiesService.username});
    this.inARoom = true;
    this.enterRoom();
  };

  enterRoom = () => {
    this.playersInRoom.push({username: this.cookiesService.username, ready: false});
    this.socket.on('playerJoined', username => this.playersInRoom.push({username, ready: false}));
    this.socket.on('playerReady', data => {
      this.playersInRoom.forEach(player => {
        if (player.username === data.username) {
          player.ready = data.ready;
        }
      });
    });
    this.socket.on('playerLeft', data => {
      this.playersInRoom = this.playersInRoom.filter(player => player.username !== data.username);
    });
    this.socket.on('playerKicked', async username => {
      if (username === this.cookiesService.username) {
        await this.leaveRoom();
        await this.toastService.displayToast('You have been kicked from the room', 3000, 'bottom');
      } else {
        this.playersInRoom = this.playersInRoom.filter(player => player.username !== username);
      }
    });
    this.socket.on('roomClosed', async () => {
      await this.leaveRoom();
      await this.toastService.displayToast('Room closed', 3000, 'bottom');
    });
    this.socket.on('everyoneReady', async (count) => {
      if(count!==5){
        await this.alertController.dismiss();
      }
      const alert = await this.alertController.create({
        header: 'Launching game in ' + count + ' seconds',
        backdropDismiss: false,
        buttons: [
          {
            text: 'Cancel',
            handler: () => {
              this.socket.emit('cancelEveryoneReady');
            },
          }
        ]
      });
      await alert.present();
    });
    this.socket.on('everyoneReadyCancelTriggered', async (playersInRoom) => {
      this.playersInRoom = playersInRoom;
      await this.alertController.dismiss();
    });
  };

  leaveRoom = async () => {
    this.socket.emit('leaveRoom');
    await this.alertController.dismiss();
    this.roomID = '';
    this.playersInRoom = [];
    this.inARoom = false;
    this.ready = false;
  };

  toggleReady = () => {
    this.ready = !this.ready;
    this.socket.emit('toggleReady', this.ready);
  };

  kick = (username) => this.socket.emit('kick', username);

}
