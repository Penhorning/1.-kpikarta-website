import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificationComponent } from './notification.component';

const routes: Routes = [
  { path: '', component: NotificationComponent, data: { title: "Notification - KPI Karta" }}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationRoutingModule { }
