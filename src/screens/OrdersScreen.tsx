import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Pressable,
  Image,
  TextInput,
  FlatList,
  ScrollView,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Animated,
} from 'react-native';
import { Colors } from '../constants/colors';
import { layout } from '../styles/screenLayout';
import { useI18n } from '../i18n';
import OrderPanel, { CartItem } from '../components/OrderPanel';
import ReturnOrderDialog, { ReturnItem } from '../components/ReturnOrderDialog';
import ReturnReasonDialog from '../components/ReturnReasonDialog';
import ReturnAmountDialog from '../components/ReturnAmountDialog';
import ReceiptModal       from '../components/ReceiptModal';
import OrdersSyncDialog   from '../components/OrdersSyncDialog';

// ─── Icons ────────────────────────────────────────────────────────────────────
import { iconSearch, iconSarDark, iconSarWhite, iconArrowLeft } from '../assets/icons';

const ICONS = {
  search:    iconSearch,
  sar:       iconSarDark,
  sarW:      iconSarWhite,
  arrowLeft: iconArrowLeft,
};

// ─── Types ────────────────────────────────────────────────────────────────────
type FilterTab    = 'ALL' | 'ACTIVE' | 'PENDING' | 'DONE' | 'VOID' | 'RETURNED';
type OrderStatus  = 'ACTIVE' | 'PENDING' | 'DONE' | 'VOID' | 'RETURNED';
type OrderType    = 'DINE IN' | 'PICK UP' | 'DELIVERY' | 'DRIVE THRU';
type PaymentMethod = 'Cash' | 'Card' | 'Split' | 'Unpaid';
type OrderSource  = 'Cashier' | 'API';

interface OrderFilters {
  statusId:     string;   // '' = All
  typeId:       string;   // '' = All
  sourceId:     string;   // '' = All
  creatorId:    string;   // '' = All
  cashierId:    string;   // '' = All
  driverId:     string;   // '' = All
  businessDate: string;   // '' = All, or 'YYYY-MM-DD'
  dueDate:      string;   // '' = All, or 'YYYY-MM-DD'
  ahead:        boolean;
}

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  tableNumber?: string;
  itemCount: number;
  time: string;
  closedAt?: string;
  customerName?: string;
  customerPhone?: string;
  createdBy: string;
  source?: OrderSource;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const ORDERS: Order[] = [
  { id: '1',  orderNumber: '100351', type: 'PICK UP',    itemCount: 8, time: '07:41 PM', closedAt: '07:55 PM', createdBy: 'Mohammed',  source: 'Cashier', paymentMethod: 'Card',   status: 'ACTIVE',  total: 23.00, items: [{ name: 'Gourmet Burger Large', qty: 1, price: 23, note: '+ Sourdough Bread' }] },
  { id: '2',  orderNumber: '100350', type: 'PICK UP',    itemCount: 7, time: '07:39 PM', closedAt: '07:52 PM', createdBy: 'Mohammed',  source: 'Cashier', paymentMethod: 'Cash',   status: 'ACTIVE',  total: 67.50, items: [{ name: 'Grilled Chicken', qty: 2, price: 45 }, { name: 'Garden Salad', qty: 1, price: 18 }] },
  { id: '3',  orderNumber: '100349', type: 'PICK UP',    itemCount: 6, time: '07:38 PM', closedAt: '07:50 PM', createdBy: 'Sara',      source: 'Cashier', paymentMethod: 'Card',   status: 'DONE',    total: 7.00,  items: [{ name: 'Water Bottle', qty: 2, price: 7 }] },
  { id: '4',  orderNumber: '100348', type: 'PICK UP',    itemCount: 5, time: '06:55 PM', closedAt: '07:10 PM', createdBy: 'Mohammed',  source: 'API',     paymentMethod: 'Cash',   status: 'ACTIVE',  total: 2.00,  items: [{ name: 'Coffee', qty: 1, price: 2 }] },
  { id: '5',  orderNumber: '100347', type: 'DINE IN',    tableNumber: 'Table 1', itemCount: 3, time: '05:17 PM', closedAt: '05:45 PM', customerName: 'Hassan',  customerPhone: '0599999999', createdBy: 'Sara', source: 'Cashier', paymentMethod: 'Unpaid', status: 'VOID', total: 0.00, items: [{ name: 'Fried Rice', qty: 1, price: 15 }, { name: 'Juice', qty: 2, price: 10 }] },
  { id: '6',  orderNumber: '100346', type: 'DINE IN',    tableNumber: 'Table 1', itemCount: 4, time: '03:54 PM', closedAt: '04:20 PM', createdBy: 'Mohammed',  source: 'Cashier', paymentMethod: 'Unpaid', status: 'VOID', total: 0.00, items: [{ name: 'Pasta Primavera', qty: 1, price: 30 }] },
  { id: '7',  orderNumber: '100345', type: 'DELIVERY',   itemCount: 4, time: '03:10 PM', closedAt: '03:45 PM', customerName: 'Ahmed Sha',  customerPhone: '0508946545', createdBy: 'Sara', source: 'API', paymentMethod: 'Card', status: 'DONE', total: 112.75, items: [{ name: 'Beef Steak', qty: 1, price: 65 }, { name: 'Pasta', qty: 1, price: 30 }, { name: 'Salad', qty: 2, price: 36 }] },
  { id: '8',  orderNumber: '100344', type: 'PICK UP',    itemCount: 2, time: '02:30 PM', closedAt: '02:44 PM', customerName: 'Fatima N',   customerPhone: '0509876543', createdBy: 'Mohammed', source: 'Cashier', paymentMethod: 'Cash', status: 'DONE', total: 36.00, items: [{ name: 'Caesar Salad', qty: 2, price: 18 }] },
  { id: '9',  orderNumber: '100343', type: 'DINE IN',    tableNumber: 'Table 3', itemCount: 5, time: '01:15 PM', closedAt: '02:00 PM', customerName: 'Khalid M', customerPhone: '0544332211', createdBy: 'Sara', source: 'Cashier', paymentMethod: 'Split', status: 'DONE', total: 204.00, items: [{ name: 'Mixed Grill', qty: 2, price: 150 }, { name: 'Lamb Chops', qty: 1, price: 70 }, { name: 'Juice', qty: 2, price: 20 }] },
  { id: '10', orderNumber: '100342', type: 'DRIVE THRU', itemCount: 3, time: '12:05 PM', closedAt: '12:18 PM', createdBy: 'Mohammed',  source: 'Cashier', paymentMethod: 'Card',   status: 'DONE',    total: 55.50, items: [{ name: 'Chicken Tikka', qty: 1, price: 40 }, { name: 'Salad', qty: 1, price: 18 }] },
  { id: '11', orderNumber: '100341', type: 'PENDING',    itemCount: 2, time: '11:50 AM', createdBy: 'Sara',      source: 'API',     paymentMethod: 'Unpaid', status: 'PENDING', total: 38.50, items: [{ name: 'Veggie Wrap', qty: 2, price: 20 }] } as any,
  { id: '12', orderNumber: '100340', type: 'PICK UP',    itemCount: 1, time: '11:30 AM', createdBy: 'Mohammed',  source: 'Cashier', paymentMethod: 'Unpaid', status: 'PENDING', total: 22.00, items: [{ name: 'Veggie Wrap', qty: 1, price: 20 }] },
];

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<OrderStatus, string> = {
  ACTIVE:   Colors.primary,
  PENDING:  Colors.yellowGold,
  DONE:     Colors.green,
  VOID:     Colors.red,
  RETURNED: '#7C6DB5',
};

