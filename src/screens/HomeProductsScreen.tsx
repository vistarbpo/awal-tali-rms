import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Image,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  useWindowDimensions,
  ImageSourcePropType,
} from 'react-native';
import { Colors } from '../constants/colors';
import { layout, LEFT_PANEL_W, CARD_GAP, RIGHT_PAD } from '../styles/screenLayout';
import OrderPanel, { CartItem } from '../components/OrderPanel';
import MoreMenu from '../components/MoreMenu';
import ConfirmDialog from '../components/ConfirmDialog';
import TillAmountDialog from '../components/TillAmountDialog';
import OrderTypeDialog, { OrderType } from '../components/OrderTypeDialog';
import VoidReasonDialog from '../components/VoidReasonDialog';
import CustomerFlowDialogs, { DeliveryCustomer } from '../components/CustomerFlowDialogs';
import DiscountDialog, { OrderDiscount } from '../components/DiscountDialog';
import OrderMoreMenu, { OrderMenuStatus } from '../components/OrderMoreMenu';
import { ProductAvailabilityMap } from './ProductAvailabilityProductsScreen';

// ─── Asset URLs (Figma node 43-382) ───────────────────────────────────────────
const ICONS = {
  printer:      { uri: 'https://www.figma.com/api/mcp/asset/9c81a4f6-19e8-4c24-91f1-4029da9b5d85' },
  kitchen:      { uri: 'https://www.figma.com/api/mcp/asset/e4ff08e4-89cb-48cc-8af8-69a94e353e97' },
  void:         { uri: 'https://www.figma.com/api/mcp/asset/e19c29de-88eb-4b90-b4e5-bcd44a80e8c7' },
  discount:     { uri: 'https://www.figma.com/api/mcp/asset/5ec51166-ce3c-480e-84a0-351deeacf5c3' },
  notes:        { uri: 'https://www.figma.com/api/mcp/asset/3720ba0f-7b2f-48b0-b1ac-2732fb449e63' },
  tags:         { uri: 'https://www.figma.com/api/mcp/asset/ebe1e728-eb26-4ecb-bf53-f6cc5fb2f013' },
  more:         { uri: 'https://www.figma.com/api/mcp/asset/58a25a2e-16a9-40f6-9072-893a8453bcab' },
  search:       { uri: 'https://www.figma.com/api/mcp/asset/9155f14b-6f44-44e1-9912-566c91ff3d4b' },
  sarDark:      { uri: 'https://www.figma.com/api/mcp/asset/9abd0b7f-8af7-4a1b-8191-c6434269d8d7' },
  sarGray:      { uri: 'https://www.figma.com/api/mcp/asset/a87a31c4-ad15-4c7d-8cbd-fbc065a2fff7' },
  sarWhite:     { uri: 'https://www.figma.com/api/mcp/asset/79841237-e621-48bf-836f-e1dd0aa820dc' },
  xClose:       { uri: 'https://www.figma.com/api/mcp/asset/a3c1b4c3-adf5-47fc-94cb-779ead2c9f31' },
  chevronRight: { uri: 'https://www.figma.com/api/mcp/asset/2030ebbb-d2ee-41de-b21b-96523c3e0860' },
  arrowLeft:    { uri: 'https://www.figma.com/api/mcp/asset/e77a3522-12d8-402e-a4da-7924113ef5b9' },
  home:         { uri: 'https://www.figma.com/api/mcp/asset/ae1e5116-508d-456d-a18e-a69b54c97201' },
  orders:       { uri: 'https://www.figma.com/api/mcp/asset/e3df933b-7dce-407b-b48c-bc94abca7b04' },
  tables:       { uri: 'https://www.figma.com/api/mcp/asset/7e8b57df-5116-40a4-b67f-d47d4dc56c34' },
  newOrder:     { uri: 'https://www.figma.com/api/mcp/asset/af948af3-cd5d-4312-be32-1e04975ce1ec' },
};

