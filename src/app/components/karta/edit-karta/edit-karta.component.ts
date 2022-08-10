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
  currentNode: any;
  phaseId: string = "";
  phases: any = [];
  suggestion: any;

  constructor(private _kartaService: KartaService, private _commonService: CommonService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Get phases
    this.getPhases();
    // Get karta id from url
    this.kartaId = this.route.snapshot.paramMap.get("id") || "";
    // Get karta info
    this.getKartaInfo();
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
  }

  // Update karta nodes
  updateKarta(data: any) {
    KpiKarta(data, "#karta-svg", {
      events: {
          addNode: (d: any) => {
            this.addNode(d);
          },
          nodeItem: (d: any) => {
            this.phaseId = d.phaseId;
            this.currentNode = d.name;
              console.log(d);
              // console.log('Node selected:',$(d3.event.target).attr('nodeid'));
          },
          removeNode: (d: any) => {
            this.removeNode(d);
          }
      }
    });
  }

  // Get karta details including all nodes
  getKartaInfo() {
    this._kartaService.getKarta(this.kartaId).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.karta = response;
        this.updateKarta(this.karta.node);
      },
      (error: any) => {}
    );
  }

  // Get all phases
  getPhases() {
    this._kartaService.getPhases().pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.phases = response;
        this.phaseId = this.phases[0].id;
        this.getSuggestion(this.phases[0].id);
      },
      (error: any) => {}
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

  onPhaseChange(phaseId: string) {
    this.getSuggestion(phaseId); 
  }

  // Add node in karta
  addNode(param: any) {
    let data = {
      name: "Child",
      phaseId: this.phases[param.depth + 1].id,
      parentId: param.id
    }
    this._kartaService.addNode(data).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {},
      (error: any) => {}
    );
  }

  // Remove node from karta
  removeNode(param: any) {
    this._kartaService.removeNode(param.id).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {},
      (error: any) => {}
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
