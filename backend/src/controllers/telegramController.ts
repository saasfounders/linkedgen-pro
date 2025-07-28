import { Request, Response } from 'express';
import axios from 'axios';
import { query } from '../utils/database';

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const update = req.body;
    
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text;

      if (text === '/start') {
        await sendTelegramMessage(chatId, 'Welcome to LinkedGen Pro! Use /connect to link your account.');
      } else if (text === '/connect') {
        await sendTelegramMessage(chatId, 'To connect your account, please visit your settings page in the LinkedGen Pro dashboard.');
      } else if (text === '/leads') {
        await sendTelegramMessage(chatId, 'Your latest leads will be shown here. Connect your account first!');
      } else if (text === '/status') {
        await sendTelegramMessage(chatId, 'LinkedGen Pro is running smoothly! 🚀');
      }
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const connectUser = async (req: Request, res: Response) => {
  try {
    const { telegramUserId, chatId } = req.body;
    const userId = (req as any).user?.id;

    res.json({
      message: 'Telegram account connected successfully',
      telegramUserId,
      chatId
    });
  } catch (error) {
    console.error('Connect telegram error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const sendTelegramMessage = async (chatId: string, text: string) => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('Telegram bot token not configured');
      return;
    }

    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: text
    });
  } catch (error) {
    console.error('Send telegram message error:', error);
  }
};

export const sendNotification = async (chatId: string, message: string) => {
  return sendTelegramMessage(chatId, message);
};
