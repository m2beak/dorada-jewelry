import { getTelegramConfig, formatPrice } from './database';
import type { Order } from '@/types';

export const sendOrderNotification = async (order: Order): Promise<{ success: boolean; messageId?: number; error?: string }> => {
  const config = await getTelegramConfig();

  if (!config.enabled || !config.botToken || !config.chatId) {
    console.log('Telegram notifications disabled or not configured');
    return { success: false, error: 'Telegram not configured' };
  }

  const message = formatOrderMessage(order);

  try {
    // Use a CORS proxy to bypass browser restrictions
    const PROXY_URL = 'https://corsproxy.io/?';
    const TELEGRAM_URL = `https://api.telegram.org/bot${config.botToken}/sendMessage`;

    const response = await fetch(PROXY_URL + encodeURIComponent(TELEGRAM_URL), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();

    if (data.ok) {
      console.log('Telegram notification sent successfully');
      return { success: true, messageId: data.result.message_id };
    } else {
      console.error('Telegram API error:', data);
      return { success: false, error: data.description || 'Telegram API error' };
    }
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return { success: false, error: 'Network error' };
  }
};

export const formatOrderMessage = (order: Order): string => {
  const itemsList = order.items.map((item, index) =>
    `${index + 1}. ${item.nameAr}\n   الكود: <code>${item.sku}</code>\n   السعر: ${formatPrice(item.price)} × ${item.quantity} = ${formatPrice(item.price * item.quantity)}`
  ).join('\n\n');

  const orderDate = new Date(order.createdAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
🛒 <b>طلب جديد من دورادا!</b>

📋 <b>رقم الطلب:</b> #${order.id.slice(-6).toUpperCase()}
📅 <b>التاريخ:</b> ${orderDate}
📊 <b>الحالة:</b> ${order.statusAr}

👤 <b>معلومات العميل:</b>
• الاسم: ${order.customerName}
• الهاتف: ${order.customerPhone}
• العنوان: ${order.customerAddress}
• المدينة: ${order.customerCity}

📦 <b>المنتجات:</b>
${itemsList}

💰 <b>المجموع الكلي:</b> ${formatPrice(order.total)}

✨ شكراً لتسوقكم مع دورادا!
`;
};

export const testTelegramConnection = async (botToken: string, chatId: string): Promise<{ success: boolean; error?: string }> => {
  if (!botToken || !chatId) {
    return { success: false, error: 'Bot Token و Chat ID مطلوبان' };
  }

  try {
    const PROXY_URL = 'https://corsproxy.io/?';
    const TELEGRAM_URL = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(PROXY_URL + encodeURIComponent(TELEGRAM_URL), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: '✅ <b>تم الاتصال بنجاح!</b>\n\nبوت دورادا جاهز لاستقبال الطلبات. 🎉',
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();

    if (data.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.description || 'فشل الاتصال' };
    }
  } catch (error) {
    console.error('Telegram test failed:', error);
    return { success: false, error: 'خطأ في الاتصال بالشبكة' };
  }
};

// Get bot info to verify token
export const getBotInfo = async (botToken: string): Promise<{ success: boolean; username?: string; error?: string }> => {
  try {
    const PROXY_URL = 'https://corsproxy.io/?';
    const TELEGRAM_URL = `https://api.telegram.org/bot${botToken}/getMe`;

    const response = await fetch(PROXY_URL + encodeURIComponent(TELEGRAM_URL));
    const data = await response.json();

    if (data.ok) {
      return { success: true, username: data.result.username };
    } else {
      return { success: false, error: data.description };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
};
