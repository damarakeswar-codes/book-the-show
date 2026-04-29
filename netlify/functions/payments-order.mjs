import Razorpay from "razorpay";

const jsonHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: true }),
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const amountInRupees = Number(body.amount);
    const currency = body.currency || "INR";
    const receipt = body.receipt || `booking_${Date.now()}`;

    if (!Number.isFinite(amountInRupees) || amountInRupees <= 0) {
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: JSON.stringify({ error: "Invalid amount. Amount must be a positive number." }),
      };
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amountInRupees * 100),
      currency,
      receipt,
    });

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify(order),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({
        error: "Failed to create order",
        details: error?.error?.description || error?.message || "Unknown Razorpay error",
      }),
    };
  }
};
