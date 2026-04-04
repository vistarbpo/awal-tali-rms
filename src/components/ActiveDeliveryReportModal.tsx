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
interface DeliveryOrder {
  orderId:  string;
  customer: string;
  driver:   string;
  amount:   number;
  status:   string;
}

const DELIVERY_ORDERS: DeliveryOrder[] = [
  { orderId: '#1042', customer: 'Ahmad Al-Rashid',   driver: 'Khalid',  amount: 88.50,  status: 'Out for Delivery' },
  { orderId: '#1038', customer: 'Sara Mohamed',      driver: 'Faisal',  amount: 125.00, status: 'Out for Delivery' },
  { orderId: '#1035', customer: 'Omar Al-Harbi',     driver: 'Khalid',  amount: 67.75,  status: 'Assigned'         },
  { orderId: '#1031', customer: 'Noura Al-Qahtani',  driver: 'Tariq',   amount: 210.00, status: 'Out for Delivery' },
  { orderId: '#1028', customer: 'Abdulaziz Saeed',   driver: 'Faisal',  amount: 54.00,  status: 'Assigned'         },
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
export default function ActiveDeliveryReportModal({ visible, onClose, dateLabel, printedAt }: Props) {
  const { t, af } = useI18n();
  const total = DELIVERY_ORDERS.reduce((s, o) => s + o.amount, 0);

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
            <Text style={[r.headerTitle, { fontFamily: af('bold') }]}>{t('activeDelivery')}</Text>
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
              <Text style={r.metaLine}>Active Delivery Orders Summary</Text>
              <Text style={r.metaLine}>Business Date: {dateLabel}</Text>
              <Text style={r.metaLine}>Printed at: {printedAt}</Text>
            </View>

            <Divider thick />

            {/* ── Table ── */}
            <View style={r.section}>

              {/* Header row */}
              <View style={r.tableRow}>
                <Text style={[r.colOrder,    r.colHeader]}>Order</Text>
                <Text style={[r.colCustomer, r.colHeader]}>Customer</Text>
                <Text style={[r.colDriver,   r.colHeader]}>Driver</Text>
                <Text style={[r.colStatus,   r.colHeader]}>Status</Text>
                <Text style={[r.colAmount,   r.colHeader]}>Amount</Text>
              </View>

              <Divider />

              {DELIVERY_ORDERS.map((o, i) => (
                <View key={i}>
                  <View style={r.tableRow}>
                    <Text style={r.colOrder}    numberOfLines={1}>{o.orderId}</Text>
                    <Text style={r.colCustomer} numberOfLines={1}>{o.customer}</Text>
                    <Text style={r.colDriver}   numberOfLines={1}>{o.driver}</Text>
                    <Text style={r.colStatus}   numberOfLines={1}>{o.status}</Text>
                    <SarAmt n={o.amount} style={r.colAmount} />
                  </View>
                  <Divider />
                </View>
              ))}

              {/* Total */}
              <View style={r.totalRow}>
                <Text style={[r.colOrder, r.totalLabel]}>Total</Text>
                <Text style={[r.colCustomer, r.totalLabel]}>{DELIVERY_ORDERS.length} orders</Text>
                <View style={r.colDriver} />
                <View style={r.colStatus} />
                <SarAmt n={total} style={[r.colAmount, r.totalLabel]} />
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
const CARD_W = 520;

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
    paddingVertical: 7,
  },
  colOrder:    { width: 52,  fontSize: 12, color: Colors.black },
  colCustomer: { flex: 1,    fontSize: 12, color: Colors.black },
  colDriver:   { width: 60,  fontSize: 12, color: Colors.black },
  colStatus:   { width: 110, fontSize: 12, color: Colors.black },
  colAmount:   { width: 80, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  sarAmtWrap:  { flexDirection: 'row', alignItems: 'center', gap: 3 },
  sarAmtIcon:  { width: 11, height: 12, resizeMode: 'contain' },
  sarAmtText:  { fontSize: 12, color: Colors.black },
  colHeader:   { fontWeight: '700' },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
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
