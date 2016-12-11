import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
//import 'rxjs/add/operator/flatMap';

import {ArticleService} from '../article.service';

declare var jQuery: any;

@Component({
  selector: 'app-article-list-header',
  templateUrl: './article-list-header.component.html',
  styleUrls: ['./article-list-header.component.css']
})
export class ArticleListHeaderComponent implements OnInit {

  private currentFilter: string = 'Time';
  private sortDirection: number = 1; // 1: Descending; -1: Ascending

  constructor(private _articleService: ArticleService) {
  }

  ngOnInit() {
    jQuery('.ui.dropdown').dropdown();

    Observable.fromEvent(document.getElementById("search"), "keyup")
      .map((e: Event) => {
        let searchTerm = (<HTMLInputElement> e.target).value;
        console.log('Keyups Observable: ' + searchTerm);
        return searchTerm;
      })
      .debounceTime(400)
      .distinctUntilChanged()
      .subscribe(searchTerm => {
        console.log(`subscribe: searchTerm=${searchTerm}`);
        this._articleService.filterBy(searchTerm);
      })
  }

  changeDirection() {
    this.sortDirection = this.sortDirection * (-1);
    console.log(`ArticleListHeaderComponent.changeDirection: direction=${this.sortDirection}`);
    this._updateSort();
  }

  private _updateSort() {
    // Call sortBy on the article service
    console.log(`ArticleListHeaderComponent._updateSort: filter=${this.currentFilter}, direction=${this.sortDirection}`);
    this._articleService.sortBy(this.currentFilter, this.sortDirection);
  }

  changeSort(filter: string) {
    console.log(`ArticleListHeaderComponent.changeSort: filter=${filter}`);
    // Update the filter: Time or Votes
    if (filter === this.currentFilter) {
      // No change
      // Do nothing? Or re-sort?
    } else {
      this.currentFilter = filter;
      this._updateSort();
    }
  }

  liveSearch(evt) {
    // const val = evt.target.value;
    // console.log(`ArticleListHeaderComponent.liveSearch: val=${val}`);
    // this._articleService.filterBy(val);
  }
}
