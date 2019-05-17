import { Component, OnInit } from '@angular/core';
import { PlacesService } from 'src/app/places.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Place } from 'src/app/place';
import { Station } from 'src/app/station';

var timer;
@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit {

  columsToDisplay = ['id', 'stationName', 'availableBikes', 'availableDocks', 'is_renting', 'status', 'totalDocks', 'lastCheck']

  constructor(private placesService: PlacesService, private router: Router, private http: HttpClient) { }
  docksArray = [];
  finalArray= [];
  places = [];
  color = ['rgb(102,255,102)', 'rgb(255,102,102)']
  final_color;

  ngOnInit() {
    this.updateAlerts();
  }

  updateAlerts() {
    this.fetchPlaces();
    var _this = this;
    timer = setTimeout(function() {
        _this.updateAlerts()
      }, 126000);
  }

  fetchPlaces() {
    this.placesService
    .getPlaces()
      .subscribe((data: Place[]) => {
        console.log(data);
        this.places = data;
        // console.log(this.places);
        this.fetchLogs();
      });
      
  }
  onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}
private index=[]
private count=0
  fetchLogs() {
  console.log("new update\n");
    this.count = 0;
    for(var i = 0; i<this.places.length;i++) {
      // console.log("From fetchLogs\n");
      // console.log(this.places[i].name);
      this.placesService
      .findStations(this.places[i].name)
        .subscribe((data :Station []) => {
          // console.log(data);
          for(var i = 0; i<data.length;i++) {
            if(this.index.indexOf(data[i].id) == -1){
              if((+data[i].availabledocks/+data[i].totaldocks) * 100 > 90) {
                data[i].color = this.color[1];
              } else {
                data[i].color = this.color[0];
              }
              this.docksArray.push(data[i]);
              this.index.push(data[i].id)  
            }
            this.count++;
            
          }
          this.finalArray = this.docksArray;
          console.log(this.finalArray);
        });
    }
   
  }

}
