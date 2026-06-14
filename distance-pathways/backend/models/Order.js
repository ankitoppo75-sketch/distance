const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // What is being purchased - each service is paid individually
    itemType: {
      type: String,
      enum: ["course", "content", "projectRequest"],
      required: true,
    },
    itemRef: { type: mongoose.Schema.Types.ObjectId, required: true },
    itemTitle: { type: String, required: true },

    amount: { type: Number, required: true }, // in INR
    currency: { type: String, default: "INR" },

    // Razorpay identifiers
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },

    paymentMethod: { type: String, default: "" }, // card / upi / netbanking / wallet

    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
