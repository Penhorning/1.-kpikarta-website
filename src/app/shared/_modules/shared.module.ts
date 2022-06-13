import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

const modules = [
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule
]

@NgModule({
    imports: modules,
    exports: modules
})
export class SharedModule { }