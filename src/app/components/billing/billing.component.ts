import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { SignupService } from '../sign-up/service/signup.service';
import { BillingService } from './services/billing.service';

declare const $: any;

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnInit {

  user: any;
  userId: string = this._commonService.getUserId();
  companyId: string = this._commonService.getCompanyId();
  noDataAvailable: any = this._commonService.noDataAvailable;
  cards: any = [];
  overview: any;
  invoices: any = [];
  submitted: boolean = false;
  submitFlag: boolean = false;
  cardForm: FormGroup | any;
  loadingOverview: boolean = false;
  loader: any = this._commonService.loader;
  disableCancelBtn: boolean = false;

  constructor(public _commonService: CommonService, private router: Router, private _billingService: BillingService, private fb: FormBuilder, private _signupService: SignupService,) { }

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

    this.getCardDetails();
    this.getSubscribedUsersDetail();
    this.getInvoicesDetails();
  }

  get form() { return this.cardForm.controls; }

  getCardDetails() {
    this._billingService.getCards(this.companyId).subscribe(
      (response) => {
        if (response.data) {
          this.cards = [response.data];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getSubscribedUsersDetail() {
    this.loadingOverview = true;
    this._billingService.getSubscribedUsers(this.companyId).subscribe(
      (response) => {
        this.overview = response.data.data;
        this.loadingOverview = false;
      },
      (err) => {
        console.log(err);
        this.loadingOverview = false;
      }
    )
  }

  getInvoicesDetails() {
    this._billingService.getInvoices(this.companyId).subscribe(
      (response) => {
        if (response.data.data && response.data.data.length > 0) {
          this.invoices = response.data.data;
        }
      },
      (err) => {
        console.log(err);
      }
    )
  }

  cancelTrial() {
    const message = "Are you sure you want to cancel your trial period?";
      this.confirmBox(message, () => {
        this.disableCancelBtn = true;
        this._billingService.cancelTrial(this._commonService.getUserId()).subscribe(response => {
          if(response) {
            this._commonService.logout().subscribe(
              (response: any) => {
                this._commonService.successToaster("Trial cancelled successfully..!!");
              },
              (error: any) => { }
            ).add(() => this._commonService.deleteSession() );
          }
        })
      },
      () => { });
  }

}
