import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { KartaService } from '../karta/service/karta.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

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
    this._kartaService.getKartas(this._commonService.getUserId()).subscribe(
      (response: any) => {
        this.kartas = response;
      }
    );
  }

  deleteKarta(id: string) {
    const result = confirm("Are you sure you want to delete this karta?");
    if (result) {
      this._kartaService.deleteKarta(id).subscribe(
        (response: any) => {
          this._commonService.successToaster("Karta deleted successfully");
          this.getKartas();
        }
      );
    }
  }

}
