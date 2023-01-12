import {Component, OnInit} from '@angular/core';
import {ConnectionService} from './shared/services/connection.service';
import {ApiService} from './shared/services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit{
  constructor(
    private connectionService: ConnectionService,
    private apiService: ApiService
  ) {}

  async ngOnInit() {
    await this.connectionService.connect();
    if(!Object(await this.apiService.checkConnection()).status){
      await this.connectionService.disconnect();
    }
  }

}
