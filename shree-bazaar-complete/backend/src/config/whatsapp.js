const axios = require("axios");

// Meta's official WhatsApp Cloud API — https://graph.facebook.com/{version}/{phone-number-id}/messages
// This requires, before any of it can actually send anything:
//   1. A Meta Business Account + a WhatsApp Business Account (WABA)
//   2. A verified WhatsApp business phone number
//   3. A permanent access token (via a System User in Meta Business Suite — NOT the
//      24-hour temporary token from the developer console, which is testing-only)
//   4. Message TEMPLATES created and approved by Meta for anything sent outside a
//      24-hour customer-service window (which covers basically all order confirmations
//      and every marketing/promotional message) — this approval step is on Meta's side
//      and can take anywhere from minutes to ~48 hours, and can't be skipped or sped up
//      from here. Free-form text only works within 24h of the customer's last message.
//
// None of that can be done by writing code — it's account setup on Meta's side, the
// same category of prerequisite as Razorpay/Shiprocket needing real credentials, just
// with an added approval wait. Until WHATSAPP_ACCESS_TOKEN/WHATSAPP_PHONE_NUMBER_ID are
// set, every function here silently no-ops so nothing else in checkout/admin breaks.

const API_VERSION = process.env.WHATSAPP_API_VERSION || "v22.0";

const isConfigured = () => !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

// Sends an approved template message. `templateName` must exactly match a template
// already approved in Meta Business Manager. `bodyParams` are the {{1}}, {{2}}...
// variables in that template's body, in order, as plain strings.
async function sendTemplateMessage(toPhoneNumber, templateName, bodyParams = []) {
  if (!isConfigured()) {
    console.log(`[WhatsApp not configured — would have sent "${templateName}" to ${toPhoneNumber}]`);
    return { sent: false, reason: "not_configured" };
  }
  if (!toPhoneNumber || !templateName) return { sent: false, reason: "missing_params" };

  try {
    const { data } = await axios.post(
      `https://graph.facebook.com/${API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: toPhoneNumber.replace(/[^\d]/g, ""), // digits only, with country code, no leading +
        type: "template",
        template: {
          name: templateName,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en" },
          components: bodyParams.length
            ? [{ type: "body", parameters: bodyParams.map((text) => ({ type: "text", text: String(text) })) }]
            : undefined,
        },
      },
      { headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` } }
    );
    return { sent: true, messageId: data.messages?.[0]?.id };
  } catch (err) {
    console.error("WhatsApp send failed:", err.response?.data ?? err.message);
    return { sent: false, reason: err.response?.data?.error?.message ?? err.message };
  }
}

// --- Trigger points — each references an env var for the approved template name, since
// the actual template names are decided when you create them in Meta Business Manager,
// not something this code can assume in advance.

async function notifyOrderPlaced(order, phone) {
  if (!process.env.WHATSAPP_TEMPLATE_ORDER_PLACED) return;
  await sendTemplateMessage(phone, process.env.WHATSAPP_TEMPLATE_ORDER_PLACED, [
    order.id.slice(0, 8).toUpperCase(),
    String(order.total),
  ]);
}

async function notifyOrderStatusUpdate(order, phone, status, trackingId) {
  if (!process.env.WHATSAPP_TEMPLATE_ORDER_STATUS_UPDATE) return;
  await sendTemplateMessage(phone, process.env.WHATSAPP_TEMPLATE_ORDER_STATUS_UPDATE, [
    order.id.slice(0, 8).toUpperCase(),
    status || "",
    trackingId || "",
  ]);
}

async function notifyOrderCancelled(order, phone) {
  if (!process.env.WHATSAPP_TEMPLATE_ORDER_CANCELLED) return;
  await sendTemplateMessage(phone, process.env.WHATSAPP_TEMPLATE_ORDER_CANCELLED, [order.id.slice(0, 8).toUpperCase()]);
}

module.exports = { isConfigured, sendTemplateMessage, notifyOrderPlaced, notifyOrderStatusUpdate, notifyOrderCancelled };
