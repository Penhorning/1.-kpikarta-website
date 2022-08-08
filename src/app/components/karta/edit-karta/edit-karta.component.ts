import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KartaService } from '../service/karta.service';
import  * as KpiKarta from "../utils/d3.js";

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
  phaseId: string = "";
  phases: any = [];
  suggestion: any;

  constructor(private _kartaService: KartaService, private _commonService: CommonService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Get karta id from url
    this.kartaId = this.route.snapshot.paramMap.get("id") || "";
    // Get karta info
    this.getKartaInfo();
    // Get phases
    this.getKartaPhases();
    // Sidebar
    $('#sidebarCollapse').on('click', function () {
      $('#sidebar-two').toggleClass('active');
    });
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
    // D3 Karta
    const treeData = {
      "name": "BU Head",
      "children": [
          {
              "name": "Manager",
              "children": [
                  {
                      "name": "Team Lead",
                      "children": []
                  },
                  {
                      "name": "Team Lead",
                      "children": []
                  }, {
                      "name": "Team Lead",
                      "children": []
                  },
                  {
                      "name": "Team Lead",
                      "children": []
                  }
              ]
          },
          {
              "name": "Manager",
              "children": [
                  {
                      "name": "Team Lead",
                      "children": [{
                          "name": "Team Lead",
                          "children": [{
                              "name": "Team Lead",
                              "children": []
                          },
                          {
                              "name": "Team Lead",
                              "children": []
                          }, {
                              "name": "Team Lead",
                              "children": []
                          },
                          {
                              "name": "Team Lead",
                              "children": []
                          }]
                      },
                      {
                          "name": "Team Lead",
                          "children": []
                      }, {
                          "name": "Team Lead",
                          "children": []
                      },
                      {
                          "name": "Team Lead",
                          "children": []
                      }]
                  },
                  {
                      "name": "Team Lead",
                      "children": []
                  }, {
                      "name": "Team Lead",
                      "children": []
                  },
                  {
                      "name": "Team Lead",
                      "children": []
                  }
              ]
          }
      ]
    };
    KpiKarta(treeData, "#karta-svg", {
      events:{
          addNode:(d: any) => {
              console.log('Node Added');
              console.log(d);
              this.addNode(d);
          },
          nodeItem:(d: any) => {
              console.log(d);
              // console.log('Node selected:',$(d3.event.target).attr('nodeid'));
          }
      }
    });
  }

  getKartaInfo() {
    this._kartaService.getKarta(this.kartaId).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.karta = response;
      },
      (error: any) => {}
    );
  }

  getKartaPhases() {
    this._kartaService.getPhases().pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.phases = response;
        this.phaseId = this.phases[0].id;
        this.getSuggestion(this.phases[0].id);
      },
      (error: any) => {}
    );
  }

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

  onPhaseChange(phaseId: string) {
    this.getSuggestion(phaseId); 
  }

  addNode(param: any) {
    let data = {
      name: param.name,
      kartaId: this.kartaId,
      phaseId: this.phaseId
    }
    this._kartaService.addNode(data).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        // this.departments = response;
      },
      (error: any) => { }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
