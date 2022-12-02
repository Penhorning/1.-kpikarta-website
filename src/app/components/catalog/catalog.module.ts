import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CatalogRoutingModule } from './catalog-routing.module';
import { CatalogComponent } from './catalog.component';

// Shared module
import { SharedModule } from '@app/shared/_modules/shared.module';

// Third party module
// import { NgSelectModule } from '@ng-select/ng-select';
// import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';


@NgModule({
  declarations: [
    CatalogComponent
  ],
  imports: [
    CommonModule,
    CatalogRoutingModule,
    SharedModule,
    // NgSelectModule,
    // NgOptionHighlightModule,
    NgMultiSelectDropDownModule.forRoot()
  ]
})
export class CatalogModule { }
