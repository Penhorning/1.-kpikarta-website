import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
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
      if (state.url.indexOf('view') !== -1) { return true; }
      else if (this._commonService.getSession() && this._commonService.getSession().token) {
        // Get role
        const roles = childRoute.data.roles;
        const currentRole = this._commonService.getUserRole();
        // Compare role
        if (roles) {
          if (roles.indexOf(currentRole) > -1) {
            // Get license
            const licenses = childRoute.data.licenses;
            const currentLicense = this._commonService.getUserLicense();
            // Compare license
            if (licenses) {
              if (licenses.indexOf(currentLicense) > -1) {
                return true;
              } else {
                this.router.navigate(['/']);
                return false;
              }
            }
            return true;
          } else {
            this.router.navigate(['/']);
            return false;
          }
        }
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }
  }
  
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
      } else return true;
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
