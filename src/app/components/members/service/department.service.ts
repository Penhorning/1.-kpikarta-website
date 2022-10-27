import { Injectable } from '@angular/core';
import { HttpService } from '@app/shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  constructor(private _httpService: HttpService) { }

  getDepartments() {
    return this._httpService.GET('/departments');
  }
}
