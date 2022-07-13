import Stock from "./Stock";

interface AprioriAnalysis {
    firstCondition: string,
    secondCondition: string,
    stocks: Stock[],
    startDate: string,
    endDate: string,
    minSupport: number,
    minConfidence: number,
    minLift: number,
    interval: string
}

export default AprioriAnalysis;