import {Component, OnInit} from '@angular/core';
import {ServerService} from '../services/server.service';

declare let WatsonSpeech;

@Component({
  selector: 'my-dashboard',
  templateUrl: './my-dashboard.component.html',
  styleUrls: ['./my-dashboard.component.css']
})
export class MyDashboardComponent implements OnInit {
  cards = [
    {title: 'Card 1', cols: 2, rows: 1},
    {title: 'Card 2', cols: 1, rows: 1},
    {title: 'Card 3', cols: 1, rows: 2},
    {title: 'Card 4', cols: 1, rows: 1}
  ];

  videoUrl: string = 'https://www.youtube.com/watch?v=m-_W1FaavsU';
  yasUrl = 'http://localhost:3000/yas/';

  iteration = 0;
  chunksize = 3;
  actualIndex: number;
  results = [];

  consolidated_results = [];

  lastSubject: string;
  nlp_result: any;

  subtitle: string;

  played = false;

  stream: any;

  backend = 'google';
  backends = [
    {value: 'watson', format: 'mp3', text: 'IBM Watson'},
    {value: 'google', format: 'flac', text: 'Google Cloud Platform'}
  ];

  constructor(private server: ServerService) {

  }

  ngOnInit() {

  }

  translateUrl(url) {
    if (url) {
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[7].length === 11) ? match[7] : false;
    }
    return false;
  }

  getAudioServerUrl(url) {
    return this.yasUrl + (this.backend === 'google' ? 'flac/' : '') + this.translateUrl(url);
  }

  startStream(url) {
    console.log('start Stream', this.backend, url);
    switch (this.backend) {
      case 'watson':
        return this.startStreamWatson(url);
      case 'google':
        return this.startStreamGoogle(url.replace(this.yasUrl + 'flac/', ''));
      default:
        return this.startStreamWatson(url);
    }
  }

  stopStream() {
    switch (this.backend) {
      case 'watson':
        return this.stopStreamWatson();
      case 'google':
        return this.stopStreamGoogle();
      default:
        return this.stopStreamWatson();
    }
  }

  startStreamGoogle(url) {
    const socket = this.server.connectGoogleSpeechStream(url);


    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.results[0]) {
          const text = data.results[0].alternatives[0].transcript;

          this.subtitle = text.substr(text.length - 300);
          if (data.results[0] && data.results[0].alternatives[0].confidence > 0) {
            this.lastSubject = text;
            this.server.getGoogleNLPImagesFromText(this.lastSubject).subscribe((nlp) => {
              this.nlp_result = nlp;
            });
          }
        }
      } catch (e) {
        console.error('error on message', e);
      }

    };
  }

  stopStreamGoogle() {

  }

  startStreamWatson(url) {
    this.played = true;
    this.server.getToken().subscribe((res) => {
      this.stream = WatsonSpeech.SpeechToText.recognizeFile({
        token: res.token,
        file: url,
        // only certain models support speaker labels currently,
        // see http://www.ibm.com/watson/developercloud/doc/speech-to-text/output.shtml#speaker_labels
        model: 'pt-BR_NarrowbandModel',
        objectMode: true,
        // resultsBySpeaker: true, // pipes results through a SpeakerStream, and also enables speaker_labels and objectMode
        realtime: true, // don't slow down the results if transcription occurs faster than playback
        play: true
      });

      this.stream.on('data', (data) => {

        if (data && data.results && data.results[0].final) {
          this.subtitle = data.results[0].alternatives[0].transcript;
        }

        this.results.push(data);
        if (data.result_index > this.actualIndex) {
          // pega os resultados com o indice
          const filteredResults = this.results.filter((p) => {
            if (p.result_index === this.actualIndex) {
              return true;
            }
          });
          // guarda último
          this.consolidated_results.push(filteredResults[filteredResults.length - 1]);
          this.iteration++;
        }
        this.actualIndex = data.result_index;

        if (this.iteration > this.chunksize) {
          this.iteration = 0;
          this.lastSubject = this.consolidated_results.map(r => r.results[0].alternatives[0].transcript).join(' ');
          this.consolidated_results = [];

          this.server.getGoogleNLPImagesFromText(this.lastSubject).subscribe((nlp) => {
            this.nlp_result = nlp;
          });
        }

      });
    });
  }

  stopStreamWatson() {
    this.stream.stop();
    this.stream.recognizeStream.socket.close();
    this.stream.recognizeStream.finish();

    console.log(this.stream);
  }

}
