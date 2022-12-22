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
  catalogTimer: any = null;
  catalogType: string = "owned";
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
    let data = {
      page: 1,
      limit: this.pageSize,
      userId: this._commonService.getUserId(),
      searchQuery: this.search_text,
      nodeTypes: this.nodeTypeFilter,
      type: this.catalogType
    }

    this.loading = true;
    this.catalogs = [];
    this.pageIndex = 0;
    
    this._marketplaceService.getCatalogs(data).subscribe(
      (response: any) => {
        this.catalogs = response.catalogs[0].data;
        console.table(this.catalogs);
        if (response.catalogs[0].metadata.length > 0) {
          this.totalCatalogs = response.catalogs[0].metadata[0].total; 
        } else this.totalCatalogs = 0;
        // this.changeDetectorRef.detectChanges();
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
    let data = {
      page: this.pageIndex + 1,
      limit: this.pageSize,
      userId: this._commonService.getUserId(),
      searchQuery: this.search_text,
      nodeTypes: this.nodeTypeFilter,
      type: this.catalogType
    }
    this.loading = true;
    this._marketplaceService.getCatalogs(data).subscribe(
      (response: any) => {
        this.catalogs.push(...response.catalogs[0].data);
        if (response.catalogs[0].metadata.length > 0) {
          this.totalCatalogs = response.catalogs[0].metadata[0].total; 
        } else this.totalCatalogs = 0;
      }
    ).add(() => this.loading = false);
  }

  // Tab switch
  onTabSwitch(type: string) {
    if (this.catalogType !== type) {
      this.search_text = "";
      this.catalogType = type;
      this.catalogs.length = 0;
      if (this.catalogTimer) {
        clearTimeout(this.catalogTimer);
        this.catalogTimer = null;
      } else {
        this.catalogTimer = this.catalogs.length == 0 && setTimeout(() => {this.getCatalogs()}, 1000);
      }
    }
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

