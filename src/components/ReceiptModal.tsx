import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Order } from '../screens/OrdersScreen';
import { iconSarDark } from '../assets/icons';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TYPE_AR: Record<string, string> = {
  'DINE IN':    'محلي',
  'PICK UP':    'توصيل داخلي',
  'DELIVERY':   'توصيل',
  'DRIVE THRU': 'درايف ثرو',
};

const PAYMENT_AR: Record<string, string> = {
  Cash:   'نقدي',
  Card:   'ATM',
  Split:  'دفع مجزأ',
  Unpaid: 'غير مدفوع',
};

function now(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
  const ampm = h >= 12 ? 'م' : 'ص';
  const h12 = h % 12 || 12;
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${h12}:${pad(m)}:${pad(s)} ${ampm}`;
}

// ─── Fake QR (view-drawn) ─────────────────────────────────────────────────────
function FakeQR() {
  const SIZE  = 160;
  const CELL  = 8;
  const COLS  = SIZE / CELL;
  // Deterministic pseudo-random pattern (based on index)
  function filled(row: number, col: number): boolean {
    // Finder pattern: top-left 7×7
    if (row < 7 && col < 7) return !(row > 0 && row < 6 && col > 0 && col < 6) || (row > 1 && row < 5 && col > 1 && col < 5);
    // Finder pattern: top-right 7×7
    if (row < 7 && col >= COLS - 7) {
      const c = col - (COLS - 7);
      return !(row > 0 && row < 6 && c > 0 && c < 6) || (row > 1 && row < 5 && c > 1 && c < 5);
    }
    // Finder pattern: bottom-left 7×7
    if (row >= COLS - 7 && col < 7) {
      const r = row - (COLS - 7);
      return !(r > 0 && r < 6 && col > 0 && col < 6) || (r > 1 && r < 5 && col > 1 && col < 5);
    }
    // Quiet zone around finders
    if (row < 8 && col < 8) return false;
    if (row < 8 && col >= COLS - 8) return false;
    if (row >= COLS - 8 && col < 8) return false;
    // Timing patterns
    if (row === 6 || col === 6) return (row + col) % 2 === 0;
    // Data modules — deterministic hash
    return ((row * 17 + col * 13 + row ^ col) % 3) !== 0;
  }
  const rows = Array.from({ length: COLS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => filled(r, c))
  );
  return (
    <View style={{ width: SIZE, height: SIZE }}>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {row.map((on, c) => (
            <View
              key={c}
              style={{ width: CELL, height: CELL, backgroundColor: on ? '#000' : '#fff' }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

// ─── SAR icon helper ──────────────────────────────────────────────────────────
function Sar() {
  return <Image source={iconSarDark} style={r.sarIcon} />;
}

// ─── Row helpers ──────────────────────────────────────────────────────────────
function Divider() {
  return <View style={r.divider} />;
}

function TotalRow({
  label, amount, bold, large,
}: { label: string; amount: number; bold?: boolean; large?: boolean }) {
  return (
    <View style={r.totalRow}>
      <Text style={[r.totalLabel, bold && r.bold, large && r.totalLarge]}>{label}</Text>
      <View style={r.totalRight}>
        <Sar />
        <Text style={[r.totalVal, bold && r.bold, large && r.totalLarge]}>
          {amount.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible: boolean;
  onClose: () => void;
  order: Order;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ReceiptModal({ visible, onClose, order }: Props) {
  const subtotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
  const vat      = order.status === 'VOID' ? 0 : subtotal * 0.15;
  const total    = subtotal + vat;
  const typeAr   = TYPE_AR[order.type] ?? order.type;
  const printTime = now();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <View style={r.backdrop} />

      <View style={r.center} pointerEvents="box-none">
        <View style={r.card}>

          {/* ── Header ── */}
          <View style={r.header}>
            <TouchableOpacity onPress={onClose} style={r.doneBtn} activeOpacity={0.7}>
              <Text style={r.doneText}>Done</Text>
            </TouchableOpacity>
            <Text style={r.headerTitle}>Order Receipt</Text>
            <TouchableOpacity style={r.printBtn} activeOpacity={0.7}>
              <Text style={r.printText}>🖨 Print</Text>
            </TouchableOpacity>
          </View>

          {/* ── Receipt content ── */}
          <ScrollView
            style={r.scroll}
            contentContainerStyle={r.scrollContent}
            showsVerticalScrollIndicator={false}
          >

            {/* Brand / logo area */}
            <View style={r.brandWrap}>
              <View style={r.logoBox}>
                <Text style={r.logoAr}>اول وتالي</Text>
                <Text style={r.logoEn}>Awal & Tali</Text>
              </View>
              <Text style={r.branchLine}>اول و تالي - فرع الشوقية - شارع ابن العباس - مكة</Text>
              <Text style={r.branchLine}>خدمة العملاء: 920010839</Text>
              <Text style={r.branchLine}>الرقم الضريبي: 310159846100003</Text>
              <Text style={r.branchLine}>Simplified Tax Invoice</Text>
            </View>

            <Divider />

            {/* Order number box */}
            <View style={r.orderBox}>
              <Text style={r.orderBoxText}>الطلب # {order.orderNumber}</Text>
            </View>

            {/* Meta info */}
            <View style={r.metaBlock}>
              <Text style={r.metaLine}>وقت الطباعة: {printTime}</Text>
              <View style={r.metaRow}>
                <Text style={r.metaLabel}>فاتورة# {order.orderNumber}</Text>
                <Text style={r.metaType}>{typeAr}{order.tableNumber ? ` - ${order.tableNumber}` : ''}</Text>
              </View>
              {order.closedAt && (
                <Text style={r.metaLine}>{order.closedAt}</Text>
              )}
              <Text style={r.metaLine}>المغلق: {order.createdBy}</Text>
            </View>

            <Divider />

            {/* Items table header */}
            <View style={r.tableHeader}>
              <Text style={[r.thCell, r.thQty]}>الكمية</Text>
              <Text style={[r.thCell, r.thName]}>المنتج</Text>
              <Text style={[r.thCell, r.thPrice]}>السعر</Text>
            </View>

            <View style={r.thinDivider} />

            {/* Items */}
            {order.items.map((item, i) => (
              <View key={i} style={r.itemRow}>
                <Text style={[r.tdCell, r.tdQty]}>{item.qty}</Text>
                <Text style={[r.tdCell, r.tdName]} numberOfLines={2}>{item.name}</Text>
                <View style={r.tdPriceWrap}>
                  <Sar />
                  <Text style={r.tdPrice}>{(item.price * item.qty).toFixed(2)}</Text>
                </View>
              </View>
            ))}

            <Divider />

            {/* Totals */}
            <View style={r.totalsBlock}>
              <TotalRow label="المجموع الفرعي" amount={subtotal} />
              <TotalRow label="VAT(15.0%)"      amount={vat} />
              <TotalRow label="الإجمالي"         amount={total} bold large />
            </View>

            <View style={r.thinDivider} />

            {/* Payment */}
            <View style={r.totalsBlock}>
              <TotalRow label={`الدفع - ${PAYMENT_AR[order.paymentMethod] ?? order.paymentMethod}`} amount={total} />
            </View>

            <Divider />

            {/* Footer text */}
            <View style={r.footerBlock}>
              <Text style={r.footerCount}>عدد المنتجات {order.itemCount}</Text>
              <Text style={r.footerThanks}>شكراً لكم</Text>
              <Text style={r.footerThanks}>سعدنا بزيارتكم</Text>
            </View>

            {/* QR code */}
            <View style={r.qrWrap}>
              <FakeQR />
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_W = 340;

const r = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: CARD_W,
    maxHeight: '88%',
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  doneBtn: { width: 56 },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  printBtn: {
    width: 56,
    alignItems: 'flex-end',
  },
  printText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.3,
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingBottom: 32,
  },

  // Brand
  brandWrap: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    gap: 6,
  },
  logoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  logoAr: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -0.5,
  },
  logoEn: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.2,
  },
  branchLine: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.black,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Order number box
  orderBox: {
    marginHorizontal: 24,
    marginVertical: 14,
    borderWidth: 2,
    borderColor: Colors.black,
    borderRadius: 4,
    paddingVertical: 10,
    alignItems: 'center',
  },
  orderBoxText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -0.3,
  },

  // Meta block
  metaBlock: {
    paddingHorizontal: 24,
    paddingBottom: 14,
    gap: 4,
  },
  metaLine: {
    fontSize: 13,
    color: Colors.black,
    textAlign: 'right',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.black,
  },
  metaType: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.black,
  },

  // Dividers
  divider: {
    height: 1,
    backgroundColor: Colors.black,
    marginHorizontal: 24,
    marginVertical: 2,
  },
  thinDivider: {
    height: 0.5,
    backgroundColor: Colors.grayBorder,
    marginHorizontal: 24,
    marginVertical: 2,
  },

  // Table header
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  thCell: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.black,
    textAlign: 'right',
  },
  thQty:   { width: 48, textAlign: 'center' },
  thName:  { flex: 1, textAlign: 'right' },
  thPrice: { width: 80, textAlign: 'right' },

  // Item rows
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 6,
  },
  tdCell: {
    fontSize: 13,
    color: Colors.black,
  },
  tdQty:   { width: 48, textAlign: 'center', fontWeight: '600' },
  tdName:  { flex: 1, textAlign: 'right' },
  tdPriceWrap: {
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
  },
  tdPrice: { fontSize: 13, color: Colors.black, fontWeight: '500' },

  // Totals
  totalsBlock: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    gap: 6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.black,
    textAlign: 'left',
  },
  totalRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  totalVal: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: '500',
  },
  bold: {
    fontWeight: '700',
  },
  totalLarge: {
    fontSize: 16,
  },

  sarIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
  },

  // Footer
  footerBlock: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 4,
  },
  footerCount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
  },
  footerThanks: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.black,
  },

  // QR
  qrWrap: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: 8,
  },
});
