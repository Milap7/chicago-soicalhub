import {Component, OnDestroy, OnInit} from '@angular/core';
import {StationLog} from "../../log";
import {Station} from "../../station";
import * as d3Shape from "d3-shape";
import {PlacesService} from "../../places.service";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import * as d3 from "d3-selection";
import * as d3Scale from "d3-scale";
import * as d3Array from "d3-array";
import * as d3Axis from "d3-axis";
import {SMALog} from "../../sma";

@Component({
  selector: 'app-sma-chart',
  templateUrl: './sma-chart.component.html',
  styleUrls: ['./sma-chart.component.css']
})
export class SmaChartComponent implements OnInit, OnDestroy{

  log:StationLog[] = [];
  hours:StationLog[] = [];
  firstData:Station[] = [];
  log_24:StationLog[] = [];
  hours_24:StationLog[] = [];
  sma:SMALog[] = [];
  sma_24:SMALog[] = [];
  private margin = {top: 0, right: 20, bottom: 30, left: 50};
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private line: d3Shape.Line<[number, number]>;
  private line_1: d3Shape.Line<[number, number]>;
  selectedStationID;
  numHours = 1;
  socket = new WebSocket('ws://localhost:8081/');
  constructor(private placesService: PlacesService, private router: Router, private http: HttpClient) {
    this.width = 1200 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
  }

  ngOnInit() {
    this.placesService.getStationLog().subscribe((data: Station[]) => {
      // this.placesService.getStationLog();
      this.firstData = data;
      console.log(this.firstData);
      this.firstData.map(d => this.selectedStationID = d.id);
      console.log(this.selectedStationID);
      this.fetchLogs_24();
      this.fetchLogs();
    });


    var _this =this;
    this.socket.onmessage = function (event) {
      var abc = JSON.parse(event.data)
      // console.log("Receoived");
      // console.log("This.selectedStation : " + _this.selectedStationID);
      // console.log("event.data.id"  + abc.id);
      // console.log(abc.id == _this.selectedStationID);
      // console.log(abc.id === _this.selectedStationID);

      if(abc.id === _this.selectedStationID) {
        _this.log.push(abc);
        _this.log_24.push(abc);
        // console.log(abc)
        _this.updateLogs();
      }


    };

  }

  ngOnDestroy() {
    console.log("Destroyed");
    this.socket.close();

  }


  updateLogs() {
    console.log("Inside updateLogs " + this.log.map(d => d.totaldocks));
    console.log(this.log)
    this.hours.splice(0,1);
    var x = new Date(this.log[this.log.length-1].timecreated.toString());
    x.getHours();
    this.hours.push({"timecreated":x, "availablebikes" : this.log[this.log.length-1].availablebikes, "availabledocks": this.log[this.log.length -1].availabledocks, "totaldocks" : this.log[this.log.length -1].totaldocks})

    console.log("Hours: ");
    console.log(this.hours);

    this.hours_24.splice(0,1);
    var x = new Date(this.log_24[this.log_24.length-1].timecreated.toString());
    x.getHours();
    this.hours_24.push({"timecreated":x, "availablebikes" : this.log_24[this.log_24.length-1].availablebikes, "availabledocks": this.log_24[this.log_24.length -1].availabledocks, "totaldocks" : this.log_24[this.log_24.length -1].totaldocks})


    this.sma.push({"availabledocksAvg": this.calculateAverage(this.hours), "timecreatedAvg" : this.hours[this.hours.length-1].timecreated, "availablebikesAvg" : this.calculateAverage(this.hours)});
    this.sma_24.push({"availabledocksAvg": this.calculateAverage(this.hours_24), "timecreatedAvg" : this.hours_24[this.hours_24.length-1].timecreated, "availablebikesAvg" : this.calculateAverage(this.hours_24)});

    console.log(this.sma);
    console.log(this.sma_24);

    this.initSvg();
    this.initAxis();
    this.drawAxis();
    this.drawLine();

  }

  calculateAverage(hours:StationLog[]) {
    var sum = 0;
    for(var i = 0;i<hours.length;i++) {
       sum = sum + +hours[i].availabledocks;
    }
    return (sum/hours.length);
  }

  fetchLogs_24() {
    console.log("Fetch");
    console.log(this.selectedStationID);
    this.log_24 = [];
    this.hours_24 = [];
    this.placesService
      .findLogs(this.selectedStationID,24)
      .subscribe((data: StationLog[]) => {
        // this.placesService.getStationLog();
        this.log_24 = data;
        console.log(this.log_24);
        for(var i = 0; i<this.log_24.length;i++) {
          var x = new Date(this.log_24[i].timecreated.toString());
          x.getHours();
          this.hours_24.push({"timecreated":x, "availablebikes" : this.log_24[i].availablebikes, "availabledocks": this.log_24[i].availabledocks, "totaldocks" : this.log_24[i].totaldocks})
        }
        // console.log(this.hours)
        this.sma_24.push({"availabledocksAvg": this.calculateAverage(this.hours_24), "timecreatedAvg" : this.hours_24[this.hours_24.length-1].timecreated, "availablebikesAvg" : this.calculateAverage(this.hours_24)});
        console.log(this.sma_24);
      });


  }

