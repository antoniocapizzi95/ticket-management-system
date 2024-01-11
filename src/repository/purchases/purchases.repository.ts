import { Purchase } from "../../models/purchase.model";

export interface PurchasesRepository {
  addPurchase(purchase: Purchase): void;
  getPurchasesByUser(userId: number): Promise<Purchase[]>;
}