import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible:     boolean;
  currentQty:  number;
  itemName:    string;
  onClose:     () => void;
  onConfirm:   (qty: number) => void;
}

const NUMPAD: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['C', '0', '⌫'],
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function QuantityPadDialog({ visible, currentQty, itemName, onClose, onConfirm }: Props) {
  const { t, af, isRTL } = useI18n();
  const [input, setInput] = useState('');

  useEffect(() => {
    if (visible) setInput(String(currentQty));
  }, [visible]);

  function handleKey(key: string) {
    if (key === 'C') {
      setInput('');
    } else if (key === '⌫') {
      setInput(prev => prev.slice(0, -1));
    } else {
      // Prevent leading zeros and cap at 999
      setInput(prev => {
        const next = prev === '0' ? key : prev + key;
        return Number(next) > 999 ? prev : next;
      });
    }
  }

  function handleConfirm() {
    const qty = parseInt(input, 10);
    if (qty > 0) onConfirm(qty);
    onClose();
  }

  const displayQty = input || '0';

  return (
    <Modal
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
            <Text style={[s.headerLabel, { fontFamily: af('bold') }]}>{t('quantityTitle').toUpperCase()}</Text>
            <Text style={[s.headerItem, { fontFamily: af('medium') }]} numberOfLines={1}>{itemName}</Text>
          </View>

          {/* Display */}
          <View style={s.display}>
            <Text style={[s.displayValue, { fontFamily: af('bold') }]} adjustsFontSizeToFit numberOfLines={1}>
              {displayQty}
            </Text>
          </View>

          <View style={s.divider} />

          {/* Numpad */}
          <View style={s.numpad}>
            {NUMPAD.map((row, ri) => (
              <View key={ri} style={s.row}>
                {row.map(key => {
                  const isAction = key === 'C' || key === '⌫';
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[s.key, isAction && s.keyAction]}
                      onPress={() => handleKey(key)}
                      activeOpacity={0.6}
                    >
                      <Text style={[s.keyText, isAction && s.keyActionText]}>{key}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            {/* Footer */}
            <View style={s.footer}>
              <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.85}>
                <Text style={[s.footerText, { fontFamily: af('bold') }]}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.confirmBtn, (!input || input === '0') && s.confirmBtnDisabled]}
                onPress={handleConfirm}
                activeOpacity={0.85}
                disabled={!input || input === '0'}
              >
                <Text style={[s.footerText, { fontFamily: af('bold') }]}>{t('confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const KEY_W   = 92;
const KEY_H   = 72;
const KEY_GAP = 10;

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
    width: KEY_W * 3 + KEY_GAP * 2 + 48,
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
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 4,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.grayText,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerItem: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.black,
    letterSpacing: -0.2,
  },
  display: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
    alignItems: 'flex-end',
  },
  displayValue: {
    fontSize: 56,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.grayBorder,
  },
  numpad: {
    padding: 24,
    gap: KEY_GAP,
    backgroundColor: Colors.backgroundAlt,
  },
  row: {
    flexDirection: 'row',
    gap: KEY_GAP,
  },
  key: {
    width: KEY_W,
    height: KEY_H,
    backgroundColor: Colors.white,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  keyAction: {
    backgroundColor: Colors.grayLight,
  },
  keyText: {
    fontSize: 26,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.5,
  },
  keyActionText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.grayText,
  },
  footer: {
    flexDirection: 'row',
    gap: KEY_GAP,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtn: {
    flex: 2,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnDisabled: {
    opacity: 0.45,
  },
  footerText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
});
