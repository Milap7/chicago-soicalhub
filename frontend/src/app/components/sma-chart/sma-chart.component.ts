// import {Component, OnDestroy, OnInit} from '@angular/core';
// import {StationLog} from "../../log";
// import {Station} from "../../station";
// import * as d3Shape from "d3-shape";
// import {PlacesService} from "../../places.service";
// import {Router} from "@angular/router";
// import {HttpClient} from "@angular/common/http";
// import * as d3 from "d3-selection";
// import * as d3Scale from "d3-scale";
// import * as d3Array from "d3-array";
// import * as d3Axis from "d3-axis";
// import {SMALog} from "../../sma";

// @Component({
//   selector: 'app-sma-chart',
//   templateUrl: './sma-chart.component.html',
//   styleUrls: ['./sma-chart.component.css']
// })
// export class SmaChartComponent implements OnInit, OnDestroy{

//   log:StationLog[] = [];
//   hours:StationLog[] = [];
//   firstData:Station[] = [];
//   log_24:StationLog[] = [];
//   hours_24:StationLog[] = [];
//   sma:SMALog[] = [];
//   sma_24:SMALog[] = [];
//   private margin = {top: 0, right: 20, bottom: 30, left: 50};
//   private width: number;
//   private height: number;
//   private x: any;
//   private y: any;
//   private svg: any;
//   private line: d3Shape.Line<[number, number]>;
//   private line_1: d3Shape.Line<[number, number]>;
//   selectedStationID;
//   numHours = 1;
//   socket = new WebSocket('ws://localhost:8081/');
//   constructor(private placesService: PlacesService, private router: Router, private http: HttpClient) {
//     this.width = 1200 - this.margin.left - this.margin.right;
//     this.height = 500 - this.margin.top - this.margin.bottom;
//   }

//   ngOnInit() {
//     this.placesService.getStationLog().subscribe((data: Station[]) => {
//       // this.placesService.getStationLog();
//       this.firstData = data;
//       console.log(this.firstData);
//       this.firstData.map(d => this.selectedStationID = d.id);
//       console.log(this.selectedStationID);
//       this.fetchLogs_24();
//       this.fetchLogs();
//     });


//     var _this =this;
//     this.socket.onmessage = function (event) {
//       var abc = JSON.parse(event.data)
//       // console.log("Receoived");
//       // console.log("This.selectedStation : " + _this.selectedStationID);
//       // console.log("event.data.id"  + abc.id);
//       // console.log(abc.id == _this.selectedStationID);
//       // console.log(abc.id === _this.selectedStationID);

//       if(abc.id === _this.selectedStationID) {
//         _this.log.push(abc);
//         _this.log_24.push(abc);
//         // console.log(abc)
//         _this.updateLogs();
//       }


//     };

//   }

//   ngOnDestroy() {
//     console.log("Destroyed");
//     this.socket.close();

//   }


//   updateLogs() {
//     console.log("Inside updateLogs " + this.log.map(d => d.totaldocks));
//     console.log(this.log)
//     this.hours.splice(0,1);
//     var x = new Date(this.log[this.log.length-1].timecreated.toString());
//     x.getHours();
//     this.hours.push({"timecreated":x, "availablebikes" : this.log[this.log.length-1].availablebikes, "availabledocks": this.log[this.log.length -1].availabledocks, "totaldocks" : this.log[this.log.length -1].totaldocks})

//     console.log("Hours: ");
//     console.log(this.hours);

//     this.hours_24.splice(0,1);
//     var x = new Date(this.log_24[this.log_24.length-1].timecreated.toString());
//     x.getHours();
//     this.hours_24.push({"timecreated":x, "availablebikes" : this.log_24[this.log_24.length-1].availablebikes, "availabledocks": this.log_24[this.log_24.length -1].availabledocks, "totaldocks" : this.log_24[this.log_24.length -1].totaldocks})


//     this.sma.push({"availabledocksAvg": this.calculateAverage(this.hours), "timecreatedAvg" : this.hours[this.hours.length-1].timecreated, "availablebikesAvg" : this.calculateAverage(this.hours)});
//     this.sma_24.push({"availabledocksAvg": this.calculateAverage(this.hours_24), "timecreatedAvg" : this.hours_24[this.hours_24.length-1].timecreated, "availablebikesAvg" : this.calculateAverage(this.hours_24)});

//     console.log(this.sma);
//     console.log(this.sma_24);

