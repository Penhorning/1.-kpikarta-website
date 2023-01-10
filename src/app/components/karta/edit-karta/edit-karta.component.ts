import { Component, HostListener, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ExportToCsv } from 'export-to-csv';
import { CommonService } from '@app/shared/_services/common.service';
import { KartaService } from '../service/karta.service';
import * as BuildKPIKarta from '../utils/d3.js';
import * as jqueryFunctions from '../utils/jqueryOperations.js';
import { Options } from '@angular-slider/ngx-slider';
import * as moment from 'moment';
import * as MetricOperations from '../utils/metricFormulaOperations';
import { CalculatePercentage } from '../utils/calculatePercentage';

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
  colorSettings: any = [];
  suggestion: any;
  loadingKarta: boolean = true;
  loader: any = this._commonService.loader;
  showSVG: boolean = false;
  isRtNodDrgingFrmSide: boolean = false;
  isNodeDropable: boolean = false;
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
    color: ["#000000", Validators.required],
    min: [this.minValue, Validators.required],
    max: [this.maxValue, Validators.required]
  });

  // D3 karta events
  previousDraggedParentId: string = "";
  previousDraggedPhaseId: string = "";
  D3SVG: any = {
    phases: () => this.phases,
    events: {
      addNode: (d: any) => {
        this.addNode(d);
      },
      addNodeRight: (d: any) => {
        this.addNodeRight(d);
      },
      updateDraggedNode: (draggingNode: any) => {
        this.currentNode = draggingNode;
        if (draggingNode.parent.id && draggingNode.phaseId) {
          if (this.previousDraggedParentId !== draggingNode.parent.id) {
            this.updateNodeAndWeightage(draggingNode);
          }
        }
      },
      onRightClick: (d: any, node_type: string) => {
        jqueryFunctions.showModal('saveNodeModal');
        this.catalogForm.patchValue({ node: d, node_type });
      },
      onDragStart: (d: any) => {
        if (d && d.parent) {
          this.previousDraggedParentId = d.parent.id;
          this.previousDraggedPhaseId = d.phaseId;
        }
      },
      onInventoryDrop: (node: any, parent = null) => {
        this.onInventoryDrop(node, parent);
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
        return this.setColors(node_percentage);
      },
      linkWidth: (d: any) => {
        let weightage = parseInt(d.target.weightage);
        weightage = weightage <= 0 ? 10 : weightage;
        return (weightage / 10) / 2;
      }
    }
  }

  /* Node properties */
  maxFiscalStartDate: any = `${new Date().getFullYear()}-01-01`;
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
  kpiCalculationPeriod = 'monthly';
  previousTargetFrequency: string = "";
  targetOptions: any = [
    { name: "Weekly", value: "weekly", disabled: false },
    { name: "Monthly", value: "monthly", disabled: false },
    { name: "Quarterly", value: "quarterly", disabled: false },
    { name: "Yearly", value: "yearly", disabled: false }
  ]
  target: any = [];
  // Contributors
  disabled = false;
  ShowFilter = false;
  limitSelection = false;
  contributors: any = [];
  selectedUsers: any;
  dropdownSettings: any = {};
  contributorUsers: any = [];
  selectedContributorUsers: any = [];
  // Metric Formula
  formulaFlag: boolean = false;
  formulagroupDefaultValues: any = {};
  timer: any = null;
  formulaFieldSuggestions: any = [];
  metricOperations: any = MetricOperations;

  // Person notify
  notifyType: string = "";

  // Share karta
  members: any = [];
  sharedKartaStr: any = [];
  kartas: any = [];
  sharingKarta: any;
  sharedSubmitFlag: boolean = false;
  changetype: boolean = false;
  changeModeType: string = "view";
  sharedKartas: any = [];
  selectedSharedUsers: any = [];
  sharingKartaCount: any = 0;
  loading: boolean = false;
  emails: any = [];

  // Version Control
  version: any = [];
  versionId: any = "";
  formulaError: string = "";

  // Declare calculate percentage class variable
  percentageObj: any;

  // Undo Redo
  getRemovableNodeId: any = "";
  getRemovableNode: any = null;
  undoRedoFlag: boolean = false;

  constructor(
    private _kartaService: KartaService,
    private _commonService: CommonService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    // Get karta id from url
    this.kartaId = this.route.snapshot.paramMap.get('id') || '';
  }

  // Catalog variables
  catalogSubmitted: boolean = false;
  catalogSubmitFlag: boolean = false;
  catalogForm = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.blank_space)]], // Validtion for blank space
    node: [null],
    node_type: [''],
    thumbnail: ['']
  });
  get catalog() { return this.catalogForm.controls; }
  // View karta variables
  viewKartaNumbers: any = [];
  showViewKartaNumber: boolean = false;
  viewKartaSubmitted: boolean = false;
  viewKartaSubmitFlag: boolean = false;
  viewKartaForm = this.fb.group({
    type: ['', [Validators.required]]
  });
  get viewKarta() { return this.viewKartaForm.controls; }

  viewKartaType(e: any) {
    if (e.target.value === "month") {
      this.viewKartaNumbers = [
        { name: "January", value: 1 },
        { name: "February", value: 2 },
        { name: "March", value: 3 },
        { name: "April", value: 4 },
        { name: "May", value: 5 },
        { name: "June", value: 6 },
        { name: "July", value: 7 },
        { name: "August", value: 8 },
        { name: "September", value: 9 },
        { name: "October", value: 10 },
        { name: "November", value: 11 },
        { name: "December", value: 12 }
      ]
    } else if (e.target.value === "week") {
      const no_of_weeks = moment().week() - (moment().month()*4);
      this.viewKartaNumbers = [
        { name: "1st Week", value: 1 },
        { name: "2nd Week", value: 2 },
        { name: "3rd Week", value: 3 },
        { name: "4th Week", value: 4 }
      ]
      if (no_of_weeks > 4) {
        for (let i=5; i<=no_of_weeks; i++) this.viewKartaNumbers.push({ name: `${i}th Week`, value: i });
      }
    }
    if (e.target.value === "quarter") {
      this.viewKartaNumbers = [
        { name: "1st Quarter", value: 1 },
        { name: "2nd Quarter", value: 2 },
        { name: "3rd Quarter", value: 3 },
        { name: "4th Quarter", value: 4 }
      ]
    }
    this.showViewKartaNumber = true;
    this.viewKartaForm.addControl("number", this.fb.control('', [Validators.required]));
  }

  onViewKartaSubmit() {
    this.viewKartaForm.value.kartaId = this.kartaId;
    this.viewKartaForm.value.number = parseInt(this.viewKartaForm.value.number);
    this._kartaService.getPreviousKarta(this.viewKartaForm.value).subscribe(
      (response: any) => {
        if (response.data.data) {
          this.karta = response.data.data;
          this.versionId = response.data.data.versionId;
          if (this.karta.node) {
            this.karta.node.percentage = Math.round(this.percentageObj.calculatePercentage(this.karta.node));
            BuildKPIKarta(this.karta.node, '#karta-svg', this.D3SVG);
            // this.D3SVG.updateNode(this.karta.node, true);
            this.setKartaDimension();
            jqueryFunctions.disableChart();
            jqueryFunctions.setValue("#chartMode", "disable");
            jqueryFunctions.setAttribute("#chartMode", "disabled", true);
            this.showSVG = true;
            jqueryFunctions.hideModal('viewKartaModal');
            jqueryFunctions.removeKarta();
          }
        }
      }
    );
  }

  ngOnInit(): void {
    // Formula Fields
    this.formulaGroup = this.fb.group({
      calculatedValue: [0],
      fields: this.fb.array([]),
      formula: ['', Validators.required],
    });

    // Toggle Left Sidebar
    $('#sidebarCollapse').on('click', function () {
      jqueryFunctions.togggleLeftSidebar();
    });
    // Close right sidebar when click outside
    $(document).on('click', '.right_sidebar_overlay', function () {
      jqueryFunctions.closeRightSidebar();
    });
    // Toggle color settings
    $(document).on('click', '.dropdown-menu.keep-open, .plus-minus.cursor_pointer', function (e: any) {
      e.stopPropagation();
    });
    // Get all members
    this.getAllMembers();
    // Get versions
    this.getAllVersion();
    // Get all inventories
    this.getInventories();
  }

  // Set colors
  setColors(node_percentage: number) {
    if (node_percentage > 100) {
      let colorSetting = this.colorSettings.settings.filter((item: any) => item.min === 101 && item.max === 101);
      return colorSetting[0]?.color || 'black';
    } else if (this.colorSettings.settings) {
      let colorSetting = this.colorSettings.settings.filter((item: any) => node_percentage >= item.min && node_percentage <= item.max);
      return colorSetting[0]?.color || 'black';
    } else return 'black';
  }

  // Get all inventories
  inventories: any = [];
  inventory_search_text: string = "";
  loadingInventories: boolean = false;
  draggingInventoryNode: any;
  getInventories() {
    let data = {
      page: 1,
      limit: 1000,
      userId: this._commonService.getUserId(),
      searchQuery: this.inventory_search_text
    }
    this.loadingInventories = true;
    this._kartaService.getInventories(data).subscribe(
      (response: any) => this.inventories = response.catalogs[0].data
    ).add(() => {
      this.loadingInventories = false;
      this.loadingKarta = false;
    });
  }
  // Search
  inventorySearch() {
    if (this.inventory_search_text) {
      this.getInventories();
    }
  }
  clearInventorySearch() {
    this.inventory_search_text = "";
    this.getInventories();
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
      MetricOperations.recheckFormula();
    }
    else {
      this._commonService.warningToaster("Can't add more than 5 fields");
    }
  }

  // Deleting a particular FormulaField Group
  deleteFormulaGroup(fieldIndex: number) {
    this.fields.removeAt(fieldIndex);
    let newArr = [];
    for (let i = 0; i < this.fields.length; i++) {
      this.currentNode.node_formula ? (
        newArr.push({
          ...this.fields['controls'][i].value
        })
      ) : (
        newArr.push({
          ...this.fields['controls'][i].value,
          fieldName: this.fields['controls'][i].value.fieldName != `Field${i + 1}` && this.fields['controls'][i].value.fieldName != `Field${i + 2}` ? 
          this.fields['controls'][i].value.fieldName : 
          `Field${i + 1}`,
        })
      )
    }
    this.formulaGroup.patchValue({
      fields: newArr,
    });
    MetricOperations.recheckFormula();
  }

  // Enable/Disable Readonly value of Formula Fields
  editFieldStatus(id: number, value: boolean) {
    let fieldName = this.formulaGroup.controls['fields'].controls[id].controls['fieldName'].value;
    let dom = MetricOperations.editFieldStatus(id, value, fieldName);
    this.formulagroupDefaultValues[id] = dom?.innerText;
  }

  // Limiting length for Content Editable
  setLimitForContentEditable(event: any, limit=15) {
    return event.target.innerText.length < limit;
  }

  // Check Field Value for ReadOnly
  checkFieldStatus(id: any) {
    return MetricOperations.checkFieldStatus(id);
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
    let fieldValue = this.formulagroupDefaultValues[id];
    let checkValue = this.fields['controls'].filter((x: any) => {
      return x.value.fieldName == domElem.innerText;
    });
    let data = MetricOperations.setFieldValues(id, fieldValue, checkValue);
    if(data){
      this.formulaGroup.controls['fields']['controls'][id].patchValue({
        fieldName: this.formulagroupDefaultValues[id],
      });
      if (this.formulagroupDefaultValues[id]) {
        delete this.formulagroupDefaultValues[id];
      }
    }
    this.editFieldStatus(id, false);
    $('#formula-field').focus();
    $('#formula-field').blur();
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
    this.timer = this.formulaFieldSuggestions.length == 0 &&
    setTimeout(() => {
        this.formulaFlag = true;
        jqueryFunctions.disableElement("#addIcon");
        jqueryFunctions.disableElement("#removeIcon");

        let tempObj: any = {};
        let suggesionsLength = this.formulaFieldSuggestions.length;
        let formValidation = this.formulaGroup.valid;
        let newArr = [];
        for (let i = 0; i < this.fields.length; i++) {
          newArr.push({
            ...this.fields['controls'][i].value
          });
        };
        this.formulaGroup.patchValue({
          fields: newArr,
        });
        let formValues = this.formulaGroup.value;
        let targetValues = this.target;
        this.fields.controls.forEach((x: any) => {
          tempObj[x['controls']['fieldName'].value] =
            x['controls']['fieldValue'].value;
        });
        let response: any = MetricOperations.calculateFormula(event, suggesionsLength, tempObj, formValidation, formValues, targetValues);
        if(response) {
          if( !response.data ) {
            this.formulaGroup.patchValue({
              calculatedValue: 0,
            });
            this.formulaFlag = false;
            jqueryFunctions.enableElement("#addIcon");
            jqueryFunctions.enableElement("#removeIcon");
            this.formulaError = response.message;
          } else {
              this.formulaError = "";
              let [total, newTarget, request] = response.data;
              this.currentNode.achieved_value = total;
              this.currentNode.target = newTarget;
              this._kartaService
                .updateNode(this.currentNode.id, { node_formula: request, achieved_value: total, target: newTarget })
                .subscribe(
                  async (x) => {
                    this.currentNode.node_formula = x.node_formula;
                    $('#formula-field').addClass('is-valid');
                    this.formulaError = "";
                    let scrollValue = this.getScrollPosition();
                    this.updateNodeProperties(x, scrollValue);
                    let node = this.currentNode;
                    this.updateNode('node_formula', request , 'node_updated', node);
                    this.updateNode('achieved_value', total , 'node_updated', node, "metrics");
                    this.updateNode('target', newTarget , 'node_updated', node);

                    this.formulaFlag = false;
                    jqueryFunctions.enableElement("#addIcon");
                    jqueryFunctions.enableElement("#removeIcon");
                  },
                  (err) => {
                    console.log(err);
                    this._commonService.errorToaster('Something went wrong..!!');
                    this.formulaFlag = false;
                    jqueryFunctions.enableElement("#addIcon");
                    jqueryFunctions.enableElement("#removeIcon");
                  }
              );
          }
        }
      }, 1000);
  }

  //Show Dropdown suggestions for Formula Fields
  filterFieldSuggestions(event: any) {
    this.formulaError = "";
    let value = MetricOperations.filterFieldSuggestions(event);
    if( typeof value == 'string' ) {
      let data = this.formulaGroup.value.fields.filter((x: any) => {
        return x.fieldName.toLocaleLowerCase().includes(value.trim());
      });
      this.formulaFieldSuggestions = data;
    } else {
      this.formulaFieldSuggestions = value;
    }
  }

  // Concatenate Value on click of Dropdown values with Input Value
  concatenateFieldValue(data: any) {
    let value = MetricOperations.concatenateFieldValue(data);
    this.formulaGroup.patchValue({
      formula: value,
    });
    this.formulaFieldSuggestions = [];
  }

  // ---------FormArray Functions defined Above----------

  // EXPORT KARTA
  exportKarta(type: string) {
    if (type === 'image') this.D3SVG.exportAsImage(this.karta.name);
    else if (type === 'pdf') this.D3SVG.exportAsPDF(this.karta.name);
    else if (type == 'csv') this.exportAsCSV(this.karta);
  }

  // Set karta's div width
  setKartaDimension() {
    let width, height, karta_col_width, karta_col_height, svg_width, svg_height;
    karta_col_width = jqueryFunctions.getWidth('.karta_column');
    karta_col_height = $('.karta_column').height();
    // karta_col_height = 455;
    svg_width = jqueryFunctions.getWidth('#karta-svg svg');
    svg_height = jqueryFunctions.getHeight('#karta-svg svg');

    width = svg_width > karta_col_width ? svg_width : karta_col_width;
    height = svg_height > karta_col_height ? svg_height : karta_col_height;
    // height = 455;

    // jqueryFunctions.setStyle('#karta-svg', 'max-width', karta_col_width);

    // $('#karta-svg').css("max-height", karta_col_height + 5);   // For multiple phases
    // jqueryFunctions.setStyle('#karta-svg', 'max-height', karta_col_height);
    // jqueryFunctions.setAttribute('#karta-svg svg', 'width', width);
    // jqueryFunctions.setAttribute('#karta-svg svg', 'height', height);
  }

  // Change chart mode
  changeMode(e: any) {
    if (e.target.value === "enable") jqueryFunctions.enableChart();
    else jqueryFunctions.disableChart();
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
      },
      (error: any) => {
        this.loadingKarta = false;
      }
    );
  }

  // Get all versions
  getAllVersion() {
    this._kartaService.getAllVersions(this.kartaId).subscribe(
      (response: any) => {
        this.version = response;
        this.getColorSettingsByKarta();
      },
      (error: any) => {
        this.loadingKarta = false;
      }
    );
  }

  // Target functions
  disableTargetOption(value: string) {
    let index = this.targetOptions.findIndex((item: any) => item.value === value);
    this.targetOptions[index].disabled = true;
  }
  enableTargetOption(value: string) {
    let index = this.targetOptions.findIndex((item: any) => item.value === value);
    this.targetOptions[index].disabled = false;
  }
  previousTarget(e: any) {
    this.previousTargetFrequency = e.target.value;
  }
  setTarget(type: string, e: any, index: any) {
    let node = this.currentNode;
    if (type === 'frequency') {
      if(this.target.length > 0) {
        this.target[index].frequency = e.target.value;
      } else {
        this.target.push(
          { frequency: e.target.value, value: 0, percentage: 0 }
        )
      }
      this.disableTargetOption(e.target.value);
      this.enableTargetOption(this.previousTargetFrequency);
      this.previousTargetFrequency = e.target.value;
      if (index === 0 && node.hasOwnProperty("start_date")) this.setDueDate(node.start_date);
      this.updateNode('target', this.target, 'node_updated', node);
    }
    else {
      let percentage = (node.achieved_value / e.target.value) * 100;
      if(this.target.length > 0) {
        this.target[index].percentage = Math.round(percentage);
        this.target[index].value = parseInt(e.target.value);
      } else {
        this.target.push(
          { frequency: 'monthly', value: parseInt(e.target.value), percentage: Math.round(percentage) }
        )
      }
      this.updateNode('target', this.target, 'node_updated', node); 
    }
  }
  addMoreTarget() {
    let remainingTargetOptions = this.targetOptions.filter((item: any) => item.disabled === false);
    this.target.push({
      frequency: remainingTargetOptions[0].value,
      value: 0,
      percentage: 0,
    });
    this.disableTargetOption(remainingTargetOptions[0].value);
  }
  removeTarget(index: number) {
    this.enableTargetOption(this.target[index].frequency);
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
  // remove parent object from every node to prevent circular json
  removeCircularData(data: any) {
    return JSON.stringify(data, function(key, value) {
      if (key == 'parent') return value.id;
      return value;
    });
  }
  // Rerender karta again
  reRenderKarta() {
    this.getKartaInfo();
    setTimeout(() => jqueryFunctions.removeKarta(), 500);
  }
  // Update node properties
  updateNodeProperties(param: any, scroll?: any) {
    this.formulaError = "";
    this.currentNode = param;
    this.kpiType = param.node_type;
    this.phaseId = param.phaseId;
    this.selectedFont = param.font_style;
    this.selectedColor = param.text_color;
    this.selectedAlignment = param.alignment;
    this.currentNodeName = param.name;
    this.currentNodeWeight = param.weightage;
    this.currentNodeAchievedValue = param.achieved_value;

    this.showKPICalculation = false;

    // Show properties right sidebar
    if(scroll && scroll !== 0){
      jqueryFunctions.openRightSidebar(scroll);
    } else {
      jqueryFunctions.openRightSidebar();
    }
    // Highlight node
    $(`.node-text[nodeid=${param.id}]`).css('background-color', "#c1d2ef");
    // Get suggestion by phase id
    this.getSuggestionByPhaseId(param);
    // Show Measure and metrics when KPI's node selected
    if (this.currentNode.phase.global_name === 'KPI') {
      this.showKPICalculation = true;
      
      /* ===== Formula Code starts ===== */
      if (param.hasOwnProperty("node_formula") && param.node_formula) {
        this.formulaGroup.controls['fields'] = new FormArray([]);
        for (let i = 0; i < param.node_formula.fields.length; i++ ) {
          let fieldForm = this.fb.group({
            fieldName: new FormControl(param.node_formula.fields[i].fieldName),
            fieldValue: new FormControl(param.node_formula.fields[i].fieldValue),
          })
          this.fields.push(fieldForm);
        }
        this.formulaGroup.patchValue({
          calculatedValue: param.achieved_value,
          formula: param.node_formula.formula,
        });
      } else {
        let newArr: any = [];
        this.formulaGroup.controls['fields'] = new FormArray(newArr);
        if(this.formulaGroup.controls['fields'].controls.length == 0){
          if(!this.currentNode.node_formula){
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
     /* ===== Formula code ends ===== */
      // Set target
      this.target = param.target;
      this.targetOptions = [
        { name: "Weekly", value: "weekly", disabled: false },
        { name: "Monthly", value: "monthly", disabled: false },
        { name: "Quarterly", value: "quarterly", disabled: false },
        { name: "Yearly", value: "yearly", disabled: false }
      ]
      // Disable the target option that is already defined
      this.target.forEach((element: any) => {
        this.disableTargetOption(element.frequency);
      });
      // Set due date, if available
      if (this.currentNode.due_date)
        this.currentNode.due_date = new Date(this.currentNode.due_date).toISOString().substring(0, 10);
      // Set notify user
      if (this.currentNode.notifyUserId) {
        if (this.currentNode.notify_type === "owner") this.notifyType = "owner";
        else this.notifyType = "specific";
        let isMemberExists = this.members.find((item: any) => item._id === this.currentNode.notifyUserId);
        if (!isMemberExists) this.currentNode.notifyUserId = "User (Deactivated)";
      } else this.notifyType = "";
    }
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

  // Change phase name
  makePhaseEditable(id: string) {
    jqueryFunctions.setAttribute(`#${id} div`,"contenteditable", true);
    $(`#${id} div`).focus();
  }
  changePhaseName(e: any, id: string, oldName: string) {
    const name = e.target.textContent.trim();
    if (name.length === 0) {
      e.target.textContent = oldName;
      return;
    }
    this._kartaService.updatePhase(id, { name }).subscribe(
      (response: any) => {
        e.target.textContent = name;
        jqueryFunctions.setAttribute(`#${id} div`,"contenteditable", false);
      }
    );
  }
  // Delete only child phase
  deletePhase(id: string, index: number) {
    const result = confirm("Are you sure you want to delete this phase?");
    if (result) {
      const data = {
        phaseId: id,
        kartaId: this.kartaId
      }
      this._kartaService.deletePhase(data).subscribe(
        (response: any) => {
          this.phases.splice(index, 1);
          this.updateNewPercentage();
          this.setKartaDimension();
        }
      );
    }
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
    if (this.currentNodeWeight < 0 || this.currentNodeWeight === null || this.currentNodeWeight === undefined) this._commonService.errorToaster("Please enter any positive value less than or equal to 100!");
    else if (this.currentNodeWeight > 100) this._commonService.errorToaster("Weighting cannot be greater than 100!");
    else {
      let sum = 0;
      if(node && node.parent) {
        sum = node.parent.children
          .filter((item: any) => item.id !== node.id)
          .reduce((total: any, currentValue: any) => total + currentValue.weightage, 0);
      }
      if (sum + this.currentNodeWeight > 100) {
        this._commonService.errorToaster("Your aggregate weighting of all the nodes cannot be greater than 100!");
      } else {
        if (sum + this.currentNodeWeight < 100) {
          this._commonService.warningToaster(`Your aggregate weighting of all the nodes is less than 100 in ${this.currentNode.phase.name}!`);
        }
        this.updateNode('weightage', this.currentNodeWeight, 'node_updated', node);
      }
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
    this.kpiCalculationPeriod = el.target.value;
    let node = this.currentNode;
    if (el.target.value === "monthly" || el.target.value === "month-to-date" || el.target.value === "year-to-date") {
      this.updateNode('kpi_calc_period', el.target.value, 'node_updated', node);
    } else {
      this._kartaService.getKPICalculation({ "nodeId": node.id, "type": el.target.value }).subscribe(
        (response: any) => {
          this.kpiPercentage = response.data ? response.data.percentage : 0;
          this.percentageObj = new CalculatePercentage(this.colorSettings, this.kpiCalculationPeriod, this.kpiPercentage);
          this.karta.node.percentage = Math.round(this.percentageObj.calculatePercentage(this.karta.node));
          this.D3SVG.update(this.karta.node, true);
        }
      );
    }
  }
  // Change achieved value
  changeAchievedValue() {
    let node = this.currentNode;
    if (this.currentNodeAchievedValue < 0 || this.currentNodeAchievedValue === null) this._commonService.errorToaster("Please enter positive value!");
    else if (this.currentNodeAchievedValue > 9999) this._commonService.errorToaster("Achieved value cannot be greater than 9999!");
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
      this.updateNode('notifyUserId', this.karta.userId, 'node_updated', node, "owner");
      node.notifyUserId = this.karta.userId;
    } else if (this.notifyType === "") {
      this.updateNode('notifyUserId', "", 'node_updated', node);
      node.notifyUserId = "";
    } else node.notifyUserId = undefined;
  }
  selectNotifyUser(userId: string) {
    let node = this.currentNode;
    this.updateNode('notifyUserId', userId, 'node_updated', node, "specific");
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

  // Get karta details including all nodes
  getKartaInfo() {
    this._kartaService.getKarta(this.kartaId).subscribe(
      (response: any) => {
        this.karta = response;
        this.versionId = response.versionId;
        this.sharedKartaStr = response;
        if (this.karta.node) {
          this.karta.node.percentage = Math.round(this.percentageObj.calculatePercentage(this.karta.node));
          this.karta.node.border_color = this.setColors(this.karta.node.percentage);
          BuildKPIKarta(this.karta.node, '#karta-svg', this.D3SVG);
          this.setKartaDimension();
          this.showSVG = true;
          jqueryFunctions.enableChart();
        }
      }
    ).add(() => (this.loadingKarta = false));
  }

  versionRollback(event: any){
    this.loadingKarta = true;
    this._kartaService.versionControlHistory({versionId: event.target.value, kartaId: this.kartaId}).subscribe(
      (data) => {
        $("#UndoAnchor").css("pointer-events", "all", "cursor", "default");
        $("#RedoAnchor").css("pointer-events", "all", "cursor", "default");
        jqueryFunctions.removeElement('#karta-svg svg');
        this.getKartaInfo();
        MetricOperations.recheckFormula();
      },
      (err) => console.log(err)
    ).add(() => this.loadingKarta = false);
  }

  // Get all phases
  getPhases() {
    this._kartaService.getPhases(this.kartaId).subscribe(
      (response: any) => {
        // Find sub phase
        const findSubPhase = (array: any, phaseId: string) => {
          let childPhase = array.find((item: any) => item.parentId === phaseId);
          if (childPhase) {
            this.phases.push(childPhase);
            array.splice(array.findIndex((a: any) => a.id === childPhase.id) , 1);
            findSubPhase(array, childPhase.id);
          }
        }
        // Iterate phases
        for (let phase of response) {
          this.phases.push(phase);
          findSubPhase(response, phase.id);
        }
        // Fetch karta nodes
        this.getKartaInfo();
      }
    );
  }

  // Get suggestion by phaseId
  getSuggestionByPhaseId(param: any) {
    let phase = this.phases[this.phaseIndex(param.phaseId)];
    let data = {
      userId: this._commonService.getUserId(),
      phaseId: phase.phaseId
    };
    this._kartaService.getSuggestion(data).subscribe(
      (response: any) => {
        this.suggestion = response.suggestion;
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
        this.percentageObj = new CalculatePercentage(this.colorSettings, "", 0);
      }
    );
  }

  // Divide weightage
  divideWeightage(param: any, phase: any, extraLength = 0) {
    let weightage = 0;
    if (param.hasOwnProperty("children") && param.children.length > 0) {
      let haveFurtherChildren = false;
      param.children.forEach((element: any) => {
        if (element.hasOwnProperty("children") && element.children.length > 0 && element.phaseId === phase.id) {
          weightage = 0;
          haveFurtherChildren = true;
        }
      });
      if (!haveFurtherChildren) {
        weightage = + (100 / (param.children.length + extraLength)).toFixed(2);
        param.children.forEach((item: any) => {
          item.weightage = weightage;
        });
      }
    } else weightage = 100;
    return { param, weightage };
  }
  // Add node
  addNode(param: any, name = "Child") {
    let phase = this.phases[this.phaseIndex(param.phaseId) + 1];
    const node = this.divideWeightage(param, phase, 1);
    param = node.param;
    let data: any = {
      name,
      kartaDetailId: this.kartaId,
      phaseId: phase.id,
      parentId: param.id,
      weightage: node.weightage
    }
    if (phase.global_name === "KPI") {
      data.node_type = "measure";
      data.target = [{ frequency: 'monthly', value: 0, percentage: 0 }];
      data.achieved_value = 0;
      // data.threshold_value = 70;
      data.is_achieved_modified = false;
      data.days_to_calculate = "all";
      data.alert_type = "";
      data.alert_frequency = "";
      data.kpi_calc_period = 'monthly';
    } else {
      let nextPhase = this.phases[this.phaseIndex(param.phaseId) + 2];
      data.nextPhaseId = nextPhase.id;
    }
    jqueryFunctions.disableChart();
    this._kartaService.addNode(data).subscribe(
      (response: any) => {
        response.phase = phase;
        this.D3SVG.updateNewNode(param, response);
        this.updateNewPercentage();
      }
    ).add(() => jqueryFunctions.enableChart());
  }

  // Add right node
  addNodeRight(param: any) {
    let currentPhaseIndex = this.phaseIndex(param.phaseId);
    const isExists = this.phases.filter((item: any): any => {
      if (item.hasOwnProperty("parentId")) return item.parentId === param.phaseId;
    });
    if (isExists.length <= 0) {
      let mainPhaseId: string = "";
      if (this.phases[currentPhaseIndex].hasOwnProperty("phaseId")) mainPhaseId = this.phases[currentPhaseIndex].phaseId;
      else mainPhaseId = this.phases[currentPhaseIndex].id;
      // Set new phase name
      let nameString, lastString, num, joinedName, newName;
      nameString = this.phases[currentPhaseIndex].name.split(" ");
      lastString = parseInt(nameString[nameString.length - 1]);
      num = lastString ? lastString + 1 : 1;
      lastString ? nameString.pop() : nameString;
      joinedName = nameString.join(" ");
      newName = `${joinedName} ${num}`;
      let data = {
        "name": newName,
        "kartaId": this.kartaId,
        "is_child": true,
        "parentId": param.phaseId,
        "phaseId": mainPhaseId,
        "userId": this._commonService.getUserId()
      }
      this._kartaService.addPhase(data).subscribe(
        (response: any) => {
          let resopnse_data = {
            "id": response.id,
            "name": response.name,
            "global_name": response.name,
            "is_child": response.is_child,
            "kartaId": this.kartaId,
            "parentId": param.phaseId,
            "phaseId": mainPhaseId
          }
          this.phases.splice((currentPhaseIndex + 1), 0, resopnse_data);
          this.addNode(param);
        }
      );
    } else this.addNode(param, 'Child 2');
    // this.setKartaDimension();
    this.D3SVG.buildOneKartaDivider();
  }

  // Update new percentage
  updateNewPercentage() {
    this._kartaService.getKarta(this.kartaId).subscribe(
      (response: any) => {
        this.karta = response;
        this.karta.node.percentage = Math.round(this.percentageObj.calculatePercentage(this.karta.node));
        this.karta.node.border_color = this.setColors(this.karta.node.percentage);
        this.D3SVG.update(this.karta.node, true);
      }
    );
  }

  // Update node
  updateNode(key: string, value: any, event: string = "unknown", updatingNode: any = this.currentNode, type?: any) {
    // Set data
    let data = { [key]: value }
    if (key === "achieved_value") {
      data["node_type"] = type;
      this.kpiType = type;
    }
    if (key === "notifyUserId") data["notify_type"] = type;
    // Send update node request
    this._kartaService.updateNode(updatingNode.id, data).subscribe(
      async (response: any) => {
        const oldValue = { [key]: updatingNode[key] }
        updatingNode[key] = value;
        if (key === "notifyUserId") updatingNode["notify_type"] = type;
        this.D3SVG.update(updatingNode);
        // Calculate new percentage when any achieved, target and weightage value changes
        // if (key === "achieved_value" || key === "target" || key === "weightage" || 
        // ((key === 'kpi_calc_period') && this.kpiCalculationPeriod === "monthly" || this.kpiCalculationPeriod === "month-to-date" || this.kpiCalculationPeriod === "year-to-date")) {
        //   this.updateNewPercentage();
        // }
        this.updateNewPercentage();
        // Save the karta update history
        let history_data = {
          event,
          eventValue: { [key]: value },
          oldValue,
          kartaNodeId: updatingNode.id,
          userId: this._commonService.getUserId(),
          versionId: this.versionId,
          kartaId: this.kartaId,
          parentNodeId: updatingNode.parentId,
          historyType: 'main'
        }
        await this._kartaService.addKartaHistoryObject(history_data).toPromise();
      }
    );
  }

  // Update node and weightage
  updateNodeAndWeightage(draggingNode: any) {
    let data = {
      kartaId: this.kartaId,
      draggingNode,
      previousDraggedParentId: this.previousDraggedParentId,
      previousDraggedPhaseId: this.previousDraggedPhaseId
    }
    data.draggingNode = JSON.parse(this.removeCircularData(draggingNode));

    this._kartaService.updateNodeAndWeightage(data).subscribe(
      (response: any) => {
        this._kartaService.getKarta(this.kartaId).subscribe(
          (response: any) => {
            this.karta = response;
            this.karta.node.percentage = Math.round(this.percentageObj.calculatePercentage(this.karta.node));
            this.karta.node.border_color = this.setColors(this.karta.node.percentage);
            this.D3SVG.rerender(this.karta.node);
          }
        );
      }
    );
  }

  onCatalogSubmit  = async () => {
    
    this.catalogSubmitted = true;

    if (this.catalogForm.valid) {
      this.catalogSubmitFlag = true;
      // Highlight nodes
      this.D3SVG.hightlightNode(this.catalogForm.value.node);
      // Get base64 image of highlighted nodes
      this.D3SVG.getBase64Image(this.catalogForm.value.node, (base64Image: string) => {
        // Set thumbnail
        this.catalogForm.patchValue({ thumbnail: base64Image });
        this.catalogForm.value.userId = this._commonService.getUserId();
        // remove parent object from every node to prevent circular json
        let node = JSON.stringify(this.catalogForm.value.node, function(key, value) {
          if(key == 'parent') return value.id;
          return value;
        });
        this.catalogForm.value.node = JSON.parse(node);

        this._kartaService.addNodeInCatalog(this.catalogForm.value).subscribe(
          (response: any) => {
            let node_type = this.catalogForm.value.node_type;
            node_type = node_type.charAt(0).toUpperCase() + node_type.slice(1);
            this._commonService.successToaster(`${node_type} saved successfully!`);
            jqueryFunctions.hideModal('saveNodeModal');
            this.resetCatalogForm();
            this.catalogSubmitted = false;
            this.getInventories();
          }
        ).add(() => this.catalogSubmitFlag = false );
      })
    }
  }
  resetCatalogForm() {
    this.catalogForm.reset();
    this.catalogForm.markAsUntouched();
  }

  // Remove node from karta
  removeNode(param: any) {
    // Divide weightage of remaining nodes starts
    let phase = this.phases[this.phaseIndex(param.phaseId)];
    const node = this.divideWeightage(param.parent, phase);
    param.parent = node.param;
    // Divide weightage of remaining nodes ends
    let data = {
      kartaId: this.kartaId,
      nodeId: param.id,
      phaseId: phase.id,
      parentId: param.parent.id
    }
    this._kartaService.removeNode(data).subscribe((response: any) => {
      this.D3SVG.update(param.parent);
      this.updateNewPercentage();
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

      let history_data = {
        event: 'node_removed',
        eventValue: { "is_deleted": true },
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

  // Get depth of nested child
  getDepth(node: any) {
    let depth = 0;
    if (node.children) {
        node.children.forEach((d: any) => {
            let tmpDepth = this.getDepth(d);
            if (tmpDepth > depth) {
                depth = tmpDepth
            }
        });
    }
    return ++depth;
  }
  // On karta lines hover
  onMouseOverKartaLines(ev: any) {
    ev.preventDefault();
    let element = document.getElementById(ev.target.id);
    if (element) element.classList.add('selectedPhase');
  }
  onMouseLeaveKartaLines(ev: any) {
    ev.preventDefault();
    this.isRtNodDrgingFrmSide = false;
    let element = document.getElementById(ev.target.id);
    if (element) element.classList.remove('selectedPhase');
  }
  addRootNode(ev: any) {
    let element = ev.target.closest('div');
    this.isNodeDropable = true;
    this.onDrop(element.id, 'add_root');
  }

  onDragOver(ev: any) {
    ev.preventDefault();
    jqueryFunctions.hideLeftSidebar();
    let element = document.getElementById(ev.target.id)!;
    let elAttributes: any = element.attributes;
    // Check is root node dragging
    if (this.isRtNodDrgingFrmSide && elAttributes.name.value === "KPI") {
      this.isNodeDropable = false;
      element.classList.add('selectedPhaseError');
    } else if (this.isRtNodDrgingFrmSide && elAttributes.name.value !== "KPI") {
      this.isNodeDropable = true;
      element.classList.add('selectedPhase');
    }
    // Check if inventory node dragging
    else if (this.draggingInventoryNode && this.draggingInventoryNode.node_type === "branch" && elAttributes.name.value === "KPI") {
      this.isNodeDropable = false;
      element.classList.add('selectedPhaseError');
    } else if (this.draggingInventoryNode && this.draggingInventoryNode.node_type === "branch" && elAttributes.name.value !== "KPI") {
      const draggingDepth = this.getDepth(this.draggingInventoryNode.node);
      const selectedDepth = this.phaseIndex(ev.target.id.substring(9));
      if ((draggingDepth + selectedDepth) > 5) {
        this.isNodeDropable = false;
        element.classList.add('selectedPhaseError');
      } else {
        this.isNodeDropable = true;
        element.classList.add('selectedPhase');
      }
    } else if (this.draggingInventoryNode && (this.draggingInventoryNode.node_type === "measure" || this.draggingInventoryNode.node_type === "metric") && elAttributes.name.value === "KPI") {
      this.isNodeDropable = true;
      element.classList.add('selectedPhase');
    } else if (this.draggingInventoryNode && (this.draggingInventoryNode.node_type === "measure" || this.draggingInventoryNode.node_type === "metric") && elAttributes.name.value !== "KPI") {
      this.isNodeDropable = false;
      element.classList.add('selectedPhaseError');
    }
  }
  onDragLeave(ev: any) {
    ev.preventDefault();
    let element = document.getElementById(ev.target.id);
    if (element) {
      element.classList.remove('selectedPhase');
      element.classList.remove('selectedPhaseError');
    }
  }

  onRootDragStart(data: any, type: boolean) {
    if (type) this.isRtNodDrgingFrmSide = true;
    else {
      this.draggingInventoryNode = data;
      if (this.karta.node) this.onInventoryDragStart(data);
    }
  }
  onInventoryDragStart(param: any) {
    this.draggingInventoryNode = param;
    this.D3SVG.inventoryDraggingNode(param.node, param.node_type);
  }

  onDrop(ev: any, type?: string) {
    if (this.isNodeDropable) {
      if (this.draggingInventoryNode) {
        this.onInventoryDrop(this.draggingInventoryNode.node, null);
        return;
      }
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
        kartaId: this.kartaId
      };
      this._kartaService.addNode(data).subscribe((response: any) => {
        response.phase = phase;
        this.getKartaInfo();
        this.showSVG = true;
        this.isRtNodDrgingFrmSide = false;
        this.isNodeDropable = false;
        // this.updateNodeProperties(response);
  
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
    } else {
      alert("You cannot drag this node here");
      this.isRtNodDrgingFrmSide = false;
      let element = document.getElementById(ev.target.id);
      if (element) {
        element.classList.remove('selectedPhase');
        element.classList.remove('selectedPhaseError');
      }
    }
  }

  // On Inventory drop
  onInventoryDrop(node: any, parent = null) {
    let data = {
      node,
      parent,
      kartaId: this.kartaId,
      nodeType: this.draggingInventoryNode.node_type
    }
    data.node = JSON.parse(this.removeCircularData(node));
    data.parent = JSON.parse(this.removeCircularData(parent));

    jqueryFunctions.disableChart();
    this._kartaService.addNodeByInventory(data).subscribe(
      (response: any) => {
        this.getKartaInfo();
        setTimeout(() => jqueryFunctions.removeKarta(), 2000);
        jqueryFunctions.enableChart();
        jqueryFunctions.hideLeftSidebar();
      },
      (error: any) => {
        jqueryFunctions.enableChart();
      }
    );
  }

  // Save karta
  saveKarta() {
    // New Version Calculation
    let versionNumber = this.version.reduce((acc: any,curr: any) => {
      let num = curr.name;
      if (Number(num) > acc) {
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

  // On select user while sharing
  onSelectUser() {
    this.changetype = false;
    let emailObject: any = {};
    
    for (let i=0; i<this.members.length; i++) {
      emailObject[this.members[i].email] = this.members[i].email;
    }
    for (let j=0; j<this.selectedSharedUsers.length; j++) {
      if (!emailObject[this.selectedSharedUsers[j].email]) {
        this.changetype = true;
        this.changeModeType = "view";
      }
    }
  }
  // Enable edit option
  enableEditOption() {
    this.changetype = false;
  }

  // Change chart mode
  changeSharingMode(e: any) {
    if (e.target.value === "edit") this.changeModeType = e.target.value;
    else this.changeModeType = e.target.value;
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
        emails: email_array,
        accessType: this.changeModeType
      }
      this.sharedSubmitFlag = true;

      this._kartaService.shareKarta(data).subscribe(
        (response: any) => {
          this._commonService.successToaster("Your have shared karta successfully");
          jqueryFunctions.hideModal('shareKartaModal');
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
  toggleColorSettings(e: any) {
    this._kartaService.updateColorSetting({ is_global: e.target.checked }, this.colorSettings.id).subscribe(
      (response: any) => {
        if (e.target.checked) {
          this._commonService.successToaster("Success! Now this settings will apply in all other places.");
        }
      },
      (error: any) => {
        setTimeout(() => e.target.checked = false, 500);
      }
    );
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
              this.reRenderKarta();
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
              location.reload();
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
    this.undoRedoFlag = true;
    $("#RedoAnchor").css("pointer-events", "all", "cursor", "default");
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
                    this.currentNode.phase = "";
                    let phase = this.phases[this.phaseIndex(kartaNode.phaseId)];
                    kartaNode.phase = phase;
                    this.setKartaDimension();
                    this.getRemovableNode = null;
                    this.getRemovableNodeId = "";
                    this.undoRedoFlag = false;
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
                    this.currentNode.phase = "";
                    this.D3SVG.updateNode(this.currentNode);
                    this.getKartaInfo();
                    setTimeout(() => {
                      jqueryFunctions.removeKarta();
                    }, 2000);
                    this.undoRedoFlag = false;
                  },
                  (err) => {
                    console.log(err);
                    this.undoRedoFlag = false;
                  });
                }
                break;
              case "node_removed":
                if(x.data.data) {
                  this._kartaService.getNode(x.data.data.kartaNodeId).subscribe((kartaNode: any) => {
                    let phase = this.phases[this.phaseIndex(kartaNode.phaseId)];
                    kartaNode.phase = phase;
                    this.currentNode.phase = "";
                    this.showSVG = true;
                    this.isRtNodDrgingFrmSide = false;
                    this.getKartaInfo();
                    setTimeout(() => {
                      jqueryFunctions.removeKarta();
                    }, 2000);
                    this.undoRedoFlag = false;
                  },
                  (err) => {
                    console.log(err);
                  });
                }
                break;
            }
          }
          else {
            this._commonService.warningToaster("Maximum Undo limit has reached..!!");
            $("#UndoAnchor").css("pointer-events", "none", "cursor", "not-allowed");
            this.undoRedoFlag = false;
          }
        } else {
          this._commonService.warningToaster("Maximum Undo limit has reached..!!");
          $("#UndoAnchor").css("pointer-events", "none", "cursor", "not-allowed");
          this.undoRedoFlag = false;
        }
      }
    )
  }

  async redoKarta() {
    this.undoRedoFlag = true;
    $("#UndoAnchor").css("pointer-events", "all", "cursor", "default");
    this._kartaService.redoFunctionality({ kartaId: this.kartaId, versionId: this.versionId }).subscribe(
      (x: any) => {
        if(x.data.message != "nothing"){
          if(x.data.message != "final"){
            switch(x.data.data.event){
              case "node_created":
                if(x.data.data){
                  this._kartaService.getNode(x.data.data.kartaNodeId).subscribe((kartaNode: any) => {
                    if(kartaNode) {
                      this.currentNode.phase = "";
                      let phase = this.phases[this.phaseIndex(kartaNode.phaseId)];
                      kartaNode.phase = phase;
                      this.showSVG = true;
                      this.isRtNodDrgingFrmSide = false;
                      this.getKartaInfo();
                      setTimeout(() => {
                        jqueryFunctions.removeKarta();
                      }, 2000);
                      this.undoRedoFlag = false;
                    }
                  },
                  (err) => {
                    console.log(err);
                    this.undoRedoFlag = false;
                  });
                }
                break;
              case "node_updated":
                if(x.data.data){
                  this._kartaService.getNode(x.data.data.kartaNodeId).subscribe((kartaNode: any) => {
                    if(kartaNode) {
                      let phase = this.phases[this.phaseIndex(kartaNode.phaseId)];
                      kartaNode.phase = phase;
                      this.showSVG = true;
                      this.isRtNodDrgingFrmSide = false;
                      this.updateNodeProperties(kartaNode);
                      this.D3SVG.updateNode(this.currentNode);
                      this.getKartaInfo();
                      setTimeout(() => {
                        jqueryFunctions.removeKarta();
                      }, 2000);
                      this.undoRedoFlag = false;
                    }
                  },
                  (err) => {
                    console.log(err);
                    this.undoRedoFlag = false;
                  });
                }
                break;
              case "node_removed":
                if(x.data.data){
                  this.getRemovableNodeId = x.data.data.kartaNodeId;
                  this.returnChildNode(this.karta.node);
                  this._kartaService.getNode(this.getRemovableNode.parentId).subscribe((kartaNode: any) => {
                    this.D3SVG.updateRemovedNode(this.getRemovableNode);
                    this.currentNode.phase = "";
                    let phase = this.phases[this.phaseIndex(kartaNode.phaseId)];
                    kartaNode.phase = phase;
                    this.setKartaDimension();
                    this.getRemovableNode = null;
                    this.getRemovableNodeId = "";
                    this.undoRedoFlag = false;
                  });
                }
                break;
            }
          }
          else {
            this._commonService.warningToaster("Maximum Redo limit has reached..!!");
            $("#RedoAnchor").css("pointer-events", "none", "cursor", "not-allowed");
            this.undoRedoFlag = false;
          }
        } else {
          this._commonService.warningToaster("Maximum Redo limit has reached..!!");
          $("#RedoAnchor").css("pointer-events", "none", "cursor", "not-allowed");
          this.undoRedoFlag = false;
        }
      }
    )
  }
  // Undo Redo Functionality ends

}