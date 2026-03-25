import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors } from '../constants/colors';
import { iconSarGray } from '../assets/icons';

// ─── Types ────────────────────────────────────────────────────────────────────
export type DiscountKind = 'amount' | 'percentage';

export interface OrderDiscount {
  label: string;
  kind: DiscountKind;
  value: number;
}

interface Props {
  visible: boolean;
  currentDiscount: OrderDiscount | null;
  subtotal: number;
  onClose: () => void;
  onApply: (discount: OrderDiscount) => void;
  onClear: () => void;
}

type Step = 'type' | 'numpad' | 'predefined';

// ─── Mock predefined discounts (matching Figma) ────────────────────────────────
const PREDEFINED: { label: string; kind: DiscountKind; value: number }[] = [
  { label: 'Special Discount',   kind: 'percentage', value: 50 },
  { label: 'Employee Discount',  kind: 'percentage', value: 10 },
  { label: 'Happy Hour',         kind: 'percentage', value: 20 },
  { label: 'Loyalty Member',     kind: 'percentage', value: 15 },
  { label: 'Manager Override',   kind: 'percentage', value: 25 },
  { label: 'Complimentary',      kind: 'percentage', value: 100 },
];

// ─── Numpad keys ──────────────────────────────────────────────────────────────
const NUMPAD: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['C', '0', '.'],
];

const KEY_W   = 88;
const KEY_H   = 68;
const KEY_GAP = 10;
const NUMPAD_CARD_W = KEY_W * 3 + KEY_GAP * 2 + 48;

