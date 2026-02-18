import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";

export const verifyPaymentAndOrder = async (paymentId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error("Payment not found");

  payment.verified = true;
  await payment.save();

  await Order.findByIdAndUpdate(payment.order, {
    status: "paid",
  });

  return payment;
};
