import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {CookiesService} from './cookies.service';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  public dictionary;

  public languages = [];

  constructor(
    private apiService: ApiService,
    private cookiesService: CookiesService
  ) {}

  //changes language cookie for language param (id), and changes dictionary for the new language
  updateLanguage = async (language) => {
    await this.cookiesService.setCookie('language', language);
    this.languages = Object(await this.apiService.getLanguagesList()).list;
    this.initDictionary(Object(await this.apiService.getTranslation(
      await this.cookiesService.getFromCookies('language')
    )));
  };

  //replacing dictionary by languageDictionary param
  initDictionary = (languageDictionary) => this.dictionary = Object(languageDictionary);

  //initialisation of dictionary from the cookies
  triggerOnLoad = async () => {
    if(!await this.cookiesService.getFromCookies('language')){
      await this.cookiesService.setCookie('language','uk');
    }
    await this.updateLanguage(await this.cookiesService.getFromCookies('language'));
  };
}