//     this.initSvg();
//     this.initAxis();
//     this.drawAxis();
//     this.drawLine();

//   }

//   calculateAverage(hours:StationLog[]) {
//     var sum = 0;
//     for(var i = 0;i<hours.length;i++) {
//        sum = sum + +hours[i].availabledocks;
//     }
//     return (sum/hours.length);
//   }

//   fetchLogs_24() {
//     console.log("Fetch");
//     console.log(this.selectedStationID);
//     this.log_24 = [];
//     this.hours_24 = [];
//     this.placesService
//       .findLogs(this.selectedStationID,24)
//       .subscribe((data: StationLog[]) => {
//         // this.placesService.getStationLog();
//         this.log_24 = data;
//         console.log(this.log_24);
//         for(var i = 0; i<this.log_24.length;i++) {
//           var x = new Date(this.log_24[i].timecreated.toString());
//           x.getHours();
//           this.hours_24.push({"timecreated":x, "availablebikes" : this.log_24[i].availablebikes, "availabledocks": this.log_24[i].availabledocks, "totaldocks" : this.log_24[i].totaldocks})
//         }
//         // console.log(this.hours)
//         this.sma_24.push({"availabledocksAvg": this.calculateAverage(this.hours_24), "timecreatedAvg" : this.hours_24[this.hours_24.length-1].timecreated, "availablebikesAvg" : this.calculateAverage(this.hours_24)});
//         console.log(this.sma_24);
//       });


//   }

//   fetchLogs() {
//     console.log("Fetch");
//     console.log(this.selectedStationID);
//     this.log = [];
//     this.hours = [];
//     this.placesService
//       .findLogs(this.selectedStationID,this.numHours)
//       .subscribe((data: StationLog[]) => {
//         // this.placesService.getStationLog();
//         this.log = data;
//         console.log(this.log);
//         for(var i = 0; i<this.log.length;i++) {
//           var x = new Date(this.log[i].timecreated.toString());
//           x.getHours();
//           this.hours.push({"timecreated":x, "availablebikes" : this.log[i].availablebikes, "availabledocks": this.log[i].availabledocks, "totaldocks" : this.log[i].totaldocks})
//         }
//         // console.log(this.hours)
//         this.sma.push({"availabledocksAvg": this.calculateAverage(this.hours), "timecreatedAvg" : this.hours[this.hours.length-1].timecreated, "availablebikesAvg" : this.calculateAverage(this.hours)});
//         // this.sma.push(this.calculateAverage(this.hours) + 10);
//         // console.log(this.sma);
//         this.initSvg();
//         this.initAxis();
//         this.drawAxis();
//         this.drawLine();

//       });


//   }

//   private initSvg() {
//     this.svg = d3.select('svg').remove();
//     document.getElementById('chartElm_1').innerHTML='<svg width="1200" height="500"></svg>'
//     //const element = this.chartContainer.nativeElement;
//     this.svg = d3.select('svg')
//     // .attr("width", this.width)
//     // .attr("height", this.height)
//       .append('g')
//       .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
//   }

//   private initAxis() {
//     this.x = d3Scale.scaleTime().range([0, this.width]);
//     this.y = d3Scale.scaleLinear().range([this.height, 0]);
//     this.x.domain([this.hours[0].timecreated, this.hours[this.hours.length -1].timecreated]);
//     this.y.domain([0,this.hours[this.hours.length -1].totaldocks]);
//   }

//   private drawAxis() {

//     this.svg.append('g')
//       .attr('class', 'axis axis--x')
//       .attr('transform', 'translate(0,' + this.height + ')')
//       .call(d3Axis.axisBottom(this.x));


//     this.svg.append('g')
//       .attr('class', 'axis axis--y')
//       .call(d3Axis.axisLeft(this.y))

//       .append('text')
//       .attr('class', 'axis-title')
//       .attr('transform', 'rotate(-90)')
//       .attr('y', 6)
//       .attr('dy', '.71em')
//       .style('text-anchor', 'end')
//       .text('Price ($)')

//   }

//   private drawLine() {
//     this.line = d3Shape.line()
//       .x( (d: any) => this.x(+d.timecreatedAvg))
//       .y( (d: any) => this.y(+d.availabledocksAvg));

//     this.line_1 = d3Shape.line()
//       .x( (d: any) => this.x(+d.timecreatedAvg))
//       .y( (d: any) => this.y(+d.availabledocksAvg));


