import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { KartaService } from '../karta/service/karta.service';
import { MemberService } from '../member/service/member.service';
import { DashboardService } from './service/dashboard.service';

declare const $: any;


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  kartas: any = [];
  kartasTotal: number = 0;
  users: any = [];
  findType: string = "";
  pageLimit: number = 6;
  sharingKarta: any;
  sharedSubmitFlag: boolean = false;
  sharedKartas: any = [];
  sharedKartasTotal: number = 0;
  registeredUsers: any = [];

  loadingKartas: boolean = false;
  loadingSharedKartas: boolean = false;
  loadingSubscribers: boolean = false;
  loader: any = this._commonService.loader;
  noDataAvailable: any = this._commonService.noDataAvailable;

  changetype: boolean = false;
  changeModeType: string = "view";
  selectedUsers: any = [];
  sharingKartaCount: any = 0;
  loading: boolean = false;
  emails: any = [];

  recentKPIs: any = [];
  recentKPIsTotal: number = 0;

  constructor(
    public _commonService: CommonService,
    private _kartaService: KartaService,
    private _memberService: MemberService,
    private _dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this._commonService.getUserLicense() !== 'Spectator' && this._commonService.getUserRole() !== 'billing_staff') {
      if (this._commonService.getUserLicense() === 'Champion') {
        this.findType = "contributor";
        this.pageLimit = 8;
      }
      this.getAllKartas();
    }
    if (this._commonService.getUserRole() !== 'user') {
      this.getSubscribedUsers();
    } else this.pageLimit = 8;
    this.getAllMembers();
    this.getAllSharedKartas();
    this.getRecentKPIs();
  }

  // Navigate to create karta
  navigateToKarta() {
    this.router.navigate(['/karta/create']);
  }

  // Get Subscribed Users
  getSubscribedUsers() {
    this.loadingSubscribers = true;
    this._dashboardService.getSubscribedUsers(this._commonService.getUserId()).subscribe(
      (response: any) => {
      if (response) {
        let iconMapping = [
          "assets/img/total-creator.svg",
          "assets/img/total-champion.svg",
          "assets/img/total-spectators.svg",
        ];
        let mappedData = response.data.userDetails.map((user: any, index: number) => {
          return {
            ...user,
            icon: iconMapping[index]
          }
        });
        this.registeredUsers = mappedData;
      } else this.registeredUsers = [];
    }).add(() => this.loadingSubscribers = false );
  }

  // Get all kartas
  getAllKartas() {
    let data = {
      page: 1,
      limit: this.pageLimit,
      findBy: this._commonService.getUserId(),
      findType: this.findType
    };
    this.loadingKartas = true;
    this._kartaService.getAllKartas(data).subscribe((response: any) => {
      if (response) {
        this.kartas = response.kartas[0].data;
        this.kartasTotal = response.kartas[0].metadata[0].total;
      } else this.kartas = [];
    }).add(() => this.loadingKartas = false );
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
        this.users.forEach((element: any) => {
          element['selectedAllGroup'] = 'selectedAllGroup';
        })
    });
  }

  // Get shared kartas
  getAllSharedKartas() {
    let data = {
      page: 1,
      limit: this.pageLimit,
      findBy: this._commonService.getEmailId(),
      type: "shared"
    };
    this.loadingSharedKartas = true;
    this._kartaService.getAllKartas(data).subscribe((response: any) => {
      if (response.kartas[0].data.length > 0) {
        response.kartas[0].data = response.kartas[0].data.map((item: any) => {
          item.accessType = item.sharedTo.find((item: any) => item.email === this._commonService.getSession().email).accessType;
          return item;
        });
        this.sharedKartas = response.kartas[0].data;
        this.sharedKartasTotal = response.kartas[0].metadata[0].total;
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
          this.getAllKartas();
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
  //         this.getAllSharedKartas();
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

  // On select user while sharing
  onSelectUser() {
    this.changetype = false;
    let emailObject: any = {};
    
    for (let i=0; i<this.users.length; i++) {
      emailObject[this.users[i].email] = this.users[i].email;
    }
    for (let j=0; j<this.selectedUsers.length; j++) {
      if (!emailObject[this.selectedUsers[j].email]) {
        this.changetype = true;
        this.changeModeType = "view";
      }
    }
  }

  // Enable edit option
  enableEditOption() {
    this.changetype = false;
  }

  shareKarta() {
    if(this.selectedUsers.length === 0){
      this._commonService.errorToaster('Please select the users!');
    }else if(this.selectedUsers.length === 1 && this.selectedUsers[0].email == this._commonService.getEmailId()){
      this._commonService.warningToaster("You can not share karta to yourself!");
   } else {
     this.emails = this.selectedUsers.filter((item:any)=> item.email !== this._commonService.getEmailId()).map((el:any)=> el.email)
      if (this.emails.length > 0) {
        let data = {
          karta: this.sharingKarta,
          emails: this.emails,
          accessType: this.changeModeType
        }
        this.sharedSubmitFlag = true;
  
        this._kartaService.shareKarta(data).subscribe(
          (response: any) => {
            this._commonService.successToaster("You have shared Karta successfully!");
            $('#shareKartaModal').modal('hide');
            this.getAllKartas();
            this.getAllSharedKartas();
          },
          (error: any) => { }
        ).add(() => this.sharedSubmitFlag = false);
      }
    }
  }

  // Copy karta
  copyKarta(id: string) {
    const result = confirm("Are you sure you want to create a copy of this karta?");
    if (result) {
      this._kartaService.copyKarta({ kartaId: id, userId: this._commonService.getUserId() }).subscribe(
        (response: any) => {
          this._commonService.successToaster('Karta copy created successfully!');
          this.getAllKartas();
        });
    }
  }

  // Rename karta
  changeEditStatus(id: number) {
    $('#kt' + id).attr('contenteditable', true);
    $('#kt' + id).focus();
    $('#kt' + id).removeClass("short_text");
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
    let value = document.getElementById('kt' + index)?.innerText.trim();
    if (value?.length == 0) {
      return this._commonService.errorToaster('Karta name should not be blank!');
    }
    this._kartaService.updateKarta(id, { name: value }).subscribe(
      (x) => {
        if (x) {
          $('#kt' + index).attr('contenteditable', false);
          this.getAllKartas();
          this._commonService.successToaster('Karta name updated successfully!');
          // $('#kt' + id).addClass("short_text");
        }
      },
      (err) => {
        console.log(err);
        this._commonService.errorToaster('Error while updating name!');
      }
    );
  }

  // Change chart mode
  changeMode(e: any) {
    if (e.target.value === "edit") this.changeModeType = e.target.value;
    else this.changeModeType = e.target.value;
  }

  // Get recent kpis
  getRecentKPIs() {
    let data = {
      limit: 3,
      kpiType: "assigned",
      userId: this._commonService.getUserId()
    }
    this._dashboardService.getMyKPIs(data).subscribe(
      (response: any) => {
        this.recentKPIs = response.kpi_nodes[0].data;
        this.recentKPIsTotal = response.kpi_nodes[0].metadata[0].total;
      }
    );
  }
   
}
