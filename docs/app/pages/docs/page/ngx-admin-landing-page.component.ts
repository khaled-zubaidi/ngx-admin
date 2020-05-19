/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { Component, Inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  filter,
  map,
  publishBehavior,
  publishReplay,
  refCount,
  tap,
  takeWhile,
} from 'rxjs/operators';
import { NB_WINDOW } from '@nebular/theme';
import { fromEvent } from 'rxjs';

import { NgxStructureService } from '../../../@theme/services/structure.service';
import { NgxTocStateService } from '../../../@theme/services/toc-state.service';
import {MetadataService} from '../../../../../src/app/@core/utils/metadata.service';

@Component({
  selector: 'ngx-admin-landing-page',
  templateUrl: './ngx-admin-landing-page.component.html',
  styleUrls: ['./ngx-admin-landing-page.component.scss'],
})
export class NgxAdminLandingPageComponent implements OnDestroy, OnInit {

  currentItem;
  private alive = true;

  constructor(@Inject(NB_WINDOW) private window,
              private ngZone: NgZone,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private structureService: NgxStructureService,
              private tocState: NgxTocStateService,
              private metaDataService: MetadataService) {
  }

  get showSettings() {
    return this.currentItem && this.currentItem.children
      .some((item) => ['markdown', 'component', 'tabbed'].includes(item.block));
  }

  ngOnInit() {
    this.handlePageNavigation();
    this.handleTocScroll();
    this.window.history.scrollRestoration = 'manual';
  }

  handlePageNavigation() {
    this.activatedRoute.params
      .pipe(
        takeWhile(() => this.alive),
        filter((params: any) => params.subPage),
        map((params: any) => {
          const slag = `${params.page}_${params.subPage}`;
          return this.structureService.findPageBySlag(this.structureService.getPreparedStructure(), slag);
        }),
        filter(item => item),
        tap((item: any) => {
          switch (item.name) {
            case 'What is ngx-admin?':
              this.metaDataService.updateTitle('Ngx-admin - documentation');
              this.metaDataService.updateDescription('ngx-admin is a front-end admin dashboard template based on Angular 9+, Bootstrap 4+ and Nebular');
              this.metaDataService.updateKeywords('Ngx-admin features, Angular 9+ typescript, Bootstrap 4+ & SCSS, ngx-admin documentation');
              break;
            case 'Installation Guidelines':
              this.metaDataService.updateTitle('Ngx-admin - Guideline to install.');
              this.metaDataService.updateDescription(item.description);
              this.metaDataService.updateKeywords('Ngx-admin install tools, ngx-admin versions, ngx-admin install.');
              break;
            case 'Server deployment':
              this.metaDataService.updateTitle('Ngx-admin - Server deployment');
              this.metaDataService.updateDescription(item.description);
              this.metaDataService.updateKeywords('Ngx-admin server, ngx-admin server deployment');
              break;
            case 'Theme System':
              this.metaDataService.updateTitle('Ngx-admin - Theme System');
              this.metaDataService.updateDescription(item.description);
              this.metaDataService.updateKeywords('Nebular theme system, nebular components, nebular theme map, ngx-admin built-in-themes');
              break;
            case 'Change Theme':
              this.metaDataService.updateTitle('Ngx-admin - Change theme');
              this.metaDataService.updateDescription(item.description);
              this.metaDataService.updateKeywords('ngx-admin runtime theme switch, ngx-admin theme change');
              break;
            case 'Backend integration':
              this.metaDataService.updateTitle('Ngx-admin - Backend integration');
              this.metaDataService.updateDescription(item.description);
              this.metaDataService.updateKeywords('Ngx-admin backend integration, JSON REST server integration, angular-cli/webpack-dev-server setup, ngx-admin production setup');
              break;
            default:
              this.metaDataService.updateTitle(item.name);
          }
        }),
        publishReplay(),
        refCount(),
      )
      .subscribe((item) => {
        this.currentItem = item;
      });
  }

  handleTocScroll() {
    this.ngZone.runOutsideAngular(() => {
      fromEvent(this.window, 'scroll')
        .pipe(
          publishBehavior(null),
          refCount(),
          takeWhile(() => this.alive),
          filter(() => this.tocState.list().length > 0),
        )
        .subscribe(() => {
          this.tocState.list().map(item => item.setInView(false));

          const current: any = this.tocState.list().reduce((acc, item) => {
            return item.y > 0 && item.y < acc.y ? item : acc;
          }, { y: Number.POSITIVE_INFINITY, fake: true });

          if (current && !current.fake) {
            current.setInView(true);
            this.router.navigate([], { fragment: current.fragment, replaceUrl: true });
          }
        });
    });
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
