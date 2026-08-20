import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { Colors } from '../constants/colors';
import RootModal from './RootModal';
import { useI18n } from '../i18n';

// ─── Charge presets ────────────────────────────────────────────────────────────
const CHARGE_TYPES = [
  'Delivery charge',
  'Service charge',
  'Packaging fee',
  'Custom',
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible:          boolean;
  onClose:          () => void;
  onSelectCharge:   (name: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ChargesSheet({ visible, onClose, onSelectCharge }: Props) {
  const { t, af, isRTL } = useI18n();
  const cardJSX = (
    <View style={s.card}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={onClose} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[s.cancelText, { fontFamily: af('medium') }]}>{t('cancel')}</Text>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { fontFamily: af('semibold') }]}>{t('chargesSheet')}</Text>
        <View style={s.headerSpacer} />
      </View>

      {/* ── Charge type list ── */}
      <View style={s.list}>
        {CHARGE_TYPES.map((name, i) => (
          <View key={name}>
            {i > 0 && <View style={s.divider} />}
            <TouchableOpacity
              style={s.row}
              onPress={() => { onSelectCharge(name); onClose(); }}
              activeOpacity={0.7}
            >
              <Text style={[s.rowText, { fontFamily: af('medium') }]}>{name}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

    </View>
  );

  return (
    <RootModal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>
      <View style={s.center} pointerEvents="box-none">
        {cardJSX}
      </View>
    </RootModal>
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
  inlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
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

  // ── Header ──
  header: {
    height: 72,
    backgroundColor: Colors.grayLight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.2,
    minWidth: 56,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.4,
  },
  headerSpacer: {
    minWidth: 56,
  },

  // ── List ──
  list: {
    paddingVertical: 8,
  },
  row: {
    paddingHorizontal: 26,
    paddingVertical: 20,
  },
  rowText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.primary,
    letterSpacing: -0.35,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.29)',
    marginStart: 24,
  },
});
