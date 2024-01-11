import { Purchase } from "../../models/purchase.model";

export interface PurchasesRepository {
  addPurchase(purchase: Purchase): number;
  getPurchasesByUser(userId: number): Promise<Purchase[]>;
}