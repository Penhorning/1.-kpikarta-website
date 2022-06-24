import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonService } from '@app/shared/_services/common.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivateChild {

  constructor (private _commonService: CommonService, private router: Router) { }
  
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (this._commonService.getSession() && this._commonService.getSession().token) {
        return true;
      } else {
        // this.router.navigate(['']);
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
        return false;
      }
  }
  // canLoad(
  //   route: Route,
  //   segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  //     if (this._commonService.getSession() && this._commonService.getSession().token) {
  //       return true;
  //     } else {
  //       // this.router.navigate(['']);
  //       this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
  //       return false;
  //     }
  // }
}

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivateChild {

  constructor(private _commonService: CommonService, private router: Router) { }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (this._commonService.getSession() && this._commonService.getSession().token) {
        this.router.navigate(['/my-plan']);
        return false;
      } else return true
  }

}
