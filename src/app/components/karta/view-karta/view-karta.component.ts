import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { KartaService } from '../service/karta.service';
import * as BuildKPIKarta from '../utils/d3.js';
import * as jqueryFunctions from '../utils/jqueryOperations.js';
import { CalculatePercentage } from '../utils/calculatePercentage';


@Component({
  selector: 'app-view-karta',
  templateUrl: './view-karta.component.html',
  styleUrls: ['./view-karta.component.scss']
})
export class ViewKartaComponent implements OnInit {

  kartaId: string = '';
  karta: any;
  phases: any[] = [];
  colorSettings: any = [];
  loadingKarta: boolean = true;
  loader: any = this._commonService.loader;
  showSVG: boolean = false;

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
    private _commonService: CommonService,
    private route: ActivatedRoute
  ) {
    // Get karta id from url
    this.kartaId = this.route.snapshot.paramMap.get('id') || '';
  }

  ngOnInit(): void {
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

  // Set karta's div width
  setKartaDimension() {
    let width, height, karta_col_width, karta_col_height, svg_width, svg_height;
    karta_col_width = jqueryFunctions.getWidth('.karta_column');
    // karta_col_height = $('.karta_column').height();
    karta_col_height = 455;
    svg_width = jqueryFunctions.getWidth('#karta-svg svg');
    svg_height = jqueryFunctions.getHeight('#karta-svg svg');

    width = svg_width > karta_col_width ? svg_width : karta_col_width;
    // height = svg_height > karta_col_height ? svg_height : karta_col_height;
    height = 455;

    jqueryFunctions.setStyle('#karta-svg', 'max-width', karta_col_width);

    // $('#karta-svg').css("max-height", karta_col_height + 5);   // For multiple phases
    jqueryFunctions.setStyle('#karta-svg', 'max-height', karta_col_height);
    jqueryFunctions.setAttribute('#karta-svg svg', 'width', width);
    jqueryFunctions.setAttribute('#karta-svg svg', 'height', height);
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
          this.karta.node.percentage = Math.round(this.percentageObj.calculatePercentage(this.karta.node));
          this.karta.node.border_color = this.setColors(this.karta.node.percentage);
          BuildKPIKarta(this.karta.node, '#karta-svg', this.D3SVG);
          jqueryFunctions.removeElement(".center-options");
          jqueryFunctions.disableChart();
          this.setKartaDimension();
          this.showSVG = true;
        }
      }
    ).add(() => (this.loadingKarta = false));
  }

  // Get all phases
  getPhases() {
    this._kartaService.getPhases(this.kartaId).subscribe((response: any) => {
      this.phases = response;
      this.getKartaInfo();
    });
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
}
