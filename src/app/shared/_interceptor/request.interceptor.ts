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
        console.log("Request error: ", error);
        
        if (error.status === 401 && error.error.message === "Authorization Required") {
          this._commonService.deleteSession();
          this.router.navigate(['']);
          this._commonService.errorToaster('Your session expired');
        } else if (error.status === 401 && error.error.error.message === "login failed") {
          this._commonService.errorToaster('Please enter correct email address or password.');
        } else if (error.status === 400 || error.status === 404 || error.status === 422) {
          this._commonService.errorToaster(error.error.error.message ? error.error.error.message : error.statusText);
        } else this._commonService.errorToaster('Error, Something went wrong');
        return throwError(error);
      })
    );
  }
}
