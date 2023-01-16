import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID , HostListener} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
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
    private title: Title
  ) {
    this.hideModal();
    this.checkUserStatus();
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Update title for every page
      this.setTitle();
    }
  }

  // @HostListener('window:popstate', ['$event'])
  // onBrowserBackBtnClose(event: Event) {
  //     event.preventDefault(); 
  //     this.title.setTitle('KPI Karta');
  // }
  
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
            }
          );
        }
      }
    });
  }

}
