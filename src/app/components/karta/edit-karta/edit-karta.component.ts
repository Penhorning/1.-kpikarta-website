import { filter } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { KartaService } from '../service/karta.service';
import * as BuildKPIKarta from "../utils/d3.js";

declare const $: any;

@Component({
  selector: 'app-edit-karta',
  templateUrl: './edit-karta.component.html',
  styleUrls: ['./edit-karta.component.scss']
})
export class EditKartaComponent implements OnInit {

  kartaId: string = "";
  karta: any;
  currentNode: any;
  currentPhase: any;
  phaseId: string = "";
  phases: any = [];
  subPhases: any = [];
  colorSettings: any = [];
  suggestion: any;
  loadingKarta: boolean = true;
  loader: any = this._commonService.loader;
  showSVG: boolean = false;

  // D3 karta events
  D3SVG: any = {
    subPhases: (() => this.subPhases),
    phases: () => this.phases,
    events: {
      addNode: (d: any) => {
        this.addNode(d);
      },
      addNodeRight: (d: any) => {
        this.addNodeRight(d);
      },
      nodeItem: (d: any) => {
        console.log(d);
        this.updateNodeProperties(d);
      },
      removeNode: (d: any) => {
        this.removeNode(d);
      },
      linkColor: (d: any) => {
        let node_percentage = parseInt((d.target).weightage);
        if (this.colorSettings.settings) {
          let colorSetting = this.colorSettings.settings.filter((item: any) => node_percentage >= item.min && node_percentage <= item.max);
          return colorSetting[0]?.color ? colorSetting[0]?.color : 'black';
        } else return 'black';
      },
      linkWidth: (d: any) => {
        let weightage = parseInt(d.target.weightage);
        weightage = weightage <= 0 ? 10 : weightage;
        return weightage / 10;
      }
    }
  }
  /* Node properties */
  currentNodeName: string = "";
  currentNodeWeight: number = 0;
  // Typography
  selectedFont: any = "";
  selectedColor: any = "";
  selectedAlignment: any = "";
  // Kpi Type
  kpiType: string = "measure";
  showKPICalculation: boolean = false;
  target: any = [
    {
      frequency: "monthly",
      value: 0
    }
  ]
  // Contributors
  disabled = false;
  ShowFilter = false;
  limitSelection = false;
  users: any = [];
  selectedItems: any = [];
  dropdownSettings: any = {};
  contributorUsers: any = [];
  selectedContributorUsers: any = [];


  constructor(private _kartaService: KartaService, private _commonService: CommonService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Sidebar
    const that = this;
    $('#sidebarCollapse').on('click', function () {
      $('#sidebar-two').toggleClass('active');
      that.setKartaDimension();
    });
    // Hide sidebar when click outside
    $(document).on('click', function (event: any) {
      if (!$(event.target).closest('#rightSidebar').length && event.target.id !== "delete_btn") {
        $('#rightSidebar').removeClass("d-block");
      }
      that.setKartaDimension();
    });
    // Get phases
    // this.getPhases();
    // Get color settings
    this.getColorSettings();
    // Get karta id from url
    this.kartaId = this.route.snapshot.paramMap.get("id") || "";

    // Ng Multi Select Dropdown properties
    this.users = [];
    this.selectedItems = [];
    this.dropdownSettings = {
      singleSelection: false,
      idField: '_id',
      textField: 'fullName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
    };
    // Get users
    this.getAllUser();
  }

  onItemSelect(item: any) {
    this.contributorUsers.push({ userId: item._id });
    this.updateNode('contributors', this.contributorUsers);
  }

  onItemDeSelect(item: any) {
    this.contributorUsers = this.contributorUsers.filter((item: any) => item.userId !== item._id);
    this.updateNode('contributors', this.contributorUsers);
  }

  getAllUser() {
    this._kartaService.getAllUsers().subscribe((response) => {
      this.users = response.users[0].data;
    })
  }



  // Measure calculation section
  setTarget(type: string, e: any, index: any) {
    if (type === 'frequency') {
      this.target[index].type = e.target.value;
      this.updateNode('target', this.target);
    }
    else {
      this.target[index].value = parseInt(e.target.value);
      this.updateNode('target', this.target, 'yes');
    }
  }
  addMoreTarget() {
    this.target.push({
      frequency: "monthly",
      value: 0
    });
  }

  removeTarget(index: number) {
    this.target.splice(index, 1);
    this.updateNode('target', this.target);
  }

  setKartaDimension() {
    // Set karta's div width
    let width, height, karta_col_width, karta_col_height, svg_width, svg_height;
    karta_col_width = $(".karta_column").width();
    karta_col_height = $(".karta_column").height();
    svg_width = $("#karta-svg svg").width();
    svg_height = $("#karta-svg svg").height();

    width = svg_width > karta_col_width ? svg_width : karta_col_width;
    height = svg_height > karta_col_height ? svg_height : karta_col_height;

    $('#karta-svg').css("max-width", karta_col_width);
    $('#karta-svg').css("max-height", karta_col_height + 5);
    $('#karta-svg svg').attr("width", width);
    $('#karta-svg svg').attr("height", height);
  }

