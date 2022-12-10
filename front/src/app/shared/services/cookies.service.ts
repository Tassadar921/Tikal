import { Injectable } from '@angular/core';
import {Preferences}  from '@capacitor/preferences';
import {Router} from '@angular/router';
import {PopoverController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class CookiesService {

  //if needed, not to request each time to the cookies
  public username = '';

  private retour;

  constructor(
    private router: Router,
    private popoverController: PopoverController
  ){}

  //returns cookie data from cookie name param
  getFromCookies = async (cookie) => {
    this.retour = await Preferences.get({key: cookie});
    return this.retour.value;
  };

  //replace cookie data named cookie (param)
  setCookie = async (cookie, replace) => {
    await Preferences.set({key: cookie, value: replace});
  };

  //disconnects user by deleting username cookie
  disconnect = async () => {
    this.username = '';
    await Preferences.remove({ key: 'username' });
    await this.router.navigateByUrl('/connection');
    await this.popoverController.dismiss();
  };

}
