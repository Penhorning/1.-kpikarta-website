import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketplaceRoutingModule } from './marketplace-routing.module';
import { MarketplaceComponent } from './marketplace.component';

// Shared module
import { SharedModule } from '@app/shared/_modules/shared.module';

// Third party module
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';


@NgModule({
  declarations: [
    MarketplaceComponent
  ],
  imports: [
    CommonModule,
    MarketplaceRoutingModule,
    SharedModule,
    NgMultiSelectDropDownModule.forRoot()
  ]
})
export class MarketplaceModule { }
