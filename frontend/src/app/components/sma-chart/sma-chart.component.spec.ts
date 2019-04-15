import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmaChartComponent } from './sma-chart.component';

describe('SmaChartComponent', () => {
  let component: SmaChartComponent;
  let fixture: ComponentFixture<SmaChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmaChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmaChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
