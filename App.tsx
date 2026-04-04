import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
// Fonts — only needed on native; web loads IBM Plex Arabic via Google Fonts in index.html
// To enable native fonts: npx expo install @expo-google-fonts/ibm-plex-sans-arabic expo-font
let _useFonts: (fonts: any) => [boolean, Error | null] = () => [true, null];
let _fontAssets: Record<string, any> = {};
if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require('@expo-google-fonts/ibm-plex-sans-arabic');
    _useFonts  = pkg.useFonts;
    _fontAssets = {
      IBMPlexSansArabic_400Regular:  pkg.IBMPlexSansArabic_400Regular,
      IBMPlexSansArabic_500Medium:   pkg.IBMPlexSansArabic_500Medium,
      IBMPlexSansArabic_600SemiBold: pkg.IBMPlexSansArabic_600SemiBold,
      IBMPlexSansArabic_700Bold:     pkg.IBMPlexSansArabic_700Bold,
    };
  } catch { /* package not installed yet */ }
}
import { I18nProvider, useI18n } from './src/i18n';
import { IPAD_W, IPAD_H } from './src/styles/screenLayout';
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
import { CartItem, Course, ComboGroup } from './src/components/OrderPanel';
import { OrderType } from './src/components/OrderTypeDialog';
import { OrderDiscount } from './src/components/DiscountDialog';
import { OrderCharge } from './src/components/AddChargeDialog';
import { SplitData } from './src/components/SplitOrderView';

type Screen =
  | 'login' | 'welcome' | 'home' | 'products' | 'payment'
  | 'design-system' | 'orders' | 'order-edit' | 'payment-order-edit'
  | 'avail-categories' | 'avail-products' | 'tables' | 'reservations';

// ─── Preview mode (Figma capture) ─────────────────────────────────────────────
// 'products' | 'products-done' | 'products-voided' | 'products-charges' | 'products-delivery'
// | 'products-item-applied' | 'orders' | 'avail-products' | 'avail-categories'
// | 'payment' | 'payment-item-discount' | 'welcome' | 'home' | 'tables' | 'reservations' | null
const APP_PREVIEW: string | null = null;

export default function App() {
  const [fontsLoaded] = _useFonts(_fontAssets);
  // Render while fonts load (prevents flash of wrong font)
  if (!fontsLoaded && Platform.OS !== 'web') return null;

  return (
    <I18nProvider>
      <AppInner />
    </I18nProvider>
  );
}

