import * as Joi from 'joi';
import { Purchase } from 'src/models/purchase.model';

export function isPurchaseObjectValidated (purchase: Purchase): boolean {
    const purchaseSchema = Joi.object({
        id: Joi.number().optional(),
        userId: Joi.number().required(),
        eventsToPurchase: Joi.array().items(
          Joi.object({
            eventId: Joi.number().required(),
            ticketsNumber: Joi.number().required(),
          })
        ).required(),
        purchaseDateTime: Joi.date().optional(),
        paidPrice: Joi.number().required(),
      });

    const validationResult = purchaseSchema.validate(purchase);

    if (validationResult.error) {
        return false;
    }

    return true;
}