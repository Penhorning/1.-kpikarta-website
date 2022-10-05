import { Component, OnInit } from '@angular/core';
import { MyKpiService } from './service/my-kpi.service';
import { CommonService } from '@app/shared/_services/common.service';
import * as moment from 'moment';

declare const $: any;
@Component({
  selector: 'app-my-kpi',
  templateUrl: './my-kpi.component.html',
  styleUrls: ['./my-kpi.component.scss'],
})
export class MyKpiComponent implements OnInit {

  kpis: any = [];
  colorSettings: any = [];
  users: any = [];
  creators: any = [];
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

  constructor(private _myKpiService: MyKpiService, private _commonService: CommonService) {
    this.maxDate = new Date();
  }

  ngOnInit(): void {
    this.getColorSettings();
    this.getAllUser();
    this.getKpiStats();
    this.getCreators();

    // Ng Multi Select Dropdown properties
    this.dropdownSettings = {
      enableCheckAll: false,
      singleSelection: false,
      idField: '_id',
      textField: 'fullName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      disabled: this.isDisabled
    }
  }

  // Get color settings
  getColorSettings() {
    this._myKpiService.getColorSettingByUser({ userId: this._commonService.getUserId() }).subscribe(
      (response: any) => {
        this.colorSettings = response;
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
      kartaCreatorIds: this.kartaCreatorIds
    }
    this._myKpiService.getMyKPIs(data).subscribe(
      (response: any) => {
        if (response.kpi_nodes[0]?.data.length > 0) {
          this.kpis = response.kpi_nodes[0].data;
        } else {
          this.kpis = [];
        }
      }
    )
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

  // Get all users 
  getAllUser() {
    this._myKpiService.getAllUsers().subscribe(
      (response: any) => {
        response.users[0].data.filter((item: any) => {
          item.nameWithMail = item.fullName + ' - [' + item.email + ']';
        })
        this.users = response.users[0].data;
      }
    );
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
      this.selectedUsers = param.sharedTo;
    } else {
      this.selectedUsers = new Array()
      this.sharingKartaCount = 0;
      this.users.forEach((user: any) => {
        delete user.isDisabled;
      });
    }
    this.selectedSharedUsers = [];
    if (this.selectedUsers && this.selectedUsers.length > 0) {
      this.users.forEach((user: any) => {
        delete user.isDisabled;
        this.selectedUsers.forEach((item: any) => {
          if (item.userId === user._id) {
            user.isDisabled = !this.isDisabled;
            this.selectedSharedUsers.push(user);
          }
        })
      });
    }
  }

  // Submit shareed data
  onSubmitSharedData() {
    let data = {
      nodeId: this.sharingKarta._id,
      userIds: this.selectedUsers
    }
   this.sharedSubmitFlag = true;
    this._myKpiService.shareNode(data).subscribe(
      (response: any) => {
        if (response) this._commonService.successToaster("Your have shared successfully");
        $('#staticBackdrop').modal('hide');
        this.getMyKPIsList();
      },
      (error: any) => { }
    ).add(() => this.sharedSubmitFlag = false );
  }

  editActualValue(i: number) {
    if (this.rowClicked === i) this.rowClicked = -1;
    else this.rowClicked = i;
  }

  // Edit acheived value
  onEditAcheivedValue(ach_val: any, target_val: any) {
    let nodeId = target_val._id;
    this.target = target_val.target;

    // Edit acheived Percentage calculation 
    this.target.forEach((element: any) => {
      let percentage = (+ach_val / element.value) * 100;
      return element.percentage = Math.round(percentage);
    });
    let data = {
      'achieved_value': +ach_val,
      'target': this.target
    }
    this.isHidden = false;
    this._myKpiService.updateNode(nodeId, data).subscribe(
      (response: any) => {
        this.getMyKPIsList();
      }
    );
  }

  // Sort by
  onSortBy(item: any) {
    this.sortBy = item;
    this.getMyKPIsList()
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
    this.getMyKPIsList()
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

  // View more
  viewMore(){
    this.pageIndex++;
    this.pageSize = this.pageSize;
    this.getMyKPIsList();
  }

}
