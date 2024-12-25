import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  public static deployment_runtime_data: any = {};
  public static config_runtime_data: any = {};

  public eventEmitter:EventEmitter<string> = new EventEmitter();
  public sysHiddenFlag:BehaviorSubject<boolean> = new BehaviorSubject(false);
  public applicationEvent:BehaviorSubject<string> = new BehaviorSubject<string>("");
  

  constructor() { }
}
