interface Article {
    image?: string,
    url: string,
    title: string,
    source: {
        url?: string,
        title: string
    },
    time: {
        date: string,
        title: string,
    }
}

export default Article;