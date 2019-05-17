import { Component, ElementRef, Input, OnChanges, ViewChild, ViewEncapsulation, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { ChartData } from '../../chart-data';
import { Place} from '../../place';
import { PlacesService } from '../../places.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-bar-chart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})

export class BarChartComponent implements OnInit {
  @ViewChild('chart')
  private chartContainer: ElementRef;
  places: Place[]=[];


  barChartData: ChartData[] = [];
  public showChart: boolean = false;
  
  constructor(private placesService: PlacesService, private router: Router, private http: HttpClient) {

  }
  
  ngOnInit() {
    console.log("Create Chart");
    this.fetchPlaces();
  }
  
  ngOnChanges(): void {
    if (!this.barChartData) { return; }
    //this.createChart();
  }


  fetchPlaces() {
    this.placesService
      .getPlaces()
      .subscribe((data: Place[]) => {
        this.places= data;
        // this.barChartDataName = data[0].name;
        // console .log (this.places)
        // console.log(this.places[0].name);
        // this.createChart();
        this.drawChart();
      });

  }

  drawChart() {
    for(var i = 0; i<this.places.length;i++) {
      this.barChartData.push({"rating" :this.places[i].rating, "name" : this.places[i].name, "address1":this.places[i].address1, "reviewCount" : this.places[i].review_count});
      // console.log(this.barChartData[i]);
    }
    this.showChart = true;
    console.log(this.barChartData);
    this.createChart();
  }
  
  
  private createChart(): void {
      console.log("Chart")
    
    var svgWidth = 1200, svgHeight = 450, barPadding = 0.1;
    var margin = { top: 50, right: 30, bottom: 130, left: 100 };
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
    .domain(this.barChartData.map(d => d.name.toString()))
    .rangeRound([0, contentWidth])
    .padding(barPadding);
    
    var yScale = d3.scaleLinear()
    .domain([0, d3.max(this.barChartData.map(d => +d.reviewCount))])
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
        .attr("transform", "rotate(-25)");
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
    .data(this.barChartData)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(d.name.toString()))
    .attr('y', d => yScale(+d.reviewCount ))
    .attr('width', xScale.bandwidth())
    .attr('height', d => contentHeight - yScale(+d.reviewCount))
    .attr('fill', fill_bars[0])

    g.append("text")             
      .attr("transform",
            "translate(" + (contentWidth/2) + " ," + 
                           (contentHeight + margin.top + 75) + ")")
      .style("text-anchor", "middle")
      .text("Restaurant Name");

      g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 20)
      .attr("x",0 - (contentHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Restaurant Review Count");
    
    // g.selectAll(".text")
    // .data(this.barChartData)
    // .enter()
    // .append("text")
    // .attr('class', 'text')
    // .text(d =>  " " + d.name.toString())
    // // .attr('x', d => xScale(d.address1.toString()) + 5)
    // // .attr('y', d => yScale(+d.rating) + 17)
    // .attr("fill", textColor)
    // .attr("font-size", "6px");
  }
  
}
