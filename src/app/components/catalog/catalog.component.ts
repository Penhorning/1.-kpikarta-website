import { Component, OnInit } from '@angular/core';
import { CommonService } from '@app/shared/_services/common.service';
import { CatalogService } from './service/catalog.service';

declare const $: any;


@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {

  catalogs: any = [];
  members: any = [];
  catalogType: string = "owned";
  viewingCatalog: any;
  
  // Filter var
  nodeTypeFilter: any = [];
  filterOptions: any = [
    { name: "Branches", value: "branch" },
    { name: "Measures", value: "measure" },
    { name: "Metrics", value: "metrics" }
  ]
  // Share var
  dropdownSettings: any = {};
  sharingCatalog: any;
  shareSubmitFlag: boolean = false;
  selectedUsers: any = [];
  selectedSharedUsers: any = []
  sharingCatalogCount: any = 0;
  // Page var
  search_text: string = "";
  pageIndex: number = 0;
  pageSize: number = 8;
  totalCatalogs: number = 0;
  // Loding var
  loading: boolean = false;
  loader: any = this._commonService.loader;
  noDataAvailable: any = this._commonService.noDataAvailable;


  constructor(private _catalogService: CatalogService, private _commonService: CommonService) { }

  ngOnInit(): void {
    this.getCatalogs();
    this.getAllMembers();

    // Ng Multi Select Dropdown properties
    this.dropdownSettings = {
      enableCheckAll: false,
      singleSelection: false,
      idField: '_id',
      textField: 'nameAndEmail',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      disabled: false
    }
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

    this._catalogService.getCatalogs(data).subscribe(
      (response: any) => {
        this.catalogs = response.catalogs[0].data;
        if (response.catalogs[0].metadata.length > 0) {
          this.totalCatalogs = response.catalogs[0].metadata[0].total; 
        } else this.totalCatalogs = 0;
      }
    ).add(() => this.loading = false);
  }

  // Get all members
  getAllMembers() {
    let data = {
      limit: 1000,
      userId: this._commonService.getUserId()
    }
    this._catalogService.getAllMembers(data).subscribe(
      (response: any) => {
        this.members = response.members[0].data;
        this.members?.map((element:any) => {
          element.nameAndEmail = (element.fullName +' '+ `(${element.email})`);
        });
      }
    );
  }

  // View catalog
  onView(catalog: any) {
    this.viewingCatalog = catalog;
  }

  // Update catalog
  updateCatalog(type: string, id: string, index: number) {
    this._catalogService.updateCatalog(id, { type }).subscribe(
      (response: any) => {
        this.catalogs[index].type = type;
      }
    );
  }

  // Delete catalog
  deleteCatalog(id: string) {
    const result = confirm("Are you sure you want to delete this Inventory?");
    if (result) {
      this._catalogService.deleteCatalog({ catalogId: id }).subscribe(
        (response: any) => {
          this._commonService.successToaster("Inventory deleted successfully!");
          this.getCatalogs();
        }
      );
    }
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
    this._catalogService.getCatalogs(data).subscribe(
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
    this.search_text = "";
    this.catalogType = type;
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

  // Ng Multi Select Dropdown
  onItemSelect(item: any) {
    this.selectedUsers.push({ userId: item._id });
  }
  onItemDeSelect(item: any) {
    if( this.selectedUsers && this.selectedUsers.length > 0 ) {
      this.selectedUsers = this.selectedUsers.filter((el: any) => el.userId !== item._id);
    }
  }

  // Reset share catalog
  resetSharingCatalog() {
    this.sharingCatalog = undefined;
    this.selectedUsers = [];
  }
  // On share click
  onShare(param: any) {
    this.sharingCatalog = param;
    if (param.sharedTo) {
      this.sharingCatalogCount = param.sharedTo.length;
    } else {
      this.sharingCatalogCount = 0;
      this.members.forEach((user: any) => {
        user.isDisabled = false;
      });
    }
    this.selectedSharedUsers = [];
    if (param.sharedTo && param.sharedTo.length > 0) {
      this.members.forEach((user: any) => {
        user.isDisabled = false;
        param.sharedTo.forEach((item: any) => {
          if (item.userId === user._id) {
            user.isDisabled = true;
            this.selectedSharedUsers.push(user);
          }
        })
      });
    }
  }
  
  // Share catalog
  shareCatalog() {
    let data = {
      catalogId: this.sharingCatalog._id,
      userIds: this.selectedUsers
    }
    this.shareSubmitFlag = true;
    this._catalogService.shareCatalog(data).subscribe(
      (response: any) => {
        this._commonService.successToaster("Your have shared Inventory successfully!");
        $('#shareCatalogModal').modal('hide');
        this.resetSharingCatalog();
        this.getCatalogs();
      },
      (error: any) => { }
    ).add(() => this.shareSubmitFlag = false);
  }

}
