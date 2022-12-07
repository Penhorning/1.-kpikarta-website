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
          authorization: this._commonService.getSession().token
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (
          error.status === 401 && (error.error.error.message === "Authorization Required"
          || error.error.error.message === "could not find a valid user" || error.error.error.message === "could not find accessToken")
          ) {
          this._commonService.deleteSession();
          this.router.navigate(['']);
          this._commonService.errorToaster('Your session expired');
        } else if (error.status === 401 && error.error.error.message === "login failed") {
          this._commonService.errorToaster('Please enter correct email address or password.');
        } else if (error.status === 400 || error.status === 404) {
          this._commonService.errorToaster(error.error.error.message ? error.error.error.message : error.statusText);
        } else if ((error.status >= 500 && error.status <= 505) || error.status === 0) {
          this._commonService.errorToaster('Error, Something went wrong');
        }
        return throwError(error);
      })
    );
  }
}
