import Customer from "../models/customer.model.js";

function normalizePhone(phone) {
  if (!phone) return "";
  return String(phone).trim().replace(/[\s\-()]/g, "");
}

function splitName(fullName) {
  const raw = (fullName || "").trim();
  if (!raw) return { firstName: undefined, lastName: undefined };
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return { firstName: parts[0], lastName: undefined };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

/**
 * Identity resolution (no silent overwrites):
 * Priority: cid -> phone -> email.
 * If customer exists, only fills missing fields.
 */
export async function resolveCustomer({ cid, phone, email, customerName, firstName, lastName }) {
  const normalizedPhone = normalizePhone(phone);
  const normalizedEmail = email ? String(email).trim().toLowerCase() : "";

  let customer = null;
  if (cid) customer = await Customer.findOne({ cid: String(cid).trim() });
  if (!customer && normalizedPhone) customer = await Customer.findOne({ phone: normalizedPhone });
  if (!customer && normalizedEmail) customer = await Customer.findOne({ email: normalizedEmail });

  const derived = splitName(customerName);
  const resolvedFirstName = firstName || derived.firstName;
  const resolvedLastName = lastName || derived.lastName;

  if (!customer) {
    customer = await Customer.create({
      cid: cid ? String(cid).trim() : undefined,
      phone: normalizedPhone,
      email: normalizedEmail || undefined,
      firstName: resolvedFirstName,
      lastName: resolvedLastName,
    });
    return customer;
  }

  let dirty = false;
  if (cid && !customer.cid) {
    customer.cid = String(cid).trim();
    dirty = true;
  }
  if (normalizedPhone && !customer.phone) {
    customer.phone = normalizedPhone;
    dirty = true;
  }
  if (normalizedEmail && !customer.email) {
    customer.email = normalizedEmail;
    dirty = true;
  }
  if (resolvedFirstName && !customer.firstName) {
    customer.firstName = resolvedFirstName;
    dirty = true;
  }
  if (resolvedLastName && !customer.lastName) {
    customer.lastName = resolvedLastName;
    dirty = true;
  }

  if (dirty) await customer.save();
  return customer;
}

export const customerUtils = { normalizePhone, splitName };
