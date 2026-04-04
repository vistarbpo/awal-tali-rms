import React, { useState, useEffect } from 'react';
import {
  Modal,
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface OrderCharge {
  id: string;
  label: string;
  amount: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const NUMPAD: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['C', '0', '.'],
];

const KEY_SIZE = 88;
const KEY_GAP  = 10;

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible:    boolean;
  chargeName: string;
  onClose:    () => void;
  onApply:    (charge: OrderCharge) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AddChargeDialog({ visible, chargeName, onClose, onApply }: Props) {
  const { t, af, isRTL } = useI18n();
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (visible) setAmount('');
  }, [visible]);

  function handleNumKey(key: string) {
    if (key === 'C') { setAmount(''); return; }
    if (key === '.' && amount.includes('.')) return;
    if (key === '.' && amount === '') { setAmount('0.'); return; }
    const dot = amount.indexOf('.');
    if (dot !== -1 && amount.length - dot > 2) return;
    if (dot === -1 && amount.length >= 6) return;
    setAmount(prev => prev + key);
  }

  const parsed   = parseFloat(amount);
  const canApply = !isNaN(parsed) && parsed > 0;

  function handleDone() {
    if (!canApply) return;
    onApply({ id: `charge-${Date.now()}`, label: chargeName, amount: parsed });
    onClose();
  }

  const display = amount === '' ? '0' : amount;

  const cardJSX = (
    <View style={s.card}>

      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={[s.headerTitle, { fontFamily: af('bold') }]} numberOfLines={1}>{chargeName || t('addChargeTitle')}</Text>
      </View>

      {/* ── Amount display ── */}
      <View style={s.displayWrap}>
        <Text style={[s.displayValue, amount === '' && s.displayPlaceholder, { fontFamily: af('bold') }]}>
          {display}
        </Text>
        <Text style={[s.displayLabel, { fontFamily: af('medium') }]}>{t('chargeFieldAmount')}</Text>
      </View>

      {/* ── Numpad ── */}
      <View style={s.numpad}>
        {NUMPAD.map((row, ri) => (
          <View key={ri} style={s.padRow}>
            {row.map(key => {
              const isSpecial = key === 'C';
              return (
                <TouchableOpacity
                  key={key}
                  style={[s.key, isSpecial && s.keySpecial]}
                  onPress={() => handleNumKey(key)}
                  activeOpacity={0.65}
                >
                  <Text style={[s.keyText, isSpecial && s.keyTextSpecial]}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* ── Actions ── */}
      <View style={s.actions}>
        <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.7}>
          <Text style={[s.cancelText, { fontFamily: af('semibold') }]}>{t('cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.doneBtn, !canApply && s.doneBtnDisabled]}
          onPress={handleDone}
          activeOpacity={canApply ? 0.85 : 1}
        >
          <Text style={[s.doneText, { fontFamily: af('bold') }]}>{t('done')}</Text>
        </TouchableOpacity>
      </View>

    </View>
  );

  if (Platform.OS === 'web') {
    if (!visible) return null;
    return <View style={s.inlineOverlay}>{cardJSX}</View>;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>
      <View style={s.center} pointerEvents="box-none">
        {cardJSX}
      </View>
    </Modal>
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
    width: KEY_SIZE * 3 + KEY_GAP * 2 + 48,
    backgroundColor: Colors.white,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 32,
    elevation: 16,
  },

  // ── Header ──
  header: {
    backgroundColor: Colors.primary,
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.4,
  },

  // ── Display ──
  displayWrap: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
    backgroundColor: Colors.backgroundAlt,
  },
  displayValue: {
    fontSize: 56,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -2,
    lineHeight: 60,
  },
  displayPlaceholder: {
    color: Colors.placeholder,
  },
  displayLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.1,
  },

  // ── Numpad ──
  numpad: {
    padding: 24,
    gap: KEY_GAP,
    backgroundColor: Colors.backgroundAlt,
    borderTopWidth: 1,
    borderTopColor: Colors.grayBorder,
  },
  padRow: {
    flexDirection: 'row',
    gap: KEY_GAP,
  },
  key: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    backgroundColor: Colors.white,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  keySpecial: {
    backgroundColor: Colors.grayLight,
  },
  keyText: {
    fontSize: 28,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.5,
  },
  keyTextSpecial: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.grayText,
  },

  // ── Actions ──
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.grayBorder,
  },
  cancelBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.red,
    letterSpacing: -0.2,
  },
  doneBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  doneBtnDisabled: {
    backgroundColor: Colors.grayMid,
    shadowOpacity: 0,
    elevation: 0,
  },
  doneText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
});