function AppInner() {
  const [screen, setScreen]               = useState<Screen>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.pathname === '/design-system') return 'design-system';
    if (APP_PREVIEW?.startsWith('products') || APP_PREVIEW?.startsWith('split-order')) return 'products';
    if (APP_PREVIEW === 'orders') return 'orders';
    if (APP_PREVIEW === 'avail-products') return 'avail-products';
    if (APP_PREVIEW === 'avail-categories') return 'avail-categories';
    if (APP_PREVIEW === 'payment' || APP_PREVIEW === 'payment-item-discount') return 'payment';
    if (APP_PREVIEW === 'welcome') return 'welcome';
    if (APP_PREVIEW === 'home') return 'home';
    if (APP_PREVIEW === 'tables') return 'tables';
    if (APP_PREVIEW === 'reservations') return 'reservations';
    return 'login';
  });
  const [isClockedIn, setIsClockedIn]     = useState(false);
  const [editingOrder, setEditingOrder]   = useState<Order | null>(null);
  const [orderEditPayment, setOrderEditPayment] = useState<{ cart: CartItem[]; orderType: string; backScreen: Screen } | null>(null);
  const [isTillOpen, setIsTillOpen]     = useState(APP_PREVIEW !== null && APP_PREVIEW !== 'orders' && APP_PREVIEW !== 'payment');
  const [orderType, setOrderType]       = useState<OrderType | null>(APP_PREVIEW === 'products-delivery' ? 'Delivery' : 'Pick up');
  const [dineInTable, setDineInTable]   = useState<string | null>(
    APP_PREVIEW === 'split-order' || APP_PREVIEW === 'split-order-split' ? '5' : null
  );
  const [orderSeqMap, setOrderSeqMap]   = useState<Partial<Record<OrderType, number>>>({ 'Pick up': 4 });
  const [productAvailability, setProductAvailability] = useState<ProductAvailabilityMap>({
    p4: { available: true,  quantity: 10 },
    p5: { available: false, quantity: null },
    p6: { available: true,  quantity: null },
  });
  const [availCategoryId, setAvailCategoryId]     = useState<string | null>('c6');
  const [availCategoryName, setAvailCategoryName] = useState<string>('MAIN DISHES');
  const [preAvailScreen, setPreAvailScreen]       = useState<Screen>('home');

  // Cart lives here — persists across home ↔ products navigation
  const _itemApplied = APP_PREVIEW === 'products-item-applied' || APP_PREVIEW === 'payment-item-discount';
  const [cart, setCart]                     = useState<CartItem[]>([
    { id: 'bs-1', name: 'Beef Steak', qty: 2, price: 65,
      ...(_itemApplied ? { discount: { label: '10 Off', kind: 'amount' as const, value: 10 } } : {}) },
    { id: 'gr-1', name: 'Garden Salad',    qty: 1, price: 18 },
    { id: 'cm-1', name: 'Combo Meal Sandwich', qty: 1, price: 28, comboSelectionLabels: ['Pepsi', 'Fries'] },
  ]);
  const [selectedCartId, setSelectedCartId] = useState<string | null>(
    APP_PREVIEW?.startsWith('products') ? 'bs-1' : null
  );
  const [courses, setCourses]               = useState<Course[]>([]);
  const [loadedOrderStatus, setLoadedOrderStatus] = useState<string>(APP_PREVIEW === 'products-done' ? 'DONE' : 'ACTIVE');
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [charges, setCharges]               = useState<OrderCharge[]>(
    APP_PREVIEW === 'products-charges'
      ? [
          { id: 'ch-1', label: 'Delivery Fee', amount: 10 },
          { id: 'ch-2', label: 'Service Charge', amount: 5 },
        ]
      : []
  );
  const [splits,  setSplits]                = useState<SplitData[]>([]);
  const [activeSplitIndex, setActiveSplitIndex] = useState(0);

  function addToCart(item: CartItem) {
    const itemWithCourse = activeCourseId ? { ...item, courseId: activeCourseId } : item;
    setCart(prev => [...prev, itemWithCourse]);
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

  function updateItemNote(id: string, note: string) {
    setCart(prev => prev.map(i => i.id === id ? { ...i, kitchenNote: note || undefined } : i));
  }

  function updateItemComboSelections(id: string, labels: string[], selections: Record<string, string>, groups: ComboGroup[]) {
    setCart(prev => prev.map(i =>
      i.id === id ? { ...i, comboSelectionLabels: labels, comboSelections: selections, comboGroups: groups } : i
    ));
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
    onUpdateItemComboSelections: updateItemComboSelections,
    onUpdateItemNote: updateItemNote,
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
    status: loadedOrderStatus,
    onTotalPress: () => setScreen('payment'),
    courses,
    onAddCourse: handleAddCourse,
    onMoveItemToCourse: handleMoveItemToCourse,
    onHoldCourse: handleHoldCourse,
    charges,
    onAddCharge: (charge: OrderCharge) => setCharges(prev => [...prev, charge]),
    onRemoveCharge: (id: string) => setCharges(prev => prev.filter(c => c.id !== id)),
    onAssignTable: (tableName: string | null) => setDineInTable(tableName),
    splits,
    activeSplitIndex,
    onSplitsChange: (newSplits: SplitData[]) => { setSplits(newSplits); setActiveSplitIndex(0); },
    onSplitNavigate: (idx: number) => setActiveSplitIndex(idx),
    onNewOrder: () => {
      setCart([]);
      setSelectedCartId(null);
      setOrderType(null);
      setDineInTable(null);
      setCourses([]);
      setActiveCourseId(null);
      setLoadedOrderStatus('ACTIVE');
      setCharges([]);
      setSplits([]);
      setActiveSplitIndex(0);
    },
  };

  function renderScreen() {
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
            setLoadedOrderStatus(order.status);
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

  const { isRTL } = useI18n();
  // Apply CSS direction for web RTL
  const dirStyle: any = Platform.OS === 'web' && isRTL ? { direction: 'rtl' } : {};

  if (Platform.OS === 'web') {
    if (screen === 'design-system') {
      return <View style={[{ flex: 1 }, dirStyle]}>{renderScreen()}</View>;
    }
    return (
      <View style={[appStyles.webShell, dirStyle]}>
        <View style={appStyles.ipadFrame}>
          {renderScreen()}
        </View>
      </View>
    );
  }

  return <View style={[{ flex: 1 }, dirStyle]}>{renderScreen()}</View>;
}


const appStyles = StyleSheet.create({
  webShell: {
    flex: 1,
    backgroundColor: '#0B151A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ipadFrame: {
    width: IPAD_W,
    height: IPAD_H,
    overflow: 'hidden',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
  },
});
