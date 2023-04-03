import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonService } from '@app/shared/_services/common.service';
import { MyKpiService } from '../service/my-kpi.service';
import { FormBuilder, Validators, FormArray } from '@angular/forms';

declare const $: any;


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
  selectedYear: number = new Date().getFullYear();
  months: any = [];
  years: any = [];
  loading: boolean = true;
  loader: any = this._commonService.loader;
  noDataAvailable: any = this._commonService.noDataAvailable;
  // Pagination
  pageIndex: number = 1;
  pageSize: number = 10;
  length: number = 0;

  // Edit history variable
  submitted: boolean = false;
  submittedMeasure: boolean = false;
  measureSubmitFlag: boolean = false;
  metricsSubmitFlag: boolean = false;
  editingKPI: any;
  editingNode: any;
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
    for (let i=0; i<5; i++) this.years.push(this.selectedYear-i);
  }

  ngOnInit(): void {
    this.getKPIsByYear(this.selectedYear);
    this.addMetricsData();
  }

  addMetricsData() {
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
      page: 1,
      limit: this.pageSize,
      contributorId: this._commonService.getUserId(),
      nodeIds: this.selectedKpis,
      year: year_number
    }
    
    this.kpis = [];
    this.loading = true;
    this.pageIndex = 1;

    this._myKpiService.getKPIsByYear(data).subscribe(
      (response: any) => {
        this.kpis = Array.from(response.kpi_nodes[0].data);
        if (response.kpi_nodes[0].metadata.length > 0) {
          this.totalKPIs = response.kpi_nodes[0].metadata[0].total;
        } else this.totalKPIs = 0;
      }
    ).add(() => this.loading = false);
  }

  // View more button
  viewMore() {
    let data = {
      page: ++this.pageIndex,
      limit: this.pageSize,
      contributorId: this._commonService.getUserId(),
      nodeIds: this.selectedKpis,
      year: this.selectedYear
    }
    this.loading = true;
    this._myKpiService.getKPIsByYear(data).subscribe(
      (response: any) => {
        this.kpis.push(...response.kpi_nodes[0].data);
        if (response.kpi_nodes[0].metadata.length > 0) {
          this.totalKPIs = response.kpi_nodes[0].metadata[0].total;
        } else this.totalKPIs = 0;
      }
    ).add(() => this.loading = false);
  }

  // Sort by year
  onSortByYear(e: any) {
    this.selectedYear = parseInt(e.target.value);
    this.getKPIsByYear(this.selectedYear);
  }

  // Click on history edit actual value 
  editHistoryActualValue(node: any, kpi: any, i: any,) {
  this.editingNode = node;
  this.editingKPI = kpi;
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

  onMeasureSubmit() {
    if (!this.measureForm.valid) {
      this.measureForm.markAllAsTouched();
      this.submittedMeasure = true;
      return;
    }

    // this.target.forEach((element: any) => {
    //   let percentage = (+this.measureForm.value.actualValue / element.value) * 100;
    //   return element.percentage = Math.round(percentage);
    // });
    const calculatePercentage = (actualValue: any, targetValue: any) => {
      let percentage = (+actualValue / targetValue) * 100;
      return Math.round(percentage);
    }

    this.editingNode.target.event_options.updated.target[0].percentage = calculatePercentage(this.measureForm.value.actualValue, this.editingNode.target.event_options.updated.target[0].value);

    this.measureSubmitFlag = true;
    let data = {
      event_options: {
        created: null,
        removed: null,
        updated: {}
      }
    }
    let value = [
      { "achieved_value": +this.measureForm.value.actualValue },
      { "target": this.editingNode.target.event_options.updated.target },
    ]
    let ids  = [this.editingNode.achieved.id, this.editingNode.target.id]

    for (let i=0; i<value.length; i++) {
      data["event_options"]["updated"] = value[i];
      this._myKpiService.updateKartaHistory(ids[i], data).subscribe(
        async (response: any) => {
          if (i === value.length-1) {
            if (response) { this._commonService.successToaster('Actual value updated successfully!'); }
            $('#editHistoryActualValueModal').modal('hide');
            this.getKPIsByYear(this.selectedYear);
            // Update data in real node
            let kpi_created_month = new Date(this.editingNode.achieved.createdAt).getMonth();
            let current_month = new Date().getMonth();
            if (kpi_created_month === current_month) {
              let data2 = {
                achieved_value: +this.measureForm.value.actualValue,
                target: this.editingNode.target.event_options.updated.target
              }
              await this._myKpiService.updateNode(this.editingKPI._id, data2).toPromise();
            }
          }
        },
        (err: any) => {
          console.log(err);
          this._commonService.errorToaster('Something went wrong!');
        }
      ).add(() => this.measureSubmitFlag = false);
    }
  }

  // On Metrics submit
  onMetricsSubmit() {
    if (!this.metricsForm.valid) {
      this.metricsForm.markAllAsTouched();
      this.submitted = true;
      return;
    }
    let tempObj: any = {};
    let originalValue = this.metricsForm.value.formula.trim();
    let newValue: any = '';
    let value = this.metricsForm.value.formula.trim().split(/[\s() */%+-]+/g);

    let total: any = 0;
    let checkFrag = false;

    this.fields.controls.forEach((x: any) => {
      tempObj[x['controls']['fieldName'].value] = x['controls']['fieldValue'].value;
    });

    value.forEach((y: any) => {
      if (y && !parseInt(y)) {
        if (tempObj[y] || tempObj[y] == 0) {
          newValue = newValue
            ? newValue.replace(y, tempObj[y])
            : originalValue.replace(y, tempObj[y]);
        } else {
          checkFrag = true;
        }
      }
    });

    if (checkFrag) {
      this._commonService.errorToaster('Something went wrong!');
      this.metricsForm.patchValue({ calculatedValue: 0 }); return;
    } else {
      newValue = eval(newValue);
      if (!isFinite(newValue)) {
        this._commonService.errorToaster(`Infinite value cannot be accepted..!!`);
        return;
      }
      let newV = newValue.toString().split('.');
      if (parseInt(newV[1]) > 0) newValue = Number(newValue).toFixed(2);
      else newValue = newV[0];
      total = newValue;
      if (total >= 0) {
        this.metricsForm.patchValue({ calculatedValue: total });

        let request = {
          ...this.metricsForm.value,
          metrics: true
        };
        delete request['calculatedValue'];
        this.target.forEach((element: any) => {
          let percentage = (+this.metricsForm.value.calculatedValue / element.value) * 100;
          return element.percentage = Math.round(percentage);
        });
        this.metricsSubmitFlag = true;

        const calculatePercentage = (actualValue: any, targetValue: any) => {
          let percentage = (+actualValue / targetValue) * 100;
          return Math.round(percentage);
        }
    
        this.editingNode.target.event_options.updated.target[0].percentage = calculatePercentage(this.metricsForm.value.calculatedValue, this.editingNode.target.event_options.updated.target[0].value);

        let data = {
          event_options: {
            created: null,
            removed: null,
            updated: {}
          }
        }
        this.metricsForm.value.fields.map((item: any) => {
          item.fieldValue = Number(item.fieldValue);
          return item;
        });
        let value = [
          { "achieved_value": +this.metricsForm.value.calculatedValue },
          { "target": this.editingNode.target.event_options.updated.target },
          { "node_formula": {
              "fields": this.metricsForm.value.fields,
              "formula": this.editingNode.formula.event_options.updated.node_formula.formula
            }
          }
        ]
        let ids  = [this.editingNode.achieved.id, this.editingNode.target.id, this.editingNode.formula.id]
    
        for (let i=0; i<value.length; i++) {
          data["event_options"]["updated"] = value[i];
          this._myKpiService.updateKartaHistory(ids[i], data).subscribe(
            async (response) => {
              if (i === value.length-1) {
                if (response) { this._commonService.successToaster('Actual value updated successfully!'); }
                $('#editHistoryActualValueModal').modal('hide');
                this.getKPIsByYear(this.selectedYear);
                
                // Update data in real node
                let kpi_created_month = new Date(this.editingNode.achieved.createdAt).getMonth();
                let current_month = new Date().getMonth();
                if (kpi_created_month === current_month) {
                  let data2 = {
                    achieved_value: +this.metricsForm.value.calculatedValue,
                    target: this.editingNode.target.event_options.updated.target,
                    node_formula: {
                      "fields": this.metricsForm.value.fields,
                      "formula": this.editingNode.formula.event_options.updated.node_formula.formula
                    }
                  }
                  await this._myKpiService.updateNode(this.editingKPI._id, data2).toPromise();
                }
              }
            },
            (err) => {
              console.log(err); this._commonService.errorToaster('Something went wrong!');
            }
          ).add(() => this.metricsSubmitFlag = false);
        }
      } else this._commonService.errorToaster(`Achieved value can't be a negative value..!! (${total})`);
    }
  }

}
