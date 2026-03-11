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

// ─── Asset URLs (Figma node 9-33) ─────────────────────────────────────────────
const ICONS = {
  printer:  { uri: 'https://www.figma.com/api/mcp/asset/f43ecbc6-f49f-41af-8bce-b3aceeb7c593' },
  kitchen:  { uri: 'https://www.figma.com/api/mcp/asset/73b1b7b2-649a-4884-a4bc-c336c123a9a5' },
  void:     { uri: 'https://www.figma.com/api/mcp/asset/542d1143-1899-4b0e-bf8b-a5ec2788eb75' },
  discount: { uri: 'https://www.figma.com/api/mcp/asset/e237b4d0-f4d6-46b7-aa7b-ff019b452491' },
  notes:    { uri: 'https://www.figma.com/api/mcp/asset/86ea4743-bba1-4147-bfeb-e8a0a789f73c' },
  tags:     { uri: 'https://www.figma.com/api/mcp/asset/5ef9060d-7645-4473-8f8a-071e6e3aa10d' },
  more:     { uri: 'https://www.figma.com/api/mcp/asset/88f5a31d-1674-4dca-b3fb-47c479c8f5ad' },
  search:   { uri: 'https://www.figma.com/api/mcp/asset/16716d7b-a23f-4fc3-812b-6beecf934ea2' },
  home:     { uri: 'https://www.figma.com/api/mcp/asset/de698f57-3a4d-4649-a5a7-b45450ada39c' },
  orders:   { uri: 'https://www.figma.com/api/mcp/asset/af583d1a-f13b-42f2-9713-8f8370b47c5f' },
  tables:   { uri: 'https://www.figma.com/api/mcp/asset/e6c5b050-0608-4d02-97b8-ab7950ed18bc' },
  newOrder: { uri: 'https://www.figma.com/api/mcp/asset/c1143eb2-c349-4a02-a008-e4c6cd0f5170' },
};

const CAT_IMG = {
  img0: { uri: 'https://www.figma.com/api/mcp/asset/72df0395-bc08-44a3-9c27-c98c9905e5dd' },
  img1: { uri: 'https://www.figma.com/api/mcp/asset/74d44d07-8cab-466f-b13d-99effe3ba6c1' },
  img2: { uri: 'https://www.figma.com/api/mcp/asset/8a4cf30b-47e8-40d1-9039-7f613b120e39' },
  img3: { uri: 'https://www.figma.com/api/mcp/asset/78219868-ae86-44f2-9c46-7225faff05af' },
  img4: { uri: 'https://www.figma.com/api/mcp/asset/03aa7717-fe20-4911-be0a-b84feb9de66d' },
};

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
  { key: 'home',   label: 'HOME',   icon: ICONS.home     },
  { key: 'orders', label: 'ORDERS', icon: ICONS.orders   },
  { key: 'tables', label: 'TABLES', icon: ICONS.tables   },
  { key: 'new',    label: 'NEW',    icon: ICONS.newOrder },
];

interface Category {
  id: string;
  name: string;
  image?: ImageSourcePropType | null;
}

const CATEGORIES: Category[] = [
  { id: 'c1', name: 'MAIN CATEGORY 1', image: CAT_IMG.img0 },
  { id: 'c2', name: 'MAIN CATEGORY 2', image: CAT_IMG.img1 },
  { id: 'c3', name: 'SALADS',          image: CAT_IMG.img2 },
  { id: 'c4', name: 'BREAKFAST',       image: CAT_IMG.img3 },
  { id: 'c5', name: 'BEVERAGES',       image: CAT_IMG.img4 },
  { id: 'c6', name: 'MAIN DISHES',     image: CAT_IMG.img0 },
  { id: 'c7', name: 'SIDE DISHES',     image: CAT_IMG.img1 },
  { id: 'c8', name: 'DESSERTS',        image: CAT_IMG.img2 },
  { id: 'c9', name: 'SPECIALS',        image: CAT_IMG.img3 },
  { id: 'c10', name: 'SEASONAL MENU' },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const COLS    = 5;
const NAME_H  = 46;

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  onTabPress?:       (tab: string) => void;
  onCategorySelect?: (categoryId: string) => void;
  cart:            CartItem[];
  selectedCartId:  string | null;
  onSelectItem:    (id: string) => void;
  onRemoveItem:    (id: string) => void;
  onUpdateQty?:    (id: string, delta: number) => void;
  onDoneEditing?:  () => void;
  isTillOpen:           boolean;
  onTillToggle:         () => void;
  onExit:               () => void;
  orderType?:           string | null;
  onOrderTypeSet?:      (type: any) => void;
  orderSeq?:            number;
  status?:              string;
  onTotalPress?:        () => void;
  onAvailabilityPress?: () => void;
  tableNumber?:         string;
}

