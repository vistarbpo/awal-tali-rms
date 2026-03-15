import React, { useState } from 'react';
import LoginScreen from './src/screens/LoginScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import HomeScreen from './src/screens/HomeScreen';
import HomeProductsScreen from './src/screens/HomeProductsScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import DesignSystemScreen from './src/screens/DesignSystemScreen';
import OrdersScreen, { Order } from './src/screens/OrdersScreen';
import OrderEditScreen from './src/screens/OrderEditScreen';
import TablesScreen from './src/screens/TablesScreen';
import ReservationsScreen from './src/screens/ReservationsScreen';
import ProductAvailabilityCategoriesScreen from './src/screens/ProductAvailabilityCategoriesScreen';
import ProductAvailabilityProductsScreen, { ProductAvailabilityMap } from './src/screens/ProductAvailabilityProductsScreen';
import { CartItem, Course } from './src/components/OrderPanel';
import { OrderType } from './src/components/OrderTypeDialog';
import { OrderDiscount } from './src/components/DiscountDialog';

type Screen =
  | 'login' | 'welcome' | 'home' | 'products' | 'payment'
  | 'design-system' | 'orders' | 'order-edit' | 'payment-order-edit'
  | 'avail-categories' | 'avail-products' | 'tables' | 'reservations';

