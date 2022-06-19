import YahooData from "./YahooData";

interface StockDataYahoo {
    symbol: string,
    content: {
        yesterday: YahooData,
        today: YahooData
    }
}

export default StockDataYahoo;