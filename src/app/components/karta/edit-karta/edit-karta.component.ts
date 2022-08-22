import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
  isMatrics: boolean = false;

  // D3 karta events
  D3SVG: any = {
    events: {
      addNode: (d: any) => {
        this.addNode(d);
      },
      nodeItem: (d: any) => {
        this.updateNodeProperties(d);
          console.log(d);
      },
      removeNode: (d: any) => {
        this.removeNode(d);
      },
      linkColor:(d: any) => {
        let node_percentage = parseInt((d.target).target_value);
        if (this.colorSettings.settings) {
          let colorSetting = this.colorSettings.settings.filter((item: any) => node_percentage >= item.min && node_percentage <= item.max);
          return colorSetting[0]?.color ? colorSetting[0]?.color : 'black';
        } else return 'black';
      },
      linkWidth:(d: any) => {
        let node_percentage = parseInt((d.target).target_value);
        return node_percentage/10;
      }
    }
  }
  // Node properties
  currentNodeName: string = "";
  currentNodeWeight: string = "";
  selectedFont: any = "";
  selectedColor: any = "";
  selectedAlignment: any = "";
  left: string = "non_active_align";
  center: string = "non_active_align";
  right: string = "non_active_align";


  constructor(private _kartaService: KartaService, private _commonService: CommonService, private route: ActivatedRoute) { }

  ngOnInit (): void {
    // Sidebar
    $('#sidebarCollapse').on('click', function () {
      $('#sidebar-two').toggleClass('active');
    });
    // Get phases
    this.getPhases();
    // Get color settings
    this.getColorSettings();
    // Get karta id from url
    this.kartaId = this.route.snapshot.paramMap.get("id") || "";
    // Get karta info
    this.getKartaInfo();
    // Owl carousel
    $('.owl-carousel').owlCarousel({
      loop: true,
      margin: 10,
      responsiveClass: true,
      responsive: {
        0: {
          items: 1,
          nav: true
        },
        600: {
          items: 3,
          nav: false
        },
        1000: {
          items: 2,
          nav: true,
          loop: false,
          margin: 20
        }
      }
    });
  }

  setKartaWidthAndHeight () {
    // Set karta's div width
    const maxWidth = $(".karta_column").width();
    const height = $(".karta_column").height();
    // const maxHeight = $(".karta_column").height();
    console.log(maxWidth, " === ", height)
    // $('#karta-svg').css("max-width", maxWidth);
    // $('#karta-svg svg').attr("width", maxWidth);
    // $('#karta-svg svg').attr("height", height);
  }

  updateNodeProperties(param: any) {
    this.phaseId = param.phaseId;
    this.currentNode = param;
    this.currentNodeName = param.name;
    this.selectedFont = param.font_style;
    this.selectedColor = param.text_color;
    this.selectedAlignment = param.alignment;
    this.currentNodeWeight = param.weightage;
    // Show properties div
    $('#rightSidebar').addClass("d-block");
    // Get current node details
    this.getNodeDetails(param);
    // Show Measure and metrics when KPI's node selected
    let phaseIndex = this.phases.findIndex((item: any) => {
      return item.id === this.phaseId;
    });
    
    if (this.phases[phaseIndex].name === "KPI") {
      this.isMatrics = true;
    }
  }

  // // Update karta nodes
  // updateKarta(data: any) {
  //   BuildKPIKarta(data, "#karta-svg", this.D3SVG);
  // }

  // // Update karta nodes
  // updateKarta(data: any) {
  //   BuildKPIKarta(data, "#karta-svg", this.D3SVG);
  // }

  // Get karta details including all nodes
  getKartaInfo() {
    this._kartaService.getKarta(this.kartaId).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.karta = response;
        if (this.karta.node) {
          // this.updateKarta(this.karta.node);
          BuildKPIKarta(this.karta.node, "#karta-svg", this.D3SVG);
          this.setKartaWidthAndHeight();
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
        // this.setKartaWidthAndHeight();
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
    let data = {
      name: "Child",
      font_style: "sans-serif",
      alignment: "center",
      text_color: "#000000",
      phaseId: this.phases[param.depth + 1].id,
      parentId: param.id
    }
    this._kartaService.addNode(data).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
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
      phaseId: ev.target.id,
      kartaId: this.kartaId
    }
    this._kartaService.addNode(data).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.getKartaInfo();
        this.showSVG = true;
        let data = {
          name: "Empty",
          phaseId: ev.target.id,
        }
        $('#sidebar-two').addClass('active');
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
