import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Image,
  TextInput,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  ImageSourcePropType,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/colors';
import { layout, LEFT_PANEL_W, CARD_GAP, RIGHT_PAD } from '../styles/screenLayout';
import OrderPanel, { CartItem } from '../components/OrderPanel';
import VoidReasonDialog from '../components/VoidReasonDialog';
import { Order } from './OrdersScreen';

// ─── Shared icon URLs (same as HomeProductsScreen) ────────────────────────────
const ICONS = {
  printer:      { uri: 'https://www.figma.com/api/mcp/asset/9c81a4f6-19e8-4c24-91f1-4029da9b5d85' },
  kitchen:      { uri: 'https://www.figma.com/api/mcp/asset/e4ff08e4-89cb-48cc-8af8-69a94e353e97' },
  void:         { uri: 'https://www.figma.com/api/mcp/asset/e19c29de-88eb-4b90-b4e5-bcd44a80e8c7' },
  discount:     { uri: 'https://www.figma.com/api/mcp/asset/5ec51166-ce3c-480e-84a0-351deeacf5c3' },
  notes:        { uri: 'https://www.figma.com/api/mcp/asset/3720ba0f-7b2f-48b0-b1ac-2732fb449e63' },
  tags:         { uri: 'https://www.figma.com/api/mcp/asset/ebe1e728-eb26-4ecb-bf53-f6cc5fb2f013' },
  more:         { uri: 'https://www.figma.com/api/mcp/asset/58a25a2e-16a9-40f6-9072-893a8453bcab' },
  search:       { uri: 'https://www.figma.com/api/mcp/asset/9155f14b-6f44-44e1-9912-566c91ff3d4b' },
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
  img: ImageSourcePropType;
}

const PRODUCTS: Product[] = [
  { id: 'p1',  name: 'Fried Rice',     price: 25, img: PROD_IMG[0] },
  { id: 'p2',  name: 'Pasta Primavera',price: 30, img: PROD_IMG[1] },
  { id: 'p3',  name: 'Garden Salad',   price: 18, img: PROD_IMG[2] },
  { id: 'p4',  name: 'Grilled Chicken',price: 45, img: PROD_IMG[3] },
  { id: 'p5',  name: 'Beef Steak',     price: 65, img: PROD_IMG[0] },
  { id: 'p6',  name: 'Seafood Platter',price: 80, img: PROD_IMG[1] },
  { id: 'p7',  name: 'Lamb Chops',     price: 70, img: PROD_IMG[2] },
  { id: 'p8',  name: 'Veggie Wrap',    price: 20, img: PROD_IMG[3] },
  { id: 'p9',  name: 'Caesar Salad',   price: 22, img: PROD_IMG[0] },
  { id: 'p10', name: 'Chicken Tikka',  price: 40, img: PROD_IMG[1] },
  { id: 'p11', name: 'Mixed Grill',    price: 75, img: PROD_IMG[2] },
  { id: 'p12', name: 'Fish & Chips',   price: 35, img: PROD_IMG[3] },
];

// ─── Grid helpers ─────────────────────────────────────────────────────────────
type GridItem =
  | { type: 'back' }
  | { type: 'product'; product: Product }
  | { type: 'previous' }
  | { type: 'next' };

const COLS = 5;
const PAGE_SIZE = 12;

function buildGrid(products: Product[], page: number, totalPages: number): GridItem[] {
  const pageProducts = products.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const items: GridItem[] = [
    { type: 'back' },
    ...pageProducts.map(p => ({ type: 'product' as const, product: p })),
  ];
  if (page > 0)                items.push({ type: 'previous' });
  if (page < totalPages - 1)   items.push({ type: 'next' });
  return items;
}

