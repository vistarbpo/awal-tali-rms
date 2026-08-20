import React from 'react';
import RootModal from './RootModal';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';

export type OrderType = 'Dine in' | 'Pick up' | 'Delivery' | 'Drive thru';

const ORDER_TYPES: OrderType[] = ['Dine in', 'Pick up', 'Delivery', 'Drive thru'];

export const ORDER_TYPE_KEYS: Record<OrderType, 'dineIn' | 'pickUp' | 'delivery' | 'driveThru'> = {
  'Dine in':   'dineIn',
  'Pick up':   'pickUp',
  'Delivery':  'delivery',
  'Drive thru': 'driveThru',
};

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: OrderType) => void;
}

export default function OrderTypeDialog({ visible, onClose, onSelect }: Props) {
  const { t, af } = useI18n();
  return (
    <RootModal
      visible={visible}
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

          {/* Header */}
          <View style={s.header}>
            <Text style={[s.headerTitle, { fontFamily: af('semibold') }]}>{t('orderType')}</Text>
          </View>

          {/* Options */}
          <View style={s.list}>
            {ORDER_TYPES.map((type, index) => (
              <React.Fragment key={type}>
                {index > 0 && <View style={s.divider} />}
                <TouchableOpacity
                  style={s.row}
                  onPress={() => { onSelect(type); onClose(); }}
                  activeOpacity={0.6}
                >
                  <Text style={[s.rowLabel, { fontFamily: af('medium') }]}>{t(ORDER_TYPE_KEYS[type])}</Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>

        </View>
      </View>
    </RootModal>
  );
}

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
    width: 360,
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },

  /* Header */
  header: {
    backgroundColor: Colors.grayLight,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.4,
  },

  /* List */
  list: {
    paddingVertical: 8,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.29)',
    marginLeft: 24,
  },
  row: {
    paddingHorizontal: 26,
    paddingVertical: 20,
  },
  rowLabel: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.4,
  },
});
