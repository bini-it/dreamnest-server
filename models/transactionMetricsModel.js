import { Schema, model } from 'mongoose';

const transactionMetricsSchema = new Schema({
  totalRevenue: { type: Number, default: 0 },
  totalTransactions: { type: Number, default: 0 },
});

export const TransactionMetrics = model(
  'TransactionMetrics',
  transactionMetricsSchema
);
