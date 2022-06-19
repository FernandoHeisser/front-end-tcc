import Article from "./Article";
import MainArticle from "./MainArticle";

interface News {
    mainArticles: MainArticle[],
    firstArticle: Article,
    articles: Article[]
}

export default News;