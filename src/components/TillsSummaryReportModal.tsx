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

// ─── Types ────────────────────────────────────────────────────────────────────
interface TillRow {
  label:  string;
  amount: number | string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(val: number | string): string {
  if (typeof val === 'number') return `SAR ${val.toFixed(2)}`;
  return String(val);
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function Divider() {
  return <View style={r.divider} />;
}

function SectionTitle({ title }: { title: string }) {
  return (
    <View style={r.sectionTitleWrap}>
      <Text style={r.sectionTitleText}>{title}</Text>
    </View>
  );
}

function Row({ label, amount, bold }: TillRow & { bold?: boolean }) {
  return (
    <View style={r.row}>
      <Text style={[r.rowLabel, bold && r.rowBold]}>{label}</Text>
      <Text style={[r.rowAmount, bold && r.rowBold]}>{fmt(amount)}</Text>
    </View>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible:    boolean;
  onClose:    () => void;
  dateLabel:  string;
  printedAt:  string;
}

// ─── Till data constants ──────────────────────────────────────────────────────
const CASH         = 1840.00;
const MADA         = 1260.37;
const TOTAL_PAY    = CASH + MADA;          // 3100.37
const PAY_IN       = 0;
const PAY_OUT      = 150.00;
const CASH_DROPS   = 0;
const OPENING      = 500.00;
const CLOSING      = 2490.00;
// Estimated = Opening + Cash + Pay In - Pay Out - Cash Drops
const ESTIMATED    = OPENING + CASH + PAY_IN - PAY_OUT - CASH_DROPS;  // 2190.00
const DIFF         = CLOSING - ESTIMATED;  // positive → surplus, negative → shortage

// ─── Component ────────────────────────────────────────────────────────────────
export default function TillsSummaryReportModal({ visible, onClose, dateLabel, printedAt }: Props) {
  const surplusLabel   = DIFF > 0  ? 'Cash Surplus:'   : DIFF < 0 ? 'Cash Shortage:' : 'Cash Shortage:';
  const surplusAmount  = Math.abs(DIFF);

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
            <Text style={r.headerTitle}>Tills Summary</Text>
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
              <Text style={r.metaLine}>Till Close Report</Text>
              <Text style={r.metaLine}>Business Date: {dateLabel}</Text>
              <Text style={r.metaLine}>Printed at: {printedAt}</Text>
            </View>

            <Divider />

            {/* ── Till info ── */}
            <View style={r.tillInfo}>
              <Text style={r.infoLine}>User: Sara</Text>
              <Text style={r.infoLine}>Opened At: {dateLabel} 09:00 AM</Text>
              <Text style={r.infoLine}>Closed At: {dateLabel} 11:59 PM</Text>
            </View>

            <Divider />

            {/* ── Payments ── */}
            <SectionTitle title="Payments" />
            <Row label="House Account:"    amount={0} />
            <Row label="Solo Visa:"        amount={0} />
            <Row label="Solo Apple Pay:"   amount={0} />
            <Row label="Cash:"             amount={CASH} />
            <Row label="Gift Card:"        amount={0} />
            <Row label="Mada:"             amount={MADA} />
            <Row label="Solo Mastercard:"  amount={0} />
            <Row label="Total Payments:"   amount={TOTAL_PAY} bold />
            <Row label="Total Returns:"    amount={0} />
            <Row label="Net Payments:"     amount={TOTAL_PAY} bold />

            <Divider />

            {/* ── Drawer Operations ── */}
            <SectionTitle title="Drawer Operations" />
            <Row label="Total Pay In:"               amount={PAY_IN} />
            <Row label="Total Pay Out:"              amount={PAY_OUT} />
            <Row label="Total Cash Drops:"           amount={CASH_DROPS} />
            <Row label="Total Payment Operations:"   amount={CASH} />
            <Row label="Total Return Operations:"    amount={0} />
            <Row label="Count of Open Drawers:"      amount={0} />

            <Divider />

            {/* ── Cash summary ── */}
            <Row label="Opening Amount:"              amount={OPENING} />
            <Row label="Closing Amount:"              amount={CLOSING} />
            <Row label="Estimated Cash In Register:"  amount={ESTIMATED} />
            <Row label={surplusLabel}                 amount={surplusAmount} bold />

            <Divider />

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

  metaBlock: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 2,
  },
  metaLine: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.black,
    textAlign: 'center',
    lineHeight: 22,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.black,
    opacity: 0.18,
    marginHorizontal: 14,
    marginVertical: 4,
  },

  tillInfo: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 3,
    alignItems: 'center',
  },
  infoLine: {
    fontSize: 13,
    color: Colors.black,
    textAlign: 'center',
  },

  sectionTitleWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  sectionTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.black,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  rowLabel: {
    fontSize: 13,
    color: Colors.black,
    fontWeight: '400',
    flex: 1,
  },
  rowAmount: {
    fontSize: 13,
    color: Colors.black,
    fontWeight: '400',
    textAlign: 'right',
    minWidth: 90,
  },
  rowBold: {
    fontWeight: '700',
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
