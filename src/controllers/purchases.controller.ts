import express from "express";
import { PurchasesService } from "../services/purchases.service";
import { Purchase } from "../models/purchase.model";


export class PurchasesController {
  private purchasesService: PurchasesService;

  constructor(purchasesService: PurchasesService) {
    this.purchasesService = purchasesService;
  }

  async purchase (req: express.Request, res: express.Response) {

    const purchase: Purchase = req.body;

    try {
      await this.purchasesService.purchase(purchase)
      res.status(201).json({ success: true });
    } catch (error) {
        console.error("Error adding a purchase:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }

  async getByUser (req: express.Request, res: express.Response) {
    const userId = req.params.id;
    try {
      const purchasesByUserId = await this.purchasesService.getByUser(userId);
      res.json({ purchases: purchasesByUserId });
    } catch (error) {
      console.error("Error getting purchases:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
