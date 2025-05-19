import mongoose, { Schema, model, Types } from 'mongoose';
import { TransactionMetrics } from './transactionMetricsModel.js';

const transactionSchema = new Schema(
  {
    paymentIntentId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    customerName: { type: String, required: true },
    customerId: { type: Types.ObjectId, ref: 'User', required: true },
    paymentReason: { type: String, required: true },
    tempPropertyId: { type: String },
    propertyId: { type: Types.ObjectId, ref: 'Property' },
    customerEmail: { type: String, required: true },
    tempTourId: { type: String },
    tourId: { type: Types.ObjectId, ref: 'TourSchedule' },
    status: { type: String, default: 'succeeded' },
    metadata: { type: mongoose.Schema.Types.Mixed },
    paymentTier: {
      type: String,
      enum: ['standard', 'featured'],
      default: 'standard',
    },
  },
  { timestamps: true }
);

transactionSchema.post('save', async function (doc) {
  const metrics = await TransactionMetrics.findOneAndUpdate(
    {},
    {
      $inc: { totalRevenue: doc.amount, totalTransactions: 1 },
    },
    { upsert: true, new: true }
  );

  await metrics.save();
});

transactionSchema.post('deleteOne', async function (doc) {
  const metrics = await TransactionMetrics.findOneAndUpdate(
    {},
    {
      $inc: { totalRevenue: -doc.amount, totalTransactions: -1 },
    },
    { new: true }
  );

  await metrics.save();
});
export const Transaction = model('Transaction', transactionSchema);