const STATUS_BG: Record<OrderStatus, string> = {
  ACTIVE:   Colors.primaryLight,
  PENDING:  '#FFF8EC',
  DONE:     '#E8F5EE',
  VOID:     '#FAE8E8',
  RETURNED: '#F0EDF9',
};

// ─── More menu ────────────────────────────────────────────────────────────────
const ALL_MORE_ACTIONS = [
  { key: 'receipt',  label: 'View Receipt' },
  { key: 'print',    label: 'Print' },
  { key: 'kitchen',  label: 'Send To Kitchen' },
  { key: 'return',   label: 'Return Order' },
  { key: 'details',  label: 'View Order Details' },
];

const STATUS_MORE_KEYS: Record<OrderStatus, string[]> = {
  ACTIVE:   ['receipt', 'print', 'kitchen', 'details'],
  PENDING:  ['receipt', 'print', 'kitchen', 'details'],
  DONE:     ['receipt', 'print', 'return',  'details'],
  VOID:     ['receipt', 'print', 'details'],
  RETURNED: ['receipt', 'print', 'details'],
};

interface MoreMenuProps {
  visible: boolean;
  onClose: () => void;
  onAction: (key: string) => void;
  orderStatus: OrderStatus | undefined;
}

function MoreMenu({ visible, onClose, onAction, orderStatus }: MoreMenuProps) {
  const { af, isRTL } = useI18n();
  const allowedKeys = orderStatus ? STATUS_MORE_KEYS[orderStatus] : STATUS_MORE_KEYS.ACTIVE;
  const actions = ALL_MORE_ACTIONS.filter(a => allowedKeys.includes(a.key));
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>
      <View style={[mm.container, isRTL ? { left: 20, right: undefined } : { right: 20 }]} pointerEvents="box-none">
        <View style={mm.card}>
          {actions.map((action, i) => (
            <React.Fragment key={action.key}>
              {i > 0 && <View style={mm.divider} />}
              <TouchableOpacity
                style={[mm.row, action.key === 'details' && mm.rowHighlight]}
                onPress={() => { onAction(action.key); onClose(); }}
                activeOpacity={0.6}
              >
                <Text style={[mm.rowLabel, action.key === 'details' && mm.rowLabelHighlight, { fontFamily: af('regular') }]}>
                  {action.label}
                </Text>
                {action.key === 'details' && (
                  <View style={mm.activeDot}>
                    <View style={mm.activeDotInner} />
                  </View>
                )}
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const mm = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 72,
  },
  card: {
    width: 240,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.grayBorder,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  rowHighlight: {
    backgroundColor: Colors.primaryLight,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.2,
  },
  rowLabelHighlight: {
    fontWeight: '600',
    color: Colors.primary,
  },
  activeDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
});

// ─── Order Detail Full View (right panel content) ────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  const { af } = useI18n();
  return (
    <View style={dv.infoRow}>
      <Text style={[dv.infoLabel, { fontFamily: af('regular') }]}>{label}</Text>
      <Text style={[dv.infoValue, { fontFamily: af('semibold') }]}>{value}</Text>
    </View>
  );
}

function TapRow({ label, onPress }: { label: string; onPress: () => void }) {
  const { af } = useI18n();
  return (
    <TouchableOpacity style={dv.infoRow} onPress={onPress} activeOpacity={0.7}>
      <Text style={[dv.infoLabel, { fontFamily: af('regular') }]}>{label}</Text>
      <View style={dv.tapRowRight}>
        <Text style={[dv.tapRowLink, { fontFamily: af('semibold') }]}>View</Text>
        <Text style={[dv.tapRowChev, { fontFamily: af('regular') }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

interface OrderDetailViewProps {
  order: Order;
  onBack: () => void;
}

function OrderDetailView({ order, onBack }: OrderDetailViewProps) {
  const { t, af } = useI18n();
  const subtotal = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax      = order.status === 'VOID' ? 0 : subtotal * 0.15;
  const total    = subtotal + tax;
  const [receiptVisible, setReceiptVisible] = useState(false);

  const PAYMENT_LABEL: Record<PaymentMethod, string> = {
    Cash: 'Cash', Card: 'Card', Split: 'Split', Unpaid: 'Unpaid',
  };

  return (
    <>
      {/* Action bar */}
      <View style={[s.actionBar, dv.actionBar]}>
        <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Image source={ICONS.arrowLeft} style={s.btnIcon} />
          <Text style={[s.btnLabel, { fontFamily: af('medium') }]}>BACK</Text>
        </TouchableOpacity>

        <View style={dv.titleArea}>
          <Text style={[dv.titleOrderNum, { fontFamily: af('bold') }]}>#{order.orderNumber}</Text>
          <View style={[dv.statusChip, { backgroundColor: STATUS_BG[order.status] }]}>
            <View style={[dv.statusDot, { backgroundColor: STATUS_COLOR[order.status] }]} />
            <Text style={[dv.statusChipText, { color: STATUS_COLOR[order.status], fontFamily: af('bold') }]}>{STATUS_I18N_KEY[order.status] ? t(STATUS_I18N_KEY[order.status]) : order.status}</Text>
          </View>
        </View>

        <TouchableOpacity style={s.toolBtn} onPress={() => setReceiptVisible(true)} activeOpacity={0.8}>
          <Text style={[s.btnLabel, { fontFamily: af('medium') }]}>VIEW RECEIPT</Text>
        </TouchableOpacity>
      </View>

      {/* Detail content card */}
      <View style={dv.card}>
        {/* Status accent bar */}
        <View style={[dv.accentBar, { backgroundColor: STATUS_COLOR[order.status] }]} />

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Order info grid */}
          <View style={dv.section}>
            <Text style={[dv.sectionLabel, { fontFamily: af('bold') }]}>ORDER INFORMATION</Text>
            <InfoRow label="Order Type"   value={order.type + (order.tableNumber ? ` — ${order.tableNumber}` : '')} />
            {order.source        && <InfoRow label="Order Source" value={order.source} />}
            <InfoRow label="Creator"      value={order.createdBy} />
            <InfoRow label="Order Time"   value={order.time} />
            {order.closedAt      && <InfoRow label="Closed At"   value={order.closedAt} />}
            <InfoRow label="Payment"      value={PAYMENT_LABEL[order.paymentMethod]} />
            <InfoRow label="Items"        value={`${order.itemCount} items`} />
            {order.customerName  && <InfoRow label="Customer" value={order.customerName} />}
            {order.customerPhone && <InfoRow label="Phone"    value={order.customerPhone} />}
            <TapRow label="View Receipt"  onPress={() => setReceiptVisible(true)} />
          </View>

          <View style={dv.divider} />

          {/* Items */}
          <View style={dv.section}>
            <Text style={[dv.sectionLabel, { fontFamily: af('bold') }]}>ORDER ITEMS</Text>
            {order.items.map((item, i) => (
              <View key={i} style={dv.itemRow}>
                <View style={dv.itemQtyBadge}>
                  <Text style={[dv.itemQtyText, { fontFamily: af('bold') }]}>{item.qty}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[dv.itemName, { fontFamily: af('medium') }]}>{item.name}</Text>
                  {item.note && <Text style={[dv.itemNote, { fontFamily: af('regular') }]}>{item.note}</Text>}
                </View>
                <View style={dv.amountRow}>
                  <Image source={ICONS.sar} style={dv.sarIcon} />
                  <Text style={[dv.itemPrice, { fontFamily: af('semibold') }]}>{(item.price * item.qty).toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={dv.divider} />

          {/* Totals */}
          <View style={[dv.section, { gap: 12 }]}>
            <View style={dv.totalRow}>
              <Text style={[dv.totalLabel, { fontFamily: af('regular') }]}>Subtotal</Text>
              <View style={dv.amountRow}>
                <Image source={ICONS.sar} style={dv.sarIcon} />
                <Text style={[dv.totalVal, { fontFamily: af('medium') }]}>{subtotal.toFixed(2)}</Text>
              </View>
            </View>
            <View style={dv.totalRow}>
              <Text style={[dv.totalLabel, { fontFamily: af('regular') }]}>Tax (15%)</Text>
              <View style={dv.amountRow}>
                <Image source={ICONS.sar} style={dv.sarIcon} />
                <Text style={[dv.totalVal, { fontFamily: af('medium') }]}>{tax.toFixed(2)}</Text>
              </View>
            </View>
            <View style={[dv.totalRow, dv.grandTotalRow]}>
              <Text style={[dv.grandTotalLabel, { fontFamily: af('bold') }]}>Total</Text>
              <View style={dv.amountRow}>
                <Image source={ICONS.sar} style={[dv.sarIcon, dv.sarIconLg]} />
                <Text style={[dv.grandTotalVal, { fontFamily: af('bold') }]}>{order.status === 'VOID' ? '0.00' : total.toFixed(2)}</Text>
              </View>
            </View>
          </View>

        </ScrollView>
      </View>

      <ReceiptModal
        visible={receiptVisible}
        onClose={() => setReceiptVisible(false)}
        order={order}
      />
    </>
  );
}

const dv = StyleSheet.create({
  actionBar: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  titleArea:{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4 },
  titleOrderNum: { fontSize: 18, fontWeight: '700', color: Colors.primary, letterSpacing: -0.4 },
  statusChip:    { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusDot:     { width: 7, height: 7, borderRadius: 4 },
  statusChipText:{ fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },

  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  accentBar: { height: 4 },

  section:      { paddingHorizontal: 24, paddingVertical: 18 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.grayText, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 },

  infoRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: Colors.grayBorder },
  infoLabel: { fontSize: 14, fontWeight: '500', color: Colors.grayText },
  infoValue: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  tapRowRight: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  tapRowLink:  { fontSize: 14, fontWeight: '600', color: Colors.primary },
  tapRowChev:  { fontSize: 18, fontWeight: '400', color: Colors.primary, lineHeight: 22 },

  divider: { height: 1, backgroundColor: Colors.grayBorder, marginHorizontal: 24 },

  itemRow:      { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.grayBorder, gap: 12 },
  itemQtyBadge: { width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  itemQtyText:  { fontSize: 13, fontWeight: '700', color: Colors.primary },
  itemName:     { fontSize: 14, fontWeight: '500', color: Colors.black, lineHeight: 20 },
  itemNote:     { fontSize: 12, fontWeight: '400', color: Colors.grayText, marginTop: 2 },
  itemPrice:    { fontSize: 14, fontWeight: '600', color: Colors.black, alignSelf: 'center' },

  totalRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel:     { fontSize: 14, fontWeight: '400', color: Colors.grayText },
  totalVal:       { fontSize: 14, fontWeight: '500', color: Colors.grayText },
  grandTotalRow:  { borderTopWidth: 1, borderTopColor: Colors.grayBorder, paddingTop: 12, marginTop: 4 },
  grandTotalLabel:{ fontSize: 18, fontWeight: '700', color: Colors.primary },
  grandTotalVal:  { fontSize: 18, fontWeight: '700', color: Colors.primary },
  amountRow:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sarIcon:        { width: 12, height: 14, resizeMode: 'contain', opacity: 0.6 },
  sarIconLg:      { width: 15, height: 17, opacity: 1 },
});

// ─── Dashed divider ───────────────────────────────────────────────────────────
function DashedDivider() {
  return (
    <View style={s.dashedRow}>
      {Array.from({ length: 80 }).map((_, i) => (
        <View key={i} style={s.dash} />
      ))}
    </View>
  );
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────
type FPStep = 'main' | 'status' | 'type' | 'source' | 'creator' | 'cashier' | 'driver' | 'biz_date' | 'due_date';

const STATUS_OPTIONS = [
  { id: 'PENDING',  label: 'Pending'  },
  { id: 'ACTIVE',   label: 'Active'   },
  { id: 'JOINED',   label: 'Joined'   },
  { id: 'RETURNED', label: 'Returned' },
  { id: 'DONE',     label: 'Done'     },
  { id: 'DECLINED', label: 'Declined' },
];
const TYPE_OPTIONS = [
  { id: 'DINE IN',    label: 'Dine In'    },
  { id: 'PICK UP',    label: 'Pick Up'    },
  { id: 'DELIVERY',   label: 'Delivery'   },
  { id: 'DRIVE THRU', label: 'Drive Thru' },
];
const SOURCE_OPTIONS = [
  { id: 'Call Center',          label: 'Call Center'          },
  { id: 'Cashier',              label: 'Cashier'              },
  { id: 'API',                  label: 'API'                  },
  { id: 'API (Foodics Online)', label: 'API (Foodics Online)' },
];
const STAFF_OPTIONS = [
  { id: 'Sainudheen',     label: 'Sainudheen'     },
  { id: 'سيد عمر',       label: 'سيد عمر'       },
  { id: 'Saud Al Osaimi', label: 'Saud Al Osaimi' },
  { id: 'احمد',           label: 'احمد'           },
  { id: 'Call Center',    label: 'Call Center'    },
  { id: 'ابويكر يس',     label: 'ابويكر يس'     },
];
const DRIVER_OPTIONS = [
  { id: '_none',          label: 'No Driver Assigned' },
  { id: 'Sainudheen',     label: 'Sainudheen'         },
  { id: 'Saud Al Osaimi', label: 'Saud Al Osaimi'     },
  { id: 'احمد',           label: 'احمد'               },
  { id: 'ابويكر يس',     label: 'ابويكر يس'         },
  { id: 'ابو بكر يس',    label: 'ابو بكر يس'         },
];

const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_NAMES = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function formatDateLabel(iso: string): string {
  if (!iso) return 'All';
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTH_SHORT[m-1]} ${d}, ${y}`;
}
function findLabel(opts: { id: string; label: string }[], id: string) {
  return opts.find(o => o.id === id)?.label ?? 'All';
}

function emptyFilters(): OrderFilters {
  return {
    statusId: '', typeId: '', sourceId: '',
    creatorId: '', cashierId: '', driverId: '',
    businessDate: '', dueDate: '', ahead: false,
  };
}

function countActiveFilters(f: OrderFilters): number {
  return (f.statusId ? 1 : 0) + (f.typeId ? 1 : 0) + (f.sourceId ? 1 : 0) +
    (f.creatorId ? 1 : 0) + (f.cashierId ? 1 : 0) + (f.driverId ? 1 : 0) +
    (f.businessDate ? 1 : 0) + (f.dueDate ? 1 : 0) + (f.ahead ? 1 : 0);
}

interface FilterPanelProps {
  visible:      boolean;
  filters:      OrderFilters;
  onApply:      (f: OrderFilters) => void;
  onClose:      () => void;
  initialStep?: FPStep | 'main-scrolled';
}

function FilterPanel({ visible, filters, onApply, onClose, initialStep }: FilterPanelProps) {
  const { t, af, isRTL } = useI18n();
  const [local,    setLocal]    = useState<OrderFilters>(emptyFilters);
  const [step,     setStep]     = useState<FPStep>(
    (initialStep && initialStep !== 'main-scrolled') ? initialStep : 'main'
  );
  const [calYear,  setCalYear]  = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const mainScrollRef = useRef<ScrollView>(null);

  React.useEffect(() => {
    if (visible) {
      setLocal({ ...filters });
      const s = (initialStep && initialStep !== 'main-scrolled') ? initialStep : 'main';
      setStep(s);
      if (initialStep === 'main-scrolled') {
        setTimeout(() => mainScrollRef.current?.scrollToEnd({ animated: false }), 100);
      }
    }
  }, [visible]);

  const TODAY = todayISO();

  // ── Mini calendar ──────────────────────────────────────────────────────────
  function MiniCalendar({ dateStr, onSelect, bottomLink, onBottomLink }: {
    dateStr: string;
    onSelect: (d: string) => void;
    bottomLink?: string;
    onBottomLink?: () => void;
  }) {
    const daysInMo  = new Date(calYear, calMonth + 1, 0).getDate();
    const firstDay  = new Date(calYear, calMonth, 1).getDay();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMo; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

    function dayISO(d: number) {
      return `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    }
    function prevMonth() {
      if (calMonth === 0) { setCalYear(y => y-1); setCalMonth(11); } else setCalMonth(m => m-1);
    }
    function nextMonth() {
      if (calMonth === 11) { setCalYear(y => y+1); setCalMonth(0); } else setCalMonth(m => m+1);
    }

    return (
      <View style={fp.calendar}>
        <View style={fp.calHeader}>
          <Text style={[fp.calMonthTitle, { fontFamily: af('semibold') }]}>{MONTH_NAMES[calMonth]} {calYear} ›</Text>
          <View style={fp.calNavRow}>
            <TouchableOpacity onPress={prevMonth} style={fp.calNav} activeOpacity={0.7}>
              <Text style={[fp.calNavText, { fontFamily: af('regular') }]}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={nextMonth} style={fp.calNav} activeOpacity={0.7}>
              <Text style={[fp.calNavText, { fontFamily: af('regular') }]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={fp.calDayNames}>
          {DAY_NAMES.map(d => <Text key={d} style={[fp.calDayName, { fontFamily: af('medium') }]}>{d}</Text>)}
        </View>

        {rows.map((row, ri) => (
          <View key={ri} style={fp.calWeek}>
            {row.map((day, di) => {
              if (!day) return <View key={di} style={fp.calDay} />;
              const iso = dayISO(day);
              const sel = iso === dateStr;
              const tod = iso === TODAY;
              return (
                <TouchableOpacity key={di} style={fp.calDay} onPress={() => onSelect(iso)} activeOpacity={0.7}>
                  <View style={[fp.calDayInner, sel && fp.calDaySel, !sel && tod && fp.calDayTod]}>
                    <Text style={[fp.calDayText, sel && fp.calDayTextSel, !sel && tod && fp.calDayTextTod, { fontFamily: af(sel || tod ? 'semibold' : 'regular') }]}>
                      {day}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {bottomLink && (
          <TouchableOpacity style={fp.calBottom} onPress={onBottomLink} activeOpacity={0.7}>
            <Text style={[fp.calBottomText, { fontFamily: af('medium') }]}>{bottomLink}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ── Sub-list (single-select) ───────────────────────────────────────────────
  function SelectList({ options, selectedId, onSelect }: {
    options: { id: string; label: string }[];
    selectedId: string;
    onSelect: (id: string) => void;
  }) {
    return (
      <ScrollView bounces={false} style={fp.subList}>
        <TouchableOpacity onPress={() => onSelect('')} activeOpacity={0.7}>
          <View style={fp.optRow}>
            <Text style={[fp.optLabel, !selectedId && fp.optLabelSel, { fontFamily: af(!selectedId ? 'medium' : 'regular') }]}>All</Text>
            {!selectedId && <Text style={[fp.optCheck, { fontFamily: af('semibold') }]}>✓</Text>}
          </View>
        </TouchableOpacity>
        {options.map(opt => {
          const sel = selectedId === opt.id;
          return (
            <TouchableOpacity key={opt.id} onPress={() => onSelect(opt.id)} activeOpacity={0.7}>
              <View style={fp.optDivider} />
              <View style={fp.optRow}>
                <Text style={[fp.optLabel, sel && fp.optLabelSel, { fontFamily: af(sel ? 'medium' : 'regular') }]}>{opt.label}</Text>
                {sel && <Text style={[fp.optCheck, { fontFamily: af('semibold') }]}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 12 }} />
      </ScrollView>
    );
  }

  // ── Sub-panel header ───────────────────────────────────────────────────────
  function SubHeader({ title }: { title: string }) {
    return (
      <View style={fp.subHeader}>
        <TouchableOpacity style={fp.backBtn} onPress={() => setStep('main')} activeOpacity={0.7}>
          <Text style={[fp.backText, { fontFamily: af('medium') }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[fp.subHeaderTitle, { fontFamily: af('semibold') }]}>{title}</Text>
        <View style={fp.backBtn} />
      </View>
    );
  }

  // ── Main filter row ────────────────────────────────────────────────────────
  function FRow({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
    return (
      <TouchableOpacity style={fp.fRow} onPress={onPress} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress}>
        <Text style={[fp.fRowLabel, { fontFamily: af('regular') }]}>{label}</Text>
        <View style={fp.fRowRight}>
          <Text style={[fp.fRowValue, { fontFamily: af('regular') }]}>{value}</Text>
          {onPress && <Text style={[fp.fRowChev, { fontFamily: af('regular') }]}>›</Text>}
        </View>
      </TouchableOpacity>
    );
  }

  // ── Content by step ────────────────────────────────────────────────────────
  function renderContent() {
    if (step === 'status') return (
      <><SubHeader title={t('filterStatus')} />
        <SelectList options={STATUS_OPTIONS} selectedId={local.statusId}
          onSelect={id => { setLocal(l => ({ ...l, statusId: id })); setStep('main'); }} /></>
    );
    if (step === 'type') return (
      <><SubHeader title={t('filterType')} />
        <SelectList options={TYPE_OPTIONS} selectedId={local.typeId}
          onSelect={id => { setLocal(l => ({ ...l, typeId: id })); setStep('main'); }} /></>
    );
    if (step === 'source') return (
      <><SubHeader title={t('filterSource')} />
        <SelectList options={SOURCE_OPTIONS} selectedId={local.sourceId}
          onSelect={id => { setLocal(l => ({ ...l, sourceId: id })); setStep('main'); }} /></>
    );
    if (step === 'creator') return (
      <><SubHeader title={t('filterCreator')} />
        <SelectList options={STAFF_OPTIONS} selectedId={local.creatorId}
          onSelect={id => { setLocal(l => ({ ...l, creatorId: id })); setStep('main'); }} /></>
    );
    if (step === 'cashier') return (
      <><SubHeader title={t('filterCashier')} />
        <SelectList options={STAFF_OPTIONS} selectedId={local.cashierId}
          onSelect={id => { setLocal(l => ({ ...l, cashierId: id })); setStep('main'); }} /></>
    );
    if (step === 'driver') return (
      <><SubHeader title={t('filterDriver')} />
        <SelectList options={DRIVER_OPTIONS} selectedId={local.driverId}
          onSelect={id => { setLocal(l => ({ ...l, driverId: id })); setStep('main'); }} /></>
    );
    if (step === 'biz_date') return (
      <>
        <View style={fp.dateStepHeader}>
          <TouchableOpacity onPress={() => setStep('main')} activeOpacity={0.7} style={fp.backBtn}>
            <Text style={[fp.backText, { fontFamily: af('medium') }]}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={[fp.dateStepLabel, { textAlign: 'center', fontFamily: af('medium') }]}>{t('filterBizDate')}</Text>
          <TouchableOpacity onPress={() => { setLocal(l => ({ ...l, businessDate: '' })); setStep('main'); }} activeOpacity={0.7} style={fp.backBtn}>
            <Text style={[fp.dateStepAll, { textAlign: 'right', fontFamily: af('regular') }]}>All</Text>
          </TouchableOpacity>
        </View>
        <MiniCalendar
          dateStr={local.businessDate}
          onSelect={d => { setLocal(l => ({ ...l, businessDate: d })); setStep('main'); }}
          bottomLink={local.businessDate ? 'Show all business days' : 'Show current business day'}
          onBottomLink={() => { setLocal(l => ({ ...l, businessDate: l.businessDate ? '' : TODAY })); setStep('main'); }}
        />
      </>
    );
    if (step === 'due_date') return (
      <>
        <View style={fp.dateStepHeader}>
          <TouchableOpacity onPress={() => setStep('main')} activeOpacity={0.7} style={fp.backBtn}>
            <Text style={[fp.backText, { fontFamily: af('medium') }]}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={[fp.dateStepLabel, { textAlign: 'center', fontFamily: af('medium') }]}>{t('filterDueDate')}</Text>
          <TouchableOpacity onPress={() => { setLocal(l => ({ ...l, dueDate: '' })); setStep('main'); }} activeOpacity={0.7} style={fp.backBtn}>
            <Text style={[fp.dateStepAll, { textAlign: 'right', fontFamily: af('regular') }]}>All</Text>
          </TouchableOpacity>
        </View>
        <MiniCalendar
          dateStr={local.dueDate}
          onSelect={d => { setLocal(l => ({ ...l, dueDate: d })); setStep('main'); }}
          bottomLink="Select today"
          onBottomLink={() => { setLocal(l => ({ ...l, dueDate: TODAY })); setStep('main'); }}
        />
      </>
    );

    // Main panel
    return (
      <>
        <View style={fp.header}>
          <Text style={[fp.headerTitle, { fontFamily: af('semibold') }]}>Order Filters</Text>
        </View>
        <ScrollView ref={mainScrollRef} style={fp.body} showsVerticalScrollIndicator={false}>
          <FRow label={t('filterStatus')} value={local.statusId ? findLabel(STATUS_OPTIONS, local.statusId) : t('allOrders')} onPress={() => setStep('status')} />
          <View style={fp.rowDiv} />
          <FRow label={t('filterType')}   value={local.typeId   ? findLabel(TYPE_OPTIONS,   local.typeId)   : t('allOrders')} onPress={() => setStep('type')} />
          <View style={fp.rowDiv} />
          <FRow label={t('filterSource')} value={local.sourceId ? findLabel(SOURCE_OPTIONS, local.sourceId) : t('allOrders')} onPress={() => setStep('source')} />
          <View style={fp.rowDiv} />
          <FRow label={t('filterCreator')} value={local.creatorId  || t('allOrders')} onPress={() => setStep('creator')} />
          <View style={fp.rowDiv} />
          <FRow label={t('filterCashier')} value={local.cashierId  || t('allOrders')} onPress={() => setStep('cashier')} />
          <View style={fp.rowDiv} />
          <FRow label={t('filterDriver')}  value={local.driverId ? findLabel(DRIVER_OPTIONS, local.driverId) : t('allOrders')} onPress={() => setStep('driver')} />

          <View style={fp.sectionGap} />

          {/* Business date */}
          <TouchableOpacity style={fp.fRow} onPress={() => {
            if (local.businessDate) { const [y,m] = local.businessDate.split('-').map(Number); setCalYear(y); setCalMonth(m-1); }
            else { const n = new Date(); setCalYear(n.getFullYear()); setCalMonth(n.getMonth()); }
            setStep('biz_date');
          }} activeOpacity={0.7}>
            <Text style={[fp.fRowLabel, { fontFamily: af('regular') }]}>{t('filterBizDate')}</Text>
            <Text style={[fp.fRowValue, { fontFamily: af('regular') }]}>{formatDateLabel(local.businessDate)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={fp.subLink} activeOpacity={0.7}
            onPress={() => setLocal(l => ({ ...l, businessDate: l.businessDate ? '' : TODAY }))}>
            <Text style={[fp.subLinkText, { fontFamily: af('medium') }]}>{local.businessDate ? 'Show all business days' : 'Show current business day'}</Text>
          </TouchableOpacity>

          <View style={fp.sectionGap} />

          {/* Ahead */}
          <View style={fp.fRow}>
            <Text style={[fp.fRowLabel, { fontFamily: af('regular') }]}>Ahead</Text>
            <TouchableOpacity style={[fp.toggle, local.ahead && fp.toggleOn]}
              onPress={() => setLocal(l => ({ ...l, ahead: !l.ahead }))} activeOpacity={0.8}>
              <View style={[fp.toggleThumb, local.ahead && fp.toggleThumbOn]} />
            </TouchableOpacity>
          </View>

          <View style={fp.sectionGap} />

          {/* Due date */}
          <TouchableOpacity style={fp.fRow} onPress={() => {
            if (local.dueDate) { const [y,m] = local.dueDate.split('-').map(Number); setCalYear(y); setCalMonth(m-1); }
            else { const n = new Date(); setCalYear(n.getFullYear()); setCalMonth(n.getMonth()); }
            setStep('due_date');
          }} activeOpacity={0.7}>
            <Text style={[fp.fRowLabel, { fontFamily: af('regular') }]}>{t('filterDueDate')}</Text>
            <Text style={[fp.fRowValue, { fontFamily: af('regular') }]}>{formatDateLabel(local.dueDate)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={fp.subLink} onPress={() => setLocal(l => ({ ...l, dueDate: TODAY }))} activeOpacity={0.7}>
            <Text style={[fp.subLinkText, { fontFamily: af('medium') }]}>Select today</Text>
          </TouchableOpacity>

          <View style={{ height: 16 }} />
        </ScrollView>

        <View style={fp.footer}>
          <TouchableOpacity style={fp.clearBtn} onPress={() => setLocal(emptyFilters())} activeOpacity={0.7}>
            <Text style={[fp.clearBtnText, { fontFamily: af('semibold') }]}>Clear All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={fp.applyBtn} onPress={() => onApply(local)} activeOpacity={0.8}>
            <Text style={[fp.applyBtnText, { fontFamily: af('bold') }]}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={fp.backdrop} />
      </TouchableWithoutFeedback>
      <View style={fp.panel} pointerEvents="box-none">
        <View style={fp.card}>
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
}

const fp = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  panel: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 400,
    maxHeight: 640,
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
  },

  // ── Main header ──
  header: {
    backgroundColor: Colors.grayLight,
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.4,
  },
  body: {
    flex: 1,
  },

  // ── Filter rows ──
  fRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    minHeight: 58,
  },
  fRowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  fRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fRowValue: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.3,
  },
  fRowChev: {
    fontSize: 18,
    color: Colors.grayMid,
    marginStart: 2,
  },
  rowDiv: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.29)',
  },
  sectionGap: {
    height: 10,
    backgroundColor: Colors.grayLight,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: Colors.grayBorder,
  },
  subLink: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  subLinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    letterSpacing: -0.2,
  },

  // ── Sub-panel header ──
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grayLight,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  subHeaderTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  backBtn: { width: 64 },
  backText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
    letterSpacing: -0.3,
  },

  // ── Select list ──
  subList: { maxHeight: 460 },
  optRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  optDivider: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.29)',
  },
  optLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.3,
  },
  optLabelSel: {
    color: Colors.primary,
    fontWeight: '500',
  },
  optCheck: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '600',
  },

  // ── Date step header ──
  dateStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.grayBorder,
  },
  dateStepLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  dateStepAll: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.primary,
    letterSpacing: -0.3,
  },

  // ── Calendar ──
  calendar: { paddingHorizontal: 16, paddingTop: 12 },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  calMonthTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  calNavRow: { flexDirection: 'row', gap: 4 },
  calNav: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calNavText: {
    fontSize: 22,
    color: Colors.primary,
    fontWeight: '400',
  },
  calDayNames: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  calDayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: 0.2,
  },
  calWeek: { flexDirection: 'row' },
  calDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  calDayInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calDaySel: { backgroundColor: Colors.primary },
  calDayTod: { borderWidth: 1.5, borderColor: Colors.primary },
  calDayText: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.2,
  },
  calDayTextSel: { color: Colors.white, fontWeight: '600' },
  calDayTextTod: { color: Colors.primary, fontWeight: '600' },
  calBottom: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: Colors.grayBorder,
  },
  calBottomText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E4E4E7',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: {
    backgroundColor: Colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    alignSelf: 'flex-start',
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.grayBorder,
  },
  clearBtn: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.grayBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.grayText,
    letterSpacing: -0.2,
  },
  applyBtn: {
    flex: 2,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  applyBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
});

// ─── i18n key map for status labels ──────────────────────────────────────────
import type { TKey } from '../i18n/translations';
const STATUS_I18N_KEY: Record<OrderStatus, TKey> = {
  ACTIVE:   'statusActive',
  PENDING:  'statusPending',
  DONE:     'statusDone',
  VOID:     'statusVoid',
  RETURNED: 'statusReturned',
};

// ─── i18n key map for order type labels ──────────────────────────────────────
const TYPE_I18N_KEY: Partial<Record<string, TKey>> = {
  'DINE IN':    'dineIn',
  'PICK UP':    'pickUp',
  'DELIVERY':   'delivery',
  'DRIVE THRU': 'driveThru',
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function orderToCartItems(order: Order): CartItem[] {
  return order.items.map((item, i) => ({
    id: `${order.id}-item-${i}`,
    name: item.name,
    qty: item.qty,
    price: item.price,
  }));
}

// ─── Refund Method Dialog ────────────────────────────────────────────────────
const REFUND_METHODS = ['Cash', 'Mada', 'Credit Card', 'House Account'];

function RefundMethodDialog({ visible, onSelect, onClose }: { visible: boolean; onSelect: (method: string) => void; onClose: () => void }) {
  const { af } = useI18n();
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={rm.backdrop} />
      </TouchableWithoutFeedback>
      <View style={rm.center} pointerEvents="box-none">
        <View style={rm.card}>
          <View style={rm.header}>
            <Text style={[rm.headerTitle, { fontFamily: af('semibold') }]}>Select payment method</Text>
          </View>
          {REFUND_METHODS.map((method, i) => (
            <React.Fragment key={method}>
              {i > 0 && <View style={rm.divider} />}
              <TouchableOpacity style={rm.row} onPress={() => onSelect(method)} activeOpacity={0.6}>
                <Text style={[rm.methodText, { fontFamily: af('regular') }]}>{method}</Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const rm = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  center:   { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  card: {
    width: 480,
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    backgroundColor: Colors.grayLight,
    paddingVertical: 18,
    paddingHorizontal: 28,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.18)',
    marginStart: 24,
  },
  row: {
    paddingHorizontal: 28,
    paddingVertical: 20,
  },
  methodText: {
    fontSize: 17,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.2,
  },
});

// ─── Preview mode (Figma capture) ────────────────────────────────────────────
// Set to: 'return-order' | 'return-reason' | 'return-amount' | 'return-refund' | 'return-receipt'
//       | 'sync' | 'order-detail' | 'void-list' | 'void-detail'
//       | 'more-active' | 'more-done' | 'more-void' | 'more-returned'
//       | 'filter-main' | 'filter-main-scroll' | 'filter-status' | 'filter-type'
//       | 'filter-source' | 'filter-creator' | 'filter-cashier' | 'filter-driver'
//       | 'filter-biz-date' | 'filter-due-date' | null
const PREVIEW_DIALOG: string | null = null;

// ─── Main Screen ─────────────────────────────────────────────────────────────
interface Props {
  onBack?:        () => void;
  onTotalPress?:  (cart: CartItem[], orderType: string) => void;
  onLoadOrder?:   (order: Order) => void;
}

export default function OrdersScreen({ onBack, onTotalPress, onLoadOrder }: Props) {
  const { t, af, isRTL } = useI18n();
  const [activeTab, setActiveTab]               = useState<FilterTab>(
    PREVIEW_DIALOG === 'void-list' ? 'VOID' : 'ALL'
  );
  const [selectedOrder, setSelectedOrder]       = useState<Order | null>(
    (PREVIEW_DIALOG === 'return-order' || PREVIEW_DIALOG === 'return-receipt') ? ORDERS[2] :
    PREVIEW_DIALOG === 'more-done'     ? ORDERS[2] :
    PREVIEW_DIALOG === 'more-void'     ? ORDERS[4] :
    PREVIEW_DIALOG === 'more-returned' ? { ...ORDERS[2], status: 'RETURNED' as any } :
    (PREVIEW_DIALOG === 'void-detail' || PREVIEW_DIALOG === 'void-list') ? ORDERS[4] :
    ORDERS[0]
  );
  const [search, setSearch]                     = useState('');
  const [searchFocused, setSearchFocused]       = useState(false);
  const [moreMenuVisible, setMoreMenuVisible]   = useState(
    PREVIEW_DIALOG === 'more-active' || PREVIEW_DIALOG === 'more-done' ||
    PREVIEW_DIALOG === 'more-void'   || PREVIEW_DIALOG === 'more-returned'
  );
  const [filterVisible, setFilterVisible]       = useState(PREVIEW_DIALOG?.startsWith('filter-') ?? false);
  const [appliedFilters, setAppliedFilters]     = useState<OrderFilters>(emptyFilters());
  const [viewMode, setViewMode]                 = useState<'list' | 'detail'>((PREVIEW_DIALOG === 'order-detail' || PREVIEW_DIALOG === 'void-detail') ? 'detail' : 'list');
  const searchRef = useRef<TextInput>(null);
  const activeFilterCount = countActiveFilters(appliedFilters);

  // ── Receipt ────────────────────────────────────────────────────────────────
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(
    PREVIEW_DIALOG === 'return-receipt' ? ORDERS[2] : null
  );

  // ── Return flow state ──────────────────────────────────────────────────────
  const [returnStep, setReturnStep]     = useState<'select' | 'reason' | 'amount' | 'refund' | null>(
    PREVIEW_DIALOG === 'return-order'  ? 'select' :
    PREVIEW_DIALOG === 'return-reason' ? 'reason' :
    PREVIEW_DIALOG === 'return-amount' ? 'amount' :
    PREVIEW_DIALOG === 'return-refund' ? 'refund' : null
  );
  const [returnItems, setReturnItems]   = useState<ReturnItem[]>([]);
  const [returnAmount, setReturnAmount] = useState(
    PREVIEW_DIALOG === 'return-amount' ? 7.00 : 0
  );
  // Local orders copy so we can mark RETURNED without mutating the constant
  const [orders, setOrders] = useState<Order[]>(ORDERS);

  // ── Sync dialog ─────────────────────────────────────────────────────────────
  const [syncDialogVisible, setSyncDialogVisible] = useState(PREVIEW_DIALOG === 'sync');

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'ALL',      label: `${t('allOrders')} (${orders.length})` },
    { key: 'ACTIVE',   label: t('statusActive') },
    { key: 'PENDING',  label: t('statusPending') },
    { key: 'DONE',     label: t('statusDone') },
    { key: 'VOID',     label: t('statusVoid') },
    { key: 'RETURNED', label: t('statusReturned') },
  ];

  const filtered = orders.filter(o => {
    const matchTab    = activeTab === 'ALL' || o.status === activeTab;
    const matchSearch = search === '' ||
      o.orderNumber.includes(search) ||
      (o.customerName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (o.customerPhone ?? '').includes(search);

    const f = appliedFilters;
    const matchStatus  = !f.statusId  || o.status === f.statusId;
    const matchType    = !f.typeId    || o.type === f.typeId;
    const matchCreator = !f.creatorId || o.createdBy === f.creatorId;

    return matchTab && matchSearch && matchStatus && matchType && matchCreator;
  });

  function handleMoreAction(key: string) {
    if (key === 'details' && selectedOrder) setViewMode('detail');
    if (key === 'return'  && selectedOrder) setReturnStep('select');
    if (key === 'receipt' && selectedOrder) setReceiptOrder(selectedOrder);
  }

  function handleReturnDone(items: ReturnItem[]) {
    const amt = items.reduce((s, i) => s + i.price * i.qty, 0) * 1.15;
    setReturnItems(items);
    setReturnAmount(amt);
    setReturnStep('reason');
  }

  function handleReturnReason(_reason: string) {
    setReturnStep('amount');
  }

  function handleReturnConfirm(_method?: string) {
    if (selectedOrder) {
      const returnOrderNumber = `R${selectedOrder.orderNumber}`;
      const returnTotal = returnItems.reduce((s, i) => s + i.price * i.qty, 0) * 1.15;
      const newReturnOrder: Order = {
        id:            `return-${selectedOrder.id}-${Date.now()}`,
        orderNumber:   returnOrderNumber,
        type:          selectedOrder.type,
        itemCount:     returnItems.reduce((s, i) => s + i.qty, 0),
        time:          new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        createdBy:     selectedOrder.createdBy,
        paymentMethod: 'Unpaid',
        status:        'RETURNED' as OrderStatus,
        total:         returnTotal,
        items:         returnItems.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
        customerName:  selectedOrder.customerName,
        customerPhone: selectedOrder.customerPhone,
      };
      setOrders(prev => [newReturnOrder, ...prev]);
      setSelectedOrder(newReturnOrder);
    }
    setReturnStep(null);
  }

  return (
    <SafeAreaView style={layout.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundAlt} />

      <View style={layout.row}>

        {/* ══ LEFT: Order panel ══ */}
        <OrderPanel
          items={selectedOrder ? orderToCartItems(selectedOrder) : []}
          selectedId={null}
          onSelectItem={() => {}}
          onRemoveItem={() => {}}
          orderType={selectedOrder?.type ?? null}
          status={selectedOrder?.status}
          orderSeq={selectedOrder ? orders.filter(o => o.type === selectedOrder.type).findIndex(o => o.id === selectedOrder.id) + 1 : undefined}
          onCountPress={selectedOrder ? () => setViewMode('detail') : undefined}
          onTotalPress={selectedOrder?.status === 'ACTIVE' && onTotalPress
            ? () => onTotalPress(orderToCartItems(selectedOrder), selectedOrder.type)
            : undefined}
          isVoided={selectedOrder?.status === 'VOID'}
          isReturned={selectedOrder?.status === 'RETURNED'}
          tableNumber={selectedOrder?.type === 'DINE IN' ? 'Table' : undefined}
        />

        {/* ══ RIGHT: Content ══ */}
        <View style={layout.right}>

          {viewMode === 'detail' && selectedOrder ? (
            <OrderDetailView order={selectedOrder} onBack={() => setViewMode('list')} />
          ) : (
            <>
              {/* Action bar */}
              <View style={s.actionBar}>
                <TouchableOpacity style={s.backBtn} onPress={() => { if (selectedOrder) onLoadOrder?.(selectedOrder); onBack?.(); }} activeOpacity={0.8}>
                  <Image source={ICONS.arrowLeft} style={s.btnIcon} />
                  <Text style={[s.btnLabel, { fontFamily: af('medium') }]}>BACK</Text>
                </TouchableOpacity>

                <View style={{ flex: 1 }} />

                <TouchableOpacity style={[s.toolBtn, activeFilterCount > 0 && s.toolBtnActive]} onPress={() => setFilterVisible(true)} activeOpacity={0.8}>
                  <Text style={[s.btnLabel, { fontFamily: af('medium') }]}>FILTER</Text>
                  {activeFilterCount > 0 && (
                    <View style={s.filterBadge}>
                      <Text style={[s.filterBadgeText, { fontFamily: af('bold') }]}>{activeFilterCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={s.toolBtn} activeOpacity={0.8} onPress={() => setSyncDialogVisible(true)}>
                  <Text style={[s.btnLabel, { fontFamily: af('medium') }]}>SYNC</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.toolBtn} onPress={() => setMoreMenuVisible(true)} activeOpacity={0.8}>
                  <Text style={[s.btnLabel, { fontFamily: af('medium') }]}>MORE</Text>
                </TouchableOpacity>
              </View>

              {/* Search bar */}
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
                    placeholder={t('searchOrders')}
                    placeholderTextColor={Colors.placeholder}
                    value={search}
                    onChangeText={setSearch}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                  />
                </View>
              </Pressable>

              {/* Filter tabs */}
              <View style={s.tabsRow}>
                {TABS.map(tab => {
                  const active = tab.key === activeTab;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      style={[s.tab, active && s.tabActive]}
                      onPress={() => setActiveTab(tab.key)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                    s.tabLabel,
                    active && s.tabLabelActive,
                    tab.key === 'VOID' && s.tabLabelVoid,
                    active && tab.key === 'VOID' && s.tabLabelVoidActive,
                    tab.key === 'RETURNED' && s.tabLabelReturned,
                    active && tab.key === 'RETURNED' && s.tabLabelReturnedActive,
                    { fontFamily: af(active ? 'bold' : 'medium') },
                  ]}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Order list */}
              <View style={s.listCard}>
                {filtered.length === 0 ? (
                  <View style={s.emptyState}>
                    <Text style={[s.emptyText, { fontFamily: af('regular') }]}>No orders found</Text>
                  </View>
                ) : (
                  <FlatList
                    data={filtered}
                    keyExtractor={o => o.id}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item: order, index }) => {
                      const isSelected = selectedOrder?.id === order.id;
                      return (
                        <TouchableOpacity onPress={() => setSelectedOrder(order)} activeOpacity={0.7}>
                          {isSelected && <View style={[s.selectedAccent, isRTL ? { right: 0, left: undefined } : { left: 0 }]} />}
                          <View style={[s.orderRow, isSelected && s.orderRowSelected]}>
                            <View style={s.col1}>
                              <Text style={[s.orderNum, isSelected && s.orderNumActive, { fontFamily: af('semibold') }]}>{order.orderNumber}</Text>
                            </View>
                            <View style={s.col2}>
                              <Text style={[s.orderType, { fontFamily: af('medium') }]}>{TYPE_I18N_KEY[order.type] ? t(TYPE_I18N_KEY[order.type]!) : order.type}{order.tableNumber ? ` (${order.tableNumber})` : ''} ({order.itemCount})</Text>
                              <Text style={[s.orderTime, { fontFamily: af('regular') }]}>{order.time}</Text>
                            </View>
                            <View style={s.col3}>
                              {order.customerName  && <Text style={[s.customerName, { fontFamily: af('medium') }]}>{order.customerName}</Text>}
                              {order.customerPhone && <Text style={[s.customerPhone, { fontFamily: af('regular') }]}>{order.customerPhone}</Text>}
                            </View>
                            <View style={s.col4}>
                              <Text style={[s.orderStatus, { color: STATUS_COLOR[order.status], fontFamily: af('bold') }]}>{STATUS_I18N_KEY[order.status] ? t(STATUS_I18N_KEY[order.status]) : order.status}</Text>
                              <View style={s.amountRow}>
                                <Image source={ICONS.sar} style={s.sarIcon} />
                                <Text style={[s.orderAmount, { fontFamily: af('medium') }]}>{order.total.toFixed(2)}</Text>
                              </View>
                            </View>
                          </View>
                          {index < filtered.length - 1 && <DashedDivider />}
                        </TouchableOpacity>
                      );
                    }}
                  />
                )}
              </View>
            </>
          )}

        </View>
      </View>

      {/* Sync orders dialog */}
      <OrdersSyncDialog
        visible={syncDialogVisible}
        onClose={() => setSyncDialogVisible(false)}
      />

      {/* Filter panel */}
      <FilterPanel
        visible={filterVisible}
        filters={appliedFilters}
        onApply={f => { setAppliedFilters(f); setFilterVisible(false); }}
        onClose={() => setFilterVisible(false)}
        initialStep={
          PREVIEW_DIALOG === 'filter-main-scroll' ? 'main-scrolled' :
          PREVIEW_DIALOG === 'filter-status'      ? 'status'    :
          PREVIEW_DIALOG === 'filter-type'        ? 'type'      :
          PREVIEW_DIALOG === 'filter-source'      ? 'source'    :
          PREVIEW_DIALOG === 'filter-creator'     ? 'creator'   :
          PREVIEW_DIALOG === 'filter-cashier'     ? 'cashier'   :
          PREVIEW_DIALOG === 'filter-driver'      ? 'driver'    :
          PREVIEW_DIALOG === 'filter-biz-date'    ? 'biz_date'  :
          PREVIEW_DIALOG === 'filter-due-date'    ? 'due_date'  :
          'main'
        }
      />

      {/* MORE menu */}
      <MoreMenu
        visible={moreMenuVisible}
        onClose={() => setMoreMenuVisible(false)}
        onAction={handleMoreAction}
        orderStatus={selectedOrder?.status}
      />

      {/* ── Return Order: Step 1 — Select products ── */}
      <ReturnOrderDialog
        visible={returnStep === 'select'}
        items={selectedOrder?.items ?? []}
        onClose={() => setReturnStep(null)}
        onDone={handleReturnDone}
      />

      {/* ── Return Order: Step 2 — Select reason ── */}
      <ReturnReasonDialog
        visible={returnStep === 'reason'}
        onClose={() => setReturnStep(null)}
        onSelect={handleReturnReason}
      />

      {/* ── Return Order: Step 3 — Confirm amount ── */}
      <ReturnAmountDialog
        visible={returnStep === 'amount'}
        amount={returnAmount}
        orderNumber={selectedOrder?.orderNumber ?? ''}
        onClose={() => setReturnStep('refund')}
      />

      {/* ── Return Order: Step 4 — Select refund method ── */}
      <RefundMethodDialog
        visible={returnStep === 'refund'}
        onSelect={handleReturnConfirm}
        onClose={() => setReturnStep(null)}
      />

      {/* ── Receipt modal ── */}
      {receiptOrder && (
        <ReceiptModal
          visible={!!receiptOrder}
          onClose={() => setReceiptOrder(null)}
          order={receiptOrder}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({

  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: 110,
    height: 54,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  toolBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 54,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  btnIcon:  { width: 22, height: 22, resizeMode: 'contain', tintColor: Colors.white },
  btnLabel: { fontSize: 12, fontWeight: '500', color: Colors.white, letterSpacing: 0.2 },
  toolBtnActive: { backgroundColor: Colors.yellowGold },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },

  /* Tabs */
  tabsRow: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 12, marginBottom: 12, padding: 4, shadowColor: Colors.black, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 3 },
  tab: { flex: 1, paddingVertical: 11, alignItems: 'center', borderRadius: 9 },
  tabActive: { backgroundColor: Colors.primaryLight },
  tabLabel: { fontSize: 13, fontWeight: '500', color: Colors.grayText, letterSpacing: -0.1 },
  tabLabelActive: { fontWeight: '700', color: Colors.primary },
  tabLabelVoid:           { color: Colors.red, opacity: 0.5 },
  tabLabelVoidActive:     { opacity: 1, color: Colors.red },
  tabLabelReturned:       { color: '#7C6DB5', opacity: 0.55 },
  tabLabelReturnedActive: { opacity: 1, color: '#7C6DB5' },

  /* List */
  listCard:   { flex: 1, backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', shadowColor: Colors.black, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 3 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText:  { fontSize: 15, fontWeight: '400', color: Colors.placeholder },

  /* Order row */
  orderRow:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, position: 'relative' },
  orderRowSelected: { backgroundColor: Colors.primaryLight, paddingStart: 26 },
  selectedAccent:   { position: 'absolute', top: 0, bottom: 0, width: 4, backgroundColor: Colors.primary, zIndex: 1 },

  col1: { width: 100 },
  col2: { width: 160, gap: 3 },
  col3: { flex: 1, gap: 2 },
  col4: { alignItems: 'flex-end', gap: 3 },

  orderNum:     { fontSize: 15, fontWeight: '600', color: Colors.black, letterSpacing: -0.075 },
  orderNumActive: { color: Colors.primary },
  orderType:    { fontSize: 13, fontWeight: '600', color: Colors.grayText, letterSpacing: -0.065 },
  orderTime:    { fontSize: 13, fontWeight: '400', color: Colors.grayText, letterSpacing: -0.065 },
  customerName: { fontSize: 13, fontWeight: '600', color: Colors.grayText, letterSpacing: -0.065 },
  customerPhone:{ fontSize: 13, fontWeight: '400', color: Colors.grayText, letterSpacing: -0.065 },
  orderStatus:  { fontSize: 14, fontWeight: '700', letterSpacing: -0.075 },
  orderAmount:  { fontSize: 13, fontWeight: '500', color: Colors.grayText, letterSpacing: -0.07 },

  /* Dashed divider */
  dashedRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 3, overflow: 'hidden' },
  dash:      { width: 5, height: 1, backgroundColor: Colors.grayBorder, borderRadius: 1 },

  /* Currency */
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  sarIcon:   { width: 11, height: 13, resizeMode: 'contain', opacity: 0.55 },

});
