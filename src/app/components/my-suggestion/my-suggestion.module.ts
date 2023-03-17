import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MySuggestionRoutingModule } from './my-suggestion-routing.module';
import { MySuggestionComponent } from './my-suggestion.component';

// Shared module
import { SharedModule } from '@app/shared/_modules/shared.module';
import { CKEditorModule } from 'ngx-ckeditor';


@NgModule({
  declarations: [
    MySuggestionComponent
  ],
  imports: [
    CommonModule,
    MySuggestionRoutingModule,
    SharedModule,
    CKEditorModule
  ]
})
export class MySuggestionModule { }
