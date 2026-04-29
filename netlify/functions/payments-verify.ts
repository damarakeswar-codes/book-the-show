import crypto from "crypto";

const jsonHeaders = {
  "Content-Type": "application/json",
};

export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: JSON.stringify({ status: "failure", message: "Missing payment verification fields" }),
      };
    }

    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(sign)
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return {
        statusCode: 200,
        headers: jsonHeaders,
        body: JSON.stringify({ status: "success", message: "Payment verified successfully" }),
      };
    }

    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ status: "failure", message: "Invalid signature" }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: "Verification failed", details: error?.message || "Unknown error" }),
    };
  }
};
