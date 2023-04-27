import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { KartaService } from '../service/karta.service';

@Component({
  selector: 'app-create-karta',
  templateUrl: './create-karta.component.html',
  styleUrls: ['./create-karta.component.scss']
})
export class CreateKartaComponent implements OnInit {

  submitted: boolean = false;
  submitFlag: boolean = false;

  kartaForm = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]], // Validtion for blank space
  });
  get form() { return this.kartaForm.controls; }

  constructor(
    private fb: FormBuilder,
    private _commonService: CommonService,
    private _kartaService: KartaService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  // On submit
  onSubmit() {
    this.submitted = true;

    if (this.kartaForm.valid) {
      this.submitFlag = true;
      this.kartaForm.value.userId = this._commonService.getUserId();
      
      this._kartaService.findKartaByUser(this.kartaForm.value.userId).subscribe(
        (response: any) => {
          if (response.length > 0) {
            this._kartaService.createKarta(this.kartaForm.value).subscribe(
              (response: any) => {
                location.replace(`/karta/edit/${response.id}`);
              },
              (error: any) => {
                this.submitFlag = false;
              }
            );
          } else {
            this._kartaService.createKarta(this.kartaForm.value).subscribe(
              (response: any) => {
                this._commonService.updateSession('newkartaId', response.id);
                this._kartaService.getIntroKarta().subscribe(
                  (response: any) => {
                    if (response.length > 0) this.router.navigate(['/karta/intro', response[0].id]);
                  },
                  (error: any) => {
                    this.submitFlag = false;
                  }
                )
              },
              (error: any) => {
                this.submitFlag = false;
              }
            );
          }
        },
        (error: any) => {
          this.submitFlag = false;
        }
      );
    }
  }

}
