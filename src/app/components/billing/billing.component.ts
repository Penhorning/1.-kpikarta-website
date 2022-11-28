import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnInit {

  user: any;

  constructor(private _commonService: CommonService, private router: Router) { }

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
  }

}
