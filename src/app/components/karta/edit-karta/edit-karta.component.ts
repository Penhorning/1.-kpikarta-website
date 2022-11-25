import { Component, HostListener, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ExportToCsv } from 'export-to-csv';
import { CommonService } from '@app/shared/_services/common.service';
import { KartaService } from '../service/karta.service';
import * as BuildKPIKarta from '../utils/d3.js';
import { Options } from '@angular-slider/ngx-slider';
import * as moment from 'moment';


declare const $: any;

@Component({
  selector: 'app-edit-karta',
  templateUrl: './edit-karta.component.html',
  styleUrls: ['./edit-karta.component.scss'],
})
export class EditKartaComponent implements OnInit {

  kartaId: string = '';
  karta: any;
  currentNode: any = {};
  // currentPhase: any;
  phaseId: string = '';
  phases: any = [];
  // subPhases: any = [];
  colorSettings: any = [];
  suggestion: any;
  loadingKarta: boolean = true;
  loader: any = this._commonService.loader;
  showSVG: boolean = false;
  isRtNodDrgingFrmSide: boolean = false;
  formulaGroup: FormGroup | any = [];

  // Color variables
  colorSubmitFlag: boolean = false;
  editColorSettings: any;
  selectedColor2: string = "#F85C5C";
  minValue: number = 0;
  maxValue: number = 100;
  options: Options = {
    floor: 0,
    ceil: 100
  };

  // Color slider form
  colorForm = this.fb.group({
    color: ["000000", Validators.required],
    min: [this.minValue, Validators.required],
    max: [this.maxValue, Validators.required]
  });

  // D3 karta events
  previousDraggedNodeParentId: any;
  D3SVG: any = {
    // subPhases: (() => this.subPhases),
    phases: () => this.phases,
    events: {
      addNode: (d: any) => {
        this.addNode(d);
      },
      // addNodeRight: (d: any) => {
      //   this.addNodeRight(d);
      // },
      updateDraggedNode: (d: any) => {
        this.currentNode = d;
        if(d.parent.id && d.phaseId) {
          let node = this.currentNode;
          if(this.previousDraggedNodeParentId !== d.parent.id) {
            this.updateNode('parentId', d.parent.id, 'node_updated', node);
            this.updateNode('phaseId', d.phaseId, 'node_updated', node);
          }
        }
      },
      onDragStart: (d: any) => {
        this.previousDraggedNodeParentId = d.parent.id;
      },
      onNodeRightClick: (d: any) => {
        $("#saveNodeModal").modal('show');
        this.catalogForm.patchValue({ node: d });
      },
      nodeItem: (d: any) => {
        console.log(d);
        this.updateNodeProperties(d);
      },
      removeNode: (d: any) => {
        this.removeNode(d);
      },
      linkColor: (d: any) => {
        let node_percentage = parseInt((d.target).percentage) || 0;
        if (node_percentage > 100) {
          let colorSetting = this.colorSettings.settings.filter((item: any) => item.min === 101 && item.max === 101);
          return colorSetting[0]?.color || 'black';
        } else if (this.colorSettings.settings) {
          let colorSetting = this.colorSettings.settings.filter((item: any) => node_percentage >= item.min && node_percentage <= item.max);
          return colorSetting[0]?.color || 'black';
        } else return 'black';
      },
      linkWidth: (d: any) => {
        let weightage = parseInt(d.target.weightage);
        weightage = weightage <= 0 ? 10 : weightage;
        return (weightage / 10) / 2;
      }
    }
  }

  /* Node properties */
  currentNodeName: string = '';
  currentNodeWeight: number = 0;
  currentNodeAchievedValue: number = 0;
  // Typography
  selectedFont: any = '';
  selectedColor: any = '';
  selectedAlignment: any = '';
  // Kpi Type
  kpiType: string = 'measure';
  kpiPercentage: number = 0;
  showKPICalculation: boolean = false;
  kpiCalculationPeriod = 'month-to-date';
  target: any = [{ frequency: 'weekly', value: 0, percentage: 0 }];
  // Contributors
  disabled = false;
  ShowFilter = false;
  limitSelection = false;
  contributors: any = [];
  users: any = [];
  selectedUsers: any;
  dropdownSettings: any = {};
  contributorUsers: any = [];
  selectedContributorUsers: any = [];
  // Metric Formula
  formulagroupDefaultValues: any = {};
  timer: any = null;
  formulaFieldSuggestions: any = [];

  // Person notify
  notifyType: string = "";

  // Share karta
  members: any = [];
  sharedKartaStr: any = [];
  kartas: any = [];
  sharingKarta: any;
  sharedSubmitFlag: boolean = false;
  sharedKartas: any = [];
  selectedSharedUsers: any = [];
  sharingKartaCount: any = 0;
  loading: boolean = false;
  emails: any = [];

  // Version Control
  version: any = [];
  versionId: any = "";
  formulaError: string = "";

  // Undo Redo
  getRemovableNodeId: any = "";
  getRemovableNode: any = null;

  constructor(
    private _kartaService: KartaService,
    private _commonService: CommonService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    // Get karta id from url
    this.kartaId = this.route.snapshot.paramMap.get('id') || '';
  }

