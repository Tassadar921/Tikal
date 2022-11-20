import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private retour;

  constructor(
    private http: HttpClient
  ) {}

  getTilesList = async () => {
    await this.http.get<string>(environment.urlBack + 'getTilesList').toPromise().then(response => {
      this.retour = response;
    });
    return this.retour;
  };
}
