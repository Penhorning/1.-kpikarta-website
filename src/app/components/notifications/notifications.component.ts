import { Component, OnInit } from '@angular/core';
import { CommonService } from '@app/shared/_services/common.service';
import { NotificationService } from './service/notification.service';
import * as moment from 'moment';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  notifications: any = [];
  constructor(private _commonService: CommonService, private _notification: NotificationService) { }

  ngOnInit(): void {
    this.getAllNotifications();
  }

  // Get all notifications
  getAllNotifications() {
    this._notification.getNotifications(this._commonService.getUserId()).subscribe(
      (response: any) => {
        if (response) {

          this.notifications = response;
          this.notifications.forEach((element: any) => {
            var now = new Date();;
            var then = element.createdAt;
            var diff = moment.duration(moment(then).diff(moment(now)));
           });
        
        }
      }
    );
  }
}
