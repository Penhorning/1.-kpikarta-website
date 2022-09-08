import { Component, HostListener, OnInit } from '@angular/core';
import { CommonService } from '@app/shared/_services/common.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  scrolled: boolean = false;

  // name: string = this._commonService.getSession().name;
  // token: string = this._commonService.getSession().token;
  // profilePic: string = this._commonService.getSession().profilePic;


  @HostListener("window:scroll", [])
  onWindowScroll() {
      this.scrolled = window.scrollY > 0;
  }

  constructor(public _commonService: CommonService) { }

  ngOnInit(): void {
  }

  logout() {
    this._commonService.logout().subscribe(
      (response: any) => {
        this._commonService.deleteSession();
      },
      (error: any) => {
        this._commonService.deleteSession();
      }
    );
  }

}
