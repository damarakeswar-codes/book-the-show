import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import { createServer } from "http";
import path from "path";
import cors from "cors";
import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay (Mock keys if not provided)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mock_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_secret",
});

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Razorpay: Create Order
  app.post("/api/payments/order", async (req, res) => {
    try {
      const { amount, currency = "INR", receipt } = req.body;
      const amountInRupees = Number(amount);

      if (!Number.isFinite(amountInRupees) || amountInRupees <= 0) {
        return res.status(400).json({ error: "Invalid amount. Amount must be a positive number." });
      }

      const options = {
        amount: Math.round(amountInRupees * 100), // amount in paise
        currency,
        receipt: receipt || `booking_${Date.now()}`,
      };
      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error) {
      console.error("Razorpay Order Error:", error);
      res.status(500).json({
        error: "Failed to create order",
        details: (error as any)?.error?.description || (error as Error)?.message || "Unknown Razorpay error"
      });
    }
  });

  // Razorpay: Verify Payment
  app.post("/api/payments/verify", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "mock_secret")
        .update(sign.toString())
        .digest("hex");

      if (razorpay_signature === expectedSign) {
        res.json({ status: "success", message: "Payment verified successfully" });
      } else {
        res.status(400).json({ status: "failure", message: "Invalid signature" });
      }
    } catch (error) {
      console.error("Payment Verification Error:", error);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  // Socket.io for Real-Time Seat Locking
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("lock_seat", (data) => {
      // Broadcast to others that a seat is being locked
      // In a real app, we'd also update the DB here if we weren't using Firestore directly on frontend
      // But since we use Firestore, we can just broadcast the event for UI feedback
      io.emit("seat_locked", data);
    });

    socket.on("unlock_seat", (data) => {
      io.emit("seat_unlocked", data);
    });

    socket.on("confirm_booking", (data) => {
      io.emit("booking_confirmed", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
