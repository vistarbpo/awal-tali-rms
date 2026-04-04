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
import { useI18n } from '../i18n';

// ─── Mock data ────────────────────────────────────────────────────────────────
interface DriverRow {
  driver:    string;
  orders:    number;
  collected: number;
  paid:      number;
  balance:   number;
}

const DRIVER_DATA: DriverRow[] = [
  { driver: 'Khalid Al-Otaibi', orders: 14, collected: 1240.50, paid: 1200.00, balance:  40.50 },
  { driver: 'Faisal Al-Zahrani', orders: 11, collected:  980.00, paid:  980.00, balance:   0.00 },
  { driver: 'Tariq Al-Ghamdi',  orders:  9, collected:  760.75, paid:  700.00, balance:  60.75 },
  { driver: 'Mohammed Saad',    orders:  7, collected:  620.00, paid:  620.00, balance:   0.00 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function SarAmt({ n, style }: { n: number; style?: object }) {
  return (
    <View style={[r.sarAmtWrap, style]}>
      <Image source={iconSarDark} style={r.sarAmtIcon} />
      <Text style={r.sarAmtText}>{n.toFixed(2)}</Text>
    </View>
  );
}

function Divider({ thick }: { thick?: boolean }) {
  return <View style={[r.divider, thick && r.dividerThick]} />;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible:   boolean;
  onClose:   () => void;
  dateLabel: string;
  printedAt: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DriverPaymentsReportModal({ visible, onClose, dateLabel, printedAt }: Props) {
  const { t, af }  = useI18n();
  const totOrders    = DRIVER_DATA.reduce((s, d) => s + d.orders,    0);
  const totCollected = DRIVER_DATA.reduce((s, d) => s + d.collected, 0);
  const totPaid      = DRIVER_DATA.reduce((s, d) => s + d.paid,      0);
  const totBalance   = DRIVER_DATA.reduce((s, d) => s + d.balance,   0);

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
              <Text style={[r.doneText, { fontFamily: af('semibold') }]}>{t('done')}</Text>
            </TouchableOpacity>
            <Text style={[r.headerTitle, { fontFamily: af('bold') }]}>{t('driverPayments')}</Text>
            <TouchableOpacity style={r.printBtn} activeOpacity={0.7}>
              <Text style={[r.printText, { fontFamily: af('semibold') }]}>{t('print')}</Text>
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
              <Text style={r.metaLine}>Driver Payments Report</Text>
              <Text style={r.metaLine}>Business Date: {dateLabel}</Text>
              <Text style={r.metaLine}>Printed at: {printedAt}</Text>
            </View>

            <Divider thick />

            {/* ── Table ── */}
            <View style={r.section}>

              {/* Header row */}
              <View style={r.tableRow}>
                <Text style={[r.colDriver,    r.colHeader]}>Driver</Text>
                <Text style={[r.colOrders,    r.colHeader]}>Orders</Text>
                <Text style={[r.colCollected, r.colHeader]}>Collected</Text>
                <Text style={[r.colPaid,      r.colHeader]}>Paid</Text>
                <Text style={[r.colBalance,   r.colHeader]}>Balance</Text>
              </View>

              <Divider />

              {DRIVER_DATA.map((d, i) => (
                <View key={i}>
                  <View style={r.tableRow}>
                    <Text style={r.colDriver}    numberOfLines={1}>{d.driver}</Text>
                    <Text style={r.colOrders}>{d.orders}</Text>
                    <SarAmt n={d.collected} style={r.colCollected} />
                    <SarAmt n={d.paid}      style={r.colPaid} />
                    <SarAmt n={d.balance}   style={r.colBalance} />
                  </View>
                  <Divider />
                </View>
              ))}

              {/* Totals */}
              <View style={r.tableRow}>
                <Text style={[r.colDriver,    r.totalLabel]}>Total</Text>
                <Text style={[r.colOrders,    r.totalLabel]}>{totOrders}</Text>
                <SarAmt n={totCollected} style={[r.colCollected, r.totalLabel]} />
                <SarAmt n={totPaid}      style={[r.colPaid,      r.totalLabel]} />
                <SarAmt n={totBalance}   style={[r.colBalance,   r.totalLabel]} />
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
const CARD_W = 500;

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
  doneBtn:     { width: 48 },
  doneText:    { fontSize: 15, fontWeight: '600', color: Colors.primary },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '700', color: Colors.black },
  printBtn:    { width: 48, alignItems: 'flex-end' },
  printText:   { fontSize: 15, fontWeight: '600', color: Colors.black },

  scroll:        { flex: 1 },
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
    paddingVertical: 8,
  },
  colDriver:    { flex: 1,   fontSize: 12, color: Colors.black },
  colOrders:    { width: 44, fontSize: 12, color: Colors.black, textAlign: 'right' },
  colCollected: { width: 90, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  colPaid:      { width: 90, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  colBalance:   { width: 80, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  sarAmtWrap:   { flexDirection: 'row', alignItems: 'center', gap: 3 },
  sarAmtIcon:   { width: 11, height: 12, resizeMode: 'contain' },
  sarAmtText:   { fontSize: 12, color: Colors.black },
  colHeader:    { fontWeight: '700' },

  totalLabel: {
    fontWeight: '700',
    fontSize: 12,
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
