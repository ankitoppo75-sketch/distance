const Razorpay = require("razorpay");

// If RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set (e.g. while testing the app before
// the payment gateway is connected), don't crash the whole server - the Razorpay SDK throws
// synchronously if either value is missing. Payment routes check `isRazorpayConfigured`
// and return a friendly error instead of letting the import error crash startup.
const isRazorpayConfigured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

const razorpay = isRazorpayConfigured
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

if (!isRazorpayConfigured) {
  console.warn(
    "[razorpay] RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set. Payment features are disabled until these are configured."
  );
}

module.exports = { razorpay, isRazorpayConfigured };
