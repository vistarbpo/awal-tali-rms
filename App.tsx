import React, { useState } from 'react';
import LoginScreen from './src/screens/LoginScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import HomeScreen from './src/screens/HomeScreen';
import HomeProductsScreen from './src/screens/HomeProductsScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import DesignSystemScreen from './src/screens/DesignSystemScreen';
import OrdersScreen, { Order } from './src/screens/OrdersScreen';
import OrderEditScreen from './src/screens/OrderEditScreen';
import ProductAvailabilityCategoriesScreen from './src/screens/ProductAvailabilityCategoriesScreen';
import ProductAvailabilityProductsScreen, { ProductAvailabilityMap } from './src/screens/ProductAvailabilityProductsScreen';
import { CartItem } from './src/components/OrderPanel';
import { OrderType } from './src/components/OrderTypeDialog';
import { OrderDiscount } from './src/components/DiscountDialog';

type Screen =
  | 'login' | 'welcome' | 'home' | 'products' | 'payment'
  | 'design-system' | 'orders' | 'order-edit' | 'payment-order-edit'
  | 'avail-categories' | 'avail-products';

export default function App() {
  const [screen, setScreen]               = useState<Screen>('login');
  const [isClockedIn, setIsClockedIn]     = useState(false);
  const [editingOrder, setEditingOrder]   = useState<Order | null>(null);
  const [orderEditPayment, setOrderEditPayment] = useState<{ cart: CartItem[]; orderType: string; backScreen: Screen } | null>(null);
  const [isTillOpen, setIsTillOpen]     = useState(false);
  const [orderType, setOrderType]       = useState<OrderType | null>(null);
  const [orderSeqMap, setOrderSeqMap]   = useState<Partial<Record<OrderType, number>>>({});
  const [productAvailability, setProductAvailability] = useState<ProductAvailabilityMap>({});
  const [availCategoryId, setAvailCategoryId]     = useState<string | null>(null);
  const [availCategoryName, setAvailCategoryName] = useState<string>('');
  const [preAvailScreen, setPreAvailScreen]       = useState<Screen>('home');

  // Cart lives here — persists across home ↔ products navigation
  const [cart, setCart]                     = useState<CartItem[]>([]);
  const [selectedCartId, setSelectedCartId] = useState<string | null>(null);

  function addToCart(item: CartItem) {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, item];
    });
    setSelectedCartId(item.id);
  }

  function removeFromCart(id: string) {
    setCart(prev => prev.filter(i => i.id !== id));
    setSelectedCartId(prev => prev === id ? null : prev);
  }

  function updateItemDiscount(id: string, discount: OrderDiscount | null) {
    setCart(prev => prev.map(i => i.id === id ? { ...i, discount } : i));
  }

  function updateQty(id: string, delta: number) {
    setCart(prev => {
      const item = prev.find(i => i.id === id);
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        setSelectedCartId(cur => cur === id ? null : cur);
        return prev.filter(i => i.id !== id);
      }
      return prev.map(i => i.id === id ? { ...i, qty: newQty } : i);
    });
  }

  function handleExit() {
    setScreen('welcome');
    setIsClockedIn(false);
  }

  function openAvailability() {
    setPreAvailScreen(screen);
    setScreen('avail-categories');
  }

  const cartProps = {
    cart,
    selectedCartId,
    onSelectItem: setSelectedCartId,
    onRemoveItem: removeFromCart,
    onUpdateQty: updateQty,
    onUpdateItemDiscount: updateItemDiscount,
    onDoneEditing: () => setSelectedCartId(null),
    isTillOpen,
    onTillToggle: () => setIsTillOpen(prev => !prev),
    onExit: handleExit,
    orderType,
    onOrderTypeSet: (type: OrderType) => {
      setOrderType(type);
      setOrderSeqMap(prev => ({ ...prev, [type]: (prev[type] ?? 0) + 1 }));
    },
    orderSeq: orderType ? (orderSeqMap[orderType] ?? 1) : undefined,
    status: 'Active',
    onTotalPress: () => setScreen('payment'),
  };

  if (screen === 'avail-products' && availCategoryId) {
    return (
      <ProductAvailabilityProductsScreen
        categoryId={availCategoryId}
        categoryName={availCategoryName}
        productAvailability={productAvailability}
        onBack={() => setScreen('avail-categories')}
        onDone={updated => {
          setProductAvailability(prev => ({ ...prev, ...updated }));
          setScreen('avail-categories');
        }}
      />
    );
  }

  if (screen === 'avail-categories') {
    return (
      <ProductAvailabilityCategoriesScreen
        onBack={() => setScreen(preAvailScreen)}
        onCategorySelect={(id, name) => {
          setAvailCategoryId(id);
          setAvailCategoryName(name);
          setScreen('avail-products');
        }}
      />
    );
  }

  if (screen === 'design-system') {
    return <DesignSystemScreen onClose={() => setScreen('login')} />;
  }

  if (screen === 'payment-order-edit' && orderEditPayment) {
    return (
      <PaymentScreen
        cart={orderEditPayment.cart}
        orderType={orderEditPayment.orderType as any}
        status="Active"
        onBack={() => setScreen(orderEditPayment.backScreen)}
        onNewOrder={() => {
          setCart([]);
          setSelectedCartId(null);
          setOrderType(null);
          setScreen('home');
        }}
      />
    );
  }

  if (screen === 'order-edit' && editingOrder) {
    return (
      <OrderEditScreen
        order={editingOrder}
        onBack={() => setScreen('orders')}
        onTabPress={tab => { if (tab === 'orders') setScreen('orders'); }}
        onTotalPress={(cart, orderType) => {
          setOrderEditPayment({ cart, orderType, backScreen: 'order-edit' });
          setScreen('payment-order-edit');
        }}
      />
    );
  }

  if (screen === 'orders') {
    return (
      <OrdersScreen
        onBack={() => setScreen('home')}
        onTotalPress={(orderCart, orderType) => {
          setOrderEditPayment({ cart: orderCart, orderType, backScreen: 'orders' });
          setScreen('payment-order-edit');
        }}
      />
    );
  }

  if (screen === 'payment') {
    return (
      <PaymentScreen
        cart={cart}
        orderType={orderType}
        orderSeq={orderType ? (orderSeqMap[orderType] ?? 1) : undefined}
        status="Active"
        onBack={() => setScreen('products')}
        onNewOrder={() => {
          setCart([]);
          setSelectedCartId(null);
          setOrderType(null);
          setScreen('home');
        }}
      />
    );
  }

  if (screen === 'products') {
    return (
      <HomeProductsScreen
        onBack={() => setScreen('home')}
        onAddToCart={addToCart}
        onTabPress={tab => { if (tab === 'orders') setScreen('orders'); }}
        productAvailability={productAvailability}
        onAvailabilityPress={openAvailability}
        {...cartProps}
      />
    );
  }

  if (screen === 'home') {
    return (
      <HomeScreen
        onCategorySelect={() => setScreen('products')}
        onTabPress={tab => { if (tab === 'orders') setScreen('orders'); }}
        onAvailabilityPress={openAvailability}
        {...cartProps}
      />
    );
  }

  if (screen === 'welcome') {
    return (
      <WelcomeScreen
        isClockedIn={isClockedIn}
        onClockToggle={() => setIsClockedIn(prev => !prev)}
        onAccessRegister={() => setScreen('home')}
        onExit={() => { setScreen('login'); setIsClockedIn(false); }}
      />
    );
  }

  return (
    <LoginScreen
      onLoginSuccess={() => setScreen('welcome')}
      onDesignSystem={() => setScreen('design-system')}
    />
  );
}