//     this.svg.selectAll("dot")
//       .data(this.sma)
//       .enter().append("circle")
//       .attr("r", 3.5)
//       .attr("cx", (d:any) => this.x(+d.timecreatedAvg))
//       .attr("cy", (d: any) => this.y(+d.availabledocksAvg))
//       .attr("fill", 'red');

//     this.svg.append('path')
//       .datum(this.sma)
//       // .data(this.sma_24)
//       .attr('class', 'line')
//       .attr('d', this.line)
//       .attr("fill", "none")
//       .attr("stroke", "red")
//       .attr("stroke-width", 2.0)
//       .attr("stroke-linejoin", "round")
//       .attr("stroke-linecap", "round");

//     this.svg.selectAll("dot")
//       .data(this.sma_24)
//       .enter().append("circle")
//       .attr("r", 3.5)
//       .attr("cx", (d:any) => this.x(+d.timecreatedAvg))
//       .attr("cy", (d:any) => this.y(+d.availabledocksAvg))
//       .attr("fill", 'blue');

//     this.svg.append('path')
//       .datum(this.sma_24)
//       // .data(this.sma_24)
//       .attr('class', 'line')
//       .attr('d', this.line_1)
//       .attr("fill", "none")
//       .attr("stroke", "blue")
//       .attr("stroke-width", 2.0)
//       .attr("stroke-linejoin", "round")
//       .attr("stroke-linecap", "round");

//     var legend = this.svg.append('g')
//       .attr("class", "legend")
//       .attr("x", 20)
//       .attr("y",3)
//       .attr("width", 18)
//       .attr("height",10)

//     legend.append("rect")
//       .attr("class", "legend")
//       .attr("x", 20)
//       .attr("y", 5)
//       .attr("width", 18)
//       .attr("height", 10)
//       .style("fill", 'blue')
//       .attr("font-size", "10px");

//     legend.append("text")
//       .attr("class", "legendTxt")
//       .style("font-size", "13px")
//       .attr("x", 40)
//       .attr("y", 5)
//       .attr("dy", "10px")
//       .style("text-anchor", "start")
//       .text("24 Hours Moving Averagge")
//       .attr("font-size", "10px");

//     legend.append("rect")
//       .attr("class", "legend")
//       .attr("x", 20)
//       .attr("y", 20)
//       .attr("width", 18)
//       .attr("height", 10)
//       .style("fill", 'red');

//     legend.append("text")
//       .attr("class", "legendTxt")
//       .style("font-size", "13px")
//       .attr("x", 40)
//       .attr("y", 20)
//       .attr("dy", "10px")
//       .style("text-anchor", "start")
//       .text("1 Hour Moving Average");

//     this.svg.selectAll(".text")
//       .data(this.hours)
//       .enter()
//       .append("text")
//       .attr('class', 'text')
//       .attr("transform",
//         "translate(" + (this.width/2) + " ," +
//         (this.height + this.margin.top + 30) + ")")
//       .style("text-anchor", "middle")
//       .text("Time Interval")

//   }

// }
import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PlacesService} from "../../places.service";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {StationLogElastic} from '../../elastic-log'
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import {ticks} from "d3-array";
import {Station} from "../../station";
import {MatCheckboxModule} from '@angular/material/checkbox';
import { SMALog } from 'src/app/sma';

var timer;
@Component({
    selector: 'app-sma-chart',
    templateUrl: './sma-chart.component.html',
    styleUrls: ['./sma-chart.component.css']
  })
export class SmaChartComponent implements OnInit {
  firstData:Station[] = [];
  selectedStationID;
  numHours = 1;
  log:StationLogElastic[] = [];
  hours:StationLogElastic[] = [];
  log_24 : StationLogElastic[] = [];
  hours_24 : StationLogElastic[] = [];
  log_1:StationLogElastic[] = [];
  hours_1:StationLogElastic[] = [];
  log_720:StationLogElastic[] = [];
  hours_720:StationLogElastic[] = [];

  private margin = {top: 0, right: 20, bottom: 30, left: 50};
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private g:any;
  private line: d3Shape.Line<[number, number]>;
  private line_sma1 :d3Shape.Line<[number, number]>;
  private line_sma24: d3Shape.Line<[number,number]>;
  private line_sma720 : d3Shape.Line<[number,number]>;
  checked1 = false;
  checked24 = false;
  sma:SMALog[] = [];
  sma_24:SMALog[] = [];
  sma_720:SMALog[] = [];
  