  // Find phase index
  phaseIndex(phaseId: string) {
    return this.phases.findIndex((item: any) => {
      return item.id === phaseId;
    });
  }

  updateNodeProperties(param: any) {
    this.currentNode = param;
    this.phaseId = param.phaseId;
    this.selectedFont = param.font_style;
    this.selectedColor = param.text_color;
    this.selectedAlignment = param.alignment;
    this.currentNodeName = param.name;
    this.currentNodeWeight = param.weightage;

    this.showKPICalculation = false;

    // Populating contributors
    param.contributors.forEach((item: any) => 
    this.selectedContributorUsers.push({"_id": item.userId})

    );

    // Show properties right sidebar
    $('#rightSidebar').addClass("d-block");
    $('body').addClass("rightSidebarOpened");
    // Get suggestion by phase id
    this.getSuggestionByPhaseId(param);
    // Show Measure and metrics when KPI's node selected
    this.currentPhase = this.phases[this.phaseIndex(param.phaseId)];
    if (this.currentPhase.name === "KPI") {
      this.showKPICalculation = true;
      if (param.target) this.target = param.target;
      else {
        this.target = [
          {
            frequency: "monthly",
            value: 0
          }
        ]
      }
      this.currentNode.due_date = new Date(this.currentNode.due_date).toISOString().substring(0, 10);
    }
  }

  // Calculate each node percentage
  calculatePercentage(params: any, percentage: number = 0): any {
    let siblingCount = 0, totalPercentage = 0;
    let dep = 6;

    params.children.forEach((element: any) => {
      if (element.hasOwnProperty('achieved_value')) {
        console.log("if", element.id)
        let currentPercentage = (element.achieved_value / element.target[0].value) * 100;
        siblingCount++;
        totalPercentage += currentPercentage;
        element.percentage = Math.round(currentPercentage);
      }
      else {
        console.log("else ", element.id)
        let tempPercentage = this.calculatePercentage(element, percentage);
        element.percentage = Math.round(tempPercentage);
        // if (params.children.length > 1) {
        //   let aggregatePercentage = 0;
        //   params.children.forEach((elementnest: any) => {
        //     aggregatePercentage += elementnest.percentage;
        //   });
        //   // params.percentage = aggregatePercentage;
        //   var  tempPercentage = this.calculatePercentage(element,aggregatePercentage);
        //   element.percentage = parseFloat(tempPercentage.toFixed(2));
        // } else {
        //   var  tempPercentage = this.calculatePercentage(element,percentage);
        // element.percentage = parseFloat(tempPercentage.toFixed(2));
        // }
      }
    });
    return totalPercentage / siblingCount;
  }

  // Set calculated percentage
  // setPercentage(params: any) {
  //   console.log("Set percentage = ", params);
  //   params.children.forEach((element: any) => {
  //     if (element.hasOwnProperty('percentage')) {
  // if (params.children.length > 1) {
  //   let aggregatePercentage = 0;
  //   params.children.forEach((element: any) => {
  //     aggregatePercentage += element.percentage;
  //   });
  //   params.percentage = aggregatePercentage;
  // } else params.percentage = element.percentage;
  //       this.setPercentage(element);
  //     }

  //    else this.setPercentage(element);
  //   });
  // }

  // Get karta details including all nodes
  getKartaInfo() {
    this._kartaService.getKarta(this.kartaId).subscribe(
      (response: any) => {
        this.karta = response;
        if (this.karta.node) {
          // this.updateKarta(this.karta.node);
          this.calculatePercentage(this.karta.node);
          // this.setPercentage(this.karta.node);
          // $('#karta-svg').empty();
          BuildKPIKarta(this.karta.node, "#karta-svg", this.D3SVG);
          this.setKartaDimension();
          this.showSVG = true;
        }
      }
    ).add(() => this.loadingKarta = false);
  }

  // Get all phases
  getPhases() {
    this._kartaService.getPhases().subscribe(
      (response: any) => {
        this.phases = response;
        this._kartaService.getSubPhases(this.kartaId).subscribe(
          (response: any) => {
            this.subPhases = response;
            this.phases.forEach((item: any, index: number) => {
              this.subPhases.forEach((sub_item: any) => {
                if (item.id === sub_item.kartaphaseId) this.phases.splice(index + 1, 0, sub_item);
              });
            });
            this.getKartaInfo();
          }
        );
      }
    );
  }

  // Get suggestion by phaseId
  getSuggestionByPhaseId(param: any) {
    let phase = this.phases[this.phaseIndex(param.phaseId)];
    let data = {
      userId: this._commonService.getUserId(),
      phaseId: phase.kartaphaseId ? phase.kartaphaseId : phase.id
    }
    this._kartaService.getSuggestion(data).subscribe(
      (response: any) => {
        this.suggestion = response;
      },
      (error: any) => { }
    );
  }

