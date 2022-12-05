import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketplaceRoutingModule } from './marketplace-routing.module';
import { MarketplaceComponent } from './marketplace.component';

// Shared module
import { SharedModule } from '@app/shared/_modules/shared.module';


@NgModule({
  declarations: [
    MarketplaceComponent
  ],
  imports: [
    CommonModule,
    MarketplaceRoutingModule,
    SharedModule
  ]
})
export class MarketplaceModule { }
