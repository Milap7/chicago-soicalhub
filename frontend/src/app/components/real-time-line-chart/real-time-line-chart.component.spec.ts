import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { RealTimeLineChartComponent } from './real-time-line-chart.component';

describe('RealTimeLineChartComponent', () => {
  let component: RealTimeLineChartComponent;
  let fixture: ComponentFixture<RealTimeLineChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RealTimeLineChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RealTimeLineChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
