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
  

  stations= [];
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
      .subscribe((data: []) => {
        console.log(data);
        this.stations = data;
        console.log("Stations: \n");
        console.log(this.stations);
        this.drawChart();
      });
  }

  drawChart() {
    for(var i = 0; i<this.stations.length;i++) {
      this.stackedChartData.push({"stationname" :this.stations[i].stationname,
        "availablebikes" : this.stations[i].availablebikes, "availabledocks":this.stations[i].availabledocks,
        "totaldocks":this.stations[i].totaldocks});
    }
    // console.log(this.stackedChartData);
    this.createChart();
  }
  
  private createChart(): void {
      console.log("Chart")
    console.log("Stations from create chart\n");
    console.log(this.stations);
    
    var svgWidth = 550, svgHeight = 300, barPadding = 0.1;
    var margin = { top: 50, right: 0, bottom: 60, left: 50 };
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
    .domain(this.stackedChartData.map(d => d.stationname.toString()))
    .rangeRound([0, contentWidth])
    .padding(barPadding);
    
    var yScale = d3.scaleLinear()
    .domain([0, d3.max(this.stackedChartData.map(d => +d.totaldocks))])
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

    g.selectAll(".text")
      .data(this.stackedChartData)
      .enter()
      .append("text")
      .attr('class', 'text')
      .attr("transform",
        "translate(" + (contentWidth/2) + " ," +
        (contentHeight + margin.top ) + ")")
      .style("text-anchor", "middle")
      .text("Addresses of Divvy Stations")

      g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 10)
      .attr("x",0 - (contentHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Max Total Docks");

    /*
    Create the bottom rectangle for available bikes
     */
    g.selectAll('.bar')
    .data(this.stackedChartData)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(d.stationname.toString()))
    .attr('y', d => yScale(+d.availablebikes ))
    .attr('width', xScale.bandwidth())
    .attr('height', d => contentHeight - yScale(+d.availablebikes))
    .attr('fill', fill_bars[1])
    
    g.selectAll(".text")
    .data(this.stackedChartData)
    .enter()
    .append("text")
    .attr('class', 'text')
    .text(d => +d.availablebikes)
    .attr('x', d => xScale(d.stationname.toString()) + 5)
    .attr('y', d => yScale(+d.availablebikes) + 17)
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
    .attr('x', d => xScale(d.stationname.toString()))
    .attr('y', d => yScale(d.totaldocks))
    .attr('width', xScale.bandwidth())
    .attr('height', d => contentHeight - yScale(+d.availabledocks))
    .attr('fill', fill_bars[0]);

    g.selectAll(".text2")
    .data(this.stackedChartData)
    .enter()
    .append("text")
    .attr('class', 'text2')
    .text(d => +d.availabledocks)
    .attr('x', d => xScale(d.stationname.toString())+5)
    .attr('y', d => yScale(d.totaldocks)+17)
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
     .attr("x", 440)
     .attr("y", 17)
     .attr("width", 18)
     .attr("height", 10)
     .style("fill", fill_bars[1])
    .attr("font-size", "10px");
     
     legend.append("text")
     .attr("class", "legendTxt")
     .style("font-size", "13px")
     .attr("x", 460)
     .attr("y", 17)
     .attr("dy", "10px")
     .style("text-anchor", "start")
     .text("Available Bikes")
     .attr("font-size", "10px");

     legend.append("rect")
     .attr("class", "legend")
     .attr("x", 440)
     .attr("y", 0)
     .attr("width", 18)
     .attr("height", 10)
     .style("fill", fill_bars[0]);
     
     legend.append("text")
     .attr("class", "legendTxt")
     .style("font-size", "13px")
     .attr("x", 460)
     .attr("y", 0)
     .attr("dy", "10px")
     .style("text-anchor", "start")
     .text("Available Docks");

    //  legend.append("text")
    //  .attr("class", "legendTxt")
    //  .style("font-size", "13px")
    //  .attr("x", 35)
    //  .attr("y", 37)
    //  .attr("dy", "10px")
    //  .style("text-anchor", "start")
    //  .text("Y-Axis: Total Docks");
    
    
  }
  
}
