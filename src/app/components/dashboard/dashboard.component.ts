import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { KartaService } from '../karta/service/karta.service';

declare const $: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  kartas: any = [];
  users: any = [];
  sharingKarta: any;
  sharedSubmitFlag: boolean = false;
  sharedKartas: any = [];

  selectedUsers: any = [];
  sharingKartaCount: any = 0;
  loading = false;
  emails: any = [];

  constructor(
    private _commonService: CommonService,
    private _kartaService: KartaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getKartas();
    this.getAllUser();
    this.getSharedKarta();
  }

  // Navigate to create karta
  navigateToKarta() {
    this.router.navigate(['/karta/create-karta']);
  }

  // Get all kartas
  getKartas() {
    this._kartaService.getKartas(this._commonService.getUserId()).subscribe(
      (response: any) => {
        if (response) {
          this.kartas = response;
     console.log("this.kartas", this.kartas)

        } else {
          this.kartas = [];
        }
      }
    );
  }

  getSharedKarta(){
 let data = {
  page : 1,
  limit: 10,
  email: this._commonService.getEmailId()
 }
 console.log("data", data)
    this._kartaService.getSharedKarta(data).subscribe(
      (response: any) => {
        if(response){
     this.sharedKartas = response.kartas[0].data;
     console.log("sharedKartas", this.sharedKartas)

        } else {
          this.sharedKartas = [];
        }
      }
    );
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
      this._kartaService.deleteKarta({kartaId: id}).subscribe(
        (response: any) => {
          this._commonService.successToaster("Karta deleted successfully");
          this.getKartas();
        }
      );
    }
  }

    // Delete shared karta
    deleteSharedKarta(_id: any) {
      const result = confirm("Are you sure you want to delete this shared karta?");
      if (result) {
        this._kartaService.deleteSharedKarta({kartaId:_id}).subscribe(
          (response: any) => {
            this._commonService.successToaster("Karta deleted successfully");
            this.getSharedKarta();
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
      this.emails.push(element.email)
    });
    let data = {
      karta: this.sharingKarta,
      emails: this.emails
    }
    this.sharedSubmitFlag = true;
    this._kartaService.sharedEmails(data).subscribe(
      (response: any) => {
        this._commonService.successToaster("Your have shared karta successfully");
        $('#shareLinkModal').modal('hide');
        this.getKartas();
      },
      (error: any) => { }
    ).add(() => this.sharedSubmitFlag = false);
  }

  // Get all users 
  getAllUser() {
    this._kartaService.getAllUsers().subscribe(
      (response: any) => {
        if (response) {
          this.users = response.users[0].data;
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
      // Callback function
      setTimeout(() => {
        resolve({ email: e });
        this.loading = false;
      }, 1000);
    })
  }

}