  constructor(private placesService: PlacesService, private router: Router, private http: HttpClient) {
    this.width = 800 - this.margin.left - this.margin.right;
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
    this.changeAxis();
    this.fetchLogs(1);
    // this.fetchLogs_1();
    this.fetchLogs_24(1);
    this.fetchLogs_720(1)

    var _this = this;
    timer = setTimeout(function() {
        _this.updateLogs()
      }, 126000);
  }

  // onCheck1(checked1) {
  //   this.checked1 = checked1;
  //   if(checked1 == true) {
  //     this.drawSMA_1();
  //   } else {
  //     d3.select('path.line1').remove();
  //     d3.select('g.legend1').remove();
  //     d3.select('g.rect.legend1').remove();
  //     d3.select('circle.dot1').remove();
  //   } 
  // }

  // onCheck24(checked24) {
  //   this.checked24 = checked24;
  //   if(checked24 == true) {
  //    this.drawSMA_24();
  //   }
  //   else {
  //     d3.select('path.line24').remove();
  //     d3.select('g.legend24').remove();
  //     d3.select('g.rect.legend24').remove();
  //     d3.select('circle.dot24').remove();
  //   }
  // }

  calculateAverage(hours:StationLogElastic[]) {
    var sum = 0;
    for(var i = 0;i<hours.length;i++) {
       sum = sum + +hours[i].availableDocks;
    }
    return (sum/hours.length);
  }

  changeInterval(numHours) {
    this.numHours = numHours;
    this.changeAxis();
    this.fetchLogs(0);
    this.fetchLogs_24(0);
    this.fetchLogs_720(0);
  }

