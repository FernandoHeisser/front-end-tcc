import Article from "./Article";
import MainArticle from "./MainArticle";

interface News {
    mainArticles: MainArticle[],
    articles: Article[]
}

export default News;