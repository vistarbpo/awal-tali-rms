import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Colors } from '../constants/colors';

// ─── Mock data ────────────────────────────────────────────────────────────────
interface ProductRow {
  name:     string;
  qty:      number;
  netSales: number;
}

interface CategoryGroup {
  category: string;
  products: ProductRow[];
}

const REPORT_DATA: CategoryGroup[] = [
  {
    category: 'Main Dishes',
    products: [
      { name: 'Fried Rice',        qty: 12, netSales: 300.00 },
      { name: 'Pasta Primavera',   qty:  8, netSales: 240.00 },
      { name: 'Grilled Chicken',   qty: 15, netSales: 675.00 },
      { name: 'Beef Steak',        qty:  6, netSales: 390.00 },
      { name: 'Lamb Chops',        qty:  4, netSales: 280.00 },
      { name: 'Mixed Grill',       qty:  5, netSales: 375.00 },
    ],
  },
  {
    category: 'Salads',
    products: [
      { name: 'Garden Salad',      qty:  9, netSales: 162.00 },
      { name: 'Caesar Salad',      qty: 11, netSales: 242.00 },
    ],
  },
  {
    category: 'Breakfast',
    products: [
      { name: 'Pancakes',          qty:  6, netSales:  90.00 },
      { name: 'Eggs Benedict',     qty:  4, netSales:  80.00 },
      { name: 'French Toast',      qty:  3, netSales:  54.00 },
    ],
  },
  {
    category: 'Beverages',
    products: [
      { name: 'Water Bottle',      qty: 20, netSales: 140.00 },
      { name: 'Fresh Juice',       qty: 14, netSales: 210.00 },
      { name: 'Soft Drink',        qty: 18, netSales: 162.00 },
      { name: 'Hot Coffee',        qty: 10, netSales: 150.00 },
      { name: 'Tea',               qty:  7, netSales:  70.00 },
    ],
  },
  {
    category: 'Desserts',
    products: [
      { name: 'Cheesecake',        qty:  5, netSales: 100.00 },
      { name: 'Chocolate Brownie', qty:  4, netSales:  72.00 },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function sarFmt(n: number): string {
  return `SAR ${n.toFixed(2)}`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function Divider({ thick }: { thick?: boolean }) {
  return <View style={[r.divider, thick && r.dividerThick]} />;
}

function TableHeaderRow() {
  return (
    <View style={r.tableRow}>
      <Text style={[r.colProduct, r.colHeader]}>Product</Text>
      <Text style={[r.colQty,     r.colHeader]}>Qty</Text>
      <Text style={[r.colSales,   r.colHeader]}>Net Sales</Text>
    </View>
  );
}

function ProductLine({ row }: { row: ProductRow }) {
  return (
    <View style={r.tableRow}>
      <Text style={r.colProduct}  numberOfLines={1}>{row.name}</Text>
      <Text style={r.colQty}>{row.qty}</Text>
      <Text style={r.colSales}>{sarFmt(row.netSales)}</Text>
    </View>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible:   boolean;
  onClose:   () => void;
  dateLabel: string;
  printedAt: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProductsMixReportModal({ visible, onClose, dateLabel, printedAt }: Props) {
  const totalQty   = REPORT_DATA.flatMap(g => g.products).reduce((s, p) => s + p.qty, 0);
  const totalSales = REPORT_DATA.flatMap(g => g.products).reduce((s, p) => s + p.netSales, 0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={r.backdrop} />

      <View style={r.center} pointerEvents="box-none">
        <View style={r.card}>

          {/* ── Header bar ── */}
          <View style={r.headerBar}>
            <TouchableOpacity onPress={onClose} style={r.doneBtn} activeOpacity={0.7}>
              <Text style={r.doneText}>Done</Text>
            </TouchableOpacity>
            <Text style={r.headerTitle}>Products Mix</Text>
            <TouchableOpacity style={r.printBtn} activeOpacity={0.7}>
              <Text style={r.printText}>Print</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={r.scroll}
            contentContainerStyle={r.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Report meta ── */}
            <View style={r.metaBlock}>
              <Text style={r.metaLine}>اول و تالي - فرع الشوقية</Text>
              <Text style={r.metaLine}>B01</Text>
              <Text style={r.metaLine}>Products Mix Report</Text>
              <Text style={r.metaLine}>Business Date: {dateLabel}</Text>
              <Text style={r.metaLine}>Printed at: {printedAt}</Text>
            </View>

            <Divider thick />

            {/* ── Table header ── */}
            <View style={r.section}>
              <TableHeaderRow />
              <Divider />

              {/* ── Category groups ── */}
              {REPORT_DATA.map((group, gi) => (
                <View key={gi}>
                  {/* Category row */}
                  <View style={r.categoryRow}>
                    <Text style={r.categoryName}>{group.category}</Text>
                  </View>
                  <Divider />

                  {/* Product rows */}
                  {group.products.map((p, pi) => (
                    <ProductLine key={pi} row={p} />
                  ))}

                  <Divider />
                </View>
              ))}

              {/* ── Totals row ── */}
              <View style={r.totalRow}>
                <Text style={[r.colProduct, r.totalLabel]}>Total</Text>
                <Text style={[r.colQty,     r.totalLabel]}>{totalQty}</Text>
                <Text style={[r.colSales,   r.totalLabel]}>{sarFmt(totalSales)}</Text>
              </View>
            </View>

            <Divider thick />

            <Text style={r.endOfReport}>End Of Report</Text>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_W = 400;

const r = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.50)',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: CARD_W,
    maxHeight: '90%',
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 24,
    elevation: 14,
  },

  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
    backgroundColor: Colors.grayLight,
  },
  doneBtn: { width: 48 },
  doneText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: Colors.black,
  },
  printBtn: { width: 48, alignItems: 'flex-end' },
  printText: { fontSize: 15, fontWeight: '600', color: Colors.black },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  metaBlock: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 2,
  },
  metaLine: {
    fontSize: 13,
    color: Colors.black,
    textAlign: 'center',
    lineHeight: 22,
  },

  divider: {
    height: 0.5,
    backgroundColor: Colors.black,
    opacity: 0.2,
    marginHorizontal: 14,
    marginVertical: 2,
  },
  dividerThick: {
    height: 1,
    opacity: 0.3,
  },

  section: {
    paddingHorizontal: 14,
    paddingTop: 4,
  },

  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
  },
  colProduct: {
    flex: 1,
    fontSize: 13,
    color: Colors.black,
  },
  colQty: {
    width: 36,
    textAlign: 'right',
    fontSize: 13,
    color: Colors.black,
  },
  colSales: {
    width: 88,
    textAlign: 'right',
    fontSize: 13,
    color: Colors.black,
  },
  colHeader: {
    fontWeight: '700',
  },

  categoryRow: {
    paddingVertical: 6,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.black,
  },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontWeight: '700',
    fontSize: 13,
    color: Colors.black,
  },

  endOfReport: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: Colors.black,
    paddingVertical: 20,
    letterSpacing: 0.5,
  },
});
