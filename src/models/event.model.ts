export class Event {
    constructor(public id: number, public name: string, public availableTickets: number, public ticketPrice: number, public eventDate: Date, public location: string) {}
}