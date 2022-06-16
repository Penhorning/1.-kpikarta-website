import { Component, OnInit } from '@angular/core';
import { CommonService } from '@app/shared/_services/common.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(public _commonService: CommonService) { }

  ngOnInit(): void {
  }

  logout() {
    this._commonService.deleteSession();
  }

}
