import { Component, OnInit } from '@angular/core';
import { CommonService } from '@app/shared/_services/common.service';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  constructor(public _commonService: CommonService) { }

  ngOnInit(): void {
  }

}
