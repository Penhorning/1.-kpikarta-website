import { Component, OnInit } from '@angular/core';
import { CommonService } from '@app/shared/_services/common.service';
import { NotificationService } from './service/notification.service';
import * as moment from 'moment';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {

  notifications: any = [];
  moment: any = moment;

  constructor(private _commonService: CommonService, private _notificationService: NotificationService) { }

  ngOnInit(): void {
    this.getAllNotifications();

    this._notificationService.updateNotificationStatus(this._commonService.getUserId()).subscribe(
      (response) => {},
      (error) => console.log(error)
    )
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
