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
  ImageSourcePropType,
} from 'react-native';
import { Colors } from '../constants/colors';
import { layout, LEFT_PANEL_W, CARD_GAP, RIGHT_PAD, IPAD_W } from '../styles/screenLayout';
import OrderPanel, { CartItem, Course } from '../components/OrderPanel';
import MoreMenu from '../components/MoreMenu';
import OrderMoreMenu from '../components/OrderMoreMenu';
import ConfirmDialog from '../components/ConfirmDialog';
import TillAmountDialog from '../components/TillAmountDialog';
import DrawerOperationsDialog from '../components/DrawerOperationsDialog';
import ReportsMenuDialog from '../components/ReportsMenuDialog';
import SyncDataDialog    from '../components/SyncDataDialog';
import DiagnosticsScreen from './DiagnosticsScreen';
import EndOfDayScreen from './EndOfDayScreen';
import DevicesScreen from './DevicesScreen';
import SupportScreen from './SupportScreen';
import ScanLoyaltyQRModal from '../components/ScanLoyaltyQRModal';
import RedeemRewardDialog from '../components/RedeemRewardDialog';
import { useI18n } from '../i18n';

// ─── Icons ────────────────────────────────────────────────────────────────────
import {
  iconPrinter, iconKitchen, iconVoid, iconDiscount, iconNotes, iconTags, iconMore,
  iconSearch, iconHome, iconOrders, iconTables, iconNewOrder,
  catImg0, catImg1, catImg2, catImg3, catImg4,
} from '../assets/icons';

const ICONS = {
  printer:  iconPrinter,
  kitchen:  iconKitchen,
  void:     iconVoid,
  discount: iconDiscount,
  notes:    iconNotes,
  tags:     iconTags,
  more:     iconMore,
  search:   iconSearch,
  home:     iconHome,
  orders:   iconOrders,
  tables:   iconTables,
  newOrder: iconNewOrder,
};

const CAT_IMG = {
  img0: catImg0,
  img1: catImg1,
  img2: catImg2,
  img3: catImg3,
  img4: catImg4,
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
  courses?:                Course[];
  onAddCourse?:            () => void;
  onMoveItemToCourse?:     (itemId: string, courseId: string) => void;
  onHoldCourse?:           (courseId: string) => void;
}