  // Get color settings
  getColorSettings() {
    this._kartaService.getColorSettingByUser({ userId: this._commonService.getUserId() }).subscribe(
      (response: any) => {
        this.colorSettings = response;
        this.getPhases();
      }
    );
  }

  // Add node
  addNode(param: any, name?: string) {
    let phase = this.phases[this.phaseIndex(param.phaseId) + 1];
    let data: any = {
      name: name ? name : "Child",
      font_style: "sans-serif",
      alignment: "center",
      text_color: "#000000",
      kartaDetailId: this.kartaId,
      phaseId: phase.id,
      parentId: param.id,
      weightage: 0
    }
    if (phase.name === "KPI") {
      data.due_date = new Date();
      data.target = [
        {
          frequency: "monthly",
          value: 0
        }
      ];
      data.achieved_value = 0;
      data.kpi_calc_period = "month-to-date";
    }
    this._kartaService.addNode(data).subscribe(
      (response: any) => {
        this.D3SVG.updateNewNode(param, response);
        this.setKartaDimension();
        // this.D3SVG.updateNode(param, response);
        // this.getKartaInfo();
      }
    );
  }

  // Add right node
  addNodeRight(param: any) {
    let currentPhaseIndex = this.phaseIndex(param.phaseId);
    const isExists = this.phases.filter((item: any): any => {
      if (item.hasOwnProperty("parentId")) return item.parentId === param.phaseId;
    });
    if (isExists.length <= 0) {
      let mainPhase: string = "";
      if (this.phases[currentPhaseIndex].hasOwnProperty("kartaphaseId")) mainPhase = this.phases[currentPhaseIndex].kartaphaseId;
      else mainPhase = this.phases[currentPhaseIndex].id;
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
        "parentId": param.phaseId,
        "kartaphaseId": mainPhase
      }
      this._kartaService.addSubPhase(data).subscribe(
        (response: any) => {
          let resopnse_data = {
            "id": response.id,
            "name": response.name,
            "parentId": param.phaseId,
            "kartaphaseId": mainPhase
          }
          this.phases.splice((currentPhaseIndex + 1), 0, resopnse_data);
          this.addNode(param);
        }
      );
    } else this.addNode(param, 'Child 2');
    this.setKartaDimension();
    this.D3SVG.buildOneKartaDivider();
  }

  // Update node
  updateNode(key: string, value: any, addTarget?: string) {
    if (key === "alignment") this.selectedAlignment = value;
    let data = { [key]: value }
    this._kartaService.updateNode(this.currentNode.id, data).subscribe(
      (response: any) => {
        this.currentNode[key] = value;
        this.D3SVG.updateNode(this.currentNode);
        if (addTarget === "yes" && !this.currentNode.children) {
          this.addNode(this.currentNode, `${value[0].value} per target`);
        }
        // if (key === "weightage") this.D3SVG.events.linkWidth(this.currentNode);
      }
    );
  }

  // Remove node from karta
  removeNode(param: any) {
    this._kartaService.removeNode(param.id).subscribe(
      (response: any) => {
        this.setKartaDimension();
        // this.D3SVG.removeOneKartaDivider();
      }
    );
  }

  // On karta lines hover
  onMouseOverKartaLines(ev: any) {
    ev.preventDefault();
    let element = document.getElementById(ev.target.id);
    if (element) element.classList.add("selectedPhase");
  }
  onMouseLeaveKartaLines(ev: any) {
    ev.preventDefault();
    let element = document.getElementById(ev.target.id);
    if (element) element.classList.remove("selectedPhase");
  }
  addRoteNode(ev: any) {
    let element = ev.target.closest('div');
    this.onDrop(element.id, 'add_root');
  }

  onDragOver(ev: any) {
    ev.preventDefault();
    let element = document.getElementById(ev.target.id);
    if (element) element.classList.add("selectedPhase");
  }
  onDragLeave(ev: any) {
    ev.preventDefault();
    let element = document.getElementById(ev.target.id);
    if (element) element.classList.remove("selectedPhase");
  }

  onDragStart(ev: any) {
    // console.log(ev)
    // ev.dataTransfer.setData("text", ev.target.id);
  }

  onDrop(ev: any, type?: string) {
    let phaseId = "";
    if (type == 'add_root') phaseId = ev;
    else {
      ev.preventDefault();
      phaseId = ev.target.id;
    }
    let data = {
      name: "Empty",
      font_style: "sans-serif",
      alignment: "center",
      text_color: "#000000",
      phaseId: phaseId.substring(9),
      kartaId: this.kartaId,
      weightage: 0
    }
    this._kartaService.addNode(data).subscribe(
      (response: any) => {
        $('#sidebar-two').addClass('active');
        this.getKartaInfo();
        this.showSVG = true;
        let data = {
          name: "Empty",
          phaseId: phaseId.substring(9)
        }
        this.setKartaDimension();
        this.updateNodeProperties(data);
      }
    );
  }

  // Save karta
  saveKarta() {
    let data = {
      name: this.karta.name
    }
    this._kartaService.updateKarta(this.karta.id, data).subscribe(
      (response: any) => {
        this.karta = response;
      }
    );
  }
}