const PROD_IMG = [
  { uri: 'https://www.figma.com/api/mcp/asset/29c54800-98d4-4bf6-85f6-b1c8008e4961' },
  { uri: 'https://www.figma.com/api/mcp/asset/4158c9b1-5743-4472-bfee-d8633c37db5b' },
  { uri: 'https://www.figma.com/api/mcp/asset/b7aa18df-9b53-48aa-b622-4a14e054ed96' },
  { uri: 'https://www.figma.com/api/mcp/asset/ebb4eb7c-3671-4d1e-88a3-5aa11627a66d' },
];

// ─── Data ─────────────────────────────────────────────────────────────────────
const ACTION_BUTTONS = [
  { key: 'print',    label: 'Print',    icon: ICONS.printer,  danger: false },
  { key: 'kitchen',  label: 'Kitchen',  icon: ICONS.kitchen,  danger: false },
  { key: 'void',     label: 'Void',     icon: ICONS.void,     danger: true  },
  { key: 'discount', label: 'Discount', icon: ICONS.discount, danger: false },
  { key: 'notes',    label: 'Notes',    icon: ICONS.notes,    danger: false },
  { key: 'tags',     label: 'Tags',     icon: ICONS.tags,     danger: false },
  { key: 'more',     label: 'More',     icon: ICONS.more,     danger: false },
];

const TABS = [
  { key: 'home',   label: 'HOME',   icon: ICONS.home    },
  { key: 'orders', label: 'ORDERS', icon: ICONS.orders  },
  { key: 'tables', label: 'TABLES', icon: ICONS.tables  },
  { key: 'new',    label: 'NEW',    icon: ICONS.newOrder },
];

interface Product {
  id: string;
  name: string;
  price: number;
  img?: ImageSourcePropType | null;
}

const PRODUCTS: Product[] = [
  { id: 'p1',  name: 'Fried Rice',         price: 25, img: PROD_IMG[0] },
  { id: 'p2',  name: 'Pasta Primavera',     price: 30, img: PROD_IMG[1] },
  { id: 'p3',  name: 'Garden Salad',        price: 18, img: PROD_IMG[2] },
  { id: 'p4',  name: 'Grilled Chicken',     price: 45, img: PROD_IMG[3] },
  { id: 'p5',  name: 'Beef Steak',          price: 65, img: PROD_IMG[0] },
  { id: 'p6',  name: 'Seafood Platter',     price: 80, img: PROD_IMG[1] },
  { id: 'p7',  name: 'Lamb Chops',          price: 70, img: PROD_IMG[2] },
  { id: 'p8',  name: 'Veggie Wrap',         price: 20, img: PROD_IMG[3] },
  { id: 'p9',  name: 'Caesar Salad',        price: 22, img: PROD_IMG[0] },
  { id: 'p10', name: 'Chicken Tikka',       price: 40, img: PROD_IMG[1] },
  { id: 'p11', name: 'Mixed Grill',         price: 75, img: PROD_IMG[2] },
  { id: 'p12', name: 'Fish & Chips',        price: 35, img: PROD_IMG[3] },
  { id: 'p13', name: 'Chef\'s Special',     price: 55 },
];

// ─── Grid ─────────────────────────────────────────────────────────────────────
type GridItem =
  | { type: 'back' }
  | { type: 'product'; product: Product }
  | { type: 'previous' }
  | { type: 'next' };

const COLS = 5;
// slots per page: back(1) + products + optional prev + optional next, all in COLS columns
// max products per page when both nav buttons shown = COLS * rows - 1(back) - 2(nav) slots
// keep it simple: 12 products per page regardless, nav slots fill last row
const PAGE_SIZE = 12;

function buildGrid(
  products: Product[],
  page: number,
  totalPages: number,
): GridItem[] {
  const start = page * PAGE_SIZE;
  const pageProducts = products.slice(start, start + PAGE_SIZE);
  const items: GridItem[] = [
    { type: 'back' },
    ...pageProducts.map(p => ({ type: 'product' as const, product: p })),
  ];
  if (page > 0)           items.push({ type: 'previous' });
  if (page < totalPages - 1) items.push({ type: 'next' });
  return items;
}

