import AprioriItem from "./AprioriItem";

interface AprioriStockResult {
    _id: string,
    instructionId: string,
    data: AprioriItem[],
    status: number,
    message: string
}

export default AprioriStockResult;