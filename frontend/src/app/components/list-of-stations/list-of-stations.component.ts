////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


/// This file and the source code provided can be used only for   
/// the projects and assignments of this course

/// Last Edit by Dr. Atef Bader: 1/30/2019


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////




import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material';

import { Station } from '../../station';
import { PlacesService } from '../../places.service';


import { Input, ViewChild, NgZone} from '@angular/core';
import { MapsAPILoader, AgmMap } from '@agm/core';
import { GoogleMapsAPIWrapper } from '@agm/core/services';
import { Place } from 'src/app/place';
import { PushNotificationsService } from 'src/app/push.notification.service';





interface Location {
  lat: number;
  lng: number;
  zoom: number;
  address_level_1?:string;
  address_level_2?: string;
  address_country?: string;
  address_zip?: string;
  address_state?: string;
  label: string;
}



@Component({
  selector: 'app-list-of-stations',
  templateUrl: './list-of-stations.component.html',
  styleUrls: ['./list-of-stations.component.css']
})
export class ListOfStationsComponent implements OnInit {


  stations: Station[];
  markers: Station[];
  placeSelected: Place;
  example: Number



  displayedColumns = ['id', 'stationName', 'availableBikes', 'availableDocks', 'is_renting', 'lastCommunicationTime', 'latitude',  'longitude', 'status', 'totalDocks', 'dashboard'];


  icon = {
    url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
    scaledSize: {
      width: 60,
      height: 60
    }
  }



  constructor(private placesService: PlacesService, private router: Router, private _notificationService: PushNotificationsService) {
    this._notificationService.requestPermission();
   }

  ngOnInit() {
    this.fetchStations();
    this.getPlaceSelected();
    

  }

  fetchStations() {
    this.placesService
      .getStations()
      .subscribe((data: Station[]) => {
        this.stations = data;
        this.markers = data;
        console.log(this.stations);
        console.log(data)
        data.map(d => {
          if(d.availabledocks >= 0.9*+d.totaldocks) {
            this.notify(d.id, d.totaldocks);
          }
          
        })

      });
      
  }
  placeSelectedData = 0;
  getPlaceSelected() {
    this.placesService
      .getPlaceSelected()
      .subscribe((data: Place) => {
        this.placeSelected = data;
        this.placeSelectedData = 1;

      });
  }


  sendID(stationID) {

    this.placesService.find_divvyLogs(stationID, 1).subscribe(() => {
      this.router.navigate(['list_of_stations/real-time-line-chart']);
    });
  }

  sendIDSMA(stationID) {

    this.placesService.find_divvyLogs(stationID,1).subscribe(() => {
      this.router.navigate(['list_of_stations/dashboard']);
    });
  }



clickedMarker(label: string, index: number) {
  console.log(`clicked the marker: ${label || index}`)
}


circleRadius:number = 3000; // km

public location:Location = {
  lat: 41.882607,
  lng: -87.643548,
  label: 'You are Here',
  zoom: 13
};

notify(id, totalDocks) {
        let data: Array < any >= [];
        data.push({
            'title': 'Divvy Station ' + id + ' ALERT',
            'alertContent': 'Divvy Station ' + id + " is 90% full"
        });
        this._notificationService.generateNotification(data);
    }
}



