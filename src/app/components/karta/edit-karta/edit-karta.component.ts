import { Component, OnInit } from '@angular/core';
import  * as KpiKarta from "../utils/d3.js";

declare const $: any;

@Component({
  selector: 'app-edit-karta',
  templateUrl: './edit-karta.component.html',
  styleUrls: ['./edit-karta.component.scss']
})
export class EditKartaComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
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
          },
          nodeItem:(d: any) => {
              console.log(d);
              // console.log('Node selected:',$(d3.event.target).attr('nodeid'));
          }
      }
    });
  }
}
