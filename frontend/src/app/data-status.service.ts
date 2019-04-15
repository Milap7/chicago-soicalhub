import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {StationLog} from "./log"
import { Subject, from } from  'rxjs';
import * as socketio from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})

export class DataStatusService {
  uri = 'http://localhost:4000';
  constructor( public httpClient: HttpClient) { }

  getInitialDataStatus() {
    return this.httpClient.get<StationLog[]>(`${this.uri}/stations./findLog`)
  }

  getUpdates() {
    let socket = socketio(this.uri);
    let dataSub = new Subject<StationLog>();
    let dataSubObservable = from(dataSub);

    socket.on('market', (dataStatus: StationLog) => {
      dataSub.next(dataStatus);
    });

    return dataSubObservable;
  }

}
