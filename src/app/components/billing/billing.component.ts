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
    this.cardForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.blank_space)]], // Validtion for blank space
      cardNumber: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.blank_space), Validators.minLength(14), Validators.maxLength(16), this.numberValidation]], // Validtion for blank space
      expirationDate: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.blank_space), this.expirationDateValidation ]], // Validtion for blank space
      cvc: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.blank_space), Validators.minLength(3), Validators.maxLength(4), this.numberValidation]], // Validtion for blank space
    });

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

  expirationDateValidation( control: AbstractControl ): { [key:string] : boolean } | null {
    if(control.value) {
      let splitValue = control.value.trim().split('/');
      let month = splitValue[0] ? splitValue[0] : "";
      let year = splitValue[1] ? splitValue[1] : "";
      
      if ( month.toString().length != 2 || year.toString().length != 4 ) {
        return { 'expiration' : true };
      }
      else {
        if( isNaN(month) || isNaN(year) ) {
          return { 'expiration' : true };
        }
        else {
          return null;
        }
      }
    }
    else {
      return null;
    }
  }

  numberValidation( control: AbstractControl ): { [key:string] : boolean } | null {
    if(control.value) {
      return isNaN(control.value) ? { 'numerror' : true } : null;
    } else {
      return null;
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.cardForm.valid) {
      let userId = this._commonService.getUserId();
      let requestObj = {
        userId,
        ...this.cardForm.value
      };

      const message = "Are you sure you want to replace your previous card?";
      this.confirmBox(message, () => {
        this.submitFlag = true;
        this._signupService.saveCard(requestObj).subscribe(
          (response: any) => {
            this._commonService.successToaster("Card saved successfully..!!");
            this.getCardDetails();
            this.resetFormModal();
            this.submitFlag = false;
          },
          (err) => {
            console.log(err);
            this.submitFlag = false;
          }
        );
      },
      () => { });
    }
  }

  // Clear modal validation when close
  resetFormModal() {
    this.cardForm.reset();
    this.submitted = false;
    $('#cardModal').modal('hide');
  }

  addslash(event: any) {
    if( event.code == "Backspace" && event.target.value.length == 2 ) {
      let value = event.target.value.split("")[0];
      this.cardForm.patchValue({
        expirationDate: value
      });
    }
    
    if(event.target.value.length == 2) {
      let value = event.target.value + "/";
      this.cardForm.patchValue({
        expirationDate: value
      });
    }
  }

}
