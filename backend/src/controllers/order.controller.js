import Order from "../models/order.model.js";
import { resolveCustomer } from "../services/customer.service.js";

export const createOrder = async (req, res, next) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      customerCid,
      ...rest
    } = req.body || {};

    const customer = await resolveCustomer({
      cid: customerCid,
      phone: customerPhone,
      email: customerEmail,
      customerName,
    });

    const order = await Order.create({
      ...rest,
      customer: customer._id,
      customerName,
      customerPhone,
    });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const getPendingCount = async (req, res, next) => {
  try {
    const count = await Order.countDocuments({ status: 'pending' });
    res.json({ count });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted" });
  } catch (err) {
    next(err);
  }
};
