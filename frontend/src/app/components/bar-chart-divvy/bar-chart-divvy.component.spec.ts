import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BarChartDivvyComponent } from './bar-chart-divvy.component';

describe('BarChartDivvyComponent', () => {
  let component: BarChartDivvyComponent;
  let fixture: ComponentFixture<BarChartDivvyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BarChartDivvyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BarChartDivvyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
