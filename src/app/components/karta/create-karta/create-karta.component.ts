import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KartaService } from '../service/karta.service';

@Component({
  selector: 'app-create-karta',
  templateUrl: './create-karta.component.html',
  styleUrls: ['./create-karta.component.scss']
})
export class CreateKartaComponent implements OnInit,OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

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
      this._kartaService.createKarta(this.kartaForm.value).pipe(takeUntil(this.destroy$)).subscribe(
        (response: any) => {
          this.router.navigate(['/']);
        },
        (error: any) => {
          this.submitFlag = false;
        }
      );
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