  fetchLogs_1() {
    this.placesService
      .find_divvyLogs(this.selectedStationID,1)
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
        console.log(this.hours);
        this.hours_1.splice(0,1);
        this.sma.push({"availabledocksAvg": this.calculateAverage(this.hours_1), "timecreatedAvg" : this.hours_1[this.hours_1.length-1].timeCreated, "availablebikesAvg" : this.calculateAverage(this.hours_1)});
        console.log("Time for sma_1: " + this.hours_1[this.hours_1.length-1].timeCreated)
        // if(this.checked1 == true) {
        //   this.drawSMA_1();
        // }
        console.log("1 hour sma\n");
        console.log(this.sma);
        this.drawSMA_1();

      });
      
  }

  drawSMA_1() {
    this.line_sma1 = d3Shape.line()
        .x( (d: any) => this.x(+d.timecreatedAvg))
        .y( (d: any) => this.y(+d.availabledocksAvg));
    this.initSMA_1Line();
        
  }

  private initSMA_1Line() {
    this.svg.append('circle')
      .data(this.sma)
      .attr('class', 'dot1')
      .attr("r", 4.5)
      .attr("cx", (d:any) => this.x(+d.timecreatedAvg))
      .attr("cy", (d:any) => this.y(+d.availabledocksAvg))
      .attr("fill", 'green');
    this.svg.append('path')
    .datum(this.sma)
    .attr('id', 'id_sma_1')
    .attr('class', 'line1')
    .attr('d', this.line_sma1)
    .attr("fill", "none")
    .attr("stroke", "green")
    .attr("stroke-width",4.0)
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
      .attr("x", 20)
      .attr("y", 20)
      .attr("width", 18)
      .attr("height", 10)
      .style("fill", 'green')
      .attr("font-size", "10px");

    legend.append("text")
      .attr("class", "legendTxt")
      .style("font-size", "13px")
      .attr("x", 40)
      .attr("y", 20)
      .attr("dy", "10px")
      .style("text-anchor", "start")
      .text("1 Hour Moving Average")
      .attr("font-size", "10px");

  }

  fetchLogs_24(yes) {
  
    this.placesService
      .find_divvyLogs(this.selectedStationID,24)
      .subscribe((data: StationLogElastic[]) => {
        this.log_24 = [];
        this.hours_24 = [];
        this.log_24 = data;
        console.log("Logs: \n");
        // console.log(this.log);
        for(var i = 0; i<this.log_24.length;i++) {
          this.hours_24.push({"timeCreated": new Date(this.log_24[i].timeCreated.toString()), "availableBikes" : this.log_24[i].availableBikes, "availableDocks": this.log_24[i].availableDocks, "totalDocks" : this.log_24[i].totalDocks})
        }
        // console.log("Hours" + this.hours[0].availableDocks);
        console.log("Hours Array: ");
        // console.log(this.hours);
        if(yes == 1) {
          this.hours_24.splice(0,1);
          this.sma_24.push({"availabledocksAvg": this.calculateAverage(this.hours_24), "timecreatedAvg" : this.hours_24[this.hours_24.length-1].timeCreated, "availablebikesAvg" : this.calculateAverage(this.hours_24)});      
        
        }
        
        console.log("Average docks" + this.calculateAverage(this.hours_24));
        console.log("Time for sma_24: " + this.hours_24[this.hours_24.length-1].timeCreated)
        // if(this.checked24 == true) {
        //   this.drawSMA_24();
        // }
        console.log("24 hours sma:\n");
        console.log(this.sma_24);
        this.drawSMA_24();
      });
      
  }

  changeAxis() {
    this.placesService
      .find_divvyLogs(this.selectedStationID,this.numHours)
      .subscribe((data: StationLogElastic[]) => {
        this.log = [];
        this.hours = [];
        this.log = data;
        console.log("Logs: \n");
        // console.log(this.log);
        for(var i = 0; i<this.log.length;i++) {
          this.hours.push({"timeCreated": new Date(this.log[i].timeCreated.toString()), "availableBikes" : this.log[i].availableBikes, "availableDocks": this.log[i].availableDocks, "totalDocks" : this.log[i].totalDocks})
        }
        // console.log("Hours" + this.hours[0].availableDocks);
        console.log("Hours Array: ");
        console.log(this.hours);
        // this.hours.splice(0,1);
        // this.sma.push({"availabledocksAvg": this.calculateAverage(this.hours), "timecreatedAvg" : this.hours[this.hours.length-1].timeCreated, "availablebikesAvg" : this.calculateAverage(this.hours)});
  
        this.initSvg();
        this.initAxis();
        this.drawAxis();
        // this.drawLine();
        // this.drawSMA_1();

      });
  }

  drawSMA_24() {
    this.line_sma24 = d3Shape.line()
        .x( (d: any) => this.x(+d.timecreatedAvg))
        .y( (d: any) => this.y(+d.availabledocksAvg));
    this.initSMA_24Line();
        
  }

  private initSMA_24Line() {
    this.svg.append('circle')
      .data(this.sma_24)
      .attr('class', 'dot24')
      .attr("r", 4.5)
      .attr("cx", (d:any) => this.x(+d.timecreatedAvg))
      .attr("cy", (d:any) => this.y(+d.availabledocksAvg))
      .attr("fill", 'blue');
    this.svg.append('path')
        .datum(this.sma_24)
        .attr('id', 'id_sma_24')
        .attr('class', 'line24')
        .attr('d', this.line_sma24)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width",4.0)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round");
    var legend = this.svg.append('g')
      .attr("class", "legend24")
      .attr("x", 20)
      .attr("y",3)
      .attr("width", 18)
      .attr("height",10)

    legend.append("rect")
      .attr("class", "legend24")
      .attr("x", 20)
      .attr("y", 5)
      .attr("width", 18)
      .attr("height", 10)
      .style("fill", 'blue')
      .attr("font-size", "10px");

    legend.append("text")
      .attr("class", "legendTxt")
      .style("font-size", "13px")
      .attr("x", 40)
      .attr("y", 5)
      .attr("dy", "10px")
      .style("text-anchor", "start")
      .text("24 Hours Moving Average")
      .attr("font-size", "10px");
  }

  fetchLogs_720(yes) {
    this.placesService
      .find_divvyLogs(this.selectedStationID,168)
      .subscribe((data: StationLogElastic[]) => {
        this.log_720 = [];
        this.hours_720 = [];
        this.log_720 = data;
        console.log("Logs: \n");
        // console.log(this.log);
        for(var i = 0; i<this.log_720.length;i++) {
          this.hours_720.push({"timeCreated": new Date(this.log_720[i].timeCreated.toString()), "availableBikes" : this.log_720[i].availableBikes, "availableDocks": this.log_720[i].availableDocks, "totalDocks" : this.log_720[i].totalDocks})
        }
        // console.log("Hours" + this.hours[0].availableDocks);
        if(yes==1) {
          this.hours_720.splice(0,1);
          this.sma_720.push({"availabledocksAvg": this.calculateAverage(this.hours_720), "timecreatedAvg" : this.hours_720[this.hours_720.length-1].timeCreated, "availablebikesAvg" : this.calculateAverage(this.hours_720)});
        
        }
        // console.log("Time for sma_1: " + this.hours_1[this.hours_1.length-1].timeCreated)
        // if(this.checked1 == true) {
        //   this.drawSMA_1();
        // }
        console.log("7 days:\n");
        console.log(this.sma_720);
        this.drawSMA_720();

      });
  }

  drawSMA_720() {
    this.line_sma720 = d3Shape.line()
        .x( (d: any) => this.x(+d.timecreatedAvg))
        .y( (d: any) => this.y(+d.availabledocksAvg));
    this.initSMA_720Line();
  }

  initSMA_720Line() {
    this.svg.append('circle')
      .data(this.sma_720)
      .attr('class', 'dot24')
      .attr("r", 4.5)
      .attr("cx", (d:any) => this.x(+d.timecreatedAvg))
      .attr("cy", (d:any) => this.y(+d.availabledocksAvg))
      .attr("fill", 'red');
    this.svg.append('path')
        .datum(this.sma_720)
        .attr('id', 'id_sma_720')
        .attr('class', 'line720')
        .attr('d', this.line_sma720)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width",4.0)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round");
    var legend = this.svg.append('g')
      .attr("class", "legend720")
      .attr("x", 20)
      .attr("y",3)
      .attr("width", 18)
      .attr("height",10)

    legend.append("rect")
      .attr("class", "legend720")
      .attr("x", 20)
      .attr("y", 35)
      .attr("width", 18)
      .attr("height", 10)
      .style("fill", 'red')
      .attr("font-size", "10px");

    legend.append("text")
      .attr("class", "legendTxt")
      .style("font-size", "13px")
      .attr("x", 40)
      .attr("y", 35)
      .attr("dy", "10px")
      .style("text-anchor", "start")
      .text("7 Days Moving Average")
      .attr("font-size", "10px");
  }

  fetchLogs(yes) {
    console.log("Fetch");
    console.log(this.selectedStationID);
    
    console.log("Hours from fetchLogs: " + this.numHours);
    this.placesService
      .find_divvyLogs(this.selectedStationID,1)
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
        console.log(this.hours);
        if(yes==1) {
          this.hours_1.splice(0,1);
         this.sma.push({"availabledocksAvg": this.calculateAverage(this.hours_1), "timecreatedAvg" : this.hours_1[this.hours_1.length-1].timeCreated, "availablebikesAvg" : this.calculateAverage(this.hours_1)});
        }
        
        // this.initSvg();
        // this.initAxis();
        // this.drawAxis();
        // this.drawLine();
        this.drawSMA_1();

      });
  }

  private initSvg() {
    this.svg = d3.select('chartElm').select('svg').remove();
    document.getElementById('chartElm').innerHTML='<svg width="1000" height="400"></svg>'
    this.svg = d3.select('svg')
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  private initAxis() {
    this.x = d3Scale.scaleTime().range([0, this.width]);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.x.domain(d3Array.extent(this.hours, (d) => +d.timeCreated));
    this.y.domain([0,this.hours[this.hours.length-1].totalDocks]);
  }

  private drawAxis() {

    this.svg.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x));


    this.svg.append('g')
      .attr('class', 'axis axis--y')
      .call(d3Axis.axisLeft(this.y))

      .append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Price ($)')

      this.svg.append("rect")
      .attr("class", "legend1")
      .attr("x", 580)
      .attr("y", 18)
      .attr("width", 18)
      .attr("height", 10)
      .style("fill", 'black')
      .attr("font-size", "10px");
      this.svg.append("text")
      .attr("class", "legendTxt")
      .style("font-size", "13px")
      .attr("x", 600)
      .attr("y", 18)
      .attr("dy", "10px")
      .style("text-anchor", "start")
      .text("Y-Axis: TotalDocks")
      .attr("font-size", "10px");

      this.svg.selectAll(".text")
      .data(this.hours)
      .enter()
      .append("text")
      .attr('class', 'text')
      .attr("transform",
        "translate(" + (this.width/2) + " ," +
        (this.height + this.margin.top + 40) + ")")
      .style("text-anchor", "middle")
      .text("Time Range")

  }
}

