import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/internal/Observable';

@Injectable()
export class ServerService {

  serverUrl = 'http://localhost:3000/';
  googleSpeechSocketUrl = 'ws://localhost:3001';
  googleSpeechSocket;

  constructor(private httpClient: HttpClient) {
  }

  public getToken(): Observable<any> {
    return this.httpClient.get(this.serverUrl + 'watson/api/speech-to-text/token');
  }

  public getGoogleNLPImagesFromText(text): Observable<any> {
    return this.httpClient.post(this.serverUrl + 'google/NLPImageFromText', {text});
  }

  public connectGoogleSpeechStream(audioUrl) {
    if (this.googleSpeechSocket) {
      if (this.googleSpeechSocket.readyState !== WebSocket.CLOSED) {
        console.log('already connected');
        return this.googleSpeechSocket;
      }
      console.log('reconnect');

    }
    this.googleSpeechSocket = new WebSocket(this.googleSpeechSocketUrl);
    console.log(this.googleSpeechSocket);
    this.googleSpeechSocket.onopen = (event) => {
      console.log('connected');
      console.log('sending audioUrl...', audioUrl);
      this.googleSpeechSocket.send(JSON.stringify({url: audioUrl}));
    };

    return this.googleSpeechSocket;
  }


}
