import { Component, OnInit } from '@angular/core';
import { CommonService } from '@app/shared/_services/common.service';

@Component({
  selector: 'app-karta',
  templateUrl: './karta.component.html',
  styleUrls: ['./karta.component.scss']
})
export class KartaComponent implements OnInit {

  constructor(public _commonService: CommonService) { }

  ngOnInit(): void {
  }

}
