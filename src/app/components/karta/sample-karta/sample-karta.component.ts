import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ExportToCsv } from 'export-to-csv';
import { CommonService } from '@app/shared/_services/common.service';
import { KartaService } from '../service/karta.service';
import * as BuildKPIKarta from '../utils/d3.js';
import * as jqueryFunctions from '../utils/jqueryOperations.js';
import * as moment from 'moment';
import * as MetricOperations from '../utils/metricFormulaOperations';
import { CalculatePercentage } from '../utils/calculatePercentage';

declare const $: any;


@Component({
  selector: 'app-sample-karta',
  templateUrl: './sample-karta.component.html',
  styleUrls: ['./sample-karta.component.scss']
})
export class SampleKartaComponent implements OnInit, OnDestroy {

  kartaId: string = '';
  karta: any;
  currentNode: any = {};
  phaseId: string = '';
  phaseName: string = '';
  phases: any = [];
  colorSettings: any = [];
  suggestion: any;
  loadingKarta: boolean = true;
  loader: any = this._commonService.loader;
  showSVG: boolean = false;
  formulaGroup: FormGroup | any = [];

  // D3 karta events
  D3SVG: any = {
    phases: () => this.phases,
    events: {
      nodeItem: (d: any) => {
        this.updateNodeProperties(d);
      },
      collapseNode: (d: any) => {
        this._commonService.addNodeInSession(d.id);
      },
      expandNode: (d: any) => {
        this._commonService.removeNodeFromSession(d.id);
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
  minStartDate: any = `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, "0")}-01`;
  minFiscalStartDate: any = `${new Date().getFullYear()}-01-01`;
  currentNodeName: string = '';
  currentNodeDescription: string = '';
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
  kpiCalculationPeriod = {
    frequency: 'monthly',
    nodeId: ''
  };
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

  // Version Control
  version: any = [];
  versionId: any = "";
  formulaError: string = "";
  disableVersionFlag: boolean = false;
  showLoader: boolean = false;

  // Declare calculate percentage class variable
  percentageObj: any;

  constructor(
    private _kartaService: KartaService,
    private _commonService: CommonService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    // Get karta id from url
    this.kartaId = this.route.snapshot.paramMap.get('id') || '';
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
    // Get versions
    this.getAllVersion();
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

  // ---------FormArray Functions defined Below----------

  // Check Field Value for ReadOnly
  checkFieldStatus(id: any) {
    return MetricOperations.checkFieldStatus(id);
  }

  // Getting the FormArray values
  get fields() {
    return this.formulaGroup.controls['fields'] as FormArray;
  }

  @HostListener('window:scroll', ['$event'])
  getScrollPosition() {
    return $('#rightSidebar').scrollTop();
  }

  // ---------FormArray Functions defined Above----------

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

  // Find phase index
  phaseIndex(phaseId: string) {
    return this.phases.findIndex((item: any) => {
      return item.id === phaseId;
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
    if (this.currentNode.phase.name === 'KPI') {
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
        { name: "Weekly", value: "weekly", disabled: false },
        { name: "Monthly", value: "monthly", disabled: false },
        { name: "Quarterly", value: "quarterly", disabled: false },
        { name: "Yearly", value: "yearly", disabled: false }
      ]
      // Disable the target option that is already defined
      this.target.forEach((element: any) => {
        this.disableTargetOption(element.frequency);
      });
    }
  }

  // Get karta details including all nodes
  getKartaInfo() {
    const setKartaDetails = (response: any) => {
      this.karta = response;
      this.versionId = response.versionId;
      if (this.karta.node) {
        this.karta.node.percentage = Math.round(this.percentageObj.calculatePercentage(this.karta.node));
        this.karta.node.border_color = this.setColors(this.karta.node.percentage);
        BuildKPIKarta(this.karta.node, '#karta-svg', this.D3SVG);
        this.showSVG = true;
        jqueryFunctions.enableChart();
      }
    }
    this._kartaService.getKarta(this.kartaId).subscribe(
      (response: any) => {
        setKartaDetails(response);
      }
    ).add(() => (this.loadingKarta = false));
  }
  
  // Get all phases
  getPhases() {
    this._kartaService.getGlobalPhases().subscribe(
      (response: any) => {
        this.reArrangePhases(response);
        this.getKartaInfo();
      }
    );
  }

  // Get suggestion by phaseId
  getSuggestionByPhaseId(param: any) {
    let phase = this.phases[this.phaseIndex(param.phaseId)];
    let data = {
      userId: this._commonService.getUserId(),
      phaseId: phase.id
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

  reArrangePhases(phases: any) {
    let phaseResult: any = [];
    // Find sub phase
    const findSubPhase = (array: any, phaseId: string) => {
      let childPhase = array.find((item: any) => item.parentId === phaseId);
      if (childPhase) {
        delete childPhase.lastChildren;
        phaseResult.push(childPhase);
        array.splice(array.findIndex((a: any) => a.id === childPhase.id) , 1);
        findSubPhase(array, childPhase.id);
      } else phaseResult[phaseResult.length-1].lastChildren = true;
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

  // Update new percentage
  updateNewPercentage(filterTargetBy?: string, pastNodedata?: any) {
    this._kartaService.getKarta(this.kartaId).subscribe(
      (response: any) => {
        this.karta = response;
        if (filterTargetBy) {
          this.percentageObj = new CalculatePercentage(this.colorSettings, this.kpiCalculationPeriod, this.kpiPercentage, filterTargetBy, pastNodedata);
        } else this.percentageObj = new CalculatePercentage(this.colorSettings, this.kpiCalculationPeriod, this.kpiPercentage);
        this.karta.node.percentage = Math.round(this.percentageObj.calculatePercentage(this.karta.node));
        this.karta.node.border_color = this.setColors(this.karta.node.percentage);
        this.D3SVG.update(this.karta.node, true);
        jqueryFunctions.enableChart();
      },
      (error: any) => {
        jqueryFunctions.enableChart();
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

  ngOnDestroy(): void {
    this._commonService.deleteNodeSession();
  }

}
