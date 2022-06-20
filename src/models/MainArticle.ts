import Article from "./Article";

interface MainArticle {
    article: Article,
    firstSubArticle: Article,
    subArticles: Article[],
    expandFlag: boolean
}

export default MainArticle;