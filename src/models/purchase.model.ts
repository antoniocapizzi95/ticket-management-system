export class Purchase {
    constructor(public id: number | undefined, public userId: number, public eventsToPurchase: EventToPurchase[], public purchaseDateTime: Date | undefined, public paidPrice: number) {}
}

export class EventToPurchase {
    constructor(public eventId: number, public ticketsNumber: number) {}
}