import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { MyKpiService } from './service/my-kpi.service';
import { CommonService } from '@app/shared/_services/common.service';

@Component({
  selector: 'app-my-kpi',
  templateUrl: './my-kpi.component.html',
  styleUrls: ['./my-kpi.component.scss']
})
export class MyKpiComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

  kpis: any = [];
  completion: any;
  colorSettings: any = [];
  
  constructor(private _myKpiService: MyKpiService, private _commonService: CommonService) { }

  ngOnInit(): void {
    this.getColorSettings();
    this.getMyKPIs();
  }

  // Get color settings
  getColorSettings() {
    this._myKpiService.getColorSettingByUser({ userId: this._commonService.getUserId() }).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.colorSettings = response;
        // this.colorSettings.settings = this.colorSettings.settings.sort((a: any, b: any) => a.min - b.min);
      }
    );
  }

  // Get MY-KPIs
  getMyKPIs() {
    this._myKpiService.getMyKPIs().pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        if (response) {
          response.forEach((element: any) => {
            const calc_percentage = isNaN((element.achieved_value / element.target?.[0].value) * 100) ? 0 : (120 / element.target?.[0].value) * 100;
            element.percentage = `${calc_percentage.toFixed()}%`;
            const color_per_calc = calc_percentage.toFixed()
            if (this.colorSettings.settings) {
              let colorSetting = this.colorSettings.settings.filter((item: any) => color_per_calc >= item.min && color_per_calc <= item.max);
              element.barColor = colorSetting ? colorSetting[0]?.color : 'black';
            }
            this.kpis.push(element);
          });
        }
      }
    )
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
