interface YahooData {
    [key: string]: string | number,
    open: number,
    high: number,
    low: number,
    close: number,
    adjClose: number,
    volume: number,
    datetime: string
}

export default YahooData;