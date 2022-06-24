import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MySuggestionRoutingModule } from './my-suggestion-routing.module';
import { MySuggestionComponent } from './my-suggestion.component';

// Shared module
import { SharedModule } from '@app/shared/_modules/shared.module';


@NgModule({
  declarations: [
    MySuggestionComponent
  ],
  imports: [
    CommonModule,
    MySuggestionRoutingModule,
    SharedModule
  ]
})
export class MySuggestionModule { }
