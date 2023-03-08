import { Component, OnInit } from '@angular/core';
import { CalculatePercentage } from '../utils/calculatePercentage';
import * as jqueryFunctions from '../utils/jqueryOperations.js';
import * as BuildKPIKarta from '../utils/d3.js';
import * as introJs from 'intro.js/intro.js';
import { KartaService } from '../service/karta.service';
import { CommonService } from '@app/shared/_services/common.service';
import { ActivatedRoute, Router } from '@angular/router';

declare const $: any;

@Component({
  selector: 'app-trial-karta',
  templateUrl: './trial-karta.component.html',
  styleUrls: ['./trial-karta.component.scss']
})
export class TrialKartaComponent implements OnInit {

  kartaId: string = '';
  newkartaId: string = '';
  karta: any;
  phases: any[] = [];
  colorSettings: any = [];
  loadingKarta: boolean = true;
  loader: any = this._commonService.loader;
  showSVG: boolean = false;
  introJS = introJs();

  // Version Control
  version: any[] = [];
  versionId: any = "";

  // Declare calculate percentage class variable
  percentageObj: any;

  // D3 karta events
  D3SVG: any = {
    phases: () => this.phases,
    events: {
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

  constructor(
    private _kartaService: KartaService,
    public _commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Get karta id from url
    this.kartaId = this.route.snapshot.paramMap.get('id') || '';

    this.introJS.setOptions({
      steps: [
      {
         element: '#step1',
         intro: 'You begin by clicking the Node button and stating your Goal which is the top of the Karta',
         position: 'bottom'
      },
      {
        element: '#step2',
        intro: 'You can drag and drop node from Inventory',
        position: 'bottom'
      },
      {
        element: '#step3',
        intro: 'You can add, remove and collapse child nodes',
        position: 'bottom'
      },
      {
        element: '#step4',
        intro: 'You can check the definition of the KPI Node',
        position: 'bottom'
      },
      {
        element: '#step5',
        intro: 'You can set the Typography options',
        position: 'bottom'
      },
      {
        element: '#step6',
        intro: 'You can switch the type between Measure/Metrics',
        position: 'bottom'
      },
      {
        element: '#step7',
        intro: 'You can save karta for different versioning',
        position: 'bottom'
      },
      {
        element: '#step8',
        intro: 'You can Undo, Redo and Resize a karta',
        position: 'bottom'
      },
      {
        element: '#step9',
        intro: 'You can switch between Editor/Viewer mode',
        position: 'bottom'
      }
    ],
    showProgress: true,
    exitOnOverlayClick: false,
    showBullets: false
    });
  }

  ngOnInit(): void {
    this.newkartaId = this._commonService.getSession().newkartaId;
    // Get versions
    this.getAllVersion();
  }
  
  flowFunction() {
    this.introJS.start();
    setTimeout(() => {
      this.introJS.refresh();
    }, 500);
    this.introJS.onbeforechange((target) => {
      if ( target.id == "step1" ) {
        setTimeout(() => {
          this.introJS.refresh();
        }, 500);
      } else if(target.id == "step2") {
        jqueryFunctions.togggleLeftSidebar();
      } else if(target.id == "step6") {
        jqueryFunctions.openRightSidebar();
        setTimeout(() => {
          this.introJS.refresh();
        }, 500);
      }
    });
    this.introJS.onafterchange((target) => {
      if ( target.id == "step1" ) {
        jqueryFunctions.hideLeftSidebar();
        setTimeout(() => {
          this.introJS.refresh();
        }, 500);
      } else if ( target.id == "step2" ) {
        this.showSVG = false;
        setTimeout(() => {
          this.introJS.refresh();
        }, 500);
      } else if ( target.id == "step3" ) {
        this.showSVG = true;
        jqueryFunctions.hideLeftSidebar();
        jqueryFunctions.closeRightSidebar();
        setTimeout(() => {
          this.introJS.refresh();
        }, 500);
      } else if ( target.id == "step4" ) {
        jqueryFunctions.openRightSidebar();
        setTimeout(() => {
          this.introJS.refresh();
        }, 500);
      } else if ( target.id == "step7" ) {
        jqueryFunctions.closeRightSidebar();
      }
      //   jqueryFunctions.togggleLeftSidebar();
      //   jqueryFunctions.hideLeftSidebar();
      //   jqueryFunctions.closeRightSidebar();
      //   jqueryFunctions.openRightSidebar();
    });
    this.introJS.oncomplete(() => {
      location.replace(`/karta/edit/${this.newkartaId}`);
    });
    this.introJS.onexit(() => {
      location.replace(`/karta/edit/${this.newkartaId}`);
    });
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

  // Get karta details including all nodes
  getKartaInfo() {
    this._kartaService.getKarta(this.kartaId).subscribe(
      (response: any) => {
        this.karta = response;
        this.versionId = response.versionId;
        if (this.karta.node) {
          BuildKPIKarta(this.karta.node, '#karta-svg', this.D3SVG);
          jqueryFunctions.disableChart();
          setTimeout(() => {
            this.flowFunction();
          }, 100)
        }
      }
    ).add(() => (this.loadingKarta = false));
  }

  // Get all phases
  getPhases() {
    this._kartaService.getGlobalPhases().subscribe(
      (response: any) => {
        this.phases = response;
        // Fetch karta nodes
        this.getKartaInfo();
      }
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
        this.percentageObj = new CalculatePercentage(this._commonService.getNodeSession(), this.colorSettings, {
          frequency: 'monthly',
          nodeId: ''
        }, 0);
      }
    );
  }

}
