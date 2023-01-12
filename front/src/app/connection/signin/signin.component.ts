import { Component, OnInit } from '@angular/core';
import {TranslationService} from '../../shared/services/translation.service';
import {ApiService} from '../../shared/services/api.service';
import {CookiesService} from '../../shared/services/cookies.service';
import {Router} from '@angular/router';
import {ToastService} from '../../shared/services/toast.service';
import {CheckingService} from '../checking.service';
import {ConnectionService} from '../../shared/services/connection.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['../signup/signup.component.scss'],
})
export class SigninComponent implements OnInit {

  public username = '';
  public password = '';

  public output = '';

  public waiting = false;

  private retour;

  constructor(
    public translationService: TranslationService,
    private apiService: ApiService,
    private cookiesService: CookiesService,
    private router: Router,
    private toastService: ToastService,
    private connectionService: ConnectionService,
    public checkingService: CheckingService,
  ) {}

  ngOnInit() {}

  signIn = async () => {
    this.waiting = true;
    this.retour = await this.apiService.signIn(this.username, this.password);
    if(this.retour.status){
      await this.connectionService.connect(this.retour.username);
      await this.toastService.displayToast('Connected as ' + this.retour.username, '5000', 'bottom');
      await this.router.navigateByUrl('/room');
    }
    this.waiting = false;
    this.output = this.retour.message;
  };
}
