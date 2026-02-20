import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Order from "../models/order.model.js";
import { resolveCustomer } from "../services/customer.service.js";

const MONGO_URI = process.env.MONGO_URI;

const APPLY = process.argv.includes("--apply");
const limitArgIndex = process.argv.findIndex((x) => x === "--limit");
const LIMIT =
  limitArgIndex !== -1 && process.argv[limitArgIndex + 1]
    ? Number(process.argv[limitArgIndex + 1])
    : Infinity;

async function main() {
  if (!MONGO_URI) {
    console.error("MONGO_URI not set in environment");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB for backfill");

  const filter = {
    $or: [{ customer: { $exists: false } }, { customer: null }],
  };

  const totalMissing = await Order.countDocuments(filter);
  console.log(`Orders missing customer ref: ${totalMissing}`);

  if (!APPLY) {
    console.log(
      "Dry-run only. Re-run with `--apply` to backfill Order.customer for these orders."
    );
    process.exit(0);
  }

  let scanned = 0;
  let updated = 0;
  let failed = 0;

  const cursor = Order.find(filter)
    .sort({ createdAt: 1 })
    .select("_id customerName customerPhone")
    .cursor();

  const bulkOps = [];
  const BATCH_SIZE = 200;

  async function flush() {
    if (!bulkOps.length) return;
    const res = await Order.bulkWrite(bulkOps, { ordered: false });
    updated += res.modifiedCount || 0;
    bulkOps.length = 0;
  }

  for await (const order of cursor) {
    scanned += 1;
    if (scanned > LIMIT) break;

    try {
      const customer = await resolveCustomer({
        phone: order.customerPhone,
        customerName: order.customerName,
      });

      bulkOps.push({
        updateOne: {
          filter: { _id: order._id },
          update: { $set: { customer: customer._id } },
        },
      });

      if (bulkOps.length >= BATCH_SIZE) {
        await flush();
      }
    } catch (err) {
      failed += 1;
      console.error(
        `Failed to backfill order ${order?._id}: ${err?.message || err}`
      );
    }
  }

  await flush();

  console.log(
    JSON.stringify(
      {
        apply: true,
        scanned,
        updated,
        failed,
      },
      null,
      2
    )
  );

  process.exit(0);
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
