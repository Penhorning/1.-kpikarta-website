import { Component, HostListener, OnInit } from '@angular/core';
import { NotificationService } from '@app/components/notification/service/notification.service';
import { CommonService } from '@app/shared/_services/common.service';
import { interval } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  scrolled: boolean = false;
  newNotifications: boolean = false;

  @HostListener("window:scroll", [])
  onWindowScroll() {
      this.scrolled = window.scrollY > 0;
  }
 
  constructor(public _commonService: CommonService, public _notificationService: NotificationService) { }

  ngOnInit(): void {
    interval(10000).subscribe(() => {
      this._notificationService.getUnreadNotifications(this._commonService.getUserId()).subscribe(
        (response: any) => {
          if( response.length > 0 ) {
            this.newNotifications = true;
          } else {
            this.newNotifications = false;
          }
        },
        (err) => {
          console.error(err);
        }
      );
    });
  }

  logout() {
    this._commonService.logout().subscribe(
      (response: any) => { },
      (error: any) => { }
    ).add(() => this._commonService.deleteSession() );
  }

}
