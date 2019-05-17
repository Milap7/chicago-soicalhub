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
import * as d3Time from 'd3-time';
import {ticks} from "d3-array";
import {Station} from "../../station";
import {MatCheckboxModule} from '@angular/material/checkbox';
import { SMALog } from 'src/app/sma';

var timer;
@Component({
  selector: 'app-real-time-line-chart',
  templateUrl: './real-time-line-chart.component.html',
  styleUrls: ['./real-time-line-chart.component.css']
})
export class RealTimeLineChartComponent implements OnInit {
  firstData:Station[] = [];
  selectedStationID;
  numHours = 1;
  log:StationLogElastic[] = [];
  hours:StationLogElastic[] = [];
  log_24 : StationLogElastic[] = [];
  hours_24 : StationLogElastic[] = [];
  log_1:StationLogElastic[] = [];
  hours_1:StationLogElastic[] = [];
  private margin = {top: 20, right: 20, bottom: 30, left: 50};
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private line: d3Shape.Line<[number, number]>;
  private line_sma1 :d3Shape.Line<[number, number]>;
  private line_sma24: d3Shape.Line<[number,number]>;
  checked1 = false;
  checked24 = false;
  sma:SMALog[] = [];
  sma_24:SMALog[] = [];

  constructor(private placesService: PlacesService, private router: Router, private http: HttpClient) {
    this.width = 600 - this.margin.left - this.margin.right;
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
    this.fetchLogs();
    this.fetchLogs_1();
    this.fetchLogs_24();
    var _this = this;
    timer = setTimeout(function() {
        _this.updateLogs()
      }, 126000);
  }

  changeInterval_line(numHours) {
    console.log("Number of hours: " + numHours);
    this.numHours = numHours;
    clearTimeout(timer);
    this.updateLogs();
    this.checked1 = false;
    this.checked24 = false;
  }

  onCheck1(checked1) {
    this.checked1 = checked1;
    if(checked1 == true) {
      this.drawSMA_1();
    } else {
      d3.select('path.line1').remove();
      d3.select('g.legend1').remove();
      d3.select('g.rect.legend1').remove();
      d3.select('circle.dot1').remove();
    } 
  }

  onCheck24(checked24) {
    this.checked24 = checked24;
    if(checked24 == true) {
     this.drawSMA_24();
    }
    else {
      d3.select('path.line24').remove();
      d3.select('g.legend24').remove();
      d3.select('g.rect.legend24').remove();
      d3.select('circle.dot24').remove();
    }
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
    else if(this.numHours == 672) {
      this.granularity = d3Time.timeDay.every(2);
    }

  }

  calculateAverage(hours:StationLogElastic[]) {
    var sum = 0;
    for(var i = 0;i<hours.length;i++) {
       sum = sum + +hours[i].availableDocks;
    }
    return (sum/hours.length);
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
        if(this.checked1 == true) {
          this.drawSMA_1();
        }

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
      .attr("fill", 'blue');
    this.svg.append('path')
    .datum(this.sma)
    .attr('id', 'id_sma_1')
    .attr('class', 'line1')
    .attr('d', this.line_sma1)
    .attr("fill", "none")
    .attr("stroke", "blue")
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
      .style("fill", 'blue')
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

  fetchLogs_24() {
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
        this.hours_24.splice(0,1);
        this.sma_24.push({"availabledocksAvg": this.calculateAverage(this.hours_24), "timecreatedAvg" : this.hours_24[this.hours_24.length-1].timeCreated, "availablebikesAvg" : this.calculateAverage(this.hours_24)});      
        
        console.log("Average docks" + this.calculateAverage(this.hours_24));
        console.log("Time for sma_24: " + this.hours_24[this.hours_24.length-1].timeCreated)
        if(this.checked24 == true) {
          this.drawSMA_24();
        }
      
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
      .attr("fill", 'red');
    this.svg.append('path')
        .datum(this.sma_24)
        .attr('id', 'id_sma_24')
        .attr('class', 'line24')
        .attr('d', this.line_sma24)
        .attr("fill", "none")
        .attr("stroke", "red")
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
      .style("fill", 'red')
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

  fetchLogs() {
    console.log("Fetch");
    console.log(this.selectedStationID);
    
    console.log("Hours from fetchLogs: " + this.numHours);
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
        this.drawLine();

      });
  }

  private initSvg() {
    this.svg = d3.select('#chartElm_line').select('svg').remove();
    document.getElementById('chartElm_line').innerHTML='<svg width="600" height="440" style = "margin-top:20px"></svg>'
    this.svg = d3.select('#chartElm_line svg')
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
    this.setGranularity();
    this.svg.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x).ticks(this.granularity));

      this.svg.append("text")             
      .attr("transform",
            "translate(" + (this.width/2) + " ," + 
                           (this.height + this.margin.top + 65) + ")")
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

  private drawLine() {
    this.line = d3Shape.line()
      .x( (d: any) => this.x(d.timeCreated))
      .y( (d: any) => this.y(+d.availableDocks));

    this.svg.append('path')
      .datum(this.hours)
      .attr('class', 'line')
      .attr('d', this.line)
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")

    // this.svg.selectAll(".text")
    //   .data(this.hours)
    //   .enter()
    //   .append("text")
    //   .attr('class', 'text')
    //   .attr("transform",
    //     "translate(" + (this.width/2) + " ," +
    //     (this.height + this.margin.top + 40) + ")")
    //   .style("text-anchor", "middle")
    //   .text("Time Range")

    var legend = this.svg.append('g')
      .attr("class", "legend")
      .attr("x", 20)
      .attr("y",3)
      .attr("width", 18)
      .attr("height",10)

      legend.append("rect")
      .attr("class", "legend1")
      .attr("x", 220)
      .attr("y", 350)
      .attr("width", 18)
      .attr("height", 10)
      .style("fill", 'green')
      .attr("font-size", "10px");

    legend.append("text")
      .attr("class", "legendTxt")
      .style("font-size", "13px")
      .attr("x", 240)
      .attr("y", 350)
      .attr("dy", "10px")
      .style("text-anchor", "start")
      .text("Available Docks")
      .attr("font-size", "10px");

    // legend.append("text")
    //   .attr("class", "legendTxt")
    //   .style("font-size", "13px")
    //   .attr("x", 700)
    //   .attr("y", 18)
    //   .attr("dy", "10px")
    //   .style("text-anchor", "start")
    //   .text("Y-Axis: TotalDocks")
    //   .attr("font-size", "10px");
  }
}
