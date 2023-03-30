import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BnNgIdleService } from 'bn-ng-idle';
import { filter, map, mergeMap } from 'rxjs/operators';
import { CommonService } from './shared/_services/common.service';

declare const $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
 
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private _commonService: CommonService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private bnIdle: BnNgIdleService,
    private title: Title
  ) {
    this.hideModal();
    this.checkUserStatus();
  }

  ngOnInit() {
    // Check for user inactivity (1hr)
    this.bnIdle.startWatching(3600).subscribe((isTimedOut: boolean) => {
      if (isTimedOut && this._commonService.getSession().token) {
        this._commonService.deleteSession();
        this._commonService.errorToaster('Your session has been expired!');
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      // Update title for every page
      this.setTitle();
    }
  }
  
  // Set page title
  setTitle() {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map((router) => {
        while (router.firstChild) router = router.firstChild;
        return router;
      }),
      filter((route) => route.outlet === 'primary'),
      mergeMap((route) => route.data)).subscribe(
        (event) => {
          this.title.setTitle(event['title']);
        });
  }

  // Hide modal
  hideModal() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        $('body').removeAttr("style");
        $('body').removeClass();
        $('.modal-backdrop').remove();
      }
    });
  }

  // Check user status
  checkUserStatus() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (this._commonService.getSession().token) {
          this._commonService.getUserInfo().subscribe(
            (response: any) => {
              this._commonService.updateSession('role', response.roles[0].name);
              this._commonService.updateSession('license', response.license.name);
              this._commonService.updateSession('py_failed', response.paymentFailed);
            }
          );
        }
      }
    });
  }

}
