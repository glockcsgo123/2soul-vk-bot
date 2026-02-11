const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(require('cors')());

// ============================================
// ВСТАВЬТЕ СВОИ ДАННЫЕ:
// ============================================
const VK_TOKEN = 'vk1.a.4f_lZe6CLpsgGbXxEQLhzncgKAT1nsTIWXyMcRijj0onyGIn9V-delylGQG10xWT2F7YUiN3v1FjqqDi3p4dgJaTHHV6x7qwKLVemCbBH9AvtLz0510-b8tMzbShJ4vb8gLoOaTh2hL24kyolJkB3-Q3UunTMIIkdo9GLLqTZ3EI_hobP8ideDQsAWQyGL1q-e0EjP9hcO_hbwqURY44JA';
const ADMIN_VK_ID = '514254079';
// ============================================

app.get('/', (req, res) => {
    res.json({ 
        status: '✅ 2SOUL Bot работает!',
        time: new Date().toLocaleString('ru-RU')
    });
});

app.post('/api/orders', async (req, res) => {
    try {
        const order = req.body;
        
        if (!order || !order.customer) {
            return res.status(400).json({ error: 'Неполные данные' });
        }

        const message = formatMessage(order);
        await sendToVK(message);

        console.log('✅ Заказ отправлен');
        res.json({ success: true });

    } catch (error) {
        console.error('❌ Ошибка:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/test', async (req, res) => {
    try {
        await sendToVK('🧪 Тест! Бот работает!');
        res.json({ success: true, message: 'Сообщение отправлено!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

function formatMessage(order) {
    const items = order.items.map(item => 
        `  • ${item.name} (${item.size}) × ${item.quantity} — ${(item.price * item.quantity).toLocaleString('ru-RU')} ₽`
    ).join('\n');

    const payment = {
        'sbp': 'СБП',
        'cash': 'Наличными',
        'card': 'Картой'
    }[order.payment] || order.payment;

    return `
🛍 НОВЫЙ ЗАКАЗ 2SOUL!
━━━━━━━━━━━━━━━━━━━━━

👤 ${order.customer.name}
📱 ${order.customer.phone}
📧 ${order.customer.email || 'не указан'}

📦 ТОВАРЫ:
${items}

💰 СУММА: ${order.total.toLocaleString('ru-RU')} ₽

📍 АДРЕС:
${order.delivery}

💳 ОПЛАТА: ${payment}

${order.comment ? `💬 ${order.comment}\n` : ''}
🕐 ${order.date}
━━━━━━━━━━━━━━━━━━━━━
    `.trim();
}

async function sendToVK(message) {
    const response = await axios.post('https://api.vk.com/method/messages.send', null, {
        params: {
            peer_id: ADMIN_VK_ID,
            message: message,
            random_id: Date.now(),
            access_token: VK_TOKEN,
            v: '5.131'
        }
    });

    if (response.data.error) {
        throw new Error(response.data.error.error_msg);
    }

    return response.data;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
