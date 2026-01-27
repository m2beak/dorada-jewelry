

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
