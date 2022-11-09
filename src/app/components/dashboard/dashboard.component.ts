import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { KartaService } from '../karta/service/karta.service';
import { MemberService } from '../member/service/member.service';


declare const $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  kartas: any = [];
  users: any = [];
  sharingKarta: any;
  sharedSubmitFlag: boolean = false;
  sharedKartas: any = [];

  loadingKartas: boolean = false;
  loadingSharedKartas: boolean = false;
  loader: any = this._commonService.loader;
  noDataAvailable: any = this._commonService.noDataAvailable;
  selectedUsers: any = [];
  sharingKartaCount: any = 0;
  loading: boolean = false;
  emails: any = [];

  constructor(
    private _commonService: CommonService,
    private _kartaService: KartaService,
    private _memberService: MemberService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getKartas();
    this.getAllMembers();
    this.getSharedKartas();
  }

  // Navigate to create karta
  navigateToKarta() {
    this.router.navigate(['/karta/create-karta']);
  }

  // Get all kartas
  getKartas() {
    let data = {
      page: 1,
      limit: 3,
      userId: this._commonService.getUserId(),
    };
    this.loadingKartas = true;
    this._kartaService.getKartas(data).subscribe((response: any) => {
      if (response) {
        this.kartas = response.kartas[0].data;
      } else this.kartas = [];
    }).add(() => this.loadingKartas = false );;
  }

  // Get all members
  getAllMembers() {
    let data = {
      limit: 1000,
      userId: this._commonService.getUserId()
    }
    this._memberService.getAllMembers(data).subscribe(
      (response: any) => {
        this.users = response.members[0].data;
    });
  }

  // Get shared kartas
  getSharedKartas() {
    let data = {
      page: 1,
      limit: 6,
      email: this._commonService.getEmailId(),
    };
    this.loadingSharedKartas = true;
    this._kartaService.getSharedKartas(data).subscribe((response: any) => {
      if (response) {
        this.sharedKartas = response.kartas[0].data;
      } else this.sharedKartas = [];
    }).add(() => this.loadingSharedKartas = false );
  }

  // Update karta
  updateKarta(type: string, id: string, index: number) {
    this._kartaService.updateKarta(id, { type }).subscribe((response: any) => {
      this.kartas[index].type = type;
    });
  }

  // Delete karta
  deleteKarta(id: string) {
    const result = confirm('Are you sure you want to delete this karta?');
    if (result) {
      this._kartaService.deleteKarta({ kartaId: id }).subscribe(
        (response: any) => {
          this._commonService.successToaster("Karta deleted successfully!");
          this.getKartas();
        });
    }
  }

  // Delete shared karta
  // deleteSharedKarta(_id: any) {
  //   const result = confirm("Are you sure you want to delete this shared karta?");
  //   if (result) {
  //     this._kartaService.deleteSharedKarta({kartaId:_id}).subscribe(
  //       (response: any) => {
  //         this._commonService.successToaster("Karta deleted successfully");
  //         this.getSharedKartas();
  //       }
  //     );
  //   }
  // }

  // Sharing karta
  onShare(param: any) {    
    this.selectedUsers = [];
    this.emails = [];
    this.sharingKarta = param;
    if (param.sharedTo) this.sharingKartaCount = param.sharedTo.length;
    else this.sharingKartaCount = 0;
  }
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
  shareKarta() {
    this.selectedUsers.forEach((element: any) => {
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
      this.sharedSubmitFlag = true;

      this._kartaService.shareKarta(data).subscribe(
        (response: any) => {
          this._commonService.successToaster("You have shared Karta successfully!");
          $('#shareLinkModal').modal('hide');
          this.getKartas();
          this.getSharedKartas();
        },
        (error: any) => { }
      ).add(() => this.sharedSubmitFlag = false);
    }
  }

  // Copy karta
  copyKarta(id: string) {
    const result = confirm("Are you sure you want to create a copy of this karta?");
    if (result) {
      this._kartaService.copyKarta({ kartaId: id, userId: this._commonService.getUserId() }).subscribe(
        (response: any) => {
          this._commonService.successToaster('Karta copy created successfully!');
          this.getKartas();
        });
    }
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
