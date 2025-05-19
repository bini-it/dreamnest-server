import stripe from 'stripe';
import { Transaction } from '../models/transactionModel.js';

const createPaymentIntent = async (req, res) => {
  const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
  const {
    amount,
    currency,
    customerName,
    customerEmail,
    paymentReason,
    tempPropertyId,
    tempTourId,
    paymentTier,
  } = req.body;
  // console.log('paymentintent',amount, currency, customerName, customerEmail, paymentReason);

  try {
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: amount * 100,
      currency: currency,
      metadata: {
        customerName,
        paymentReason,
        customerEmail,
        tempPropertyId,
        tempTourId, 
        paymentTier,
      },
    });
    const transaction = new Transaction({
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: currency,
      customerName,
      customerId: req.user._id,
      customerEmail,
      paymentReason,
      tempPropertyId,
      tempTourId, 
      paymentTier,
      status: 'succeeded',
    });
    await transaction.save();

    // console.log('PAYMENT INTENT-->', paymentIntent);
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
};

export { createPaymentIntent };
