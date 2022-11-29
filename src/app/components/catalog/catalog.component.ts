import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  currentCatalog: any;
  sharingCatalog: any;
  shareSubmitFlag: boolean = false;
  sharedCatalogs: any = [];
  search_text: string = "";
  filterOptions: any = [
    { name: "Nodes", value: "node" },
    { name: "Branches", value: "branch" },
    { name: "Measures", value: "measure" },
    { name: "Metrics", value: "metrics" }
  ]
  nodeTypeFilter: any = [];
  // Share var
  selectedUsers: any = [];
  sharingCatalogCount: any = 0;
  emails: any = [];
  // Page var
  pageIndex: number = 0;
  pageSize: number = 8;
  totalAssignedCatalogs: number = 0;
  sharedPageIndex: number = 0;
  sharePageSize: number = 8;
  totalSharedCatalogs: number = 0;
  // Loding var
  loading: boolean = false;
  loadingShared: boolean = false;
  loader: any = this._commonService.loader;
  noDataAvailable: any = this._commonService.noDataAvailable;


  constructor(private _catalogService: CatalogService, private _commonService: CommonService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getCatalogs();
    this.getAllMembers();
    this.getSharedCatalogs();
  }

  // Apply filter
  applyFilter(event: any) {
    let isChecked = event.target.checked;
    let value = event.target.value;
    if (isChecked) this.nodeTypeFilter.push(value);
    else this.nodeTypeFilter = this.nodeTypeFilter.filter((item: any) => item !== value);
    this.getCatalogs();
  }

  // Get all catalogs
  getCatalogs() {
    let data = {
      page: this.pageIndex + 1,
      limit: this.pageSize,
      userId: this._commonService.getUserId(),
      searchQuery: this.search_text,
      nodeTypes: this.nodeTypeFilter
    }
    this.loading = true;
    this._catalogService.getCatalogs(data).subscribe(
      (response: any) => {
        this.catalogs = response.catalogs[0].data;
        if (response.catalogs[0].metadata.length > 0) {
          this.totalAssignedCatalogs = response.catalogs[0].metadata[0].total; 
        } else this.totalAssignedCatalogs = 0;
      }
    ).add(() => this.loading = false);
  }

  // Get shared catalogs
  getSharedCatalogs() {
    let data = {
      page: this.sharedPageIndex + 1,
      limit: this.sharePageSize,
      email: this._commonService.getEmailId(),
      searchQuery: this.search_text
    }
    this.loadingShared = true;
    this._catalogService.getSharedCatalogs(data).subscribe(
      (response: any) => {
        this.sharedCatalogs = response.catalogs[0].data;
        if (response.catalogs[0].metadata.length > 0) {
          this.totalSharedCatalogs = response.catalogs[0].metadata[0].total; 
        } else this.totalSharedCatalogs = 0;
      }
    ).add(() => this.loadingShared = false);
  }

  // View catalog
  onView(catalog: any) {
    this.currentCatalog = catalog;
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

  // On share Catalog
  onShare(param: any) {
    this.selectedUsers = [];
    this.emails = [];
    this.sharingCatalog = param;
    if (param.sharedTo) this.sharingCatalogCount = param.sharedTo.length;
    else this.sharingCatalogCount = 0;
  }

  // Submit shared data
  shareCatalog() {
    this.selectedUsers.forEach((element: any) => {
      // if (element.email !== this._commonService.getEmailId()) this.emails.push(element.email);
      if (element.email == this._commonService.getEmailId()) {
        this._commonService.warningToaster("You can not share Inventory to yourself!");
        if (element.email !== this._commonService.getEmailId()) { }
      } else {
        this.emails.push(element.email);
      }
    });
    if (this.emails.length > 0) {
    let data = {
      catalog: this.sharingCatalog,
      emails: this.emails
    }
    this.shareSubmitFlag = true;
    this._catalogService.shareCatalog(data).subscribe(
      (response: any) => {
        this._commonService.successToaster("Your have shared Inventory successfully!");
        $('#shareCatalogModal').modal('hide');
        this.getCatalogs();
        this.getSharedCatalogs();
      },
      (error: any) => { }
    ).add(() => this.shareSubmitFlag = false);
    }
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
      }
    );
  }

  // Add new email and share
  addTagPromise(e: string) {
    return new Promise((resolve) => {
     this.loading = true;
      var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (e.match(mailformat)) {
        // Callback function
        setTimeout(() => {
          resolve({ email: e });
          this.loading = false;
        });
      } this.loading = false;
    })
  }

  // View more assign
  viewAssignedMore() {
    this.pageIndex++;
    let data = {
      page: this.pageIndex + 1,
      limit: this.pageSize,
      userId: this._commonService.getUserId()
    }
    this.loading = true;
    this._catalogService.getCatalogs(data).subscribe(
      (response: any) => {
        this.catalogs.push(...response.catalogs[0].data);
        if (response.catalogs[0].metadata.length > 0) {
          this.totalAssignedCatalogs = response.catalogs[0].metadata[0].total; 
        } else this.totalAssignedCatalogs = 0;
      }
    ).add(() => this.loading = false);
  }

  // View more shared
  viewSharedMore() {
    this.sharedPageIndex++;
    let data = {
      page: this.sharedPageIndex + 1,
      limit: this.sharePageSize,
      email: this._commonService.getEmailId()
    }
    this.loadingShared = true;
    this._catalogService.getSharedCatalogs(data).subscribe(
      (response: any) => {
        this.sharedCatalogs.push(...response.catalogs[0].data);
        if (response.catalogs[0].metadata.length > 0) {
          this.totalSharedCatalogs = response.catalogs[0].metadata[0].total; 
        } else this.totalSharedCatalogs = 0;
      }
    ).add(() => this.loadingShared = false);
  }

  // Tab switch assign
  onTabSwitchAssign() {
    this.pageIndex = 0;
    this.search_text = "";
    this.catalogs = [];
    this.getCatalogs();
  }

  // Tab switch shared
  onTabSwitchShared() {
    this.sharedPageIndex = 0;
    this.search_text = "";
    this.sharedCatalogs = [];
    this.getSharedCatalogs();
  }

  search() {
    if (this.search_text) {
      this.pageIndex = 0;
      this.getCatalogs();
      this.getSharedCatalogs();
    }
  }
  clearSearch() {
    this.search_text = "";
    this.getCatalogs();
    this.getSharedCatalogs();
  }

  getCountOfCatalog(val: number){
    if(val > 100){
   let totalcount = '100+'
   return totalcount;
    }else if(val > 1){
     let totalcount = val - 1
     return totalcount;
    }
    return '';
  }

//  // Rename Catalog
//  changeEditStatus(id: number) {
//   $('#kt' + id).attr('contenteditable', true);
//   $('#kt' + id).focus();
//   return;
// }
// // Limiting length for Content Editable
// setLimitForContentEditable(event: any) {
//   return event.target.innerText.length < 50;
// }
// checkEditStatus(id: number) {
//   let value = $('#ct' + id).attr('contenteditable');
//   return JSON.parse(value);
// }
// renameCatalog(id: string, index: number) {
//   let value = document.getElementById('ct' + index)?.innerHTML;
//   if (value?.length == 0) {
//     this.ngOnInit();
//     return  this._commonService.errorToaster('Catalog name should not be blank!');
//   }
//   this._catalogService.updateCatalog(id, { name: value }).subscribe(
//     (response: any) => {
//       $('#ct' + index).attr('contenteditable', false);
//       this.ngOnInit();
//       this._commonService.successToaster('Catalog name updated successfully!');
//     }
//   );
// }

}
