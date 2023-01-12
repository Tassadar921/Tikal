import { Injectable } from '@angular/core';
import {ApiService} from './api.service';
import {CookiesService} from './cookies.service';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

  private retour;
  constructor(
    private apiService: ApiService,
    private cookiesService: CookiesService,
    private router: Router,
  ) {}

  //triggered on (login, register) => username, and each app.component init => !username
  connect = async (username = '') => {
    if(username){
      await this.cookiesService.setCookie('username', username);
    }else{
      if(!await this.cookiesService.getFromCookies('username')){
        await this.router.navigateByUrl('/connection');
      }
    }
    if(!await this.isTokenStillOK()) {
      this.retour = await this.apiService.getConnectionToken();
      console.log(this.retour);
      if(this.retour.status) {
        let date = new Date().toLocaleDateString('fr');
        await this.setToken(date);
      }else{//cheated username and/or token, or connection page
        console.log('disconnect');
        await this.disconnect();
      }
      //for security
      this.retour = undefined;
    }
  };

  //token is reset every day, so we need to check if it's still valid
  private isTokenStillOK = async () => {
      let date = new Date().toLocaleDateString('fr');
      let todayDate = {day: date.split('/')[0], month: date.split('/')[1], year: date.split('/')[2]};
    if(await this.cookiesService.getFromCookies('token')) {
      let tokenDate = JSON.parse(await this.cookiesService.getFromCookies('token'));
        return !((Number(tokenDate.year) - Number(todayDate.year)) || (Number(tokenDate.month) - Number(todayDate.month)) || (Number(tokenDate.day) - Number(todayDate.day)));
      }else{
        return false;
      }
  };

  //if token is not valid or not created yet, we need to get a new one
  private setToken = async (date) => {
    console.log(this.retour.token);
    await this.cookiesService.setCookie('token',
      JSON.stringify({
        token: this.retour.token,
        date: {day: date.split('/')[0], month: date.split('/')[1], year: date.split('/')[2]}
      }));
  };

  disconnect = async () => {
    this.cookiesService.username = '';
    await this.cookiesService.setCookie('username', '');
    await this.cookiesService.setCookie('token', '');
    await this.router.navigateByUrl('/connection');
  }
}
