import { Component, OnInit } from '@angular/core';
import { MyKpiService } from './service/my-kpi.service';
import { CommonService } from '@app/shared/_services/common.service';
import * as moment from 'moment';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';


declare const $: any;

@Component({
  selector: 'app-my-kpi',
  templateUrl: './my-kpi.component.html',
  styleUrls: ['./my-kpi.component.scss'],
})
export class MyKpiComponent implements OnInit {

  karta: any = [];
  kpis: any = [];
  totalAssignedKPIs: number = 0;
  colorSettings: any = [];
  members: any = [];
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
  search_text: string = "";
  maxDate: Date;
  kpiType: string = 'assigned'
  selectedSortBy: any;
  isHidden: boolean = false;
  isEditIconHidden: boolean = false;
  searchText = "";
  kartaCreatorIds: any = [];
  rowClicked: any;
  // Share KPI
  sharingKarta: any;
  sharingKartaCount: any = 0;
  dropdownSettings: any = {};
  selectedSharedUsers: any = [];
  selectedUsers: any = [];
  isDisabled: boolean = false;
  sharedSubmitFlag: boolean = false;
  // Target filter
  target: any = [
    { frequency: "", value: 0, percentage: 0 }
  ]
  selectedTargetTypes: any = [];
  targetTypesList = [
    { name: 'Weekly', value: 'weekly', selected: false },
    { name: 'Monthly', value: 'monthly', selected: false },
    { name: 'Quarterly', value: 'quarterly', selected: false },
    { name: 'Annually', value: 'annually', selected: false }
  ];
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
    { name: 'Karta', sort: '' },
    { name: 'KPI', sort: '' },
    { name: 'Target', sort: '' },
    { name: 'Actual', sort: '' },
    { name: 'Last Edited', sort: '' },
    { name: 'Due Date', sort: '' },
    { name: 'Days Left', sort: '' },
    { name: 'Completion', sort: '' }
  ];
  // Sort var
  sortDir = 1;
  sortOrder: string = 'asc';
  arrow_icon: boolean = true;
  currentNodeWeight: number = 0;
  // Achieved value pop up value
  metricsData: any = [];
  submitted: boolean = false;
  submittedMeasure: boolean = false;
  measureSubmitFlag: boolean = false;
  metricsSubmitFlag: boolean = false;
  measureFlag = false;
  kartaName: any;
  editingKarta: any;
  index: any;
  metricsForm = this.fb.group({
    fields: this.fb.array([]),
    formula: [''],
    calculatedValue: [0]
  });

  measureForm = this.fb.group({
    actualValue: [0,[Validators.required, Validators.pattern('^[0-9]*$')]]
  });

  constructor(private _myKpiService: MyKpiService, private _commonService: CommonService, private fb: FormBuilder,private route: ActivatedRoute) {
    this.maxDate = new Date();
  }

  ngOnInit(): void {
    this.getColorSettings();
    this.getAllMembers();
    this.getKpiStats();
    this.getCreators();

    // Ng Multi Select Dropdown properties
    this.dropdownSettings = {
      enableCheckAll: false,
      singleSelection: false,
      idField: '_id',
      textField: 'nameAndEmail',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      disabled: this.isDisabled
    }
    this.addMetricsData();
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
          fieldValue: [element?.fieldValue, [Validators.required, Validators.pattern('^[0-9]*$')]],
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
    let newValue = '';
    let value = this.metricsForm.value.formula.trim().split(/[,.+\-\/% *)(\/\\s]/);
    
    let total: any = 0;
    let checkFrag = false;

    this.fields.controls.forEach((x: any) => {
      tempObj[x['controls']['fieldName'].value] = x['controls']['fieldValue'].value;
    });

    value.forEach((y: any) => {
      if (y) {
        if (tempObj[y]) {
          newValue = newValue
            ? newValue.replace(y, tempObj[y])
            : originalValue.replace(y, tempObj[y]);
        } else {
          checkFrag = true;
        }
      }
    });

    if (checkFrag) {
      this._commonService.errorToaster('Please type correct formula');
      this.metricsForm.patchValue({ calculatedValue: 0 }); return;
    } else {
      total = eval(newValue);
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
      this._myKpiService.updateNode(this.currentNode, { node_type: request, achieved_value: +this.metricsForm.value.calculatedValue, target: this.target }).subscribe(
        (response) => {
          if (response) { this._commonService.successToaster('Actual value updated successfully!'); }
          $('#editActualValueModal').modal('hide');
          this.getMyKPIsList();
          this.getKpiStats();
        },
        (err) => {
          console.log(err); this._commonService.errorToaster('Something went wrong!');
        }
      ).add(() => this.metricsSubmitFlag = false);
      return;
    }
  }


  onMeasureSubmit(){
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
    this._myKpiService.updateNode(this.currentNode, { achieved_value: +this.measureForm.value.actualValue, target: this.target, is_achieved_modified: true }).subscribe(
      (response) => {
        if (response) { this._commonService.successToaster('Actual value updated successfully!'); }
        $('#editActualValueModal').modal('hide');
        this.getMyKPIsList();
        this.getKpiStats();
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
    this._myKpiService.getColorSettings().subscribe(
      (response: any) => {
        this.colorSettings = response.color_settings;
        this.colorSettings.settings = this.colorSettings.settings.sort((a: any, b: any) => a.min - b.min);
        this.getMyKPIsList();
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
    this._myKpiService.getMyKPIs(data).subscribe(
      (response: any) => {
        this.kpis = response.kpi_nodes[0].data;
        if (response.kpi_nodes[0].metadata.length > 0) {
          this.totalAssignedKPIs = response.kpi_nodes[0].metadata[0].total; 
        } else this.totalAssignedKPIs = 0;
      }
    ).add(() => this.loading = false );
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
  calculateDueDays(due_date: string) {
    return moment(due_date).diff(moment(), 'days') + 1;
  }

  // Get all members
  getAllMembers() {
    let data = {
      limit: 1000,
      userId: this._commonService.getUserId()
    }
    this._myKpiService.getAllMembers(data).subscribe(
      (response: any) => {
        this.members = response.members[0].data;
        this.members?.map((element:any) => {
          element.nameAndEmail = (element.fullName +' '+ `(${element.email})`);
        });
    });
  }

  // Search
  search() {
    if (this.search_text) {
      this.pageIndex = 0;
      this.getMyKPIsList();
    }
  }
  clearSearch() {
    this.search_text = "";
    this.getMyKPIsList();
  }

  // On last edit date change
  onDateChange(e: any) {
    this.pageIndex = 0;
    if (e[0] && e[1]) {
      this.startDate = e[0];
      this.endDate = e[1];
      this.startDueDate = "",
        this.endDueDate = "",
        this.getMyKPIsList();
    }
  }

  // On due date change
  onDueDateChange(e: any) {
    this.pageIndex = 0;
    if (e[0] && e[1]) {
      this.startDueDate = e[0];
      this.endDueDate = e[1];
      this.startDate = "";
      this.endDate = "";
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

  // Ng Multi Select Dropdown
  onItemSelect(item: any) {
    this.selectedUsers.push({ userId: item._id });
  }

  onItemDeSelect(item: any) {
    this.selectedUsers = this.selectedUsers.filter((el: any) => el.userId !== item._id);
  }

  // Shared kpi
  onShareClick(param: any) {
    this.sharingKarta = param;
    if (param.sharedTo) {
      this.sharingKartaCount = param.sharedTo.length;
      // this.selectedUsers = param.sharedTo;
    } else {
      // this.selectedUsers = new Array()
      this.sharingKartaCount = 0;
      this.members.forEach((user: any) => {
        delete user.isDisabled;
      });
    }
    this.selectedSharedUsers = [];
    if (param.sharedTo && param.sharedTo.length > 0) {
      this.members.forEach((user: any) => {
        delete user.isDisabled;
        param.sharedTo.forEach((item: any) => {
          if (item.userId === user._id) {
            user.isDisabled = !this.isDisabled;
            this.selectedSharedUsers.push(user);
          }
        })
      });
    }
  }

  // Submit shared data
  onSubmitSharedData() {
    let data = {
      nodeId: this.sharingKarta._id,
      userIds: this.selectedUsers
    }
    this.sharedSubmitFlag = true;
    this._myKpiService.shareNode(data).subscribe(
      (response: any) => {
        if (response) this._commonService.successToaster("Your have shared the node successfully");
        $('#staticBackdrop').modal('hide');
        this.sharingKarta = null;
        this.getMyKPIsList();
      },
      (error: any) => { }
    ).add(() => this.sharedSubmitFlag = false);
  }

  // On click geting data of acheived value
  editActualValue(e: any) {
    this.editingKarta = e;
    this.measureFlag = false; 
    this.metricsData = e.node_type;
    this.currentNode = e._id;
    this.kartaName =  e.karta.name;
    this.target = e.target
    this.metricsForm.reset();
    this.measureForm.reset();
    this.fields.clear();
    if (e?.node_type?.metrics) {
      this.measureFlag = !this.measureFlag;
      this.metricsForm.patchValue({
        calculatedValue: e.node_type.calculated_value ? e.node_type.calculated_value : 0 ,
        achieved_value: e.achieved_value ? e.achieved_value : 0,
        formula: e.node_type.formula ? e.node_type.formula : ''
      });
    } else {
      this.measureFlag = this.measureFlag;
      this.measureForm.patchValue({
        actualValue : e.achieved_value
      });
    }
    this.addMetricsData();
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
    this.getMyKPIsList()
  }

  // Percent select dropdown 
  onPercentSelect(e: any, item: any) {
    if (e.target.checked) this.selectedPercentage.push(item);
    else {
      const index = this.selectedPercentage.indexOf(item);
      this.selectedPercentage.splice(index, 1);
    }
    this.getMyKPIsList();
  }

  // Tab switching
  onTabSwitch(e: string) {
    this.kpiType = e;
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
  onKpiSelect(event: any, kartaCreatorIds: string) {
    if (event.target.checked) this.kartaCreatorIds.push(kartaCreatorIds)
    else {
      const index = this.kartaCreatorIds.indexOf(kartaCreatorIds)
      this.kartaCreatorIds.splice(index, 1);
    }
    this.getMyKPIsList();
  }

  // Get creators
  getCreators() {
    this._myKpiService.getCreators({ userId: this._commonService.getUserId() }).subscribe(
      (response: any) => {
        this.creators = response.creators;
      }
    );
  }

  // View more button
  viewMore() {
    this.pageIndex++;
    let data = {
      page: this.pageIndex + 1,
      limit: this.pageSize,
      userId: this._commonService.getUserId(),
      kpiType: this.kpiType,
      statusType: this.statusType
    }
    this.loading = true;
    this._myKpiService.getMyKPIs(data).subscribe(
      (response: any) => {
        this.kpis.push(...response.kpi_nodes[0].data);
        if (response.kpi_nodes[0].metadata.length > 0) {
          this.totalAssignedKPIs = response.kpi_nodes[0].metadata[0].total; 
        } else this.totalAssignedKPIs = 0;
      }).add(() => this.loading = false);
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
    this.headerList[index].sort = this.headerList[index].sort == 'ascending' ? 'descending' : 'ascending';
    this.kpis.sort((node_1: any, node_2: any) => {
      if (colName == 'percentage') {
        node_1 = node_1['target'][0][colName]
        node_2 = node_2['target'][0][colName]
        if (this.sortOrder == 'asc') {
          return node_1 - node_2;
        } else {
          return node_2 - node_1;
        }
      } else if (colName == 'fullName') {
        node_1 = node_1['karta']['user'][colName].toLowerCase();
        node_2 = node_2['karta']['user'][colName].toLowerCase();
        return node_1.localeCompare(node_2) * this.sortDir;
      } else if (colName == 'achieved_value') {
        node_1 = node_1[colName]
        node_2 = node_2[colName]
        if (this.sortOrder == 'asc') {
          return node_1 - node_2;
        } else {
          return node_2 - node_1;
        }
      } else if (colName == 'value') {
        node_1 = node_1['target'][0][colName]
        node_2 = node_2['target'][0][colName]
        if (this.sortOrder == 'asc') {
          return node_1 - node_2;
        } else {
          return node_2 - node_1;
        }
      } else {
        node_1 = node_1[colName].toLowerCase();
        node_2 = node_2[colName].toLowerCase();
        return node_1.localeCompare(node_2) * this.sortDir;
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
  
}
