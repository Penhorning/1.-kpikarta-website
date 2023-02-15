import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  sharingCatalog: any;
  shareSubmitFlag: boolean = false;
  selectedUsers: any = [];
  selectedSharedUsers: any = [];
  sharingCatalogCount: any = 0;
  dropdownSettings: any = {};

  // Share page var
  sharedCatalogs: any = [];
  sharedPageIndex: number = 0;
  sharedPageSize: number = 8;
  sharedTotalCatalogs: number = 0;
  // Page var
  search_text: string = "";
  pageIndex: number = 0;
  pageSize: number = 8;
  totalCatalogs: number = 0;
  // Loding var
  loading: boolean = false;
  loader: any = this._commonService.loader;
  noDataAvailable: any = this._commonService.noDataAvailable;


  constructor(private _catalogService: CatalogService, private _commonService: CommonService, private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getAllCatalogs();
    this.getAllMembers();

    // Ng Multi Select Dropdown properties
    this.dropdownSettings = {
      enableCheckAll: true,
      singleSelection: false,
      idField: '_id',
      textField: 'nameAndEmail',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      disabled: false,
      itemsShowLimit: 3
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
    this.getAllCatalogs();
  }

  // Get all catalogs
  getAllCatalogs() {
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
        this.changeDetectorRef.detectChanges();
      }
    ).add(() => this.loading = false);
  }

  // Get all shared catalogs
  getAllSharedCatalogs() {
    let data = {
      page: 1,
      limit: this.sharedPageSize,
      userId: this._commonService.getUserId(),
      searchQuery: this.search_text,
      nodeTypes: this.nodeTypeFilter,
      type: this.catalogType
    }

    this.loading = true;
    this.sharedCatalogs = [];
    this.sharedPageIndex = 0;

    this._catalogService.getCatalogs(data).subscribe(
      (response: any) => {
        if (response.catalogs[0].data.length > 0) {
          this.sharedCatalogs = response.catalogs[0].data;
          this.sharedTotalCatalogs = response.catalogs[0].metadata[0].total;
        } else this.sharedTotalCatalogs = 0;
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
          this.getAllCatalogs();
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

  // Shared view more
  sharedViewMore() {
    this.sharedPageIndex++;
    let data = {
      page: this.sharedPageIndex + 1,
      limit: this.sharedPageSize,
      userId: this._commonService.getUserId(),
      type: this.catalogType
    }
    this.loading = true;
    this._catalogService.getCatalogs(data).subscribe(
      (response: any) => {
        if (response.catalogs[0].data.length > 0) {
          this.sharedCatalogs.push(...response.catalogs[0].data);
          this.sharedTotalCatalogs = response.catalogs[0].metadata[0].total;
        } else this.sharedTotalCatalogs = 0;
      }
    ).add(() => this.loading = false);
  }

  // Tab switch
  onTabSwitch() {
    this.catalogType = "owned";
    this.search_text = "";
    this.getAllCatalogs();
  }
  // Tab switch shared
  onTabSwitchShared() {
    this.catalogType = "shared";
    this.search_text = "";
    this.getAllSharedCatalogs();
  }

  // Search
  search() {
    if (this.search_text && this.catalogType === "owned") this.getAllCatalogs();
    else if (this.search_text && this.catalogType === "shared") this.getAllSharedCatalogs();
  }
  clearSearch() {
    this.search_text = "";
    if (this.catalogType === "owned") this.getAllCatalogs();
    else if (this.catalogType === "shared") this.getAllSharedCatalogs();
  }

  // Ng Multi Select Dropdown
  onItemSelect(item: any) {
    this.selectedUsers.push({ userId: item._id });
  }

  onSelectAll(items: any) {
    items.forEach((item: any) => {this.selectedUsers.push({ userId: item._id })});
  }

  onDeSelectAll(items: any) {
    this.selectedUsers = []
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
    if(this.selectedUsers.length === 0){
      this._commonService.errorToaster('Please select the users!')
    }else {
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
        this.getAllCatalogs();
      },
      (error: any) => { }
    ).add(() => this.shareSubmitFlag = false);
  }
}

}
