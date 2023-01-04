import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { forkJoin } from 'rxjs';
import { BillingService } from './services/billing.service';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnInit {

  user: any;
  userId: string = this._commonService.getUserId();
  noDataAvailable: any = this._commonService.noDataAvailable;
  cards: any = [];
  overview: any;
  invoices: any;

  constructor(private _commonService: CommonService, private router: Router, private _billingService: BillingService) { }

  ngOnInit(): void {
    this._commonService.getUserInfo().subscribe(
      (response: any) => {
        this.user = response;
        if (this.user.roles[0].name !== 'company_admin' && this.user.roles[0].name !== 'billing_staff') {
          this.router.navigate(['/dashboard']);
        } else {
          // this.getAllMembers();
          // this.getRoles();
          // this.getDepartments();
          // this.getLicenses();
        }
      }
    );

    this._billingService.getCards(this.userId).subscribe(
      (response) => {
        if (response.data && response.data.data.length > 0) {
          this.cards = response.data.data;
        }
      },
      (err) => {
        console.log(err);
      }
    );

    this._billingService.getSubscribedUsers(this.userId).subscribe(
      (response) => {
        this.overview = response.data.data;
      },
      (err) => {
        console.log(err);
      }
    )

    this._billingService.getInvoices(this.userId).subscribe(
      (response) => {
        console.log(response.data);
        this.invoices = response.data;
      },
      (err) => {
        console.log(err);
      }
    )
  }

}
