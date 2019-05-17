import { Component, OnInit } from '@angular/core';
import { Station } from 'src/app/station';
import { StationLogElastic } from 'src/app/elastic-log';
import { SMALog } from 'src/app/sma';
import { PlacesService } from 'src/app/places.service';
import { Router } from '@angular/router';
import {HttpClient} from "@angular/common/http";
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as d3Time from 'd3-time';

import {ticks} from "d3-array";
// import { ConsoleReporter } from 'jasmine';

var timer

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {

  firstData:Station[] = [];
  selectedStationID;
  numHours_1 = 1;
  numHours_24 = 24;
  numHours_7 = 49;
  log:StationLogElastic[] = [];
  hours:StationLogElastic[] = [];
  log_24 : StationLogElastic[] = [];
  hours_24 : StationLogElastic[] = [];
  log_1:StationLogElastic[] = [];
  hours_1:StationLogElastic[] = [];
  log_720:StationLogElastic[] = [];
  hours_720:StationLogElastic[] = [];

  private margin = {top: 20, right: 20, bottom: 25, left: 50};
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private x_24 :any;
  private y_24 : any
  private svg: any;
  private svg_24 :any;
  private svg_line : any
  private g:any;
  private line: d3Shape.Line<[number, number]>;
  private line_sma1 :d3Shape.Line<[number, number]>;
  private line_sma24: d3Shape.Line<[number,number]>;
  // private line_sma720 : d3Shape.Line<[number,number]>;
  checked1 = false;
  checked24 = false;
  sma = [];
  sma_24 = [];
  sma_720:SMALog[] = [];
  average: Number[] = [];
  average_bikes:Number[] = [];
  average_24: Number[] = [];
  average_24_bikes : Number[] = [];
  average_7 :Number[] = [];
  average_7_bikes : Number[] = [];
  private numHours = 1
  private numHours_line = 1;
  

  constructor(private placesService: PlacesService, private router: Router, private http: HttpClient) {
    this.width = 600 - this.margin.left - this.margin.right; //Change back to 600
    this.height = 350 - this.margin.top - this.margin.bottom;
   }

  ngOnInit() {
    this.placesService.getStationLogElastic().subscribe((data: Station[]) => {
      this.firstData = data;
      this.firstData.map(d => this.selectedStationID = d.id);
      console.log("The station id: " + this.selectedStationID);
      this.updateLogs();
    });
  }

  ngOnDestroy() {
    console.log("Destroyed");
    clearTimeout(timer);

  }

  updateLogs() {
    
    this.fetchLogs_1();
    this.fetchLogs_24();
    // this.fetchLogs_7();
    var _this = this;
    timer = setTimeout(function() {
        _this.updateLogs()
      }, 126000);
  }
  changeInterval(numHours) {
    // console.log("Hours from function" + numHours);
    // this.numHours = numHours + 1;
    // console.log("NumHours" + this.numHours);
    this.numHours = numHours
    if(numHours == 1) {
      this.numHours_1 = 1;
      this.numHours_24 = 24;
      // this.numHours_line = 1;
      // this.numHours_7 = 49;
      clearTimeout(timer);
      this.updateLogs();
    }
    else if(numHours == 24) {
      this.numHours_1 = 25;
      this.numHours_24 = 48;
      // this.numHours_line = 24;
      // this.numHours_7 = 72;
      clearTimeout(timer);
      this.updateLogs();
    }
    else {
      this.numHours_1 = 169;
      this.numHours_24 = 336;
      // this.numHours_line = 168;
      // this.numHours_7 = 216;
      clearTimeout(timer);
      this.updateLogs();
    }
    
  }
  movingAverage1 = (data, hourinterval) => {
    var arr = []
    data.map((row, index, total) => {
      
      const endindex = total.length - index - 1
      var startindex = endindex
      const endtime = total[endindex].timeCreated
      var starttime = new Date(endtime)
      //starttime = new Date(starttime.setTime(starttime.getTime()))
      starttime.setHours(starttime.getHours() - hourinterval)

      var timelimit = new Date(total[total.length - 1].timeCreated)
      //timelimit = new Date(timelimit.setTime(timelimit.getTime()))
      timelimit.setHours(timelimit.getHours() - this.numHours_1)

      //console.log(starttime, endtime)
      var sum = 0
      var count = 0
      //console.log(timelimit)
      while(total[startindex] != undefined && total[startindex].timeCreated > starttime){
        sum += total[startindex].availableDocks
        count++
        startindex--
      }
      if(endtime > timelimit){
        
        var avg = sum/count 
        
        // if(index < 30){
        //   console.log(total[startindex + 1], starttime)
        //   console.log('sum=', sum)
        // }
        
        if(total[startindex] != undefined){
          startindex++
        }
        //const subset = total.slice(startindex, endindex + 1);
        //console.log(subset)
        //console.log(startindex, endindex + 1)
        arr.push({timeCreated: total[endindex].timeCreated, availableDocks_avg: avg})
        //return {logTime: total[endindex].logTime, availableDocks_avg: avg}
      }
      
    });
    return arr
  }

  fetchLogs_1() {
    this.placesService
      .find_divvyLogs(this.selectedStationID, this.numHours_1)
      .subscribe((data: StationLogElastic[]) => {
        this.log_1 = [];
        this.hours_1 = [];
        this.log_1 = data;
        console.log("Logs: \n");
        // console.log(this.log);
        for(var i = 0; i<this.log_1.length;i++) {
          this.hours_1.push({"timeCreated": new Date(this.log_1[i].timeCreated.toString()), "availableBikes" : this.log_1[i].availableBikes, "availableDocks": this.log_1[i].availableDocks, "totalDocks" : this.log_1[i].totalDocks})
        }
        // console.log("Hours" + this.hours[0].availableDocks);
        console.log("Hours Array: ");
        console.log(this.hours_1);
        this.hours_1.splice(0,1);
        this.sma.splice(0,this.sma.length);
          this.sma = this.movingAverage1(this.hours_1, this.numHours_1);
          console.log(this.sma);
      
        this.initSvg();
        this.initAxis();
        this.drawAxis();
        this.drawSMA_1();

      });
      
  }

  fetchLogs_24() {
    this.placesService
      .find_divvyLogs(this.selectedStationID, this.numHours_24)
      .subscribe((data: StationLogElastic[]) => {
        this.log_24 = [];
        this.hours_24 = [];
        this.log_24 = data;
        console.log("Logs: \n");
        // console.log(this.log);
        for(var i = 0; i<this.log_24.length;i++) {
          this.hours_24.push({"timeCreated": new Date(this.log_24[i].timeCreated.toString()), "availableBikes" : this.log_24[i].availableBikes, "availableDocks": this.log_24[i].availableDocks, "totalDocks" : this.log_24[i].totalDocks})
        }
        // // console.log("Hours" + this.hours[0].availableDocks);
        // console.log("Hours Array: ");
        console.log(this.hours_24);
        this.hours_24.splice(0,1);
        this.sma_24.splice(0,this.sma_24.length);
        this.sma_24 = this.movingAverage1(this.hours_24, this.numHours_24);
        this.sma_24.splice(0, 1)
        console.log(this.sma_24);
        this.initSvg_24();
        this.initAxis_24();
        this.drawAxis_24();
        this.drawSMA_24();

      });
      
  }

  calculateAverage(hours: Number[]) {
    var sum = 0;
    for(var i = 0;i<hours.length;i++) {
       sum = sum + +hours[i];
    }
    return (sum/hours.length);
  }

  private initSvg() {
    this.svg = d3.select('#chartElm');
    document.getElementById('chartElm').innerHTML='<svg width="600" height="440" style = "margin-top:20px"></svg>'
    this.svg = d3.select('#chartElm svg')
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  private initAxis() {
    this.x = d3Scale.scaleTime().range([0, this.width]);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.x.domain(d3Array.extent(this.sma, (d) => +d.timeCreated));
    this.y.domain([0,this.hours_1[this.hours_1.length-1].totalDocks]);
  }

  private drawAxis() {
this.setGranularity()
    this.svg.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x).ticks(this.granularity));
    
      this.svg.append("text")             
      .attr("transform",
            "translate(" + (this.width/2) + " ," + 
                           (this.height + this.margin.top + 60) + ")")
      .style("text-anchor", "middle")
      .text("Time Range");
      


    this.svg.append('g')
      .attr('class', 'axis axis--y')
      .call(d3Axis.axisLeft(this.y))

      this.svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - this.margin.left + 5)
      .attr("x",0 - (this.height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Total Docks");  

  }

  
  drawSMA_1() {
    this.line_sma1 = d3Shape.line()
        .x( (d: any) => this.x(+d.timeCreated))
        .y( (d: any) => this.y(+d.availableDocks_avg));
    this.initSMA_1Line();
        
  }

  private initSMA_1Line() {
    this.svg.append('path')
    .datum(this.sma)
    .attr('id', 'id_sma_1')
    .attr('class', 'line1')
    .attr('d', this.line_sma1)
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("stroke-width",2.0)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round");

    var legend = this.svg.append('g')
      .attr("class", "legend1")
      .attr("x", 20)
      .attr("y",3)
      .attr("width", 18)
      .attr("height",10)

      legend.append("rect")
      .attr("class", "legend1")
      .attr("x", 220) //Change back to 360
      .attr("y", 350)
      .attr("width", 18)
      .attr("height", 10)
      .style("fill", 'blue')
      .attr("font-size", "10px");

    legend.append("text")
      .attr("class", "legendTxt")
      .style("font-size", "13px")
      .attr("x", 240) //Change back to 380
      .attr("y", 350)
      .attr("dy", "10px")
      .style("text-anchor", "start")
      .text("1 Hour Moving Average")
      .attr("font-size", "10px");

  }
  // private drawLine() {
  //   this.line = d3Shape.line()
  //     .x( (d: any) => this.x(+d.timeCreated))
  //     .y( (d: any) => this.y(+d.availableDocks));

  //   this.svg.append('path')
  //     .datum(this.hours)
  //     .attr('class', 'line')
  //     .attr('d', this.line)
  //     .attr("fill", "none")
  //     .attr("stroke", "green")
  //     .attr("stroke-width", 1.5)
  //     .attr("stroke-linejoin", "round")
  //     .attr("stroke-linecap", "round")

  //   var legend = this.svg.append('g')
  //     .attr("class", "legend")
  //     .attr("x", 20)
  //     .attr("y",3)
  //     .attr("width", 18)
  //     .attr("height",10)

  //     legend.append("rect")
  //     .attr("class", "legend1")
  //     .attr("x", 360)
  //     .attr("y", 30)
  //     .attr("width", 18)
  //     .attr("height", 10)
  //     .style("fill", 'green')
  //     .attr("font-size", "10px");

  //   legend.append("text")
  //     .attr("class", "legendTxt")
  //     .style("font-size", "13px")
  //     .attr("x", 380)
  //     .attr("y", 30)
  //     .attr("dy", "10px")
  //     .style("text-anchor", "start")
  //     .text("Available Docks")
  //     .attr("font-size", "10px");
  // }

  // fetchLogs() {
  //   console.log("Fetch");
  //   console.log(this.selectedStationID);
    
  //   console.log("Hours from fetchLogs: " + this.numHours_line);
  //   this.placesService
  //     .find_divvyLogs(this.selectedStationID,this.numHours_line)
  //     .subscribe((data: StationLogElastic[]) => {
  //       this.log = [];
  //       this.hours = [];
  //       this.log = data;
  //       console.log("Logs: \n");
  //       // console.log(this.log);
  //       for(var i = 0; i<this.log.length;i++) {
  //         this.hours.push({"timeCreated": new Date(this.log[i].timeCreated.toString()), "availableBikes" : this.log[i].availableBikes, "availableDocks": this.log[i].availableDocks, "totalDocks" : this.log[i].totalDocks})
  //       }
  //       // console.log("Hours" + this.hours[0].availableDocks);
  //       console.log("Hours Array From fetchLogs: ");
  //       console.log(this.hours);
  //       this.hours.splice(0,1);
  //       // this.sma.push({"availabledocksAvg": this.calculateAverage(this.hours), "timecreatedAvg" : this.hours[this.hours.length-1].timeCreated, "availablebikesAvg" : this.calculateAverage(this.hours)});
  
  //       // this.initSvg_line();
  //       // this.initAxis_line();
  //       // this.drawAxis_line();
  //       this.drawLine();

  //     });
  // }

  private initSvg_24() {
    this.svg_24 = d3.select('#chartElm_1');
    console.log(this.svg_24)
    document.getElementById('chartElm_1').innerHTML='<svg width="600" height="420" style = "margin-top:20px"></svg>' //Change the width and height of svg element
    this.svg_24 = d3.select('#chartElm_1 svg')
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  private initAxis_24() {
    this.x_24 = d3Scale.scaleTime().range([0, this.width]);
    this.y_24 = d3Scale.scaleLinear().range([this.height, 0]);
    this.x_24.domain(d3Array.extent(this.sma_24, (d) => +d.timeCreated));
    this.y_24.domain([0,this.hours_24[this.hours_24.length-1].totalDocks]);
  }

  private granularity;
  private setGranularity(){
    if(this.numHours == 1){
      this.granularity = d3Time.timeMinute.every(5)
    }
    else if(this.numHours == 24){
      this.granularity = d3Time.timeHour.every(2)
    }
    else if(this.numHours == 168){
      this.granularity = d3Time.timeHour.every(12)
    }

  }
  private drawAxis_24() {
this.setGranularity()
    this.svg_24.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x_24).ticks(this.granularity));

      this.svg_24.append("text")             
      .attr("transform",
            "translate(" + (this.width/2) + " ," + 
                           (this.height + this.margin.top + 60) + ")")
      .style("text-anchor", "middle")
      .text("Time Range");


    this.svg_24.append('g')
      .attr('class', 'axis axis--y')
      .call(d3Axis.axisLeft(this.y_24))

      this.svg_24.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - this.margin.left + 5)
      .attr("x",0 - (this.height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Total Docks"); 
  }

  drawSMA_24() {
    this.line_sma24 = d3Shape.line()
        .x( (d: any) => this.x_24(+d.timeCreated))
        .y( (d: any) => this.y_24(+d.availableDocks_avg));
    this.initSMA_24Line();
        
  }

  private initSMA_24Line() {
    this.svg_24.append('path') // Change this to this.svg_24.append()
        .datum(this.sma_24)
        .attr('id', 'id_sma_24')
        .attr('class', 'line24')
        .attr('d', this.line_sma24)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width",2.0)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round");
    var legend = this.svg_24.append('g')
      .attr("class", "legend24")
      .attr("x", 20)
      .attr("y",3)
      .attr("width", 18)
      .attr("height",10)

    legend.append("rect")
      .attr("class", "legend24")
      .attr("x", 220)
      .attr("y", 350)
      .attr("width", 18)
      .attr("height", 10)
      .style("fill", 'red')
      .attr("font-size", "10px");

    legend.append("text")
      .attr("class", "legendTxt")
      .style("font-size", "13px")
      .attr("x", 240)
      .attr("y", 350)
      .attr("dy", "10px")
      .style("text-anchor", "start")
      .text("24 Hours Moving Average")
      .attr("font-size", "10px");
  }

  

}
