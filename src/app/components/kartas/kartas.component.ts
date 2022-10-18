import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { KartasService } from './service/kartas.service';

declare const $: any;


@Component({
  selector: 'app-kartas',
  templateUrl: './kartas.component.html',
  styleUrls: ['./kartas.component.scss']
})
export class KartasComponent implements OnInit {


  kartas: any = [];
  users: any = [];
  sharingKarta: any;
  sharedSubmitFlag: boolean = false;
  sharedKartas: any = [];
  search_text: any;
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
  loadingKarta: boolean = true;
  loader: any = this._commonService.loader;
  loading = false;
  viewMoreAssign_hide: boolean = true;
  viewMoreShared_hide: boolean = true;


  constructor(private _kartasService: KartasService, private _commonService: CommonService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getKartas();
    this.getAllUser();
    this.getSharedKarta();

    this.route.fragment.subscribe(f => {
      if (f === "tabs-2") $("#shared_tab").click();
    });
  }

  // Navigate to create karta
  navigateToKarta() {
    console.log("data")
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
    this._kartasService.getKartas(data).subscribe(
      (response: any) => {
        if (response) {
          this.kartas = response.kartas[0].data;
        } else this.kartas = [];
      }
    ).add(() => this.loadingKarta = false);
  }

  getSharedKarta() {
    let data = {
      page: this.sharedPageIndex + 1,
      limit: this.sharePageSize,
      email: this._commonService.getEmailId(),
      searchQuery: this.search_text
    }
    this._kartasService.getSharedKarta(data).subscribe(
      (response: any) => {
        if (response) {
          this.sharedKartas = response.kartas[0].data;
        } else this.sharedKartas = [];
      }
    ).add(() => this.loadingKarta = false);
  }

  // Update karta
  updateKarta(type: string, id: string, index: number) {
    this._kartasService.updateKarta(id, { type }).subscribe(
      (response: any) => {
        this.kartas[index].type = type;
      }
    );
  }

  // Delete karta
  deleteKarta(id: string) {
    const result = confirm("Are you sure you want to delete this karta?");
    if (result) {
      this._kartasService.deleteKarta({ kartaId: id }).subscribe(
        (response: any) => {
          this._commonService.successToaster("Karta deleted successfully");
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
      if (element.email !== this._commonService.getEmailId()) this.emails.push(element.email);
    });
    let data = {
      karta: this.sharingKarta,
      emails: this.emails
    }
    this.sharedSubmitFlag = true;
    this._kartasService.sharedEmails(data).subscribe(
      (response: any) => {
        this._commonService.successToaster("Your have shared karta successfully");
        $('#shareLinkModal').modal('hide');
        this.getKartas();
        this.getSharedKarta();
      },
      (error: any) => { }
    ).add(() => this.sharedSubmitFlag = false);
  }

  // Get all users 
  getAllUser() {
    this._kartasService.getAllUsers().subscribe(
      (response: any) => {
        if (response) {
          this.users = response.users[0].data.filter((x: any) => {
            return x.email != this._commonService.getEmailId();
          })
        } else {
          this.users = [];
        }
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
      this._kartasService.copyKarta({ kartaId: id }).subscribe(
        (response: any) => {
          this._commonService.successToaster("Karta copy created successfully.");
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
    this._kartasService.getKartas(data).subscribe(
      (response: any) => {
        if (response) {
          this.kartas.push(...response.kartas[0].data);
          if (response.kartas[0].metadata[0].total == this.kartas.length) this.viewMoreAssign_hide = !this.viewMoreAssign_hide;
        }
      }
    ).add(() => this.loadingKarta = false);
  }

  // View more shared
  sharedViewMore() {
    this.sharedPageIndex++;
    let data = {
      page: this.sharedPageIndex + 1,
      limit: this.sharePageSize,
      email: this._commonService.getEmailId()
    }
    this._kartasService.getSharedKarta(data).subscribe(
      (response: any) => {
        if (response) {
          this.sharedKartas.push(...response.kartas[0].data)
          if (response.kartas[0].metadata[0].total == this.sharedKartas.length) this.viewMoreShared_hide = !this.viewMoreShared_hide;
        }
      }
    ).add(() => this.loadingKarta = false);
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
    this.getSharedKarta();
  }

  search(){
    if (this.search_text) {
      this.pageIndex = 0;
      this.getKartas();
      this.getSharedKarta();
    }
  }

  clearSearch() {
    this.search_text = "";
    this.getKartas();
    this.getSharedKarta();
  }

}
