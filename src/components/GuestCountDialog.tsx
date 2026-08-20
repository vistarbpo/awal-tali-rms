import React, { useState, useEffect } from 'react';
import RootModal from './RootModal';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';

interface Props {
  visible:    boolean;
  tableName:  string;
  section:    string;
  onClose:    () => void;
  onConfirm:  (guests: number) => void;
}

const NUMPAD: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['C', '0', '⌫'],
];

export default function GuestCountDialog({ visible, tableName, section, onClose, onConfirm }: Props) {
  const { t, af, isRTL } = useI18n();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (visible) setValue('');
  }, [visible]);

  function handleKey(key: string) {
    if (key === 'C') {
      setValue('');
    } else if (key === '⌫') {
      setValue(prev => prev.slice(0, -1));
    } else {
      const next = value + key;
      if (parseInt(next, 10) > 99) return; // cap at 99
      setValue(next);
    }
  }

  function handleConfirm() {
    const n = parseInt(value || '1', 10);
    if (n > 0) onConfirm(n);
  }

  const canConfirm = value.length > 0 && parseInt(value, 10) > 0;

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
            <Text style={[s.headerTitle, { fontFamily: af('bold') }]}>{t('guestCount')}</Text>
            <Text style={[s.headerSub, { fontFamily: af('regular') }]}>{section} · {tableName}</Text>
          </View>

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
                      <Text
                        style={[
                          s.keyText,
                          isAction && s.keyActionText,
                          key === '⌫' && isRTL && { transform: [{ scaleX: -1 }] },
                        ]}
                      >
                        {key}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            {/* CTA */}
            <TouchableOpacity
              style={[s.confirmBtn, !canConfirm && s.confirmBtnDisabled]}
              onPress={canConfirm ? handleConfirm : undefined}
              activeOpacity={0.85}
            >
              <Text style={[s.confirmBtnText, { fontFamily: af('bold') }]}>{t('confirm')}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </RootModal>
  );
}

const KEY_W   = 88;
const KEY_H   = 68;
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

  /* Header */
  header: {
    backgroundColor: Colors.grayLight,
    paddingHorizontal: 24,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 3,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.1,
    marginTop: 2,
  },

  /* Numpad */
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
    fontSize: 18,
    fontWeight: '600',
    color: Colors.grayText,
  },

  /* CTA */
  confirmBtn: {
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnDisabled: {
    backgroundColor: Colors.grayMid,
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
});
