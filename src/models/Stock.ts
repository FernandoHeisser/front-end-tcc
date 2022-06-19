import StockData from "./StockData";

interface Stock {
    company?: string,
    symbol?: string,
    url?: string,
    _id?: string,
    data?: StockData,
    tags?: string,
    condition?: string,
    checked?: boolean
}

export default Stock;