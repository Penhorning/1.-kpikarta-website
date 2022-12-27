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
  // Page var
  search_text: string = "";
  pageIndex: number = 0;
  pageSize: number = 8;
  totalCatalogs: number = 0;
  // Loding var
  loading: boolean = false;
  loader: any = this._commonService.loader;
  noDataAvailable: any = this._commonService.noDataAvailable;


  constructor(private _marketplaceService: MarketplaceService, private _commonService: CommonService) { }

  ngOnInit(): void {
    this.getCatalogs();
  }

  // Apply filter
  changeFilter(event: any) {
    const isChecked = event.target.checked;
    const value = event.target.value;

    if (isChecked) this.nodeTypeFilter.push(value);
    else this.nodeTypeFilter = this.nodeTypeFilter.filter((item: any) => item !== value);
  }
  applyFilter() {
    this.getCatalogs();
  }

  // Get all catalogs
  getCatalogs() {
    let data: any = {
      page: 1,
      limit: this.pageSize,
      searchQuery: this.search_text
    }

    let url = "";
    if (this.catalogType === 'inventory') {
      url = '/karta_catalogs/get-all-public';
      data["nodeTypes"] = this.nodeTypeFilter;
    } else {
      url = "/karta/get-all-public"
    }

    this.loading = true;
    this.catalogs = [];
    this.pageIndex = 0;
    
    this._marketplaceService.getCatalogs(data, url).subscribe(
      (response: any) => {
        this.catalogs = response.catalogs[0].data;
        if (response.catalogs[0].metadata.length > 0) {
          this.totalCatalogs = response.catalogs[0].metadata[0].total; 
        } else this.totalCatalogs = 0;
      }
    ).add(() => this.loading = false);
  }

  // View catalog
  onView(catalog: any) {
    this.viewingCatalog = catalog;
  }

  // View more
  viewMore() {
    this.pageIndex++;
    let data: any = {
      page: this.pageIndex + 1,
      limit: this.pageSize,
      searchQuery: this.search_text
    }
    let url = "";
    if (this.catalogType === 'inventory') {
      url = '/karta_catalogs/get-all-public';
      data["nodeTypes"] = this.nodeTypeFilter;
    } else {
      url = "/karta/get-all-public"
    }

    this.loading = true;
    this._marketplaceService.getCatalogs(data, url).subscribe(
      (response: any) => {
        this.catalogs.push(...response.catalogs[0].data);
        if (response.catalogs[0].metadata.length > 0) {
          this.totalCatalogs = response.catalogs[0].metadata[0].total; 
        } else this.totalCatalogs = 0;
      }
    ).add(() => this.loading = false);
  }

  catalogTimer: any = null;
  onHandleSwitch(type: string) {
    clearTimeout(this.catalogTimer);
    this.catalogTimer = setTimeout(() => this.onTabSwitch(type), 500);
  }
  // Tab switch
  onTabSwitch(type: string) {
    this.search_text = "";
    this.catalogType = type;
    this.catalogs.length = 0;
    this.getCatalogs();
  }

  // Search
  search() {
    if (this.search_text) this.getCatalogs();
  }
  clearSearch() {
    this.search_text = "";
    this.getCatalogs();
  }

}

