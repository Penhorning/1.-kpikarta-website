import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonService } from '@app/shared/_services/common.service';
import { MyKpiService } from '../service/my-kpi.service';
import { FormBuilder, Validators, FormArray } from '@angular/forms';


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

  // Edit history variable
  submitted: boolean = false;
  submittedMeasure: boolean = false;
  measureSubmitFlag: boolean = false;
  metricsSubmitFlag: boolean = false;
  editingKarta: any;
  metricFlag = false;
  metricsData: any = [];
  currentNode: any;
  kartaName: any;
  target: any = [
    { frequency: "", value: 0, percentage: 0 }
  ]
  metricsFormula: any;
  acheivedValueMetrics: any;
  metricsForm = this.fb.group({
    fields: this.fb.array([]),
    formula: [''],
    calculatedValue: [0]
  });
  measureForm = this.fb.group({
    actualValue: [0, [Validators.required, Validators.pattern('^[0-9]*$')]]
  });

  constructor(private _commonService: CommonService, private _myKpiService: MyKpiService, private fb: FormBuilder) {
    this.months = this._commonService.monthsName;
  }

  ngOnInit(): void {
    this.getKPIsByYear(2023);
    this.addMetricsData();
  }

  addMetricsData() {
    console.log("this.metricsData",this.metricsData)
    if (this.metricsData?.fields) {
      this.metricsData?.fields.forEach((element: any) => {
        const metricsForm = this.fb.group({
          fieldValue: [element?.fieldValue, [Validators.required, Validators.pattern('^[0-9]*$')]],
          fieldName: [element?.fieldName]
        });
        this.fields.push(metricsForm);
      });
    } else {
      this.fields.removeAt(0);
    }
  }
  // Formula of metrics starts
  get fields() {
    return this.metricsForm.controls["fields"] as FormArray;
  }
  get form() { return this.measureForm.controls }

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

  // Click on history edit actual value 
  editHistoryActualValue(node: any, kpi: any, i: any,){
  console.log("kpi", kpi)
  this.editingKarta = kpi;
  this.metricFlag = false;
  this.metricsData = node?.formula?.event_options?.updated?.node_formula;
  this.metricsFormula = node?.formula?.event_options?.updated?.node_formula?.formula;
  this.acheivedValueMetrics = node.achieved?.event_options?.updated?.achieved_value;
  this.metricsForm.reset();
    this.measureForm.reset();
    this.fields.clear();
    if (node.formula) {
      this.metricFlag = true;
      this.metricsForm.patchValue({
        calculatedValue: node.formula?.event_options?.updated?.node_formula.calculated_value ? node.formula?.event_options?.updated?.node_formula.calculated_value : 0,
        achieved_value: node.achieved?.event_options?.updated?.achieved_value ? node.achieved?.event_options?.updated?.achieved_value : 0,
        formula: node?.formula?.event_options?.updated?.node_formula?.formula ? node?.formula?.event_options?.updated?.node_formula?.formula : ''
      });
    } else {
      this.metricFlag = false;
      this.measureForm.patchValue({
        actualValue: node.achieved?.event_options?.updated?.achieved_value
      });
    }
    this.addMetricsData();
  }

  onMeasureSubmit() {}
  onMetricsSubmit() {}

}
