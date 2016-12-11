import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';

import {ArticleService} from "../article.service";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  private sources: Observable<any>;

  /**
   * Constructor
   * @param articleService Article service
   */
  constructor(private articleService: ArticleService) {
    // Listen on this.articleService.sources
    this.sources = this.articleService.sources;
  }

  /**
   * Component initialization
   */
  ngOnInit() {
    // Retrieve the news sources
    this.articleService.getSources();
  }
}
