import api from "../api/axios";

/**
 * Opens Razorpay Checkout for a single item (course / content / project request).
 * Supports Card, UPI, Netbanking and Wallets out of the box via Razorpay.
 *
 * @param {Object} params
 * @param {"course"|"content"|"projectRequest"} params.itemType
 * @param {string} params.itemRef - Mongo _id of the item being purchased
 * @param {Object} params.user - current logged in user
 * @param {Object} params.theme - { primaryColor, siteName, logoUrl }
 * @param {Function} params.onSuccess - called with verification response on success
 * @param {Function} params.onError - called with error message on failure
 */
export const payForItem = async ({ itemType, itemRef, user, theme, onSuccess, onError }) => {
  try {
    const { data } = await api.post("/payments/create-order", { itemType, itemRef });

    if (typeof window.Razorpay === "undefined") {
      onError?.("Payment gateway failed to load. Please check your internet connection.");
      return;
    }

    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: theme?.siteName || "Distance Pathways",
      description: data.itemTitle,
      image: theme?.logoUrl || undefined,
      order_id: data.orderId,
      prefill: data.prefill,
      // Explicitly surface all major payment methods
      method: {
        card: true,
        upi: true,
        netbanking: true,
        wallet: true,
      },
      theme: { color: theme?.primaryColor || "#2A4DD0" },
      handler: async (response) => {
        try {
          const verifyRes = await api.post("/payments/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            method: response.method || "razorpay",
          });
          onSuccess?.(verifyRes.data);
        } catch (err) {
          onError?.(err.response?.data?.message || "Payment verification failed");
        }
      },
      modal: {
        ondismiss: () => {
          onError?.("Payment cancelled");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    onError?.(err.response?.data?.message || "Unable to start payment");
  }
};
