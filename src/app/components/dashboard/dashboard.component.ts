import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KartaService } from '../karta/service/karta.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

  kartas: any = [];

  constructor(
    private _commonService: CommonService,
    private _kartaService: KartaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getKartas();
  }

  navigateToKarta () {
    this.router.navigate(['/karta/create-karta']);
  }

  getKartas() {
    this._kartaService.getKartas().pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.kartas = response;
      }
    );
  }

  deleteKarta(id: string) {
    const result = confirm("Are you sure you want to delete this karta?");
    if (result) {
      this._kartaService.deleteKarta(id).pipe(takeUntil(this.destroy$)).subscribe(
        (response: any) => {
          this._commonService.successToaster("Karta deleted successfully");
          this.getKartas();
        }
      );
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
