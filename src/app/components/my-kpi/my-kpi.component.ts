import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MyKpiService } from './service/my-kpi.service';
import { CommonService } from '@app/shared/_services/common.service';
import * as moment from 'moment';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { ExportToCsv } from 'export-to-csv';
import * as XLSX from 'xlsx'

type AOA = Array<Array<any>>;
declare const $: any;

@Component({
  selector: 'app-my-kpi',
  templateUrl: './my-kpi.component.html',
  styleUrls: ['./my-kpi.component.scss'],
})
export class MyKpiComponent implements OnInit {

  karta: any = [];
  kpis: any = [];
  exportKpis: any = [];
  totalAssignedKPIs: number = 0;
  colorSettings: any = [];
  creators: any = [];
  loading: boolean = true;
  loader: any = this._commonService.loader;
  noDataAvailable: any = this._commonService.noDataAvailable;
  currentNode: any;
  // Pagination
  pageIndex: number = 0;
  pageSize: number = 10;
  length: number = 0;
  lastEditSelectedDates: any;
  dateRequiredSelectedDates: any;
  dueDateSelectedDates: any;
  startDate: any = "";
  endDate: any = "";
  startDueDate: any = "";
  endDueDate: any = "";
  statusType: any = "";
  // KPI statistics
  stats: any;
  showStats: boolean = true;
  search_text: string = "";
  maxDate: Date;
  kpiType: string = 'assigned'
  selectedSortBy: any;
  isHidden: boolean = false;
  isEditIconHidden: boolean = false;
  searchText = "";
  kartaCreatorIds: any = [];
  rowClicked: any;
  // import export
  tableData: any;
  isTableDataWrong: boolean = false;
  importedNodeIds: any  = [];
  tableTitle: any = [];
  tableHeader: any = [];
  customPagination = 1;
  recordsPerPage = 10;
  tableRecords = [];
  pageStartCount = 0;
  pageEndCount = 10;
  totalPageCount = 0;
  currentPage = 0;
  tableDatavalidation = [];
  validationtitleHead: any;
  importNodeIds: any = [];
  importSubmitFlag: boolean = false;
  nodes: any = []
  openState: boolean = false;
  wsname: any;
  // Audit Trail
  auditingNode: any;
  auditPageIndex: number = 0;
  auditPageSize: number = 10;
  totalAudits: number = 0;
  auditHistories: any = [];
  auditLoading: boolean = false;
  // Target filter
  target: any = [
    { frequency: "", value: 0, percentage: 0 }
  ]
  importTarget: any = [
    { frequency: "", value: 0, percentage: 0 }
  ]
  selectedTargetTypes: any = [];
  targetTypesList = [
    { name: 'Monthly', value: 'monthly', selected: false },
    { name: 'Quarterly', value: 'quarterly', selected: false },
    { name: 'Yearly', value: 'yearly', selected: false }
  ];
  // Sort by month
  sortByMonths = this._commonService.monthsName;
  sortMonth: string = "";
  currentYear: any = moment().year();
  // KPI Historical
  isHistoricalView: boolean = false;
  masterCheck: boolean = false;
  selectedHistoryKpis = new Set();
  historyKpis: any = [];
  // Sort by
  sortBy: any;
  sortByList = [
    { id: 0, name: 'Worst to Best Performing', value: 'worst', selected: false },
    { id: 1, name: 'Best to Worst Performing', value: 'best', selected: false },
    { id: 2, name: 'Oldest to Newest', value: 'oldest', selected: false },
    { id: 3, name: 'Newest to Oldest', value: 'newest', selected: false }
  ];
  // Percentage filter
  selectedPercentage: any = [];
  percentageList = [
    { name: '0 to 30%', value: { "min": 0, "max": 30 }, selected: false },
    { name: '31 to 50%', value: { "min": 31, "max": 50 }, selected: false },
    { name: '51 to 70%', value: { "min": 51, "max": 70 }, selected: false },
    { name: '71 to 100%', value: { "min": 71, "max": 100 }, selected: false },
    { name: '101 to Above', value: { "min": 101, "max": 999999999 }, selected: false }
  ];
  // Header list
  headerList = [
    { name: 'Karta', sortBy: 'name', sort: '', filter: true },
    { name: 'KPI', sortBy: 'name', sort: '' },
    { name: 'Target', sortBy: 'value', sort: '', filter: true },
    { name: 'Actual', sortBy: 'achieved_value', sort: '' },
    { name: 'Last Edited', sortBy: 'updatedAt', sort: '', filter: true },
    { name: 'Due Date', sortBy: 'due_date', sort: '', filter: true },
    { name: 'Status', sortBy: 'dueDays', sort: '' },
    { name: 'Completion', sortBy: 'percentage', sort: '', filter: true }
  ];
  headerList2 = [
    { name: 'Karta', sortBy: 'name', sort: '', filter: true },
    { name: 'KPI', sortBy: 'name', sort: '' },
    { name: 'Target', sortBy: 'value', sort: '', filter: true },
    { name: 'Actual', sortBy: 'achieved_value', sort: '' },
    { name: 'KPI Owner', sortBy: 'fullName', sort: '' },
    { name: 'Last Edited', sortBy: 'updatedAt', sort: '', filter: true },
    { name: 'Due Date', sortBy: 'due_date', sort: '', filter: true },
    { name: 'Status', sortBy: 'dueDays', sort: '' },
    { name: 'Completion', sortBy: 'percentage', sort: '', filter: true }
  ];
  // Sort var
  sortDir = 1;
  sortOrder: string = 'asc';
  arrow_icon: boolean = true;
  currentNodeWeight: number = 0;
  // Achieved value pop up value
  pastMonths: any = [];
  metricsData: any = [];
  submitted: boolean = false;
  submittedMeasure: boolean = false;
  measureSubmitFlag: boolean = false;
  metricsSubmitFlag: boolean = false;
  metricFlag = false;
  kartaName: any;
  editingNode: any;
  index: any;
  metricsFormula: any;
  acheivedValueMetrics: any;