export default function HomeScreen({ onTabPress, onCategorySelect, cart, selectedCartId, onSelectItem, onRemoveItem, onUpdateQty, onDoneEditing, isTillOpen, onTillToggle, onExit, orderType, onOrderTypeSet, orderSeq, status, onTotalPress, onAvailabilityPress, tableNumber }: Props) {
  const { width: screenW }      = useWindowDimensions();
  const searchRef                   = useRef<TextInput>(null);
  const [search, setSearch]         = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab]   = useState('home');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [homeMenuVisible, setHomeMenuVisible]       = useState(false);
  const [confirmTillVisible, setConfirmTillVisible] = useState(false);
  const [tillAmountVisible, setTillAmountVisible]   = useState(false);

  const rightW    = screenW - LEFT_PANEL_W;
  const available = rightW - RIGHT_PAD * 2 - CARD_GAP * (COLS - 1);
  const cardW     = Math.floor(available / COLS);
  const cardH     = cardW + NAME_H;

  const filtered = CATEGORIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={layout.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundAlt} />

      <View style={layout.row}>

        {/* ══ LEFT: Order panel ══ */}
        <OrderPanel
          items={cart}
          selectedId={selectedCartId}
          onSelectItem={onSelectItem}
          onRemoveItem={onRemoveItem}
          orderType={orderType}
          orderSeq={orderSeq}
          status={status}
          tableNumber={tableNumber}
          onTotalPress={onTotalPress}
        />

        {/* ══ RIGHT: Content ══ */}
        <View style={layout.right}>

          {/* Action bar */}
          <View style={layout.actionBar}>
            {ACTION_BUTTONS.map(btn => (
              <TouchableOpacity
                key={btn.key}
                style={[layout.actionBtn, btn.danger && layout.actionBtnDanger]}
                activeOpacity={0.8}
                onPress={btn.key === 'void' && selectedCartId ? () => onRemoveItem(selectedCartId) : undefined}
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

          {/* Category grid */}
          <FlatList
            data={filtered}
            keyExtractor={c => c.id}
            numColumns={COLS}
            style={styles.grid}
            contentContainerStyle={styles.gridContent}
            columnWrapperStyle={{ gap: CARD_GAP }}
            ItemSeparatorComponent={() => <View style={{ height: CARD_GAP }} />}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const selected = item.id === selectedId;
              return (
                <TouchableOpacity
                  style={[styles.card, { width: cardW, height: cardH }]}
                  onPress={() => {
                    setSelectedId(item.id);
                    onCategorySelect?.(item.id);
                  }}
                  activeOpacity={0.85}
                >
                  <View style={[styles.cardImageWrap, { height: cardW }]}>
                    {item.image ? (
                      <Image source={item.image} style={styles.cardImage} />
                    ) : (
                      <View style={styles.cardNoImage}>
                        <Text style={styles.cardNoImageIcon}>🍽</Text>
                      </View>
                    )}
                    {selected && <View style={styles.cardAccent} />}
                  </View>
                  <View style={[styles.cardNameWrap, { height: NAME_H }, selected && styles.cardNameWrapSelected]}>
                    <Text style={[styles.cardName, selected && styles.cardNameSelected]} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
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
                    } else {
                      setActiveTab(tab.key);
                      if (tab.key === 'orders' || tab.key === 'tables') onTabPress?.(tab.key);
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
        onClose={() => setTillAmountVisible(false)}
        onDone={() => { setTillAmountVisible(false); onTillToggle(); }}
        ctaLabel={isTillOpen ? 'Close Till' : 'Open Till'}
      />
    </SafeAreaView>
  );
}

// ─── Screen-specific styles only ──────────────────────────────────────────────
const styles = StyleSheet.create({
  grid: {
    flex: 1,
  },
  gridContent: {
    paddingBottom: 8,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImageWrap: {
    width: '100%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.primary,
  },
  cardNameWrap: {
    width: '100%',
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  cardNameWrapSelected: {
    backgroundColor: Colors.primaryLight,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.black,
    textAlign: 'center',
    letterSpacing: -0.065,
    lineHeight: 16,
  },
  cardNameSelected: {
    color: Colors.primary,
  },
  cardNoImage: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardNoImageIcon: {
    fontSize: 40,
    opacity: 0.55,
  },
});
