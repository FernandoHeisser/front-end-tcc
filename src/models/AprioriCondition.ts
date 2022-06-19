import Stock from "./Stock";

interface AprioriCondition {
    firstCondition: string,
    secondCondition: string,
    stocks: Stock[]
}

export default AprioriCondition;