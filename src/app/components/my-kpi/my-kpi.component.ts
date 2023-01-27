import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MyKpiService } from './service/my-kpi.service';
import { CommonService } from '@app/shared/_services/common.service';
import * as moment from 'moment';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ExportToCsv } from 'export-to-csv';
import * as XLSX from 'xlsx';

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
  wsname:any;
  // Target filter
  target: any = [
    { frequency: "", value: 0, percentage: 0 }
  ]
  importTarget: any = [
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
  metricFlag = false;
  kartaName: any;
  editingKarta: any;
  index: any;
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

  @ViewChild('fileUploader')
  fileUploader!: ElementRef;
  constructor(private _myKpiService: MyKpiService, private _commonService: CommonService, private fb: FormBuilder, private route: ActivatedRoute) {
    this.maxDate = new Date();
  }

  ngOnInit(): void {
    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    })
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
    let value = this.metricsForm.value.formula.trim().split(/[\s() */%+-]+/g);

    let total: any = 0;
    let checkFrag = false;

    this.fields.controls.forEach((x: any) => {
      tempObj[x['controls']['fieldName'].value] = x['controls']['fieldValue'].value;
    });

    value.forEach((y: any) => {
      if (y && !parseInt(y)) {
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
      this._commonService.errorToaster('Something went wrong!');
      this.metricsForm.patchValue({ calculatedValue: 0 }); return;
    } else {
      total = eval(newValue);
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
        this._myKpiService.updateNode(this.currentNode, { node_formula: request, achieved_value: +this.metricsForm.value.calculatedValue, target: this.target }).subscribe(
          (response) => {
            if (response) { this._commonService.successToaster('Actual value updated successfully!'); }
            $('#editActualValueModal').modal('hide');
            this.pageIndex = 0;
            this.getMyKPIsList();
            this.getKpiStats();
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
    this._myKpiService.updateNode(this.currentNode, { achieved_value: +this.measureForm.value.actualValue, target: this.target, is_achieved_modified: true }).subscribe(
      (response) => {
        if (response) { this._commonService.successToaster('Actual value updated successfully!'); }
        $('#editActualValueModal').modal('hide');
        this.pageIndex = 0;
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
    this._myKpiService.getMyKPIs(data).subscribe(
      (response: any) => {
        this.kpis = Array.from(response.kpi_nodes[0].data)
        this.exportKpis = Array.from(response.kpi_nodes[0].data)
        if (response.kpi_nodes[0].metadata.length > 0) {
          this.totalAssignedKPIs = response.kpi_nodes[0].metadata[0].total;
        } else this.totalAssignedKPIs = 0;
      }
    ).add(() => this.loading = false);
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
        this.members?.map((element: any) => {
          element.nameAndEmail = (element.fullName + ' ' + `(${element.email})`);
        });
      },
      (error: any) => {
        this.loading = false
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
    this.pageIndex = 0;
    this.getMyKPIsList();
  }

  // On last edit date change
  onDateChange(e: any) {
    if (e[0] && e[1]) {
      this.startDate = e[0];
      this.endDate = e[1];
      this.startDueDate = "",
        this.endDueDate = "",
        this.pageIndex = 0;
      this.getMyKPIsList();
    }
  }

  // On due date change
  onDueDateChange(e: any) {
    if (e[0] && e[1]) {
      this.startDueDate = e[0];
      this.endDueDate = e[1];
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
        this.selectedUsers = []
        this.pageIndex = 0;
        this.getMyKPIsList();
      },
      (error: any) => { }
    ).add(() => this.sharedSubmitFlag = false);
  }

  // Close model
  closeModal() {
    this.sharingKarta = undefined;
    this.selectedUsers = []
  }

  // On click geting data of acheived value
  editActualValue(node: any) {
    this.editingKarta = node;
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
    if (node.node_type === "metrics") {
      this.metricFlag = true;
      this.metricsForm.patchValue({
        calculatedValue: node.node_formula.calculated_value ? node.node_formula.calculated_value : 0,
        achieved_value: node.achieved_value ? node.achieved_value : 0,
        formula: node.node_formula.formula ? node.node_formula.formula : ''
      });
    } else {
      this.metricFlag = false;
      this.measureForm.patchValue({
        actualValue: node.achieved_value
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
        this.loading = false
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
        this.exportKpis.push(...response.kpi_nodes[0].data);
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
      element.formula = element?.node_formula?.formula ? element?.node_formula?.formula : 'N/A';
      element.targetdata = clacTarget.map((element: any) => { return element.value });
      element.targetPercentage = clacTarget.map((element: any) => { return element.percentage });
      element.targetFrequency = clacTarget.map((element: any) => { return element.frequency });
      if (element.hasOwnProperty("node_formula")) {
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
      filename: 'KPIs',
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: true,
      title: 'My KPI Export',
      useTextFile: false,
      useBom: true,
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
    const isNumericData = (value: string): boolean => !new RegExp(/[^\d|]/g).test(value.trim());
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
                if (!this.isNumeric(item.__EMPTY_4) && i !== 0) {
                  item.ac = true;
                  this.isTableDataWrong = true;
                } else {
                  item.ac = false;
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
    let tempObj: any = [];
    let originalValue = originalValues.node_formula.formula.trim();
    let newValue = '';
    let value = originalValues.node_formula.formula.trim().split(/[\s() */%+-]+/g);
    let total: any = 0;
    let formulaValues = values.__EMPTY_4.split("|");
    let modifiedFieldArray: any;
    value.filter((item: any) => item !== "").forEach((x: any, index: number) => {
      if (x && !parseInt(x)) {
        if (modifiedFieldArray) originalValues.node_formula.fields = modifiedFieldArray;
        modifiedFieldArray = originalValues.node_formula.fields.map((item: any) => {
          if (item.fieldName === x) item.fieldValue = formulaValues[index];
          return item;
        });
        newValue = newValue
          ? newValue.replace(x, formulaValues[index])
          : originalValue.replace(x, formulaValues[index]); 
      }
    });
    if (originalValues.node_formula.fields.length !== formulaValues.length) {
      this.tableData.map((item: any) => {
        if (item["My KPI Export"] === originalValues.id) item.ac = true;
        return item;
      });
      this.isTableDataWrong = true;
      return false;
    } else {
      total = eval(newValue).toFixed(2);
      if (total > 0) {
        let percentage = (total / +originalValues.target[0].value) * 100;
        let nodeObj = {
          "id": values['My KPI Export'],
          "achieved_value": total,
          "node_formula": {
            "fields": modifiedFieldArray,
            "formula": originalValues.node_formula.formula,
            "metrics": true
          },
          "percentage": Math.round(percentage)
        }
        return nodeObj;
      } else {
        this.isTableDataWrong = true;
        return false;
      }
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
              let originalElement = response.nodes.find((item: any) => item.id === element['My KPI Export']);
              if (originalElement.node_type == "measure") {
                let percentage = (+element.__EMPTY_4 / +originalElement.target[0].value) * 100;
                element.node = {
                  "id": element['My KPI Export'],
                  "achieved_value": +element.__EMPTY_4,
                  "percentage": Math.round(percentage)
                }
              } else {
                let data = this.calculateMetricFormulaForCSV(element, originalElement);
                if (data) {
                  element.node = data;
                } else this._commonService.errorToaster("Invalid data found in CSV file!");
              }
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
