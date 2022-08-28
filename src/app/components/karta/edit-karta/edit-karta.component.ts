import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KartaService } from '../service/karta.service';
import  * as BuildKPIKarta from "../utils/d3.js";

declare const $: any;

@Component({
  selector: 'app-edit-karta',
  templateUrl: './edit-karta.component.html',
  styleUrls: ['./edit-karta.component.scss']
})
export class EditKartaComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();
  kartaId: string = "";
  karta: any;
  currentNode: any;
  phaseId: string = "";
  phases: any = [];
  colorSettings: any = [];
  suggestion: any;
  loadingKarta: boolean = true;
  loader: any = this._commonService.loader;
  showSVG: boolean = false;

  // D3 karta events
  D3SVG: any = {
    events: {
      addNode: (d: any) => {
        this.addNode(d);
      },
      nodeItem: (d: any) => {
        console.log(d);
        this.updateNodeProperties(d);
      },
      removeNode: (d: any) => {
        this.removeNode(d);
      },
      linkColor:(d: any) => {
        let node_percentage = parseInt((d.target).weightage);
        if (this.colorSettings.settings) {
          let colorSetting = this.colorSettings.settings.filter((item: any) => node_percentage >= item.min && node_percentage <= item.max);
          return colorSetting[0]?.color ? colorSetting[0]?.color : 'black';
        } else return 'black';
      },
      linkWidth:(d: any) => {
        let weightage: any = (d.target).weightage <=0 ? 10 : (d.target).weightage;
        let node_percentage = parseInt(weightage);
        return node_percentage/10;
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
  
  constructor(private _kartaService: KartaService, private _commonService: CommonService, private route: ActivatedRoute) { }

  ngOnInit (): void {
    // Sidebar
    const that = this;
    $('#sidebarCollapse').on('click', function () {
      $('#sidebar-two').toggleClass('active');
      that.setKartaDimension();
    });
    // Get phases
    this.getPhases();
    // Get color settings
    this.getColorSettings();
    // Get karta id from url
    this.kartaId = this.route.snapshot.paramMap.get("id") || "";
    // Get karta info
    this.getKartaInfo();
    
    // this.setKartaDimension();
    // window.onresize = function(event: any) {
    //   console.log("resize = ", $(".karta_column").width())
    // };
  }

  // Measure calculation section
  setTarget(type: string, e: any, index: any) {
    if (type === 'frequency') this.target[index].type = e.target.value;
    else this.target[index].value = parseInt(e.target.value);
    this.updateNode('target', this.target);
  }
  addMoreTarget() {
    this.target.push({
      type: "weekly",
      value: 0
    });
  }

  setKartaDimension() {
    // Set karta's div width
    let width = $(".karta_column").width();
    $('#karta-svg').css("max-width", width);
    // $('#karta-svg svg').attr("width", width);
  }

  updateNodeProperties(param: any) {
    this.phaseId = param.phaseId;
    this.currentNode = param;
    this.currentNodeName = param.name;
    this.selectedFont = param.font_style;
    this.selectedColor = param.text_color;
    this.selectedAlignment = param.alignment;
    this.currentNodeWeight = param.weightage;
    
    // Show properties right sidebar
    $('#rightSidebar').addClass("d-block");
    // Get current node details
    this.getNodeDetails(param);
    // Show Measure and metrics when KPI's node selected
    let phaseIndex = this.phases.findIndex((item: any) => {
      return item.id === this.phaseId;
    });
    if (this.phases[phaseIndex].name === "KPI") {
      this.showKPICalculation = true;
      this.target = param.target;
      this.currentNode.due_date = new Date(this.currentNode.due_date).toISOString().substring(0, 10);
    }
  }

  // // Update karta nodes
  // updateKarta(data: any) {
  //   BuildKPIKarta(data, "#karta-svg", this.D3SVG);
  // }

  // Calculate each node percentage
  calculatePercentage(params: any) {
    console.log("Recursive param = ", params);
    if (params.children) {
      params.children.forEach((element: any) => {
        this.calculatePercentage(element);   
      });
    }
  }

  // Get karta details including all nodes
  getKartaInfo() {
    this._kartaService.getKarta(this.kartaId).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.karta = response;
        if (this.karta.node) {
          // this.updateKarta(this.karta.node);
          // this.calculatePercentage(this.karta.node);
          BuildKPIKarta(this.karta.node, "#karta-svg", this.D3SVG);
          this.setKartaDimension();
          this.showSVG = true;
        }
      },
      (error: any) => { }
    ).add(() => this.loadingKarta = false);
  }

  // Get all phases
  getPhases() {
    this._kartaService.getPhases().pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.phases = response;
        // this.phaseId = this.phases[0].id;
        this.getSuggestion(this.phases[0].id);
        // this.setKartaDimension();
      },
      (error: any) => { }
    );
  }

  // Get suggestion by phaseId
  getSuggestion(id: string) {
    let data = {
      userId: this._commonService.getUserId(),
      phaseId: id
    }
    this._kartaService.getSuggestion(data).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.suggestion = response;
      },
      (error: any) => { }
    );
  }

  // Get color settings
  getColorSettings() {
    this._kartaService.getColorSettingByUser({ userId: this._commonService.getUserId() }).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.colorSettings = response;
      }
    );
  }

  getNodeDetails(node: any) {
    this.getSuggestion(node.phaseId);
  }

  // Add node in karta
  addNode(param: any) {
    let phase = this.phases[param.depth + 1];
    let data: any = {
      name: "Child",
      font_style: "sans-serif",
      alignment: "center",
      text_color: "#000000",
      phaseId: phase.id,
      parentId: param.id,
      weightage: 0
    }
    if (phase.name === "KPI") {
      data.due_date = new Date();
      data.target = this.target;
      data.achieved_value = 0;
      data.kpi_calc_period = "month-to-date";
    }
    this._kartaService.addNode(data).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.D3SVG.updateNode(response);
        //this.getKartaInfo();
      },
      (error: any) => { }
    );
  }

  // Update node
  updateNode(key: string, value: any) {
    if (key === "alignment") this.selectedAlignment = value;
    let data = { [key]: value }
    this._kartaService.updateNode(this.currentNode.id, data).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.currentNode[key] = value;
        this.D3SVG.updateNode(this.currentNode);
      },
      (error: any) => { }
    );
  }

  // Remove node from karta
  removeNode(param: any) {
    this._kartaService.removeNode(param.id).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => { },
      (error: any) => { }
    );
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

  onDrop(ev: any) {
    ev.preventDefault();
    // var data = ev.dataTransfer.getData("text");
    let element = document.getElementById(ev.target.id);
    if (element) element.classList.remove("selectedPhase");
    // ev.target.appendChild(document.getElementById(data));
    let data = {
      name: "Empty",
      font_style: "sans-serif",
      alignment: "center",
      text_color: "#000000",
      phaseId: ev.target.id,
      kartaId: this.kartaId,
      weightage: 0
    }
    this._kartaService.addNode(data).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        $('#sidebar-two').addClass('active');
        this.getKartaInfo();
        this.showSVG = true;
        let data = {
          name: "Empty",
          phaseId: ev.target.id,
        }
        this.setKartaDimension();
        this.updateNodeProperties(data);
      },
      (error: any) => { }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
