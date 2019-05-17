import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { PlacesService } from 'src/app/places.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Place } from 'src/app/place';
import { Station } from 'src/app/station';
import * as d3 from 'd3';
var timer;

@Component({
  selector: 'app-bar-chart-divvy',
  templateUrl: './bar-chart-divvy.component.html',
  styleUrls: ['./bar-chart-divvy.component.css']
})
export class BarChartDivvyComponent implements OnInit {
  @ViewChild('chart_divvy')
  private chartContainer: ElementRef;
  constructor(private placesService: PlacesService, private router: Router, private http: HttpClient) { }
  docksArray = [];
  finalArray= [];
  places = [];
  // color = ['rgb(102,255,102)', 'rgb(255,102,102)']
  color = ['rgb(102,204,0)', 'rgb(251,51,51)']
  // final_color;

  ngOnInit() {
    // this.updateAlerts();
    this.fetchPlaces();
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
          this.createChart();
        });
    }
   
  }

  private createChart(): void {
    console.log("Chart")
  
  var svgWidth = 1200, svgHeight = 550, barPadding = 0.1;
  var margin = { top: 50, right: 30, bottom: 150, left: 100 };
  var contentWidth = svgWidth - margin.left - margin.right;
  var contentHeight = svgHeight - margin.top - margin.bottom;
  
  var fill_bars = ["rgb(0,102,204)"]

  var textColor = 'white';

  
  d3.select('svg').remove()
  
  const element = this.chartContainer.nativeElement;
  var svg = d3.select(element).append('svg')
  .attr("width", svgWidth)
  .attr("height", svgHeight);
  
  var xScale = d3.scaleBand()
  .domain(this.finalArray.map(d => d.stationname.toString()))
  .rangeRound([0, contentWidth])
  .padding(barPadding);
  
  var yScale = d3.scaleLinear()
  .domain([0, d3.max(this.finalArray.map(d => +d.totaldocks))])
  .rangeRound([contentHeight, 0]);
  
  const g = svg.append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  
  // g.append('g')
  // .attr('class', 'axis axis--x')
  // .attr('transform', 'translate(0,' + contentHeight + ')')
  // //.attr('transform', 'rotate(-0)')
  // .call(d3.axisBottom(xScale));
  
  // g.append('g')
  // .attr('class', 'axis axis--y')
  // .call(d3.axisLeft(yScale))
  // .append('text')
  // .attr('transform', 'rotate(-90)')
  // .attr('y', 6)
  // .attr('dy', '0.71em')
  // .attr('text-anchor', 'end')
  // .text('Rating');

  g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + contentHeight + ')')
      .text('Places')
      .call(d3.axisBottom(xScale))
      .selectAll("text")      
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-20)");
  g.append('g')
      .attr('class', 'y axis')
      .call(d3.axisLeft(yScale))
      .selectAll("text")      
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(0)");
  /*
  Bar for ratings
   */
  g.selectAll('.bar')
  .data(this.finalArray)
  .enter()
  .append('rect')
  .attr('class', 'bar')
  .attr('x', d => xScale(d.stationname.toString()))
  .attr('y', d => yScale(+d.totaldocks ))
  .attr('width', xScale.bandwidth())
  .attr('height', d => contentHeight - yScale(+d.totaldocks))
  .attr('fill', d => d.color)

  g.append("text")             
    .attr("transform",
          "translate(" + (contentWidth/2) + " ," + 
                         (contentHeight + margin.top + 70) + ")")
    .style("text-anchor", "middle")
    .text("Divvy Station Name");

    g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 20)
    .attr("x",0 - (contentHeight / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Max Total Docks");
  
    var legend = g.append('g')
    .attr("class", "legend1")
    .attr("x", 20)
    .attr("y",3)
    .attr("width", 18)
    .attr("height",10)

    legend.append("rect")
    .attr("class", "legend1")
    .attr("x", 330) //Change back to 360
    .attr("y", 433)
    .attr("width", 18)
    .attr("height", 10)
    .style("fill", 'rgb(251,51,51)')
    .attr("font-size", "10px");

  legend.append("text")
    .attr("class", "legendTxt")
    .style("font-size", "13px")
    .attr("x", 350) //Change back to 380
    .attr("y", 433)
    .attr("dy", "10px")
    .style("text-anchor", "start")
    .text("Divvy Docks More than 90% Full")
    .attr("font-size", "10px");

    legend.append("rect")
    .attr("class", "legend1")
    .attr("x", 580) //Change back to 360
    .attr("y", 433)
    .attr("width", 18)
    .attr("height", 10)
    .style("fill", 'rgb(102,204,0)')
    .attr("font-size", "10px");

  legend.append("text")
    .attr("class", "legendTxt")
    .style("font-size", "13px")
    .attr("x", 600) //Change back to 380
    .attr("y", 433)
    .attr("dy", "10px")
    .style("text-anchor", "start")
    .text("Divvy Docks Less than 90% Full")
    .attr("font-size", "10px");
}


}
