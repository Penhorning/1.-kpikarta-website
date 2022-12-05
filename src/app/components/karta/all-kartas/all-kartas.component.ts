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
  kartaType: string = "owned";

  // Share var
  sharingKarta: any;
  shareSubmitFlag: boolean = false;
  selectedUsers: any = [];
  sharingKartaCount: any = 0;
  emails: any = [];
  // Page var
  pageIndex: number = 0;
  pageSize: number = 8;
  totalKartas: number = 0;
  search_text: string = "";
  // Loding var
  loading: boolean = false;
  loader: any = this._commonService.loader;
  noDataAvailable: any = this._commonService.noDataAvailable;


  constructor(
    private _kartaService: KartaService,
    private _commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.getAllKartas();
    this.getAllMembers();

    this.route.fragment.subscribe(f => {
      if (f === "tabs-2") $("#shared_tab").click();
    });
  }

  // Navigate to create karta
  navigateToKarta() {
    this.router.navigate(['/karta/create']);
  }

  // Get all kartas
  getAllKartas() {
    let data = {
      page: this.pageIndex + 1,
      limit: this.pageSize,
      findBy: this.kartaType === 'owned' ? this._commonService.getUserId() : this._commonService.getEmailId(),
      searchQuery: this.search_text,
      type: this.kartaType
    }
    this.loading = true;
    this._kartaService.getAllKartas(data).subscribe(
      (response: any) => {
        this.kartas = response.kartas[0].data;
        if (response.kartas[0].metadata.length > 0) {
          this.totalKartas = response.kartas[0].metadata[0].total; 
        } else this.totalKartas = 0;
      }
    ).add(() => this.loading = false);
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
          this.getAllKartas();
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
        this.getAllKartas();
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
          this.getAllKartas();
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
      findBy: this.kartaType === 'owned' ? this._commonService.getUserId() : this._commonService.getEmailId()
    }
    this.loading = true;
    this._kartaService.getAllKartas(data).subscribe(
      (response: any) => {
        if (response) {
          this.kartas.push(...response.kartas[0].data);
          if (response.kartas[0].metadata.length > 0) {
            this.totalKartas = response.kartas[0].metadata[0].total; 
          } else this.totalKartas = 0;
        }
      }
    ).add(() => this.loading = false);
  }

  // Tab switch
  onTabSwitch(type: string) {
    this.pageIndex = 0;
    this.search_text = "";
    this.kartas = [];
    this.kartaType = type;
    this.getAllKartas();
  }

  search() {
    if (this.search_text) {
      this.pageIndex = 0;
      this.getAllKartas();
    }
  }
  clearSearch() {
    this.search_text = "";
    this.getAllKartas();
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
    if (value?.length == 0) {
      this.ngOnInit();
      return  this._commonService.errorToaster('Karta name should not be blank!');
    }
    this._kartaService.updateKarta(id, { name: value }).subscribe(
      (response: any) => {
        $('#kt' + index).attr('contenteditable', false);
        this.ngOnInit();
        this._commonService.successToaster('Karta name updated successfully!');
      }
    );
  }

}
