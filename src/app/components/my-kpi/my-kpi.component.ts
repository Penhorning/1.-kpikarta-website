import { Component, OnInit } from '@angular/core';
import { MyKpiService } from './service/my-kpi.service';
import { CommonService } from '@app/shared/_services/common.service';
import * as moment from 'moment';


@Component({
  selector: 'app-my-kpi',
  templateUrl: './my-kpi.component.html',
  styleUrls: ['./my-kpi.component.scss'],
})
export class MyKpiComponent implements OnInit {

  kpis: any = [];
  colorSettings: any = [];
  users: any = [];
  userId: any;
  pageIndex: number = 0;
  pageSize: number = 10;
  length: number = 0;
  lastEditSelectedDates: any;
  dateRequiredSelectedDates: any;
  dueDateRequiredSelectedDates: any;
  startDate: any = "";
  endDate: any = "";
  startDueDate: any = "";
  endDueDate: any = "";
  all: any;
  completed: any;
  inProgress: any;
  search_text: string = "";
  maxDate: Date;
  kpiTypes: string = 'assigned'

  dropdownSettings: any = {};
  selectedSharedUsers: any = [];
  selectedUsers: any = [];

  target: any = [
    { frequency: "", value: 0, percentage: 0 }
  ]

  selectedTargetType: any = [];
  targetTypesList = [
    { name: 'Weekly', value: 'weekly', selected: false },
    { name: 'Quarterly', value: 'quarterly', selected: false },
    { name: 'Yearly', value: 'yearly', selected: false }
  ];

  sortBy: any;
  sortByList = [
    { id: 0, name: 'Worst to Best Performing', value: 'worst', selected: false },
    { id: 1, name: 'Best to Worst Performing', value: 'best', selected: false },
    { id: 2, name: 'Oldest to Newest', value: 'oldest', selected: false },
    { id: 3, name: 'Newest to Oldest', value: 'newest', selected: false }
  ];

  selectedPercentage: any = [];
  percentageList = [
    { name: '0 to 30%', value: { "min": 0, "max": 30 }, selected: false },
    { name: '31 to 50%', value: { "min": 31, "max": 50 }, selected: false },
    { name: '51 to 70%', value: { "min": 51, "max": 70 }, selected: false },
    { name: '71 to 100%', value: { "min": 71, "max": 100 }, selected: false },
    { name: '101 to Above', value: { "min": 101, "max": 1000 }, selected: false }
  ];
  constructor(private _myKpiService: MyKpiService, private _commonService: CommonService) { this.maxDate = new Date(); }

  ngOnInit(): void {
    this.getColorSettings();
    this.getAllUser();
    this.getKpiStatus();

    // Ng Multi Select Dropdown properties
    this.dropdownSettings = {
      enableCheckAll: false,
      singleSelection: false,
      idField: '_id',
      textField: 'nameWithMail',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
    };
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
      targetTypes: this.selectedTargetType,
      kpiType: this.kpiTypes,
      sortBy: this.sortBy,
      percentage: this.selectedPercentage,
      startDueDate: this.startDueDate,
      endDueDate: this.endDueDate
    }
    this._myKpiService.getMyKPIs(data).subscribe(
      (response: any) => {
        // console.log("response", response.karta_nodes[0].data);

        if (response.karta_nodes[0].data.length > 0) {
          response.karta_nodes[0].data.forEach((element: any) => {
 
            console.log(" extra percentage element",element);
            
            // Days left setting code 
            let due_date = moment(element.due_date);
            let current_date = moment(new Date());
            element.days_left = due_date.diff(current_date, 'days');

            // Percentage calculation code
            element.percentage = `${element.target[0].percentage.toFixed()}%`;
            const color_per_calc = element.target[0].percentage.toFixed()
            if(element.target[0].percentage > 100){
              element.abovePercentage = `${element.target[0].percentage.toFixed() - 100}%`;
              console.log(" element.abovePercentage",element.abovePercentage);
            }

            // Color for bar setting code
            if (this.colorSettings.settings) {
              let colorSetting = this.colorSettings.settings.filter((item: any) => color_per_calc >= item.min && color_per_calc <= item.max);
              element.barColor = colorSetting ? colorSetting[0]?.color : 'black';
            
              //  element.abovePercentageColor =  colorSetting.map((e:any) => {
              //      if(e.max >= 100){
              //       console.log(" element.colorSetting",e.color);
              //      return e.color;
              //     }
              //   }
              //     )
            }
          });
          this.kpis = response.karta_nodes[0].data;
        } else {
          this.kpis = [];
        }
      }
    )
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
    this.dueDateRequiredSelectedDates = "";
    this.startDate = "";
    this.endDate = "";
    this.startDueDate = "",
      this.endDueDate = "",
      this.pageIndex = 0;
    this.getMyKPIsList();
  }

  // Ng Multi Select Dropdown
  onItemSelect(item: any) {
    this.selectedSharedUsers.push()
    this.selectedSharedUsers.push({ userId: item._id });
  }

  onItemDeSelect(item: any) {
    this.selectedSharedUsers = this.selectedSharedUsers.filter((el: any) => el.userId !== item._id);
  }

  // Shared kpi
  onShareClick(event: any) {
    this.userId = event;
  }

  // Submit shareed data
  onSubmitSharedData() {
    let data = { ['sharedTo']: this.selectedSharedUsers }
    this._myKpiService.updateNode(this.userId, data).subscribe(
      (response: any) => { });
    this.selectedSharedUsers = [];
    this.selectedUsers = [];
    this.getMyKPIsList();
  }

  // Edit acheived value
  onEditAcheivedValue(ach_val: any, target_val: any) {
    let nodeId = target_val._id;
    this.target = target_val.target;

    // Edit acheived Percentage calculation 
    this.target.forEach((element: any) => {
      let percentage = (ach_val.innerHTML / element.value) * 100;
      return element.percentage = Math.round(percentage);
    });
    let data = {
      'achieved_value': ach_val.innerHTML,
      'target': this.target
    }
    this._myKpiService.updateNode(nodeId, data).subscribe(() => { });
    this.getMyKPIsList();
  }

  // Sort by
  onSortBy(e: any, item: any) {
    this.sortBy = item;
    if (e.target.checked) { this.selectedPercentage.push(item) }
    else {
      const indexId = this.selectedPercentage.indexOf(item)
      this.selectedPercentage.splice(indexId, 1);
    }
    this.getMyKPIsList()
  }

  // Target type select check uncheck
  onTargetSelect(e: any, item: any) {
    if (e.target.checked) { this.selectedTargetType.push(item) }
    else {
      const indexId = this.selectedTargetType.indexOf(item);
      this.selectedTargetType.splice(indexId, 1);
    }
    this.getMyKPIsList()
  }

  // Percent select dropdown 
  onPercentSelect(e: any, item: any) {
    if (e.target.checked) { this.selectedPercentage.push(item) }
    else {
      const indexId = this.selectedPercentage.indexOf(item)
      this.selectedPercentage.splice(indexId, 1);
    }
    this.getMyKPIsList()
  }

  onTabSwitch(e: string) {
    this.kpiTypes = e;
    this.getMyKPIsList()
  }

  getKpiStatus() {
    this._myKpiService.getKpiStatus({ userId: this._commonService.getUserId() }).subscribe(
      (response: any) => {
        console.log("getKpiStatus", response.karta_nodes);
        if(response.karta_nodes){
          this.all = response.karta_nodes.All;
          this.completed = response.karta_nodes.Completed;
          this.inProgress = response.karta_nodes.InProgress;
        }
      }
    );
  }
}
