import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyProfileRoutingModule } from './my-profile-routing.module';
import { MyProfileComponent } from './my-profile.component';

// Shared module
import { SharedModule } from '@app/shared/_modules/shared.module';


@NgModule({
  declarations: [
    MyProfileComponent
  ],
  imports: [
    CommonModule,
    MyProfileRoutingModule,
    SharedModule
  ]
})
export class MyProfileModule { }
