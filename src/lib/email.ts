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

export async function sendOrderStatusEmail(order: Order, newStatus: string) {
  if (!order.customer_email) return;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6d28d9;">Order Status Update</h2>
      <p>Hi ${order.customer_name},</p>
      <p>The status of your order <strong>${order.reference}</strong> has been updated to: <strong><span style="text-transform: uppercase;">${newStatus}</span></strong>.</p>
      
      <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
        Thank you for shopping with ${STORE_NAME}!
      </p>
    </div>
  `;

  const mailOptions = {
    from: `"${STORE_NAME}" <${STORE_EMAIL}>`,
    to: order.customer_email,
    subject: `Order Update: ${newStatus.toUpperCase()} - ${order.reference}`,
    html,
  };

  await transporter.sendMail(mailOptions);
}
