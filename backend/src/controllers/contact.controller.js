import ContactMessage from "../models/contactMessage.model.js";
import { resolveCustomerWithMeta } from "../services/customer.service.js";

function sanitizeCustomer(customer) {
  const c = customer?.toObject ? customer.toObject() : customer;
  const obj = c || {};
  return {
    _id: obj._id,
    cid: obj.cid ?? null,
    phone: obj.phone ?? null,
    email: obj.email ?? null,
    firstName: obj.firstName ?? null,
    lastName: obj.lastName ?? null,
    createdAt: obj.createdAt ?? null,
    updatedAt: obj.updatedAt ?? null,
  };
}

export const submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, cid, message } = req.body || {};

    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!phone || String(phone).trim().length < 6) {
      return res.status(400).json({ message: "Phone number is required" });
    }
    if (!message || String(message).trim().length < 2) {
      return res.status(400).json({ message: "Message is required" });
    }

    const { customer, isNewCustomer } = await resolveCustomerWithMeta({
      cid,
      phone,
      email,
      customerName: name,
    });

    await ContactMessage.create({
      customer: customer?._id,
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: email ? String(email).trim().toLowerCase() : undefined,
      cid: cid ? String(cid).trim() : undefined,
      message: String(message).trim(),
      isNewCustomer,
    });

    res.status(201).json({
      success: true,
      isNewCustomer,
      customer: sanitizeCustomer(customer),
    });
  } catch (err) {
    next(err);
  }
};
