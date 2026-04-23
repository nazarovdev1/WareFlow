'use client';

import { useState, useEffect } from 'react';
import { useNotification } from '@/lib/NotificationContext';
import { Bot, Send, MessageSquare, Settings, Users, ToggleLeft, ToggleRight, Trash2, Plus, RefreshCw, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

type Tab = 'settings' | 'chats' | 'send';

export default function TelegramPage() {
  const { success, error, warning, info } = useNotification();
  const [activeTab, setActiveTab] = useState<Tab>('settings');
  const [configs, setConfigs] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    botToken: '',
    botName: '',
    welcomeMessage: 'Assalomu alaykum! WareFlow ERP botiga xush kelibsiz.',
    notifyNewOrder: true,
    notifyLowStock: true,
    notifyPayment: true,
    notifyDailyReport: true,
    dailyReportTime: '09:00',
  });

  const [selectedBot, setSelectedBot] = useState('');
  const [selectedChat, setSelectedChat] = useState('');
  const [broadcastMode, setBroadcastMode] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchConfigs(); }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/telegram');
      const data = await res.json();
      setConfigs(data.configs || data || []);
      if (data.configs?.[0]?.id || data[0]?.id) {
        const botId = (data.configs?.[0]?.id || data[0]?.id);
        setSelectedBot(botId);
        fetchChats(botId);
      }
    } catch { error('Xatolik', 'Bot konfiguratsiyasini yuklashda xato'); }
    setLoading(false);
  };

  const fetchChats = async (botId: string) => {
    try {
      const res = await fetch(`/api/telegram?chats=true&botId=${botId}`);
      const data = await res.json();
      setChats(data.chats || []);
    } catch {}
  };

  const handleSave = async () => {
    if (!form.botToken) { warning('Diqqat', 'Bot token kiritilishi shart'); return; }
    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        success('Saqlandi', 'Bot konfiguratsiyasi muvaffaqiyatli saqlandi');
        fetchConfigs();
        setForm({ botToken: '', botName: '', welcomeMessage: 'Assalomu alaykum! WareFlow ERP botiga xush kelibsiz.', notifyNewOrder: true, notifyLowStock: true, notifyPayment: true, notifyDailyReport: true, dailyReportTime: '09:00' });
      } else {
        const d = await res.json();
        error('Xatolik', d.error || 'Saqlashda xato');
      }
    } catch { error('Xatolik', 'Server bilan aloqa xatosi'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;
    try {
      await fetch(`/api/telegram?id=${id}`, { method: 'DELETE' });
      success('O\'chirildi', 'Bot konfiguratsiyasi o\'chirildi');
      fetchConfigs();
    } catch { error('Xatolik', 'O\'chirishda xato'); }
  };

  const handleSend = async () => {
    if (!message.trim()) { warning('Diqqat', 'Xabar matni bo\'sh'); return; }
    if (!broadcastMode && !selectedChat) { warning('Diqqat', 'Chat tanlang'); return; }
    setSending(true);
    try {
      const res = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId: selectedBot, chatId: broadcastMode ? 'all' : selectedChat, message }),
      });
      const data = await res.json();
      if (res.ok) {
        success('Yuborildi', `${data.sentCount || 1} ta chatga xabar yuborildi`);
        setMessage('');
      } else { error('Xatolik', data.error || 'Xabar yuborishda xato'); }
    } catch { error('Xatolik', 'Server bilan aloqa xatosi'); }
    setSending(false);
  };

  const tabs = [
    { key: 'settings' as Tab, label: 'Bot Sozlamalari', icon: Settings },
    { key: 'chats' as Tab, label: 'Chatlar', icon: Users },
    { key: 'send' as Tab, label: 'Xabar Yuborish', icon: Send },
  ];

  return (
    <div className="p-6 font-sans w-full h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
          <Bot size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Telegram Bot</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Telegram orqali ERP boshqaruvi va bildirishnomalar</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Yangi Bot Qo'shish</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Bot Token</label>
                <input type="text" value={form.botToken} onChange={e => setForm({ ...form, botToken: e.target.value })}
                  placeholder="123456:ABC-DEF..." className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Bot Nomi</label>
                <input type="text" value={form.botName} onChange={e => setForm({ ...form, botName: e.target.value })}
                  placeholder="WareFlow Bot" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Salomlashuv xabari</label>
                <textarea value={form.welcomeMessage} onChange={e => setForm({ ...form, welcomeMessage: e.target.value })} rows={2}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Kunlik hisobot vaqti</label>
                <input type="time" value={form.dailyReportTime} onChange={e => setForm({ ...form, dailyReportTime: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: 'notifyNewOrder', label: 'Yangi buyurtma' },
                { key: 'notifyLowStock', label: 'Zaxira tugashi' },
                { key: 'notifyPayment', label: 'To\'lov' },
                { key: 'notifyDailyReport', label: 'Kunlik hisobot' },
              ].map(item => (
                <button key={item.key} onClick={() => setForm({ ...form, [item.key]: !(form as any)[item.key] })}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${(form as any)[item.key] ? 'bg-blue-50 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300' : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500'}`}>
                  {(form as any)[item.key] ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-5 flex gap-3">
              <button onClick={handleSave} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus size={16} /> Saqlash
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mavjud Botlar</h2>
            {configs.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                <Bot size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm">Hali bot qo\'shilmagan</p>
              </div>
            ) : configs.map((cfg: any) => (
              <div key={cfg.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                      <Bot size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{cfg.botName || 'Nomsiz Bot'}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Token: {cfg.botToken?.substring(0, 10)}...</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${cfg.isActive ? 'bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400'}`}>
                      {cfg.isActive ? 'Faol' : 'Nofaol'}
                    </span>
                    <button onClick={() => handleDelete(cfg.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {cfg.notifyNewOrder && <span className="text-[10px] bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">Buyurtma</span>}
                  {cfg.notifyLowStock && <span className="text-[10px] bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">Zaxira</span>}
                  {cfg.notifyPayment && <span className="text-[10px] bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">To'lov</span>}
                  {cfg.notifyDailyReport && <span className="text-[10px] bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">Hisobot {cfg.dailyReportTime}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'chats' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ro'yxatdan O'tgan Chatlar</h2>
            <button onClick={() => selectedBot && fetchChats(selectedBot)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-lg transition-colors">
              <RefreshCw size={16} />
            </button>
          </div>
          {chats.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm">Hali chatlar yo'q. Telegram'da botga /start yuboring.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    <th className="text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase pb-3">Chat ID</th>
                    <th className="text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase pb-3">Foydalanuvchi</th>
                    <th className="text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase pb-3">Turi</th>
                    <th className="text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase pb-3">Holat</th>
                  </tr>
                </thead>
                <tbody>
                  {chats.map((chat: any) => (
                    <tr key={chat.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 text-sm font-mono text-slate-800 dark:text-white">{chat.chatId}</td>
                      <td className="py-3 text-sm text-slate-600 dark:text-slate-300">{chat.firstName || chat.username || '-'}</td>
                      <td className="py-3"><span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full text-slate-600 dark:text-slate-400">{chat.chatType}</span></td>
                      <td className="py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${chat.isActive ? 'bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400'}`}>
                          {chat.isActive ? 'Faol' : 'Nofaol'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'send' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-2xl">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Xabar Yuborish</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Bot tanlang</label>
              <select value={selectedBot} onChange={e => { setSelectedBot(e.target.value); fetchChats(e.target.value); }}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Tanlang...</option>
                {configs.map((c: any) => <option key={c.id} value={c.id}>{c.botName || c.botToken?.substring(0, 15)}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setBroadcastMode(false)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!broadcastMode ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                Bittaga yuborish
              </button>
              <button onClick={() => setBroadcastMode(true)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${broadcastMode ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                Hammaga yuborish
              </button>
            </div>

            {!broadcastMode && (
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Chat tanlang</label>
                <select value={selectedChat} onChange={e => setSelectedChat(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Tanlang...</option>
                  {chats.filter((c: any) => c.isActive).map((c: any) => <option key={c.id} value={c.chatId}>{c.firstName || c.username || c.chatId}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Xabar matni</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5}
                placeholder="Xabarni kiriting..."
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {message && (
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <div className="text-[10px] text-slate-400 mb-2 font-bold uppercase">Ko'rib chiqish</div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-sm text-slate-800 dark:text-white whitespace-pre-wrap">{message}</div>
              </div>
            )}

            <button onClick={handleSend} disabled={sending || !selectedBot}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
              <Send size={16} /> {sending ? 'Yuborilmoqda...' : 'Yuborish'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
