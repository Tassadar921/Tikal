import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RoomPageRoutingModule } from './room-routing.module';

import { RoomPage } from './room.page';
import {WaitingComponent} from './waiting/waiting.component';
import {LanguageModule} from '../shared/components/language/language.module';
import {InputRoomIDComponent} from './input-room-id/input-room-id.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RoomPageRoutingModule,
        LanguageModule,
    ],
    declarations: [RoomPage, WaitingComponent, InputRoomIDComponent]
})
export class RoomPageModule {}
