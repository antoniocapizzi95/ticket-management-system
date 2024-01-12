import express from "express";
import { PurchasesService } from "../services/purchases.service";
import { Purchase } from "../models/purchase.model";
import { PurchaseError } from "../errors/purchase.error";


export class PurchasesController {
  private readonly purchasesService: PurchasesService;

  constructor(purchasesService: PurchasesService) {
    this.purchasesService = purchasesService;
  }

  async purchase(req: express.Request, res: express.Response) {
    const purchase: Purchase = req.body;
  
    try {
      await this.purchasesService.purchase(purchase);
      res.status(201).json({ success: true });
    } catch (error) {
  
      if (error instanceof PurchaseError) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  }

  async getByUser (req: express.Request, res: express.Response) {
    const userId = req.params.id;
    try {
      const purchasesByUserId = await this.purchasesService.getByUser(userId);
      res.json({ purchases: purchasesByUserId });
    } catch (error) {
      if (error instanceof PurchaseError) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
}
