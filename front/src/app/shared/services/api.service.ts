import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private retour: Array<Object> | undefined;

  constructor(
    private http: HttpClient
  ) {}

  getTilesList = async () => {
    await this.http.get<Array<Object>>(environment.urlBack + 'getTilesList').toPromise().then(response => {
      this.retour = response;
    });
    return this.retour;
  };
}
