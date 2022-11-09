import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { KartaService } from '../service/karta.service';

declare const $: any;

@Component({
  selector: 'app-all-kartas',
  templateUrl: './all-kartas.component.html',
  styleUrls: ['./all-kartas.component.scss']
})
export class AllKartasComponent implements OnInit {

  kartas: any = [];
  members: any = [];
  sharingKarta: any;
  shareSubmitFlag: boolean = false;
  sharedKartas: any = [];
  search_text: string = "";
  // Share var
  selectedUsers: any = [];
  sharingKartaCount: any = 0;
  emails: any = [];
  // Page var
  pageIndex: number = 0;
  pageSize: number = 8;
  sharedPageIndex: number = 0;
  sharePageSize: number = 8;
  // Loding var
  loading: boolean = false;
  loadingShared: boolean = false;
  loader: any = this._commonService.loader;
  noDataAvailable: any = this._commonService.noDataAvailable;
  viewMoreAssign_hide: boolean = true;
  viewMoreShared_hide: boolean = true;


  constructor(private _kartaService: KartaService, private _commonService: CommonService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getKartas();
    this.getAllMembers();
    this.getSharedKartas();

    this.route.fragment.subscribe(f => {
      if (f === "tabs-2") $("#shared_tab").click();
    });
  }

  // Navigate to create karta
  navigateToKarta() {
    this.router.navigate(['/karta/create-karta']);
  }

  // Get all kartas
  getKartas() {
    let data = {
      page: this.pageIndex + 1,
      limit: this.pageSize,
      userId: this._commonService.getUserId(),
      searchQuery: this.search_text
    }
    this.loading = true;
    this._kartaService.getKartas(data).subscribe(
      (response: any) => {
        if (response) this.kartas = response.kartas[0].data;
        else this.kartas = [];
      }
    ).add(() => this.loading = false);
  }

  getSharedKartas() {
    let data = {
      page: this.sharedPageIndex + 1,
      limit: this.sharePageSize,
      email: this._commonService.getEmailId(),
      searchQuery: this.search_text
    }
    this.loadingShared = true;
    this._kartaService.getSharedKartas(data).subscribe(
      (response: any) => {
        if (response) {
          this.sharedKartas = response.kartas[0].data;
        } else this.sharedKartas = [];
      }
    ).add(() => this.loadingShared = false);
  }

  // Update karta
  updateKarta(type: string, id: string, index: number) {
    this._kartaService.updateKarta(id, { type }).subscribe(
      (response: any) => {
        this.kartas[index].type = type;
      }
    );
  }

  // Delete karta
  deleteKarta(id: string) {
    const result = confirm("Are you sure you want to delete this karta?");
    if (result) {
      this._kartaService.deleteKarta({ kartaId: id }).subscribe(
        (response: any) => {
          this._commonService.successToaster("Karta deleted successfully!");
          this.getKartas();
        }
      );
    }
  }

  // On share karta
  onShare(param: any) {
    this.selectedUsers = [];
    this.emails = [];
    this.sharingKarta = param;
    if (param.sharedTo) this.sharingKartaCount = param.sharedTo.length;
    else this.sharingKartaCount = 0;
  }

  // Submit shared data
  shareKarta() {
    this.selectedUsers.forEach((element: any) => {
      // if (element.email !== this._commonService.getEmailId()) this.emails.push(element.email);
      if (element.email == this._commonService.getEmailId()) {
        this._commonService.warningToaster("You can not share karta to yourself!");
        if (element.email !== this._commonService.getEmailId()) { }
      } else {
        this.emails.push(element.email);
      }
    });
    if (this.emails.length > 0) {
    let data = {
      karta: this.sharingKarta,
      emails: this.emails
    }
    this.shareSubmitFlag = true;
    this._kartaService.shareKarta(data).subscribe(
      (response: any) => {
        this._commonService.successToaster("Your have shared karta successfully!");
        $('#shareLinkModal').modal('hide');
        this.getKartas();
        this.getSharedKartas();
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
    this._kartaService.getAllMembers(data).subscribe(
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

  // Copy karta
  copyKarta(id: string) {
    const result = confirm("Are you sure you want to create a copy of this karta?");
    if (result) {
      this._kartaService.copyKarta({ kartaId: id, userId: this._commonService.getUserId() }).subscribe(
        (response: any) => {
          this._commonService.successToaster("Karta copy created successfully!");
          this.getKartas();
        }
      );
    }
  }

  // View more assign
  assignViewMore() {
    this.pageIndex++;
    let data = {
      page: this.pageIndex + 1,
      limit: this.pageSize,
      userId: this._commonService.getUserId()
    }
    this.loading = true;
    this._kartaService.getKartas(data).subscribe(
      (response: any) => {
        if (response) {
          this.kartas.push(...response.kartas[0].data);
          if (response.kartas[0].metadata[0].total == this.kartas.length) this.viewMoreAssign_hide = !this.viewMoreAssign_hide;
        }
      }
    ).add(() => this.loading = false);
  }

  // View more shared
  sharedViewMore() {
    this.sharedPageIndex++;
    let data = {
      page: this.sharedPageIndex + 1,
      limit: this.sharePageSize,
      email: this._commonService.getEmailId()
    }
    this.loadingShared = true;
    this._kartaService.getSharedKartas(data).subscribe(
      (response: any) => {
        if (response) {
          this.sharedKartas.push(...response.kartas[0].data);
          if (response.kartas[0].metadata[0].total == this.sharedKartas.length) this.viewMoreShared_hide = !this.viewMoreShared_hide;
        }
      }
    ).add(() => this.loadingShared = false);
  }

  // Tab switch assign
  onTabSwitchAssign() {
    this.pageIndex = 0;
    this.search_text = "";
    this.kartas = [];
    this.getKartas();
  }

  // Tab switch shared
  onTabSwitchShared() {
    this.sharedPageIndex = 0;
    this.search_text = "";
    this.sharedKartas = [];
    this.getSharedKartas();
  }

  search() {
    if (this.search_text) {
      this.pageIndex = 0;
      this.getKartas();
      this.getSharedKartas();
    }
  }
  clearSearch() {
    this.search_text = "";
    this.getKartas();
    this.getSharedKartas();
  }

  getCountOfKarta(val: number){
    if(val > 100){
   let totalcount = '100+'
   return totalcount;
    }else if(val > 1){
     let totalcount = val - 1
     return totalcount;
    }
    return '';
 }

   // Rename karta
   changeEditStatus(id: number) {
    $('#kt' + id).attr('contenteditable', true);
    $('#kt' + id).focus();
    return;
  }
  // Limiting length for Content Editable
  setLimitForContentEditable(event: any) {
    return event.target.innerText.length < 50;
  }
  checkEditStatus(id: number) {
    let value = $('#kt' + id).attr('contenteditable');
    return JSON.parse(value);
  }
  renameKarta(id: string, index: number) {
    let value = document.getElementById('kt' + index)?.innerHTML;
    if(value?.length == 0){
      this.ngOnInit();
    return  this._commonService.errorToaster('Karta name should not be blank!');
    }
    this._kartaService.updateKarta(id, { name: value }).subscribe(
      (x) => {
        if (x) {
          $('#kt' + index).attr('contenteditable', false);
          this.ngOnInit();
          this._commonService.successToaster(
            'Karta name updated successfully!'
          );
        }
      },
      (err) => {
        console.log(err);
        this._commonService.errorToaster('Error while updating name!');
      }
    );
  }
  

}
