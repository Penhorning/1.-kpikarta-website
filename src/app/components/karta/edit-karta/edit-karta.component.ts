import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { KartaService } from '../service/karta.service';
import * as BuildKPIKarta from '../utils/d3.js';
import * as moment from 'moment';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ExportToCsv } from 'export-to-csv';

declare const $: any;

@Component({
  selector: 'app-edit-karta',
  templateUrl: './edit-karta.component.html',
  styleUrls: ['./edit-karta.component.scss'],
})
export class EditKartaComponent implements OnInit {
  kartaId: string = '';
  karta: any;
  currentNode: any;
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
        let node_percentage = parseInt(d.target.weightage);
        if (this.colorSettings.settings) {
          let colorSetting = this.colorSettings.settings.filter(
            (item: any) =>
              node_percentage >= item.min && node_percentage <= item.max
          );
          return colorSetting[0]?.color ? colorSetting[0]?.color : 'black';
        } else return 'black';
      },
      linkWidth: (d: any) => {
        let weightage = parseInt(d.target.weightage);
        weightage = weightage <= 0 ? 10 : weightage;
        return weightage / 10;
      },
    },
  };
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

  data = [
    {
      name: 'Test 1',
      age: 13,
      average: 8.2,
      approved: true,
      description: "using 'Content here, content here' "
    },
    {
      name: 'Test 2',
      age: 11,
      average: 8.2,
      approved: true,
      description: "using 'Content here, content here' "
    },
    {
      name: 'Test 4',
      age: 10,
      average: 8.2,
      approved: true,
      description: "using 'Content here, content here' "
    },
  ];

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
      fields: this.fb.array([]),
      formula: ['', Validators.required],
    });

    // Toggle Left Sidebar
    $('#sidebarCollapse').on('click', function () {
      that.togggleLeftSidebar();
    });
    // Close right sidebar when click outside
    $(document).on('click', '.right_sidebar_overlay', function (event: any) {
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
  //Adding a New FormulaField Group
  addFormulaGroup() {
    const fieldForm = this.fb.group({
      fieldName: [`Field${this.fields.length + 1}`],
      fieldValue: [0],
    });
    this.fields.push(fieldForm);
  }

  //Deleting a particular FormulaField Group
  deleteFormulaGroup(fieldIndex: number) {
    this.fields.removeAt(fieldIndex);
    let newArr = [];
    for (let i = 0; i < this.fields.length; i++) {
      newArr.push({
        ...this.formulaGroup.controls['fields']['controls'][i],
        fieldName: this.currentNode.node_type ? this.currentNode.node_type.fields[i].fieldName : `Field${i + 1}`,
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
    this.timer = setTimeout(() => {
      let tempObj: any = {};
      let mathOperators: any = ['+', '-', '/', '*', '%', '(', ')'];
      let value = event.target.value.trim().split(' ');

      let total: any = 0;
      let checkFrag = false;
      this.fields.controls.forEach((x: any) => {
        tempObj[x['controls']['fieldName'].value] =
          x['controls']['fieldValue'].value;
      });

      let newValue = value
        .map((y: any) => {
          if (tempObj[y]) {
            return tempObj[y];
          } else if (mathOperators.includes(y)) {
            return ' ' + y + ' ';
          } else {
            checkFrag = true;
            return y;
          }
        })
        .join(' ');

      if (checkFrag) {
        this._commonService.errorToaster('Please type correct formula');
        this.formulaGroup.patchValue({
          calculatedValue: 0,
        });
        return;
      } else {
        total = eval(newValue);
        this.formulaGroup.patchValue({
          calculatedValue: total
        });

        let request = {
          ...this.formulaGroup.value,
          metrics: true,
        };
        delete request['calculatedValue'];
        request['calculated_value'] = this.formulaGroup.value.calculatedValue;
        this._kartaService
          .updateNode(this.currentNode.id, { node_type: request })
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
    }, 2000);
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
    } else {
      let percentage = (this.currentNode.achieved_value / e.target.value) * 100;
      this.target[index].percentage = Math.round(percentage);
      this.target[index].value = parseInt(e.target.value);
      this.updateNode('target', this.target, 'yes');
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
        arr.push(new FormGroup({
          fieldName: new FormControl(i.fieldName),
          fieldValue: new FormControl(i.fieldValue)
        }));
      }
      this.formulaGroup.patchValue({
        calculatedValue: param.node_type.calculated_value,
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

  // Change weightage
  changeWeightage() {
    if (this.currentNodeWeight > 100)
      this._commonService.errorToaster('Weightage cannot be greator than 100!');
    else {
      let sum = this.currentNode.parent.children
        .filter((item: any) => item.id !== this.currentNode.id)
        .reduce(
          (total: any, currentValue: any) => total + currentValue.weightage,
          0
        );
      if (sum + this.currentNodeWeight > 100) {
        this._commonService.errorToaster(
          'Your aggregate weightage of all the nodes cannot be greator than 100!'
        );
      } else this.updateNode('weightage', this.currentNodeWeight);
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
    this.target.forEach((element: any) => {
      let percentage = (e.target.value / element.value) * 100;
      return (element.percentage = Math.round(percentage));
    });
    let data = {
      achieved_value: e.target.value,
      target: this.target,
    };
    this.updateNode('achieved_value', data);
  }

  // Calculate each node percentage
  calculatePercentage(params: any, percentage: number = 0) {
    let total_percentage: number[] = [];

    if (!params.hasOwnProperty('children')) params.children = [];
    params?.children?.forEach((element: any) => {
      if (element.hasOwnProperty('achieved_value')) {
        let targetValue = 0;
        if (this.kpiCalculationPeriod === 'month-to-date') {
          const totalDays = moment().daysInMonth();
          const todayDay = moment().date();
          targetValue = element.target.find(
            (item: any) => item.frequency === 'monthly'
          ).value;
          targetValue = todayDay * (targetValue / totalDays);
        } else if (this.kpiCalculationPeriod === 'year-to-date') {
          const currentYear = moment().year();
          const totalDays = moment([currentYear]).isLeapYear() ? 366 : 365;
          const todayDay = moment().date();
          targetValue = element.target.find(
            (item: any) => item.frequency === 'annually'
          ).value;
          targetValue = todayDay * (targetValue / totalDays);
        }

        let current_percentage = (element.achieved_value / targetValue) * 100;
        element.percentage = Math.round(current_percentage);
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
    if (!this.currentNode.node_type) {
      // Creating 2 Formula Fields by Default
      for (let i = 0; i < 2; i++) {
        this.addFormulaGroup();
      }
    }
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
  addNode(param: any, name?: string) {
    let phase = this.phases[this.phaseIndex(param.phaseId) + 1];
    let data: any = {
      name: name ? name : 'Child',
      font_style: 'sans-serif',
      alignment: 'center',
      text_color: '#000000',
      kartaDetailId: this.kartaId,
      phaseId: phase.id,
      parentId: param.id,
      weightage: 0,
    };
    if (phase.name === 'KPI') {
      data.due_date = new Date();
      data.target = [{ frequency: 'monthly', value: 0, percentage: 0 }];
      data.achieved_value = 0;
      data.kpi_calc_period = 'month-to-date';
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

  // Update node
  updateNode(key: string, value: any, addTarget?: any) {
    let data;
    if (key === 'achieved_value' || key === 'updateDraggedNode') data = value;
    else data = { [key]: value };
    this._kartaService
      .updateNode(this.currentNode.id, data)
      .subscribe((response: any) => {
        this.currentNode[key] =
          key === 'achieved_value' ? value.achieved_value : value;
        this.D3SVG.updateNode(this.currentNode);
        if (addTarget === 'yes' && !this.currentNode.children) {
          this.addNode(this.currentNode, `${value[0].value} per target`);
        }
        // if (key === "weightage") this.D3SVG.events.linkWidth(this.currentNode);
      });
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
    this._kartaService
      .updateKarta(this.karta.id, data)
      .subscribe((response: any) => {
        this.karta = response;
      });
  }

  // downloadCsv
  downloadCsv(){
    const options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true, 
      showTitle: true,
      title: 'Charge Report',
      useTextFile: false,
      useBom: true,
      headers: ['Name', 'Age', 'Average', 'Approved','Description']
  };
   const csvExporter = new ExportToCsv(options);
    csvExporter.generateCsv(this.data);
  }
}
