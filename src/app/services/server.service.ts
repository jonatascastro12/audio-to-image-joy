import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/internal/Observable';

@Injectable()
export class ServerService {

  serverUrl = 'http://localhost:3000/watson/';

  constructor(private httpClient: HttpClient) {
  }

  public getToken(): Observable<any>{
    return this.httpClient.get(this.serverUrl + 'api/speech-to-text/token');
  }

}
