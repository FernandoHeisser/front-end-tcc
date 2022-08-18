import AprioriItem from "./AprioriItem";

interface AprioriStockResult {
    _id: string,
    instructionId: string,
    data: AprioriItem[]
}

export default AprioriStockResult;