import { Component, HostListener, OnInit } from '@angular/core';
import { CommonService } from '@app/shared/_services/common.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  scrolled: boolean = false;

  @HostListener("window:scroll", [])
  onWindowScroll() {
      this.scrolled = window.scrollY > 0;
  }
 
  constructor(public _commonService: CommonService) { }

  ngOnInit(): void {
  }

  logout() {
    this._commonService.logout().subscribe(
      (response: any) => { },
      (error: any) => { }
    ).add(() => this._commonService.deleteSession() );
  }

}
