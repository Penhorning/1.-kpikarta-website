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
  moment: any = moment;

  constructor(private _commonService: CommonService, private _notificationService: NotificationService) { }

  ngOnInit(): void {
    this.getAllNotifications();
  }

  // Get all notifications
  getAllNotifications() {
    let data = {
      page : 1,
      limit: 10,
      userId: this._commonService.getUserId()
    }
    this._notificationService.getNotifications(data).subscribe(
      (response: any) => {
        this.notifications = response.notifications[0].data;
      }
    );
  }
}
