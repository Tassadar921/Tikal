import { Component, OnInit } from '@angular/core';
import {TranslationService} from '../shared/services/translation.service';
import {CookiesService} from '../shared/services/cookies.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-connection',
  templateUrl: './connection.page.html',
  styleUrls: ['./connection.page.scss'],
})
export class ConnectionPage implements OnInit {

  haveAnAccount = false;

  constructor(
    public translationService: TranslationService,
    private cookiesService: CookiesService,
    private router: Router
  ) {}

  async ngOnInit() {
    if(await this.cookiesService.getFromCookies('username')){
      await this.router.navigateByUrl('/room');
    }
  }

  switchHaveAnAccount = (value) => this.haveAnAccount = value;

}
