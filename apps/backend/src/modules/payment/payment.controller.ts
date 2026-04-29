import type { Request, Response } from "express";
import { z } from "zod";
import * as paymentService from "./payment.service";
import type { FailPaymentBody } from "./payment.validation";

export async function postConfirm(req: Request, res: Response) {
  const userId = req.user!.userId;
  const id = z.string().uuid().safeParse(req.params.paymentId);
  if (!id.success) {
    return res.status(404).json({
      success: false,
      errors: [{ message: "Not found" }],
    });
  }
  const result = await paymentService.confirmPayment(userId, id.data);
  return res.json({
    success: true,
    data: {
      payment: {
        id: result.payment.id,
        status: result.payment.status,
        paidAt: result.payment.paidAt,
        transactionId: result.payment.transactionId,
      },
      order: result.order,
    },
  });
}

export async function postFail(req: Request, res: Response) {
  const userId = req.user!.userId;
  const id = z.string().uuid().safeParse(req.params.paymentId);
  if (!id.success) {
    return res.status(404).json({
      success: false,
      errors: [{ message: "Not found" }],
    });
  }
  const body = req.body as FailPaymentBody;
  const result = await paymentService.failPayment(
    userId,
    id.data,
    body.failureReason
  );
  return res.json({
    success: true,
    data: {
      payment: {
        id: result.payment.id,
        status: result.payment.status,
        failureReason: result.payment.failureReason,
      },
      order: result.order,
    },
  });
}

export async function postRetry(req: Request, res: Response) {
  const userId = req.user!.userId;
  const id = z.string().uuid().safeParse(req.params.paymentId);
  if (!id.success) {
    return res.status(404).json({
      success: false,
      errors: [{ message: "Not found" }],
    });
  }
  const result = await paymentService.retryPayment(userId, id.data);
  return res.json({
    success: true,
    data: {
      payment: result.payment,
      order: result.order,
    },
  });
}
