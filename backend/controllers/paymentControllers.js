// backend/controllers/paymentController.js
import catchAsyncError from "../middlewares/catchAsyncError.js";
import Order from "../models/order.js";
import Stripe from "stripe";

// Function to safely initialize Stripe only when needed
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not defined in environment variables!");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

// Create Stripe checkout session => /api/payment/checkout_session
export const stripeCheckoutSession = catchAsyncError(async (req, res, next) => {
  const stripe = getStripe(); // Initialize Stripe here

  const body = req?.body;

  const line_items = body?.orderItems?.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item?.name,
        images: [item?.image],
        metadata: { productId: item?.product },
      },
      unit_amount: item?.price * 100, // Stripe expects amount in cents
    },
    tax_rates: ["txr_1PIWD605HB41KwPhWwtRnZGB"], // Your tax rate
    quantity: item?.quantity,
  }));

  const shipping_rate =
    body?.itemsPrice >= 200
      ? "shr_1PIW0i05HB41KwPhjcUG16Ls"
      : "shr_1PIVzo05HB41KwPhou63FufW";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${process.env.FRONTEND_URL}/me/orders?order_success=true`,
    cancel_url: `${process.env.FRONTEND_URL}`,
    customer_email: req?.user?.email,
    client_reference_id: req?.user?._id?.toString(),
    mode: "payment",
    metadata: { ...body?.shippingInfo, itemsPrice: body?.itemsPrice },
    shipping_options: [{ shipping_rate }],
    line_items,
  });

  res.status(200).json({ url: session.url });
});

// Helper function to reconstruct order items from Stripe
const getOrderItems = async (stripe, line_items) => {
  const cartItems = await Promise.all(
    line_items?.data?.map(async (item) => {
      const product = await stripe.products.retrieve(item.price.product);
      const productId = product.metadata.productId;

      return {
        product: productId,
        name: product.name,
        price: item.price.unit_amount_decimal / 100,
        quantity: item.quantity,
        image: product.images[0],
      };
    })
  );

  return cartItems;
};

// Stripe webhook handler => /api/payment/webhook
export const stripeWebhook = catchAsyncError(async (req, res, next) => {
  const stripe = getStripe(); // Initialize Stripe here

  try {
    const signature = req.headers["stripe-signature"];
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const line_items = await stripe.checkout.sessions.listLineItems(session.id);
      const orderItems = await getOrderItems(stripe, line_items);

      const user = session.client_reference_id;
      const totalAmount = session.amount_total / 100;
      const taxAmount = session.total_details.amount_tax / 100;
      const shippingAmount = session.total_details.amount_shipping;
      const itemsPrice = session.metadata.itemsPrice;

      const shippingInfo = {
        address: session.metadata.address,
        city: session.metadata.city,
        phoneNo: session.metadata.phoneNo,
        zipCode: session.metadata.zipCode,
        country: session.metadata.country,
      };

      const paymentInfo = {
        id: session.payment_intent,
        status: session.payment_status,
      };

      const orderData = {
        shippingInfo,
        orderItems,
        itemsPrice,
        taxAmount,
        shippingAmount,
        totalAmount,
        paymentInfo,
        paymentMethod: "Card",
        user,
      };

      await Order.create(orderData);
      res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error("Stripe Webhook Error:", error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});
