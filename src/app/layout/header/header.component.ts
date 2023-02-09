import { Component, HostListener, OnInit } from '@angular/core';
import { CommonService } from '@app/shared/_services/common.service';

declare const $: any

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

  openNav() {
    $("#mySidebar").css("width", "120px");
    $("#main").css("margin-left", "110px");
  }

}
