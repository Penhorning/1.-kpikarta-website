import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonService } from '@app/shared/_services/common.service';
import { SignupService } from '@app/components/sign-up/service/signup.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivateChild {

  constructor (private _commonService: CommonService, private router: Router) { }
  
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (this._commonService.getSession() && this._commonService.getSession().token) {
        console.log("role ", this._commonService.getUserRole())
        if (childRoute.data.roles && childRoute.data.roles.indexOf(this._commonService.getUserRole()) === -1) {
          this.router.navigate(['/']);
          return false;
        }
        return true;
      } else {
        this.router.navigate(['/login']);
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
        this.router.navigate(['/dashboard']);
        return false;
      } else return true
  }

}

@Injectable({
  providedIn: 'root'
})
export class SignupGuard implements CanActivate {

  constructor(private _signupService: SignupService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (this._signupService.getSignUpSession() && this._signupService.getSignUpSession().token) {
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }
  }

}
