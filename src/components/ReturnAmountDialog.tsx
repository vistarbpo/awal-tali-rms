import React from 'react';
import {
  View, Text, TouchableOpacity, TouchableWithoutFeedback, Modal, StyleSheet,
} from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  visible: boolean;
  amount: number;
  orderNumber: string;
  onClose: () => void;
}

export default function ReturnAmountDialog({ visible, amount, orderNumber, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>

      <View style={s.center} pointerEvents="box-none">
        <View style={s.card}>

          {/* Title */}
          <View style={s.titleArea}>
            <Text style={s.title}>Return amount</Text>
            <Text style={s.orderRef}>Order #{orderNumber}</Text>
          </View>

          {/* Amount */}
          <View style={s.amountRow}>
            <Text style={s.amount}>{amount.toFixed(2)}</Text>
            <Text style={s.currency}>SAR</Text>
          </View>

          <View style={s.divider} />

          {/* OK */}
          <TouchableOpacity style={s.okRow} onPress={onClose} activeOpacity={0.6}>
            <Text style={s.okText}>OK</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  center:   { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },

  card: {
    width: 299,
    backgroundColor: 'rgba(242,242,242,0.97)',
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },

  titleArea: {
    alignItems: 'center',
    paddingTop: 22,
    paddingBottom: 4,
    paddingHorizontal: 24,
    gap: 4,
  },
  title: {
    fontSize: 19,
    fontWeight: '500',
    color: Colors.black,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  orderRef: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.grayText,
    textAlign: 'center',
  },

  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
  },
  amount: {
    fontSize: 32,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  currency: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.grayText,
  },

  divider: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.29)',
  },
  okRow: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  okText: {
    fontSize: 21,
    fontWeight: '400',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
});
