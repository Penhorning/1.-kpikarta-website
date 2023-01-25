import { Component, OnInit } from '@angular/core';
import { CommonService } from '@app/shared/_services/common.service';
import { MarketplaceService } from './service/marketplace.service';

declare const $: any;


@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss']
})
export class MarketplaceComponent implements OnInit {

  catalogs: any = [];
  members: any = [];
  catalogType: string = "inventory";
  viewingCatalog: any;
  
  // Filter var
  nodeTypeFilter: any = [];
  filterOptions: any = [
    { name: "Branches", value: "branch" },
    { name: "Measures", value: "measure" },
    { name: "Metrics", value: "metrics" }
  ]
  // Karta page var
  kartas: any = [];
  kartaPageIndex: number = 1;
  kartaPageSize: number = 8;
  totalKartas: number = 0;
  // Page var
  search_text: string = "";
  pageIndex: number = 1;
  pageSize: number = 8;
  totalCatalogs: number = 0;
  // Loding var
  loading: boolean = false;
  loader: any = this._commonService.loader;
  noDataAvailable: any = this._commonService.noDataAvailable;


  constructor(private _marketplaceService: MarketplaceService, private _commonService: CommonService) { }

  ngOnInit(): void {
    this.getAllCatalogs();
  }

  // Apply filter
  changeFilter(event: any) {
    const isChecked = event.target.checked;
    const value = event.target.value;

    if (isChecked) this.nodeTypeFilter.push(value);
    else this.nodeTypeFilter = this.nodeTypeFilter.filter((item: any) => item !== value);
  }
  applyFilter() {
    this.getAllCatalogs();
  }

  // Get all catalogs
  getAllCatalogs() {
    let data: any = {
      page: this.pageIndex,
      limit: this.pageSize,
      searchQuery: this.search_text
    }

    this.loading = true;
    this.catalogs = [];
    this.pageIndex = 1;
    
    this._marketplaceService.getAllCatalogs(data).subscribe(
      (response: any) => {
        if (response.catalogs[0].data.length > 0) {
          this.catalogs = response.catalogs[0].data;
          this.totalCatalogs = response.catalogs[0].metadata[0].total;
        } else this.totalCatalogs = 0;
      }
    ).add(() => this.loading = false);
  }

  // Get all kartas
  getAllKartas() {
    let data = {
      page: this.kartaPageIndex,
      limit: this.kartaPageSize,
      searchQuery: this.search_text
    }

    this.loading = true;
    this.kartas = [];
    this.kartaPageIndex = 1;

    this._marketplaceService.getAllKartas(data).subscribe(
      (response: any) => {
        if (response.kartas[0].data.length > 0) {
          this.kartas = response.kartas[0].data;
          this.totalKartas = response.kartas[0].metadata[0].total;
        } else this.totalKartas = 0;
      }
    ).add(() => this.loading = false);
  }

  // View catalog
  onView(catalog: any) {
    this.viewingCatalog = catalog;
  }

  // View more
  viewMore() {
    let data: any = {
      page: ++this.pageIndex,
      limit: this.pageSize,
      searchQuery: this.search_text
    }

    this.loading = true;
    this._marketplaceService.getAllCatalogs(data).subscribe(
      (response: any) => {
        if (response.catalogs[0].data.length > 0) {
          this.catalogs.push(...response.catalogs[0].data);
          this.totalCatalogs = response.catalogs[0].metadata[0].total; 
        } else this.totalCatalogs = 0;
      }
    ).add(() => this.loading = false);
  }

  // Karta view more
  kartaViewMore() {
    let data = {
      page: ++this.kartaPageIndex,
      limit: this.kartaPageSize,
      searchQuery: this.search_text
    }
    
    this.loading = true;
    this._marketplaceService.getAllKartas(data).subscribe(
      (response: any) => {
        if (response.kartas[0].data.length > 0) {
          this.kartas.push(...response.kartas[0].data);
          this.totalKartas = response.kartas[0].metadata[0].total;
        } else this.totalKartas = 0;
      }
    ).add(() => this.loading = false);
  }

  // Tab switch
  onTabSwitch() {
    this.catalogType = "inventory";
    this.search_text = "";
    this.getAllCatalogs();
  }
  // Tab switch karta
  onTabSwitchKarta() {
    this.catalogType = "karta";
    this.search_text = "";
    this.getAllKartas();
  }

  // Search
  search() {
    if (this.search_text && this.catalogType === "inventory") this.getAllCatalogs();
    else if (this.search_text && this.catalogType === "karta") this.getAllKartas();
  }
  clearSearch() {
    this.search_text = "";
    if (this.catalogType === "inventory") this.getAllCatalogs();
    else if (this.catalogType === "karta") this.getAllKartas();
  }

}