  catalogSubmitted: boolean = false;
  catalogSubmitFlag: boolean = false;
  catalogForm = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.blank_space)]], // Validtion for blank space
    node: [null],
    thumbnail: ['']
  });
  get catalog() { return this.catalogForm.controls; }

  ngOnInit(): void {
    const that = this;
    // Formula Fields
    this.formulaGroup = this.fb.group({
      calculatedValue: [0],
      fields: this.fb.array([]),
      formula: ['', Validators.required],
    });

    // Toggle Left Sidebar
    $('#sidebarCollapse').on('click', function () {
      that.togggleLeftSidebar();
    });
    // Close right sidebar when click outside
    $(document).on('click', '.right_sidebar_overlay', function () {
      that.closeRightSidebar();
    });
    // Get all members
    this.getAllMembers();
    // Get versions
    this.getAllVersion();
  }

  // ---------FormArray Functions defined Below----------

  //Adding a New FormulaField Group
  addFormulaGroup() {
    if(this.fields.length < 5) {
      let fieldForm = this.fb.group({
        fieldName: [`Field${this.fields.length + 1}`],
        fieldValue: [0, Validators.min(0)],
      })
      this.fields.push(fieldForm);
      this.recheckFormula();
    }
    else {
      this._commonService.warningToaster("Can't add more than 5 fields");
    }
  }

  //Deleting a particular FormulaField Group
  deleteFormulaGroup(fieldIndex: number) {
    if (this.currentNode.node_type) {
      this.fields.removeAt(fieldIndex);
      let newArr = [];
      for (let i = 0; i < this.fields.length; i++) {
        newArr.push({
          ...this.formulaGroup.controls['fields']['controls'][i]
        });
      }
      this.formulaGroup.patchValue({
        fields: newArr,
      });
      this.recheckFormula();
    }
    else {
      this.fields.removeAt(fieldIndex);
      let newArr = [];
      for (let i = 0; i < this.fields.length; i++) {
        newArr.push({
          ...this.formulaGroup.controls['fields']['controls'][i],
          fieldName: this.currentNode.node_type
            ? this.currentNode.node_type.fields[i].fieldName
            : `Field${i + 1}`,
          // fieldName: this.formulaGroup.controls['fields']['controls'][i].controls.fieldName ? (this.currentNode.node_type ? this.currentNode.node_type.fields[i].fieldName : this.formulaGroup.controls['fields']['controls'][i].controls.fieldName.value) : `Field${i + 1}`,
        });
      }
      this.formulaGroup.patchValue({
        fields: newArr,
      });
      this.recheckFormula();
    }
  }

  // Enable/Disable Readonly value of Formula Fields
  editFieldStatus(id: number, value: boolean) {
    let dom: any = document.getElementById('fd' + id);
    dom.innerHTML = this.formulaGroup.controls['fields'].controls[id].controls['fieldName'].value;
    dom.innerText = this.formulaGroup.controls['fields'].controls[id].controls['fieldName'].value;
    this.formulagroupDefaultValues[id] = dom.innerText;
    $('#fd' + id).attr('contenteditable', value);
    $('#fd' + id).focus();
  }

  // Limiting length for Content Editable
  setLimitForContentEditable(event: any) {
    return event.target.innerText.length < 15;
  }

  // Check Field Value for ReadOnly
  checkFieldStatus(id: any) {
    let element: any = document.getElementById(id);
    if (element) {
      return JSON.parse(element.contentEditable);
    }
    return false;
  }

  // Getting the FormArray values
  get fields() {
    return this.formulaGroup.controls['fields'] as FormArray;
  }

  // Saving Field Values temporarily in an object until the tick option is not clicked
  saveFieldValuesTemporarily(id: number, event: any) {
    let value = event.target.innerText.split(" ").join("_");
    this.formulagroupDefaultValues[id] = value;
  }

  // Set Temporary Field Value to FormArray
  setFieldValues(id: number) {
    let domElem: any = document.getElementById('fd' + id);
    if (domElem.innerText.length == 0) {
      domElem.innerText = this.formulagroupDefaultValues[id];
      domElem.innerHTML = this.formulagroupDefaultValues[id];
    }
    else {
      let checkVal = this.fields['controls'].filter((x: any) => {
        return x.value.fieldName == domElem.innerText;
      });
      
      if(checkVal.length > 0){
        domElem.innerText = this.formulagroupDefaultValues[id];
        domElem.innerHTML = this.formulagroupDefaultValues[id];
      }
      else {
        this.formulaGroup.controls['fields']['controls'][id].patchValue({
          fieldName: this.formulagroupDefaultValues[id],
        });
        if (this.formulagroupDefaultValues[id]) {
          delete this.formulagroupDefaultValues[id];
        }
      }
    }
    this.editFieldStatus(id, false);
    $('#formula-field').focus();
    $('#formula-field').blur();
  }

  // Change formula value of each input blur
  recheckFormula() {
    if ($('#formula-field').val()) {
      $('#formula-field').focus();
      $('#formula-field').blur();
    }
  }

  @HostListener('window:scroll', ['$event']) 
  getScrollPosition() {
    return $('#rightSidebar').scrollTop();
  }

  // Formula Fields Calculation
  calculateFormula(event: any) {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.timer =
      this.formulaFieldSuggestions.length == 0 &&
      setTimeout(() => {
        let tempObj: any = {};
        let originalValue = event.target.value.trim();
        let newValue = '';
        let value = event.target.value.trim().split(/[\s() */%+-]+/g);

        let total: any = 0;
        let checkFrag = false;

        this.fields.controls.forEach((x: any) => {
          tempObj[x['controls']['fieldName'].value] =
            x['controls']['fieldValue'].value;
        });

        value.forEach((y: any) => {
          if (y) {
            if (tempObj[y] || tempObj[y] == 0) {
              newValue = newValue
                ? newValue.replace(y, tempObj[y])
                : originalValue.replace(y, tempObj[y]);
            } else {
              checkFrag = true;
            }
          }
        });
        

        if (this.formulaGroup.valid && originalValue) {
          if (checkFrag) {
            $('#formula-field').addClass('is-invalid');
            $('#formula-field').removeClass('is-valid');
            this.formulaGroup.patchValue({
              calculatedValue: 0,
            });
            this.formulaError = "Invalid Formula!";
          } else {
            total = eval(newValue);
            this.formulaGroup.patchValue({
              calculatedValue: total,
            });

            if(total < 0) {
              $('#formula-field').addClass('is-invalid');
              $('#formula-field').removeClass('is-valid');
              this.formulaError = "Achieved value can't be a negative value..!!";
            }
            else {
              $('#formula-field').removeClass('is-invalid');
              this.formulaError = "";
              let request = {
                ...this.formulaGroup.value,
                metrics: true,
              };
              delete request['calculatedValue'];
  
              let newTarget = this.target.map((obj: any) => {
                let percentage = (total / obj.value) * 100;
                return {
                  ...obj,
                  percentage: Math.round(percentage),
                  value: obj.value
                }
              });
              
              this.currentNode.achieved_value = total;
              this.currentNode.target = newTarget;
              this._kartaService
                .updateNode(this.currentNode.id, { node_type: request, achieved_value: total, target: newTarget })
                .subscribe(
                  (x) => {
                    this.currentNode.node_type = x.node_type;
                    $('#formula-field').addClass('is-valid');
                    this.formulaError = "";
                    let scrollValue = this.getScrollPosition();
                    this.updateNodeProperties(x, scrollValue);
                    let node = this.currentNode;
                    this.updateNode('node_type', request , 'node_updated', node);
                    this.updateNode('achieved_value', total , 'node_updated', node, "metrics");
                    this.updateNode('target', newTarget , 'node_updated', node);
                  },
                  (err) => {
                    console.log(err);
                    this._commonService.errorToaster('Something went wrong..!!');
                  }
              );
            }
          }
        }
      }, 1000);
  }

  //Show Dropdown suggestions for Formula Fields
  filterFieldSuggestions(event: any) {
    $('#formula-field').removeClass('is-invalid');
    $('#formula-field').removeClass('is-valid');
    let value = event.target.value.trim().toLowerCase();
    let mathOperators = ['+', '-', '/', '*', '(', ')', '%'];
    let findLastIndex = null;

    for (let i = value.length - 1; i >= 0; i--) {
      if (mathOperators.includes(value[i])) {
        findLastIndex = value.lastIndexOf(value[i]);
        break;
      }
    }

    if (!value) {
      this.formulaFieldSuggestions = [];
      return;
    }

    if (findLastIndex != -1 || findLastIndex) {
      let replaceValue = value.slice(findLastIndex + 1, value.length).trim();
      if (replaceValue) {
        let data = this.formulaGroup.value.fields.filter((x: any) => {
          return x.fieldName.toLocaleLowerCase().includes(replaceValue.trim());
        });
        return (this.formulaFieldSuggestions = data);
      } else {
        this.formulaFieldSuggestions = [];
        return;
      }
    } else {
      let data = this.formulaGroup.value.fields.filter((x: any) => {
        return x.fieldName.toLocaleLowerCase().includes(value.trim());
      });
      return (this.formulaFieldSuggestions = data);
    }
  }

  // Concatenate Value on click of Dropdown values with Input Value
  concatenateFieldValue(data: any) {
    let addValue = data.fieldName.trim();
    let inputValue: any = document.getElementById('formula-field');
    let mathOperators = ['+', '-', '/', '*', '(', ')', '%'];
    let findLastIndex = -1;

    for (let i = inputValue.value.length; i > 0; i--) {
      if (mathOperators.includes(inputValue.value[i])) {
        findLastIndex = inputValue.value.lastIndexOf(inputValue.value[i]);
        break;
      }
    }

    if (findLastIndex != -1) {
      let concatValue = inputValue.value.slice(0, findLastIndex + 1).trim();
      let finalString = concatValue + addValue;
      inputValue.value = finalString;
      this.formulaGroup.patchValue({
        formula: finalString,
      });
      this.formulaFieldSuggestions = [];
      inputValue.focus();
      return;
    } else {
      inputValue.value = addValue;
      this.formulaGroup.patchValue({
        formula: addValue,
      });
      this.formulaFieldSuggestions = [];
      inputValue.focus();
      return;
    }
  }
  // ---------FormArray Functions defined Above----------

  // TOGGLE LEFT SIDEBAR
  togggleLeftSidebar() {
    $('#sidebar-two').toggleClass('active');
    $('.sidebar_collapsible_btn').toggleClass('show');
    if ($('#sidebar-two').hasClass('active')) {
      $('.sidebar_collapsible_btn img').attr('src', 'assets/img/side-arrow-left.svg');
    } else {
      $('.sidebar_collapsible_btn img').attr('src', 'assets/img/side-arrow-right.svg')
    }
  }
  // HIDE LEFT SIDEBAR
  hideLeftSidebar() {
    $('#sidebar-two').removeClass('active');
    $('.sidebar_collapsible_btn').removeClass('show');
  }
  // CLOSE RIGHT SIDEBAR
  closeRightSidebar() {
    $('#rightSidebar, .right_sidebar_overlay').removeClass('open');
    $('body').removeClass('rightSidebarOpened');
  }
  // OPEN RIGHT SIDEBAR
  openRightSidebar(value?: any) {
    $('#rightSidebar, .right_sidebar_overlay').addClass('open');
    if(value && value !== 0){
      $('#rightSidebar').scrollTop(value);
    }
    else {
      $('#rightSidebar').scrollTop(0);
    }
    $('body').addClass('rightSidebarOpened');
  }

  // DISABLE CHART FUNCTIONS
  disableChart() {
    $("#karta-svg svg .node").css("pointer-events", "none", "cursor", "default");
  }
  // ENABLE CHART FUNCTIONS
  enableChart() {
    $("#karta-svg svg .node").css("pointer-events", "all", "cursor", "pointer");
  }

  // EXPORT KARTA
  exportKarta(type: string) {
    if (type === 'image') this.D3SVG.exportAsImage(this.karta.name);
    else if (type === 'pdf') this.D3SVG.exportAsPDF(this.karta.name);
    else if (type == 'csv') this.exportAsCSV(this.karta);
  }

  // Set karta's div width
  setKartaDimension() {
    let width, height, karta_col_width, karta_col_height, svg_width, svg_height;
    karta_col_width = $('.karta_column').width();
    // karta_col_height = $('.karta_column').height();
    karta_col_height = 455;
    svg_width = $('#karta-svg svg').width();
    svg_height = $('#karta-svg svg').height();

    width = svg_width > karta_col_width ? svg_width : karta_col_width;
    // height = svg_height > karta_col_height ? svg_height : karta_col_height;
    height = 455;

    $('#karta-svg').css('max-width', karta_col_width);
    // $('#karta-svg').css("max-height", karta_col_height + 5);   // For multiple phases
    $('#karta-svg').css('max-height', karta_col_height);
    $('#karta-svg svg').attr('width', width);
    $('#karta-svg svg').attr('height', height);
  }

  // Change chart mode
  changeMode(e: any) {
    if (e.target.value === "enable") this.enableChart();
    else this.disableChart();
  }

  // Get all users
  getAllUser() {
    this._kartaService.getAllUsers().subscribe(
      (response: any) => {
        this.users = response.users[0].data;
      }
    );
  }

  // Get all members
  getAllMembers() {
    let data = {
      limit: 1000,
      type: "all",
      userId: this._commonService.getUserId()
    }
    this._kartaService.getAllMembers(data).subscribe(
      (response: any) => {
        this.contributors = response.members[0].data;
        if (response.members[0].data.length > 0) {
          this.members = response.members[0].data.filter((x: any) => {
            return x.email != this._commonService.getEmailId();
          });
        } else this.members = [];
      }
    );
  }

  // Get all versions
  getAllVersion() {
    this._kartaService.getAllVersions(this.kartaId).subscribe(
      (response: any) => {
        this.version = response;
        this.getColorSettingsByKarta();
      }
    );
  }

  // Measure calculation section
  setTarget(type: string, e: any, index: any) {
    let node = this.currentNode;
    if (type === 'frequency') {
      this.target[index].frequency = e.target.value;
      if (index === 0 && node.hasOwnProperty("start_date")) this.setDueDate(node.start_date);
      this.updateNode('target', this.target, 'node_updated', node);
    }
    else {
      let percentage = (node.achieved_value / e.target.value) * 100;
      this.target[index].percentage = Math.round(percentage);
      this.target[index].value = parseInt(e.target.value);
      this.updateNode('target', this.target, 'node_updated', node);
      
    }
  }
  addMoreTarget() {
    this.target.push({
      frequency: 'monthly',
      value: 0,
      percentage: 0,
    });
  }
  removeTarget(index: number) {
    this.target.splice(index, 1);
    let node = this.currentNode;
    this.updateNode('target', this.target, 'node_update_key_remove', node);
  }

  // Find phase index
  phaseIndex(phaseId: string) {
    return this.phases.findIndex((item: any) => {
      return item.id === phaseId;
    });
  }
  // Update node properties
  updateNodeProperties(param: any, scroll?: any) {
    this.currentNode = param;
    this.phaseId = param.phaseId;
    this.selectedFont = param.font_style;
    this.selectedColor = param.text_color;
    this.selectedAlignment = param.alignment;
    this.currentNodeName = param.name;
    this.currentNodeWeight = param.weightage;
    this.currentNodeAchievedValue = param.achieved_value;
    if (param.hasOwnProperty("node_type")) {
      this.formulaGroup.controls['fields'] = new FormArray([]);
      for (let i = 0; i < param.node_type.fields.length; i++ ) {
        let fieldForm = this.fb.group({
          fieldName: new FormControl(param.node_type.fields[i].fieldName),
          fieldValue: new FormControl(param.node_type.fields[i].fieldValue),
        })
        this.fields.push(fieldForm);
      }
      this.formulaGroup.patchValue({
        calculatedValue: param.achieved_value,
        formula: param.node_type.formula,
      });
    } else {
      let newArr: any = [];
      this.formulaGroup.controls['fields'] = new FormArray(newArr);
      if(this.formulaGroup.controls['fields'].controls.length == 0){
        if(!this.currentNode.node_type){
          for(let i = 0; i < 2; i++){
            newArr.push(this.fb.group({
              fieldName: [`Field${i + 1}`],
              fieldValue: [0, Validators.min(0)],
            }))
          }
        }
      }
      this.formulaGroup.controls['fields'] = new FormArray(newArr);
      this.formulaGroup.patchValue({
        calculatedValue: 0,
        formula: '',
      });
    }

    this.showKPICalculation = false;

    // Show properties right sidebar
    if(scroll && scroll !== 0){
      this.openRightSidebar(scroll);
    } else {
      this.openRightSidebar();
    }
    // Get suggestion by phase id
    this.getSuggestionByPhaseId(param);
    // Show Measure and metrics when KPI's node selected
    if (this.currentNode.phase.name === 'KPI') {
      this.showKPICalculation = true;
      // Set target
      if (param.target) this.target = param.target;
      else this.target = [{ frequency: 'monthly', value: 0, percentage: 0 }];
      // Set due date, if available
      if (this.currentNode.due_date)
        this.currentNode.due_date = new Date(this.currentNode.due_date).toISOString().substring(0, 10);
    }

    if (this.currentNode.notifyUserId === this.currentNode.contributorId) this.notifyType = "owner";
    else if (this.currentNode.notifyUserId) this.notifyType = "specific";
  }

  // Set due date
  setDueDate(start_date: any) {
    let due_date: any;
    let node = this.currentNode;
    if (node.target[0].frequency === "weekly") {
      due_date = moment(start_date).add(1, 'weeks');
    } else if (node.target[0].frequency === "monthly") {
      due_date = moment(start_date).add(1, 'months');
    } else if (node.target[0].frequency === "quarterly") {
      due_date = moment(start_date).add(3, 'months');
    } else if (node.target[0].frequency === "annually") {
      due_date = moment(start_date).add(1, 'years');
    }
    this.updateNode('due_date', due_date, 'node_updated', node);
  }

  // Change node name
  changeNodeName() {
    if (this.currentNodeName !== "") {
      let node = this.currentNode;
      this.updateNode('name', this.currentNodeName, 'node_updated', node);
    }
  }
  // Change weightage
  changeWeightage() {
    let node = this.currentNode;
    if (this.currentNodeWeight < 0 || !this.currentNodeWeight) this._commonService.errorToaster("Please enter any positive value less than or equal to 100!");
    else if (this.currentNodeWeight > 100) this._commonService.errorToaster("Weighting cannot be greator than 100!");
    else {
      let sum = node.parent.children
        .filter((item: any) => item.id !== node.id)
        .reduce((total: any, currentValue: any) => total + currentValue.weightage, 0);
      if (sum + this.currentNodeWeight > 100) {
        this._commonService.errorToaster("Your aggregate weighting of all the nodes cannot be greator than 100!");
      } else this.updateNode('weightage', this.currentNodeWeight, 'node_updated', node);
    }
  }
  // Change font style
  changeFontStyle() {
    let node = this.currentNode;
    this.updateNode('font_style', this.selectedFont, 'node_updated', node);
  }
  // Change alignment
  changeAlignment(value: string) {
    this.selectedAlignment = value;
    let node = this.currentNode;
    this.updateNode('alignment', value, 'node_updated', node);
  }
  // Change text color
  changeTextColor() {
    let node = this.currentNode;
    this.updateNode('text_color', this.selectedColor, 'node_updated', node);
  }
  // Change start date
  changeStartDate(el: any) {
    this.setDueDate(el.target.value);
    let node = this.currentNode;
    this.updateNode('start_date', el.target.value, 'node_updated', node);
  }
  // Change days to calculate
  changeDaysToCalculate(el: any) {
    let node = this.currentNode;
    this.updateNode('days_to_calculate', el.target.value, 'node_updated', node);
  }
  // Change fiscal year start date
  changeFiscalStartDate(el: any) {
    let node = this.currentNode;
    this.updateNode('fiscal_year_start_date', el.target.value, 'node_updated', node);
  }
  // Change fiscal year end date
  changeFiscalEndDate(el: any) {
    let node = this.currentNode;
    this.updateNode('fiscal_year_end_date', el.target.value, 'node_updated', node);
  }
  // Change kpi calculation periods
  changeKPIPeriods(el: any) {
    let node = this.currentNode;
    if (el.target.value === "month-to-date" || el.target.value === "year-to-date") {
      this.karta.node.percentage = Math.round(this.calculatePercentage(this.karta.node));
      this.D3SVG.updateNode(this.karta.node);
      this.updateNode('kpi_calc_period', el.target.value, 'node_updated', node);
    } else {
      this._kartaService.getKPICalculation({ "nodeId": node.id, "type": el.target.value }).subscribe(
        (response: any) => {
          this.kpiPercentage = response.data.percentage;
          this.karta.node.percentage = Math.round(this.calculatePercentage(this.karta.node));
          this.D3SVG.updateNode(this.karta.node);
        }
      );
    }
  }
  // Change achieved value
  changeAchievedValue() {
    let node = this.currentNode;
    if (this.currentNodeAchievedValue < 0 || this.currentNodeAchievedValue === null) this._commonService.errorToaster("Please enter positive value!");
    else if (this.currentNodeAchievedValue > 9999) this._commonService.errorToaster("Achieved value cannot be greator than 9999!");
    else {
      // Calculate new percentage
      this.target.forEach((element: any) => {
        let percentage = (this.currentNodeAchievedValue / element.value) * 100;
        return (element.percentage = Math.round(percentage));
      });
      // Submit updated achieved value
      this.updateNode('achieved_value', this.currentNodeAchievedValue, 'node_updated', node, "measure");
      this.updateNode('target', this.target, 'node_updated', node);
    }
  }
  // Change contributor
  changeContributor(userId: string) {
    let node = this.currentNode;
    this.updateNode('contributorId', userId, 'node_updated', node);
  }
  // Set notify user
  setNotifyUser() {
    let node = this.currentNode;
    if (this.notifyType === "owner") {
      this.updateNode('notifyUserId', this.karta.userId, 'node_updated', node);
      node.notifyUserId = this.karta.userId;
    } else if (this.notifyType === "") {
      this.updateNode('notifyUserId', "", 'node_updated', node);
      node.notifyUserId = "";
    } else node.notifyUserId = undefined;
  }
  selectNotifyUser(userId: string) {
    let node = this.currentNode;
    this.updateNode('notifyUserId', userId, 'node_updated', node);
    node.notifyUserId = userId;
  }
  // Change alert type
  changeAlertType(e: any) {
    let node = this.currentNode;
    this.updateNode('alert_type', e.target.value, 'node_updated', node);
    node.alert_type = e.target.value;
  }
  // Change alert frequency
  changeAlertFrequency(e: any) {
    let node = this.currentNode;
    this.updateNode('alert_frequency', e.target.value, 'node_updated', node);
    node.alert_frequency = e.target.value;
  }

  // Calculate each node percentage
  calculatePercentage(params: any, percentage: number = 0) {
    let total_percentage: number[] = [];
    // Set blank array for children, if not available
    if (!params.hasOwnProperty("children")) params.children = [];
    params?.children?.forEach((element: any) => {
      // Check if current element is a kpi node or not
      if (element.phase.name === "KPI") {
        let targetValue = 0;
        const todayDate = moment().date();
        const currentYear = moment().year();
        const dayOfYear = moment().dayOfYear();
        const daysInMonth = moment().daysInMonth();
        const daysInYear = moment([currentYear]).isLeapYear() ? 366 : 365;

        function findTarget(type: string) {
          return element.target.find((item: any) => item.frequency === type);
        }
        // Set target value according to month to date
        if (element.kpi_calc_period === "month-to-date") {
          if (findTarget('monthly')) targetValue = findTarget('monthly').value;
          else if (findTarget('annually')) targetValue = findTarget('annually').value / 12;
          else if (findTarget('quarterly')) targetValue = findTarget('quarterly').value / 3;
          else if (findTarget('weekly')) targetValue = findTarget('weekly').value * 4;
          targetValue = todayDate * (targetValue / daysInMonth);
        }
        // Set target value according to year to date
        else if (element.kpi_calc_period === "year-to-date") {
          if (findTarget('annually')) targetValue = findTarget('annually').value;
          else if (findTarget('monthly')) targetValue = findTarget('monthly').value * 12;
          else if (findTarget('quarterly')) targetValue = findTarget('quarterly').value * 4;
          else if (findTarget('weekly')) targetValue = findTarget('weekly').value * 52;
          targetValue = dayOfYear * (targetValue / daysInYear);
        }
        // Set percentage for month-over-month and year-over-year
        else if (element.kpi_calc_period === "month-over-month" || element.kpi_calc_period === "year-over-year") {
          element.percentage = this.kpiPercentage;
        }
        // const totalDays = moment().daysInMonth();
        // const todayDay = moment().date();
        // targetValue = element.target[0].value;
        // targetValue = todayDay * (targetValue / totalDays);
        if (element.kpi_calc_period === "month-to-date" || element.kpi_calc_period === "year-to-date") {
          let current_percentage= (element.achieved_value/targetValue) * 100;
          element.percentage = Math.round(current_percentage);
          element.percentage = element.percentage === Infinity ? 0 : element.percentage;
        }
        // if (element.percentage > 100) {
        //   let colorSetting = this.colorSettings.settings.filter((item: any) => item.min === 101 && item.max === 101);
        //   element.border_color = colorSetting[0]?.color || 'black';
        // } else if (this.colorSettings.settings) {
        //   let colorSetting = this.colorSettings.settings.filter((item: any) => element.percentage >= item.min && element.percentage <= item.max);
        //   element.border_color = colorSetting[0]?.color || 'black';
        // } else element.border_color = 'black';
        // Set percentage for target nodes, if exists
        // if (element.hasOwnProperty("children") && element.children.length > 0) {
        //   element.children[0].percentage = Math.round(current_percentage);
        // }
      } else {
        let returned_percentage = this.calculatePercentage(element, percentage);
        element.percentage = Math.round(returned_percentage);
        element.percentage = element.percentage === Infinity ? 0 : Math.round(returned_percentage);
        // if (element.percentage > 100) {
        //   let colorSetting = this.colorSettings.settings.filter((item: any) => item.min === 101 && item.max === 101);
        //   element.border_color = colorSetting[0]?.color || 'black';
        // } else if (this.colorSettings.settings) {
        //   let colorSetting = this.colorSettings.settings.filter((item: any) => element.percentage >= item.min && element.percentage <= item.max);
        //   element.border_color = colorSetting[0]?.color || 'black';
        // } else element.border_color = 'black';
      }
      total_percentage.push(((element.percentage * element.weightage) / 100) || 0);
    });
    let aggregate_percentage = total_percentage.reduce((acc: number, num: number) => acc + num, 0);
    return aggregate_percentage;
  }

  // Get karta details including all nodes
  getKartaInfo() {
    this._kartaService.getKarta(this.kartaId).subscribe(
      (response: any) => {
        this.karta = response;
        this.versionId = response.versionId;
        this.sharedKartaStr = response;
        if (this.karta.node) {
          this.karta.node.percentage = Math.round(
            this.calculatePercentage(this.karta.node)
          );
          BuildKPIKarta(this.karta.node, '#karta-svg', this.D3SVG);
          this.setKartaDimension();
          this.showSVG = true;
        }
      }
    ).add(() => (this.loadingKarta = false));
  }

  versionRollback(event: any){
    this._kartaService.versionControlHistory({versionId: event.target.value, kartaId: this.kartaId}).subscribe(
      (data) => {
        $('#karta-svg svg').remove();
        this.getKartaInfo();
        this.recheckFormula();
      },
      (err) => console.log(err)
    );
  }

  // Get all phases
  getPhases() {
    this._kartaService.getPhases().subscribe((response: any) => {
      this.phases = response;
      // this._kartaService.getSubPhases(this.kartaId).subscribe(
      //   (response: any) => {
      //     this.subPhases = response;
      //     this.phases.forEach((item: any, index: number) => {
      //       this.subPhases.forEach((sub_item: any) => {
      //         if (item.id === sub_item.kartaPhaseId) this.phases.splice(index+1, 0, sub_item);
      //       });
      //     });
          this.getKartaInfo();
      //   }
      // );
    });
  }

  // Get suggestion by phaseId
  getSuggestionByPhaseId(param: any) {
    let phase = this.phases[this.phaseIndex(param.phaseId)];
    let data = {
      userId: this._commonService.getUserId(),
      phaseId: phase.kartaPhaseId ? phase.kartaPhaseId : phase.id,
    };
    this._kartaService.getSuggestion(data).subscribe(
      (response: any) => {
        this.suggestion = response;
      },
      (error: any) => { }
    );
  }

  // Get color settings by karta
  getColorSettingsByKarta() {
    let data = {
      userId: this._commonService.getUserId(),
      kartaId: this.kartaId
    }
    this._kartaService.getColorSettingsByKarta(data).subscribe(
      (response: any) => {
        this.colorSettings = response.color_settings;
        this.colorSettings.settings = this.colorSettings.settings.sort((a: any,b: any) => a.min - b.min);
        this.getPhases();
      }
    );
  }

  // Add node
  addNode(param: any) {
    let phase = this.phases[this.phaseIndex(param.phaseId) + 1];
    let data: any = {
      kartaDetailId: this.kartaId,
      phaseId: phase.id,
      parentId: param.id
    }
    if (phase.name === "KPI") {
      data.target = [{ frequency: 'monthly', value: 0, percentage: 0 }];
      data.achieved_value = 0;
      // data.threshold_value = 70;
      data.is_achieved_modified = false;
      data.alert_type = "";
      data.alert_frequency = "";
      data.kpi_calc_period = 'month-to-date';
    }
    this._kartaService.addNode(data).subscribe((response: any) => {
      response.phase = phase;
      this.D3SVG.updateNewNode(param, response);
      this.setKartaDimension();
      this.updateNodeProperties(response);
      // this.D3SVG.updateNode(param, response);
      // this.getKartaInfo();
      let new_response = {
        ...data,
        name: response.name,
        font_style: response.font_style,
        alignment: response.alignment,
        text_color: response.text_color,
        weightage: response.weightage,
      };

      let history_data = {
        event: "node_created",
        eventValue: new_response,
        kartaNodeId: response.id,
        userId: this._commonService.getUserId(),
        versionId: this.versionId,
        kartaId: this.kartaId,
        parentNodeId: param.id,
        historyType: 'main'
      };
      this._kartaService.addKartaHistoryObject(history_data).subscribe(
        (result: any) => {
          this._kartaService.updateKarta(this.kartaId, {historyId: result.id}).subscribe(
            (res: any) => {}
          );
          this._kartaService.syncKartaHistory({kartaId: this.kartaId, versionId: this.versionId}).subscribe(
            (res: any) => {}
          );
        }
      );
    });
  }

  // Add right node
  // addNodeRight(param: any) {
  //   let currentPhaseIndex = this.phaseIndex(param.phaseId);
  //   const isExists = this.phases.filter((item: any): any => {
  //     if (item.hasOwnProperty("parentId")) return item.parentId === param.phaseId;
  //   });
  //   if (isExists.length <= 0) {
  //     let mainPhase: string = "";
  //     if (this.phases[currentPhaseIndex].hasOwnProperty("kartaPhaseId")) mainPhase = this.phases[currentPhaseIndex].kartaPhaseId;
  //     else mainPhase = this.phases[currentPhaseIndex].id;
  //     // Set new phase name
  //     let nameString, lastString, num, joinedName, newName;
  //     nameString = this.phases[currentPhaseIndex].name.split(" ");
  //     lastString = parseInt(nameString[nameString.length - 1]);
  //     num = lastString ? lastString + 1 : 1;
  //     lastString ? nameString.pop() : nameString;
  //     joinedName = nameString.join(" ");
  //     newName = `${joinedName} ${num}`;
  //     let data = {
  //       "name": newName,
  //       "kartaId": this.kartaId,
  //       "parentId": param.phaseId,
  //       "kartaPhaseId": mainPhase
  //     }
  //     this._kartaService.addSubPhase(data).subscribe(
  //       (response: any) => {
  //         let resopnse_data = {
  //           "id": response.id,
  //           "name": response.name,
  //           "parentId": param.phaseId,
  //           "kartaPhaseId": mainPhase
  //         }
  //         this.phases.splice((currentPhaseIndex + 1), 0, resopnse_data);
  //         this.addNode(param);
  //       }
  //     );
  //   } else this.addNode(param, 'Child 2');
  //   this.setKartaDimension();
  //   this.D3SVG.buildOneKartaDivider();
  // }

  // Update new percentage
  updateNewPercentage() {
    this._kartaService.getKarta(this.kartaId).subscribe(
      (response: any) => {
        this.karta = response;
        this.karta.node.percentage = Math.round(this.calculatePercentage(this.karta.node));
        this.D3SVG.updateNode(this.karta.node, true);
      }
    );
  }

  // Update node
  updateNode(key: string, value: any, event: string = "unknown", updatingNode?: any, typeValue?: any) {
    let data = { [key]: value }
    if( key == "achieved_value" ) {
      data["type_value"] = typeValue
    };
    this._kartaService.updateNode(updatingNode.id? updatingNode.id: this.currentNode.id, data).subscribe(
      (response: any) => {
        let oldValue = {
          [key]: updatingNode[key]
        };
        updatingNode[key] = value;
        this.D3SVG.updateNode(updatingNode);
        // Calculate new percentage when any achieved, target and weightage value changes
        if (key === "achieved_value" || key === "target" || key === "weightage" || key == "contributorId") {
          this.updateNewPercentage();
        }
        // Save the karta update history
        let history_data = {
          event,
          eventValue: {
            [key]: value
          },
          oldValue,
          kartaNodeId: updatingNode.id,
          userId: this._commonService.getUserId(),
          versionId: this.versionId,
          kartaId: this.kartaId,
          parentNodeId: updatingNode.parentId,
          historyType: 'main'
        }
        this._kartaService.addKartaHistoryObject(history_data).subscribe(
          (response: any) => { }
        );
      }
    );
  }

  onCatalogSubmit  = async () => {
    
    this.catalogSubmitted = true;

    if (this.catalogForm.valid) {
      // Highlight nodes
      this.D3SVG.hightlightNode(this.catalogForm.value.node);
      // Get base64 image of highlighted nodes
      this.D3SVG.getBase64Image(this.catalogForm.value.node, (base64Image: string) => {
        // Set thumbnail
        this.catalogForm.patchValue({ thumbnail: base64Image });
        this.catalogForm.value.userId = this._commonService.getUserId();
        
        this.catalogForm.value.node = "ag"
        this.catalogSubmitFlag = true;
        this._kartaService.addNodeInCatalog(this.catalogForm.value).subscribe(
          (response: any) => {
            this._commonService.successToaster("Node saved successfully!");
            $("#saveNodeModal").modal('hide');
            this.catalogForm.reset();
            this.catalogSubmitted = false;
          }
        ).add(() => this.catalogSubmitFlag = false );
      })
    }
  }

  // Remove node from karta
  removeNode(param: any) {
    this._kartaService.removeNode(param.id).subscribe((response: any) => {
      this.setKartaDimension();
      // this.D3SVG.removeOneKartaDivider();
      let kpi_check_obj = {
        target: "target",
        achieved_value: 'achieved_value',
        threshold_value: 'threshold_value',
        is_achieved_modified: 'is_achieved_modified',
        alert_type: 'alert_type',
        alert_frequency: 'alert_frequency',
        kpi_calc_period: 'kpi_calc_period'
      };

      let new_obj: any = {
        kartaDetailId: this.kartaId,
        phaseId: param.phaseId,
        parentId: param.parentId,
        name: param.name,
        font_style: param.font_style,
        alignment: param.alignment,
        text_color: param.text_color,
        weightage: param.weightage,
      }

      Object.keys(kpi_check_obj).forEach(x => {
        if(param[x]){
          new_obj[x] = param[x];
        }
      });

      let history_data = {
        event: 'node_removed',
        eventValue: new_obj,
        kartaNodeId: param.id,
        userId: this._commonService.getUserId(),
        versionId: this.versionId,
        kartaId: this.kartaId,
        parentNodeId: param.parentId,
        historyType: 'main'
      }
      this._kartaService.addKartaHistoryObject(history_data).subscribe(
        (response: any) => { }
      );
    });
  }

  // On karta lines hover
  onMouseOverKartaLines(ev: any) {
    ev.preventDefault();
    let element = document.getElementById(ev.target.id);
    if (element) element.classList.add('selectedPhase');
  }
  onMouseLeaveKartaLines(ev: any) {
    ev.preventDefault();
    let element = document.getElementById(ev.target.id);
    if (element) element.classList.remove('selectedPhase');
  }
  addRoteNode(ev: any) {
    let element = ev.target.closest('div');
    this.onDrop(element.id, 'add_root');
  }

  onDragOver(ev: any) {
    ev.preventDefault();
    this.hideLeftSidebar();
    let element = document.getElementById(ev.target.id);
    if (element) element.classList.add('selectedPhase');
  }
  onDragLeave(ev: any) {
    ev.preventDefault();
    this.isRtNodDrgingFrmSide = false;
    let element = document.getElementById(ev.target.id);
    if (element) element.classList.remove('selectedPhase');
  }

  onDragStart(ev: any) {
    this.isRtNodDrgingFrmSide = true;
  }

  onDrop(ev: any, type?: string) {
    let phaseId = '';
    if (type == 'add_root') phaseId = ev;
    else {
      ev.preventDefault();
      phaseId = ev.target.id;
    }
    let phase = this.phases[this.phaseIndex(phaseId.substring(9))];
    let data = {
      name: "Empty",
      phaseId: phaseId.substring(9),
      kartaId: this.kartaId,
      weightage: 100,
    };
    this._kartaService.addNode(data).subscribe((response: any) => {
      response.phase = phase;
      this.getKartaInfo();
      this.showSVG = true;
      this.isRtNodDrgingFrmSide = false;
      this.updateNodeProperties(response);

      let history_data = {
        event: "node_created",
        eventValue: data,
        kartaNodeId: response.id,
        userId: this._commonService.getUserId(),
        versionId: this.versionId,
        kartaId: this.kartaId,
        historyType: 'main'
      };
      this._kartaService.addKartaHistoryObject(history_data).subscribe(
        (result: any) => { }
      );
    });
  }

  // Save karta
  saveKarta() {
    // New Version Calculation
    let versionNumber = this.version.reduce((acc: any,curr: any) => {
      let num = curr.name;
      if(Number(num) > acc){
        acc = Number(num);
      }
      return acc;
    }, 0);

    // New Version Object
    let new_version = {
      name: `${versionNumber+1}`,
      kartaId: this.kartaId,
      versionId: this.versionId
    };

    this._kartaService.createVersion(new_version).subscribe(
      (versionResponse: any) => {
        // New Karta Data
        let data = {
          name: this.karta.name,
          versionId: versionResponse.data.id
        };

        this._kartaService.updateKarta(this.kartaId, data).subscribe(
          (kartaResponse: any) => {
            this.karta = kartaResponse;
            this._commonService.successToaster("New version created successfully..!!");
          },
          (err: any) => console.log(err)
        )
        this.getAllVersion();
      },
      (err: any) => console.log(err)
    );
  }

  // Export karta to CSV
  csvKartaData: any = [
    {
      name: "",
      weightage: "",
      font_style: "",
      alignment: "",
      text_color: "",
      kartaName: "",
      createdAt: "",
      phaseId: "",
      phaseName: "",
      percentage: ""
    }
  ];
  pushCSVData(data: any) {
    if (!data.hasOwnProperty("parentId")) {
      data.kartaName = this.karta.name;
      data.phaseName = this.phases[this.phaseIndex(data.phaseId)].name;
      this.csvKartaData.push(data);
    }
    if (data.hasOwnProperty("children") && data.children.length > 0) {
      data.children.forEach((element: any) => {
        element.kartaName = this.karta.name;
        element.phaseName = this.phases[this.phaseIndex(element.phaseId)].name;
        this.csvKartaData.push(element);
        this.pushCSVData(element);
      });
    }
  }
  exportAsCSV(param: any) {
    this.pushCSVData(param.node);
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      useTextFile: false,
      filename: this.karta.name,
      useBom: true,
      headers: ['Name', 'Weightage', 'Font_style', 'Alignment', 'Text_color',
        'Karta Name', 'CreatedAt', 'Phase Id', 'Phase Name', 'Percentage']
    };
    const csvExporter = new ExportToCsv(options);
    csvExporter.generateCsv(this.csvKartaData);
  }

  // Sharing karta
  onShare(param: any) {
    delete param.node
    this.selectedSharedUsers = [];
    this.sharingKarta = param;
    if (param.sharedTo) this.sharingKartaCount = param.sharedTo.length;
    else this.sharingKartaCount = 0;
  }
  // Email validation
  addTagPromise(e: string) {
    return new Promise((resolve) => {
      this.loading = true;
      var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (e.match(mailformat)) {
        // Callback function
        setTimeout(() => {
          resolve({ email: e });
          this.loading = false;
        });
      } this.loading = false;
    })
  }

  shareKarta() {
    let email_array: any = [];
    this.selectedSharedUsers.forEach((element: any) => {
      if (element.email == this._commonService.getEmailId()) {
        alert("You can not share karta to your self.");
      } else email_array.push(element.email);
    });
    if (email_array.length > 0) {
      let data = {
        karta: this.sharingKarta,
        emails: email_array
      }
      this.sharedSubmitFlag = true;

      this._kartaService.shareKarta(data).subscribe(
        (response: any) => {
          this._commonService.successToaster("Your have shared karta successfully");
          $('#shareKartaModal').modal('hide');
          email_array.forEach((element: any) => {
            this.karta.sharedTo.push({ email: element });
          });
        },
        (error: any) => { console.log(error) }
      ).add(() => this.sharedSubmitFlag = false);
    }
  }

  // Color setting functions 
  removeColor(index: number) {
    this.colorSettings.settings.splice(index, 1);
    this.saveColorSetting();
  }
  onColorChange2(colorCode: string, index: number) {
    this.colorSettings.settings[index].color = colorCode;
    this.saveColorSetting();
  }
  onMinValueChange(value: number) {
    this.colorForm.patchValue({ min: value });
  }
  onMaxValueChange(value: number) {
    this.colorForm.patchValue({ max: value });
  }
  checkInRange(minValue: number, maxValue: number): boolean {
    for (let item of this.colorSettings.settings) {
      if (minValue >= item.min && minValue <= item.max) return true;
      else if (maxValue >= item.min && maxValue <= item.max) return true;
    }
    return false;
  }
  findColorInRange(color: string) {
    return this.colorSettings.settings.find((item: any) => item.color === color);
  }
  sumOfRange() {
    let sum = 0;
    for (let i = 0; i < this.colorSettings.settings.length; i++) {
      if (this.colorSettings.settings[i].min < 101 && this.colorSettings.settings[i].max < 101) {
        sum += this.colorSettings.settings[i].max - this.colorSettings.settings[i].min;
      }
    }
    return sum += this.colorSettings.settings.length - 2;
  }
  onColorSubmit() {
    if (this.checkInRange(this.colorForm.value.min, this.colorForm.value.max)) {
      this._commonService.errorToaster("You cannot add this range of color!");
    } else {
      if (this.findColorInRange(this.colorForm.value.color)) this._commonService.errorToaster("This color has aleady been taken by other ranges!");
      else this.colorSettings.settings.push(this.colorForm.value); this.saveColorSetting();
    }
  }
  saveColorSetting() {
    if (this.colorForm.valid) {
      if (this.sumOfRange() == 100) {
        this.colorSubmitFlag = true;
        if (this.colorSettings.hasOwnProperty("userId") && this.colorSettings.hasOwnProperty("kartaId")) {
          this._kartaService.updateColorSetting(this.colorSettings, this.colorSettings.id).subscribe(
            (response: any) => {
              this.colorSettings = response;
              this.colorSettings.settings = this.colorSettings.settings.sort((a: any,b: any) => a.min - b.min);
              this._commonService.successToaster("Settings saved successfully");
            }
          ).add(() => this.colorSubmitFlag = false);
        } else {
          let settingData = {
            userId: this._commonService.getUserId(),
            kartaId: this.kartaId,
            settings: this.colorSettings.settings
          }
          this._kartaService.createColorSetting(settingData).subscribe(
            (response: any) => {
              this.colorSettings = response;
              this.colorSettings.settings = this.colorSettings.settings.sort((a: any,b: any) => a.min - b.min);
              this._commonService.successToaster("Settings saved successfully");
            }
          ).add(() => this.colorSubmitFlag = false);
        }
      } else this._commonService.errorToaster("Please complete all the color ranges!");
    }
  }

  colorFunctionDropDown() {
    (document.getElementById('colorDropdown') as HTMLFormElement).classList.toggle("show");
  }
  // Color setting ends

  // Undo Redo Functionality starts
  returnChildNode(node: any) {
    if(node.id == this.getRemovableNodeId){
      this.getRemovableNode = node;
      return;
    } else {
      if (node.children) {
        for(let i = 0; i < node.children.length; i++){
          if(this.getRemovableNode){
            break;
          }
          this.returnChildNode(node.children[i]);
        }
      }
    }
  }

  undoKarta() {
    this._kartaService.undoFunctionality({ kartaId: this.kartaId, versionId: this.versionId }).subscribe(
      (x: any) => {
        if(x.data.message != "nothing"){
          if(x.data.message != "final"){
            switch(x.data.data.event){
              case "node_created":
                if(x.data.data){
                  this.getRemovableNodeId = x.data.data.kartaNodeId;
                  this.returnChildNode(this.karta.node);
                  this._kartaService.getNode(this.getRemovableNode.parentId).subscribe((kartaNode: any) => {
                    this.D3SVG.updateRemovedNode(this.getRemovableNode);
                    let phase = this.phases[this.phaseIndex(kartaNode.phaseId)];
                    kartaNode.phase = phase;
                    this.setKartaDimension();
                    this.updateNodeProperties(kartaNode);
                    this.getRemovableNode = null;
                    this.getRemovableNodeId = "";
                  });
                }
                break;
              case "node_updated":
                if(x.data.data){
                  this._kartaService.getNode(x.data.data.kartaNodeId).subscribe((kartaNode: any) => {
                    let phase = this.phases[this.phaseIndex(kartaNode.phaseId)];
                    kartaNode.phase = phase;
                    this.showSVG = true;
                    this.isRtNodDrgingFrmSide = false;
                    this.updateNodeProperties(kartaNode);
                    this.D3SVG.updateNode(this.currentNode);
                  },
                  (err) => {
                    console.log(err);
                  });
                }
                break;
              case "node_removed":
                if(x.data.data) {
                  if(x.data.data){
                    this._kartaService.getNode(x.data.data.kartaNodeId).subscribe((kartaNode: any) => {
                      let phase = this.phases[this.phaseIndex(kartaNode.phaseId)];
                      kartaNode.phase = phase;
                      this.showSVG = true;
                      this.isRtNodDrgingFrmSide = false;
                      this.updateNodeProperties(kartaNode);
                      // Will think below line's alternative
                      this.getKartaInfo();
                      setTimeout(() => {
                        $('#karta-svg').children("svg").eq(1).remove();
                      }, 2000);
                    },
                    (err) => {
                      console.log(err);
                    });
                  }
                }
                break;
            }
          }
          else {
            this._commonService.warningToaster("Undo reached..!!");
          }
        }
      }
    )
  }

  async redoKarta() {
    this._kartaService.redoFunctionality({ kartaId: this.kartaId, versionId: this.versionId }).subscribe(
      (x: any) => {
        if(x.data.message != "nothing"){
          if(x.data.message != "final"){
            switch(x.data.data.event){
              case "node_created":
                if(x.data.data){
                  this._kartaService.getNode(x.data.data.kartaNodeId).subscribe((kartaNode: any) => {
                    let phase = this.phases[this.phaseIndex(kartaNode.phaseId)];
                    kartaNode.phase = phase;
                    this.showSVG = true;
                    this.isRtNodDrgingFrmSide = false;
                    this.updateNodeProperties(kartaNode);
                    // Will think below line's alternative
                    this.getKartaInfo();
                    setTimeout(() => {
                      $('#karta-svg').children("svg").eq(1).remove();
                    }, 2000);
                  },
                  (err) => {
                    console.log(err);
                  });
                }
                break;
              case "node_updated":
                if(x.data.data){
                  this._kartaService.getNode(x.data.data.kartaNodeId).subscribe((kartaNode: any) => {
                    let phase = this.phases[this.phaseIndex(kartaNode.phaseId)];
                    kartaNode.phase = phase;
                    this.showSVG = true;
                    this.isRtNodDrgingFrmSide = false;
                    this.updateNodeProperties(kartaNode);
                    this.D3SVG.updateNode(this.currentNode);
                  },
                  (err) => {
                    console.log(err);
                  });
                }
                break;
              case "node_removed":
                if(x.data.data){
                  this.getRemovableNodeId = x.data.data.kartaNodeId;
                  this.returnChildNode(this.karta.node);
                  this._kartaService.getNode(this.getRemovableNode.parentId).subscribe((kartaNode: any) => {
                    this.D3SVG.updateRemovedNode(this.getRemovableNode);
                    let phase = this.phases[this.phaseIndex(kartaNode.phaseId)];
                    kartaNode.phase = phase;
                    this.setKartaDimension();
                    this.updateNodeProperties(kartaNode);
                    this.getRemovableNode = null;
                    this.getRemovableNodeId = "";
                  });
                }
                break;
            }
          }
          else {
            this._commonService.warningToaster("Redo reached..!!");
          }
        }
      }
    )
  }
  // Undo Redo Functionality ends

}