  metricsForm = this.fb.group({
    fields: this.fb.array([]),
    formula: [''],
    calculatedValue: [0],
    pastMonth: []
  });

  measureForm = this.fb.group({
    actualValue: [0, [Validators.required, Validators.pattern('^[+-]?(([1-9][0-9]*)?[0-9](\.[0-9]*)?|\.[0-9]+)$')]],
    pastMonth: []
  });

  @ViewChild('fileUploader')
  fileUploader!: ElementRef;
  
  constructor(private _myKpiService: MyKpiService, public _commonService: CommonService, private fb: FormBuilder) { }

  ngOnInit(): void {
    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    });
    this.getColorSettings();
    this.getCreators();
    if (this._commonService.getUserLicense() !== "Spectator" && this._commonService.getUserRole() !== "billing_staff") {
      this.getKpiStats();
      this.addMetricsData();
    } else {
      setTimeout(() => {
        this.clickTab2();
      }, 100);
    }
  }

  // Tab 2 clicked
  clickTab2() {
    $("#kpi_tab_2").click();
    $("#kpi_tab_2 a").click();
  }

  // Formula of metrics starts
  get fields() {
    return this.metricsForm.controls["fields"] as FormArray;
  }
  get form() { return this.measureForm.controls }

  addMetricsData() {
    if (this.metricsData?.fields) {
      this.metricsData?.fields.forEach((element: any) => {
        const metricsForm = this.fb.group({
          fieldValue: [element?.fieldValue, [Validators.required, Validators.pattern('^[+-]?(([1-9][0-9]*)?[0-9](\.[0-9]*)?|\.[0-9]+)$')]],
          fieldName: [element?.fieldName]
        });
        this.fields.push(metricsForm);
      });
    } else {
      this.fields.removeAt(0);
    }
  }

  // On Submit edit pop up
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
      if(!isFinite(newValue)) {
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
        delete request['pastMonth'];
        this.target.forEach((element: any) => {
          let percentage = (+this.metricsForm.value.calculatedValue / element.value) * 100;
          return element.percentage = Math.round(percentage);
        });
        this.metricsSubmitFlag = true;

        this.metricsForm.value.fields.map((item: any) => {
          item.fieldValue = Number(item.fieldValue);
          return item;
        });

        let data = {
          node_formula: request,
          achieved_value: +this.metricsForm.value.calculatedValue,
          target: this.target
        }

        // Send completed_date if achieved
        if (this.target[0].percentage >= 100) data["completed_date"] = new Date();
        // Send pastMonth if user wants to change the value for past
        if (this.metricsForm.value.pastMonth < moment().month()) data["pastMonth"] = this.metricsForm.value.pastMonth;
        
        this._myKpiService.updateNode(this.currentNode, data).subscribe(
          (response) => {
            if (response) this._commonService.successToaster('Actual value updated successfully!');
            $('#editActualValueModal').modal('hide');
            this.pageIndex = 0;
            this.getMyKPIsList();

            // Create history
            // Update achieved_value, node_formula and target
            if (this.metricsForm.value.pastMonth == moment().month()) {
              let randomKey = new Date().getTime().toString();
              let updatingParameters = [
                { key: 'node_formula', value: request, node_updated: 'node_updated', old_value: this.editingNode.node_formula },
                { key: 'achieved_value', value: Number(total), node_updated: 'node_updated', old_value: this.editingNode.achieved_value },
                { key: 'target', value: this.target, node_updated: 'node_updated', old_value: this.editingNode.target }
              ];
              for (let param of updatingParameters) {
                let history_data = {
                  event: param.node_updated,
                  eventValue: {
                    [param.key]: param.value
                  },
                  oldValue: {
                    [param.key]: param.old_value
                  },
                  kartaNodeId: this.editingNode._id,
                  userId: this._commonService.getUserId(),
                  versionId: this.editingNode.karta.versionId,
                  kartaId: this.editingNode.karta._id,
                  parentNodeId: this.editingNode.parentId || "None",
                  historyType: 'main',
                  randomKey
                }
                this._myKpiService.createKartaHistory(history_data).subscribe(() => {});
              }
            }
            // Create log for achieved value
            const log_data = {
              event: "node_updated",
              event_options: {
                achieved_value: Number(total)
              },
              kartaNodeId: this.editingNode._id,
              userId: this._commonService.getUserId(),
              versionId: this.editingNode.karta.versionId,
              kartaId: this.editingNode.karta._id,
              duration: new Date().toLocaleString('default', { month: 'long' })
            }
            if (this.metricsForm.value.pastMonth < moment().month()) {
              log_data.duration = moment().month(this.metricsForm.value.pastMonth).format('MMMM');
            }
            this._myKpiService.createKartaLog(log_data).subscribe();
          },
          (err) => {
            console.log(err); this._commonService.errorToaster('Something went wrong!');
          }
        ).add(() => this.metricsSubmitFlag = false);
      } else this._commonService.errorToaster(`Achieved value can't be a negative value..!! (${total})`);
    }
  }

  onMeasureSubmit() {
    if (!this.measureForm.valid) {
      this.measureForm.markAllAsTouched();
      this.submittedMeasure = true;
      return;
    }

    this.target.forEach((element: any) => {
      let percentage = (+this.measureForm.value.actualValue / element.value) * 100;
      return element.percentage = Math.round(percentage);
    });

    this.measureSubmitFlag = true;

    let data = {
      achieved_value: +this.measureForm.value.actualValue,
      target: this.target,
      is_achieved_modified: true
    }
    // Send completed_date if achieved
    if (this.target[0].percentage >= 100) data["completed_date"] = new Date();
    // Send pastMonth if user wants to change the value for past
    if (this.measureForm.value.pastMonth < moment().month()) data["pastMonth"] = this.measureForm.value.pastMonth;
    this._myKpiService.updateNode(this.currentNode, data).subscribe(
      (response) => {
        if (response) { this._commonService.successToaster('Actual value updated successfully!'); }
        $('#editActualValueModal').modal('hide');
        this.pageIndex = 0;
        this.getMyKPIsList();

        // Create history
        // Update achieved_value and target
        if (this.measureForm.value.pastMonth == moment().month()) {
          let randomKey = new Date().getTime();
          let updatingParameters = [
            { key: 'achieved_value', value: data.achieved_value, node_updated: 'node_updated', old_value: this.editingNode.achieved_value },
            { key: 'target', value: this.target, node_updated: 'node_updated', old_value: this.editingNode.target }
          ];
          for (let param of updatingParameters) {
            let history_data = {
              event: param.node_updated,
              eventValue: {
                [param.key]: param.value
              },
              oldValue: {
                [param.key]: param.old_value
              },
              kartaNodeId: this.editingNode._id,
              userId: this._commonService.getUserId(),
              versionId: this.editingNode.karta.versionId,
              kartaId: this.editingNode.karta._id,
              parentNodeId: this.editingNode.parentId || "None",
              historyType: 'main',
              randomKey: randomKey.toString()
            }
            this._myKpiService.createKartaHistory(history_data).subscribe(() => {});
          }
        }
        // Create log for achieved value
        const log_data = {
          event: "node_updated",
          event_options: {
            achieved_value: data.achieved_value
          },
          kartaNodeId: this.editingNode._id,
          userId: this._commonService.getUserId(),
          versionId: this.editingNode.karta.versionId,
          kartaId: this.editingNode.karta._id,
          duration: new Date().toLocaleString('default', { month: 'long' })
        }
        if (this.measureForm.value.pastMonth < moment().month()) {
          log_data.duration = moment().month(this.measureForm.value.pastMonth).format('MMMM');
        }
        this._myKpiService.createKartaLog(log_data).subscribe();
      },
      (err) => {
        console.log(err); this._commonService.errorToaster('Something went wrong!');
      }
    ).add(() => this.measureSubmitFlag = false);
    return;
  }
  // Formula of metrics ends

  // Get color settings
  getColorSettings() {
    this._myKpiService.getColorSettings({ userId: this._commonService.getUserId() }).subscribe(
      (response: any) => {
        this.colorSettings = response.color_settings;
        this.colorSettings.settings = this.colorSettings.settings.sort((a: any, b: any) => a.min - b.min);
        this.getMyKPIsList();
      },
      (error: any) => {
        this.loading = false
      }
    );
  }

  // Get my kpis
  getMyKPIsList() {
    let data = {
      page: this.pageIndex + 1,
      limit: this.pageSize,
      userId: this._commonService.getUserId(),
      searchQuery: this.search_text,
      startUpdatedDate: this.startDate,
      endUpdatedDate: this.endDate,
      targetTypes: this.selectedTargetTypes,
      kpiType: this.kpiType,
      sortBy: this.sortBy,
      percentage: this.selectedPercentage,
      startDueDate: this.startDueDate,
      endDueDate: this.endDueDate,
      kartaCreatorIds: this.kartaCreatorIds,
      statusType: this.statusType
    }
    this.kpis = [];
    this.loading = true;
    this.sortMonth = "";
    this.isHistoricalView = false;
    this._myKpiService.getMyKPIs(data).subscribe(
      (response: any) => {
        this.getKpiStats();
        this.kpis = Array.from(response.kpi_nodes[0].data);
       
        this.exportKpis = Array.from(response.kpi_nodes[0].data);
        this.kpis = this.kpis.map((item: any) => {
          item.isSelected = false;
          if ((item.target[0].value <= item.achieved_value) && item.start_date) {
            item.dueDays = this.calculateDueDays(item.completed_date, item.due_date, 'completed');
          } else if ((item.target[0].value > item.achieved_value) && item.start_date) {
            item.dueDays = this.calculateDueDays(item.start_date, item.due_date);
          } else item.dueDays = 0;
          return item;
        });
        if (response.kpi_nodes[0].metadata.length > 0) {
          this.totalAssignedKPIs = response.kpi_nodes[0].metadata[0].total;
        } else this.totalAssignedKPIs = 0;
      }
    ).add(() => this.loading = false);
  }

  // Check/Uncheck all items
  checkUncheckAll(e: any) {
    for (let kpi of this.kpis) {
      kpi.isSelected = e.target.checked;
      if (e.target.checked) this.selectedHistoryKpis.add(kpi._id);
      else this.selectedHistoryKpis.clear();
    }
  }
  // Check/Uncheck single item
  checkUncheckSingleItem(e: any, index: number, id: string) {
    if (e.target.checked) {
      this.selectedHistoryKpis.add(id);
      this.kpis[index].isSelected = true;
      this.masterCheck = this.kpis.every((item: any) => item.isSelected == true);
    }
    else {
      this.selectedHistoryKpis.delete(id);
      this.kpis[index].isSelected = false;
      this.masterCheck = false;
    }
  }
  // Show history
  showHistory() {
    this.isHistoricalView = true;
    if (this.selectedHistoryKpis.size > 0) this.historyKpis = Array.from(this.selectedHistoryKpis);
    else for (let kpi of this.kpis) this.historyKpis.push(kpi._id);
  }
  // Hide history
  hideHistory() {
    this.isHistoricalView = false;
    this.masterCheck = false;
    this.historyKpis = [];
    this.selectedHistoryKpis.clear();
    this.pageIndex = 0;
    this.getMyKPIsList();
  }

  // Get color for each node percentage
  getNodePercentageColor(percentage: number) {
    percentage = +percentage;
    if (percentage <= 100) {
      let colorSetting = this.colorSettings.settings.filter((item: any) =>
        percentage >= item.min && percentage <= item.max);
      return colorSetting ? colorSetting[0]?.color : 'black';
    } else return this.colorSettings.settings[this.colorSettings.settings.length - 1]?.color || 'black';
  }

  // Calculate days based on due date
  calculateDueDays(start_date: string, due_date: string, type?: string) {
    if (start_date && !type) return moment(due_date).diff(moment(), 'days');
    else if (start_date && type === "completed") return moment(due_date).diff(moment(start_date), 'days');
    return 0;
  }

  // Search
  timeout = null;
  search() {
    if (this.timeout) {  
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.pageIndex = 0;
      this.getMyKPIsList();
    }, 1000);
  }
  clearSearch() {
    this.search_text = "";
    this.pageIndex = 0;
    this.getMyKPIsList();
  }

  // On last edit date change
  onDateChange(e: any) {
    if (e[0] && e[1]) {
      this.startDate = moment(e[0]).startOf("day");
      this.endDate = moment(e[1]).endOf("day");
      this.startDueDate = "",
      this.endDueDate = "",
      this.pageIndex = 0;
      this.getMyKPIsList();
    }
  }

  // On due date change
  onDueDateChange(e: any) {
    if (e[0] && e[1]) {
      this.startDueDate = moment(e[0]).startOf("day");
      this.endDueDate = moment(e[1]).endOf("day");
      this.startDate = "";
      this.endDate = "";
      this.pageIndex = 0;
      this.getMyKPIsList();
    }
  }

  // Reset dates
  resetDates() {
    this.lastEditSelectedDates = "";
    this.dateRequiredSelectedDates = "";
    this.dueDateSelectedDates = "";
    this.startDate = "";
    this.endDate = "";
    this.startDueDate = "";
    this.endDueDate = "";
    this.pageIndex = 0;
    this.getMyKPIsList();
  }

  // On click geting data of acheived value
  editActualValue(node: any) {
    this.editingNode = node;
    this.metricFlag = false;
    this.metricsData = node.node_formula;
    this.currentNode = node._id;
    this.kartaName = node.karta.name;
    this.target = node.target
    this.metricsFormula = node?.node_formula?.formula;
    this.acheivedValueMetrics = node.achieved_value;
    this.metricsForm.reset();
    this.measureForm.reset();
    this.fields.clear();
    // Show months till current month only
    let months = [];
    let startsFrom = 0;
    const currentMonth = moment().month() + 1;
    const currentYear = moment().year();
    const nodeCreatedYear = moment(node.createdAt).year();
    if (nodeCreatedYear == currentYear) startsFrom = moment(node.createdAt).month();
    for (let i=startsFrom; i<currentMonth; i++) {
      months.push(this._commonService.monthsName[i]);
    }
    this.pastMonths = months;
    // Prepare form value according to measure or metrics
    if (node.node_type === "metrics") {
      this.metricFlag = true;
      this.metricsForm.patchValue({
        calculatedValue: node.node_formula.calculated_value ? node.node_formula.calculated_value : 0,
        achieved_value: node.achieved_value ? node.achieved_value : 0,
        formula: node.node_formula.formula ? node.node_formula.formula : '',
        pastMonth: currentMonth -1
      });
    } else {
      this.metricFlag = false;
      this.measureForm.patchValue({
        actualValue: node.achieved_value,
        pastMonth: currentMonth -1
      });
    }
    this.addMetricsData();
  }

  // Get kpis by month
  getKPIsByMonth(month_number: string) {
    let data = {
      page: this.pageIndex + 1,
      limit: this.pageSize,
      contributorId: this._commonService.getUserId(),
      month: parseInt(month_number)
    }
    this.kpis = [];
    this.loading = true;
    this._myKpiService.getKPIsByMonth(data).subscribe(
      (response: any) => {
        this.kpis = Array.from(response.kpi_nodes[0].data);
        if (response.kpi_nodes[0].metadata.length > 0) {
          response.kpi_nodes[0].data = response.kpi_nodes[0].data.map((item: any) => {
            item.isSelected = false;
            if ((item.target[0].value <= item.achieved_value) && item.start_date) {
              item.dueDays = this.calculateDueDays(item.completed_date, item.due_date, 'completed');
            } else if ((item.target[0].value > item.achieved_value) && item.start_date) {
              item.dueDays = this.calculateDueDays(item.start_date, item.due_date);
            } else item.dueDays = 0;
            return item;
          });
          this.kpis = response.kpi_nodes[0].data;
          this.totalAssignedKPIs = response.kpi_nodes[0].metadata[0].total;
        } else this.totalAssignedKPIs = 0;
      }
    ).add(() => this.loading = false);
  }
  // Sort by month
  onSortByMonth() {
    this.pageIndex = 0;
    if (this.sortMonth) {
      this.getKPIsByMonth(this.sortMonth);
    }
    else this.getMyKPIsList();
  }

  // Sort by
  onSortBy(item: any) {
    this.sortBy = item;
    this.pageIndex = 0;
    this.getMyKPIsList();
  }

  // Target type select check uncheck
  onTargetSelect(e: any, item: any) {
    if (e.target.checked) { this.selectedTargetTypes.push(item) }
    else {
      const index = this.selectedTargetTypes.indexOf(item);
      this.selectedTargetTypes.splice(index, 1);
    }
    this.pageIndex = 0;
    this.getMyKPIsList()
  }

  // Percent select dropdown 
  onPercentSelect(e: any, item: any) {
    if (e.target.checked) this.selectedPercentage.push(item);
    else {
      const index = this.selectedPercentage.indexOf(item);
      this.selectedPercentage.splice(index, 1);
    }
    this.pageIndex = 0;
    this.getMyKPIsList();
  }

  // Tab switching
  onTabSwitch(type: string) {
    type === "assigned" ? this.showStats = true : this.showStats = false;
    this.statusType = '';
    this.kpiType = type;

    // Reset creators
    this.kartaCreatorIds = [];
    $(".kpi_creator_checkbox").prop('checked', false);

    this.selectedTargetTypes = [];
    this.targetTypesList.map((item: any) => {
      item.selected = false;
      return item;
    });
    this.pageIndex = 0;
    this.getMyKPIsList();
  }

  // Get kpi stats
  getKpiStats() {
    this._myKpiService.getKpiStats({ userId: this._commonService.getUserId() }).subscribe(
      (response: any) => {
        if (response.kpi_stats) {
          this.stats = { ...response.kpi_stats };
        }
      }
    );
  }

  // On click kpi filter
  onKpiSelect(event: any, creatorId: string) {
    if (event.target.checked) this.kartaCreatorIds.push(creatorId)
    else {
      const index = this.kartaCreatorIds.indexOf(creatorId)
      this.kartaCreatorIds.splice(index, 1);
    }
    this.pageIndex = 0;
    this.getMyKPIsList();
  }

  // Get creators
  getCreators() {
    this._myKpiService.getCreators({ userId: this._commonService.getUserId() }).subscribe(
      (response: any) => {
        this.creators = response.creators;
      },
      (error: any) => {
        this.loading = false;
      }
    );
  }

  // View more button
  viewMore() {
    this.pageIndex++;
    // Fetch view more by previous month
    if (this.sortMonth) {
      let data = {
        page: this.pageIndex + 1,
        limit: this.pageSize,
        contributorId: this._commonService.getUserId(),
        type: "month",
        month: parseInt(this.sortMonth)
      }
      this.loading = true;
      this._myKpiService.getKPIsByMonth(data).subscribe(
        (response: any) => {
          response.kpi_nodes[0].data = response.kpi_nodes[0].data.map((item: any) => {
            item.isSelected = false;
            if ((item.target[0].value <= item.achieved_value) && item.start_date) {
              item.dueDays = this.calculateDueDays(item.completed_date, item.due_date, 'completed');
            } else if ((item.target[0].value > item.achieved_value) && item.start_date) {
              item.dueDays = this.calculateDueDays(item.start_date, item.due_date);
            } else item.dueDays = 0;
            return item;
          });
          this.kpis.push(...response.kpi_nodes[0].data);
          if (response.kpi_nodes[0].metadata.length > 0) {
            this.totalAssignedKPIs = response.kpi_nodes[0].metadata[0].total;
          } else this.totalAssignedKPIs = 0;
        }
      ).add(() => this.loading = false);
    }
    // Fetch view more by latest
    else {
      let data = {
        page: this.pageIndex + 1,
        limit: this.pageSize,
        userId: this._commonService.getUserId(),
        searchQuery: this.search_text,
        startUpdatedDate: this.startDate,
        endUpdatedDate: this.endDate,
        targetTypes: this.selectedTargetTypes,
        kpiType: this.kpiType,
        sortBy: this.sortBy,
        percentage: this.selectedPercentage,
        startDueDate: this.startDueDate,
        endDueDate: this.endDueDate,
        kartaCreatorIds: this.kartaCreatorIds,
        statusType: this.statusType
      }
      this.loading = true;
      this._myKpiService.getMyKPIs(data).subscribe(
        (response: any) => {
          response.kpi_nodes[0].data = response.kpi_nodes[0].data.map((item: any) => {
            item.isSelected = false;
            if ((item.target[0].value <= item.achieved_value) && item.start_date) {
              item.dueDays = this.calculateDueDays(item.completed_date, item.due_date, 'completed');
            } else if ((item.target[0].value > item.achieved_value) && item.start_date) {
              item.dueDays = this.calculateDueDays(item.start_date, item.due_date);
            } else item.dueDays = 0;
            return item;
          });
          this.kpis.push(...response.kpi_nodes[0].data);
          this.exportKpis.push(...response.kpi_nodes[0].data);
          if (response.kpi_nodes[0].metadata.length > 0) {
            this.totalAssignedKPIs = response.kpi_nodes[0].metadata[0].total;
          } else this.totalAssignedKPIs = 0;
        }
      ).add(() => this.loading = false);
    }
  }

  // On click geting audit trial data
  getAuditTrail(node: any) {
    this.auditPageIndex = 0;
    this.auditingNode = node;
    let data = {
      page: this.auditPageIndex + 1,
      limit: this.auditPageSize,
      nodeId: node._id
    }
    this.auditHistories = [];
    this.auditLoading = true;
    this._myKpiService.getKartaLogs(data).subscribe(
      (response: any) => {
        this.auditHistories = response.karta_log[0].data;
        if (response.karta_log[0].metadata.length > 0) {
          this.totalAudits = response.karta_log[0].metadata[0].total;
        } else this.totalAudits = 0;
      }
    ).add(() => this.auditLoading = false);
  }
  // View more audit
  viewMoreAudit() {
    this.auditPageIndex++;
    let data = {
      page: this.auditPageIndex + 1,
      limit: this.auditPageSize,
      nodeId: this.auditingNode._id
    }
    this.auditLoading = true;
    this._myKpiService.getKartaLogs(data).subscribe(
      (response: any) => {
        this.auditHistories.push(...response.karta_log[0].data);
        if (response.karta_log[0].metadata.length > 0) {
          this.totalAudits = response.karta_log[0].metadata[0].total;
        } else this.totalAudits = 0;
      }
    ).add(() => this.auditLoading = false);
  }

  // Sort function starts
  onSortClick(col: any, index: number) {
    if (this.arrow_icon) {
      this.sortDir = -1;
    } else {
      this.sortDir = 1;
    }
    this.sortHeader(col, index);
  }

  sortHeader(colName: any, index: number) {
    this.arrow_icon = !this.arrow_icon;
    if (colName == 'percentage'){
      this.headerList[7].sort = this.headerList[7].sort == 'ascending' ? 'descending' : 'ascending';
    }else{
      this.headerList[index].sort = this.headerList[index].sort == 'ascending' ? 'descending' : 'ascending';
    } 
    this.kpis.sort((node_1: any, node_2: any) => {
      if (colName == 'percentage' || colName == 'value') {
        node_1 = node_1['target'][0][colName]
        node_2 = node_2['target'][0][colName]
        if (this.sortOrder == 'asc') {
          return node_1 - node_2;
        } else {
          return node_2 - node_1;
        }
      } else if (colName == 'name' && index === 0) {
        node_1 = node_1['karta'][colName].toLowerCase();
        node_2 = node_2['karta'][colName].toLowerCase();
        return node_1.localeCompare(node_2) * this.sortDir;
      } else if (colName == 'achieved_value' || colName == 'dueDays') {
        node_1 = node_1[colName]
        node_2 = node_2[colName]
        if (this.sortOrder == 'asc') {
          return node_1 - node_2;
        } else {
          return node_2 - node_1;
        }
      } else if (colName == 'fullName') {
        node_1 = node_1?.['contributor']?.[colName] ? node_1?.['contributor']?.[colName] : "";
        node_2 = node_2?.['contributor']?.[colName] ? node_2?.['contributor']?.[colName] : "";
        return node_1.localeCompare(node_2) * this.sortDir;
      } else {
        node_1 = node_1[colName]?.toLowerCase();
        node_2 = node_2[colName]?.toLowerCase();
        return node_1?.localeCompare(node_2) * this.sortDir;
      }
    });
    if (colName == 'percentage' || 'achieved_value' || 'value') this.sortOrder == 'asc' ? this.sortOrder = 'dsc' : this.sortOrder = 'asc';
  }
  // End of sort function

  // Stats filter
  filterByStatus(status: string) {
    this.kpiType = 'assigned'
    this.pageIndex = 0;
    this.statusType = status;
    this.getMyKPIsList();
    $('#assigned_tab').trigger('click')
  }

  // Export to CSV
  csvKartaData: any = [
    {
      _id: "",
        kartaId: "",
        name: "",
        kartaName: "",
        node_type: "",
        formula: "",
        achieved_value: "",
        targetValue: "",
        targetPercentage: "",
        targetFrequency: ""
    }
  ];

  pushCSVData(data: any) {
    data.forEach((element: any) => {
      let clacTarget = [element.target[0]];
      element.kartaId = element.karta._id;
      element.kartaName = element.karta.name;
      element.formula = 'N/A';
      element.targetdata = clacTarget.map((element: any) => { return element.value });
      element.targetPercentage = clacTarget.map((element: any) => { return element.percentage });
      element.targetFrequency = clacTarget.map((element: any) => { return element.frequency });
      if (element.hasOwnProperty("node_formula") && element.node_type === "metrics") {
        element.formula = element?.node_formula?.formula;
        element.metricsData = element?.node_formula.fields.map((element: any) => { return element.fieldValue });
        element.achieved_value = element.metricsData ? element.metricsData.join("|") : "";
      }
      element.targetValue = element.targetdata[0].toString();
      this.csvKartaData.push(element);
    });
  }

  exportCSV() {
    this.csvKartaData = [
      {
        _id: "",
        kartaId: "",
        name: "",
        kartaName: "",
        node_type: "",
        achieved_value: "",
        formula: "",
        targetValue: "",
        targetPercentage: "",
        targetFrequency: ""
      }
    ];
    
   // Filter out those kpis whose target is greater than 0
   let kpis = this.kpis.filter((item: any) => item.target[0].value > 0);
   // Copy with deep objects
   let kpis2 = JSON.parse(JSON.stringify(kpis));

   this.pushCSVData(kpis2);
    const options = {
      bom: false,
      filename: 'KPIs',
      showLabels: true,
      showTitle: true,
      title: 'My KPI Export',
      useTextFile: false,
      useBom: false,
      encoding: 'UTF-8',
      headers: ['Id', 'Karta Id', 'KPI Name', 'Karta Name', 'Node Type', 'Achieved Value', 'Formula', 'Target Value', 'Percentage', 'Frequency']
    };

    const csvExporter = new ExportToCsv(options);
    csvExporter.generateCsv(this.csvKartaData);
  }

  // Import Excel File
  closeImportModal() {
    this.tableRecords = [];
    this.tableTitle = [];
    this.tableData = [];
    this.validationtitleHead = '';
    this.nodes = '';
    $('#importExportModal').modal('hide');
    $("#inputImportFile").val("");
  }

  // Number validation
  isNumeric(value: any) {
    if (value.includes("e") || value.includes("E")) value = + value;
    const isNumericData = (value: string): boolean => !new RegExp(/[^\d.|]/g).test(value.toString().trim());
    return isNumericData(value);
  }

  // Check extension
  isValidCSVFile(file: any) {
    return file.name.endsWith(".csv");
  }

  // Select Csv file
  onFileChange(event: any) {
    /* wire up file reader */
    this.tableData = [];
    this.tableTitle = [];
    this.nodes = '';
    this.wsname = '';
   
    if (!event.target.files && !event.target.files[0]) {
      this._commonService.errorToaster("File not found!");
      event.target.value = "";
    } else if (!this.isValidCSVFile(event.target.files[0])) {
      this._commonService.errorToaster("Only CSV file accepted!");
      event.target.value = "";
    } else {
      const reader: FileReader = new FileReader();
      reader.readAsBinaryString(event.target.files[0]);
      reader.onload = (e: any) => {
        /* create workbook */
        const binarystr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: 'binary', raw: true, dense: true, cellNF: true, cellDates: true });

        /* selected the first sheet */
        this.wsname = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[this.wsname];

        /* save data */
        const data = <AOA>(XLSX.utils.sheet_to_json(ws)); // to get 2d array pass 2nd parameter as object {header: 1}

        if (data.length > 0) {
          let is_data_wrong = false;
          // Validation for csv file header
          this.validationtitleHead = Object.values(data[0])
          if (this.validationtitleHead[0] == 'Id' && this.validationtitleHead[1] == 'Karta Id' && this.validationtitleHead[2] == 'KPI Name' &&
            this.validationtitleHead[3] == 'Karta Name' && this.validationtitleHead[4] == 'Node Type' && this.validationtitleHead[5] == 'Achieved Value' &&
            this.validationtitleHead[6] == 'Formula' && this.validationtitleHead[7] == 'Target Value' && this.validationtitleHead[8] == 'Percentage' && this.validationtitleHead[9] == 'Frequency') {
            data.forEach((item: any, index: number) => {
              let key = Object.keys(item);
              if (index > 0 && key.length !== 10) {
                is_data_wrong = true;
              }
            });
            if (is_data_wrong) {
              this._commonService.errorToaster("Invalid data found in a file.");
            } else {
              this.calculateCSVData(data)
              for (let title in data[0]) {
                this.tableTitle.push(data[0][title])
              }
              this.tableTitle.splice(0, 2);
              this.isTableDataWrong = false;
              this.tableData = data.map((item: any, i: any) => {
                // delete item.__EMPTY;
                // delete item['My KPI Export'];
                if (i !== 0 && (!this.isNumeric(item.__EMPTY_4) || item.__EMPTY_4.length > 15)) {
                  item.invalid = true;
                  this.isTableDataWrong = true;
                } else {
                  item.invalid = false;
                }
                return item;
              });
            }
          } else {
            this._commonService.errorToaster("Invalid data found in a file.");
          }
        } else {
          this._commonService.errorToaster("Please select current KPI file.");
        }
      }
    }
  }

  // Metrics formula calculation
