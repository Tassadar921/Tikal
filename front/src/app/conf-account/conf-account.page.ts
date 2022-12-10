import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Router} from '@angular/router';
import {CookiesService} from '../shared/services/cookies.service';
import {ApiService} from '../shared/services/api.service';
import {ToastService} from '../shared/services/toast.service';

@Component({
  selector: 'app-conf-account',
  templateUrl: './conf-account.page.html',
  styleUrls: ['./conf-account.page.scss'],
})
export class ConfAccountPage implements OnInit {

  public output = '';
  public waiting = 1;

  private retour;

  constructor(
    private getVarInURL: ActivatedRoute,
    private router: Router,
    private cookiesService: CookiesService,
    private apiService: ApiService,
    private toastService: ToastService
  ) { }

  async ngOnInit() {
    this.getVarInURL.queryParams.subscribe(async params => { //get token param from URL
      this.retour = await this.apiService.checkSignUpToken(params.token);
      if(this.retour.status){
        this.retour = await this.apiService.createAccount(params.token);
        this.output = this.retour.message;
        await this.cookiesService.setCookie('username', this.retour.username);
        await this.toastService.displayToast('Connected to new account', 5000, 'bottom');
        this.waiting = 0;
        await this.router.navigateByUrl('/room');
      }else{
        this.output = this.retour.message;
        this.waiting = 0;
      }
    });
  }
}
