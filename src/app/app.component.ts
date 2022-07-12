import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  private routeSub: Subscription = new Subscription();

  constructor( 
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private activatedRoute: ActivatedRoute, 
    private title: Title
  ) { }

  ngOnInit () {
    if (isPlatformBrowser(this.platformId)) {
      // Update title for every page
      this.setTitle();
    }
  }

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

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }
}
