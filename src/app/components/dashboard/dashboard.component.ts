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
  users: any = [];
  sharingKarta: any;

  constructor(
    private _commonService: CommonService,
    private _kartaService: KartaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getKartas();
  }

  // Navigate to create karta
  navigateToKarta () {
    this.router.navigate(['/karta/create-karta']);
  }

  // Get all kartas
  getKartas() {
    this._kartaService.getKartas(this._commonService.getUserId()).subscribe(
      (response: any) => {
        this.kartas = response;
      }
    );
  }

  // Update karta
  updateKarta(type: string, id: string, index: number) {
    this._kartaService.updateKarta(id, {type}).subscribe(
      (response: any) => {
        this.kartas[index].type = type;
      }
    );
  }

  // Delete karta
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

  // On share karta
  onShare(param: any) {
    this.sharingKarta = param;
  }
  // Share karta
  shareKarta(id: string) {
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
