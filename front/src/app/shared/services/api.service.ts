import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {lastValueFrom} from 'rxjs';
import {CookiesService} from './cookies.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
    private cookiesService: CookiesService
  ) {}

  //asks for the json index of languages
  getLanguagesList = async () => await lastValueFrom(
    this.http.get(environment.urlBack + 'getLanguagesList'));

  //asks for the json of the language id selectedLanguage
  getTranslation = async (language) => await lastValueFrom(
    this.http.post(environment.urlBack + 'getTranslation',
      {language}
    ));

  //asks if an account containing username or email is in db, priority to username
  userExists = async (username, email) => await lastValueFrom(
    this.http.post(environment.urlBack + 'userExists',
      {username, email, language: await this.cookiesService.getFromCookies('language')}
    ));

  //sends the creating account email, containing a unique token, effective for 5 minutes,
  // temporary saving datas in the signUp queue
  mailCreateAccount = async (username, password, email) => await lastValueFrom(
    this.http.post(environment.urlBack + 'mailCreateAccount',
      {username, password, email, language: await this.cookiesService.getFromCookies('language')}
    ));

  //asks if token is in the signUp queue
  checkSignUpToken = async (token) => await lastValueFrom(
    this.http.post(environment.urlBack + 'checkSignUpToken',
      {token, language: await this.cookiesService.getFromCookies('language')}
    ));

  //creates the account with datas in the queue linked to token
  createAccount = async (token) => await lastValueFrom(
    this.http.post(environment.urlBack + 'createAccount',
      {token, language: await this.cookiesService.getFromCookies('language')}
  ));

  //signIn, identifier can be either username or email
  signIn = async (identifier, password) => await lastValueFrom(
    this.http.post(environment.urlBack + 'signIn',
      {identifier, password, language: await this.cookiesService.getFromCookies('language')}
    ));

  //sends an email containing a unique token to reset the password, effective for 5 minutes
  //temporary linking the token and email in the resetPassword queue
  mailResetPassword = async (email) => await lastValueFrom(
    this.http.post(environment.urlBack + 'mailResetPassword',
      {email, language: await this.cookiesService.getFromCookies('language')}
    ));

  //asks if token is in the resetPassword queue
  checkResetPasswordToken = async (token) => await lastValueFrom(
    this.http.post(environment.urlBack + 'checkResetPasswordToken',
      {token, language: await this.cookiesService.getFromCookies('language')}
    ));

  //resets the password of the account linked to the email, himself linked to the token
  resetPassword = async (token, password) => await lastValueFrom(
      this.http.post<string>(environment.urlBack + 'resetPassword',
      {token, password, language: await this.cookiesService.getFromCookies('language')}
    ));

  getTilesList = async () => await lastValueFrom(
    this.http.get(environment.urlBack + 'getTilesList'));
}
