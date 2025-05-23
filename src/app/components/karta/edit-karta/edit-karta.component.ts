import { Component, HostListener, OnDestroy, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExportToCsv } from 'export-to-csv';
import { CommonService } from '@app/shared/_services/common.service';
import { KartaService } from '../service/karta.service';
import * as BuildKPIKarta from '../utils/d3.js';
import * as jqueryFunctions from '../utils/jqueryOperations.js';
import { Options } from '@angular-slider/ngx-slider';
import * as moment from 'moment';
import * as MetricOperations from '../utils/metricFormulaOperations';
import { CalculatePercentage } from '../utils/calculatePercentage';
import data from '../create-karta/industries.json';

declare const $: any;


@Component({
  selector: 'app-edit-karta',
  templateUrl: './edit-karta.component.html',
  styleUrls: ['./edit-karta.component.scss'],
})
export class EditKartaComponent implements OnInit, OnDestroy {

  @Input() fontSize: number = 14;
  @Input() minFontSize: number = 10;
  @Input() maxFontSize: number = 50;

  @Output() fontSizeChange = new EventEmitter<number>();

  nodeWidth: number = (window.innerWidth - 100) / 7
  unauthorizedUser: any;
  kartaId: string = '';
  lastSavedDate: string = '';
  lastUpdatedDate: string = '';
  karta: any;
  currentNode: any = {};
  currentPhase: any;
  currentPhaseNodes: any = [];
  phaseId: string = '';
  phaseName: string = '';
  phases: any = [];
  colorSettings: any = [];
  suggestion: any;
  loadingKarta: boolean = true;
  loader: any = this._commonService.loader;
  showSVG: boolean = false;
  isRtNodDrgingFrmSide: boolean = false;
  isNodeDropable: boolean = false;
  formulaGroup: FormGroup | any = [];
  saveSubmitFlag: boolean = false;
  globalPromptMapper: any = {};
  isLoading: boolean = false;
  fontSizeOptions: Options = {
    floor: 8,
    ceil: 48,
    step: 1,
    showTicks: true,
    showTicksValues: true
  };
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
      nodeWarning: (message: string) => {
        this._commonService.warningToaster(message);
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
        this.updateNodeProperties(d);
      },
      collapseNode: (d: any) => {
        this._commonService.addNodeInSession(d.id);
      },
      expandNode: (d: any) => {
        this._commonService.removeNodeFromSession(d.id);
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
    },
    styleOptions: {
      fontSize: this.fontSize,
    }
  }

  /* Node properties */
  minStartDate: any = `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, "0")}-01`;
  minFiscalStartDate: any = `${new Date().getFullYear()}-01-01`;
  currentNodeName: string = '';
  currentNodeDescription: string = '';
  currentNodeWeight: number = 0;
  currentNodeAchievedValue: number = 0;
  isAchievedChanged: boolean = false;
  // Typography
  selectedFont: any = '';
  selectedColor: any = '';
  selectedAlignment: any = '';
  // Kpi Type
  kpiType: string = 'measure';
  kpiPercentage: number = 0;
  showKPICalculation: boolean = false;
  kpiCalculationPeriod = {
    frequency: 'monthly',
    nodeId: ''
  };
  previousTargetFrequency: string = "";
  targetOptions: any = [
    { name: "Monthly", value: "monthly", disabled: false },
    { name: "Quarterly", value: "quarterly", disabled: false },
    { name: "Yearly", value: "yearly", disabled: false }
  ]
  target: any = [];
  filterKartaBy: string = "";
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
  disableVersionFlag: boolean = false;
  showLoader: boolean = false;
  disableKartaAsOf: boolean = false;

  // Declare calculate percentage class variable
  percentageObj: any;

  // Undo Redo
  getRemovableNodeId: any = "";
  getRemovableNode: any = null;
  undoRedoFlag: boolean = false;

  // Geographics - (Segment)
  selectedCountries: any = [];
  countries: any = [];
  selectedStates: any = [];
  states: any = [];
  selectedCities: any = [];
  cities: any = [];

  constructor(
    private _kartaService: KartaService,
    private _commonService: CommonService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router
  ) {
    // Get karta id from url
    this.kartaId = this.route.snapshot.paramMap.get('id') || '';
  }

  toggleSinglePhaseCollapse(depth: number) {
    const allCollapsed = this.D3SVG.areAllNodesAtDepthCollapsed(this.karta.node, depth)
    this.D3SVG.collapseByDepth(this.karta.node, depth, allCollapsed)
    this.D3SVG.update(this.karta.node, true);
  }

  areAllNodesAtDepthCollapsed(depth: number) {
    return this.karta && this.karta.node ? this.D3SVG.areAllNodesAtDepthCollapsed(this.karta.node, depth) : false
  }

  // Confirm box
  confirmBox(message: string, yesCallback: any, noCallback: any) {
    $("#confirm_message").text(message);
    jqueryFunctions.showModal("confirmModal");
    $('#btnYes').unbind('click');
    $('#btnYes').click(function () {
      jqueryFunctions.hideModal("confirmModal");
      yesCallback();
    });
    $('#btnNo').unbind('click');
    $('#btnNo').click(function () {
      jqueryFunctions.hideModal("confirmModal");
      noCallback();
    });
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
  viewKartaText: string = `${moment().format('MMMM')} ${moment().year()}`;
  viewKartaDurations: any = [];
  viewKartaSubmitted: boolean = false;
  viewKartaSubmitFlag: boolean = false;
  viewKartaFilterApplied: boolean = false;
  viewKartaForm = this.fb.group({
    type: ['', [Validators.required]],
    duration: ['', [Validators.required]]
  });
  get viewKarta() { return this.viewKartaForm.controls; }

  viewKartaType(e: any) {
    this.viewKartaForm.patchValue({ duration: "" });
    if (e.target.value === "month") {
      // Show months till current month only
      let months = [];
      let currentMonth = moment().month() + 1;
      for (let i = 0; i < currentMonth; i++) {
        months.push(this._commonService.monthsName[i]);
      }
      this.viewKartaDurations = months;
    } else if (e.target.value === "quarter") {
      // Show quarters till current quarter only
      let quarters = [];
      let currentQuarter = moment().quarter();
      for (let i = 0; i < currentQuarter; i++) {
        quarters.push(this._commonService.quartersName[i]);
      }
      this.viewKartaDurations = quarters;
    }
  }

  onViewKartaSubmit() {
    this.viewKartaSubmitted = true;
    if (this.viewKartaForm.valid) {
      this.viewKartaForm.value.kartaId = this.kartaId;
      this.viewKartaForm.value.duration = parseInt(this.viewKartaForm.value.duration);
      this.viewKartaSubmitFlag = true;
      this._kartaService.getPreviousKarta(this.viewKartaForm.value).subscribe(
        (response: any) => {
          if (response.data.karta) {
            this.karta = response.data.karta.kartaData;
            this.versionId = response.data.karta.kartaData.versionId;
            if (this.karta.node) {
              this.viewKartaFilterApplied = true;
              this.reArrangePhases(response.data.karta.phases);
              // Set goal node percentage
              this.karta.node.percentage = Math.round(this.percentageObj.calculatePercentage(this.karta.node));
              // Set colors
              this.karta.node.border_color = this.setColors(this.karta.node.percentage);
              // Set node presence
              this.setNodePresenceInPhases(this.karta.node);
              BuildKPIKarta(this.karta.node, '#karta-svg', this.D3SVG);
              // this.D3SVG.updateNode(this.karta.node, true);
              // this.setKartaDimension();
              jqueryFunctions.disableChart();
              jqueryFunctions.disableElement("#phase_tabs");
              jqueryFunctions.setValue("#chartMode", "disable");
              jqueryFunctions.setAttribute("#chartMode", "disabled", true);
              this.showSVG = true;
              // Set view karta text
              if (this.viewKartaForm.value.type === "month" || this.viewKartaForm.value.type === "quarter") {
                this.viewKartaText = `${this.viewKartaDurations.find((item: any) => item.value === this.viewKartaForm.value.duration).name} ${moment().year()}`;
              }
              jqueryFunctions.hideModal('viewKartaModal');
              jqueryFunctions.removeKarta();
            }
          } else this._commonService.errorToaster(response.data.message);
        },
        (error: any) => { }
      ).add(() => this.viewKartaSubmitFlag = false);
    }
  }

  checkKartaFilter() {
    if (this.viewKartaFilterApplied) {
      this.updateNewPercentage();
      this.viewKartaText = `${moment().format('MMMM')} ${moment().year()}`;
      jqueryFunctions.enableChart();
      jqueryFunctions.enableElement("#phase_tabs");
      jqueryFunctions.setValue("#chartMode", "enable");
      jqueryFunctions.setAttribute("#chartMode", "disabled", false);
      this.viewKartaForm.reset();
      this.viewKartaForm.patchValue({ type: "" });
      this.viewKartaForm.patchValue({ duration: "" });
      this.viewKartaSubmitted = false;
      this.viewKartaFilterApplied = false;
    } else jqueryFunctions.showModal('viewKartaModal');
  }

  ngOnChanges() {
    this.fontSizeChange.emit(this.fontSize);
  }
  ngOnInit(): void {
    // Formula Fields
    this.fontSizeChange.emit(this.fontSize);
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
    // Get last saved karta
    this.lastSavedKarta();
    // Get last updated karta
    this.lastUpdatedKarta();
    // Get Countries with states
    this.getGeoCountries();
  }

  async getGeoCountries() {
    try {
      let countryStateMapper = {};
      const countries: any = await this._kartaService.getCountries().toPromise();
      this.countries = countries.data;

      // Getting States
      if ((this.currentSegmentChildNode?.description?.geographic?.country && this.currentSegmentChildNode?.description?.geographic?.country.length > 0) && (this.countries && this.countries.length > 0)) {
        let states = [];
        for (const country of this.countries) {
          if (this.currentSegmentChildNode?.description?.geographic?.country.includes(country.name)) {
            states = [...states, ...country.states];
            let statesArray = [];
            for (let statesName of country.states) {
              statesArray.push(statesName.name);
            }
            countryStateMapper[country.name] = statesArray;
          }
        }
        this.states = states;
      }

      // Getting Cities
      if ((this.currentSegmentChildNode?.description?.geographic?.state && this.currentSegmentChildNode?.description?.geographic?.state.length > 0) && (this.states && this.states.length > 0)) {
        for (const state of this.currentSegmentChildNode?.description?.geographic?.state) {
          for (const mapper of Object.keys(countryStateMapper)) {
            let states = countryStateMapper[mapper];
            if (states.includes(state)) {
              this._kartaService.getCities(mapper, state).subscribe((city: any) => {
                if (city.data.length > 0) {
                  this.cities = [...this.cities, ...city.data];
                }
              });
            }
          }
        }
      }

    } catch (err) {
      console.log(err);
    }
  }

  montiorBy(event: any) {
    this.filterKartaBy = event.target.value;
  }

  // Reset monitor by
  resetMontiorBy() {
    this.filterKartaBy = "";
    $("input:radio[name='targetFilter']").each(function () {
      this.checked = false;
    });
    this.updateNewPercentage("");
  }

  // Apply monitor by
  applyMonitorBy() {
    // this.updateNewPercentage(this.filterKartaBy);
    if (this.filterKartaBy === "quarterly" || this.filterKartaBy === "yearly") {
      this.loadingKarta = true;
      this._kartaService.getKpisData({ kartaId: this.kartaId, type: this.filterKartaBy }).subscribe(
        (response: any) => {
          if (response.nodes.length > 0) {
            this.updateNewPercentage(this.filterKartaBy, response.nodes);
          } else this.updateNewPercentage(this.filterKartaBy);
        },
        (error: any) => {
          this.loadingKarta = false;
        }
      );
    } else this.updateNewPercentage(this.filterKartaBy);
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
  searchTimeout = null;
  inventorySearch() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.getInventories();
    }, 1000);
  }

  clearInventorySearch() {
    this.inventory_search_text = "";
    this.getInventories();
  }

  // Get last saved karta history
  lastSavedKarta() {
    this._kartaService.lastSavedKarta({ kartaId: this.kartaId }).subscribe(
      (response: any) => {
        if (response.kpi_node) this.lastSavedDate = response.kpi_node.updatedAt;
      }
    );
  }

  // Get last updated karta history
  lastUpdatedKarta() {
    this._kartaService.lastUpdatedKarta({ kartaId: this.kartaId }).subscribe(
      (response: any) => {
        if (response.kpi_node) this.lastUpdatedDate = response.kpi_node.updatedAt;
      }
    );
  }

  // ---------FormArray Functions defined Below----------

  //Adding a New FormulaField Group
  addFormulaGroup() {
    if (this.fields.length < 5) {
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
  setLimitForContentEditable(event: any, limit = 15) {
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
    if (data) {
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
  @HostListener('window:resize', ['$event'])

  async onResize() {
    this.nodeWidth = (window.innerWidth - 100) / 7;
    this.D3SVG.update(this.karta.node, true);
    // BuildKPIKarta(this.karta.node, '#karta-svg', this.D3SVG);
  }

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
        if (response) {
          if (!response.data) {
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
            this.currentNode.achieved_value = Number(total);
            this.currentNode.target = newTarget;
            let updatedData = {
              node_formula: request,
              achieved_value: Number(total),
              target: newTarget
            };
            this._kartaService.updateNode(this.currentNode.id, updatedData).subscribe(
              async (response) => {
                this.currentNode.node_formula = response.node_formula;
                $('#formula-field').addClass('is-valid');
                this.formulaError = "";
                let scrollValue = this.getScrollPosition();
                this.updateNodeProperties(response, scrollValue);
                let node = this.currentNode;
                // Update achieved_value, node_formula and target
                let randomKey = new Date().getTime();
                let updatingParameters = [
                  { key: 'node_formula', value: request, node_updated: 'node_updated', node },
                  { key: 'achieved_value', value: Number(total), node_updated: 'node_updated', node, metrics: "metrics" },
                  { key: 'target', value: newTarget, node_updated: 'node_updated', node }
                ];
                this.isAchievedChanged = true;
                if (this.target[0].percentage >= 100) updatingParameters.push({
                  key: "completed_date", value: new Date(), node_updated: "node_updated", node
                });
                for (let param of updatingParameters) {
                  let metrics = param.metrics || null
                  this.updateNode(param.key, param.value, param.node_updated, param.node, metrics, randomKey);
                }

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
        } else {
          this.formulaFlag = false;
          jqueryFunctions.enableElement("#addIcon");
          jqueryFunctions.enableElement("#removeIcon");
        }
      }, 1000);
  }

  //Show Dropdown suggestions for Formula Fields
  filterFieldSuggestions(event: any) {
    this.formulaError = "";
    let value = MetricOperations.filterFieldSuggestions(event);
    if (typeof value == 'string') {
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
  changeModeFlag: boolean = false;
  controlElements: any = ["version-holder", "undo-redo-holder", "karta-as-of-holder", "action-buttons-holder", "feeling-lucky-holder"];
  changeMode(e: any) {
    if (this.karta.node) this.showPhaseList();
    if (e.target.value === "enable") {
      jqueryFunctions.enableChart();
      this.changeModeFlag = false;
      // Save Button disable
      this.saveSubmitFlag = false;
      for (let elem of this.controlElements) {
        let element = document.getElementById(elem);
        if (element) element.classList.remove('disableDiv');
      }
    } else {
      jqueryFunctions.disableChart();
      this.changeModeFlag = true;
      // Save Button enable
      this.saveSubmitFlag = true;
      for (let elem of this.controlElements) {
        let element = document.getElementById(elem);
        if (element) element.classList.add('disableDiv');
      }
    }
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
        if (response.members[0].data.length > 0) {
          this.members = response.members[0].data.filter((x: any) => {
            return x.email != this._commonService.getEmailId();
          });
          this.members.forEach((element: any) => {
            element['selectedAllGroup'] = 'selectedAllGroup';
          })
          this.contributors = response.members[0].data.filter((x: any) => {
            if (x.Role.name !== "billing_staff" && x.license.name !== "Spectator") return x;
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
      if (this.target.length > 0) {
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
      if (e.target.value > 999999999999999) this._commonService.errorToaster("Target value cannot be greater than 999999999999999!");
      else {
        let percentage = (node.achieved_value / e.target.value) * 100;
        if (this.target.length > 0) {
          this.target[index].percentage = Math.round(percentage);
          this.target[index].value = Number(e.target.value);
        } else {
          this.target.push(
            { frequency: 'monthly', value: Number(e.target.value), percentage: Math.round(percentage) }
          )
        }
        // Update achieved_value, node_formula and target
        let randomKey = new Date().getTime();
        let updatingParameters = [
          { key: 'achieved_value', value: Number(this.currentNodeAchievedValue), node_updated: 'node_updated', node, metrics: this.kpiType },
          { key: 'target', value: this.target, node_updated: 'node_updated', node }
        ];
        if (node.node_formula && node.node_type === "metrics") {
          updatingParameters.push({ key: 'node_formula', value: node.node_formula, node_updated: 'node_updated', node });
        }
        for (let param of updatingParameters) {
          let metrics = param.metrics || null
          this.updateNode(param.key, param.value, param.node_updated, param.node, metrics, randomKey);
        }
      }
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
    return JSON.stringify(data, function (key, value) {
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
    this.phaseName = this.phases.find((item: any) => item.id === param.phaseId).name;
    this.selectedFont = param.font_style;
    this.selectedColor = param.text_color;
    this.selectedAlignment = param.alignment;
    this.currentNodeName = param.name;
    this.currentNodeDescription = param.node_description;
    this.currentNodeWeight = param.weightage;
    this.currentNodeAchievedValue = param.achieved_value;

    this.showKPICalculation = false;

    // Show properties right sidebar
    if (scroll && scroll !== 0) {
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
      $("#selectTypeValue").val(param.node_type).change();
      this.kpiCalculationPeriod.frequency = param.kpi_calc_period;
      this.kpiCalculationPeriod.nodeId = param.id;

      /* ===== Formula Code starts ===== */
      if (param.hasOwnProperty("node_formula") && param.node_formula) {
        this.formulaGroup.controls['fields'] = new FormArray([]);
        for (let i = 0; i < param.node_formula.fields.length; i++) {
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
        if (this.formulaGroup.controls['fields'].controls.length == 0) {
          if (!this.currentNode.node_formula) {
            for (let i = 0; i < 2; i++) {
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
      // Set fiscal year start and end date
      if (this.currentNode.fiscal_year_start_date && this.currentNode.fiscal_year_end_date &&
        this.currentNode.fiscal_year_start_date.includes("T") && this.currentNode.fiscal_year_end_date.includes("T")) {
        this.currentNode.fiscal_year_start_date = this.currentNode.fiscal_year_start_date.split('T')[0];
        this.currentNode.fiscal_year_end_date = this.currentNode.fiscal_year_end_date.split('T')[0];
      }
      // // Set start date
      if (this.currentNode?.start_date && this.currentNode?.start_date.includes("T"))
        this.currentNode.start_date = this.currentNode.start_date.split('T')[0];
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
    if (node.target[0].frequency === "monthly") {
      due_date = moment(start_date).add(1, 'months');
    } else if (node.target[0].frequency === "quarterly") {
      due_date = moment(start_date).add(3, 'months');
    } else if (node.target[0].frequency === "yearly") {
      due_date = moment(start_date).add(1, 'years');
    }
    // due_date = moment(due_date).format("YYYY-MM-DD");
    this.updateNode('due_date', due_date, 'node_updated', node);
  }

  // Show phase list
  showPhaseList() {
    this.currentPhaseNodeChildren = null;
    this.subSegmentMenu = false;
    this.isPhaseListVisible = true;
    this.highlightNode({ id: "123" }, this.karta.node);
    BuildKPIKarta(this.karta.node, '#karta-svg', this.D3SVG);
    jqueryFunctions.removeKarta();
  }

  highlightNode(nodeToHighlight: any, structure: any) {
    delete structure['highlight-node'];
    if (structure.children && structure.children.length > 0) {
      for (let element of structure.children) {
        this.highlightNode(nodeToHighlight, element);
      }
    }
    if (nodeToHighlight.id == structure.id) {
      structure['highlight-node'] = 'highlight-node';
      BuildKPIKarta(this.karta.node, '#karta-svg', this.D3SVG);
      jqueryFunctions.removeKarta();
    }
  }

  nodeSuggestions: any = [];
  existingNodes: any = [];
  suggestionPrompt: string = "";
  loadingSuggestion: boolean = false;
  isPhaseListVisible: boolean = true;
  currentPhaseNodeChildrens: any = []
  hasNodeInNextPhase: any = false;
  currentPhaseNodeChildren: any;
  selectedSuggestion: string = "";
  manual_suggestion: string = "";
  wrapperHeight: string = "325px";
  // Open suggestion menu
  async openSuggestionMenu(phase: any, index: number, type?: string, node?: any, event?: any) {
    this.isLoading = true;
    jqueryFunctions.disableChart();
    this.disableElements();
    this.nodeSuggestions = [];
    this.existingNodes = [];
    this.promptForPhaseMapper = {};
    // Setting Calista height for different phases
    // if (phase.global_name === "Goal" || phase.global_name === "Critical Success Factor") {
    //   this.wrapperHeight = `${((this.phases.length - 3)*65) + 32}px`;
    // } else if (phase.global_name.includes("Segment")) {
    //   this.wrapperHeight = `${((this.phases.length - 1)*65) + 5}px`;
    // } else {
    //   this.wrapperHeight = `${((this.phases.length - 2)*65) - 2}px`;
    // }

    // Initializing variables
    this.manual_suggestion = "";
    this.currentPhase = phase;
    this.hasNodeInNextPhase = (this.phases[index + 1]?.hasNode) || false;
    if (node) {
      this.currentPhaseNodeChildren = node;
      this.currentPhaseNodeChildrens = node.children ? node.children : [];
      this.generateGlobalPrompt(this.currentPhaseNodeChildren);
      await this.generatePromptForPhase(node);
      this.highlightNode(node, this.karta.node);
      BuildKPIKarta(this.karta.node, '#karta-svg', this.D3SVG);
      jqueryFunctions.removeKarta();
    };

    if (phase.global_name == "Goal") {
      if (this.karta.node) {
        this.currentPhaseNodeChildren = this.karta.node || null;
        this.currentPhaseNodeChildrens = [this.karta.node]
      }
    }

    this.loadingSuggestion = true;

    // Doing this below code to get dynamic value of index at the time of collapse
    if (type == "reset" && index == 0) index = this.phaseIndex(phase.id);

    // Setting dropdown child to 0
    if (type !== 'reset' && phase.global_name !== "Goal") {
      // Get all childrens of second previous phase that means all the nodes of a previous phase
      let previousPhase: any = {};
      if (phase.global_name == "Critical Success Factor") {
        previousPhase = this.phases[index - 1];
        this.currentPhaseNodes = [this.karta.node];
        this.currentPhaseNodeChildrens = this.karta.node.children || [];
        this.currentPhaseNodeChildren = this.karta.node;
        await this.generatePromptForPhase(this.currentPhaseNodeChildren);
      } else {
        previousPhase = this.phases[index - 2];
        this.currentPhaseNodes = this.getAllNodesOfPhase(previousPhase.id);
        this.currentPhaseNodeChildrens = this.currentPhaseNodes[0].children || [];
        this.currentPhaseNodeChildren = this.currentPhaseNodes[0];
        await this.generatePromptForPhase(this.currentPhaseNodeChildren);

        if (phase.global_name === "Phase") {
          this.existingNodes = [];
          let phaseMapper = {
            "Acquire": { name: "Acquire", type: "static", title: "This is the initial broadcast of your marketing message. The attempt is to get your persuasive, introductory message out to as many of your prospective clients and customers as possible." },
            "Engage": { name: "Engage", type: "static", title: "Refine the message by delivering a targeted, meaningful, message to the potential customers that attract them to you for more detailed information." },
            "Convert": { name: "Convert", type: "static", title: "Provide enough incentive, and a simplified process, and cause the potential customer to execute your preferred action." },
            "Retain": { name: "Retain", type: "static", title: "Ensure you delivered value as promised and your product/service has long-term value so they keep coming back." },
            "Manual": { type: "manual" }
          };

          for (let elem of this.currentPhaseNodeChildrens) {
            if (phaseMapper[elem.name]) {
              let obj = {
                ...phaseMapper[elem.name],
                disabled: true
              };
              this.existingNodes.push(obj);
              delete phaseMapper[elem.name];
            } else {
              let obj = {
                name: elem.name,
                type: "auto",
                disabled: true
              };
              this.existingNodes.push(obj);
            }
          }

          let finalObj = [...this.existingNodes, ...Object.values(phaseMapper)];
          this.nodeSuggestions = finalObj;
        }
      }
      if (!this.newSuggestionsLoader && this.karta.node) {
        this.highlightNode(this.currentPhaseNodes[0], this.karta.node);
      }
      // In case of all the other phases
      this.generateGlobalPrompt(this.currentPhaseNodeChildren);
    } else {
      if (this.currentPhaseNodeChildren?.id) {
        // In case of CSF phase
        this.generateGlobalPrompt(this.currentPhaseNodeChildren);
        if (type !== 'reset') await this.generatePromptForPhase(this.currentPhaseNodeChildren);
      } else {
        // Handling case in case if no node is created on blank canvas
        if (this.karta.node) {
          this.generateGlobalPrompt(this.karta.node)
          if (type !== 'reset') await this.generatePromptForPhase(this.karta.node);
        };
      }
    }

    // If phase name is phase then push 4 suggestion manually
    if (phase.global_name.includes("Phase")) {
      if (phase.global_name == "Phase") {
        let phaseMapper = {
          "Acquire": { name: "Acquire", type: "static", title: "This is the initial broadcast of your marketing message. The attempt is to get your persuasive, introductory message out to as many of your prospective clients and customers as possible." },
          "Engage": { name: "Engage", type: "static", title: "Refine the message by delivering a targeted, meaningful, message to the potential customers that attract them to you for more detailed information." },
          "Convert": { name: "Convert", type: "static", title: "Provide enough incentive, and a simplified process, and cause the potential customer to execute your preferred action." },
          "Retain": { name: "Retain", type: "static", title: "Ensure you delivered value as promised and your product/service has long-term value so they keep coming back." },
          "Manual": { type: "manual" }
        };

        this.existingNodes = [];
        for (let elem of this.currentPhaseNodeChildrens) {
          if (phaseMapper[elem.name]) {
            let obj = {
              ...phaseMapper[elem.name],
              disabled: true
            };
            this.existingNodes.push(obj);
            delete phaseMapper[elem.name];
          } else {
            let obj = {
              name: elem.name,
              type: "auto",
              disabled: true
            };
            this.existingNodes.push(obj);
          }
        }

        let finalObj = [...this.existingNodes, ...Object.values(phaseMapper)];
        this.loadingSuggestion = false;
        this.nodeSuggestions = finalObj;
        if (type !== 'reset') this.isPhaseListVisible = false;
        jqueryFunctions.enableChart();
        this.enableElements();
        this.isLoading = false;
      } else {
        let prompt = Object.values(this.promptForPhaseMapper).join("");
        let data = {
          kartaId: this.karta.id,
          prompt
        };
        this._kartaService.getSuggestionsByPhase(data).subscribe(result => {
          this.loadingSuggestion = false;
          this.nodeSuggestions = result.data;
          if (type !== 'reset') this.isPhaseListVisible = false;
          jqueryFunctions.enableChart();
          this.enableElements();
        }, err => {
          this.loadingSuggestion = false;
          this.nodeSuggestions = [];
          if (type !== 'reset') this.isPhaseListVisible = false;
          console.log(err);
          jqueryFunctions.enableChart();
          this.enableElements();
        });
      }
    }
    else if (phase.global_name.includes("Segment")) {
      this.loadingSuggestion = false;
      if (type !== 'reset') this.isPhaseListVisible = false;
      jqueryFunctions.enableChart();
      this.enableElements();
      this.isLoading = false;
    }
    else {
      // Otherwise generate suggestion
      let prompt = this.karta.node ? Object.values(this.promptForPhaseMapper).join("") : `I'm working in ${this.karta.industry.toLowerCase()} industry in ${this.karta.department.toLowerCase()} department. suggest me appropriate goals.`;
      let data = {
        kartaId: this.karta.id,
        prompt
      };
      this._kartaService.getSuggestionsByPhase(data).subscribe(result => {
        this.loadingSuggestion = false;
        this.nodeSuggestions = result.data;
        this.isLoading = false;
        if (this.currentPhaseNodeChildrens.length > 0) {
          this.existingNodes = [];
          for (let elem of this.currentPhaseNodeChildrens) {
            if (elem) {
              let obj = {
                name: elem.name,
                type: "auto",
                disabled: true
              };
              this.existingNodes.push(obj);
            }
          }
          this.nodeSuggestions.unshift(...this.existingNodes);
          jqueryFunctions.enableChart();
          this.enableElements();
        } else {
          jqueryFunctions.enableChart();
          this.enableElements();
        }
        if (type !== 'reset') this.isPhaseListVisible = false;
      }, err => {
        this.loadingSuggestion = false;
        this.nodeSuggestions = [];
        if (type !== 'reset') this.isPhaseListVisible = false;
        console.log(err);
        jqueryFunctions.enableChart();
        this.enableElements();
      });
    }

    this.newSuggestionsLoader = false;

  }

  async generateGlobalPrompt(node: any) {
    // Passed node on this function will denote till where the prompt should be generated

    // Setting default prompt value to Global Prompt
    this.globalPromptMapper["default"] = `I'm working in ${this.karta.industry} industry in ${this.karta.department} department.`;
    let flag = false;

    // Recursive function
    const recursive = async (data: any) => {
      try {
        if (data.id === node.id) {
          // Check if the recursive reached till the node which was supposed to be found
          // If found then set the globalPromptMapper and break the whole recursive function
          let phaseName = data.phase.global_name.split(" ")[0] == "Critical" ? "CSF" : data.phase.global_name.split(" ")[0];
          this.globalPromptMapper[phaseName] = `My ${phaseName.toLowerCase()} is ${data.name}.`;
          flag = true;
          return true;
        } else {
          // If not found the will loop through the children if children found
          if (data.children && data.children.length > 0) {
            // Setting gloal prompt mapper at the current node value
            let phaseName = data.phase.global_name.split(" ")[0] == "Critical" ? "CSF" : data.phase.global_name.split(" ")[0];
            this.globalPromptMapper[phaseName] = `My ${phaseName.toLowerCase()} is ${data.name}.`;
            for (const element of data.children) {
              await recursive(element);
              if (flag) {
                break;
              }
            }
          } else {
            // If children not found and the requested node still not found then backtrack to delete node to move to the sibling node
            let phaseName = data.phase.global_name.split(" ")[0] == "Critical" ? "CSF" : data.phase.global_name.split(" ")[0];
            delete this.globalPromptMapper[phaseName];
            return false;
          };
        }
        return false;
      } catch (err) {
        console.log(err);
        return false;
      }
    }

    // Initializing Recursive function
    await recursive(this.karta.node);
  }

  promptForPhaseMapper = {};
  async generatePromptForPhase(node: any) {
    // Passed node on this function will denote till where the prompt should be generated

    // Setting default prompt value to Global Prompt
    this.promptForPhaseMapper["default"] = `I'm working in ${this.karta.industry.toLowerCase()} industry in ${this.karta.department.toLowerCase()} department. `;
    let flag = false;

    // Recursive function
    // Create a recursive function that will check if node.id == data.id where data will be passed to the recursive function on call and first data
    // will be the root node of the tree
    const recursive = async (data: any) => {
      try {
        if (data.id === node.id) {
          let layerMapper = {
            "goal": 'goal',
            "csf": 'critical success factor',
            "phase": `phase`,
            "segment": `${this.karta.department.toLowerCase()} segment`,
            "approach": 'approach',
            "action": 'action',
            "kpi": 'kpi',
          };
          let lastLayerMapper = {
            "goal": 'critical success factors',
            "csf": `${this.karta.department.toLowerCase()} phases`,
            "phase": `${this.karta.department.toLowerCase()} segments`,
            "segment": 'approaches',
            "approach": 'actions',
            "action": 'kpis',
          };
          // Check if the recursive reached till the node which was supposed to be found
          // If found then set the globalPromptMapper and break the whole recursive function
          let phaseName = data.phase.global_name.split(" ")[0] == "Critical" ? "CSF" : data.phase.global_name.split(" ")[0];
          if (phaseName.toLowerCase() == "goal" && this.currentPhase.global_name.toLowerCase() == "goal") {
            this.promptForPhaseMapper[phaseName] = `suggest me appropriate goals.`;
          } else {
            this.promptForPhaseMapper[phaseName] = `My ${layerMapper[phaseName.toLowerCase()]} is ${data.name}. suggest me appropriate ${lastLayerMapper[phaseName.toLowerCase()]}.`;
          }
          flag = true;
          return true;
        } else {
          let layerMapper = {
            "goal": 'goal',
            "csf": 'critical success factor',
            "phase": `phase`,
            "segment": `${this.karta.department.toLowerCase()} segment`,
            "approach": 'approach',
            "action": 'action',
            "kpi": 'kpi',
          };

          // If not found the will loop through the children if children found
          if (data.children && data.children.length > 0) {
            // Setting gloal prompt mapper at the current node value
            let phaseName = data.phase.global_name.split(" ")[0] == "Critical" ? "CSF" : data.phase.global_name.split(" ")[0];
            this.promptForPhaseMapper[phaseName] = `My ${layerMapper[phaseName.toLowerCase()]} is ${data.name}. `;
            for (const element of data.children) {
              await recursive(element);
              if (flag) {
                break;
              }
            }
            // If children not found and the requested node still not found then backtrack to delete node to move to the sibling node
            if (!flag) {
              delete this.promptForPhaseMapper[phaseName];
            }
          }
          return false;
        }
      } catch (err) {
        console.log(err);
        return false;
      }
    }

    // Initializing Recursive function
    if (node) {
      await recursive(this.karta.node);
    }
  }

  newSuggestionsLoader: boolean = false;
  newSuggestions() {
    this.newSuggestionsLoader = true;
    const index = this.phaseIndex(this.currentPhase.id);
    this.openSuggestionMenu(this.currentPhase, index);
  }

  goToNextPhase(phase: any) {
    if (this.currentPhase.hasNode) {
      this.subSegmentMenu = false;
      const index = this.phaseIndex(phase.id);
      this.currentPhase = this.phases[index + 1];
      this.openSuggestionMenu(this.currentPhase, index + 1);
    }
  }

  goToPrevPhase(phase: any) {
    if (this.currentPhase.hasNode) {
      this.subSegmentMenu = false;
      const index = this.phaseIndex(phase.id);
      this.currentPhase = this.phases[index - 1];
      this.openSuggestionMenu(this.currentPhase, index - 1);
    }
  }

  //*** SEGMENT FUNCTIONS STARTS ***//
  isNodeAddingFromCalista: boolean = false;
  currentSegmentNode: any;
  currentSegmentChildNode: any;
  subSegmentMenu: boolean = false;
  segmentInputTouched: boolean = false;
  companySize: any = data.companySize;
  industries: any = data.industries;
  departments: any = data.departments;
  jobTitles: any = [];
  occupations: any = data.occupations;
  currentSuggestionIndex: number;
  toggleCalistaFlag: boolean = false;

  // Toggle Calista
  toggleCalista() {
    if (!this.toggleCalistaFlag) {
      jqueryFunctions.setStyle(".phase_column", "display", "none");
      jqueryFunctions.setStyle(".crt-final-sub-btn", "display", "none");
      jqueryFunctions.setStyle(".karta_column", "width", "100%");
      jqueryFunctions.removeElement('#karta-svg svg');
      this.getKartaInfo();
      this.toggleCalistaFlag = !this.toggleCalistaFlag;
    } else {
      jqueryFunctions.setStyle(".phase_column", "display", "block");
      jqueryFunctions.setStyle(".crt-final-sub-btn", "display", "block");
      jqueryFunctions.setStyle(".karta_column", "width", "78%");
      jqueryFunctions.removeElement('#karta-svg svg');
      this.getKartaInfo();
      this.toggleCalistaFlag = !this.toggleCalistaFlag;
    }
  }

  selectedModalPhase: any = "";
  selectedModalDefinition: any = "";
  selectedModalSuggestion: any = "";
  showLayerInfo(phaseId: string, phaseName: string) {
    this.selectedModalPhase = phaseName;
    this._kartaService.getSuggestionByPhaseId(phaseId).subscribe(
      (data) => {
        this.selectedModalDefinition = data[0].definition;
        for (const element of data[0].descriptions) {
          this.selectedModalSuggestion += `<p>${element.description}</p>\n`;
        }
        jqueryFunctions.showModal('calistaInfoModal');
      },
      (err) => {
        console.log(err);
      }
    );
  }

  closeLayerInfo() {
    this.selectedModalPhase = "";
    jqueryFunctions.hideModal('calistaInfoModal');
  }

  // Set phase node children in segment menu
  setPhaseNodeChildren(node: any) {
    this.closeSubSegment()
    this.currentPhaseNodeChildren = {};
    this.currentPhaseNodeChildrens = [];
    if (node) {
      this.currentPhaseNodeChildren = node;
      if (node.children) {
        this.currentPhaseNodeChildrens = [...node.children];
      }
    } else {
      this.currentPhaseNodeChildren = {};
      this.currentPhaseNodeChildrens = [];
    }
    this.highlightNode(node, this.karta.node);
    BuildKPIKarta(this.karta.node, '#karta-svg', this.D3SVG);
    jqueryFunctions.removeKarta();
  }

  // Open sub segment menu
  openSubSegment(node: any, children?: any) {
    this.currentSegmentChildNode = null;
    this.subSegmentMenu = true;
    this.segmentInputTouched = false;
    this.currentSegmentNode = node;
    if (children) {
      this.currentSegmentChildNode = children;
      this.getGeoCountries();
    }
    if (this.currentSegmentChildNode?.description?.demographic?.department) {
      let jobs = this.departments.filter((dept: any) => {
        if (dept.name == this.currentSegmentChildNode?.description?.demographic?.department) {
          return dept
        }
      });
      this.jobTitles = jobs[0].child;
    }
    // $("#segment_section").hide();
  }

  // Close sub segment menu
  closeSubSegment() {
    const index = this.phaseIndex(this.currentPhase.id);
    this.openSuggestionMenu(this.currentPhase, index);
    this.subSegmentMenu = false;
    this.currentSegmentChildNode = null;
    $("#segment_section").show();
  }

  // Change segment name or Create new segment
  changeSegmentNodeName(event: any) {
    this.segmentInputTouched = true;
    if (event.target.value && !this.currentSegmentChildNode) {
      this.segmentInputTouched = false;
      const parent_node = this.currentSegmentNode;
      const node_name = event.target.value;
      this.isNodeAddingFromCalista = true;
      this.addNode(parent_node, node_name);
    } else if (event.target.value && this.currentSegmentChildNode) {
      this.updateNode('name', event.target.value, 'node_updated', this.currentSegmentChildNode);
    }
  }

  // Need the same functionality on Enter for above function
  changeSegmentOnEnter() {
    $('#segment-name-input').blur();
  }

  // Update segment description
  updateSegmentDescription(type: string, name: string, event: any) {
    const value = typeof event !== "string" ? (Array.isArray(event) ? event : event.target.value) : event;
    if (value) {
      if ((this.currentSegmentChildNode).hasOwnProperty("description")) {
        if ((this.currentSegmentChildNode.description).hasOwnProperty("demographic") && type === "demographic") {
          if (name === "type" && this.currentSegmentChildNode.description.demographic.type !== event) {
            if (event === "B2B") {
              delete this.currentSegmentChildNode.description.demographic.age;
              delete this.currentSegmentChildNode.description.demographic.education;
              delete this.currentSegmentChildNode.description.demographic.gender;
              delete this.currentSegmentChildNode.description.demographic.occupation;
              delete this.currentSegmentChildNode.description.demographic.income;
              delete this.currentSegmentChildNode.description.demographic.marital_status;
            } else if (event === "B2C") {
              delete this.currentSegmentChildNode.description.demographic.industry_type;
              delete this.currentSegmentChildNode.description.demographic.department;
              delete this.currentSegmentChildNode.description.demographic.job_title;
              delete this.currentSegmentChildNode.description.demographic.company_size;
            }
          }
          this.currentSegmentChildNode.description.demographic[name] = value;
        } else if ((this.currentSegmentChildNode.description).hasOwnProperty("geographic") && type === "geographic") {
          this.currentSegmentChildNode.description.geographic[name] = value;
          this.selectedCountries = [];
          this.countries = [];
          this.selectedStates = [];
          this.states = [];
          this.selectedCities = [];
          this.cities = [];
          this.getGeoCountries();
        } else if ((this.currentSegmentChildNode.description).hasOwnProperty("psychographic") && type === "psychographic") {
          this.currentSegmentChildNode.description.psychographic[name] = value;
        }
      } else {
        const description = {
          demographic: {},
          geographic: {},
          psychographic: {}
        }
        description[type][name] = value;
        this.currentSegmentChildNode = { ...this.currentSegmentChildNode, description };
      }
      if (name == "department") {
        let jobs = this.departments.filter(dept => {
          if (dept.name == value) {
            return dept
          }
        });
        this.jobTitles = jobs[0].child;
      }
      this.updateNode('description', this.currentSegmentChildNode.description, 'node_updated', this.currentSegmentChildNode);
    }
  }

  //*** SEGMENT FUNCTIONS ENDS ***//
  // Generate suggestion from AI By Prompt
  suggestionLoader: boolean = false;
  generateSuggestion() {
    if (this.suggestionPrompt) {
      this.suggestionLoader = true;
      const promptSuggestion = `${Object.values(this.globalPromptMapper).join(" ")} ${this.suggestionPrompt}`;
      this.nodeSuggestions.push({ name: this.suggestionPrompt, type: "prompt" });
      this.suggestionPrompt = "";
      this._kartaService.getSuggestionsByPrompt({ prompt: promptSuggestion, kartaId: this.karta.id }).subscribe(response => {
        const suggestions = response.data;
        this.nodeSuggestions = this.nodeSuggestions.filter((suggestion: any) => suggestion.type !== "manual");
        this.nodeSuggestions.push(...suggestions);
        this.suggestionLoader = false;
      }, err => {
        console.log(err);
        this.suggestionLoader = false;
      });
    }
  }

  async removeWholeKarta(node: any, randomKey: any) {
    try {
      if (node.children && node.children.length > 0) {
        for (let child of node.children) {
          await this.removeWholeKarta(child, randomKey);
          let phase = this.phases[this.phaseIndex(node.phaseId)];
          let data = {
            kartaId: this.kartaId,
            nodeId: node.id,
            phaseId: phase.id,
            randomKey
          }
          if (node?.parent?.id) data["parentId"] = node?.parent?.id;
          await this._kartaService.removeNode(data).toPromise();
        }
      } else {
        let phase = this.phases[this.phaseIndex(node.phaseId)];
        let data = {
          kartaId: this.kartaId,
          nodeId: node.id,
          phaseId: phase.id,
          randomKey
        }
        if (node?.parent?.id) data["parentId"] = node?.parent?.id;
        await this._kartaService.removeNode(data).toPromise();
      }
    } catch (err) {
      console.log(err);
    }
  }

  // Add node from suggestion
  async addNodeFromSuggestion(event: any, node?: any) {
    console.log("in suggestion");
    if (event.target.value) {
      jqueryFunctions.disablePhase();
      this.currentSuggestionIndex = +event.target.id;
      const randomKey = new Date().getTime().toString();
      if (!event.target.checked) {
        jqueryFunctions.disableCommonPhase();
        const parent = this.currentPhaseNodeChildren;
        if (parent && parent.children && parent.children.length) {
          const node_name = event.target.value
          const node = parent.children.find(e => e.name === node_name);
          if (node) this.removeNode(node);
          setTimeout(() => {
            const node_ele = this.D3SVG.getNode(this.karta.node, parent.depth, parent.id)
            this.currentPhaseNodeChildren = node_ele;
            this.currentPhaseNodeChildrens = node_ele.children ? node_ele.children : [];
            jqueryFunctions.enableCommonPhase();
          }, 2000);
        }
      }
      // For Goal phase
      else if (event.target.checked && this.currentPhase.global_name === "Goal") {
        // Removing whole karta for history
        if (this.karta?.node?.name) {
          await this.removeWholeKarta(this.karta.node, randomKey);
          delete this.karta.node;
        }

        let data = {
          name: event.target.value,
          phaseId: this.currentPhase.id,
          kartaId: this.kartaId
        };
        this._kartaService.addNode(data).subscribe(async (response: any) => {
          response.phase = this.currentPhase;
          if (this.karta.node) {
            response.percentage = 0;
            response.border_color = this.setColors(0);
            this.D3SVG.update(response, true);
          } else {
            await this.getKartaInfo();
            jqueryFunctions.removeKarta();
            this.showSVG = true;
          }
          let responseData = { ...response };
          delete responseData.id;
          delete responseData.phase;

          let history_data = {
            event: "node_created",
            eventValue: responseData,
            kartaNodeId: response.id,
            userId: this._commonService.getUserId(),
            versionId: this.versionId,
            kartaId: this.kartaId,
            historyType: 'main',
            randomKey
          };
          let element = document.getElementById("header_operation_row");
          if (element) element.classList.add('disableDiv');
          const index = this.phaseIndex(this.currentPhase.id);
          this.hasNodeInNextPhase = (this.phases[index + 1] && this.phases[index + 1].hasNode) || false;
          this._kartaService.createKartaHistory(history_data).subscribe(
            (result: any) => { },
            (error: any) => { }
          ).add(() => {
            // Resetting Manual Input box if user creates using manual
            this.nodeSuggestions.pop();
            this.manual_suggestion = "";
            this.nodeSuggestions.push({ type: "manual" });
            let element = document.getElementById("header_operation_row");
            if (element) element.classList.remove('disableDiv');
            jqueryFunctions.enablePhase();
          });
        });
      }
      // For CSF phases
      else if (event.target.checked && this.currentPhase.global_name === "Critical Success Factor") {
        const goal = this.karta.node; // Find parent node (goal)
        const node_name = event.target.value
        this.addNode(goal, node_name);
        jqueryFunctions.enablePhase();
      }
      // For other phase
      else {
        const parent = this.currentPhaseNodeChildren; // Parent node through which child node will be connected
        const node_name = event.target.value
        this.addNode(parent, node_name);
        jqueryFunctions.enablePhase();
      }
    }
  }

  // Change phase name
  setPhaseEditable: boolean = false;
  makePhaseEditable(id: string) {
    this.setPhaseEditable = true;
    jqueryFunctions.setAttribute(`#${id}`, "contenteditable", true);
    jqueryFunctions.setStyle('.karta-cmpltd', 'cursor', 'default');
    $(`#${id}`).focus();
  }

  changePhaseName(e: any, id: string, oldName: string, index: number) {
    const name = e.target.textContent.trim();
    if (name.length === 0) {
      e.target.textContent = oldName;
      return;
    }
    this._kartaService.updatePhase(id, { name }).subscribe(
      (response: any) => {
        e.target.textContent = name;
        this.phases[index].name = name;
        jqueryFunctions.setAttribute(`#${id}`, "contenteditable", false);
        jqueryFunctions.setStyle('.karta-cmpltd', 'cursor', 'pointer');
        this.setPhaseEditable = false;

        let history_data = {
          event: "phase_updated",
          eventValue: { name },
          oldValue: { name: oldName },
          kartaNodeId: id,
          userId: this._commonService.getUserId(),
          versionId: this.versionId,
          kartaId: this.kartaId,
          parentNodeId: "None",
          historyType: 'main'
        }
        this._kartaService.createKartaHistory(history_data).subscribe(() => { });
      },
      err => {
        console.log(err);
        this.setPhaseEditable = false;
        jqueryFunctions.setStyle('.karta-cmpltd', 'cursor', 'pointer');
      }
    );
  }

  // Delete only child phase
  deletePhase(id: string, index: number) {
    const message = "Are you sure you want to delete this layer? If yes, then all nodes on this layer will be deleted.";
    this.confirmBox(message, () => {
      jqueryFunctions.disableElement("#phase_tabs");
      jqueryFunctions.disableChart();
      this.setChartConfiguration(true);

      const data = {
        phaseId: id,
        nextPhaseId: this.phases[index + 1].id,
        kartaId: this.kartaId
      }
      this._kartaService.deletePhase(data).subscribe(
        (response: any) => {
          this.phases.splice(index, 1);
          // Reconnect child phase to another parent
          if (this.phases[index].is_child) {
            this.phases[index].parentId = this.phases[index - 1].id;
          }
          this.reArrangePhases(this.phases);
          this.updateNewPercentage();
          // this.setKartaDimension();
        }
      ).add(() => {
        jqueryFunctions.enableElement("#phase_tabs");
        jqueryFunctions.enableChart();
        this.setChartConfiguration(false);
      });
    },
      () => { });
  }

  // Change node name
  changeNodeName() {
    if (this.currentNodeName !== "") {
      let node = this.currentNode;
      this.updateNode('name', this.currentNodeName, 'node_updated', node);
    }
  }

  // Change node description
  changeNodeDescription() {
    if (this.currentNodeDescription !== "") {
      let node = this.currentNode;
      this.updateNode('node_description', this.currentNodeDescription, 'node_updated', node);
    }
  }

  // Change weightage
  changeWeightage() {
    let node = this.currentNode;
    if (this.currentNodeWeight < 0 || this.currentNodeWeight === null || this.currentNodeWeight === undefined) this._commonService.errorToaster("Please enter any positive value less than or equal to 100!");
    else if (this.currentNodeWeight > 100) this._commonService.errorToaster("Weighting cannot be greater than 100!");
    else {
      let sum = 0;
      if (node && node.parent) {
        sum = node.parent.children
          .filter((item: any) => item.id !== node.id)
          .reduce((total: any, currentValue: any) => total + currentValue.weightage, 0);
      }
      if (sum + this.currentNodeWeight > 100) {
        this._commonService.errorToaster("Your aggregate weighting of all the nodes cannot be greater than 100!");
      } else {
        if (sum + this.currentNodeWeight < 99.9) {
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
    let dateNumber = el.target.value.split('-')[2];
    if (dateNumber !== "01") {
      el.target.value = this.currentNode.start_date;
      this._commonService.errorToaster("Start date must be 1st day of the month!");
    }
    else {
      this.setDueDate(el.target.value);
      let node = this.currentNode;
      this.updateNode('start_date', el.target.value, 'node_updated', node);
    }
  }

  // Change days to calculate
  changeDaysToCalculate(el: any) {
    let node = this.currentNode;
    this.updateNode('days_to_calculate', el.target.value, 'node_updated', node);
  }

  // Change fiscal year start date
  changeFiscalStartDate(el: any) {
    let node = this.currentNode;
    this.currentNode.fiscal_year_end_date = node.fiscal_year_end_date = moment(el.target.value).add(1, 'years').subtract(1, 'day');
    this.updateNode('fiscal_year_start_date', moment(el.target.value), 'node_updated', node);
  }

  // Change kpi calculation periods
  changeKPIPeriods(el: any) {
    this.kpiCalculationPeriod = {
      "frequency": el.target.value,
      "nodeId": this.currentNode.id
    }
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

  // Change target label
  changeTargetLabel(event: any) {
    let node = this.currentNode;
    this.updateNode('target_label', event.target.value, 'node_updated', node);
  }

  // Change achieved value of type switch
  typeSelectChange(el: any): any {
    let node = this.currentNode;
    let reverseObj = {
      measure: "metrics",
      metrics: "measure"
    }
    const message = "Are you sure you want to change the target type? If you do so your achieved value will be changed to 0.";
    this.confirmBox(message, () => {
      // Update achieved_value and target
      let randomKey = new Date().getTime();
      node.target[0].percentage = 0;
      let updatingParameters = [
        { key: 'achieved_value', value: 0, node_updated: 'node_updated', node, metrics: el.target.value },
        { key: 'target', value: node.target, node_updated: 'node_updated', node, metrics: el.target.value }
      ];
      for (let param of updatingParameters) {
        let metrics = param.metrics || null;
        this.updateNode(param.key, param.value, param.node_updated, param.node, metrics, randomKey);
      }
      this.currentNodeAchievedValue = 0;
      this.kpiType = el.target.value;

      // Update for metric
      if (this.currentNode.node_formula) {
        this.formulaGroup.patchValue({
          calculatedValue: 0
        });

        this.formulaGroup.controls['fields'] = new FormArray([]);
        for (let i = 0; i < this.currentNode.node_formula.fields.length; i++) {
          let fieldForm = this.fb.group({
            fieldName: new FormControl(this.currentNode.node_formula.fields[i].fieldName),
            fieldValue: new FormControl(0)
          });
          this.fields.push(fieldForm);
        }

        let newData = this.formulaGroup.value;
        delete newData["calculatedValue"];
        newData['metrics'] = true;

        this.updateNode("node_formula", newData, "node_updated", node, el.target.value, randomKey);
        this.updateNode("target", node.target, "node_updated", node, el.target.value, randomKey);
      }
    },
      () => {
        el.target.value = reverseObj[el.target.value];
        return false;
      });
  }

  // Change achieved value
  changeAchievedValue() {
    if (this.currentNode.achieved_value != this.currentNodeAchievedValue) {
      let node = this.currentNode;
      this.isAchievedChanged = true;
      if (this.currentNodeAchievedValue < 0) this._commonService.errorToaster("Please enter positive value!");
      else if (this.currentNodeAchievedValue > 999999999999999) this._commonService.errorToaster("Achieved value cannot be greater than 999999999999999!");
      else if (this.currentNodeAchievedValue >= 0 && this.currentNodeAchievedValue !== null) {
        // Calculate new percentage
        this.target.forEach((element: any) => {
          let percentage = (this.currentNodeAchievedValue / element.value) * 100;
          return (element.percentage = Math.round(percentage));
        });
        // Update achieved_value and target
        let randomKey = new Date().getTime();
        let updatingParameters = [
          { key: 'achieved_value', value: Number(this.currentNodeAchievedValue), node_updated: 'node_updated', node, metrics: "measure" },
          { key: 'target', value: this.target, node_updated: 'node_updated', node }
        ];
        if (this.target[0].percentage >= 100) updatingParameters.push({
          key: "completed_date", value: new Date(), node_updated: "node_updated", node
        });
        for (let param of updatingParameters) {
          let metrics = param.metrics || null
          this.updateNode(param.key, param.value, param.node_updated, param.node, metrics, randomKey);
        }
      }
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
  async getKartaInfo() {
    const setKartaDetails = async (response: any) => {
      this.karta = response;
      this.versionId = response.versionId;
      if (response.versionId == this.version[this.version.length - 1].id) this.disableKartaAsOf = false;
      else this.disableKartaAsOf = true;
      if (this.karta.node) {
        this.karta.node.percentage = Math.round(this.percentageObj.calculatePercentage(this.karta.node));
        this.karta.node.border_color = this.setColors(this.karta.node.percentage);
        BuildKPIKarta(this.karta.node, '#karta-svg', this.D3SVG);
        // this.setKartaDimension();
        this.showSVG = true;
        jqueryFunctions.enableChart();
      }
    }
    let response = await this._kartaService.getKarta(this.kartaId).toPromise()
    if (response.userId === this._commonService.getUserId()) {
      this.unauthorizedUser = false;
      if (response.node) {
        this.setNodePresenceInPhases(response.node);
      }
      await setKartaDetails(response);
      this.loadingKarta = false
    } else if (response.sharedTo.length > 0 && response.sharedTo.find((item: any) => item.email === this._commonService.getSession().email).accessType === "edit") {
      this.unauthorizedUser = false;
      if (response.node) {
        this.setNodePresenceInPhases(response.node);
      }
      await setKartaDetails(response);
      this.loadingKarta = false
    } else {
      this.unauthorizedUser = true;
      this.loadingKarta = false
    }
  }

  versionRollback(event: any) {
    this.loadingKarta = true;
    this.disableVersionFlag = true;
    this.setChartConfiguration(true);
    this._kartaService.versionControlHistory({ versionId: event.target.value, kartaId: this.kartaId }).subscribe(
      (data) => {
        $("#UndoAnchor").css("pointer-events", "all", "cursor", "default");
        $("#RedoAnchor").css("pointer-events", "all", "cursor", "default");
        jqueryFunctions.removeElement('#karta-svg svg');
        this.getPhases();
        MetricOperations.recheckFormula();
        this.disableVersionFlag = false;
      },
      (err) => console.log(err)
    ).add(() => {
      this.resetMontiorBy();
      this.loadingKarta = false;
      this.disableVersionFlag = false;
      this.setChartConfiguration(false);
    });
  }

  // Get all phases
  getPhases(type?: string) {
    this._kartaService.getPhases(this.kartaId).subscribe(
      (response: any) => {
        this.reArrangePhases(response);
        // Fetch karta nodes
        if (type == "existing") this.updateNewPercentage();
        else this.getKartaInfo();
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
        this.fontSize = response.color_settings.fontSize;
        this.D3SVG.styleOptions.fontSize = this.fontSize;
        if (this?.karta?.node) {
          this.karta.node.border_color = this.setColors(this.karta.node.percentage);
          this.karta.node.percentage = Math.round(this.percentageObj.calculatePercentage(this.karta.node));
          this.D3SVG.update(this.karta.node, true);
        }
        if (this.kartaId !== response.color_settings.kartaId) this.colorSettings.is_global = false;
        this.colorSettings.settings = this.colorSettings.settings.sort((a: any, b: any) => a.min - b.min);
        this.getPhases();
        this.percentageObj = new CalculatePercentage(this.colorSettings, {
          frequency: 'monthly',
          nodeId: ''
        }, 0);
      }
    );
  }

  // Divide weightage
  divideWeightage(param: any, phase: any, extraLength = 0) {
    const children = (param.children || param._children || []);
    let weightage = 0;
    if (children.length > 0) {
      let haveFurtherChildren = false;
      children.forEach((element: any) => {
        const nestedChildren = (element.children || element._children || []);
        if (nestedChildren.length > 0 && element.phaseId === phase.id) {
          weightage = 0;
          haveFurtherChildren = true;
        }
      });
      if (!haveFurtherChildren) {
        weightage = + (100 / (children.length + extraLength)).toFixed(2);
        children.forEach((item: any) => {
          item.weightage = weightage;
        });
      }
    } else weightage = 100;
    return { param, weightage };
  }

  // Add node
  timeout = null;
  addNode(param: any, name = "Child") {
    jqueryFunctions.disableCommonPhase();
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
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
          try{
          if (this.isNodeAddingFromCalista) {
            this.currentPhaseNodeChildrens.push(response);
            this.currentSegmentChildNode = response;
          }
          response.phase = phase;
          this.D3SVG.updateNewNode(param, response);
          this.updateNewPercentage();
          if (this.currentPhase) {
            const index = this.phaseIndex(this.currentPhase.id);
            this.hasNodeInNextPhase =
              (this.phases[index + 1] && this.phases[index + 1].hasNode) ||
              false;
          }


          if (this.currentSuggestionIndex > -1) {
            this.nodeSuggestions[this.currentSuggestionIndex].disabled = true;
          }
          setTimeout(() => {
            const node_ele = this.D3SVG.getNode(
              this.karta.node,
              this.currentPhaseNodeChildren.depth,
              this.currentPhaseNodeChildren.id
            );
            this.currentPhaseNodeChildren = node_ele;
            this.currentPhaseNodeChildrens = node_ele?.children
              ? node_ele.children
              : [];
            jqueryFunctions.enableCommonPhase();
          }, 1000);

          }catch(e) {
            jqueryFunctions.enableCommonPhase();
            console.log(e);
          }
        },
        (error: any) => {
          jqueryFunctions.enableChart();
          jqueryFunctions.enableCommonPhase();
        }
      );
    }, 500);
  }

  // Rearrange all phases
  reArrangePhases(phases: any) {
    let phaseResult: any = [];
    // Find sub phase
    const findSubPhase = (array: any, phaseId: string) => {
      let childPhase = array.find((item: any) => item.parentId === phaseId);
      if (childPhase) {
        delete childPhase.lastChildren;
        phaseResult.push(childPhase);
        array.splice(array.findIndex((a: any) => a.id === childPhase.id), 1);
        findSubPhase(array, childPhase.id);
      } else phaseResult[phaseResult.length - 1].lastChildren = true;
    }
    // Iterate phases
    for (let phase of phases) {
      delete phase.lastChildren;
      phaseResult.push(phase);
      findSubPhase(phases, phase.id);
    }
    // Assign phaseResult to phases
    this.phases = phaseResult;
  }

  // Check whether any phase at least one node
  hasNodeForPhase(node: any, phaseId: string) {
    if (node.phaseId === phaseId) return true;
    if (node.children || node._children) {
      const children = (node.children || node._children);
      for (const child of children) {
        const result = this.hasNodeForPhase(child, phaseId);
        if (result) return true;
      }
    }
    return false;
  }

  // Set presence, if at least one node present in a phase
  setNodePresenceInPhases(node: any) {
    this.phases.map((item: any) => {
      item.hasNode = this.hasNodeForPhase(node, item.id);
      return item;
    });
  }

  // Iterate over nodes
  iterateNodes(param: any, phaseId: string) {
    const children = param.children || param._children || [];
    if (param.phaseId === phaseId) return children;
    else {
      // Return the merged result of the recursive calls on each child
      return [].concat(...children.map((element: any) => this.iterateNodes(element, phaseId)));
    }
  }

  // Get all nodes of a phase
  getAllNodesOfPhase(phaseId: string) {
    return this.iterateNodes(this.karta.node, phaseId);
  }

  setChartConfiguration(type: boolean) {
    this.disableVersionFlag = this.undoRedoFlag = this.saveSubmitFlag = type;
  }

  // Add additional phase
  addChildPhase(phase: any, index: number) {
    if (this.phases.length < 12) {
      const message = "Are you sure you want to create a new Layer?";
      this.confirmBox(message, () => {
        jqueryFunctions.disableElement("#phase_tabs");
        jqueryFunctions.disableChart();
        this.setChartConfiguration(true);

        let mainPhaseId: string = "";
        if (this.phases[index].hasOwnProperty("phaseId")) mainPhaseId = this.phases[index].phaseId;
        else mainPhaseId = this.phases[index].id;
        // Set new phase name
        let nameString: any, lastString: any, num: any, joinedName: any, newName: any;
        nameString = this.phases[index].name.split(" ");
        lastString = parseInt(nameString[nameString.length - 1]);
        num = lastString ? lastString + 1 : 1;
        lastString ? nameString.pop() : nameString;
        joinedName = nameString.join(" ");
        // newName = `${joinedName == "Phase" ? "Marketing Phase" : joinedName} ${num}`;
        newName = `${joinedName == "Phase" ? "Phase" : joinedName} ${num}`;

        let data = {
          "name": newName,
          "kartaId": this.kartaId,
          "is_child": true,
          "parentId": phase.id,
          "phaseId": mainPhaseId,
          "userId": this._commonService.getUserId(),
          "nextPhaseId": this.phases[index + 1].id,
          "addEmptyNodes": true
        }
        this._kartaService.addPhase(data).subscribe(
          (response: any) => {
            let resopnse_data = {
              "id": response.id,
              "name": response.name,
              "global_name": response.name,
              "is_child": response.is_child,
              "kartaId": this.kartaId,
              "parentId": phase.id,
              "phaseId": mainPhaseId
            }
            this.phases.splice((index + 1), 0, resopnse_data);
            this.reArrangePhases(this.phases);
            this.D3SVG.buildOneKartaDivider();
            this.updateNewPercentage();
          }
        ).add(() => {
          jqueryFunctions.enableElement("#phase_tabs");
          jqueryFunctions.enableChart();
          this.setChartConfiguration(false);
        });
      }
        ,
        () => { });
    } else {
      const message = "You have reached the maximum limit of 12 Layers.";
      this.confirmBox(message, () => { }, () => { })
    }
  }

  // Update new percentage
  updateNewPercentage(filterTargetBy?: string, pastNodedata?: any) {
    this._kartaService.getKarta(this.kartaId).subscribe(
      (response: any) => {
        this.karta = response;
        if (filterTargetBy) {
          this.percentageObj = new CalculatePercentage(this.colorSettings, this.kpiCalculationPeriod, this.kpiPercentage, filterTargetBy, pastNodedata);
        } else this.percentageObj = new CalculatePercentage(this.colorSettings, this.kpiCalculationPeriod, this.kpiPercentage);
        this.karta.node.percentage = Math.round(this.percentageObj.calculatePercentage(this.karta.node));
        // Set colors
        this.karta.node.border_color = this.setColors(this.karta.node.percentage);
        if (this.currentPhaseNodeChildren) {
          this.highlightNode(this.currentPhaseNodeChildren, this.karta.node);
          BuildKPIKarta(this.karta.node, '#karta-svg', this.D3SVG);
          jqueryFunctions.removeKarta();
        }
        // Set node presence
        this.setNodePresenceInPhases(this.karta.node);
        this.D3SVG.update(this.karta.node, true);
        jqueryFunctions.enableChart();
        this.loadingKarta = false;
      },
      (error: any) => {
        jqueryFunctions.enableChart();
        this.loadingKarta = false;
      }
    );
  }

  // Update node
  updateNode(key: string, value: any, event: string = "unknown", updatingNode: any = this.currentNode, type?: any, randomKey?: any) {
    // Set data
    let data = { [key]: value }
    if (key === "achieved_value") {
      data["node_type"] = type;
      this.kpiType = type;
    }
    if (key === "notifyUserId") data["notify_type"] = type;
    if (key === "fiscal_year_start_date") data["fiscal_year_end_date"] = updatingNode.fiscal_year_end_date;
    // Send update node request
    this._kartaService.updateNode(updatingNode.id, data).subscribe(
      (response: any) => {
        const oldValue = { [key]: updatingNode[key] }
        updatingNode[key] = value;
        if (key === "notifyUserId") updatingNode["notify_type"] = type;
        this.D3SVG.update(updatingNode);
        // Calculate new percentage
        this.updateNewPercentage();
        // Create history
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
        if (randomKey) history_data["randomKey"] = randomKey.toString();
        this._kartaService.createKartaHistory(history_data).subscribe();
        // Create log for achieved value
        if (key === "achieved_value" && this.isAchievedChanged) {
          const log_data = {
            event,
            event_options: { [key]: value },
            kartaNodeId: updatingNode.id,
            userId: this._commonService.getUserId(),
            versionId: this.versionId,
            kartaId: this.kartaId,
            duration: new Date().toLocaleString('default', { month: 'long' })
          }
          this._kartaService.createKartaLog(log_data).subscribe();
          this.isAchievedChanged = false;
        }
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

    jqueryFunctions.disableChart();
    this._kartaService.updateNodeAndWeightage(data).subscribe(
      (response: any) => {
        this.updateNewPercentage();
      },
      (error: any) => {
        jqueryFunctions.enableChart();
      }
    );
  }

  onCatalogSubmit = async () => {

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
        let node = JSON.stringify(this.catalogForm.value.node, function (key, value) {
          if (key == 'parent') return value.id;
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
            this.getInventories();
          }
        ).add(() => this.catalogSubmitFlag = false);
      })
    }
  }

  resetCatalogForm() {
    this.catalogForm.reset();
    this.catalogForm.markAsUntouched();
    this.catalogSubmitted = false;
    this.catalogForm.patchValue({ name: "" });
  }

  // Remove node from karta
  removeNode(param: any) {
    this.currentPhaseNodeChildren = null;
    this.currentPhaseNodeChildrens = [];
    this.phaseId = "";
    // Divide weightage of remaining nodes starts
    let phase = this.phases[this.phaseIndex(param.phaseId)];
    const node = this.divideWeightage(param.parent, phase);
    param.parent = node.param;
    // Prepare deleting data
    let data = {
      kartaId: this.kartaId,
      nodeId: param.id,
      phaseId: phase.id,
      parentId: param.parent.id
    }
    jqueryFunctions.disableChart();
    this._kartaService.removeNode(data).subscribe(
      (response: any) => {
        this.D3SVG.update(param.parent);
        this.updateNewPercentage();
      },
      (error: any) => {
        jqueryFunctions.enableChart();
      }
    );
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
    if (element) if (element) element.classList.add('selectedPhase');
  }

  onMouseLeaveKartaLines(ev: any) {
    ev.preventDefault();
    this.isRtNodDrgingFrmSide = false;
    let element = document.getElementById(ev.target.id);
    if (element) if (element) element.classList.remove('selectedPhase');
  }

  // addRootNode(ev: any) {
  //   let element = ev.target.closest('div');
  //   this.isNodeDropable = true;
  //   this.onDrop(element.id, 'add_root');
  // }

  onDragOver(ev: any) {
    ev.preventDefault();
    jqueryFunctions.hideLeftSidebar();
    let element = document.getElementById(ev.target.id)!;
    let elAttributes: any = element.attributes;
    // Check is root node dragging
    if (this.isRtNodDrgingFrmSide && elAttributes.name.value === "KPI") {
      this.isNodeDropable = false;
      if (element) element.classList.add('selectedPhaseError');
    } else if (this.isRtNodDrgingFrmSide && elAttributes.name.value !== "KPI") {
      this.isNodeDropable = true;
      if (element) element.classList.add('selectedPhase');
    }
    // Check if inventory node dragging
    else if (this.draggingInventoryNode && this.draggingInventoryNode.node_type === "branch" && elAttributes.name.value === "KPI") {
      this.isNodeDropable = false;
      if (element) element.classList.add('selectedPhaseError');
    } else if (this.draggingInventoryNode && this.draggingInventoryNode.node_type === "branch" && elAttributes.name.value !== "KPI") {
      const draggingDepth = this.getDepth(this.draggingInventoryNode.node);
      const selectedDepth = this.phaseIndex(ev.target.id.substring(9));
      if ((draggingDepth + selectedDepth) > 5) {
        this.isNodeDropable = false;
        if (element) element.classList.add('selectedPhaseError');
      } else {
        this.isNodeDropable = true;
        if (element) element.classList.add('selectedPhase');
      }
    } else if (this.draggingInventoryNode && (this.draggingInventoryNode.node_type === "measure" || this.draggingInventoryNode.node_type === "metric") && elAttributes.name.value === "KPI") {
      this.isNodeDropable = true;
      if (element) element.classList.add('selectedPhase');
    } else if (this.draggingInventoryNode && (this.draggingInventoryNode.node_type === "measure" || this.draggingInventoryNode.node_type === "metric") && elAttributes.name.value !== "KPI") {
      this.isNodeDropable = false;
      if (element) element.classList.add('selectedPhaseError');
    }
  }

  onDragLeave(ev: any) {
    ev.preventDefault();
    let element = document.getElementById(ev.target.id);
    if (element) {
      if (element) element.classList.remove('selectedPhase');
      if (element) element.classList.remove('selectedPhaseError');
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
        name: "Goal",
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
        let responseData = { ...response };
        delete responseData.id;
        delete responseData.phase;

        let history_data = {
          event: "node_created",
          eventValue: responseData,
          kartaNodeId: response.id,
          userId: this._commonService.getUserId(),
          versionId: this.versionId,
          kartaId: this.kartaId,
          historyType: 'main'
        };
        let element = document.getElementById("header_operation_row");
        if (element) element.classList.add('disableDiv');
        this._kartaService.createKartaHistory(history_data).subscribe(
          (result: any) => { },
          (error: any) => { }
        ).add(() => {
          let element = document.getElementById("header_operation_row");
          if (element) element.classList.remove('disableDiv');
        });
      });
    } else {
      this._commonService.warningToaster("You cannot drag this node here!");
      this.isRtNodDrgingFrmSide = false;
      let element = document.getElementById(ev.target.id);
      if (element) {
        if (element) element.classList.remove('selectedPhase');
        if (element) element.classList.remove('selectedPhaseError');
      }
    }
  }

  // On Inventory drop
  onInventoryDrop(node: any, parent = null) {
    let data = {
      node,
      parent,
      kartaId: this.kartaId,
      nodeType: this.draggingInventoryNode.node_type,
      addByInventory: true
    }
    data.node = JSON.parse(this.removeCircularData(node));
    data.parent = JSON.parse(this.removeCircularData(parent));

    jqueryFunctions.disableChart();
    let element = document.getElementById("header_operation_row");
    if (element) element.classList.add('disableDiv');
    this._kartaService.addNodeByInventory(data).subscribe(
      (response: any) => {
        this.updateNewPercentage();
        // this.getKartaInfo();
        // setTimeout(() => jqueryFunctions.removeKarta(), 2000);
        // jqueryFunctions.enableChart();
        jqueryFunctions.hideLeftSidebar();
      },
      (error: any) => {
        jqueryFunctions.enableChart();
      }
    ).add(() => {
      let element = document.getElementById("header_operation_row");
      if (element) element.classList.remove('disableDiv');
    });
  }

  // Save karta
  saveKarta() {
    this.saveSubmitFlag = true;
    this.showLoader = true;
    this.disableVersionFlag = true;
    jqueryFunctions.disableChart();
    jqueryFunctions.disableElement("#phase_tabs");
    // New Version Calculation
    let versionNumber = this.version.reduce((acc: any, curr: any) => {
      let num = curr.name;
      if (Number(num) > acc) {
        acc = Number(num);
      }
      return acc;
    }, 0);

    // New Version Object
    let new_version = {
      name: `${versionNumber + 1}`,
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
            this.updateNewPercentage();
            this._commonService.successToaster("New version created successfully..!!");
            this._kartaService.getAllVersions(this.kartaId).subscribe(
              (response: any) => {
                this.version = response;
                this.versionId = response[response.length - 1].id;
                this.loadingKarta = false;
                this.saveSubmitFlag = false;
                this.showLoader = false;
                jqueryFunctions.enableChart();
                jqueryFunctions.enableElement("#phase_tabs");
                this.disableVersionFlag = false;
              },
              (error: any) => {
                this.loadingKarta = false;
                this.saveSubmitFlag = false;
                this.showLoader = false;
                jqueryFunctions.enableChart();
                jqueryFunctions.enableElement("#phase_tabs");
                this.disableVersionFlag = false;
              }
            );
          },
          (err: any) => {
            console.log(err)
          }
        )
      },
      (err: any) => {
        this.saveSubmitFlag = false;
        this.loadingKarta = false;
        jqueryFunctions.enableChart();
        jqueryFunctions.enableElement("#phase_tabs");
        this.disableVersionFlag = false;
        console.log(err)
      }
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
  onShare() {
    let param = this.karta;
    delete param.node;
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

    for (let i = 0; i < this.members.length; i++) {
      emailObject[this.members[i].email] = this.members[i].email;
    }
    for (let j = 0; j < this.selectedSharedUsers.length; j++) {
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
    if (this.selectedSharedUsers.length === 0) {
      this._commonService.errorToaster('Please select the users!');
    } else if (this.selectedSharedUsers.length === 1 && this.selectedSharedUsers[0].email == this._commonService.getEmailId()) {
      this._commonService.warningToaster("You can not share Karta to yourself!");
    } else {
      this.emails = this.selectedSharedUsers.filter((item: any) => item.email !== this._commonService.getEmailId()).map((el: any) => el.email)
      if (this.emails.length > 0) {
        let data = {
          kartaId: this.sharingKarta.id,
          emails: this.emails,
          accessType: this.changeModeType
        }
        this.sharedSubmitFlag = true;

        this._kartaService.shareKarta(data).subscribe(
          (response: any) => {
            this._commonService.successToaster("You have shared Karta successfully!");
            jqueryFunctions.hideModal('shareKartaModal');
            this.karta.sharedTo = this.emails;
          },
          (error: any) => { console.log(error) }
        ).add(() => this.sharedSubmitFlag = false);
      }
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
      else this.colorSettings.settings.push(this.colorForm.value);
    }
  }

  toggleColorSettings(e: any) {
    const data = {
      colorId: this.colorSettings.id,
      userId: this._commonService.getUserId(),
      is_global: e.target.checked
    }
    this._kartaService.toggleGlobalColorSetting(data).subscribe(
      (response: any) => {
        if (e.target.checked) {
          this._commonService.successToaster("Success! These settings will apply in all instances. ");
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
        if (this.colorSettings.hasOwnProperty("userId") && (this.colorSettings.hasOwnProperty("kartaId") && this.colorSettings.kartaId === this.kartaId)) {
          this._kartaService.updateColorSetting({...this.colorSettings, fontSize:this.fontSize}, this.colorSettings.id, ).subscribe(
            (response: any) => {
              this.colorSettings = response;
              console.log(response.fontSize, 'response font size');
              this.fontSize = response.fontSize;
              this.colorSettings.settings = this.colorSettings.settings.sort((a: any, b: any) => a.min - b.min);
              this._commonService.successToaster("Settings saved successfully");
              // this.reRenderKarta();
              this.updateNewPercentage();
              if (this.D3SVG && typeof this.D3SVG.setFontSize === 'function'){
                this.D3SVG.setFontSize(this.fontSize);
              }
            }).add(() => this.colorSubmitFlag = false);
        } else {
          let settingData = {
            userId: this._commonService.getUserId(),
            kartaId: this.kartaId,
            settings: this.colorSettings.settings,
            fontSize: this.fontSize
          }
          this._kartaService.createColorSetting(settingData).subscribe(
            (response: any) => {
              this.colorSettings = response;
              this.colorSettings.settings = this.colorSettings.settings.sort((a: any, b: any) => a.min - b.min);
              this.karta.fontSize = this.fontSize;
              this._commonService.successToaster("Settings saved successfully");
              // this.reRenderKarta();
              this.updateNewPercentage();
              console.log(typeof this.D3SVG.setFontSize, 'create check');
              if (this.D3SVG && typeof this.D3SVG.setFontSize === 'function'){
                this.D3SVG.setFontSize(this.fontSize);
              }
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
    if (node.id == this.getRemovableNodeId) {
      this.getRemovableNode = node;
      return;
    } else {
      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          if (this.getRemovableNode) {
            break;
          }
          this.returnChildNode(node.children[i]);
        }
      }
    }
  }

  undoKarta() {
    this.undoRedoFlag = true;
    this.phaseId = "";
    this.setChartConfiguration(true);
    jqueryFunctions.enableChart();
    $("#RedoAnchor").css("pointer-events", "all", "cursor", "default");
    this._kartaService.undoFunctionality({ kartaId: this.kartaId, versionId: this.versionId }).subscribe(
      (x: any) => {
        if (x.data.message != "nothing") {
          if (x.data.message != "final") {
            switch (x.data.data.event) {
              case "node_created":
                if (x.data.data) {
                  this.getRemovableNodeId = x.data.data.kartaNodeId;
                  this.returnChildNode(this.karta.node);
                  this.getPhases("existing");
                  this.getRemovableNode = null;
                  this.getRemovableNodeId = "";
                  setTimeout(() => {
                    this.undoRedoFlag = false;
                    this.setChartConfiguration(false);
                    jqueryFunctions.enableChart();
                  }, 1000);
                }
                break;
              case "node_updated":
                if (x.data.data) {
                  this._kartaService.getNode(x.data.data.kartaNodeId).subscribe((kartaNode: any) => {
                    let phase = this.phases[this.phaseIndex(kartaNode.phaseId)];
                    kartaNode.phase = phase;
                    this.showSVG = true;
                    this.isRtNodDrgingFrmSide = false;
                    this.updateNodeProperties(kartaNode);
                    this.currentNode.phase = "";
                    this.D3SVG.updateNode(this.currentNode);
                    this.getPhases("existing");
                    setTimeout(() => {
                      jqueryFunctions.removeKarta();
                      this.undoRedoFlag = false;
                      this.setChartConfiguration(false);
                      jqueryFunctions.enableChart();
                    }, 1000);
                  },
                    (err) => {
                      console.log(err);
                      this.undoRedoFlag = false;
                      this.setChartConfiguration(false);
                      jqueryFunctions.enableChart();
                    });
                }
                break;
              case "node_removed":
                if (x.data.data) {
                  this._kartaService.getNode(x.data.data.kartaNodeId).subscribe((kartaNode: any) => {
                    this.getPhases("existing");
                    let phase = this.phases[this.phaseIndex(kartaNode.phaseId)];
                    kartaNode.phase = phase;
                    this.currentNode.phase = "";
                    this.showSVG = true;
                    this.isRtNodDrgingFrmSide = false;
                    setTimeout(() => {
                      jqueryFunctions.removeKarta();
                      this.undoRedoFlag = false;
                      this.setChartConfiguration(false);
                      jqueryFunctions.enableChart();
                    }, 1000);
                  },
                    (err) => {
                      console.log(err);
                      this.undoRedoFlag = false;
                      this.setChartConfiguration(false);
                      jqueryFunctions.enableChart();
                    });
                }
                break;
              case "phase_created":
                if (x.data.data) {
                  this.getPhases("existing");
                  this.currentNode.phase = "";
                  this.showSVG = true;
                  this.isRtNodDrgingFrmSide = false;
                  setTimeout(() => {
                    this.undoRedoFlag = false;
                    this.setChartConfiguration(false);
                    jqueryFunctions.enableChart();
                  }, 1000);
                }
                break;
              case "phase_updated":
                if (x.data.data) {
                  this.getPhases("existing");
                  this.currentNode.phase = "";
                  this.showSVG = true;
                  this.isRtNodDrgingFrmSide = false;
                  setTimeout(() => {
                    this.undoRedoFlag = false;
                    this.setChartConfiguration(false);
                    jqueryFunctions.enableChart();
                  }, 1000);
                }
                break;
              case "phase_removed":
                if (x.data.data) {
                  this.getPhases("existing");
                  this.currentNode.phase = "";
                  this.showSVG = true;
                  this.isRtNodDrgingFrmSide = false;
                  setTimeout(() => {
                    this.undoRedoFlag = false;
                    this.setChartConfiguration(false);
                    jqueryFunctions.enableChart();
                  }, 1000);
                }
                break;
            }
          }
          else {
            this._commonService.warningToaster("Maximum Undo limit has been reached!");
            $("#UndoAnchor").css("pointer-events", "none", "cursor", "not-allowed");
            setTimeout(() => {
              $("#UndoAnchor").css("pointer-events", "all", "cursor", "default");
            }, 2000);
            this.undoRedoFlag = false;
            this.setChartConfiguration(false);
            jqueryFunctions.enableChart();
          }
        } else {
          this._commonService.warningToaster("Maximum Undo limit has been reached!");
          $("#UndoAnchor").css("pointer-events", "none", "cursor", "not-allowed");
          setTimeout(() => {
            $("#UndoAnchor").css("pointer-events", "all", "cursor", "default");
          }, 2000);
          this.undoRedoFlag = false;
          this.setChartConfiguration(false);
          jqueryFunctions.enableChart();
        }
      }
    )
  }

  async redoKarta() {
    this.undoRedoFlag = true;
    this.phaseId = "";
    this.setChartConfiguration(true);
    jqueryFunctions.enableChart();
    $("#UndoAnchor").css("pointer-events", "all", "cursor", "default");
    this._kartaService.redoFunctionality({ kartaId: this.kartaId, versionId: this.versionId }).subscribe(
      (x: any) => {
        if (x.data.message != "nothing") {
          if (x.data.message != "final") {
            switch (x.data.data.event) {
              case "node_created":
                if (x.data.data) {
                  this._kartaService.getNode(x.data.data.kartaNodeId).subscribe((kartaNode: any) => {
                    if (kartaNode) {
                      this.getPhases("existing");
                      this.currentNode.phase = "";
                      let phase = this.phases[this.phaseIndex(kartaNode.phaseId)];
                      kartaNode.phase = phase;
                      this.showSVG = true;
                      this.isRtNodDrgingFrmSide = false;
                      setTimeout(() => {
                        jqueryFunctions.removeKarta();
                        this.undoRedoFlag = false;
                        this.setChartConfiguration(false);
                        jqueryFunctions.enableChart();
                      }, 1000);
                    }
                  },
                    (err) => {
                      console.log(err);
                      this.undoRedoFlag = false;
                      this.setChartConfiguration(false);
                      jqueryFunctions.enableChart();
                    });
                }
                break;
              case "node_updated":
                if (x.data.data) {
                  this._kartaService.getNode(x.data.data.kartaNodeId).subscribe((kartaNode: any) => {
                    if (kartaNode) {
                      let phase = this.phases[this.phaseIndex(kartaNode.phaseId)];
                      kartaNode.phase = phase;
                      this.showSVG = true;
                      this.isRtNodDrgingFrmSide = false;
                      this.updateNodeProperties(kartaNode);
                      this.D3SVG.updateNode(this.currentNode);
                      this.getPhases("existing");
                      setTimeout(() => {
                        jqueryFunctions.removeKarta();
                        this.undoRedoFlag = false;
                        this.setChartConfiguration(false);
                        jqueryFunctions.enableChart();
                      }, 1000);
                    }
                  },
                    (err) => {
                      console.log(err);
                      this.undoRedoFlag = false;
                      this.setChartConfiguration(false);
                      jqueryFunctions.enableChart();
                    });
                }
                break;
              case "node_removed":
                if (x.data.data) {
                  this.getRemovableNodeId = x.data.data.kartaNodeId;
                  this.returnChildNode(this.karta.node);
                  this.getPhases("existing");
                  this.getRemovableNode = null;
                  this.getRemovableNodeId = "";
                  setTimeout(() => {
                    this.undoRedoFlag = false;
                    this.setChartConfiguration(false);
                    jqueryFunctions.enableChart();
                  }, 1000);
                }
                break;
              case "phase_created":
                if (x.data.data) {
                  this.getPhases("existing");
                  this.currentNode.phase = "";
                  this.showSVG = true;
                  this.isRtNodDrgingFrmSide = false;
                  setTimeout(() => {
                    this.undoRedoFlag = false;
                    this.setChartConfiguration(false);
                    jqueryFunctions.enableChart();
                  }, 1000);
                }
                break;
              case "phase_updated":
                if (x.data.data) {
                  this.getPhases("existing");
                  this.currentNode.phase = "";
                  this.showSVG = true;
                  this.isRtNodDrgingFrmSide = false;
                  setTimeout(() => {
                    this.undoRedoFlag = false;
                    this.setChartConfiguration(false);
                    jqueryFunctions.enableChart();
                  }, 1000);
                }
                break;
              case "phase_removed":
                if (x.data.data) {
                  this.getPhases("existing");
                  this.currentNode.phase = "";
                  this.showSVG = true;
                  this.isRtNodDrgingFrmSide = false;
                  setTimeout(() => {
                    this.undoRedoFlag = false;
                    this.setChartConfiguration(false);
                    jqueryFunctions.enableChart();
                  }, 1000);
                }
                break;
            }
          }
          else {
            this._commonService.warningToaster("Maximum Redo limit has been reached!");
            $("#RedoAnchor").css("pointer-events", "none", "cursor", "not-allowed");
            setTimeout(() => {
              $("#RedoAnchor").css("pointer-events", "all", "cursor", "default");
              this.undoRedoFlag = false;
              this.setChartConfiguration(false);
              jqueryFunctions.enableChart();
            }, 2000);
          }
        } else {
          this._commonService.warningToaster("Maximum Redo limit has been reached!");
          $("#RedoAnchor").css("pointer-events", "none", "cursor", "not-allowed");
          setTimeout(() => {
            $("#RedoAnchor").css("pointer-events", "all", "cursor", "default");
            this.undoRedoFlag = false;
            this.setChartConfiguration(false);
            jqueryFunctions.enableChart();
          }, 2000);
        }
      }
    )
  }
  // Undo Redo Functionality ends

  // Show karta tutorial starts
  showTutorial() {
    this._commonService.updateSession('newkartaId', this.kartaId);
    this._kartaService.getIntroKarta().subscribe(
      (response: any) => {
        if (response.length > 0) {
          this.router.navigate(['/karta/intro', response[0].id]);
        }
      },
      (error: any) => {
        console.log(error);
      }
    );
  }

  ngOnDestroy(): void {
    this._commonService.deleteNodeSession();
  }
  // Show karta tutorial ends

  // I am feeling lucky starts ------------------------------------------
  feelingLoader: boolean = false;
  async addLuckyNodes(param: any, randomKey: any, name = "Child") {
    try {
      let phase = this.phases[this.phaseIndex(param.phaseId) + 1];
      const node = this.divideWeightage(param, phase, 1);
      param = node.param;
      let data: any = {
        name,
        kartaDetailId: this.kartaId,
        phaseId: phase.id,
        parentId: param.id,
        weightage: node.weightage,
        randomKey
      }
      if (phase.global_name === "KPI") {
        data.node_type = "measure";
        data.target = [{ frequency: 'monthly', value: 0, percentage: 0 }];
        data.achieved_value = 0;
        data.is_achieved_modified = false;
        data.days_to_calculate = "all";
        data.alert_type = "";
        data.alert_frequency = "";
        data.kpi_calc_period = 'monthly';
      } else {
        let nextPhase = this.phases[this.phaseIndex(param.phaseId) + 2];
        data.nextPhaseId = nextPhase.id;
      }
      let response = await this._kartaService.addNode(data).toPromise();
      if (response) {
        if (this.isNodeAddingFromCalista) {
          this.currentPhaseNodeChildrens.push(response);
          this.currentSegmentChildNode = response;
        }
        response.phase = phase;
        this.D3SVG.updateNewNode(param, response);
        if (this.currentPhase) {
          const index = this.phaseIndex(this.currentPhase.id);
          this.hasNodeInNextPhase = (this.phases[index + 1] && this.phases[index + 1].hasNode) || false;
        }
        if (this.currentSuggestionIndex > -1) {
          this.nodeSuggestions[this.currentSuggestionIndex].disabled = true;
        }
        return response;
      }
    } catch (err) {
      console.log(err);
      jqueryFunctions.enableChart();
    }
  }

  async createKartaFromStart(prompt: any, randomKey: any) {
    try {
      let finalPrompt = `${prompt} I'm feeling lucky.`;
      const remainingKarta = await this._kartaService.feelingLuckyKarta(finalPrompt, this.karta.id).toPromise();
      this.feelingLoader = true;
      jqueryFunctions.disableChart();

      const recursion = async (parent: any, data: any) => {
        try {
          if (!parent) {
            let nodeData = {
              name: data.name,
              phaseId: this.phases[0].id,
              kartaId: this.kartaId
            };
            let response = await this._kartaService.addNode(nodeData).toPromise();
            response.phase = this.phases[0];

            // Creating History of root node
            let responseData = { ...response };
            delete responseData.id;
            delete responseData.phase;

            let history_data = {
              event: "node_created",
              eventValue: responseData,
              kartaNodeId: response.id,
              userId: this._commonService.getUserId(),
              versionId: this.versionId,
              kartaId: this.kartaId,
              historyType: 'main'
            };
            let element = document.getElementById("header_operation_row");
            if (element) element.classList.add('disableDiv');
            this._kartaService.createKartaHistory(history_data).subscribe(
              (result: any) => { },
              (error: any) => { }
            ).add(() => {
              // Resetting Manual Input box if user creates using manual
              let element = document.getElementById("header_operation_row");
              if (element) element.classList.remove('disableDiv');
            });

            await this.getKartaInfo();
            this.showSVG = true;
            this.feelingLoader = true;
            jqueryFunctions.disableChart();

            if (data.children && data.children.length > 0) {
              for (const element of data.children) {
                await recursion(this.karta.node, element);
              }
            }
            return true;
          } else {
            const name = data.name || data;
            let node = await this.addLuckyNodes(parent, randomKey, name);
            if (data.children && data.children.length > 0) {
              for (const element of data.children) {
                await recursion(node, element);
              }
            }
            return true;
          }
        }
        catch (err) {
          console.log(err);
          return true;
        }
      }

      await recursion(null, remainingKarta.data);
      return true;
    }
    catch (err) {
      console.log(err);
      jqueryFunctions.enableChart();
      this.loadingKarta = false;
      return true;
    }
  }

  weightageMapping: any = {};
  async resetWeightage(randomKey: any) {
    try {
      const weightRecursion = async (structure: any) => {
        if (structure.children && structure.children.length > 0) {
          let phaseName = structure.phase.global_name == "Critical Success Factor" ? "CSF" : (structure.phase.global_name.includes("Phase") ? "Phase" : structure.phase.global_name)
          this.weightageMapping[phaseName] = 100 / structure.children.length;
          if (structure.parent) {
            let parentName = structure.parent.phase.global_name == "Critical Success Factor" ? "CSF" : (structure.parent.phase.global_name.includes("Phase") ? "Phase" : structure.parent.phase.global_name)
            await this._kartaService.updateNode(structure.id, { 'weightage': this.weightageMapping[parentName] }).toPromise();
            const oldValue = { 'weightage': structure.weightage }
            // Create history
            let history_data = {
              event: 'node_updated',
              eventValue: { 'weightage': this.weightageMapping[parentName] },
              oldValue,
              kartaNodeId: structure.id,
              userId: this._commonService.getUserId(),
              versionId: this.versionId,
              kartaId: this.kartaId,
              parentNodeId: structure.parentId,
              historyType: 'main',
              randomKey
            }
            await this._kartaService.createKartaHistory(history_data).toPromise();
          }

          for (let element of structure.children) {
            await weightRecursion(element);
          }
        }
      }

      await weightRecursion(this.karta.node);
    } catch (err) {
      console.log(err);
    }
  }

  async feelingLucky() {
    try {
      this.showPhaseList()
      this.isLoading = true;
      this.feelingLoader = true;
      jqueryFunctions.disableChart();
      for (let elem of this.controlElements) {
        let element = document.getElementById(elem);
        if (element) element.classList.add('disableDiv');
      }

      // common Random Key for Undo Redo process
      const randomKey = new Date().getTime().toString();
      let promptMapper = {
        "default": `I'm working in ${this.karta.industry.toLowerCase()} industry in ${this.karta.department.toLowerCase()} department.`
      };

      // If the canvas is not blank and filled with few nodes
      if (this.karta.node) {
        // Recursive function which will loop through nodes which are already created on the svg
        const nodeMappingRecursively = async (data: any) => {
          try {
            let lastLayerMapper = {
              "goal": 'goal',
              "csf": 'critical success factor',
              "phase": `phase`,
              "segment": `${this.karta.department.toLowerCase()} segment`,
              "approach": 'approach',
              "action": 'action',
              "kpi": 'kpi',
            };
            // checking if the node has children or not
            if (data.children && data.children.length > 0) {
              if (data.name) {
                let phaseName = data.phase.global_name == "Critical Success Factor" ? "CSF" : (data.phase.global_name.includes("Phase") ? "Phase" : data.phase.global_name)
                promptMapper[data.phase.global_name] = `My ${lastLayerMapper[phaseName.toLowerCase()]} is ${data.name}.`
              }
              // If child found then passing it again on recursive function
              for (const element of data.children) {
                let resp = await nodeMappingRecursively(element);
                if (resp) {
                  delete promptMapper[element.phase.global_name];
                } else return true;
              }
            }
            // if no children found then create nodes till KPI
            else {
              if (data.phase.global_name !== "KPI") {
                if (data.name) {
                  let phaseName = data.phase.global_name == "Critical Success Factor" ? "CSF" : (data.phase.global_name.includes("Phase") ? "Phase" : data.phase.global_name)
                  promptMapper[data.phase.global_name] = `My ${lastLayerMapper[phaseName.toLowerCase()]} is ${data.name}.`
                }
                let prompt = Object.values(promptMapper).join(" ");

                // OpenAI Suggestions below before create a node starts ------------------
                // Recursion in a recursion
                let remainingKarta = await this._kartaService.feelingLuckyKarta(`${prompt} I'm feeling lucky.`, this.karta.id).toPromise();

                // this.isLoading = false;
                // Recursive function which will loop through nodes to create new nodes for partially filled karta
                const nodeCreateRecursively = async (parent: any, structure: any, randomKey?: any) => {
                  try {
                    if (!Array.isArray(structure)) {
                      const name = structure.name || structure;
                      let node = await this.addLuckyNodes(parent, randomKey, name);
                      if (structure.children && structure.children.length > 0) {
                        for (const element of structure.children) {
                          await nodeCreateRecursively(node, element, randomKey);
                        }
                      }
                      return true;
                    } else {
                      for (const element of structure) {
                        await nodeCreateRecursively(parent, element, randomKey);
                      }
                      return true;
                    }
                  } catch (err) {
                    console.log(err);
                    return true;
                  }
                };

                // Recursion in a recursion for creating rest of the nodes
                await nodeCreateRecursively(data, remainingKarta.data.children, randomKey);

                // OpenAI Suggestions below before create a node ends --------------------
                return true;
              } else {
                return true;
              };
            }

            return true;
          } catch (err) {
            console.log(err);
            this.feelingLoader = false;
            return true;
          }
        };

        // Calling the function and passing the tree data of karta
        let resp = await nodeMappingRecursively(this.karta.node);
        // this.isLoading = false;
        if (resp) {
          await this.resetWeightage(randomKey);
          this.updateNewPercentage();
          this.feelingLoader = false;
          this.isLoading = false;
          for (let elem of this.controlElements) {
            let element = document.getElementById(elem);
            if (element) element.classList.remove('disableDiv');
          }
        }
      } else {
        // If the canvas is completely blank from Goal node
        let resp = await this.createKartaFromStart(promptMapper["default"], randomKey);
        // this.isLoading = false;
        if (resp) {
          await this.resetWeightage(randomKey);
          this.updateNewPercentage();
          this.feelingLoader = false;
          this.isLoading = false;
          for (let elem of this.controlElements) {
            let element = document.getElementById(elem);
            if (element) element.classList.remove('disableDiv');
          }
        }
      }
    } catch (err) {
      console.log(err);
      jqueryFunctions.enableChart();
      this.loadingKarta = false;
      for (let elem of this.controlElements) {
        let element = document.getElementById(elem);
        if (element) element.classList.remove('disableDiv');
      }
    }
  }
  // I am feeling lucky ends ------------------------------------------

  disableElements() {
    jqueryFunctions.disableChart();
    for (let elem of this.controlElements) {
      let element = document.getElementById(elem);
      if (element) element.classList.add('disableDiv');
    }
  }

  enableElements() {
    jqueryFunctions.enableChart();
    for (let elem of this.controlElements) {
      let element = document.getElementById(elem);
      if (element) element.classList.remove('disableDiv');
    }
  }

}
