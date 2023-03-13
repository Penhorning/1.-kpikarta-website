import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonService } from '@app/shared/_services/common.service';
import { MyKpiService } from '../service/my-kpi.service';

@Component({
  selector: 'app-historical-view',
  templateUrl: './historical-view.component.html',
  styleUrls: ['./historical-view.component.scss']
})
export class HistoricalViewComponent implements OnInit {

  @Input() selectedKpis = [];
  @Output() hideHistoricalView: any= new EventEmitter();
  hideHistory() {
    this.hideHistoricalView.emit(false);
  }

  kpis: any = [];
  totalKPIs: number = 0;
  months: any = [];
  loading: boolean = true;
  loader: any = this._commonService.loader;
  noDataAvailable: any = this._commonService.noDataAvailable;
  // Pagination
  pageIndex: number = 0;
  pageSize: number = 10;
  length: number = 0;

  constructor(private _commonService: CommonService, private _myKpiService: MyKpiService) {
    this.months = this._commonService.monthsName;
  }

  ngOnInit(): void {
    this.getKPIsByYear(2023);
  }

  // Get kpis by year
  getKPIsByYear(year_number: number) {
    let data = {
      page: this.pageIndex + 1,
      limit: this.pageSize,
      contributorId: this._commonService.getUserId(),
      nodeIds: this.selectedKpis,
      year: year_number
    }
    this.kpis = [];
    this.loading = true;
    this._myKpiService.getKPIsByYear(data).subscribe(
      (response: any) => {
        this.kpis = Array.from(response.kpi_nodes[0].data);
        if (response.kpi_nodes[0].metadata.length > 0) {
          this.totalKPIs = response.kpi_nodes[0].metadata[0].total;
        } else this.totalKPIs = 0;
      }
    ).add(() => this.loading = false);
  }

  // Sort by year
  onSortByYear(e: any) {
    this.pageIndex = 0;
    this.getKPIsByYear(parseInt(e.target.value));
  }

}