export default function HomeScreen({ onTabPress, onCategorySelect, cart, selectedCartId, onSelectItem, onRemoveItem, onUpdateQty, onDoneEditing, isTillOpen, onTillToggle, onExit, orderType, onOrderTypeSet, orderSeq, status, onTotalPress, onAvailabilityPress, tableNumber, courses, onAddCourse, onMoveItemToCourse, onHoldCourse }: Props) {
  const { t, af, isRTL } = useI18n();
  const TAB_KEY_MAP: Record<string, string> = { home: 'tabHome', orders: 'tabOrders', tables: 'tabTables', new: 'tabNew' };
  const [rightW, setRightW] = useState(IPAD_W - LEFT_PANEL_W);
  const searchRef                   = useRef<TextInput>(null);
  const [search, setSearch]         = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab]   = useState('home');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [homeMenuVisible, setHomeMenuVisible]       = useState(false);
  const [orderMoreVisible, setOrderMoreVisible]     = useState(false);
  const [scanQRVisible, setScanQRVisible]           = useState(false);
  const [redeemVisible, setRedeemVisible]           = useState(false);
  const [scannedCode, setScannedCode]               = useState('');
  const [confirmTillVisible, setConfirmTillVisible] = useState(false);
  const [tillAmountVisible, setTillAmountVisible]   = useState(false);
  const [drawerOpsVisible,  setDrawerOpsVisible]    = useState(false);
  const [diagnosticsVisible, setDiagnosticsVisible] = useState(false);
  const [syncVisible,        setSyncVisible]        = useState(false);
  const [endOfDayVisible,    setEndOfDayVisible]    = useState(false);
  const [reportsVisible,     setReportsVisible]     = useState(false);
  const [devicesVisible,     setDevicesVisible]     = useState(false);
  const [supportVisible,     setSupportVisible]     = useState(false);

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
          courses={courses}
          onAddCourse={onAddCourse}
          onMoveItemToCourse={onMoveItemToCourse}
          onHoldCourse={onHoldCourse}
        />

        {/* ══ RIGHT: Content ══ */}
        <View style={layout.right} onLayout={e => setRightW(e.nativeEvent.layout.width)}>

          {/* Action bar */}
          <View style={layout.actionBar}>
            {ACTION_BUTTONS.map(btn => (
              <TouchableOpacity
                key={btn.key}
                style={[layout.actionBtn, btn.danger && layout.actionBtnDanger]}
                activeOpacity={0.8}
                onPress={
                  btn.key === 'more' ? () => setOrderMoreVisible(true) :
                  btn.key === 'void' && selectedCartId ? () => onRemoveItem(selectedCartId) : undefined
                }
              >
                <Image source={btn.icon} style={layout.actionIcon} />
                <Text style={[layout.actionLabel, { fontFamily: af() }]}>{t(btn.key as any)}</Text>
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
                placeholder={t('searchProducts')}
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
                  <Text style={[layout.tabLabel, active && layout.tabLabelActive, { fontFamily: af() }]}>{t(TAB_KEY_MAP[tab.key] as any)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

        </View>
      </View>

      <MoreMenu
        visible={homeMenuVisible}
        onClose={() => setHomeMenuVisible(false)}
        leftPanelWidth={LEFT_PANEL_W + RIGHT_PAD + 8}
        tabBarBottomOffset={76}
        isTillOpen={isTillOpen}
        onItemPress={key => {
          if (key === 'open_till' || key === 'close_till') setConfirmTillVisible(true);
          if (key === 'exit') onExit();
          if (key === 'availability') onAvailabilityPress?.();
          if (key === 'drawer')      setDrawerOpsVisible(true);
          if (key === 'diagnostics') setDiagnosticsVisible(true);
          if (key === 'sync')        setSyncVisible(true);
          if (key === 'end_of_day')  setEndOfDayVisible(true);
          if (key === 'reports')     setReportsVisible(true);
          if (key === 'devices')     setDevicesVisible(true);
          if (key === 'support')     setSupportVisible(true);
        }}
      />

      <ConfirmDialog
        visible={confirmTillVisible}
        title={t(isTillOpen ? 'closeTill' : 'openTill')}
        message={t(isTillOpen ? 'closeTillConfirm' : 'openTillConfirm')}
        onNo={() => setConfirmTillVisible(false)}
        onYes={() => { setConfirmTillVisible(false); setTillAmountVisible(true); }}
      />

      <TillAmountDialog
        visible={tillAmountVisible}
        onClose={() => setTillAmountVisible(false)}
        onDone={() => { setTillAmountVisible(false); onTillToggle(); }}
        ctaLabel={t(isTillOpen ? 'closeTill' : 'openTill')}
      />

      <DrawerOperationsDialog
        visible={drawerOpsVisible}
        onClose={() => setDrawerOpsVisible(false)}
      />

      <SyncDataDialog
        visible={syncVisible}
        onClose={() => setSyncVisible(false)}
      />


      <DiagnosticsScreen
        visible={diagnosticsVisible}
        onClose={() => setDiagnosticsVisible(false)}
        isTillOpen={isTillOpen}
        isClockedIn={false}
        ordersPendingSync={0}
      />

      <EndOfDayScreen
        visible={endOfDayVisible}
        onClose={() => setEndOfDayVisible(false)}
      />

      <ReportsMenuDialog
        visible={reportsVisible}
        onClose={() => setReportsVisible(false)}
      />

      <DevicesScreen
        visible={devicesVisible}
        onClose={() => setDevicesVisible(false)}
      />

      <SupportScreen
        visible={supportVisible}
        onClose={() => setSupportVisible(false)}
      />

      <OrderMoreMenu
        visible={orderMoreVisible}
        onClose={() => setOrderMoreVisible(false)}
        status={
          status === 'VOID'     ? 'voided'   :
          status === 'RETURNED' ? 'returned' :
          status === 'DONE'     ? 'done'     :
                                  'active'
        }
        onItemPress={key => {
          if (key === 'scan_loyalty_qr') { setScannedCode(''); setScanQRVisible(true); }
          if (key === 'redeem_reward')   { setScannedCode(''); setRedeemVisible(true); }
        }}
      />

      <ScanLoyaltyQRModal
        visible={scanQRVisible}
        onClose={() => setScanQRVisible(false)}
        onScanned={code => {
          setScanQRVisible(false);
          setScannedCode(code);
          setRedeemVisible(true);
        }}
      />

      <RedeemRewardDialog
        visible={redeemVisible}
        code={scannedCode}
        onClose={() => setRedeemVisible(false)}
        onApply={code => {
          console.log('Redeem reward code:', code);
        }}
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
