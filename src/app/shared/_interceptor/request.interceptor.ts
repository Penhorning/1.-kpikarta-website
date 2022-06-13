import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from "rxjs/operators";
import { CommonService } from '../_services/common.service';
import { Router } from '@angular/router';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {

  constructor(private router: Router, private _commonService: CommonService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this._commonService.getSession() && this._commonService.getSession().token) {
      request = request.clone({
        setHeaders: {
          token: this._commonService.getSession().token
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        if (error.error.isTrusted === true) {
          // this will occur when not connected to internet
          this._commonService.errorToaster('Your are not connected to internet');
        }else if (error.status === 401) {
          this._commonService.deleteSession();
          this.router.navigate(['']);
          this._commonService.errorToaster('Your session has been expired');
        } else if (error.status === 400 || error.status === 404) {
          this._commonService.errorToaster(error.error.message ? error.error.message : error.statusText);
        } else if (error.status === 500) this._commonService.errorToaster('Error, Something went wrong');
        return throwError(error);
      })
    );
  }
}
