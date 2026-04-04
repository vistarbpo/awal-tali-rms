import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors } from '../constants/colors';
import { iconSarGray } from '../assets/icons';
import { useI18n } from '../i18n';

interface Props {
  visible: boolean;
  onClose: () => void;
  onDone: (amount: string) => void;
  ctaLabel?: string;
}

const NUMPAD: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['C', '0', '.'],
];

export default function TillAmountDialog({ visible, onClose, onDone, ctaLabel }: Props) {
  const { t, af } = useI18n();
  const resolvedCtaLabel = ctaLabel ?? t('openTill');
  const [amount, setAmount] = useState('');

  function handleKey(key: string) {
    if (key === 'C') {
      setAmount(prev => prev.slice(0, -1));
    } else if (key === '.') {
      if (!amount.includes('.')) setAmount(prev => prev + '.');
    } else {
      // max 8 digits before decimal
      setAmount(prev => prev + key);
    }
  }

  function handleDone() {
    onDone(amount || '0');
    setAmount('');
  }

  const displayValue = amount || '0';

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
            <Text style={[s.headerLabel, { fontFamily: af('semibold') }]}>{t('enterTillAmount')}</Text>
          </View>

          {/* Amount display */}
          <View style={s.amountRow}>
            <Image source={iconSarGray} style={s.amountCurrency} />
            <Text style={s.amountValue} numberOfLines={1} adjustsFontSizeToFit>
              {displayValue}
            </Text>
          </View>

          {/* Divider */}
          <View style={s.divider} />

          {/* Numpad */}
          <View style={s.numpad}>
            {NUMPAD.map((row, ri) => (
              <View key={ri} style={s.row}>
                {row.map(key => {
                  const isAction = key === 'C' || key === '.';
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[s.key, isAction && s.keyAction]}
                      onPress={() => handleKey(key)}
                      activeOpacity={0.6}
                    >
                      <Text style={[s.keyText, isAction && s.keyActionText]}>
                        {key}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            {/* Done CTA */}
            <TouchableOpacity style={s.doneBtn} onPress={handleDone} activeOpacity={0.85}>
              <Text style={[s.doneBtnText, { fontFamily: af('bold') }]}>{resolvedCtaLabel}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

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
    width: KEY_W * 3 + KEY_GAP * 2 + 48, // numpad width + padding
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.grayText,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  /* Amount display */
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 8,
  },
  amountCurrency: {
    width: 22,
    height: 24,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -1.5,
    flexShrink: 1,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.grayBorder,
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
    fontSize: 20,
    fontWeight: '600',
    color: Colors.grayText,
  },

  /* Done button */
  doneBtn: {
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  doneBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
});
