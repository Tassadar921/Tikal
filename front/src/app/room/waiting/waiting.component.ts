import { Component, OnInit } from '@angular/core';
import {SocketsService} from '../../shared/services/sockets.service';
import { Clipboard } from '@capacitor/clipboard';
import {ToastService} from '../../shared/services/toast.service';
import {CookiesService} from '../../shared/services/cookies.service';

@Component({
  selector: 'app-waiting',
  templateUrl: './waiting.component.html',
  styleUrls: ['./waiting.component.scss'],
})
export class WaitingComponent implements OnInit {

  constructor(
    public socketsService: SocketsService,
    private toastService: ToastService,
    public cookiesService: CookiesService
  ) { }

  async ngOnInit() {
    this.socketsService.roomCreated();
  }

  copyID = async () => {
    await Clipboard.write({string: this.socketsService.roomID});
    await this.toastService.displayToast('Copied to clipboard', 3000, 'bottom');
  };

}
