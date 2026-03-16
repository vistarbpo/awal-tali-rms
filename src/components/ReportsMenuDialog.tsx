import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors } from '../constants/colors';
import OrdersSummaryDialog from './OrdersSummaryDialog';

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible: boolean;
  onClose: () => void;
}

type Report = 'orders-summary' | 'tills-summary' | 'products-mix' | 'active-delivery' | 'driver-payments' | null;

// ─── Component ────────────────────────────────────────────────────────────────
export default function ReportsMenuDialog({ visible, onClose }: Props) {
  const [activeReport, setActiveReport] = useState<Report>(null);

  function handleClose() {
    setActiveReport(null);
    onClose();
  }

  return (
    <>
      <Modal
        visible={visible && !activeReport}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={s.backdrop} />
        </TouchableWithoutFeedback>

        <View style={s.center} pointerEvents="box-none">
          <View style={s.card}>

            {/* ── Header ── */}
            <View style={s.header}>
              <TouchableOpacity onPress={onClose} style={s.closeBtn} activeOpacity={0.7}>
                <Text style={s.closeText}>Close</Text>
              </TouchableOpacity>
              <Text style={s.title}>Reports</Text>
              <View style={s.closeBtn} />
            </View>

            <View style={s.headerDivider} />

            {/* ── Report list ── */}
            {[
              { key: 'tills',            label: 'Tills Summary'                   },
              { key: 'orders-summary',   label: 'Orders Summary'                  },
              { key: 'products-mix',     label: 'Products Mix'                    },
              { key: 'active-delivery',  label: 'Active Delivery Orders Summary'  },
              { key: 'driver-payments',  label: 'Driver Payments'                 },
            ].map((item, i, arr) => (
              <React.Fragment key={item.key}>
                <TouchableOpacity
                  style={s.row}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (item.key === 'orders-summary') setActiveReport('orders-summary');
                    if (item.key === 'tills')          setActiveReport('tills-summary');
                    if (item.key === 'products-mix')    setActiveReport('products-mix');
                    if (item.key === 'active-delivery') setActiveReport('active-delivery');
                    if (item.key === 'driver-payments') setActiveReport('driver-payments');
                  }}
                >
                  <Text style={s.rowLabel}>{item.label}</Text>
                </TouchableOpacity>
                {i < arr.length - 1 && <View style={s.divider} />}
              </React.Fragment>
            ))}

          </View>
        </View>
      </Modal>

      <OrdersSummaryDialog
        visible={activeReport === 'orders-summary'}
        onBack={() => setActiveReport(null)}
        onClose={handleClose}
        title="Orders Summary"
        reportType="orders"
      />

      <OrdersSummaryDialog
        visible={activeReport === 'tills-summary'}
        onBack={() => setActiveReport(null)}
        onClose={handleClose}
        title="Tills Summary"
        reportType="tills"
      />

      <OrdersSummaryDialog
        visible={activeReport === 'products-mix'}
        onBack={() => setActiveReport(null)}
        onClose={handleClose}
        title="Products Mix"
        reportType="products"
      />

      <OrdersSummaryDialog
        visible={activeReport === 'active-delivery'}
        onBack={() => setActiveReport(null)}
        onClose={handleClose}
        title="Active Delivery Orders Summary"
        reportType="active-delivery"
      />

      <OrdersSummaryDialog
        visible={activeReport === 'driver-payments'}
        onBack={() => setActiveReport(null)}
        onClose={handleClose}
        title="Driver Payments"
        reportType="driver-payments"
      />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
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
    width: 480,
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: Colors.grayLight,
  },
  closeBtn: { width: 56 },
  closeText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  headerDivider: {
    height: 1,
    backgroundColor: Colors.grayBorder,
  },

  row: {
    paddingHorizontal: 28,
    paddingVertical: 22,
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.2,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.29)',
    marginLeft: 28,
  },
});
