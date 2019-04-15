////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


/// This file and the source code provided can be used only for   
/// the projects and assignments of this course

/// Last Edit by Dr. Atef Bader: 1/30/2019


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////



import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { HttpHeaders } from '@angular/common/http';



import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';


import { Place } from './place';
import { SERVER_TRANSITION_PROVIDERS } from '@angular/platform-browser/src/browser/server-transition';





const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};


@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  uri = 'http://localhost:4000';

  constructor(private http: HttpClient) { 
 

  }



  getPlaces() : Observable<Place[]> {
    return this.http.get<Place[]>(`${this.uri}/places`);
  }
 

  getPlaceSelected() {
    return this.http.get(`${this.uri}/place_selected`);
  }


  getStations() {
    return this.http.get(`${this.uri}/stations`);
  }

  getStationLog() {
    return this.http.get(`${this.uri}/findLog10`);
  }

  getStationLogElastic() {
    return this.http.get(`${this.uri}/findLogElastic`);
  }



  findPlaces(find, where) {
    const find_places_at = {
      find: find,
      where: where
    };

    return this.http.post(`${this.uri}/places/find`, find_places_at, httpOptions);

  }

 


  findStations(placeName) {
    const find_stations_at = {
      placeName: placeName
    };

    var str = JSON.stringify(find_stations_at, null, 2);


    return this.http.post(`${this.uri}/stations/find`, find_stations_at, httpOptions);

  }

  findLogs(stationID,hours) {
    const find_logs_at = {
      stationID:stationID,
      hours: hours
    };

    var str = JSON.stringify(find_logs_at, null, 2);

    return this.http.post(`${this.uri}/stations/findLog`, find_logs_at, httpOptions);
  }

  find_divvyLogs(stationID, hours) {
    const find_logs_at_elastic = {
      stationID: stationID,
      hours : hours
    };
    var str = JSON.stringify(find_logs_at_elastic, null, 2);
    return this.http.post(`${this.uri}/stations/findDivvyLog`, find_logs_at_elastic, httpOptions);
  }


 


  
}
