import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { HeaderComponent } from "@app/layout/header/header.component";
import { SidebarComponent } from "@app/layout/sidebar/sidebar.component";
import { FooterComponent } from "@app/layout/footer/footer.component";

import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";

// County code phone number module
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';

const modules: any = [
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgxIntlTelInputModule
]

@NgModule({
    declarations: [
        HeaderComponent,
        SidebarComponent,
        FooterComponent
    ],
    imports: modules.concat(CommonModule, RouterModule),
    exports: modules.concat(HeaderComponent, SidebarComponent, FooterComponent)
})
export class SharedModule { }