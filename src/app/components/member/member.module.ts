import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemberComponent } from './member.component';
import { MemberRoutingModule } from './member-routing.module';
import { SharedModule } from '@app/shared/_modules/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    MemberComponent
  ],
  imports: [
    CommonModule,
    MemberRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class MemberModule { }
