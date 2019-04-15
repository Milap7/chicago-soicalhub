import { Component, ElementRef, Input, OnChanges, ViewChild, ViewEncapsulation, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { Station } from '../../station';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PlacesService } from 'src/app/places.service';
import { stackedChartData} from "../../stack-chart";

@Component({
  selector: 'app-stacked-bar-chart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './stacked-bar-chart.component.html',
  styleUrls: ['./stacked-bar-chart.component.css']
})

export class StackedBarChartComponent implements OnInit {
  @ViewChild('chart')
  private chartContainer: ElementRef;
  

  stations: Station[] = [];
  stackedChartData : stackedChartData[] = [];
  
  constructor(private placesService: PlacesService, private router: Router, private http: HttpClient) {

  }
  
  ngOnInit() {
    console.log("Create Chart");
    this.fetchStations();
  }
  
  ngOnChanges(): void {
    if (!this.stations) { return; }
  }
  fetchStations() {
    this.placesService
      .getStations()
      .subscribe((data: Station[]) => {
        this.stations = data;
        this.drawChart();
      });
  }

  drawChart() {
    for(var i = 0; i<this.stations.length;i++) {
      this.stackedChartData.push({"stationName" :this.stations[i].stationName,
        "availableBikes" : this.stations[i].availableBikes, "availableDocks":this.stations[i].availableDocks,
        "totalDocks":this.stations[i].totalDocks});
    }
    console.log(this.stackedChartData);
    this.createChart();
  }
  
  private createChart(): void {
      console.log("Chart")
    
    var svgWidth = 800, svgHeight = 300, barPadding = 0.1;
    var margin = { top: 50, right: 30, bottom: 50, left: 30 };
    var contentWidth = svgWidth - margin.left - margin.right;
    var contentHeight = svgHeight - margin.top - margin.bottom;
    
    var fill_bars = ["rgb(200,51,51)", "rgb(255,153,51)"]

    var textColor = 'white';
    
    d3.select('svg').remove()
    
    const element = this.chartContainer.nativeElement;
    var svg = d3.select(element).append('svg')
    .attr("width", svgWidth)
    .attr("height", svgHeight);
    
    var xScale = d3.scaleBand()
    .domain(this.stackedChartData.map(d => d.stationName.toString()))
    .rangeRound([0, contentWidth])
    .padding(barPadding);
    
    var yScale = d3.scaleLinear()
    .domain([0, d3.max(this.stackedChartData.map(d => +d.totalDocks))])
    .rangeRound([contentHeight,0]);
    
    const g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    
    g.append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', 'translate(0,' + contentHeight + ')')
    .call(d3.axisBottom(xScale));
    
    g.append('g')
    .attr('class', 'axis axis--y')
    .call(d3.axisLeft(yScale))
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '0.71em')
    .attr('text-anchor', 'end')

    /*
    Create the bottom rectangle for available bikes
     */
    g.selectAll('.bar')
    .data(this.stackedChartData)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(d.stationName.toString()))
    .attr('y', d => yScale(+d.availableBikes ))
    .attr('width', xScale.bandwidth())
    .attr('height', d => contentHeight - yScale(+d.availableBikes))
    .attr('fill', fill_bars[1])
    
    g.selectAll(".text")
    .data(this.stackedChartData)
    .enter()
    .append("text")
    .attr('class', 'text')
    .text(d => +d.availableBikes)
    .attr('x', d => xScale(d.stationName.toString()) + 5)
    .attr('y', d => yScale(+d.availableBikes) + 17)
    .attr("fill", textColor)
    .attr("font-size", "10px");

    /*
    Stack Available docks on top of Available Bikes
     */
    g.selectAll('.bar2')
    .data(this.stackedChartData)
    .enter()
    .append('rect')
    .attr('class', 'bar2')
    .attr('x', d => xScale(d.stationName.toString()))
    .attr('y', d => yScale(d.totalDocks))
    .attr('width', xScale.bandwidth())
    .attr('height', d => contentHeight - yScale(d.availableDocks))
    .attr('fill', fill_bars[0]);

    g.selectAll(".text2")
    .data(this.stackedChartData)
    .enter()
    .append("text")
    .attr('class', 'text2')
    .text(d => +d.availableDocks)
    .attr('x', d => xScale(d.stationName.toString())+5)
    .attr('y', d => yScale(d.totalDocks)+17)
    .attr("fill", textColor)
    .attr("font-size", "10px");

    var legend = svg.append('g')
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
     .style("fill", fill_bars[1])
    .attr("font-size", "10px");
     
     legend.append("text")
     .attr("class", "legendTxt")
     .style("font-size", "13px")
     .attr("x", 40)
     .attr("y", 5)
     .attr("dy", "10px")
     .style("text-anchor", "start")
     .text("Available Bikes")
     .attr("font-size", "10px");

     legend.append("rect")
     .attr("class", "legend")
     .attr("x", 20)
     .attr("y", 20)
     .attr("width", 18)
     .attr("height", 10)
     .style("fill", fill_bars[0]);
     
     legend.append("text")
     .attr("class", "legendTxt")
     .style("font-size", "13px")
     .attr("x", 40)
     .attr("y", 20)
     .attr("dy", "10px")
     .style("text-anchor", "start")
     .text("Available Docks");

    
    
  }
  
}