calculateMetricFormulaForCSV(values: any, originalValues: any) {
    let originalValue = originalValues.node_formula.formula.trim();
    let newValue: any = '';
    let value = originalValues.node_formula.formula.trim().split(/[\s() */%+-]+/g);
    let total: any = 0;
    let formulaValues = values.__EMPTY_4.split("|");
    let formulaFields = {};
    for (let i=0; i<originalValues.node_formula.fields.length; i++) {
      let field = originalValues.node_formula.fields[i];
      formulaFields[field.fieldName] = formulaValues[i] || field.fieldValue;
    }

    let modifiedFieldArray: any;
    value.filter((item: any) => item !== "").forEach((x: any, index: number) => {
      if (x && !parseInt(x)) {
        if (modifiedFieldArray) originalValues.node_formula.fields = modifiedFieldArray;
        modifiedFieldArray = originalValues.node_formula.fields.map((item: any) => {
          if (item.fieldName === x) item.fieldValue = formulaFields[x];
          return item;
        });
        newValue = newValue
          ? newValue.replace(x, formulaFields[x])
          : originalValue.replace(x, formulaFields[x]);
      }
    });
    newValue = eval(newValue);
    if (!isFinite(newValue)) {
      this._commonService.errorToaster(`Infinite value cannot be accepted..!!`);
      return false;
    }
    let newV = newValue.toString().split('.');
    if (parseInt(newV[1]) > 0) newValue = Number(newValue).toFixed(2);
    else newValue = newV[0];
    total = newValue;
    if (total > 0) {
      let percentage = (total / +originalValues.target[0].value) * 100;
      modifiedFieldArray.map((item: any) => {
        item.fieldValue = Number(item.fieldValue);
        return item;
      });
      let nodeObj = {
        "id": values['My KPI Export'],
        "achieved_value": Number(total),
        "node_formula": {
          "fields": modifiedFieldArray,
          "formula": originalValues.node_formula.formula,
          "metrics": true
        },
        "percentage": Math.round(percentage)
      }
      if (percentage >= 100) nodeObj["completed_date"] = new Date();
      return nodeObj;
    } else {
      this.isTableDataWrong = true;
      return false;
    }
  }

  calculateCSVData(csvData: any) {
    // Push all ids into separate variable for getting node details
    csvData.map((item: any, i: any) => {
      if (i > 0) this.importedNodeIds.push(item["My KPI Export"]);
    });
    // Call api for getting node details
    let data = {
      nodeIds: this.importedNodeIds
    }
    this._myKpiService.getNodesDetails(data).subscribe(
      (response: any) => {
        if (response && response.nodes) {
          csvData.forEach((element: any, index: number) => {
            if (index > 0) {
              if(response.nodes.length > 0) {
                let originalElement = response.nodes.find((item: any) => item.id === element['My KPI Export']);
                if (originalElement.node_type == "measure") {
                  let percentage = (+element.__EMPTY_4 / +originalElement.target[0].value) * 100;
                  element.node = {
                    "id": element['My KPI Export'],
                    "achieved_value": +element.__EMPTY_4,
                    "percentage": Math.round(percentage)
                  }
                  if (percentage >= 100) element.node["completed_date"] = new Date();
                } else if (originalElement.node_type == "metrics" && originalElement.node_formula) {
                  let data = this.calculateMetricFormulaForCSV(element, originalElement);
                  if (data) {
                    element.node = data;
                  } else this._commonService.errorToaster("Invalid data found in CSV file!");
                }
              } else this._commonService.errorToaster("No similar data found for this account..!!");
            }
          });
          this.nodes = csvData.map((elm: any, index: number) => {
            if (index > 0) {
              return elm.node
            }
          })
          this.nodes.splice(0, 1)
        }
      }
    );
  }

  // Upload csv function
  submitCSV() {
    if (this.isTableDataWrong) {
      this._commonService.errorToaster("Invalid data found in CSV file!");
    } else {
      if (this.nodes.length > 0) {
        let data = { "nodes": this.nodes }
        this.importSubmitFlag = true;
        this._myKpiService.updateCsv(data).subscribe(
          (response: any) => {
            if (response) this._commonService.successToaster("KPIs imported successfully.");
            this.closeImportModal();
            this.pageIndex = 0;
            this.tableData = [];
            this.tableTitle = [];
            this.validationtitleHead = '';
            this.nodes = '';
            this.getMyKPIsList();
          },
          (error: any) => {
            this.importSubmitFlag = false;
          }
        ).add(() => this.importSubmitFlag = false);
      }
    }
  }

}
