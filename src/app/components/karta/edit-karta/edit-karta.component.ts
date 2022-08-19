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
  // Node properties
  currentNodeName: string = "";
  selectedFont: any = "";
  selectedColor: any = "";
  selectedAlignment: any ="";


  constructor(private _kartaService: KartaService, private _commonService: CommonService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Get phases
    this.getPhases();
    // Get color settings
    this.getColorSettings();
    // Get karta id from url
    this.kartaId = this.route.snapshot.paramMap.get("id") || "";
    // Get karta info
    this.getKartaInfo();
    // Sidebar
    $('#sidebarCollapse').on('click', function () {
      $('#sidebar-two').toggleClass('active');
    });
    // Set karta's div width
    const maxWidth = window.innerWidth - 500;
    $('#karta-svg').css("max-width", maxWidth);
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

  // Current font style change
  onFontStyleChange(value: any) {
    let data = {
      font_style: value,
    }
    this._kartaService.updateNode(this.currentNode.id, data).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {  }
    );
  }

   // Current alignment change
  onAlignmentChange(value: any) {
    let data = {
      alignment: value,
    }
    this._kartaService.updateNode(this.currentNode.id, data).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {  }
    );
  }

   // Current text tolor change
  onChangeColor(color: any){
    let data = {
      text_color: color,
    }
    this._kartaService.updateNode(this.currentNode.id, data).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {  }
    );
  }

  // Current node name change
  onNameChange() {
    let data = {
      name: this.currentNodeName,
    }
    this._kartaService.updateNode(this.currentNode.id, data).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {  }
    );
  }

  updateNodeProperties(param: any) {
    console.log("paramas", param)
    this.phaseId = param.phaseId;
    this.currentNode = param;
    this.currentNodeName = param.name;
    this.selectedFont = param.font_style;
    this.selectedColor = param.text_color;
    this.selectedAlignment = param.alignment;
    // Show properties div
    $('#rightSidebar').addClass("d-block");
    this.getNodeDetails(param);
    let phaseIndex = this.phases.findIndex((item: any) => {
      return item.id === this.phaseId;
    });
    if (this.phases[phaseIndex].name === "KPI") {
      this.isMatrics = true;
    }
  }

  // Update karta nodes
  updateKarta(data: any) {
    BuildKPIKarta(data, "#karta-svg", {
      events: {
        addNode: (d: any) => {
          this.addNode(d);
        },
        nodeItem: (d: any) => {
          this.updateNodeProperties(d);
            console.log(d);
            // console.log('Node selected:',$(d3.event.target).attr('nodeid'));
        },
        removeNode: (d: any) => {
          this.removeNode(d);
        },
        linkColor:(d: any) => {
          let node_percentage = parseInt((d.target).target_value);
          console.log("node target value for color", node_percentage)
          let colorSetting = this.colorSettings.settings.filter((item: any) => node_percentage >= item.min && node_percentage <= item.max);
          console.log(colorSetting);
          return colorSetting[0]?.color ? colorSetting[0]?.color : 'black';
        },
        linkWidth:(d: any) => {
          let node_percentage = parseInt((d.target).target_value);
          console.log("node target value for width ", node_percentage)
          return node_percentage/10;
        }
      }
    });
  }

  // Get karta details including all nodes
  getKartaInfo() {
    this._kartaService.getKarta(this.kartaId).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.karta = response;
        if (this.karta.node) {
          this.updateKarta(this.karta.node);
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
        console.log("response", response)
        this.phases = response;
        // this.phaseId = this.phases[0].id;
        this.getSuggestion(this.phases[0].id);
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
      phaseId: this.phases[param.depth + 1].id,
      parentId: param.id
    }
    this._kartaService.addNode(data).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.getKartaInfo();
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
