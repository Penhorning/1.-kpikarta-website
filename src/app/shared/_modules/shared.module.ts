import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { HeaderComponent } from "@app/layout/header/header.component";
import { SidebarComponent } from "@app/layout/sidebar/sidebar.component";
import { FooterComponent } from "@app/layout/footer/footer.component";

import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";

const modules: any = [
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule
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