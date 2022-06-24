import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SignUpRoutingModule } from './sign-up-routing.module';
import { SignUpComponent } from './sign-up.component';

// Shared module
import { SharedModule } from '@app/shared/_modules/shared.module';
import { VerificationComponent } from './verification/verification.component';


@NgModule({
  declarations: [
    SignUpComponent,
    VerificationComponent
  ],
  imports: [
    CommonModule,
    SignUpRoutingModule,
    SharedModule
  ]
})
export class SignUpModule { }
