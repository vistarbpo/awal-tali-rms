import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { Colors } from '../constants/colors';
import { iconSarDark } from '../assets/icons';
import { CartItem } from './OrderPanel';
import { useI18n } from '../i18n';

const ICONS = { sar: iconSarDark };

const TAX_RATE = 0.15;

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrderItem { name: string; qty: number; price: number; note?: string; }
export interface JoinableOrder {
  id:          string;
  orderNumber: string;
  type:        string;
  tableNumber?: string;
  time:        string;
  status:      string;
  total:       number;
  items:       OrderItem[];
  customerName?: string;
}

// ─── Mock orders (ACTIVE only) ────────────────────────────────────────────────
export const JOIN_ORDERS: JoinableOrder[] = [
  { id: 'j1',  orderNumber: '100313', type: 'DINE IN',    tableNumber: 'Table 1', time: '28/03/20...', status: 'ACTIVE', total: 16.00, items: [{ name: 'Spicy Salad', qty: 2, price: 8 }] },
  { id: 'j2',  orderNumber: '100312', type: 'DINE IN',    time: '25/03/20...',    status: 'ACTIVE', total: 31.00, items: [{ name: 'Spicy salad', qty: 2, price: 10 }, { name: 'Musakhan Chicken Frozen', qty: 1, price: 2 }, { name: 'Eash Bellaham Frozen', qty: 1, price: 14 }] },
  { id: 'j3',  orderNumber: '100311', type: 'DINE IN',    tableNumber: 'Table 9', time: '25/03/20...', status: 'ACTIVE', total: 470.00, items: [{ name: 'Mixed Grill Platter', qty: 3, price: 120 }, { name: 'Lamb Chops', qty: 2, price: 80 }] },
  { id: 'j4',  orderNumber: '100310', type: 'DINE IN',    time: '25/03/20...',    status: 'ACTIVE', total: 42.00, items: [{ name: 'Pasta Primavera', qty: 1, price: 30 }, { name: 'Juice', qty: 2, price: 12 }] },
  { id: 'j5',  orderNumber: '100306', type: 'DINE IN',    time: '25/03/20...',    status: 'ACTIVE', total: 23.00, items: [{ name: 'Garden Salad', qty: 1, price: 18 }, { name: 'Water', qty: 2, price: 5 }] },
  { id: 'j6',  orderNumber: '100305', type: 'DINE IN',    time: '25/03/20...',    status: 'ACTIVE', total: 1.00,  items: [{ name: 'Bread', qty: 1, price: 1 }], customerName: 'salim' },
  { id: 'j7',  orderNumber: '100304', type: 'DINE IN',    time: '25/03/20...',    status: 'ACTIVE', total: 18.00, items: [{ name: 'Hummus', qty: 2, price: 9 }] },
  { id: 'j8',  orderNumber: '100303', type: 'DINE IN',    time: '25/03/20...',    status: 'ACTIVE', total: 12.00, items: [{ name: 'Falafel Plate', qty: 1, price: 12 }] },
  { id: 'j9',  orderNumber: '100300', type: 'DINE IN',    time: '24/03/20...',    status: 'ACTIVE', total: 95.00, items: [{ name: 'Beef Steak', qty: 1, price: 65 }, { name: 'Salad', qty: 2, price: 15 }] },
];

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: Colors.primary, PENDING: Colors.yellowGold, DONE: Colors.green, VOID: Colors.red,
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  onJoin: (items: CartItem[]) => void;
  onBack: () => void;
  initialSelected?: JoinableOrder | null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function JoinOrderView({ onJoin, onBack, initialSelected = null }: Props) {
  const { t, af, isRTL, rtlLeft } = useI18n();
  const [selected, setSelected] = useState<JoinableOrder | null>(initialSelected);

  function handleJoin() {
    if (!selected) return;
    const cartItems: CartItem[] = selected.items.map((it, i) => ({
      id:    `join-${selected.id}-${i}-${Date.now()}`,
      name:  it.name,
      qty:   it.qty,
      price: it.price,
    }));
    onJoin(cartItems);
  }

  const taxes = selected
    ? (selected.total * TAX_RATE / (1 + TAX_RATE))
    : 0;

  return (
    <View style={s.root}>

      {/* ── Middle column: order list ── */}
      <View style={s.listCol}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {JOIN_ORDERS.map((order, idx) => {
            const isSelected = selected?.id === order.id;
            return (
              <TouchableOpacity
                key={order.id}
                onPress={() => setSelected(order)}
                activeOpacity={0.7}
              >
                {isSelected && <View style={[s.selectedAccent, rtlLeft(0)]} />}
                <View style={[s.orderRow, isSelected && s.orderRowSelected]}>
                  <View style={s.col1}>
                    <Text style={[s.orderNum, isSelected && s.orderNumActive]}>
                      {order.orderNumber}
                    </Text>
                  </View>
                  <View style={s.col2}>
                    <Text style={s.orderType}>
                      {order.type}{order.tableNumber ? ` (${order.tableNumber})` : ''}
                    </Text>
                    <Text style={s.orderTime}>{order.time}</Text>
                  </View>
                  <View style={s.col3}>
                    {order.customerName && (
                      <Text style={s.customerName}>{order.customerName}</Text>
                    )}
                  </View>
                  <View style={s.col4}>
                    <Text style={[s.orderStatus, { color: STATUS_COLOR[order.status] ?? Colors.grayText }]}>
                      {order.status}
                    </Text>
                    <View style={s.amountRow}>
                      <Image source={ICONS.sar} style={s.sarIcon} />
                      <Text style={s.orderAmount}>{order.total.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>
                {idx < JOIN_ORDERS.length - 1 && <View style={s.rowDivider} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Right column: order preview ── */}
      <View style={s.previewCol}>
        {selected ? (
          <View style={s.previewCard}>
            {/* Header */}
            <View style={s.previewHeader}>
              <View style={s.previewHeaderRow}>
                <Text style={s.previewOrderNum}>{parseInt(selected.orderNumber, 10) % 100}</Text>
                <View style={[s.statusBadge, { backgroundColor: Colors.primaryLight }]}>
                  <Text style={[s.statusText, { color: Colors.primary }]}>{selected.status}</Text>
                </View>
              </View>
              <View style={s.previewHeaderRow}>
                <Text style={s.previewOrderType}>
                  {selected.type}{selected.tableNumber ? ` (${selected.tableNumber})` : ''}
                </Text>
                <Text style={[s.addCustomer, { fontFamily: af('semibold') }]}>{t('addCustShort')}</Text>
              </View>
            </View>
            <View style={s.divider} />

            {/* Items */}
            <ScrollView style={s.previewScroll} showsVerticalScrollIndicator={false}>
              <View style={s.courseHeader}>
                <Text style={[s.courseHeaderText, { fontFamily: af('semibold') }]}>{t('course1')}</Text>
              </View>
              {selected.items.slice(0, Math.ceil(selected.items.length / 2)).map((item, i) => (
                <View key={i} style={s.previewItem}>
                  <Text style={s.previewQty}>{item.qty} x</Text>
                  <Text style={s.previewName} numberOfLines={2}>{item.name}</Text>
                  <View style={s.previewPriceRow}>
                    <Image source={ICONS.sar} style={s.sarSmall} />
                    <Text style={s.previewPrice}>{(item.price * item.qty).toFixed(2)}</Text>
                  </View>
                </View>
              ))}
              {selected.items.length > 1 && (
                <>
                  <View style={s.courseHeader}>
                    <Text style={[s.courseHeaderText, { fontFamily: af('semibold') }]}>{t('course2')}</Text>
                  </View>
                  {selected.items.slice(Math.ceil(selected.items.length / 2)).map((item, i) => (
                    <View key={i} style={s.previewItem}>
                      <Text style={s.previewQty}>{item.qty} x</Text>
                      <Text style={s.previewName} numberOfLines={2}>{item.name}</Text>
                      <View style={s.previewPriceRow}>
                        <Image source={ICONS.sar} style={s.sarSmall} />
                        <Text style={s.previewPrice}>{(item.price * item.qty).toFixed(2)}</Text>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </ScrollView>

            {/* Add Course strip */}
            <View style={s.addCourseStrip}>
              <Text style={[s.addCourseText, { fontFamily: af('medium') }]}>{t('addCourse')}</Text>
            </View>

            {/* Taxes */}
            <View style={s.taxRow}>
              <Text style={[s.taxLabel, { fontFamily: af() }]}>{t('taxes')}</Text>
              <View style={s.taxVal}>
                <Image source={ICONS.sar} style={s.sarSmall} />
                <Text style={s.taxText}>{taxes.toFixed(2)}</Text>
              </View>
            </View>

            {/* Total */}
            <View style={s.totalRow}>
              <Text style={[s.totalLabel, { fontFamily: af('bold') }]}>{t('total')}</Text>
              <View style={s.totalVal}>
                <Image source={ICONS.sar} style={s.sarWhite} />
                <Text style={s.totalAmount}>{selected.total.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={s.previewEmpty} />
        )}
      </View>

      {/* ── Action buttons ── */}
      <View style={s.actions}>
        <TouchableOpacity
          style={[s.actionBtn, s.joinBtn, !selected && s.joinBtnDisabled]}
          onPress={handleJoin}
          activeOpacity={selected ? 0.85 : 1}
        >
          <Text style={[s.actionBtnText, { fontFamily: af('bold') }]}>{t('join')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, s.backBtn]} onPress={onBack} activeOpacity={0.85}>
          <Text style={[s.actionBtnText, { fontFamily: af('bold') }]}>{t('back')}</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.backgroundAlt,
  },

  // ── Order list column ──
  listCol: {
    width: 390,
    backgroundColor: Colors.white,
    borderRightWidth: 1,
    borderRightColor: Colors.grayBorder,
  },
  selectedAccent: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: Colors.primary,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  orderRowSelected: {
    backgroundColor: Colors.primaryLight,
  },
  col1: { width: 68 },
  col2: { flex: 1 },
  col3: { width: 56 },
  col4: { width: 72, alignItems: 'flex-end' },
  orderNum: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  orderNumActive: {
    color: Colors.primary,
  },
  orderType: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.black,
    letterSpacing: -0.2,
  },
  orderTime: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.1,
    marginTop: 2,
  },
  customerName: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.1,
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  sarIcon: {
    width: 10,
    height: 10,
    resizeMode: 'contain',
    tintColor: Colors.black,
  },
  orderAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.grayBorder,
    marginHorizontal: 16,
    borderStyle: 'dashed',
  },

  // ── Preview column ──
  previewCol: {
    flex: 1,
    padding: 16,
  },
  previewEmpty: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  previewCard: {
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
  previewHeader: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    gap: 10,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewOrderNum: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -0.4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  previewOrderType: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  addCustomer: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.yellowGold,
    letterSpacing: -0.1,
    textDecorationLine: 'underline',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.grayBorder,
  },
  previewScroll: {
    flex: 1,
  },
  courseHeader: {
    backgroundColor: Colors.grayLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  courseHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.grayText,
    letterSpacing: -0.1,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
    gap: 8,
  },
  previewQty: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.grayText,
    width: 32,
  },
  previewName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.2,
  },
  previewPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sarSmall: {
    width: 9,
    height: 9,
    resizeMode: 'contain',
    tintColor: Colors.black,
  },
  previewPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.2,
  },
  addCourseStrip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.grayLight,
    borderTopWidth: 1,
    borderTopColor: Colors.grayBorder,
  },
  addCourseText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.1,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.grayBorder,
  },
  taxLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.grayText,
  },
  taxVal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  taxText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.grayText,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.primary,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
  totalVal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sarWhite: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
    tintColor: Colors.white,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.3,
  },

  // ── Action buttons ──
  actions: {
    width: 96,
    justifyContent: 'flex-end',
    paddingBottom: 16,
    paddingEnd: 16,
    gap: 10,
  },
  actionBtn: {
    height: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  joinBtn: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
  },
  joinBtnDisabled: {
    backgroundColor: Colors.grayMid,
    shadowOpacity: 0,
    elevation: 0,
  },
  backBtn: {
    backgroundColor: Colors.grayText,
    shadowColor: Colors.black,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
});