export default function App() {
  const [screen, setScreen]               = useState<Screen>('login');
  const [isClockedIn, setIsClockedIn]     = useState(false);
  const [editingOrder, setEditingOrder]   = useState<Order | null>(null);
  const [orderEditPayment, setOrderEditPayment] = useState<{ cart: CartItem[]; orderType: string; backScreen: Screen } | null>(null);
  const [isTillOpen, setIsTillOpen]     = useState(false);
  const [orderType, setOrderType]       = useState<OrderType | null>(null);
  const [dineInTable, setDineInTable]   = useState<string | null>(null);
  const [orderSeqMap, setOrderSeqMap]   = useState<Partial<Record<OrderType, number>>>({});
  const [productAvailability, setProductAvailability] = useState<ProductAvailabilityMap>({});
  const [availCategoryId, setAvailCategoryId]     = useState<string | null>(null);
  const [availCategoryName, setAvailCategoryName] = useState<string>('');
  const [preAvailScreen, setPreAvailScreen]       = useState<Screen>('home');

  // Cart lives here — persists across home ↔ products navigation
  const [cart, setCart]                     = useState<CartItem[]>([]);
  const [selectedCartId, setSelectedCartId] = useState<string | null>(null);
  const [courses, setCourses]               = useState<Course[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

  function addToCart(item: CartItem) {
    const itemWithCourse = activeCourseId ? { ...item, courseId: activeCourseId } : item;
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, itemWithCourse];
    });
    setSelectedCartId(item.id);
  }

  function handleMoveItemToCourse(itemId: string, courseId: string) {
    setCart(prev => prev.map(i => i.id === itemId ? { ...i, courseId } : i));
  }

  function handleHoldCourse(courseId: string, holdUntil?: number) {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      // If already held, calling this unholds it (holdUntil is ignored)
      if (c.isHeld) return { ...c, isHeld: false, holdUntil: undefined };
      // Otherwise hold — holdUntil undefined = fire later (no countdown)
      return { ...c, isHeld: true, holdUntil };
    }));
  }

  function handleAddCourse() {
    setCourses(prev => {
      if (prev.length === 0) {
        // First time: retroactively assign existing items to Course 1, create Course 2
        const course1: Course = { id: 'course-1', name: 'Course 1' };
        const course2: Course = { id: 'course-2', name: 'Course 2' };
        setCart(items => items.map(i => ({ ...i, courseId: 'course-1' })));
        setActiveCourseId('course-2');
        return [course1, course2];
      }
      // Subsequent: create next course and make it active
      const nextNum = prev.length + 1;
      const newCourse: Course = { id: `course-${nextNum}`, name: `Course ${nextNum}` };
      setActiveCourseId(newCourse.id);
      return [...prev, newCourse];
    });
  }

  function removeFromCart(id: string) {
    setCart(prev => prev.filter(i => i.id !== id));
    setSelectedCartId(prev => prev === id ? null : prev);
  }

  function updateItemDiscount(id: string, discount: OrderDiscount | null) {
    setCart(prev => prev.map(i => i.id === id ? { ...i, discount } : i));
  }

  function toggleHold(id: string, holdTime?: number) {
    setCart(prev => prev.map(i =>
      i.id === id
        ? { ...i, isHeld: !i.isHeld, holdTime: !i.isHeld ? holdTime : undefined }
        : i
    ));
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
    onToggleHold: toggleHold,
    onUpdateItemDiscount: updateItemDiscount,
    onDoneEditing: () => setSelectedCartId(null),
    isTillOpen,
    onTillToggle: () => setIsTillOpen(prev => !prev),
    onExit: handleExit,
    orderType: orderType
      ? (dineInTable ? `${orderType} (${dineInTable})` : orderType)
      : null,
    tableNumber: dineInTable ?? undefined,
    onOrderTypeSet: (type: OrderType) => {
      setDineInTable(null);
      setOrderType(type);
      setOrderSeqMap(prev => ({ ...prev, [type]: (prev[type] ?? 0) + 1 }));
    },
    orderSeq: orderType ? (orderSeqMap[orderType] ?? 1) : undefined,
    status: 'Active',
    onTotalPress: () => setScreen('payment'),
    courses,
    onAddCourse: handleAddCourse,
    onMoveItemToCourse: handleMoveItemToCourse,
    onHoldCourse: handleHoldCourse,
    onNewOrder: () => {
      setCart([]);
      setSelectedCartId(null);
      setOrderType(null);
      setDineInTable(null);
      setCourses([]);
      setActiveCourseId(null);
    },
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
          setDineInTable(null);
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
        onTabPress={tab => { if (tab === 'orders') setScreen('orders'); if (tab === 'tables') setScreen('tables'); }}
        onTotalPress={(cart, orderType) => {
          setOrderEditPayment({ cart, orderType, backScreen: 'order-edit' });
          setScreen('payment-order-edit');
        }}
      />
    );
  }

  if (screen === 'reservations') {
    return <ReservationsScreen onBack={() => setScreen('tables')} />;
  }

  if (screen === 'tables') {
    return (
      <TablesScreen
        onBack={() => setScreen('home')}
        onReservations={() => setScreen('reservations')}
        onStartOrder={(tableName, _section, _guests) => {
          setCart([]);
          setSelectedCartId(null);
          setOrderType('Dine in' as OrderType);
          setDineInTable(tableName);
          setOrderSeqMap(prev => ({ ...prev, ['Dine in']: (prev['Dine in'] ?? 0) + 1 }));
          setScreen('products');
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
        onLoadOrder={order => {
          const items: CartItem[] = order.items.map((item, i) => ({
            id: `${order.id}-${i}`,
            name: item.name,
            qty: item.qty,
            price: item.price,
          }));
          setCart(items);
          setSelectedCartId(null);
          const typeMap: Record<string, OrderType> = {
            'DINE IN':    'Dine in',
            'PICK UP':    'Pick up',
            'DELIVERY':   'Delivery',
            'DRIVE THRU': 'Drive thru',
          };
          setOrderType(typeMap[order.type] ?? null);
          setDineInTable(order.tableNumber ?? null);
          setOrderSeqMap(prev => ({ ...prev, [order.type]: (prev[order.type as OrderType] ?? 0) + 1 }));
          setScreen('products');
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
          setDineInTable(null);
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
        onTabPress={tab => { if (tab === 'orders') setScreen('orders'); if (tab === 'tables') setScreen('tables'); }}
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
        onTabPress={tab => { if (tab === 'orders') setScreen('orders'); if (tab === 'tables') setScreen('tables'); }}
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
