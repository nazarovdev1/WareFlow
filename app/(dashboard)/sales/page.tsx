'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, ShoppingCart, User, MapPin, CreditCard, Tag, Package } from 'lucide-react';
import { useNotification } from '@/lib/NotificationContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function SalesPage() {
  const { success, error } = useNotification();
  const { t } = useLanguage();

  // State
  const [customers, setCustomers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchProducts, setSearchProducts] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch data
  useEffect(() => {
    fetch('/api/customers').then(res => res.json()).then(data => {
      setCustomers(Array.isArray(data) ? data : data.data || []);
    }).catch(console.error);

    fetch('/api/warehouses').then(res => res.json()).then(data => {
      setWarehouses(Array.isArray(data) ? data : data.data || []);
    }).catch(console.error);

    fetch('/api/products').then(res => res.json()).then(data => {
      setProducts(Array.isArray(data) ? data : data.data || []);
    }).catch(console.error);
  }, []);

  // Filter products
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchProducts.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchProducts.toLowerCase()))
  );

  // Add product to cart
  const addToCart = (product: any) => {
    const existing = cartItems.find(item => item.productId === product.id);
    if (existing) {
      setCartItems(cartItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: 1,
        price: product.sellPrice || 0,
      }]);
    }
    setSearchProducts('');
    setShowProductSearch(false);
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCartItems(cartItems.filter(item => item.productId !== productId));
  };

  // Update quantity
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems(cartItems.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    ));
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const finalAmount = subtotal - discount;

  // Submit order
  const handleSubmit = async () => {
    if (!selectedWarehouse) {
      error(t('messages', 'error'), t('warehouse', 'title'));
      return;
    }
    if (cartItems.length === 0) {
      error(t('messages', 'error'), t('messages', 'selectProduct'));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer || null,
          warehouseId: selectedWarehouse,
          discount,
          paymentMethod,
          notes,
          items: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      if (!response.ok) throw new Error('Buyurtma yaratilmadi');

      success(t('messages', 'saved'), t('sales', 'newSale'));

      // Reset form
      setCartItems([]);
      setDiscount(0);
      setNotes('');
      setSelectedCustomer('');
    } catch (err) {
      error(t('messages', 'error'), t('sales', 'title') + ' ' + t('messages', 'error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 font-sans w-full h-full text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">{t('sales', 'title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">{t('sales', 'newSale')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Product Selection */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer & Warehouse */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  <User size={14} className="inline mr-1" /> {t('sales', 'customer')} (ixtiyoriy)
                </label>
                <select
                  value={selectedCustomer}
                  onChange={e => setSelectedCustomer(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="">{t('sales', 'customer')}siz</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id} className="dark:bg-slate-700">{c.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  <MapPin size={14} className="inline mr-1" /> {t('warehouse', 'title')} *
                </label>
                <select
                  value={selectedWarehouse}
                  onChange={e => setSelectedWarehouse(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="">{t('common', 'select')}...</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id} className="dark:bg-slate-700">{w.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Product Search */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder={t('products', 'productName') + ' ' + t('common', 'search') + ' (nom yoki SKU)...'}
                value={searchProducts}
                onChange={e => {
                  setSearchProducts(e.target.value);
                  setShowProductSearch(true);
                }}
                onFocus={() => setShowProductSearch(true)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
              />

              {/* Product Dropdown */}
              {showProductSearch && searchProducts && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">{t('common', 'noData')}</div>
                  ) : (
                    filteredProducts.slice(0, 10).map(product => (
                      <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                      >
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{product.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {product.sku || '-'} • ${product.sellPrice}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 min-h-[300px]">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-4">
              <ShoppingCart size={18} className="inline mr-2" />
              Savatcha ({cartItems.length})
            </h3>

            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-slate-500">
                <Package size={48} className="mb-3 opacity-30" />
                <p className="text-sm">Savatcha bo&apos;sh</p>
                <p className="text-xs mt-1">{t('products', 'title')}larni qo&apos;shing</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map(item => (
                  <div key={item.productId} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.productName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{item.sku || '-'}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={e => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                          className="w-16 text-center bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg py-1 text-sm text-slate-800 dark:text-slate-200"
                        />
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          ${(item.quantity * item.price).toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">${item.price}/dona</div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-500 hover:text-red-600 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-4">{t('sales', 'orderNumber')} {t('common', 'description')}</h3>

            {/* Payment Method */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                <CreditCard size={14} className="inline mr-1" /> {t('sales', 'paymentMethod')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'CASH', label: t('sales', 'cash'), icon: '💵' },
                  { value: 'CARD', label: t('sales', 'card'), icon: '💳' },
                  { value: 'TRANSFER', label: t('sales', 'transfer'), icon: '🏦' },
                ].map(method => (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      paymentMethod === method.value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <div className="text-xl mb-1">{method.icon}</div>
                    <div className="text-xs font-bold">{method.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Discount */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                <Tag size={14} className="inline mr-1" /> {t('sales', 'discount')} ($)
              </label>
              <input
                type="number"
                value={discount}
                onChange={e => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">{t('common', 'description')}</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ixtiyoriy izoh..."
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Totals */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">{t('common', 'total')}:</span>
                <span className="font-bold">${subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-red-600 dark:text-red-400">
                  <span>{t('sales', 'discount')}:</span>
                  <span className="font-bold">-${discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-black text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-slate-700 pt-2">
                <span>{t('sales', 'finalAmount')}:</span>
                <span className="text-indigo-600 dark:text-indigo-400">${finalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || cartItems.length === 0}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
            >
              {loading ? t('common', 'loading') : t('sales', 'title') + 'ni ' + t('common', 'completed')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
