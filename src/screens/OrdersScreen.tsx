import React, { useRef, useState } from 'react';
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
} from 'react-native';
import { Colors } from '../constants/colors';
import { layout } from '../styles/screenLayout';
import OrderPanel, { CartItem } from '../components/OrderPanel';
import ReturnOrderDialog, { ReturnItem } from '../components/ReturnOrderDialog';
import ReturnReasonDialog from '../components/ReturnReasonDialog';
import ReturnAmountDialog from '../components/ReturnAmountDialog';

// ─── Assets ───────────────────────────────────────────────────────────────────
const ICONS = {
  search:    { uri: 'https://www.figma.com/api/mcp/asset/fd201ba6-a12d-4ea8-8196-05d196f5bcaa' },
  sar:       { uri: 'https://www.figma.com/api/mcp/asset/9d901ed9-6fb1-4640-a45b-01cd885535d6' },
  sarW:      { uri: 'https://www.figma.com/api/mcp/asset/79841237-e621-48bf-836f-e1dd0aa820dc' },
  arrowLeft: { uri: 'https://www.figma.com/api/mcp/asset/e77a3522-12d8-402e-a4da-7924113ef5b9' },
};

// ─── Types ────────────────────────────────────────────────────────────────────
type FilterTab    = 'ALL' | 'ACTIVE' | 'PENDING' | 'DONE' | 'VOID' | 'RETURNED';
type OrderStatus  = 'ACTIVE' | 'PENDING' | 'DONE' | 'VOID' | 'RETURNED';
type OrderType    = 'DINE IN' | 'PICK UP' | 'DELIVERY' | 'DRIVE THRU';
type PaymentMethod = 'Cash' | 'Card' | 'Split' | 'Unpaid';
type OrderSource  = 'Cashier' | 'API';

