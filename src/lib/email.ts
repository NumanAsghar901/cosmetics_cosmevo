import nodemailer from 'nodemailer';
import { Order } from './types';
import { fmtPrice } from './utils';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const STORE_NAME = 'Cosmevo Cosmeceuticals';
const STORE_EMAIL = process.env.SMTP_USER || 'hello@cosmevo.com';

export async function sendOrderConfirmationEmail(order: Order) {
  if (!order.customer_email) return;

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${fmtPrice(item.price)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${fmtPrice(item.price * item.qty)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6d28d9;">Order Confirmed!</h2>
      <p>Hi ${order.customer_name},</p>
      <p>Thank you for your order. We have received it and it is currently being processed.</p>
      
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p><strong>Order Reference:</strong> ${order.reference}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Delivery Address:</strong> ${order.customer_address}${order.province && !order.customer_address.includes(order.province) ? `, ${order.province}` : ''}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px;">Qty</th>
            <th style="padding: 10px; text-align: right;">Price</th>
            <th style="padding: 10px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="margin-top: 20px; text-align: right;">
        <p><strong>Subtotal:</strong> ${fmtPrice(order.subtotal)}</p>
        ${Boolean(order.discount_amount && order.discount_amount > 0) ? `
          <p style="color: #059669;"><strong>Coupon Discount${order.coupon_code ? ` (${order.coupon_code})` : ''}:</strong> -${fmtPrice(order.discount_amount || 0)}</p>
        ` : ''}
        <p><strong>Shipping Fee${order.province ? ` (${order.province})` : ''}:</strong> ${
          order.shipping_fee !== undefined && order.shipping_fee !== null
            ? (order.shipping_fee > 0 ? fmtPrice(order.shipping_fee) : 'Free')
            : (order.total > order.subtotal ? fmtPrice(order.total - order.subtotal) : 'Free')
        }</p>
        <p><strong>Total:</strong> <span style="color: #6d28d9; font-size: 18px; font-weight: bold;">${fmtPrice(order.total)}</span></p>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="font-size: 14px; color: #4b5563; margin-bottom: 10px;">Changed your mind? You can cancel your order before it ships.</p>
        <a href="mailto:info@cosmevo.pk?subject=Cancel%20Order%20${order.reference}&body=Hello,%0D%0A%0D%0APlease%20cancel%20my%20order%20${order.reference}.%0D%0A%0D%0AThank%20you!" style="display: inline-block; padding: 10px 18px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: bold;">Cancel Order</a>
      </div>
      
      <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
        If you have any questions, reply to this email or contact us on WhatsApp.
      </p>
    </div>
  `;

  const mailOptions = {
    from: `"${STORE_NAME}" <${STORE_EMAIL}>`,
    to: order.customer_email,
    bcc: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    subject: `Order Confirmation - ${order.reference}`,
    html,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendOrderStatusEmail(order: Order, newStatus: string, trackingNumber?: string) {
  if (!order.customer_email) return;

  const isShipped = newStatus.toLowerCase() === 'shipped';
  const effectiveTracking = trackingNumber || order.tracking_number || (order.notes?.match(/Leopards Tracking:\s*([^\s|]+)/)?.[1]);
  const LEOPARDS_TRACKING_URL = 'https://pk.leopardscourier.com/tracking';

  let subject = `Order Update: ${newStatus.toUpperCase()} - ${order.reference}`;
  let statusBanner = '';
  let trackingSection = '';

  if (isShipped) {
    subject = `Your Order ${order.reference} Has Been Shipped via Leopards Courier! - ${STORE_NAME}`;
    
    if (effectiveTracking) {
      trackingSection = `
        <div style="background: #fbf7f9; border: 2px dashed #6d28d9; border-radius: 12px; padding: 22px; margin: 24px 0; text-align: center;">
          <div style="display: inline-block; background-color: #ede9fe; color: #5b21b6; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; rounded-full: 9999px; border-radius: 20px; margin-bottom: 10px;">
            Leopards Courier Shipment
          </div>
          <h3 style="margin: 4px 0 8px 0; color: #1e1b4b; font-size: 16px; font-weight: bold;">
            Consignment Tracking Number
          </h3>
          <div style="font-size: 26px; font-weight: 900; color: #6d28d9; letter-spacing: 3px; font-family: 'Courier New', Courier, monospace; background: #ffffff; border: 1px solid #e5e7eb; padding: 10px 16px; border-radius: 8px; display: inline-block; margin-bottom: 14px;">
            ${effectiveTracking}
          </div>
          <p style="margin: 0 0 16px 0; font-size: 13px; color: #4b5563; line-height: 1.5; max-width: 480px; margin-left: auto; margin-right: auto;">
            Your parcel has been handed over to Leopards Courier. To track real-time delivery progress, visit the link below and enter your tracking number <strong>${effectiveTracking}</strong>:
          </p>
          <a href="${LEOPARDS_TRACKING_URL}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%); background-color: #6d28d9; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: bold; box-shadow: 0 4px 6px -1px rgba(109, 40, 217, 0.25);">
            Track with Leopards Courier →
          </a>
          <p style="margin: 14px 0 0 0; font-size: 11.5px; color: #6b7280;">
            Direct Tracking URL: <a href="${LEOPARDS_TRACKING_URL}" target="_blank" style="color: #6d28d9; font-weight: 600;">${LEOPARDS_TRACKING_URL}</a>
          </p>
        </div>
      `;
    } else {
      trackingSection = `
        <div style="background: #fbf7f9; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #374151;">
            Your package has been dispatched via courier service and is on its way to your delivery address.
          </p>
        </div>
      `;
    }
  }

  const itemsListHtml = Array.isArray(order.items)
    ? order.items.map(item => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #1f2937;">${item.product_name}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; text-align: center; font-size: 13px; color: #4b5563;">${item.qty}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; text-align: right; font-size: 13px; font-weight: 600; color: #1f2937;">${fmtPrice(item.price * item.qty)}</td>
        </tr>
      `).join('')
    : '';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #f3f4f6; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <!-- Header Banner -->
      <div style="background-color: #1e1b4b; padding: 28px 24px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">${STORE_NAME}</h1>
        <p style="color: #c7d2fe; font-size: 13px; margin: 6px 0 0 0;">
          ${isShipped ? 'Package Dispatched & On Its Way' : 'Order Status Update'}
        </p>
      </div>

      <div style="padding: 24px 28px;">
        <p style="font-size: 15px; color: #1f2937; margin: 0 0 12px 0;">
          Hi <strong>${order.customer_name}</strong>,
        </p>
        
        <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 16px 0;">
          ${isShipped 
            ? `Great news! Your order <strong>#${order.reference}</strong> has been shipped and is currently in transit to you.` 
            : `The status of your order <strong>#${order.reference}</strong> has been updated to: <strong style="text-transform: uppercase; color: #6d28d9;">${newStatus}</strong>.`}
        </p>

        <!-- Tracking Section (Only for shipped status) -->
        ${trackingSection}

        <!-- Order Summary Card -->
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; margin: 20px 0;">
          <h4 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;">
            Order Information
          </h4>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
            ${itemsListHtml}
          </table>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 10px; display: flex; justify-content: space-between; font-size: 14px;">
            <span style="color: #4b5563;">Total Amount to Pay:</span>
            <strong style="color: #6d28d9; font-size: 16px;">Rs. ${Number(order.total || 0).toLocaleString()}</strong>
          </div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">
            Payment: ${order.payment_method || 'Cash on Delivery (COD)'}
          </div>

          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #4b5563; line-height: 1.5;">
            <strong>Delivery Address:</strong> ${order.customer_address}${order.province && !order.customer_address.includes(order.province) ? `, ${order.province}` : ''}
            ${order.customer_phone ? `<br/><strong>Contact:</strong> ${order.customer_phone}` : ''}
          </div>
        </div>

        <p style="margin: 24px 0 0 0; font-size: 12.5px; color: #6b7280; line-height: 1.5;">
          Have questions about your delivery? Feel free to reply directly to this email or reach us on WhatsApp at <strong>0309 4560316</strong>.
        </p>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 11px; color: #9ca3af;">
          Thank you for choosing ${STORE_NAME}!
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"${STORE_NAME}" <${STORE_EMAIL}>`,
    to: order.customer_email,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
}
