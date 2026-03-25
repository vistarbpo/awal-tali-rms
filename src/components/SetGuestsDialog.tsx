import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { Colors } from '../constants/colors';

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible:    boolean;
  current:    number;
  onClose:    () => void;
  onConfirm:  (guests: number) => void;
}

const PAD: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['C', '0', '⌫'],
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function SetGuestsDialog({ visible, current, onClose, onConfirm }: Props) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (visible) setValue(current > 0 ? String(current) : '');
  }, [visible]);

  function handleKey(key: string) {
    if (key === 'C') {
      setValue('');
    } else if (key === '⌫') {
      setValue(prev => prev.slice(0, -1));
    } else {
      setValue(prev => {
        const next = prev + key;
        // Cap at 999
        return parseInt(next, 10) > 999 ? prev : next;
      });
    }
  }

  function handleDone() {
    const n = parseInt(value, 10);
    onConfirm(isNaN(n) ? 0 : n);
    onClose();
  }

  const display = value === '' ? '0' : value;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>

      <View style={s.center} pointerEvents="box-none">
        <View style={s.card}>

          {/* ── Header ── */}
          <View style={s.header}>
            <Text style={s.headerTitle}>Number of Guests</Text>
          </View>

          {/* ── Display ── */}
          <View style={s.displayWrap}>
            <Text style={s.displayValue}>{display}</Text>
            <Text style={s.displayLabel}>guests</Text>
          </View>

          {/* ── Numpad ── */}
          <View style={s.numpad}>
            {PAD.map((row, ri) => (
              <View key={ri} style={s.padRow}>
                {row.map(key => {
                  const isClear     = key === 'C';
                  const isBackspace = key === '⌫';
                  const isSpecial   = isClear || isBackspace;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[s.key, isSpecial && s.keySpecial]}
                      onPress={() => handleKey(key)}
                      activeOpacity={0.65}
                    >
                      <Text style={[s.keyText, isSpecial && s.keyTextSpecial]}>
                        {key}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* ── Actions ── */}
          <View style={s.actions}>
            <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.doneBtn} onPress={handleDone} activeOpacity={0.85}>
              <Text style={s.doneText}>Done</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const KEY_SIZE = 88;
const KEY_GAP  = 10;

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
  doneText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
});
