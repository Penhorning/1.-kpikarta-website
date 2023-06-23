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
  findType: string = "";

  // Share var
  sharingKarta: any;
  shareSubmitFlag: boolean = false;
  selectedUsers: any = [];
  sharingKartaCount: any = 0;
  emails: any = [];
  // Share page var
  sharedKartas: any = [];
  sharedPageIndex: number = 1;
  sharedPageSize: number = 8;
  sharedTotalKartas: number = 0;
  // Page var
  pageIndex: number = 1;
  pageSize: number = 8;
  totalKartas: number = 0;
  search_text: string = "";
  // Loding var
  loading: boolean = false;
  changetype: boolean = false;
  loader: any = this._commonService.loader;
  noDataAvailable: any = this._commonService.noDataAvailable;

  changeModeType: string = "view";

  constructor(
    private _kartaService: KartaService,
    public _commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  // Confirm box
  confirmBox(message: string, yesCallback: any, noCallback: any) {
    $("#confirm_message").text(message);
    $("#confirmModal").modal('show');
    $('#btnYes').unbind('click');
    $('#btnYes').click(function() {
      $("#confirmModal").modal('hide');
      yesCallback();
    });
    $('#btnNo').unbind('click');
    $('#btnNo').click(function() {
      $("#confirmModal").modal('hide');
      noCallback();
    });
  }

  ngOnInit(): void {
    if (this._commonService.getUserLicense() === 'Creator' && this._commonService.getUserRole() !== 'billing_staff') {
      if (this._commonService.getUserLicense() === 'Champion') this.findType = "contributor";
      this.getAllKartas();
      this.getAllMembers();
    } else {
      this.clickTab2();
      this.onTabSwitchShared();
    }

    this.route.fragment.subscribe(f => {
      if (f === "tabs-2") this.clickTab2();
    });
  }

  // Tab 2 clicked
  clickTab2() {
    setTimeout(() => {
      $("#tab_1 a").removeClass("active");
    }, 100);
    $("#tab_2").click();
    $("#tab_2 a").click();
  }
  // Navigate to create karta
  navigateToKarta() {
    this.router.navigate(['/karta/create']);
  }

  // Get all kartas
  getAllKartas() {
    let data = {
      page: 1,
      limit: this.pageSize,
      findBy: this._commonService.getUserId(),
      searchQuery: this.search_text,
      type: this.kartaType,
      findType: this.findType
    }

    this.loading = true;
    this.kartas = [];
    this.pageIndex = 1;

    this._kartaService.getAllKartas(data).subscribe(
      (response: any) => {
        if (response.kartas[0].data.length > 0) {
          this.kartas = response.kartas[0].data;
          this.totalKartas = response.kartas[0].metadata[0].total;
        } else this.totalKartas = 0;
      }
    ).add(() => this.loading = false);
  }

  // Get all shared kartas
  getAllSharedKartas() {
    let data = {
      page: 1,
      limit: this.sharedPageSize,
      findBy: this._commonService.getEmailId(),
      searchQuery: this.search_text,
      type: this.kartaType
    }

    this.loading = true;
    this.sharedKartas = [];
    this.sharedPageIndex = 1;

    this._kartaService.getAllKartas(data).subscribe(
      (response: any) => {
        if (response.kartas[0].data.length > 0) {
          response.kartas[0].data = response.kartas[0].data.map((item: any) => {
            let accessType = item.sharedTo.find((item: any) => item.email === this._commonService.getSession().email).accessType;
            if (accessType === 'edit' && (this._commonService.getUserLicense() === 'Spectator' || this._commonService.getUserLicense() === 'Champion')) item.accessType = 'view';
            else item.accessType = accessType;
            return item;
          });
          this.sharedKartas = response.kartas[0].data;
          this.sharedTotalKartas = response.kartas[0].metadata[0].total;
        } else this.sharedTotalKartas = 0;
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
    const message = "Are you sure you want to delete this karta?";
    this.confirmBox(message, () => {
      this._kartaService.deleteKarta({ kartaId: id, userId: this._commonService.getUserId() }).subscribe(
        (response: any) => {
          this._commonService.successToaster("Karta deleted successfully!");
          this.getAllKartas();
        }
      );
    },
    () => { });
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
    if(this.selectedUsers.length === 0){
      this._commonService.errorToaster('Please select the users!');
    }else if(this.selectedUsers.length === 1 && this.selectedUsers[0].email == this._commonService.getEmailId()){
          this._commonService.warningToaster("You can not share Karta to yourself!");
    } else {
      this.emails = this.selectedUsers.filter((item:any)=> item.email !== this._commonService.getEmailId()).map((el:any)=> el.email)
      if (this.emails.length > 0) {
      let data = {
        kartaId: this.sharingKarta._id,
        emails: this.emails,
        accessType: this.changeModeType
      }
      this.shareSubmitFlag = true;
      this._kartaService.shareKarta(data).subscribe(
        (response: any) => {
          this._commonService.successToaster("Your have shared Karta successfully!");
          $('#shareLinkModal').modal('hide');
          this.getAllKartas();
          this.changetype = false;
        },
        (error: any) => { }
      ).add(() => this.shareSubmitFlag = false);
      }
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
        this.members.forEach((element: any) => {
          element['selectedAllGroup'] = 'selectedAllGroup';
        })
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

  // On select user while sharing
  onSelectUser() {
    this.changetype = false;
    let emailObject: any = {};
    for (let i=0; i<this.members.length; i++) {
      emailObject[this.members[i].email] = this.members[i].email;
    }
    for (let j=0; j<this.selectedUsers.length; j++) {
      if (!emailObject[this.selectedUsers[j].email]) {
        this.changetype = true;
        this.changeModeType = "view";
      }
    }
  }
  // Enable edit option
  enableEditOption(){
    this.changetype = false;
  }

  // Copy karta
  copyKarta(id: string) {
    const message = "Are you sure you want to create a copy of this karta?";
    this.confirmBox(message, () => {
      this._kartaService.copyKarta({ kartaId: id, userId: this._commonService.getUserId() }).subscribe(
        (response: any) => {
          this._commonService.successToaster("Karta copy created successfully!");
          this.getAllKartas();
        }
      );
    },
    () => { });
  }

  // View more
  viewMore() {
    let data = {
      page: ++this.pageIndex,
      limit: this.pageSize,
      type: this.kartaType,
      searchQuery: this.search_text,
      findBy: this._commonService.getUserId()
    }

    this.loading = true;
    this._kartaService.getAllKartas(data).subscribe(
      (response: any) => {
        if (response.kartas[0].data.length > 0) {
          this.kartas.push(...response.kartas[0].data);
          this.totalKartas = response.kartas[0].metadata[0].total;
        } else this.totalKartas = 0;
      }
    ).add(() => this.loading = false);
  }

  // Shared view more
  sharedViewMore() {
    let data = {
      page: ++this.sharedPageIndex,
      limit: this.sharedPageSize,
      type: this.kartaType,
      findBy: this._commonService.getEmailId()
    }
    
    this.loading = true;
    this._kartaService.getAllKartas(data).subscribe(
      (response: any) => {
        if (response.kartas[0].data.length > 0) {
          response.kartas[0].data = response.kartas[0].data.map((item: any) => {
            item.accessType = item.sharedTo.find((item: any) => item.email === this._commonService.getSession().email).accessType;
            return item;
          });
          this.sharedKartas.push(...response.kartas[0].data);
          this.sharedTotalKartas = response.kartas[0].metadata[0].total;
        } else this.sharedTotalKartas = 0;
      }
    ).add(() => this.loading = false);
  }

  // Tab switch
  onTabSwitch() {
    this.kartaType = "owned";
    this.search_text = "";
    this.getAllKartas();
  }
  // Tab switch shared
  onTabSwitchShared() {
    this.kartaType = "shared";
    this.search_text = "";
    this.getAllSharedKartas();
  }

  // Search
  timeout = null;
  search() {
    if (this.timeout) {  
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      if (this.kartaType === "owned") this.getAllKartas();
      else if (this.kartaType === "shared") this.getAllSharedKartas();
    }, 1000);
  }
  clearSearch() {
    this.search_text = "";
    if (this.kartaType === "owned") this.getAllKartas();
    else if (this.kartaType === "shared") this.getAllSharedKartas();
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
      (response: any) => {
        $('#kt' + index).attr('contenteditable', false);
        this.ngOnInit();
        this._commonService.successToaster('Karta name updated successfully!');
      }
    );
  }

    // Change chart mode
    changeMode(e: any) {
      if (e.target.value === "edit") this.changeModeType = e.target.value;
      else this.changeModeType = e.target.value;
    }

}
