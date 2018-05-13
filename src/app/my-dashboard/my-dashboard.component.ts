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

  videoUrl: string;
  yasUrl = 'http://localhost:3000/yas/';

  iteration = 0;
  chunksize = 3;
  actualIndex: number;
  results = [];

  consolidated_results = [];

  lastSubject: string;

  subtitle: string;

  played = false;

  stream: any;

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
    return this.yasUrl + this.translateUrl(url);
  }

  startStream(url) {
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

          //TODO: CHAMA NLP
        }

      });
    });
  }

  stopStream() {
    this.stream.stop();
    this.stream.recognizeStream.socket.close();
    this.stream.recognizeStream.finish();

    console.log(this.stream);
  }

}