// ─── View-drawn back arrow ────────────────────────────────────────────────────
function BackArrow() {
  return (
    <View style={icon.arrowWrap}>
      <View style={icon.arrowShaft} />
      <View style={icon.arrowHead} />
    </View>
  );
}
const icon = StyleSheet.create({
  arrowWrap:  { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  arrowShaft: { position: 'absolute', width: 14, height: 2, backgroundColor: Colors.primary, borderRadius: 1 },
  arrowHead:  { position: 'absolute', left: 0, width: 8, height: 8, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: Colors.primary, transform: [{ rotate: '45deg' }], marginLeft: 1 },
});

// ─── Component ────────────────────────────────────────────────────────────────
export default function DiscountDialog({ visible, currentDiscount, subtotal, onClose, onApply, onClear }: Props) {
  const [step, setStep]         = useState<Step>('type');
  const [openKind, setOpenKind] = useState<DiscountKind>('amount');
  const [amount, setAmount]     = useState('');

  useEffect(() => {
    if (visible) {
      setStep('type');
      setAmount('');
    }
  }, [visible]);

  function handleNumKey(key: string) {
    if (key === 'C') {
      setAmount(prev => prev.slice(0, -1));
    } else if (key === '.') {
      if (!amount.includes('.')) setAmount(prev => prev + '.');
    } else {
      setAmount(prev => prev + key);
    }
  }

  function handleApplyOpen() {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    if (openKind === 'percentage' && val > 100) return;
    onApply({
      label: openKind === 'percentage' ? `${val}% Off` : `${val} Off`,
      kind: openKind,
      value: val,
    });
  }

  function handleApplyPredefined(item: typeof PREDEFINED[0]) {
    onApply({ label: item.label, kind: item.kind, value: item.value });
  }

  const displayValue = amount || '0';
  const numericVal   = parseFloat(amount) || 0;
  const isPercent    = openKind === 'percentage';
  const previewDiscount = isPercent
    ? (subtotal * numericVal) / 100
    : Math.min(numericVal, subtotal);
  const canApply = numericVal > 0 && (!isPercent || numericVal <= 100);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>

      <View style={s.center} pointerEvents="box-none">

        {/* ── Step: Type selection (Amount / Percent / Predefined) ── */}
        {step === 'type' && (
          <View style={s.typeCard}>

            {/* Header */}
            <View style={s.typeHeader}>
              <Text style={s.typeHeaderTitle}>Discount</Text>
            </View>

            {/* Current discount badge */}
            {currentDiscount && (
              <View style={s.currentBadge}>
                <View style={s.currentBadgeLeft}>
                  <View style={s.currentDot} />
                  <Text style={s.currentLabel}>{currentDiscount.label}</Text>
                </View>
                <TouchableOpacity style={s.clearBtn} onPress={onClear} activeOpacity={0.75}>
                  <Text style={s.clearBtnText}>Clear</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Options */}
            <View style={s.typeList}>

              <TouchableOpacity
                style={s.typeRow}
                onPress={() => { setOpenKind('amount'); setAmount(''); setStep('numpad'); }}
                activeOpacity={0.75}
              >
                <Text style={s.typeRowLabel}>Amount</Text>
                <Text style={s.typeRowHint}>Fixed riyal reduction</Text>
              </TouchableOpacity>

              <View style={s.hairline} />

              <TouchableOpacity
                style={s.typeRow}
                onPress={() => { setOpenKind('percentage'); setAmount(''); setStep('numpad'); }}
                activeOpacity={0.75}
              >
                <Text style={s.typeRowLabel}>Percent</Text>
                <Text style={s.typeRowHint}>Percentage reduction</Text>
              </TouchableOpacity>

              <View style={s.hairline} />

              <TouchableOpacity
                style={s.typeRow}
                onPress={() => setStep('predefined')}
                activeOpacity={0.75}
              >
                <Text style={s.typeRowLabel}>Predefined</Text>
                <Text style={s.typeRowHint}>Manager-configured discounts</Text>
              </TouchableOpacity>

            </View>

            <TouchableOpacity style={s.cancelRow} onPress={onClose} activeOpacity={0.75}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>

          </View>
        )}

        {/* ── Step: Numpad ── */}
        {step === 'numpad' && (
          <View style={s.numpadCard}>

            <View style={s.numpadHeader}>
              <TouchableOpacity style={s.backBtn} onPress={() => setStep('type')} activeOpacity={0.7}>
                <BackArrow />
              </TouchableOpacity>
              <Text style={s.numpadHeaderLabel}>
                {isPercent ? 'Enter Percentage' : 'Enter Amount'}
              </Text>
            </View>

            <View style={s.valueRow}>
              {isPercent
                ? <Text style={s.valueSuffix}>%</Text>
                : <Image source={iconSarGray} style={s.valueSuffixIcon} />
              }
              <Text style={s.valueNum} numberOfLines={1} adjustsFontSizeToFit>
                {displayValue}
              </Text>
            </View>

            {canApply && (
              <View style={s.previewRow}>
                <View style={s.previewInner}>
                  <Text style={s.previewText}>Saving {previewDiscount.toFixed(2)}</Text>
                  <Image source={iconSarGray} style={s.previewSarIcon} />
                </View>
              </View>
            )}

            <View style={s.numpadDivider} />

            <View style={s.numpad}>
              {NUMPAD.map((row, ri) => (
                <View key={ri} style={s.numpadRow}>
                  {row.map(key => {
                    const isAction = key === 'C' || key === '.';
                    return (
                      <TouchableOpacity
                        key={key}
                        style={[s.key, isAction && s.keyAction]}
                        onPress={() => handleNumKey(key)}
                        activeOpacity={0.6}
                      >
                        <Text style={[s.keyText, isAction && s.keyActionText]}>{key}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}

              <TouchableOpacity
                style={[s.applyBtn, !canApply && s.applyBtnDisabled]}
                onPress={handleApplyOpen}
                activeOpacity={canApply ? 0.85 : 1}
                disabled={!canApply}
              >
                <Text style={s.applyBtnText}>Apply Discount</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}

        {/* ── Step: Predefined (Figma 92-11276 style) ── */}
        {step === 'predefined' && (
          <View style={s.predefinedCard}>

            {/* Header — Cancel | Discount */}
            <View style={s.predefinedHeader}>
              <TouchableOpacity onPress={onClose} activeOpacity={0.75} style={s.predefinedCancelTouch}>
                <Text style={s.predefinedCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={s.predefinedTitle}>Discount</Text>
              <View style={s.predefinedSpacer} />
            </View>

            {/* Rows */}
            <ScrollView style={s.predefinedScroll} showsVerticalScrollIndicator={false}>
              {PREDEFINED.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={s.predefinedRow}
                  onPress={() => handleApplyPredefined(item)}
                  activeOpacity={0.7}
                >
                  <Text style={s.predefinedName}>{item.label}</Text>
                  <Text style={s.predefinedValue}>
                    {item.kind === 'percentage'
                      ? `${item.value}.0 %`
                      : <View style={s.predefinedAmountRow}><Text style={s.predefinedValue}>{item.value}.0</Text><Image source={iconSarGray} style={s.predefinedSarIcon} /></View>
                    }
                  </Text>
                </TouchableOpacity>
              ))}
              <View style={{ height: 8 }} />
            </ScrollView>

          </View>
        )}

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

  // ── Type picker card ──
  typeCard: {
    width: 320,
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  typeHeader: {
    backgroundColor: Colors.grayLight,
    paddingHorizontal: 24,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  typeHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.3,
  },

  // ── Current discount badge ──
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  currentBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  currentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  currentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.2,
    flex: 1,
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEF0F0',
    borderWidth: 1,
    borderColor: Colors.red,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.red,
    letterSpacing: -0.1,
  },

  // ── Type options ──
  typeList: {
    backgroundColor: Colors.white,
  },
  typeRow: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 2,
  },
  typeRowLabel: {
    fontSize: 20,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.4,
  },
  typeRowHint: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.placeholder,
    letterSpacing: -0.1,
  },
  hairline: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.29)',
    marginLeft: 18,
  },
  cancelRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.grayBorder,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.2,
  },

  // ── Predefined card (Figma 92-11276) ──
  predefinedCard: {
    width: 480,
    backgroundColor: '#ECECEC',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  predefinedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 72,
    backgroundColor: '#ECECEC',
  },
  predefinedCancelTouch: {
    paddingVertical: 8,
    width: 80,
  },
  predefinedCancel: {
    fontSize: 18,
    fontWeight: '400',
    color: Colors.primary,
    letterSpacing: -0.35,
  },
  predefinedTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.black,
    letterSpacing: -0.35,
    textAlign: 'center',
  },
  predefinedSpacer: {
    width: 80,
  },
  predefinedScroll: {
    maxHeight: 380,
    backgroundColor: Colors.white,
  },
  predefinedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    gap: 20,
  },
  predefinedName: {
    fontSize: 20,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.35,
    flex: 1,
  },
  predefinedValue: {
    fontSize: 20,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.35,
    textAlign: 'right',
  },

  // ── Numpad card ──
  numpadCard: {
    width: NUMPAD_CARD_W,
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  numpadHeader: {
    backgroundColor: Colors.grayLight,
    paddingHorizontal: 24,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  numpadHeaderLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.grayText,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  valueRow: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    gap: 8,
  },
  valueSuffix: {
    fontSize: 18,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.2,
  },
  valueSuffixIcon: {
    width: 22,
    height: 24,
    resizeMode: 'contain',
    marginBottom: 6,
  },
  valueNum: {
    fontSize: 44,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -1.5,
    textAlign: 'right',
    flex: 1,
  },
  previewRow: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    alignItems: 'flex-end',
  },
  previewInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewSarIcon: {
    width: 13,
    height: 14,
    resizeMode: 'contain',
  },
  predefinedAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  predefinedSarIcon: {
    width: 14,
    height: 15,
    resizeMode: 'contain',
  },
  previewText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.green,
    letterSpacing: -0.1,
  },
  numpadDivider: {
    height: 1,
    backgroundColor: Colors.grayBorder,
  },
  numpad: {
    padding: 24,
    gap: KEY_GAP,
  },
  numpadRow: {
    flexDirection: 'row',
    gap: KEY_GAP,
  },
  key: {
    width: KEY_W,
    height: KEY_H,
    backgroundColor: Colors.grayLight,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.grayBorder,
  },
  keyAction: {
    backgroundColor: Colors.liteColor,
  },
  keyText: {
    fontSize: 22,
    fontWeight: '500',
    color: Colors.black,
    letterSpacing: -0.5,
  },
  keyActionText: {
    fontSize: 18,
    color: Colors.grayText,
  },
  applyBtn: {
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  applyBtnDisabled: {
    backgroundColor: Colors.grayMid,
    shadowOpacity: 0,
    elevation: 0,
  },
  applyBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
});
