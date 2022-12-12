import { Component, OnInit } from '@angular/core';
import {TranslationService} from '../../shared/services/translation.service';
import {ApiService} from '../../shared/services/api.service';
import {CheckingService} from '../checking.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {

  public username = '';
  public outputUsername = '';

  public email = '';
  public outputEmail = '';

  public output = '';
  public waiting = false;

  private retour;

  constructor(
    public translationService: TranslationService,
    public apiService: ApiService,
    public checkingService: CheckingService
  ) {}

  ngOnInit() {}

  signUp = async () => {
    this.waiting = true;
    this.output = '';
    this.retour = await this.apiService.userExists(this.username, this.email);
    if (this.retour.status === 0) {
      this.output = this.retour.message;
    } else {
      this.retour = await this.apiService.mailCreateAccount(this.username, this.checkingService.password, this.email);
      this.output = this.retour.message;
    }
    this.waiting = false;
  };

  checkUsername = () => this.outputUsername = this.checkingService.updateUsername(this.username);

  checkEmail = () => this.outputEmail = this.checkingService.updateEmail(this.email);
}
