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


import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';


import { Place } from '../../place';
import { PlacesService } from '../../places.service';
import { domRendererFactory3 } from '@angular/core/src/render3/interfaces/renderer';
import { ChartData } from 'src/app/chart-data';
// import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as d3 from 'd3';




const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};



@Component({
  selector: 'app-list-of-places',
  templateUrl: './list-of-places.component.html',
  styleUrls: ['./list-of-places.component.css']
})


export class ListOfPlacesComponent implements OnInit {

  
  type = 0
  uri = 'http://localhost:4000';
  private margin = {top: 0, right: 20, bottom: 30, left: 50};
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private g:any;

  places: Place[];
  markers: Place[];
  latitude = 41.878;
  longitude = -87.629;
  private line: d3Shape.Line<[any, any]>;
  displayedColumns = ['name', 'display_phone', 'address1', 'is_closed', 'rating','review_count', 'Divvy'];

  constructor(private placesService: PlacesService, private router: Router, private http: HttpClient) {
    this.width = 800 - this.margin.left - this.margin.right;
    this.height = 350 - this.margin.top - this.margin.bottom;
   }

  
  ngOnInit() {

    this.fetchPlaces();
    this.findMe();
    // this.drawLineChart();
  

  }

  changeInterval(type) {
    if(type == 1) {
      d3.select('g').remove();
      this.drawBarChart()
    }
    if(type == 2) {
      // console.log("Line Chart")
      d3.select('g').remove();
      this.drawLineChart()
    }
    if(type==3) {
      d3.select('g').remove();
    }
  }
private userLat = null
private userData = 0;
  findMe() {
    
    if(navigator.geolocation) {
      let locationArray = {
        "latittude" : Number,
        "longitude" : Number
      }
      navigator.geolocation.getCurrentPosition((locationArray) => {
        console.log("user position: \n");
        console.log(locationArray.coords);
        this.userLat=locationArray
        this.userData = 1;
      });
      return this.userLat;
    }
  }

  fetchPlaces() {
    this.placesService
      .getPlaces()
      .subscribe((data: Place[]) => {
        console.log(data);
        this.places = data;
        this.markers = data;
        console.log(this.places);
      });
  }

  drawBarChart() {
    var svgWidth = 1000, svgHeight = 400, barPadding = 0.1;
    var margin = { top: 30, right: 30, bottom: 50, left: 30 };
    var contentWidth = svgWidth - margin.left - margin.right;
    var contentHeight = svgHeight - margin.top - margin.bottom;
    
    var fill_bars = ["rgb(0,102,204)"]

    var textColor = 'white';

    
    d3.select("svg> *").remove()
    this.svg = d3.select('svg');
    this.width = +this.svg.attr('width') - this.margin.left - this.margin.right;
    this.height = +this.svg.attr('height') - this.margin.top - this.margin.bottom;
    this.g = this.svg.append('g')
        .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  
  
    var xScale = d3.scaleBand()
    .domain(this.places.map(d => d.address1.toString()))
    .rangeRound([0, contentWidth])
    .padding(barPadding);
    
    var yScale = d3.scaleLinear()
    .domain([0, d3.max(this.places.map(d => +d.review_count))])
    .rangeRound([contentHeight, 0]);

    // this.g.append('g')
    //     .attr('class', 'x axis')
    //     .attr('transform', 'translate(0,' + this.height + ')')
    //     .text('Places')
    //     .call(d3Axis.axisBottom(this.x))
    //     .selectAll("text")  
    //     .style("text-anchor", "end")
    //     .attr("dx", "-.8em")
    //     .attr("dy", ".15em")
    //     .attr("transform", "rotate(-25)");
    // this.g.append('g')
    //     .attr('class', 'y axis')
    //     .call(d3Axis.axisLeft(this.y))
    //     .selectAll("text")  
    //     .style("text-anchor", "end")
    //     .attr("dx", "-.8em")
    //     .attr("dy", ".15em")
    //     .attr("transform", "rotate(0)");
    
    
    this.g.append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', 'translate(0,' + contentHeight + ')')
    //.attr('transform', 'rotate(-0)')
    .call(d3.axisBottom(xScale));
    
    this.g.append('g')
    .attr('class', 'axis axis--y')
    .call(d3.axisLeft(yScale))
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '0.71em')
    .attr('text-anchor', 'end')
    .text('Rating');