  fetchLogs() {
    console.log("Fetch");
    console.log(this.selectedStationID);
    this.log = [];
    this.hours = [];
    this.placesService
      .findLogs(this.selectedStationID,this.numHours)
      .subscribe((data: StationLog[]) => {
        // this.placesService.getStationLog();
        this.log = data;
        console.log(this.log);
        for(var i = 0; i<this.log.length;i++) {
          var x = new Date(this.log[i].timecreated.toString());
          x.getHours();
          this.hours.push({"timecreated":x, "availablebikes" : this.log[i].availablebikes, "availabledocks": this.log[i].availabledocks, "totaldocks" : this.log[i].totaldocks})
        }
        // console.log(this.hours)
        this.sma.push({"availabledocksAvg": this.calculateAverage(this.hours), "timecreatedAvg" : this.hours[this.hours.length-1].timecreated, "availablebikesAvg" : this.calculateAverage(this.hours)});
        // this.sma.push(this.calculateAverage(this.hours) + 10);
        // console.log(this.sma);
        this.initSvg();
        this.initAxis();
        this.drawAxis();
        this.drawLine();

      });


  }

  private initSvg() {
    this.svg = d3.select('svg').remove();
    document.getElementById('chartElm_1').innerHTML='<svg width="1200" height="500"></svg>'
    //const element = this.chartContainer.nativeElement;
    this.svg = d3.select('svg')
    // .attr("width", this.width)
    // .attr("height", this.height)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  private initAxis() {
    this.x = d3Scale.scaleTime().range([0, this.width]);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.x.domain([this.hours[0].timecreated, this.hours[this.hours.length -1].timecreated]);
    this.y.domain([0,this.hours[this.hours.length -1].totaldocks]);
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

  }

  private drawLine() {
    this.line = d3Shape.line()
      .x( (d: any) => this.x(+d.timecreatedAvg))
      .y( (d: any) => this.y(+d.availabledocksAvg));

    this.line_1 = d3Shape.line()
      .x( (d: any) => this.x(+d.timecreatedAvg))
      .y( (d: any) => this.y(+d.availabledocksAvg));


    this.svg.selectAll("dot")
      .data(this.sma)
      .enter().append("circle")
      .attr("r", 3.5)
      .attr("cx", (d:any) => this.x(+d.timecreatedAvg))
      .attr("cy", (d: any) => this.y(+d.availabledocksAvg))
      .attr("fill", 'red');

    this.svg.append('path')
      .datum(this.sma)
      // .data(this.sma_24)
      .attr('class', 'line')
      .attr('d', this.line)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 2.0)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round");

    this.svg.selectAll("dot")
      .data(this.sma_24)
      .enter().append("circle")
      .attr("r", 3.5)
      .attr("cx", (d:any) => this.x(+d.timecreatedAvg))
      .attr("cy", (d:any) => this.y(+d.availabledocksAvg))
      .attr("fill", 'blue');

    this.svg.append('path')
      .datum(this.sma_24)
      // .data(this.sma_24)
      .attr('class', 'line')
      .attr('d', this.line_1)
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", 2.0)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round");

    var legend = this.svg.append('g')
      .attr("class", "legend")
      .attr("x", 20)
      .attr("y",3)
      .attr("width", 18)
      .attr("height",10)

    legend.append("rect")
      .attr("class", "legend")
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
      .text("24 Hours Moving Averagge")
      .attr("font-size", "10px");

    legend.append("rect")
      .attr("class", "legend")
      .attr("x", 20)
      .attr("y", 20)
      .attr("width", 18)
      .attr("height", 10)
      .style("fill", 'red');

    legend.append("text")
      .attr("class", "legendTxt")
      .style("font-size", "13px")
      .attr("x", 40)
      .attr("y", 20)
      .attr("dy", "10px")
      .style("text-anchor", "start")
      .text("1 Hour Moving Average");

    this.svg.selectAll(".text")
      .data(this.hours)
      .enter()
      .append("text")
      .attr('class', 'text')
      .attr("transform",
        "translate(" + (this.width/2) + " ," +
        (this.height + this.margin.top + 30) + ")")
      .style("text-anchor", "middle")
      .text("Time Interval")

  }

}
