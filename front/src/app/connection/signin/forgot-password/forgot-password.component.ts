import { Component, OnInit } from '@angular/core';
import {ModalController} from '@ionic/angular';
import {TranslationService} from '../../../shared/services/translation.service';
import {ApiService} from '../../../shared/services/api.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {

  public email = '';
  public output = '';

  public waiting = false;

  private retour;

  constructor(
    public modalController: ModalController,
    public translationService: TranslationService,
    private apiService: ApiService
  ) {
  }

  ngOnInit() {}

  submit = async () => {
    this.waiting = true;
    this.output = '';
    this.retour = await this.apiService.mailResetPassword(this.email);
    this.output = this.retour.message;
    this.waiting = false;
  };

}
