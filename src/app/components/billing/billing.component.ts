import { Component, OnInit } from '@angular/core';
import { CommonService } from '@app/shared/_services/common.service';
import { BillingService } from './services/billing.service';
import { environment } from '@environments/environment';

declare const $: any;

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnInit {

  userId: string = this._commonService.getUserId();
  noDataAvailable: any = this._commonService.noDataAvailable;
  chargebeePortalUrl: string = `${environment.API_URL}/api/subscriptions/get-portal?access_token=${this._commonService.getSession().token}`;
  overview: any;
  loadingOverview: boolean = false;
  loader: any = this._commonService.loader;
  disableCancelBtn: boolean = false;

  userType: string | undefined;

  constructor(public _commonService: CommonService, private _billingService: BillingService) { }

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
    this.getSubscribedUsersDetail();
    this.getSignUpSession();

    let session = this.getSignUpSession();  // This retrieves the session data
    this.userType = session?.userType;   // Add userType to the formData
  }
  getSignUpSession() {
    return JSON.parse(window.sessionStorage.getItem("kpi-karta-signup-session") || "{}");
  }

  // Get all subscribed users detail
  getSubscribedUsersDetail() {
    let session = this.getSignUpSession();  // This retrieves the session data
    let userType = session?.userType;   // Add userType to the formData
    console.log("userType->",userType)
    this.loadingOverview = true;
    this._billingService.getSubscribedUsers(
      {
        companyId: this._commonService.getCompanyId(),
        userType: userType
      }
    ).subscribe(
      (response: any) => {
        console.log("response-",response)
        this.overview = response.users;
        this.loadingOverview = false;
      },
      (error: any) => {
        console.log(error);
        this.loadingOverview = false;
      }
    )
  }

  // Cancel subscription
  cancelSubscription() {
    const message = "Are you sure you want to cancel your subscription?";
      this.confirmBox(message, () => {
        this.disableCancelBtn = true;
        this._billingService.cancelSubscription(this._commonService.getUserId()).subscribe(
          (response: any) => {
            this._commonService.logout().subscribe(
              (response: any) => {
                this._commonService.successToaster("Subscription cancelled successfully!");
              },
              (error: any) => { }
            ).add(() => this._commonService.deleteSession() );
        })
      },
      () => { });
  }

}