// ─── Product card ─────────────────────────────────────────────────────────────
interface ProductCardProps {
  item: GridItem;
  size: number;
  onBack: () => void;
  onAddProduct: (product: Product) => void;
  onPrevious: () => void;
  onNext: () => void;
  productAvailability?: ProductAvailabilityMap;
}

function ProductCard({ item, size, onBack, onAddProduct, onPrevious, onNext, productAvailability }: ProductCardProps) {
  const sizeStyle = { width: size, height: size };

  if (item.type === 'back') {
    return (
      <TouchableOpacity style={[grid.card, grid.navCard, grid.cardCentered, sizeStyle]} onPress={onBack} activeOpacity={0.7}>
        <Image source={ICONS.arrowLeft} style={grid.navIcon} />
      </TouchableOpacity>
    );
  }

  if (item.type === 'previous') {
    return (
      <TouchableOpacity style={[grid.card, grid.navCard, grid.cardCentered, sizeStyle]} onPress={onPrevious} activeOpacity={0.7}>
        <Text style={grid.navLabelGray}>PREVIOUS</Text>
      </TouchableOpacity>
    );
  }

  if (item.type === 'next') {
    return (
      <TouchableOpacity style={[grid.card, grid.navCard, grid.cardCentered, sizeStyle]} onPress={onNext} activeOpacity={0.7}>
        <Text style={grid.navLabelDark}>NEXT</Text>
      </TouchableOpacity>
    );
  }

  const avail = productAvailability?.[item.product.id];
  const hasImage = !!item.product.img;
  return (
    <TouchableOpacity
      style={[grid.card, sizeStyle]}
      onPress={() => onAddProduct(item.product)}
      activeOpacity={0.85}
    >
      {hasImage ? (
        <>
          <Image source={item.product.img!} style={grid.productImg} />
          <View style={grid.overlay}>
            <Text style={grid.productName} numberOfLines={2}>{item.product.name}</Text>
          </View>
        </>
      ) : (
        <View style={grid.noImageWrap}>
          <Text style={grid.noImageName} numberOfLines={3}>{item.product.name}</Text>
        </View>
      )}
      {avail !== undefined && (
        <View style={[grid.availBadge, !avail.available && grid.availBadgeDanger]}>
          <Text style={grid.availBadgeText}>
            {avail.available ? String(avail.quantity ?? '∞') : '0'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  onBack?:          () => void;
  onAddToCart:      (item: CartItem) => void;
  cart:             CartItem[];
  selectedCartId:   string | null;
  onSelectItem:     (id: string) => void;
  onRemoveItem:     (id: string) => void;
  onUpdateQty?:           (id: string, delta: number) => void;
  onUpdateItemDiscount?:  (id: string, discount: OrderDiscount | null) => void;
  onDoneEditing?:         () => void;
  isTillOpen:       boolean;
  onTillToggle:     () => void;
  onExit:           () => void;
  onOrderTypeSet:   (type: OrderType) => void;
  orderType?:       string | null;
  orderSeq?:        number;
  status?:          string;
  onTotalPress?:    () => void;
  onTabPress?:           (tab: string) => void;
  productAvailability?:  ProductAvailabilityMap;
  onAvailabilityPress?:  () => void;
  tableNumber?:          string;
  onNewOrder?:           () => void;
}

export default function HomeProductsScreen({
  onBack,
  onAddToCart,
  cart,
  selectedCartId,
  onSelectItem,
  onRemoveItem,
  onUpdateQty,
  onUpdateItemDiscount,
  onDoneEditing,
  isTillOpen,
  onTillToggle,
  onExit,
  onOrderTypeSet,
  orderType,
  orderSeq,
  status,
  onTotalPress,
  onTabPress,
  productAvailability,
  onAvailabilityPress,
  tableNumber,
  onNewOrder,
}: Props) {
  const { width: screenW }    = useWindowDimensions();
  const searchRef                         = useRef<TextInput>(null);
  const [search, setSearch]               = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab]   = useState('home');
  const [homeMenuVisible, setHomeMenuVisible]       = useState(false);
  const [confirmTillVisible, setConfirmTillVisible] = useState(false);
  const [tillAmountVisible, setTillAmountVisible]   = useState(false);
  const [tillGuardVisible, setTillGuardVisible]     = useState(false);
  const [orderTypeVisible, setOrderTypeVisible]     = useState(false);
  const [pendingItem, setPendingItem]               = useState<CartItem | null>(null);
  const [isEditingItem, setIsEditingItem]           = useState(false);
  const [voidReasonVisible, setVoidReasonVisible]   = useState(false);
  const [isVoided, setIsVoided]                     = useState(false);
  const [voidedReason, setVoidedReason]             = useState<string>('');
  const [page, setPage]                             = useState(0);
  const [customerFlowVisible, setCustomerFlowVisible] = useState(false);
  const [deliveryCustomer, setDeliveryCustomer]       = useState<DeliveryCustomer | null>(null);
  const [discountVisible, setDiscountVisible]         = useState(false);
  const [orderDiscount, setOrderDiscount]             = useState<OrderDiscount | null>(null);
  const [itemDiscountVisible, setItemDiscountVisible] = useState(false);
  const [orderMoreVisible, setOrderMoreVisible]       = useState(false);

  const totalPages = Math.ceil(PRODUCTS.length / PAGE_SIZE);
  const gridData   = buildGrid(PRODUCTS, page, totalPages);

  function handleAddProduct(product: Product) {
    const item: CartItem = { id: product.id, name: product.name, qty: 1, price: product.price };
    if (!isTillOpen) {
      setPendingItem(item);
      setTillGuardVisible(true);
    } else if (!orderType) {
      setPendingItem(item);
      setOrderTypeVisible(true);
    } else {
      onAddToCart(item);
    }
  }

  function handleVoid() {
    if (selectedCartId) {
      onRemoveItem(selectedCartId);
      setIsEditingItem(false);
      onDoneEditing?.();
    }
  }

  function handleQty(delta: number) {
    if (selectedCartId) onUpdateQty?.(selectedCartId, delta);
  }

  function handleDone() {
    setIsEditingItem(false);
    onDoneEditing?.();
  }

  const rightW    = screenW - LEFT_PANEL_W;
  const available = rightW - RIGHT_PAD * 2 - CARD_GAP * (COLS - 1);
  const cardSize  = Math.floor(available / COLS);

  return (
    <SafeAreaView style={layout.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundAlt} />

      <View style={layout.row}>

        {/* ══ LEFT: Order panel ══ */}
        <OrderPanel
          items={cart}
          selectedId={selectedCartId}
          onSelectItem={id => { onSelectItem(id); setIsEditingItem(true); }}
          onRemoveItem={onRemoveItem}
          orderType={orderType}
          orderSeq={orderSeq}
          status={status}
          onOrderTypePress={() => setOrderTypeVisible(true)}
          customer={deliveryCustomer}
          onAddCustomerPress={() => setCustomerFlowVisible(true)}
          onTotalPress={onTotalPress}
          isVoided={isVoided}
          tableNumber={tableNumber}
          discount={orderDiscount}
          onDiscountPress={() => setDiscountVisible(true)}
        />

        {/* ══ RIGHT: Content ══ */}
        <View style={layout.right}>

          {isVoided ? (
            /* ══ ORDER CANCELLED — New Order screen ══ */
            <View style={styles.cancelledScreen}>

              {/* Icon */}
              <View style={styles.cancelledIconWrap}>
                <View style={styles.cancelledIconRing}>
                  <View style={styles.cancelledIconDot} />
                </View>
              </View>

              {/* Text */}
              <Text style={styles.cancelledTitle}>Order Cancelled</Text>
              <Text style={styles.cancelledReason}>"{voidedReason}"</Text>
              <Text style={styles.cancelledHint}>
                The order has been voided and cannot be edited.{'\n'}Start a new order below.
              </Text>

              {/* New Order CTA */}
              <TouchableOpacity
                style={styles.newOrderBtn}
                activeOpacity={0.85}
                onPress={() => {
                  cart.forEach(i => onRemoveItem(i.id));
                  setIsVoided(false);
                  setVoidedReason('');
                  setDeliveryCustomer(null);
                  setOrderDiscount(null);
                }}
              >
                <Text style={styles.newOrderBtnText}>+ New Order</Text>
              </TouchableOpacity>

            </View>
          ) : isEditingItem && selectedCartId && cart.find(i => i.id === selectedCartId) ? (() => {
            const item = cart.find(i => i.id === selectedCartId)!;
            return (
              <>
                {/* ── Item-detail action bar (Figma 75-2901) — text only ── */}
                <View style={layout.actionBar}>
                  <TouchableOpacity style={[layout.actionBtn, layout.actionBtnDanger, styles.itemActionBtn]} onPress={handleVoid} activeOpacity={0.8}>
                    <Text style={styles.itemActionText}>Void</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[layout.actionBtn, styles.itemActionBtn]} activeOpacity={0.8}>
                    <Text style={styles.itemActionText}>Hold</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[layout.actionBtn, styles.itemActionBtn]} activeOpacity={0.8} onPress={() => setItemDiscountVisible(true)}>
                    <Text style={styles.itemActionText}>Discount</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[layout.actionBtn, styles.itemActionBtn]} activeOpacity={0.8}>
                    <Text style={styles.itemActionText}>Notes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[layout.actionBtn, styles.itemActionBtn]} onPress={() => handleQty(-1)} activeOpacity={0.8}>
                    <Text style={styles.qtySymbol}>−</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[layout.actionBtn, styles.itemActionBtn]} onPress={() => handleQty(1)} activeOpacity={0.8}>
                    <Text style={styles.qtySymbol}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* ── Selected item card ── */}
                <View style={styles.itemDetailBody}>
                  <View style={styles.itemDetailCard}>
                    <Text style={styles.itemDetailName}>{item.name}</Text>
                    <View style={styles.itemDetailMeta}>
                      <Text style={styles.itemDetailQty}>{item.qty}×</Text>
                      <Text style={styles.itemDetailPrice}>{item.price.toFixed(2)}</Text>
                      <Image source={ICONS.sarDark} style={styles.itemDetailSar} />
                    </View>
                    <Text style={styles.itemDetailTotal}>{(item.qty * item.price).toFixed(2)}</Text>
                  </View>
                </View>

                {/* ── DONE button ── */}
                <TouchableOpacity style={styles.doneBtn} onPress={handleDone} activeOpacity={0.85}>
                  <Text style={styles.doneBtnText}>DONE</Text>
                </TouchableOpacity>
              </>
            );
          })() : (
            <>
              {/* Action bar */}
              <View style={layout.actionBar}>
                {ACTION_BUTTONS.map(btn => (
                  <TouchableOpacity
                    key={btn.key}
                    style={[layout.actionBtn, btn.danger && layout.actionBtnDanger]}
                    activeOpacity={0.8}
                    onPress={
                      btn.key === 'void'     ? () => setVoidReasonVisible(true)  :
                      btn.key === 'discount' ? () => setDiscountVisible(true)    :
                      btn.key === 'more'     ? () => setOrderMoreVisible(true)   : undefined
                    }
                  >
                    <Image source={btn.icon} style={layout.actionIcon} />
                    <Text style={layout.actionLabel}>{btn.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Search bar */}
              <Pressable style={[layout.searchBar, searchFocused && layout.searchBarFocused]} onPress={() => searchRef.current?.focus()}>
                <View style={layout.searchIconWrap}>
                  <Image source={ICONS.search} style={layout.searchIcon} />
                </View>
                <View style={layout.searchInputWrap}>
                  <TextInput
                    ref={searchRef}
                    style={layout.searchInput}
                    placeholder="Search Products"
                    placeholderTextColor={Colors.placeholder}
                    value={search}
                    onChangeText={setSearch}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                  />
                </View>
              </Pressable>

              {/* Product grid */}
              <FlatList
                data={gridData}
                keyExtractor={(_, i) => String(i)}
                numColumns={COLS}
                key={page}
                style={styles.gridScroll}
                contentContainerStyle={styles.gridContent}
                columnWrapperStyle={{ gap: CARD_GAP }}
                ItemSeparatorComponent={() => <View style={{ height: CARD_GAP }} />}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <ProductCard
                    item={item}
                    size={cardSize}
                    onBack={() => onBack?.()}
                    onAddProduct={handleAddProduct}
                    onPrevious={() => setPage(p => Math.max(0, p - 1))}
                    onNext={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    productAvailability={productAvailability}
                  />
                )}
              />

              {/* Tab bar */}
              <View style={layout.tabBar}>
                {TABS.map(tab => {
                  const active = tab.key === activeTab;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      style={[layout.tabItem, active && layout.tabItemActive]}
                      onPress={() => {
                        if (tab.key === 'home') {
                          setHomeMenuVisible(true);
                        } else if (tab.key === 'new') {
                          setIsVoided(false);
                          setVoidedReason('');
                          setDeliveryCustomer(null);
                          setOrderDiscount(null);
                          setIsEditingItem(false);
                          onNewOrder?.();
                        } else {
                          setActiveTab(tab.key);
                          onTabPress?.(tab.key);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Image source={tab.icon} style={[layout.tabIcon, active && layout.tabIconActive]} />
                      <Text style={[layout.tabLabel, active && layout.tabLabelActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

        </View>
      </View>

      <MoreMenu
        visible={homeMenuVisible}
        onClose={() => setHomeMenuVisible(false)}
        leftPanelWidth={LEFT_PANEL_W + 14}
        tabBarBottomOffset={76}
        isTillOpen={isTillOpen}
        onItemPress={key => {
          if (key === 'open_till' || key === 'close_till') setConfirmTillVisible(true);
          if (key === 'exit') onExit();
          if (key === 'availability') onAvailabilityPress?.();
        }}
      />

      <ConfirmDialog
        visible={confirmTillVisible}
        title={isTillOpen ? 'Close Till' : 'Open Till'}
        message={isTillOpen ? 'Are you sure you want to close Till?' : 'Are you sure you want to open Till?'}
        onNo={() => setConfirmTillVisible(false)}
        onYes={() => { setConfirmTillVisible(false); setTillAmountVisible(true); }}
      />

      <TillAmountDialog
        visible={tillAmountVisible}
        onClose={() => { setTillAmountVisible(false); setPendingItem(null); }}
        onDone={() => {
          setTillAmountVisible(false);
          onTillToggle();
          if (pendingItem) setOrderTypeVisible(true);
        }}
        ctaLabel={isTillOpen ? 'Close Till' : 'Open Till'}
      />

      <ConfirmDialog
        visible={tillGuardVisible}
        title="Till Not Open"
        message="Would you like to open the till to start taking orders?"
        onNo={() => { setTillGuardVisible(false); setPendingItem(null); }}
        onYes={() => { setTillGuardVisible(false); setTillAmountVisible(true); }}
      />

      <OrderTypeDialog
        visible={orderTypeVisible}
        onClose={() => { setOrderTypeVisible(false); setPendingItem(null); }}
        onSelect={type => {
          onOrderTypeSet(type);
          if (pendingItem) { onAddToCart(pendingItem); setPendingItem(null); }
          if (type === 'Delivery') setCustomerFlowVisible(true);
        }}
      />

      <VoidReasonDialog
        visible={voidReasonVisible}
        onClose={() => setVoidReasonVisible(false)}
        onSelectReason={reason => {
          setVoidReasonVisible(false);
          setVoidedReason(reason);
          setIsVoided(true);
          setIsEditingItem(false);
          onDoneEditing?.();
        }}
      />

      <DiscountDialog
        visible={discountVisible}
        currentDiscount={orderDiscount}
        subtotal={cart.reduce((sum, i) => sum + i.price * i.qty, 0)}
        onClose={() => setDiscountVisible(false)}
        onApply={discount => {
          setOrderDiscount(discount);
          setDiscountVisible(false);
        }}
        onClear={() => {
          setOrderDiscount(null);
          setDiscountVisible(false);
        }}
      />

      {/* Item-level discount dialog */}
      {(() => {
        const item = selectedCartId ? cart.find(i => i.id === selectedCartId) : null;
        if (!item) return null;
        return (
          <DiscountDialog
            visible={itemDiscountVisible}
            currentDiscount={item.discount ?? null}
            subtotal={item.price * item.qty}
            onClose={() => setItemDiscountVisible(false)}
            onApply={discount => {
              onUpdateItemDiscount?.(item.id, discount);
              setItemDiscountVisible(false);
            }}
            onClear={() => {
              onUpdateItemDiscount?.(item.id, null);
              setItemDiscountVisible(false);
            }}
          />
        );
      })()}

      <CustomerFlowDialogs
        visible={customerFlowVisible}
        onClose={() => setCustomerFlowVisible(false)}
        onCustomerAssigned={customer => {
          setDeliveryCustomer(customer);
          setCustomerFlowVisible(false);
        }}
      />

      <OrderMoreMenu
        visible={orderMoreVisible}
        onClose={() => setOrderMoreVisible(false)}
        status={isVoided ? 'voided' : 'active'}
        onItemPress={key => {
          // handlers can be wired up per item in future
        }}
      />
    </SafeAreaView>
  );
}

// ─── Screen-specific styles only ──────────────────────────────────────────────
const styles = StyleSheet.create({
  gridScroll: {
    flex: 1,
  },
  gridContent: {
    paddingBottom: 10,
  },

  // ── Item detail panel ──
  itemActionBtn: {
    justifyContent: 'center',
    gap: 0,
  },
  itemActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  qtySymbol: {
    fontSize: 24,
    fontWeight: '300',
    color: Colors.white,
    textAlign: 'center',
  },
  itemDetailBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetailCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
    minWidth: 260,
  },
  itemDetailName: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.11,
    textAlign: 'center',
  },
  itemDetailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemDetailQty: {
    fontSize: 18,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.09,
  },
  itemDetailPrice: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.09,
  },
  itemDetailSar: {
    width: 14,
    height: 16,
    resizeMode: 'contain',
    opacity: 0.5,
  },
  itemDetailTotal: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.16,
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  doneBtnText: {
    fontSize: 19,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.095,
  },

  // ── Order Cancelled / New Order screen ──
  cancelledScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  cancelledIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FAE8E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cancelledIconRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelledIconDot: {
    width: 22,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.red,
  },
  cancelledTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  cancelledReason: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.2,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cancelledHint: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.grayMid,
    textAlign: 'center',
    lineHeight: 21,
    letterSpacing: -0.1,
    marginBottom: 8,
  },
  newOrderBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 62,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 8,
  },
  newOrderBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.3,
  },
});

// ─── Grid card styles ─────────────────────────────────────────────────────────
const grid = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardCentered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navCard: {
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 3,
  },
  productImg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.52)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.2)',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 7,
    overflow: 'hidden',
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 17,
    letterSpacing: -0.065,
  },
  navIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  navLabelGray: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.grayMid,
    letterSpacing: -0.065,
  },
  navLabelDark: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
    letterSpacing: -0.065,
  },
  availBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  availBadgeDanger: { backgroundColor: Colors.red },
  availBadgeText: { fontSize: 12, fontWeight: '600', color: Colors.white },
  noImageWrap: { flex: 1, width: '100%', backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', padding: 10 },
  noImageName: { fontSize: 13, fontWeight: '600', color: Colors.primary, textAlign: 'center', letterSpacing: -0.2, lineHeight: 18 },
});
