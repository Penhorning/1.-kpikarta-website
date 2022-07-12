import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyProfileRoutingModule } from './my-profile-routing.module';
import { MyProfileComponent } from './my-profile.component';

// Shared module
import { SharedModule } from '@app/shared/_modules/shared.module';

// Third party module
import { ImageCropperModule } from 'ngx-image-cropper';


@NgModule({
  declarations: [
    MyProfileComponent
  ],
  imports: [
    CommonModule,
    MyProfileRoutingModule,
    SharedModule,
    ImageCropperModule
  ]
})
export class MyProfileModule { }
