import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from '@app/shared/_services/common.service';
import { KartaService } from '../service/karta.service';
import * as jqueryFunctions from '../utils/jqueryOperations.js';

@Component({
  selector: 'app-edit-karta-inventory',
  templateUrl: './edit-karta-inventory.component.html',
  styleUrls: ['./edit-karta-inventory.component.scss']
})
export class EditKartaInventoryComponent implements OnInit {

  @Input() kartaId: string = '';
  
  @Input() versionId: any = "";
  @Input() showSVG: boolean = false;
  @Input() isRtNodDrgingFrmSide: boolean = false;

  constructor(private _commonService: CommonService, private _kartaService: KartaService) { }

  ngOnInit(): void {
  }

  onDragStart(ev: any) {
    this.isRtNodDrgingFrmSide = true;
  }

}
