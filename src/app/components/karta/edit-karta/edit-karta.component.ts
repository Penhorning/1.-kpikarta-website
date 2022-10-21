import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ExportToCsv } from 'export-to-csv';
import { CommonService } from '@app/shared/_services/common.service';
import { KartaService } from '../service/karta.service';
import * as BuildKPIKarta from '../utils/d3.js';
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
  currentPhase: any;
  phaseId: string = '';
  phases: any = [];
  // subPhases: any = [];
  colorSettings: any = [];
  suggestion: any;
  loadingKarta: boolean = true;
  loader: any = this._commonService.loader;
  showSVG: boolean = false;
  isRtNodDrgFrmSide: boolean = false;
  formulaGroup: FormGroup | any = [];

  // D3 karta events
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
        let data = {
          parentId: d.parent.id,
          phaseId: d.phaseId,
        };
        this.updateNode('updateDraggedNode', data);
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
  // Typography
  selectedFont: any = '';
  selectedColor: any = '';
  selectedAlignment: any = '';
  // Kpi Type
  kpiType: string = 'measure';
  showKPICalculation: boolean = false;
  kpiCalculationPeriod = 'month-to-date';
  target: any = [{ frequency: 'weekly', value: 0, percentage: 0 }];
  // Contributors
  disabled = false;
  ShowFilter = false;
  limitSelection = false;
  users: any = [];
  selectedUsers: any;
  dropdownSettings: any = {};
  contributorUsers: any = [];
  selectedContributorUsers: any = [];
  formulagroupDefaultValues: any = {};
  timer: any = null;
  formulaFieldSuggestions: any = [];

  // Share karta
  sharedKartaStr: any = [];
  kartas: any = [];
  // users: any = [];
  sharingKarta: any;
  sharedSubmitFlag: boolean = false;
  sharedKartas: any = [];

  selectedSharedUsers: any = [];
  sharingKartaCount: any = 0;
  loading: boolean = false;
  emails: any = [];

  constructor(
    private _kartaService: KartaService,
    private _commonService: CommonService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    const that = this;
    // Formula Fields
    this.formulaGroup = this.fb.group({
      calculatedValue: [0],
      fields: this.fb.array(this.addFormulaGroupByDefault()),
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
    // Get color settings
    this.getColorSettings();
    // Get karta id from url
    this.kartaId = this.route.snapshot.paramMap.get('id') || '';
    // Get users
    this.getAllUser();
  }

  // ---------FormArray Functions defined Below----------
  //Adding 2 default FormulaField Group
  addFormulaGroupByDefault(): any[] {
    let newArr = [];
    if(!this.currentNode.node_type){
      for(let i = 0; i < 2; i++){
        newArr.push(this.fb.group({
          fieldName: [`Field${i + 1}`],
          fieldValue: [0],
        }))
      }
    }
    return newArr;
  }

  //Adding a New FormulaField Group
  addFormulaGroup() {
    let fieldForm = this.fb.group({
      fieldName: [`Field${this.fields.length + 1}`],
      fieldValue: [0],
    })
    this.fields.push(fieldForm);
  }

  //Deleting a particular FormulaField Group
  deleteFormulaGroup(fieldIndex: number) {
    this.fields.removeAt(fieldIndex);
    let newArr = [];
    for (let i = 0; i < this.fields.length; i++) {
      newArr.push({
        ...this.formulaGroup.controls['fields']['controls'][i],
        fieldName: this.currentNode.node_type
          ? this.currentNode.node_type.fields[i].fieldName
          : `Field${i + 1}`,
      });
    }
    this.formulaGroup.patchValue({
      fields: newArr,
    });
  }

  // Enable/Disable Readonly value of Formula Fields
  editFieldStatus(id: number, value: boolean) {
    $('#fd' + id).attr('contenteditable', value);
    return;
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
    this.formulagroupDefaultValues[id] = event.target.innerText;
  }

  // Set Temporary Field Value to FormArray
  setFieldValues(id: number) {
    this.formulaGroup.controls['fields']['controls'][id].patchValue({
      fieldName: this.formulagroupDefaultValues[id],
    });
    delete this.formulagroupDefaultValues[id];
    this.editFieldStatus(id, false);
  }

  // Remove Temporary Field Value
  removeFieldValues(id: number) {
    let value =
      this.formulaGroup.controls['fields'].controls[id].controls['fieldName']
        .value;
    let element: any = document.getElementById('fd' + id);
    element.innerText = value;
    element.innerHTML = value;
    delete this.formulagroupDefaultValues[id];
    this.editFieldStatus(id, false);
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
        let value = event.target.value.trim().split(/[,.+\-\/% *)(\/\\s]/);

        let total: any = 0;
        let checkFrag = false;

        this.fields.controls.forEach((x: any) => {
          tempObj[x['controls']['fieldName'].value] =
            x['controls']['fieldValue'].value;
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

        if (this.formulaGroup.valid) {
          if (checkFrag) {
            this._commonService.errorToaster('Please type correct formula');
            this.formulaGroup.patchValue({
              calculatedValue: 0,
            });
            return;
          } else {
            total = eval(newValue);
            this.formulaGroup.patchValue({
              calculatedValue: total,
            });

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
            
            this._kartaService
              .updateNode(this.currentNode.id, { node_type: request, achieved_value: total, target: newTarget })
              .subscribe(
                (x) => {
                  if (x) {
                    this.updateNodeProperties(x);
                    this._commonService.successToaster(
                      'Node updated succesfully..!!'
                    );
                  }
                },
                (err) => {
                  console.log(err);
                  this._commonService.errorToaster('Something went wrong..!!');
                }
              );
            return;
          }
        } else {
          this.formulaGroup.markAllAsTouched();
        }
      }, 2000);
  }

  //Show Dropdown suggestions for Formula Fields
  filterFieldSuggestions(event: any) {
    let value = event.target.value.trim();
    let mathOperators = ['+', '-', '/', '*', '(', ')', '%'];
    let findLastIndex = null;
    
    for (let i = value.length - 1; i >= 0; i--) {
      if (mathOperators.includes(value[i])) {
        findLastIndex = value.lastIndexOf(value[i]);
        break;
      }
    }

    console.log(findLastIndex, 'check');

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
  openRightSidebar() {
    $('#rightSidebar, .right_sidebar_overlay').addClass('open');
    $('#rightSidebar').scrollTop(0);
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
    karta_col_height = $('.karta_column').height();
    svg_width = $('#karta-svg svg').width();
    svg_height = $('#karta-svg svg').height();

    width = svg_width > karta_col_width ? svg_width : karta_col_width;
    height = svg_height > karta_col_height ? svg_height : karta_col_height;

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
    this._kartaService.getAllUsers().subscribe((response: any) => {
      this.users = response.users[0].data;
    });
  }

  // Measure calculation section
  setTarget(type: string, e: any, index: any) {
    if (type === 'frequency') {
      this.target[index].frequency = e.target.value;
      this.updateNode('target', this.target);
    }
    else {
      let percentage= (this.currentNode.achieved_value/e.target.value) * 100;
      this.target[index].percentage = Math.round(percentage);
      this.target[index].value = parseInt(e.target.value);
      this.updateNode('target', this.target);
      
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
    this.updateNode('target', this.target);
  }

  // Find phase index
  phaseIndex(phaseId: string) {
    return this.phases.findIndex((item: any) => {
      return item.id === phaseId;
    });
  }
  // Update node properties
  updateNodeProperties(param: any) {
    this.currentNode = param;
    this.phaseId = param.phaseId;
    this.selectedFont = param.font_style;
    this.selectedColor = param.text_color;
    this.selectedAlignment = param.alignment;
    this.currentNodeName = param.name;
    this.currentNodeWeight = param.weightage;
    if (param.node_type) {
      const arr = this.formulaGroup.get('fields') as FormArray;
      arr.clear();
      for (let i of param.node_type.fields) {
        arr.push(
          new FormGroup({
            fieldName: new FormControl(i.fieldName),
            fieldValue: new FormControl(i.fieldValue),
          })
        );
      }
      this.formulaGroup.patchValue({
        calculatedValue: param.achieved_value,
        formula: param.node_type.formula,
      });
    }

    this.showKPICalculation = false;

    // Show properties right sidebar
    this.openRightSidebar();
    // Get suggestion by phase id
    this.getSuggestionByPhaseId(param);
    // Show Measure and metrics when KPI's node selected
    this.currentPhase = this.phases[this.phaseIndex(param.phaseId)];
    if (this.currentPhase.name === 'KPI') {
      this.showKPICalculation = true;
      if (param.target) this.target = param.target;
      else {
        this.target = [{ frequency: 'monthly', value: 0, percentage: 0 }];
      }
      if (this.currentNode.due_date)
        this.currentNode.due_date = new Date(this.currentNode.due_date)
          .toISOString()
          .substring(0, 10);
    }
  }

  // Change node name
  changeNodeName() {
    if (this.currentNodeName !== "") {
      this.updateNode('name', this.currentNodeName);
    }
  }
  // Change weightage
  changeWeightage() {
    if (this.currentNodeWeight < 0) this._commonService.errorToaster("Please enter any positive value less than or equal to 100!");
    else if (this.currentNodeWeight > 100) this._commonService.errorToaster("Weightage cannot be greator than 100!");
    else {
      let sum = this.currentNode.parent.children
        .filter((item: any) => item.id !== this.currentNode.id)
        .reduce(
          (total: any, currentValue: any) => total + currentValue.weightage,
          0
        );
      if (sum + this.currentNodeWeight > 100) {
        this._commonService.errorToaster("Your aggregate weightage of all the nodes cannot be greator than 100!");
      } else this.updateNode('weightage', this.currentNodeWeight, "yes");
    }
  }
  // Change alignment
  changeAlignment(value: string) {
    this.selectedAlignment = value;
    this.updateNode('alignment', value);
  }
  // Change kpi calculation periods
  changeKPIPeriods(el: any) {
    this.karta.node.percentage = Math.round(
      this.calculatePercentage(this.karta.node)
    );
    this.updateNode('kpi_calc_period', el.target.value);
  }
  // Change achieved value
  changeAchievedValue(e: any) {
    // Calculate new percentage
    this.target.forEach((element: any) => {
      let percentage = (e.target.value / element.value) * 100;
      return (element.percentage = Math.round(percentage));
    });
    // Submit updated achieved value
    let data = {
      achieved_value: e.target.value,
      target: this.target,
    };
    this.updateNode('achieved_value', data);
  }

  // Calculate each node percentage
  calculatePercentage(params: any, percentage: number = 0) {
    let total_percentage: number[] = [];
    // Set blank array for children, if not available
    if (!params.hasOwnProperty("children")) params.children = [];
    params?.children?.forEach((element: any) => {
      // Check if current element is a kpi node or not
      if (element.hasOwnProperty("achieved_value")) {
        let targetValue = 0;
        // Set target value according to month to date
        if (this.kpiCalculationPeriod === "month-to-date") {
          const totalDays = moment().daysInMonth();
          const todayDay = moment().date();
          targetValue = element.target.find(
            (item: any) => item.frequency === 'monthly'
          ).value;
          targetValue = todayDay * (targetValue / totalDays);
        }
        // Set target value according to year to date
        else if (this.kpiCalculationPeriod === "year-to-date") {
          const currentYear = moment().year();
          const totalDays = moment([currentYear]).isLeapYear() ? 366 : 365;
          const todayDay = moment().date();
          targetValue = element.target.find(
            (item: any) => item.frequency === 'annually'
          ).value;
          targetValue = todayDay * (targetValue / totalDays);
        }
        let current_percentage= (element.achieved_value/targetValue) * 100;
        element.percentage = Math.round(current_percentage);
        // Set percentage for target nodes, if exists
        if (element.hasOwnProperty("children") && element.children.length > 0) {
          element.children[0].percentage = Math.round(current_percentage);
        }
      } else {
        let returnedPercentage = this.calculatePercentage(element, percentage);
        element.percentage = Math.round(returnedPercentage);
      }
      total_percentage.push((element.percentage * element.weightage) / 100);
    });
    let aggregate_percentage = total_percentage.reduce(
      (acc: number, num: number) => acc + num,
      0
    );
    return aggregate_percentage;
  }

  // Get karta details including all nodes
  getKartaInfo() {
    this._kartaService
      .getKarta(this.kartaId)
      .subscribe((response: any) => {
        this.karta = response;
        this.sharedKartaStr = response;
        console.log("res", response)
        if (this.karta.node) {
          this.karta.node.percentage = Math.round(
            this.calculatePercentage(this.karta.node)
          );
          BuildKPIKarta(this.karta.node, '#karta-svg', this.D3SVG);
          this.setKartaDimension();
          this.showSVG = true;
        }
      })
      .add(() => (this.loadingKarta = false));
  }

  // Get all phases
  getPhases() {
    this._kartaService.getPhases().subscribe((response: any) => {
      this.phases = response;
      this.getKartaInfo();
      // this._kartaService.getSubPhases(this.kartaId).subscribe(
      //   (response: any) => {
      //     this.subPhases = response;
      //     this.phases.forEach((item: any, index: number) => {
      //       this.subPhases.forEach((sub_item: any) => {
      //         if (item.id === sub_item.kartaPhaseId) this.phases.splice(index+1, 0, sub_item);
      //       });
      //     });
      //     this.getKartaInfo();
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

  // Get color settings
  getColorSettings() {
    this._kartaService
      .getColorSettingByUser({ userId: this._commonService.getUserId() })
      .subscribe((response: any) => {
        this.colorSettings = response;
        this.getPhases();
      });
  }

  // Add node
  addNode(param: any, name: string = "Child", weightage: number = 0) {
    let phase = this.phases[this.phaseIndex(param.phaseId) + 1];
    let data: any = {
      name: name,
      font_style: "sans-serif",
      alignment: "center",
      text_color: "#000000",
      kartaDetailId: this.kartaId,
      phaseId: phase.id,
      parentId: param.id,
      weightage: weightage
    }
    if (phase.name === "KPI") {
      data.due_date = new Date();
      data.target = [{ frequency: 'monthly', value: 0, percentage: 0 }];
      data.achieved_value = 0;
      data.kpi_calc_period = 'month-to-date';
      if (!this.currentNode.node_type) {
        // Creating 2 Formula Fields by Default
        for (let i = 0; i < 2; i++) {
          this.addFormulaGroup();
        }
      }
    }
    this._kartaService.addNode(data).subscribe((response: any) => {
      this.D3SVG.updateNewNode(param, response);
      this.setKartaDimension();
      this.updateNodeProperties(response);
      // this.D3SVG.updateNode(param, response);
      // this.getKartaInfo();
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
        this.D3SVG.updateNode(this.karta.node);
      }
    );
  }

  // Update node
  updateNode(key: string, value: any, addTarget: string = "") {
    let data;
    if (key === 'achieved_value' || key === 'updateDraggedNode') data = value;
    else data = { [key]: value };
    this._kartaService
      .updateNode(this.currentNode.id, data)
      .subscribe((response: any) => {
        this.currentNode[key] =
          key === 'achieved_value' ? value.achieved_value : value;
        this.D3SVG.updateNode(this.currentNode);
        if (addTarget === "yes" && !this.currentNode.children && this.currentNode.hasOwnProperty("achieved_value")) {
          this.addNode(this.currentNode, "Target", 100);
        }
        if (key === "achieved_value" || key === "target" || key === "weightage") {
          this.updateNewPercentage();
        }
      }
    );
  }

  // Remove node from karta
  removeNode(param: any) {
    this._kartaService.removeNode(param.id).subscribe((response: any) => {
      this.setKartaDimension();
      // this.D3SVG.removeOneKartaDivider();
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
    this.isRtNodDrgFrmSide = false;
    let element = document.getElementById(ev.target.id);
    if (element) element.classList.remove('selectedPhase');
  }

  onDragStart(ev: any) {
    this.isRtNodDrgFrmSide = true;
  }

  onDrop(ev: any, type?: string) {
    let phaseId = '';
    if (type == 'add_root') phaseId = ev;
    else {
      ev.preventDefault();
      phaseId = ev.target.id;
    }
    let data = {
      name: 'Empty',
      font_style: 'sans-serif',
      alignment: 'center',
      text_color: '#000000',
      phaseId: phaseId.substring(9),
      kartaId: this.kartaId,
      weightage: 100,
    };
    this._kartaService.addNode(data).subscribe((response: any) => {
      this.getKartaInfo();
      this.showSVG = true;
      this.isRtNodDrgFrmSide = false;
      this.updateNodeProperties(response);
    });
  }

  // Save karta
  saveKarta() {
    let data = {
      name: this.karta.name,
    };
    this._kartaService.updateKarta(this.karta.id, data).subscribe(
      (response: any) => {
        this.karta = response;
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
    if(data.hasOwnProperty("children") && data.children.length > 0) {
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
      headers: 
        [ 'Node Name', 'Weightage', 'Font Style', 'Alignment','Text Color', 'Karta Name',
         'CreatedAt', 'Phase Id', 'Phase Name', 'Percentage' ]
    };
    const csvExporter = new ExportToCsv(options);
    csvExporter.generateCsv(this.csvKartaData);
  }

    // Get all kartas
    getKartas() {
      let data = {
        page: 1,
        limit: 3,
        userId: this._commonService.getUserId(),
      };
      this._kartaService.getKartas(data).subscribe((response: any) => {
        if (response) {
          this.kartas = response.kartas[0].data;
        } else this.kartas = [];
      });
    }

  onShare(param: any) {
    console.log("param", param);
    delete param.node
    this.selectedSharedUsers = [];
    this.emails = [];
    this.sharingKarta = param;
    if (param.sharedTo) this.sharingKartaCount = param.sharedTo.length;
    else this.sharingKartaCount = 0;
  }

    // Add new email and share
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

    // Submit shared data
    shareKarta() {
      this.selectedSharedUsers.forEach((element: any) => {
        if (element.email == this._commonService.getEmailId()) {
          alert("You can not share karta to your self.");
          if (element.email !== this._commonService.getEmailId()) { }
        } else {
          this.emails.push(element.email);
        }
      });
      if (this.emails.length > 0) {
        let data = {
          karta: this.sharingKarta,
          emails: this.emails
        }
        console.log("data log", data);
        
        this.sharedSubmitFlag = true;
        this._kartaService.sharedEmails(data).subscribe(
          (response: any) => {
            this._commonService.successToaster("Your have shared karta successfully");
            $('#shareLinkModal').modal('hide');
            // this.getKartas();
            // this.getSharedKarta();
            this.getKartaInfo();
          },
          (error: any) => { console.log(error) }
        ).add(() => this.sharedSubmitFlag = false);
      }
    }

}


