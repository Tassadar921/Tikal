import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RoomPageRoutingModule } from './room-routing.module';

import { RoomPage } from './room.page';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
const config: SocketIoConfig = { url: 'http://localhost:8080', options: {} };

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RoomPageRoutingModule,
    SocketIoModule.forRoot(config)
  ],
  declarations: [RoomPage]
})
export class RoomPageModule {}
