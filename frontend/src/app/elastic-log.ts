import DateTimeFormat = Intl.DateTimeFormat;

export interface StationLogElastic {
  timeCreated: Date;
  availableBikes: Number;
  availableDocks: Number;
  totalDocks: Number;

}