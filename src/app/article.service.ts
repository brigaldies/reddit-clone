import {Injectable} from '@angular/core';
import {Article} from "./article";
import {Http, URLSearchParams} from "@angular/http";
import {Observable, BehaviorSubject} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import {environment} from '../environments/environment';

// Sort function signature/interface

// [].sort(compare function with 2 args 'a' and 'b')
// 0: Equal
// 1: a comes before b
// -1: a comes after b
//

/**
 * Sort function.
 */
interface ArticleSortFn {
  (a: Article, b: Article): number;
}

/**
 * Direction-to-Sort-function function
 */
interface ArticleSortOrderFn {
  (direction: number): ArticleSortFn;
}

// Sort by time function
const sortByTime: ArticleSortOrderFn =
  (direction: number) => (a: Article, b: Article) => {
    return direction * (b.publishedAt.getTime() - a.publishedAt.getTime());
  };

// Sort by Votes function
const sortByVotes: ArticleSortOrderFn =
  (direction: number) => (a: Article, b: Article) => {
    return direction * (b.votes - a.votes);
  };

// Map of sort functions
const sortFunctions = {
  'Time': sortByTime,
  'Votes': sortByVotes
};

/**
 * Articles service.
 */
@Injectable()
export class ArticleService {

  // (Private) Behavior agents to push events to listeners
  private _newsSourceSubject: BehaviorSubject<string> = new BehaviorSubject<string>('reddit-r-all');
  private _articles: BehaviorSubject<Article[]> = new BehaviorSubject<Article[]>([]); // Articles
  private _sources: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  private _sortByDirectionSubject: BehaviorSubject<number> = new BehaviorSubject<number>(1); // "Stream/subject" of sort directions
  private _sortByTypeSubject: BehaviorSubject<ArticleSortOrderFn> = new BehaviorSubject<ArticleSortOrderFn>(sortByTime); // "Stream/subject" of sort type
  private _filterBySubject: BehaviorSubject<string> = new BehaviorSubject<string>('');

  // (Public) Listeners listen on the behavior agents
  public articles: Observable<Article[]> = this._articles.asObservable();
  public sources: Observable<any> = this._sources.asObservable();
  public orderedArticles: Observable<Article[]>;

  /**
   * Constructor
   * @param http HTTP request service
   */
  constructor(private http: Http) {
    this._newsSourceSubject.subscribe(this.getArticles.bind(this));
    this.orderedArticles = Observable.combineLatest(
      this._articles,
      this._sortByTypeSubject,
      this._sortByDirectionSubject,
      this._filterBySubject
    ).map(([
      articles, sorter, direction, filterTerm
    ]) => {
      const re = new RegExp(filterTerm, 'gi');
      return articles
        .filter(a => re.exec(a.title))
        .sort(sorter(direction));
    })
  }

  /**
   * Filter the articles by reg exp matching of articles' titles with 'filterTerm'.
   * @param filterTerm
   */
  public filterBy(filterTerm: string) {
    console.log(`ArticleService.filterBy: filterTerm=${filterTerm}`)
    this._filterBySubject.next(filterTerm);
  }

  /**
   * Sort the articles.
   * @param sortType Filter ('Time', 'Votes', etc.)
   * @param sortDirection Sort order (1: descending, -1: ascending)
   */
  public sortBy(sortType: string,
                sortDirection: number): void {
    console.log(`ArticleService.sortBy: type=${sortType}, direction=${sortDirection}`);
    this._sortByDirectionSubject.next(sortDirection); // "Emit" a new sort direction event
    this._sortByTypeSubject.next(sortFunctions[sortType]); // "Emit" a new sort function.
  }

  /**
   * Change the news source.
   * @param sourceKey
   */
  updateArticles(sourceKey: string): void {
    this._newsSourceSubject.next(sourceKey);
  }

  /**
   * Retrieve the articles from the remote source.
   */
  public getArticles(sourceKey: string = 'reddit-r-all'): void {
    // Make the http request -> observable
    // Convert each response -> Article
    // "Emit" new articles.
    this._makeHttpRequest('/v1/articles', sourceKey)
      .map(json => json.articles)
      .subscribe(articlesJSON => {
        const articles = articlesJSON.map(articleJson => Article.fromJSON(articleJson));
        this._articles.next(articles);
      })
  }

  /**
   * Retrieve the news sources
   */
  public getSources(): void {
    this._makeHttpRequest('/v1/sources')
      .map(json => {
        console.log(json.sources);
        return json.sources;
      })
      .filter(list => list.length > 0)
      .subscribe(this._sources); // Update this._sources.
  }

  /**
   * Issue the REST API call.
   * @param path Articles API
   * @param sourceKey Articles source
   * @returns {Observable<R>}
   * @private
   */
  private _makeHttpRequest(path: string, sourceKey?: string): Observable<any> {
    let params = new URLSearchParams();
    params.set('apiKey', environment.newsApiKey);
    if (sourceKey && sourceKey !== '') {
      params.set('source', sourceKey);
    }
    return this.http
      .get(`${environment.baseUrl}${path}`, {search: params})
      .map(resp => resp.json()); // Turn the response into a Json structure
  }
}
