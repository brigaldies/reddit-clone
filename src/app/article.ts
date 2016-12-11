interface ArticleJSON {
  title: string;
  url: string;
  votes: number;
  publishedAt: string;
  description: string;
  author: string;
  urlToImage: string;
}

export class Article {
  public publishedAt: Date;

  // Article.fromJSON
  static fromJSON(json: ArticleJSON): Article {
    let article = Object.create(Article.prototype); // Bypass the constructor.
    return Object.assign(article, json, {
      votes: json.votes ? json.votes : 0,
      imageUrl: json.urlToImage,
      publishedAt: json.publishedAt ? new Date(json.publishedAt) : new Date()
    });
  }

  constructor(public title: string,
              public description: string,
              public imageUrl: string,
              public votes?: number) {
    this.votes = votes || 0;
    this.publishedAt = new Date();
  }

  upvote(): void {
    this.votes = this.votes + 1;
  }

  downvote(): void {
    this.votes = this.votes - 1;
  }
}