    /*
    Bar for ratings
     */
    this.g.selectAll('.bar')
    .data(this.places)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(d.address1.toString()))
    .attr('y', d => yScale(+d.review_count ))
    .attr('width', xScale.bandwidth())
    .attr('height', d => contentHeight - yScale(+d.review_count))
    .attr('fill', fill_bars[0])

    this.svg.selectAll(".text")
      .data(this.places)
      .enter()
      .append("text")
      .attr('class', 'text')
      .attr("transform",
        "translate(" + (this.width/2) + " ," +
        (this.height + this.margin.top ) + ")")
      .style("text-anchor", "middle")
      .text("Addresses of Restaurants")
    
  this.g.selectAll(".text")
    .data(this.places)
    .enter()
    .append("text")
    .attr('class', 'text')
    .text(d =>  " " + d.name.toString())
    .attr('x', d => xScale(d.address1.toString()) + 5)
    .attr('y', d => yScale(+d.review_count) + 17)
    .attr("fill", textColor)
    .attr("font-size", "6px");

    var legend = this.svg.append('g')
      .attr("class", "legend")
      .attr("x", 20)
      .attr("y",3)
      .attr("width", 18)
      .attr("height",10)

      legend.append("rect")
      .attr("class", "legend1")
      .attr("x", 600)
      .attr("y", 20)
      .attr("width", 18)
      .attr("height", 10)
      .style("fill", 'rgb(0,102,204)')
      .attr("font-size", "10px");

    legend.append("text")
      .attr("class", "legendTxt")
      .style("font-size", "13px")
      .attr("x", 60)
      .attr("y", 20)
      .attr("dy", "10px")
      .style("text-anchor", "start")
      .text("Review Count")
      .attr("font-size", "10px");

      legend.append("text")
      .attr("class", "legendTxt")
      .style("font-size", "13px")
      .attr("x", 60)
      .attr("y", 40)
      .attr("dy", "10px")
      .style("text-anchor", "start")
      .text("Y-Axis:Review")
      .attr("font-size", "10px");
    
    
  }

  drawLineChart() {
    d3.selectAll("svg > *").remove();
    this.svg = d3.select('svg');
    this.width = +this.svg.attr('width') - this.margin.left - this.margin.right;
    this.height = +this.svg.attr('height') - this.margin.top - this.margin.bottom;
    this.g = this.svg.append('g')
        .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
    this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.1);
    this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);

    this.x.domain(this.places.map((d) => d.address1));
    this.y.domain([0, d3Array.max(this.places, (d) => +d.review_count)]);

    this.g.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + this.height + ')')
        .text('Places')
        .call(d3Axis.axisBottom(this.x))
        .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-25)");
    this.g.append('g')
        .attr('class', 'y axis')
        .call(d3Axis.axisLeft(this.y))
        .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(0)");
    
        

    this.line = d3Shape.line()
        .x((d: any) => this.x(d.address1))//d.loggingtime
        .y((d: any) => this.y(d.review_count));




    this.g.append("path")
        .datum(this.places)
        .attr("fill", "none")
        .attr("class", "line")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 3)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", this.line);

    var legend = this.svg.append('g')
      .attr("class", "legend")
      .attr("x", 20)
      .attr("y",3)
      .attr("width", 18)
      .attr("height",10)

      legend.append("rect")
      .attr("class", "legend1")
      .attr("x", 610)
      .attr("y", 20)
      .attr("width", 18)
      .attr("height", 10)
      .style("fill", 'rgb(0,102,204)')
      .attr("font-size", "10px");

    legend.append("text")
      .attr("class", "legendTxt")
      .style("font-size", "13px")
      .attr("x", 630)
      .attr("y", 20)
      .attr("dy", "10px")
      .style("text-anchor", "start")
      .text("Restaurant Review Count")
      .attr("font-size", "10px");

    legend.append("text")
      .attr("class", "legendTxt")
      .style("font-size", "13px")
      .attr("x", 610)
      .attr("y", 40)
      .attr("dy", "10px")
      .style("text-anchor", "start")
      .text("X-Axis: Address of Restaurants")
      .attr("font-size", "10px");

  }

  // private initSvg() {
  //   this.svg = d3.select('chart').select('svg').remove();
  //   // document.getElementById('chart').innerHTML='<svg width="1000" height="400"></svg>'
  //   this.svg = d3.select('svg')
  //     .append('g')
  //     .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  // }

  // private initAxis() {
  //   this.x = d3Scale.scaleTime().range([0, this.width]);
  //   this.y = d3Scale.scaleLinear().range([this.height, 0]);
  //   this.x.domain(this.places.map((d) => d.name));
  //   this.y.domain([0,d3Array.extent(this.places, (d) => +d.review_count)]);
  // }

  // private drawAxis() {

  //   this.svg.append('g')
  //     .attr('class', 'axis axis--x')
  //     .attr('transform', 'translate(0,' + this.height + ')')
  //     .call(d3Axis.axisBottom(this.x));


  //   this.svg.append('g')
  //     .attr('class', 'axis axis--y')
  //     .call(d3Axis.axisLeft(this.y))

  //     .append('text')
  //     .attr('class', 'axis-title')
  //     .attr('transform', 'rotate(-90)')
  //     .attr('y', 6)
  //     .attr('dy', '.71em')
  //     .style('text-anchor', 'end')
  //     .text('Price ($)')

  // }  
  
  findStations(placeName) {

    for (var i = 0,len = this.places.length; i < len; i++) {

      if ( this.places[i].name === placeName ) { // strict equality test

          var place_selected =  this.places[i];

          break;
      }
    }


    this.placesService.findStations(placeName).subscribe(() => {
      this.router.navigate(['/list_of_stations']);
    });

  }



}
