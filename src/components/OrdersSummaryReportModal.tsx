import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Colors } from '../constants/colors';
import { iconSarDark } from '../assets/icons';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ReportRow {
  name:     string;
  qty:      number | string;
  amount:   number | string;  // number → SAR formatted; '-' → dash
}

interface ReportSection {
  title: string;
  rows:  ReportRow[];
}

// ─── Mock report data (for selected date) ────────────────────────────────────
function buildReportData(dateLabel: string): ReportSection[] {
  return [
    {
      title: 'General',
      rows: [
        { name: 'Gross Sales',              qty: 47,  amount: 3842.50 },
        { name: 'Gross Sales Without Tax',  qty: 47,  amount: 3341.30 },
        { name: 'Total Discounts',          qty: 3,   amount: 192.13  },
        { name: 'Total Charges',            qty: 5,   amount: 44.00   },
        { name: 'Total Taxes',              qty: '-', amount: 501.20  },
        { name: 'Net Sales',                qty: 44,  amount: 3341.30 },
        { name: 'Guest Count',              qty: 47,  amount: '-'     },
        { name: 'Average Per Order',        qty: '-', amount: 81.75   },
        { name: 'Average Per Guest',        qty: '-', amount: 81.75   },
        { name: 'Total Void',               qty: 2,   amount: 55.00   },
        { name: 'Rounding',                 qty: 0,   amount: 0.00    },
      ],
    },
    {
      title: 'Order Charges',
      rows: [
        { name: 'Delivery fee', qty: 5, amount: 44.00 },
      ],
    },
    {
      title: 'Order Types',
      rows: [
        { name: 'Dine In',    qty: 18, amount: 1520.50 },
        { name: 'Pick Up',    qty: 20, amount: 1680.00 },
        { name: 'Delivery',   qty: 5,  amount: 442.50  },
        { name: 'Drive Thru', qty: 4,  amount: 199.50  },
      ],
    },
    {
      title: 'Discounts Summary',
      rows: [
        { name: 'Staff Discount', qty: 2, amount: 120.00 },
        { name: 'Promo Code',     qty: 1, amount: 72.13  },
      ],
    },
    {
      title: 'Payments',
      rows: [
        { name: 'House Account',  qty: 0,   amount: 0.00    },
        { name: 'Cash',           qty: 22,  amount: 1840.00 },
        { name: 'Gift Card',      qty: 0,   amount: 0.00    },
        { name: 'Mada',           qty: 15,  amount: 1260.37 },
        { name: 'Visa',           qty: 8,   amount: 550.00  },
        { name: 'Apple Pay',      qty: 2,   amount: 192.13  },
        { name: 'Total Payments', qty: '-', amount: 3842.50 },
        { name: 'Total Return',   qty: 0,   amount: 0.00    },
        { name: 'Net Payments',   qty: '-', amount: 3842.50 },
      ],
    },
    {
      title: 'Net Payments by Type',
      rows: [
        { name: 'Cash',          qty: '-', amount: 1840.00 },
        { name: 'Card',          qty: '-', amount: 2002.50 },
        { name: 'Other',         qty: '-', amount: 0.00    },
        { name: 'Gift Card',     qty: 0,   amount: 0.00    },
        { name: 'House Account', qty: 0,   amount: 0.00    },
        { name: 'Third Party',   qty: '-', amount: 0.00    },
      ],
    },
  ];
}

function AmtCell({ val, style }: { val: number | string; style?: object }) {
  if (val === '-') return <Text style={[r.colValText, style]}>—</Text>;
  if (typeof val === 'number') {
    return (
      <View style={[r.sarAmtWrap, style]}>
        <Image source={iconSarDark} style={r.sarAmtIcon} />
        <Text style={r.sarAmtText}>{val.toFixed(2)}</Text>
      </View>
    );
  }
  return <Text style={[r.colValText, style]}>{String(val)}</Text>;
}

function formatQty(val: number | string): string {
  if (val === '-') return '—';
  return String(val);
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <View style={r.sectionHeader}>
      <Text style={r.sectionTitle}>{title}</Text>
    </View>
  );
}

function TableHeader() {
  return (
    <View style={r.tableRow}>
      <Text style={[r.colName, r.colHeaderText]}>Name</Text>
      <Text style={[r.colQty,  r.colHeaderText]}>Qty</Text>
      <Text style={[r.colAmt,  r.colHeaderText]}>Amount</Text>
    </View>
  );
}

function TableRow({ row, last }: { row: ReportRow; last?: boolean }) {
  return (
    <View style={[r.tableRow, !last && r.tableRowBorder]}>
      <Text style={r.colName}>{row.name}</Text>
      <Text style={[r.colQty, r.colValText]}>{formatQty(row.qty)}</Text>
      <AmtCell val={row.amount} style={r.colAmt} />
    </View>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible:   boolean;
  onClose:   () => void;
  dateLabel: string;
  openedAt:  string;
  closedAt:  string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function OrdersSummaryReportModal({
  visible, onClose, dateLabel, openedAt, closedAt,
}: Props) {
  const printedAt = closedAt;
  const sections  = buildReportData(dateLabel);

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
            <Text style={r.headerTitle}>Orders Summary</Text>
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
              <Text style={r.metaLine}>Orders Summary</Text>
              <Text style={r.metaLine}>Business Date: {dateLabel}</Text>
              <Text style={r.metaLine}>Opened at: {openedAt}</Text>
              <Text style={r.metaLine}>Closed at: {closedAt}</Text>
              <Text style={r.metaLine}>Printed at: {printedAt}</Text>
            </View>

            {/* ── Sections ── */}
            {sections.map(section => (
              <View key={section.title} style={r.section}>
                <SectionHeader title={section.title} />
                <TableHeader />
                <View style={r.sectionDivider} />
                {section.rows.map((row, i) => (
                  <TableRow key={i} row={row} last={i === section.rows.length - 1} />
                ))}
                <View style={r.sectionDivider} />
              </View>
            ))}

            {/* ── End of report ── */}
            <Text style={r.endOfReport}>End Of Report</Text>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_W = 380;

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

  // Header bar
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
  doneText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: Colors.black,
  },
  printBtn: { width: 48, alignItems: 'flex-end' },
  printText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.black,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  // Meta block
  metaBlock: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 3,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  metaLine: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.black,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Section
  section: {
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  sectionHeader: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: 0.2,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.black,
    opacity: 0.18,
  },

  // Table
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tableRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.grayBorder,
  },
  colName: {
    flex: 1,
    fontSize: 13,
    color: Colors.black,
    fontWeight: '400',
  },
  colQty: {
    width: 40,
    textAlign: 'right',
    fontSize: 13,
    color: Colors.black,
  },
  sarAmtWrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  sarAmtIcon: { width: 11, height: 12, resizeMode: 'contain' },
  sarAmtText: { fontSize: 13, color: Colors.black },
  colAmt: {
    width: 84,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  colHeaderText: {
    fontWeight: '700',
    color: Colors.black,
  },
  colValText: {
    fontWeight: '400',
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
