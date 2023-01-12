import {Component, OnInit} from '@angular/core';
import {ConnectionService} from './shared/services/connection.service';
import {ApiService} from './shared/services/api.service';
import {CookiesService} from './shared/services/cookies.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit{
  constructor(
    private connectionService: ConnectionService,
    private apiService: ApiService,
    private cookiesService: CookiesService,
  ) {}

  async ngOnInit() {
    await this.connectionService.connect();
    console.log(await this.apiService.checkConnection());
    console.log(JSON.parse(await this.cookiesService.getFromCookies('token')));
  }

}
