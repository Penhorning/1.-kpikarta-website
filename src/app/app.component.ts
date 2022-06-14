import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  showHeader: boolean = false;

  constructor( 
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private activatedRoute: ActivatedRoute, 
    private title: Title
  ) {
    // listenging to routing navigation event
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (
          event.url == "/login" || event.url == "/forgot-password" || 
          event.url == "/reset-password" || event.url == "/sign-up" || event.url.substring(0,10) == "/thank-you"
          ) {
            this.showHeader = false;
          } else this.showHeader = true;
      }
    });
  }

  ngOnInit () {
    if (isPlatformBrowser(this.platformId)) {
      // Update title for every page
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
  }
}
