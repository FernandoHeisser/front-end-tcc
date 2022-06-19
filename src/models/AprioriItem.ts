interface AprioriItem {
    items_base: string[],
    items_add: string[],
    support: number,
    confidence: number,
    lift: number,
}

export default AprioriItem;