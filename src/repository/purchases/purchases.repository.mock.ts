import { Purchase } from "../../models/purchase.model";
import { PurchasesRepository } from "./purchases.repository";


export class PurchaseRepositoryMock implements PurchasesRepository {
  private purchasesInMemory: Purchase[];

  constructor() {
    this.purchasesInMemory = [];
  }

  addPurchase (purchase: Purchase): number {
    purchase.id = this.assignId();
    this.purchasesInMemory.push(purchase);
    return purchase.id
  }

  async getPurchasesByUser (userId: number): Promise<Purchase[]> {
    const purchasesToReturn = [];
    for (const purchase of this.purchasesInMemory) {
      if (purchase.userId === userId) {
        purchasesToReturn.push(purchase);
      }
    }
    return purchasesToReturn;
  }

  private assignId (): number {
    if (this.purchasesInMemory.length === 0) {
      return 1;
    }

    const lastElement = this.purchasesInMemory[this.purchasesInMemory.length - 1];
    return lastElement.id + 1;
  }
  
}