interface OrderFilters {
  statuses:     Set<OrderStatus>;
  types:        Set<OrderType>;
  sources:      Set<OrderSource>;
  creator:      string;
  cashier:      string;
  businessDate: string;
  dueDate:      string;
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
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const ORDERS: Order[] = [
  { id: '1',  orderNumber: '100351', type: 'PICK UP',    itemCount: 8, time: '07:41 PM', closedAt: '07:55 PM', createdBy: 'Mohammed',  paymentMethod: 'Card',   status: 'ACTIVE',  total: 23.00, items: [{ name: 'Gourmet Burger Large', qty: 1, price: 23, note: '+ Sourdough Bread' }] },
  { id: '2',  orderNumber: '100350', type: 'PICK UP',    itemCount: 7, time: '07:39 PM', closedAt: '07:52 PM', createdBy: 'Mohammed',  paymentMethod: 'Cash',   status: 'ACTIVE',  total: 67.50, items: [{ name: 'Grilled Chicken', qty: 2, price: 45 }, { name: 'Garden Salad', qty: 1, price: 18 }] },
  { id: '3',  orderNumber: '100349', type: 'PICK UP',    itemCount: 6, time: '07:38 PM', closedAt: '07:50 PM', createdBy: 'Sara',      paymentMethod: 'Card',   status: 'DONE',    total: 7.00,  items: [{ name: 'Water Bottle', qty: 2, price: 7 }] },
  { id: '4',  orderNumber: '100348', type: 'PICK UP',    itemCount: 5, time: '06:55 PM', closedAt: '07:10 PM', createdBy: 'Mohammed',  paymentMethod: 'Cash',   status: 'ACTIVE',  total: 2.00,  items: [{ name: 'Coffee', qty: 1, price: 2 }] },
  { id: '5',  orderNumber: '100347', type: 'DINE IN',    tableNumber: 'Table 1', itemCount: 3, time: '05:17 PM', closedAt: '05:45 PM', customerName: 'Hassan',  customerPhone: '0599999999', createdBy: 'Sara', paymentMethod: 'Unpaid', status: 'VOID', total: 0.00, items: [{ name: 'Fried Rice', qty: 1, price: 15 }, { name: 'Juice', qty: 2, price: 10 }] },
  { id: '6',  orderNumber: '100346', type: 'DINE IN',    tableNumber: 'Table 1', itemCount: 4, time: '03:54 PM', closedAt: '04:20 PM', createdBy: 'Mohammed',  paymentMethod: 'Unpaid', status: 'VOID', total: 0.00, items: [{ name: 'Pasta Primavera', qty: 1, price: 30 }] },
  { id: '7',  orderNumber: '100345', type: 'DELIVERY',   itemCount: 4, time: '03:10 PM', closedAt: '03:45 PM', customerName: 'Ahmed Sha',  customerPhone: '0508946545', createdBy: 'Sara', paymentMethod: 'Card', status: 'DONE', total: 112.75, items: [{ name: 'Beef Steak', qty: 1, price: 65 }, { name: 'Pasta', qty: 1, price: 30 }, { name: 'Salad', qty: 2, price: 36 }] },
  { id: '8',  orderNumber: '100344', type: 'PICK UP',    itemCount: 2, time: '02:30 PM', closedAt: '02:44 PM', customerName: 'Fatima N',   customerPhone: '0509876543', createdBy: 'Mohammed', paymentMethod: 'Cash', status: 'DONE', total: 36.00, items: [{ name: 'Caesar Salad', qty: 2, price: 18 }] },
  { id: '9',  orderNumber: '100343', type: 'DINE IN',    tableNumber: 'Table 3', itemCount: 5, time: '01:15 PM', closedAt: '02:00 PM', customerName: 'Khalid M', customerPhone: '0544332211', createdBy: 'Sara', paymentMethod: 'Split', status: 'DONE', total: 204.00, items: [{ name: 'Mixed Grill', qty: 2, price: 150 }, { name: 'Lamb Chops', qty: 1, price: 70 }, { name: 'Juice', qty: 2, price: 20 }] },
  { id: '10', orderNumber: '100342', type: 'DRIVE THRU', itemCount: 3, time: '12:05 PM', closedAt: '12:18 PM', createdBy: 'Mohammed',  paymentMethod: 'Card',   status: 'DONE',    total: 55.50, items: [{ name: 'Chicken Tikka', qty: 1, price: 40 }, { name: 'Salad', qty: 1, price: 18 }] },
  { id: '11', orderNumber: '100341', type: 'PENDING',    itemCount: 2, time: '11:50 AM', createdBy: 'Sara',      paymentMethod: 'Unpaid', status: 'PENDING', total: 38.50, items: [{ name: 'Veggie Wrap', qty: 2, price: 20 }] } as any,
  { id: '12', orderNumber: '100340', type: 'PICK UP',    itemCount: 1, time: '11:30 AM', createdBy: 'Mohammed',  paymentMethod: 'Unpaid', status: 'PENDING', total: 22.00, items: [{ name: 'Veggie Wrap', qty: 1, price: 20 }] },
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
const MORE_ACTIONS = [
  { key: 'return',   label: 'Return Order' },
  { key: 'receipt',  label: 'View Receipt' },
  { key: 'print',    label: 'Print' },
  { key: 'kitchen',  label: 'Send To Kitchen' },
  { key: 'ready',    label: 'Mark Ready' },
  { key: 'details',  label: 'View Order Details' },
];

interface MoreMenuProps {
  visible: boolean;
  onClose: () => void;
  onAction: (key: string) => void;
}

function MoreMenu({ visible, onClose, onAction }: MoreMenuProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>
      <View style={mm.container} pointerEvents="box-none">
        <View style={mm.card}>
          {MORE_ACTIONS.map((action, i) => (
            <React.Fragment key={action.key}>
              {i > 0 && <View style={mm.divider} />}
              <TouchableOpacity
                style={[mm.row, action.key === 'details' && mm.rowHighlight]}
                onPress={() => { onAction(action.key); onClose(); }}
                activeOpacity={0.6}
              >
                <Text style={[mm.rowLabel, action.key === 'details' && mm.rowLabelHighlight]}>
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
    right: 20,
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
  return (
    <View style={dv.infoRow}>
      <Text style={dv.infoLabel}>{label}</Text>
      <Text style={dv.infoValue}>{value}</Text>
    </View>
  );
}

interface OrderDetailViewProps {
  order: Order;
  onBack: () => void;
}

function OrderDetailView({ order, onBack }: OrderDetailViewProps) {
  const subtotal = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax      = order.status === 'VOID' ? 0 : subtotal * 0.15;
  const total    = subtotal + tax;

  const PAYMENT_LABEL: Record<PaymentMethod, string> = {
    Cash: 'Cash', Card: 'Card', Split: 'Split', Unpaid: 'Unpaid',
  };

  return (
    <>
      {/* Action bar */}
      <View style={[layout.actionBar, s.actionBar]}>
        <TouchableOpacity style={[layout.actionBtn, s.backBtn, dv.backBtn]} onPress={onBack} activeOpacity={0.8}>
          <Text style={dv.backArrow}>←</Text>
          <Text style={layout.actionLabel}>BACK</Text>
        </TouchableOpacity>

        <View style={dv.titleArea}>
          <Text style={dv.titleOrderNum}>#{order.orderNumber}</Text>
          <View style={[dv.statusChip, { backgroundColor: STATUS_BG[order.status] }]}>
            <View style={[dv.statusDot, { backgroundColor: STATUS_COLOR[order.status] }]} />
            <Text style={[dv.statusChipText, { color: STATUS_COLOR[order.status] }]}>{order.status}</Text>
          </View>
        </View>
      </View>

      {/* Detail content card */}
      <View style={dv.card}>
        {/* Status accent bar */}
        <View style={[dv.accentBar, { backgroundColor: STATUS_COLOR[order.status] }]} />

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Order info grid */}
          <View style={dv.section}>
            <Text style={dv.sectionLabel}>ORDER INFORMATION</Text>
            <InfoRow label="Order Type"   value={order.type + (order.tableNumber ? ` — ${order.tableNumber}` : '')} />
            <InfoRow label="Created By"   value={order.createdBy} />
            <InfoRow label="Order Time"   value={order.time} />
            {order.closedAt   && <InfoRow label="Closed At"   value={order.closedAt} />}
            <InfoRow label="Payment"      value={PAYMENT_LABEL[order.paymentMethod]} />
            <InfoRow label="Items"        value={`${order.itemCount} items`} />
            {order.customerName  && <InfoRow label="Customer" value={order.customerName} />}
            {order.customerPhone && <InfoRow label="Phone"    value={order.customerPhone} />}
          </View>

          <View style={dv.divider} />

          {/* Items */}
          <View style={dv.section}>
            <Text style={dv.sectionLabel}>ORDER ITEMS</Text>
            {order.items.map((item, i) => (
              <View key={i} style={dv.itemRow}>
                <View style={dv.itemQtyBadge}>
                  <Text style={dv.itemQtyText}>{item.qty}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={dv.itemName}>{item.name}</Text>
                  {item.note && <Text style={dv.itemNote}>{item.note}</Text>}
                </View>
                <View style={dv.amountRow}>
                  <Image source={ICONS.sar} style={dv.sarIcon} />
                  <Text style={dv.itemPrice}>{(item.price * item.qty).toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={dv.divider} />

          {/* Totals */}
          <View style={[dv.section, { gap: 12 }]}>
            <View style={dv.totalRow}>
              <Text style={dv.totalLabel}>Subtotal</Text>
              <View style={dv.amountRow}>
                <Image source={ICONS.sar} style={dv.sarIcon} />
                <Text style={dv.totalVal}>{subtotal.toFixed(2)}</Text>
              </View>
            </View>
            <View style={dv.totalRow}>
              <Text style={dv.totalLabel}>Tax (15%)</Text>
              <View style={dv.amountRow}>
                <Image source={ICONS.sar} style={dv.sarIcon} />
                <Text style={dv.totalVal}>{tax.toFixed(2)}</Text>
              </View>
            </View>
            <View style={[dv.totalRow, dv.grandTotalRow]}>
              <Text style={dv.grandTotalLabel}>Total</Text>
              <View style={dv.amountRow}>
                <Image source={ICONS.sar} style={[dv.sarIcon, dv.sarIconLg]} />
                <Text style={dv.grandTotalVal}>{order.status === 'VOID' ? '0.00' : total.toFixed(2)}</Text>
              </View>
            </View>
          </View>

        </ScrollView>
      </View>
    </>
  );
}

const dv = StyleSheet.create({
  backBtn:  { flexDirection: 'row', flex: 0, paddingHorizontal: 16, gap: 6 },
  backArrow:{ fontSize: 20, color: Colors.white, lineHeight: 22, marginTop: -1 },
  titleArea:{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4 },
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

// ─── Filter Panel ────────────────────────────────────────────────────────────
const STATUS_OPTIONS: { key: OrderStatus; label: string }[] = [
  { key: 'PENDING',  label: 'Pending'  },
  { key: 'ACTIVE',   label: 'Active'   },
  { key: 'DONE',     label: 'Done'     },
  { key: 'VOID',     label: 'Void'     },
  { key: 'RETURNED', label: 'Returned' },
];

const TYPE_OPTIONS: { key: OrderType; label: string }[] = [
  { key: 'DINE IN',    label: 'Dine In'    },
  { key: 'PICK UP',    label: 'Pick Up'    },
  { key: 'DELIVERY',   label: 'Delivery'   },
  { key: 'DRIVE THRU', label: 'Drive Thru' },
];

const SOURCE_OPTIONS: { key: OrderSource; label: string }[] = [
  { key: 'Cashier', label: 'Cashier' },
  { key: 'API',     label: 'API'     },
];

function emptyFilters(): OrderFilters {
  return {
    statuses:     new Set(),
    types:        new Set(),
    sources:      new Set(),
    creator:      '',
    cashier:      '',
    businessDate: '',
    dueDate:      '',
    ahead:        false,
  };
}

function countActiveFilters(f: OrderFilters): number {
  return (
    f.statuses.size + f.types.size + f.sources.size +
    (f.creator ? 1 : 0) + (f.cashier ? 1 : 0) +
    (f.businessDate ? 1 : 0) + (f.dueDate ? 1 : 0) +
    (f.ahead ? 1 : 0)
  );
}

interface FilterPanelProps {
  visible:   boolean;
  filters:   OrderFilters;
  onApply:   (f: OrderFilters) => void;
  onClose:   () => void;
}

function FilterPanel({ visible, filters, onApply, onClose }: FilterPanelProps) {
  const [local, setLocal] = useState<OrderFilters>(() => ({ ...filters, statuses: new Set(filters.statuses), types: new Set(filters.types), sources: new Set(filters.sources) }));
  const creatorRef      = useRef<TextInput>(null);
  const cashierRef      = useRef<TextInput>(null);
  const bizDateRef      = useRef<TextInput>(null);
  const dueDateRef      = useRef<TextInput>(null);
  const [creatorFocused, setCreatorFocused]   = useState(false);
  const [cashierFocused, setCashierFocused]   = useState(false);
  const [bizDateFocused, setBizDateFocused]   = useState(false);
  const [dueDateFocused, setDueDateFocused]   = useState(false);

  // Sync when re-opened
  React.useEffect(() => {
    if (visible) {
      setLocal({ ...filters, statuses: new Set(filters.statuses), types: new Set(filters.types), sources: new Set(filters.sources) });
    }
  }, [visible]);

  function toggleSet<T>(set: Set<T>, key: T): Set<T> {
    const next = new Set(set);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  }

  function SectionHeader({ title }: { title: string }) {
    return <Text style={fp.sectionTitle}>{title}</Text>;
  }

  function ChipRow<T extends string>({ options, selected, onToggle }: {
    options: { key: T; label: string }[];
    selected: Set<T>;
    onToggle: (key: T) => void;
  }) {
    return (
      <View style={fp.chipRow}>
        {options.map(o => {
          const active = selected.has(o.key);
          return (
            <TouchableOpacity
              key={o.key}
              style={[fp.chip, active && fp.chipActive]}
              onPress={() => onToggle(o.key)}
              activeOpacity={0.7}
            >
              <Text style={[fp.chipLabel, active && fp.chipLabelActive]}>{o.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={fp.backdrop} />
      </TouchableWithoutFeedback>

      <View style={fp.panel} pointerEvents="box-none">
        <View style={fp.card}>

          {/* Header */}
          <View style={fp.header}>
            <Text style={fp.headerTitle}>Filter Orders</Text>
            <TouchableOpacity onPress={onClose} style={fp.closeBtn} activeOpacity={0.7}>
              <Text style={fp.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={fp.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Order Status */}
            <SectionHeader title="Order Status" />
            <ChipRow
              options={STATUS_OPTIONS}
              selected={local.statuses}
              onToggle={key => setLocal(l => ({ ...l, statuses: toggleSet(l.statuses, key) }))}
            />

            <View style={fp.divider} />

            {/* Order Type */}
            <SectionHeader title="Order Type" />
            <ChipRow
              options={TYPE_OPTIONS}
              selected={local.types}
              onToggle={key => setLocal(l => ({ ...l, types: toggleSet(l.types, key) }))}
            />

            <View style={fp.divider} />

            {/* Order Source */}
            <SectionHeader title="Order Source" />
            <ChipRow
              options={SOURCE_OPTIONS}
              selected={local.sources}
              onToggle={key => setLocal(l => ({ ...l, sources: toggleSet(l.sources, key) }))}
            />

            <View style={fp.divider} />

            {/* Creator */}
            <SectionHeader title="Creator" />
            <Pressable style={[fp.inputWrap, creatorFocused && fp.inputWrapFocused]} onPress={() => creatorRef.current?.focus()}>
              <TextInput
                ref={creatorRef}
                style={fp.input}
                placeholder="Filter by creator"
                placeholderTextColor={Colors.placeholder}
                value={local.creator}
                onChangeText={v => setLocal(l => ({ ...l, creator: v }))}
                onFocus={() => setCreatorFocused(true)}
                onBlur={() => setCreatorFocused(false)}
              />
            </Pressable>

            <View style={fp.divider} />

            {/* Cashier */}
            <SectionHeader title="Cashier" />
            <Pressable style={[fp.inputWrap, cashierFocused && fp.inputWrapFocused]} onPress={() => cashierRef.current?.focus()}>
              <TextInput
                ref={cashierRef}
                style={fp.input}
                placeholder="Filter by cashier"
                placeholderTextColor={Colors.placeholder}
                value={local.cashier}
                onChangeText={v => setLocal(l => ({ ...l, cashier: v }))}
                onFocus={() => setCashierFocused(true)}
                onBlur={() => setCashierFocused(false)}
              />
            </Pressable>

            <View style={fp.divider} />

            {/* Business Date */}
            <SectionHeader title="Business Date" />
            <Pressable style={[fp.inputWrap, bizDateFocused && fp.inputWrapFocused]} onPress={() => bizDateRef.current?.focus()}>
              <TextInput
                ref={bizDateRef}
                style={fp.input}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={Colors.placeholder}
                value={local.businessDate}
                onChangeText={v => setLocal(l => ({ ...l, businessDate: v }))}
                onFocus={() => setBizDateFocused(true)}
                onBlur={() => setBizDateFocused(false)}
                keyboardType="numeric"
              />
            </Pressable>

            <View style={fp.divider} />

            {/* Due Date */}
            <SectionHeader title="Due Date" />
            <Pressable style={[fp.inputWrap, dueDateFocused && fp.inputWrapFocused]} onPress={() => dueDateRef.current?.focus()}>
              <TextInput
                ref={dueDateRef}
                style={fp.input}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={Colors.placeholder}
                value={local.dueDate}
                onChangeText={v => setLocal(l => ({ ...l, dueDate: v }))}
                onFocus={() => setDueDateFocused(true)}
                onBlur={() => setDueDateFocused(false)}
                keyboardType="numeric"
              />
            </Pressable>

            <View style={fp.divider} />

            {/* Ahead */}
            <View style={fp.aheadRow}>
              <View>
                <SectionHeader title="Ahead Orders" />
                <Text style={fp.aheadHint}>Only orders with an ahead due time</Text>
              </View>
              <TouchableOpacity
                style={[fp.toggle, local.ahead && fp.toggleOn]}
                onPress={() => setLocal(l => ({ ...l, ahead: !l.ahead }))}
                activeOpacity={0.8}
              >
                <View style={[fp.toggleThumb, local.ahead && fp.toggleThumbOn]} />
              </TouchableOpacity>
            </View>

            <View style={{ height: 12 }} />
          </ScrollView>

          {/* Footer buttons */}
          <View style={fp.footer}>
            <TouchableOpacity
              style={fp.clearBtn}
              onPress={() => setLocal(emptyFilters())}
              activeOpacity={0.7}
            >
              <Text style={fp.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={fp.applyBtn}
              onPress={() => onApply(local)}
              activeOpacity={0.8}
            >
              <Text style={fp.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const fp = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 400,
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.grayLight,
    height: 72,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: Colors.grayText,
    fontWeight: '500',
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    marginTop: 18,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.grayBorder,
    backgroundColor: Colors.white,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.1,
  },
  chipLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.grayBorder,
    marginTop: 18,
  },
  inputWrap: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    height: 56,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  inputWrapFocused: {
    borderColor: Colors.primary,
    shadowOpacity: 0.10,
  },
  input: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.black,
    flex: 1,
  },
  aheadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  aheadHint: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.grayText,
    marginTop: 2,
    letterSpacing: -0.1,
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
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={rm.backdrop} />
      </TouchableWithoutFeedback>
      <View style={rm.center} pointerEvents="box-none">
        <View style={rm.card}>
          <View style={rm.header}>
            <Text style={rm.headerTitle}>Select payment method</Text>
          </View>
          {REFUND_METHODS.map((method, i) => (
            <React.Fragment key={method}>
              {i > 0 && <View style={rm.divider} />}
              <TouchableOpacity style={rm.row} onPress={() => onSelect(method)} activeOpacity={0.6}>
                <Text style={rm.methodText}>{method}</Text>
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
    marginLeft: 24,
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

// ─── Main Screen ─────────────────────────────────────────────────────────────
interface Props {
  onBack?:       () => void;
  onTotalPress?: (cart: CartItem[], orderType: string) => void;
}

export default function OrdersScreen({ onBack, onTotalPress }: Props) {
  const [activeTab, setActiveTab]               = useState<FilterTab>('ALL');
  const [selectedOrder, setSelectedOrder]       = useState<Order | null>(ORDERS[0]);
  const [search, setSearch]                     = useState('');
  const [searchFocused, setSearchFocused]       = useState(false);
  const [moreMenuVisible, setMoreMenuVisible]   = useState(false);
  const [filterVisible, setFilterVisible]       = useState(false);
  const [appliedFilters, setAppliedFilters]     = useState<OrderFilters>(emptyFilters());
  const [viewMode, setViewMode]                 = useState<'list' | 'detail'>('list');
  const searchRef = useRef<TextInput>(null);
  const activeFilterCount = countActiveFilters(appliedFilters);

  // ── Return flow state ──────────────────────────────────────────────────────
  const [returnStep, setReturnStep]     = useState<'select' | 'reason' | 'amount' | 'refund' | null>(null);
  const [returnItems, setReturnItems]   = useState<ReturnItem[]>([]);
  const [returnAmount, setReturnAmount] = useState(0);
  // Local orders copy so we can mark RETURNED without mutating the constant
  const [orders, setOrders] = useState<Order[]>(ORDERS);

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'ALL',      label: `ALL (${orders.length})` },
    { key: 'ACTIVE',   label: 'ACTIVE' },
    { key: 'PENDING',  label: 'PENDING' },
    { key: 'DONE',     label: 'DONE' },
    { key: 'VOID',     label: 'VOID' },
    { key: 'RETURNED', label: 'RETURNED' },
  ];

  const filtered = orders.filter(o => {
    const matchTab    = activeTab === 'ALL' || o.status === activeTab;
    const matchSearch = search === '' ||
      o.orderNumber.includes(search) ||
      (o.customerName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (o.customerPhone ?? '').includes(search);

    const f = appliedFilters;
    const matchStatus  = f.statuses.size === 0 || f.statuses.has(o.status);
    const matchType    = f.types.size === 0    || f.types.has(o.type as OrderType);
    const matchCreator = !f.creator  || o.createdBy.toLowerCase().includes(f.creator.toLowerCase());

    return matchTab && matchSearch && matchStatus && matchType && matchCreator;
  });

  function handleMoreAction(key: string) {
    if (key === 'details' && selectedOrder) setViewMode('detail');
    if (key === 'return' && selectedOrder) setReturnStep('select');
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
        />

        {/* ══ RIGHT: Content ══ */}
        <View style={layout.right}>

          {viewMode === 'detail' && selectedOrder ? (
            <OrderDetailView order={selectedOrder} onBack={() => setViewMode('list')} />
          ) : (
            <>
              {/* Action bar */}
              <View style={s.actionBar}>
                <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.8}>
                  <Image source={ICONS.arrowLeft} style={s.btnIcon} />
                  <Text style={s.btnLabel}>BACK</Text>
                </TouchableOpacity>

                <View style={{ flex: 1 }} />

                <TouchableOpacity style={[s.toolBtn, activeFilterCount > 0 && s.toolBtnActive]} onPress={() => setFilterVisible(true)} activeOpacity={0.8}>
                  <Text style={s.btnLabel}>FILTER</Text>
                  {activeFilterCount > 0 && (
                    <View style={s.filterBadge}>
                      <Text style={s.filterBadgeText}>{activeFilterCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={s.toolBtn} activeOpacity={0.8}>
                  <Text style={s.btnLabel}>SYNC</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.toolBtn} onPress={() => setMoreMenuVisible(true)} activeOpacity={0.8}>
                  <Text style={s.btnLabel}>MORE</Text>
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
                    placeholder="Search orders"
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
                    <Text style={s.emptyText}>No orders found</Text>
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
                          {isSelected && <View style={s.selectedAccent} />}
                          <View style={[s.orderRow, isSelected && s.orderRowSelected]}>
                            <View style={s.col1}>
                              <Text style={[s.orderNum, isSelected && s.orderNumActive]}>{order.orderNumber}</Text>
                            </View>
                            <View style={s.col2}>
                              <Text style={s.orderType}>{order.type}{order.tableNumber ? ` (${order.tableNumber})` : ''} ({order.itemCount})</Text>
                              <Text style={s.orderTime}>{order.time}</Text>
                            </View>
                            <View style={s.col3}>
                              {order.customerName  && <Text style={s.customerName}>{order.customerName}</Text>}
                              {order.customerPhone && <Text style={s.customerPhone}>{order.customerPhone}</Text>}
                            </View>
                            <View style={s.col4}>
                              <Text style={[s.orderStatus, { color: STATUS_COLOR[order.status] }]}>{order.status}</Text>
                              <View style={s.amountRow}>
                                <Image source={ICONS.sar} style={s.sarIcon} />
                                <Text style={s.orderAmount}>{order.total.toFixed(2)}</Text>
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

      {/* Filter panel */}
      <FilterPanel
        visible={filterVisible}
        filters={appliedFilters}
        onApply={f => { setAppliedFilters(f); setFilterVisible(false); }}
        onClose={() => setFilterVisible(false)}
      />

      {/* MORE menu */}
      <MoreMenu
        visible={moreMenuVisible}
        onClose={() => setMoreMenuVisible(false)}
        onAction={handleMoreAction}
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
  orderRowSelected: { backgroundColor: Colors.primaryLight, paddingLeft: 26 },
  selectedAccent:   { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: Colors.primary, zIndex: 1 },

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