// ─── Product card ─────────────────────────────────────────────────────────────
function ProductCard({
  item, size, onBack, onAddProduct, onPrevious, onNext,
}: {
  item: GridItem; size: number;
  onBack: () => void; onAddProduct: (p: Product) => void;
  onPrevious: () => void; onNext: () => void;
}) {
  const sizeStyle = { width: size, height: size };

  if (item.type === 'back') {
    return (
      <TouchableOpacity style={[g.card, g.navCard, sizeStyle]} onPress={onBack} activeOpacity={0.7}>
        <Image source={ICONS.arrowLeft} style={g.navIcon} />
      </TouchableOpacity>
    );
  }
  if (item.type === 'previous') {
    return (
      <TouchableOpacity style={[g.card, g.navCard, sizeStyle]} onPress={onPrevious} activeOpacity={0.7}>
        <Text style={g.navGray}>PREVIOUS</Text>
      </TouchableOpacity>
    );
  }
  if (item.type === 'next') {
    return (
      <TouchableOpacity style={[g.card, g.navCard, sizeStyle]} onPress={onNext} activeOpacity={0.7}>
        <Text style={g.navDark}>NEXT</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[g.card, sizeStyle]} onPress={() => onAddProduct(item.product)} activeOpacity={0.85}>
      <Image source={item.product.img} style={g.productImg} />
      <BlurView intensity={48} tint="dark" style={g.overlay}>
        <Text style={g.productName} numberOfLines={2}>{item.product.name}</Text>
      </BlurView>
    </TouchableOpacity>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  order: Order;
  onBack: () => void;
  onTabPress?: (tab: string) => void;
  onTotalPress?: (cart: CartItem[], orderType: string) => void;
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function OrderEditScreen({ order, onBack, onTabPress, onTotalPress }: Props) {
  const { width: screenW } = useWindowDimensions();
  const searchRef = useRef<TextInput>(null);

  // Convert order items → CartItem[]
  const [cart, setCart] = useState<CartItem[]>(
    order.items.map((item, i) => ({
      id: `oe-${i}`,
      name: item.name,
      price: item.price,
      qty: item.qty,
      note: item.note,
    }))
  );
  const [selectedCartId, setSelectedCartId] = useState<string | null>(null);
  const [search, setSearch]                 = useState('');
  const [searchFocused, setSearchFocused]   = useState(false);
  const [activeTab, setActiveTab]           = useState('orders');
  const [voidReasonVisible, setVoidReasonVisible] = useState(false);
  const [isVoided, setIsVoided]             = useState(order.status === 'VOID');
  const [page, setPage]                     = useState(0);

  const totalPages = Math.ceil(PRODUCTS.length / PAGE_SIZE);

  const filtered = search
    ? PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : PRODUCTS;
  const gridData = buildGrid(filtered, page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));

  const rightW    = screenW - LEFT_PANEL_W;
  const available = rightW - RIGHT_PAD * 2 - CARD_GAP * (COLS - 1);
  const cardSize  = Math.floor(available / COLS);

  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
    setSelectedCartId(product.id);
  }

  function removeFromCart(id: string) {
    setCart(prev => prev.filter(i => i.id !== id));
    setSelectedCartId(prev => prev === id ? null : prev);
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

  const orderTypeLabel = order.type + (order.tableNumber ? ` (${order.tableNumber})` : '');

  return (
    <SafeAreaView style={layout.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundAlt} />

      <View style={layout.row}>

        {/* ══ LEFT: Order panel ══ */}
        <OrderPanel
          items={cart}
          selectedId={selectedCartId}
          onSelectItem={setSelectedCartId}
          onRemoveItem={removeFromCart}
          orderType={orderTypeLabel as any}
          isVoided={isVoided}
          onTotalPress={onTotalPress ? () => onTotalPress(cart, orderTypeLabel) : undefined}
        />

        {/* ══ RIGHT: Product view ══ */}
        <View style={layout.right}>

          {/* Action bar — identical to HomeProductsScreen */}
          <View style={layout.actionBar}>
            {ACTION_BUTTONS.map(btn => (
              <TouchableOpacity
                key={btn.key}
                style={[layout.actionBtn, btn.danger && layout.actionBtnDanger]}
                activeOpacity={0.8}
                onPress={btn.key === 'void' ? () => setVoidReasonVisible(true) : undefined}
              >
                <Image source={btn.icon} style={layout.actionIcon} />
                <Text style={layout.actionLabel}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Search */}
          <Pressable
            style={[layout.searchBar, searchFocused && layout.searchBarFocused]}
            onPress={() => searchRef.current?.focus()}
          >
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
            key={`${page}-${search}`}
            style={s.gridScroll}
            contentContainerStyle={s.gridContent}
            columnWrapperStyle={{ gap: CARD_GAP }}
            ItemSeparatorComponent={() => <View style={{ height: CARD_GAP }} />}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ProductCard
                item={item}
                size={cardSize}
                onBack={onBack}
                onAddProduct={addToCart}
                onPrevious={() => setPage(p => Math.max(0, p - 1))}
                onNext={() => setPage(p => p + 1)}
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
                  onPress={() => { setActiveTab(tab.key); onTabPress?.(tab.key); }}
                  activeOpacity={0.7}
                >
                  <Image source={tab.icon} style={[layout.tabIcon, active && layout.tabIconActive]} />
                  <Text style={[layout.tabLabel, active && layout.tabLabelActive]}>{tab.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

        </View>
      </View>

      <VoidReasonDialog
        visible={voidReasonVisible}
        onClose={() => setVoidReasonVisible(false)}
        onSelectReason={reason => {
          setVoidReasonVisible(false);
          setIsVoided(true);
          setCart([]);
        }}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  gridScroll:   { flex: 1 },
  gridContent:  { paddingBottom: 8 },
});

const g = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },
  navCard: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.grayBorder,
  },
  navIcon:  { width: 28, height: 28, resizeMode: 'contain', opacity: 0.5 },
  navGray:  { fontSize: 13, fontWeight: '600', color: Colors.grayText },
  navDark:  { fontSize: 13, fontWeight: '600', color: Colors.primary },
  productImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  overlay: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.2)',
    borderBottomLeftRadius: 14, borderBottomRightRadius: 14,
    paddingHorizontal: 8, paddingVertical: 7, overflow: 'hidden',
  },
  productName: {
    fontSize: 13, fontWeight: '600', color: Colors.white,
    letterSpacing: -0.2, lineHeight: 17,
  },
});
