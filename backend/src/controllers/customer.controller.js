import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Order from "../models/order.model.js";

const VIP_THRESHOLD_NGN = 20000;

function buildSegment({ lastOrderDate, totalRevenue }) {
  if (totalRevenue >= VIP_THRESHOLD_NGN) return "VIP";
  if (!lastOrderDate) return "Lost";
  const now = Date.now();
  const days = (now - new Date(lastOrderDate).getTime()) / (1000 * 60 * 60 * 24);
  if (days < 30) return "Active";
  if (days <= 90) return "At Risk";
  return "Lost";
}

export const listCustomers = async (req, res, next) => {
  try {
    // Backfill legacy orders that predate the `Order.customer` reference.
    // This keeps the Customers page working without requiring a manual migration.
    try {
      const legacyOrders = await Order.find({
        $or: [{ customer: { $exists: false } }, { customer: null }],
      })
        .limit(250)
        .select("_id customerName customerPhone")
        .lean();

      if (legacyOrders.length) {
        const ops = [];
        for (const o of legacyOrders) {
          if (!o?.customerPhone) continue;
          const customer = await resolveCustomer({
            phone: o.customerPhone,
            customerName: o.customerName,
          });
          if (!customer?._id) continue;
          ops.push({
            updateOne: {
              filter: { _id: o._id },
              update: { $set: { customer: customer._id } },
            },
          });
        }
        if (ops.length) {
          await Order.bulkWrite(ops, { ordered: false });
        }
      }
    } catch (e) {
      // best-effort only; aggregation below is still safe
    }

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(5, Number(req.query.limit || 20)));
    const q = String(req.query.q || "").trim();
    const segment = String(req.query.segment || "").trim();
    const sortBy = String(req.query.sortBy || "total_revenue");
    const dir = String(req.query.dir || "desc").toLowerCase() === "asc" ? 1 : -1;

    const activeSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const atRiskSince = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const sortMap = {
      total_revenue: "totalRevenue",
      last_order_date: "lastOrderDate",
      total_orders: "totalOrders",
    };
    const sortField = sortMap[sortBy] || "totalRevenue";

    const pipeline = [
      { $match: { customer: { $type: "objectId" } } },
      {
        $group: {
          _id: "$customer",
          totalOrders: { $sum: 1 },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          firstOrderDate: { $min: "$createdAt" },
          lastOrderDate: { $max: "$createdAt" },
          revenueOrders: {
            $sum: {
              $cond: [
                { $in: ["$status", ["paid", "confirmed", "delivered"]] },
                1,
                0,
              ],
            },
          },
          totalRevenue: {
            $sum: {
              $cond: [
                { $in: ["$status", ["paid", "confirmed", "delivered"]] },
                "$totalAmount",
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },
      {
        $addFields: {
          avgOrderValue: {
            $cond: [
              { $gt: ["$revenueOrders", 0] },
              { $divide: ["$totalRevenue", "$revenueOrders"] },
              0,
            ],
          },
          fullName: {
            $trim: {
              input: {
                $concat: [
                  { $ifNull: ["$customer.firstName", ""] },
                  " ",
                  { $ifNull: ["$customer.lastName", ""] },
                ],
              },
            },
          },
          segment: {
            $switch: {
              branches: [
                {
                  case: { $gte: ["$totalRevenue", VIP_THRESHOLD_NGN] },
                  then: "VIP",
                },
                { case: { $gte: ["$lastOrderDate", activeSince] }, then: "Active" },
                { case: { $gte: ["$lastOrderDate", atRiskSince] }, then: "At Risk" },
              ],
              default: "Lost",
            },
          },
        },
      },
    ];

    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      pipeline.push({
        $match: {
          $or: [
            { "customer.phone": rx },
            { "customer.email": rx },
            { "customer.cid": rx },
            { "customer.firstName": rx },
            { "customer.lastName": rx },
            { fullName: rx },
          ],
        },
      });
    }

    if (segment) {
      pipeline.push({ $match: { segment } });
    }

    pipeline.push({ $sort: { [sortField]: dir, _id: 1 } });

    pipeline.push({
      $facet: {
        items: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        meta: [{ $count: "total" }],
      },
    });

    const agg = await Order.aggregate(pipeline);
    const first = agg?.[0] || {};
    const items = first.items || [];
    const total = first.meta?.[0]?.total || 0;

    const normalizeCustomer = (c) => {
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
    };

    res.json({
      items: items.map((x) => ({
        customer: normalizeCustomer(x.customer),
        stats: {
          totalOrders: x.totalOrders,
          pendingOrders: x.pendingOrders,
          totalRevenue: x.totalRevenue,
          avgOrderValue: x.avgOrderValue,
          firstOrderDate: x.firstOrderDate,
          lastOrderDate: x.lastOrderDate,
          segment: x.segment,
        },
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid customer id" });
    }

    const customer = await Customer.findById(id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const statsAgg = await Order.aggregate([
      { $match: { customer: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: "$customer",
          totalOrders: { $sum: 1 },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          revenueOrders: {
            $sum: {
              $cond: [
                { $in: ["$status", ["paid", "confirmed", "delivered"]] },
                1,
                0,
              ],
            },
          },
          totalRevenue: {
            $sum: {
              $cond: [
                { $in: ["$status", ["paid", "confirmed", "delivered"]] },
                "$totalAmount",
                0,
              ],
            },
          },
          firstOrderDate: { $min: "$createdAt" },
          lastOrderDate: { $max: "$createdAt" },
        },
      },
      {
        $addFields: {
          avgOrderValue: {
            $cond: [
              { $gt: ["$revenueOrders", 0] },
              { $divide: ["$totalRevenue", "$revenueOrders"] },
              0,
            ],
          },
        },
      },
    ]);

    const stats = statsAgg?.[0] || {
      totalOrders: 0,
      pendingOrders: 0,
      revenueOrders: 0,
      totalRevenue: 0,
      avgOrderValue: 0,
      firstOrderDate: null,
      lastOrderDate: null,
    };

    const segment = buildSegment({
      lastOrderDate: stats.lastOrderDate,
      totalRevenue: stats.totalRevenue || 0,
    });

    res.json({
      customer,
      stats: {
        totalOrders: stats.totalOrders || 0,
        pendingOrders: stats.pendingOrders || 0,
        totalRevenue: stats.totalRevenue || 0,
        avgOrderValue: stats.avgOrderValue || 0,
        firstOrderDate: stats.firstOrderDate || null,
        lastOrderDate: stats.lastOrderDate || null,
        segment,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getCustomerOrders = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid customer id" });
    }

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(5, Number(req.query.limit || 20)));

    const orders = await Order.find({ customer: id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Order.countDocuments({ customer: id });

    res.json({
      items: orders,
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (err) {
    next(err);
  }
};
