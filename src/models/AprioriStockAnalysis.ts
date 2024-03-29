interface AprioriStockAnalysis {
    firstCondition: string,
    secondCondition: string,
    stockCondition: string,
    stock?: string,
    startDate: string,
    endDate: string,
    minSupport: number,
    minConfidence: number,
    minLift: number,
    interval: string
}

export default AprioriStockAnalysis;