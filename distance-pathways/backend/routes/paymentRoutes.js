const express = require("express");
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const razorpay = require("../utils/razorpay");
const Order = require("../models/Order");
const Course = require("../models/Course");
const Content = require("../models/Content");
const ProjectRequest = require("../models/ProjectRequest");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Resolves the price and display title for the item being purchased
const resolveItem = async (itemType, itemRef) => {
  if (itemType === "course") {
    const course = await Course.findById(itemRef);
    if (!course) throw new Error("Course not found");
    if (course.isFree || course.price === 0) throw new Error("This course is free - no payment required");
    return { amount: course.price, title: course.title };
  }

  if (itemType === "content") {
    const content = await Content.findById(itemRef);
    if (!content) throw new Error("Content not found");
    if (content.isFree || content.price === 0) throw new Error("This item is free - no payment required");
    return { amount: content.price, title: content.title };
  }

  if (itemType === "projectRequest") {
    const request = await ProjectRequest.findById(itemRef);
    if (!request) throw new Error("Request not found");
    if (!request.isPriceQuoted || request.quotedPrice <= 0) {
      throw new Error("This request has not been quoted yet");
    }
    return { amount: request.quotedPrice, title: `${request.serviceType} - ${request.topic}` };
  }

  throw new Error("Invalid item type");
};

// @route   POST /api/payments/create-order
// @desc    Create a Razorpay order for ONE individual item (course / content / project request)
router.post(
  "/create-order",
  protect,
  asyncHandler(async (req, res) => {
    const { itemType, itemRef } = req.body;

    if (!itemType || !itemRef) {
      res.status(400);
      throw new Error("itemType and itemRef are required");
    }

    const { amount, title } = await resolveItem(itemType, itemRef);

    // Razorpay amount is in the smallest currency unit (paise for INR)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `dp_${itemType}_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        itemType,
        itemRef: itemRef.toString(),
      },
    });

    const order = await Order.create({
      user: req.user._id,
      itemType,
      itemRef,
      itemTitle: title,
      amount,
      razorpayOrderId: razorpayOrder.id,
    });

    res.status(201).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: order._id,
      itemTitle: title,
      // Frontend uses these to prefill Razorpay Checkout (supports Card, UPI, Netbanking, Wallets)
      prefill: { name: req.user.name, email: req.user.email, contact: req.user.phone || "" },
    });
  })
);

// @route   POST /api/payments/verify
// @desc    Verify Razorpay payment signature and unlock the purchased item
router.post(
  "/verify",
  protect,
  asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, method } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400);
      throw new Error("Missing payment verification fields");
    }

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id, user: req.user._id });
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      order.status = "failed";
      await order.save();
      res.status(400);
      throw new Error("Payment verification failed");
    }

    order.status = "paid";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentMethod = method || "unknown";
    await order.save();

    // Unlock the purchased item for this user
    req.user.purchasedContent.push({
      itemType: order.itemType,
      item: order.itemRef,
      order: order._id,
    });

    if (order.itemType === "course") {
      if (!req.user.enrolledCourses.includes(order.itemRef)) {
        req.user.enrolledCourses.push(order.itemRef);
        await Course.findByIdAndUpdate(order.itemRef, { $inc: { studentsEnrolled: 1 } });
      }
    }

    if (order.itemType === "projectRequest") {
      await ProjectRequest.findByIdAndUpdate(order.itemRef, {
        paymentStatus: "paid",
        status: "inProgress",
      });
    }

    await req.user.save();

    res.json({ success: true, message: "Payment successful! Access unlocked.", order });
  })
);

// @route   GET /api/payments/my-orders
router.get(
  "/my-orders",
  protect,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  })
);

module.exports = router;
