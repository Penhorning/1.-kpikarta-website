import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.scss']
})
export class ThankYouComponent implements OnInit {

  constructor(private _commonService: CommonService, private router: Router) {
    if (!this._commonService.getUserId()) this.router.navigate(['/login']);
  }

  ngOnInit(): void {
  }

}
