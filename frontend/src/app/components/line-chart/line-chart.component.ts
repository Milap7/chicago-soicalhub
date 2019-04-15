import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PlacesService} from "../../places.service";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {StationLog} from "../../log"
// import * as d3 from "d3";
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import {ticks} from "d3-array";
import {Station} from "../../station";

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnInit, OnDestroy {
  @ViewChild('chart')
  private chartContainer: ElementRef;

  log:StationLog[] = [];
  hours:StationLog[] = [];
  firstData:Station[] = [];
  private margin = {top: 0, right: 20, bottom: 30, left: 50};
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private line: d3Shape.Line<[number, number]>;
  selectedStationID;
  numHours = 1;

  socket = new WebSocket('ws://localhost:8081/');


  constructor(private placesService: PlacesService, private router: Router, private http: HttpClient) {
    this.width = 1200 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
  }

  ngOnInit() {
    this.placesService.getStationLog().subscribe((data: Station[]) => {
      this.firstData = data;
      console.log("First Data" + this.firstData);
      this.firstData.map(d => this.selectedStationID = d.id);
      console.log("StationID" + this.selectedStationID);
      this.fetchLogs();
    });

    var _this = this;
    this.socket.onmessage = function (event) {
      var abc = JSON.parse(event.data);
      if(abc.id === _this.selectedStationID) {
        _this.log.push(abc);
        _this.updateLogs();
      }
    };
  }

  ngOnDestroy() {
    console.log("Destroyed");
    this.socket.close();

  }

  changeInterval() {
    console.log(this.numHours);
    this.fetchLogs();
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

    this.initSvg();
    this.initAxis();
    this.drawAxis();
    this.drawLine();

  }


  fetchLogs() {
    console.log("Fetch");
    console.log(this.selectedStationID);
    this.log = [];
    this.hours = [];
    this.placesService
      .findLogs(this.selectedStationID,this.numHours)
      .subscribe((data: StationLog[]) => {
        this.log = data;
        console.log(this.log);
        for(var i = 0; i<this.log.length;i++) {
          var x = new Date(this.log[i].timecreated.toString());
          x.getHours();
          this.hours.push({"timecreated":x, "availablebikes" : this.log[i].availablebikes, "availabledocks": this.log[i].availabledocks, "totaldocks" : this.log[i].totaldocks})
        }

        this.initSvg();
        this.initAxis();
        this.drawAxis();
        this.drawLine();

      });


  }

  private initSvg() {
    this.svg = d3.select('svg').remove();
    document.getElementById('chartElm').innerHTML='<svg width="1200" height="500"></svg>'
    this.svg = d3.select('svg')
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  private initAxis() {
    this.x = d3Scale.scaleTime().range([0, this.width]);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.x.domain(d3Array.extent(this.hours, (d) => +d.timecreated));
    this.y.domain([0,this.hours[this.hours.length-1].totaldocks]);
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
      .x( (d: any) => this.x(d.timecreated))
      .y( (d: any) => this.y(+d.availabledocks) );

    this.svg.append('path')
      .datum(this.hours)
      .attr('class', 'line')
      .attr('d', this.line)
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")

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
