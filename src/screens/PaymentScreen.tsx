import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { Colors } from '../constants/colors';
import { layout, LEFT_PANEL_W } from '../styles/screenLayout';
import OrderPanel, { CartItem } from '../components/OrderPanel';

// ─── Icons ────────────────────────────────────────────────────────────────────
import { iconSarDark, iconSarGray, iconSarWhite } from '../assets/icons';

const ICONS = {
  sarDark:  iconSarDark,
  sarGray:  iconSarGray,
  sarWhite: iconSarWhite,
};

const TAX_RATE = 0.15;

interface PaymentMethod {
  key: string;
  label: string;
  hint: string;
  emoji: string;
  color: string;
  bg: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { key: 'house',  label: 'House Account', hint: 'Bill to customer account', emoji: '🏢', color: '#1D353F', bg: '#EAF0F2' },
  { key: 'cash',   label: 'Cash',          hint: 'Accept banknotes & coins',  emoji: '💵', color: '#2E7D32', bg: '#E8F5E9' },
  { key: 'gift',   label: 'Gift Card',     hint: 'Redeem a gift card',        emoji: '🎁', color: '#6A1B9A', bg: '#F3E5F5' },
  { key: 'mada',   label: 'Mada',          hint: 'Saudi debit / credit card', emoji: '💳', color: '#C62828', bg: '#FFEBEE' },
];

interface AppliedPayment {
  method: string;
  amount: number;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  cart:        CartItem[];
  orderType?:  string | null;
  orderSeq?:   number;
  status?:     string;
  onBack:      () => void;
  onNewOrder?: () => void;
}

// ─── Amount Picker Modal ──────────────────────────────────────────────────────
interface AmountPickerProps {
  visible:   boolean;
  remaining: number;
  onSelect:  (amount: number) => void;
  onCustom:  () => void;
  onCancel:  () => void;
}

// ─── Custom Amount Keypad ─────────────────────────────────────────────────────
const NUMPAD: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['C', '0', '.'],
];

interface CustomKeypadProps {
  visible:   boolean;
  remaining: number;
  onSelect:  (amount: number) => void;
  onCancel:  () => void;
}

function CustomAmountKeypad({ visible, remaining, onSelect, onCancel }: CustomKeypadProps) {
  const [value, setValue] = useState('');

  function handleKey(key: string) {
    if (key === 'C') {
      setValue(prev => prev.slice(0, -1));
    } else if (key === '.') {
      if (!value.includes('.')) setValue(prev => prev + '.');
    } else {
      setValue(prev => prev + key);
    }
  }

  function handleConfirm() {
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      onSelect(num);
      setValue('');
    }
  }

  const entered      = parseFloat(value) || 0;
  const afterPay     = Math.max(0, remaining - entered);
  const displayValue = value || '0';

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={ck.backdrop} />
      </TouchableWithoutFeedback>
      <View style={ck.center} pointerEvents="box-none">
        <View style={ck.card}>
          <View style={ck.header}>
            <Text style={ck.headerLabel}>Custom Amount</Text>
          </View>
          <View style={ck.amountRow}>
            <Image source={ICONS.sarGray} style={ck.amountCurrency} />
            <Text style={ck.amountValue} numberOfLines={1} adjustsFontSizeToFit>{displayValue}</Text>
          </View>
          <View style={ck.remainingRow}>
            <Text style={ck.remainingLabel}>Remaining</Text>
            <Text style={[ck.remainingValue, afterPay === 0 && ck.remainingZero]}>{afterPay.toFixed(2)}</Text>
          </View>
          <View style={ck.divider} />
          <View style={ck.numpad}>
            {NUMPAD.map((row, ri) => (
              <View key={ri} style={ck.row}>
                {row.map(key => {
                  const isAction = key === 'C' || key === '.';
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[ck.key, isAction && ck.keyAction]}
                      onPress={() => handleKey(key)}
                      activeOpacity={0.6}
                    >
                      <Text style={[ck.keyText, isAction && ck.keyActionText]}>{key}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
            <TouchableOpacity style={ck.doneBtn} onPress={handleConfirm} activeOpacity={0.85}>
              <Text style={ck.doneBtnText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function buildQuickAmounts(remaining: number): (number | 'custom')[] {
  const amounts = new Set<number>();
  amounts.add(parseFloat(remaining.toFixed(2)));
  const r50  = Math.ceil(remaining / 50)  * 50;
  const r100 = Math.ceil(remaining / 100) * 100;
  if (r50  > remaining) amounts.add(r50);
  if (r100 > remaining) amounts.add(r100);
  return [...amounts].slice(0, 3) as (number | 'custom')[];
}

function AmountPicker({ visible, remaining, onSelect, onCustom, onCancel }: AmountPickerProps) {
  const quickAmounts = buildQuickAmounts(remaining);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={ap.backdrop} />
      </TouchableWithoutFeedback>

      <View style={ap.center} pointerEvents="box-none">
        <View style={ap.card}>
          {quickAmounts.map((amt, i) => (
            <React.Fragment key={String(amt)}>
              {i > 0 && <View style={ap.divider} />}
              <TouchableOpacity style={ap.row} onPress={() => onSelect(amt as number)} activeOpacity={0.6}>
                <View style={ap.amountRow}>
                  <Image source={ICONS.sarGray} style={ap.sar} />
                  <Text style={ap.amountText}>{(amt as number).toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            </React.Fragment>
          ))}
          <View style={ap.divider} />
          <TouchableOpacity style={ap.row} onPress={onCustom} activeOpacity={0.6}>
            <Text style={ap.customText}>Custom</Text>
          </TouchableOpacity>
          <View style={ap.divider} />
          <TouchableOpacity style={ap.row} onPress={onCancel} activeOpacity={0.6}>
            <Text style={ap.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PaymentScreen({ cart, orderType, orderSeq, status, onBack, onNewOrder }: Props) {
  const [appliedPayments, setAppliedPayments] = useState<AppliedPayment[]>([]);
  const [pendingMethod, setPendingMethod]     = useState<string | null>(null);
  const [showAmountPicker, setShowAmountPicker]   = useState(false);
  const [showCustomKeypad, setShowCustomKeypad]   = useState(false);
  const [showMoreTooltip, setShowMoreTooltip]     = useState(false);
  const [paidWithoutClose, setPaidWithoutClose] = useState(false);

  const subtotal  = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const taxes     = subtotal * TAX_RATE;
  const total     = subtotal + taxes;
  const paid      = appliedPayments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, total - paid);
  const isFullyPaid = remaining === 0 && appliedPayments.length > 0;

  function handleMethodPress(method: PaymentMethod) {
    if (remaining <= 0) return;
    setPendingMethod(method.label);
    setShowAmountPicker(true);
  }

  function handleAmountSelect(amount: number) {
    if (pendingMethod) {
      const apply = Math.min(amount, remaining);
      setAppliedPayments(prev => [...prev, { method: pendingMethod, amount: apply }]);
    }
    setShowAmountPicker(false);
    setPendingMethod(null);
  }

  return (
    <SafeAreaView style={layout.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundAlt} />

      <View style={layout.row}>

        {/* ══ LEFT: Order panel ══ */}
        <OrderPanel
          items={cart}
          selectedId={null}
          onSelectItem={() => {}}
          onRemoveItem={() => {}}
          orderType={orderType}
          orderSeq={orderSeq}
          status={isFullyPaid ? 'Done' : status}
          isPaymentOpen
        />

        {/* ══ RIGHT: Payment content ══ */}
        <View style={s.right}>

          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity style={s.headerBtn} onPress={onBack} activeOpacity={0.8}>
              <Text style={s.headerBtnText}>BACK</Text>
            </TouchableOpacity>
            <Text style={s.headerTitle}>Payment</Text>
            <TouchableOpacity style={s.headerBtn} activeOpacity={0.8}>
              <Text style={s.headerBtnText}>CURRENCY</Text>
            </TouchableOpacity>
          </View>

          {/* Two-column content */}
          <View style={s.content}>

            {/* Left col: payment methods */}
            <View style={s.methodsCol}>
              <Text style={s.sectionLabel}>PAYMENT METHODS</Text>
              {PAYMENT_METHODS.map(method => (
                <TouchableOpacity
                  key={method.key}
                  style={s.methodCard}
                  onPress={() => handleMethodPress(method)}
                  activeOpacity={0.8}
                >
                  {/* Left accent bar */}
                  <View style={[s.methodAccent, { backgroundColor: method.color }]} />

                  {/* Icon */}
                  <View style={[s.methodIconWrap, { backgroundColor: method.bg }]}>
                    <Text style={s.methodIcon}>{method.emoji}</Text>
                  </View>

                  {/* Labels */}
                  <View style={s.methodTextWrap}>
                    <Text style={s.methodLabel}>{method.label}</Text>
                    <Text style={s.methodHint}>{method.hint}</Text>
                  </View>

                  {/* Chevron */}
                  <Text style={s.methodChevron}>›</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Right col: summary */}
            <View style={s.summaryCol}>

              {/* Remaining card */}
              <View style={[s.remainingCard, isFullyPaid && s.remainingCardPaid]}>
                <Text style={[s.remainingLabel, isFullyPaid && s.remainingLabelPaid]}>
                  {isFullyPaid ? 'Paid in full' : 'Remaining'}
                </Text>
                <View style={s.sarRow}>
                  <Image
                    source={isFullyPaid ? ICONS.sarWhite : ICONS.sarDark}
                    style={[s.sarIcon, { width: 20, height: 22 }]}
                  />
                  <Text style={[s.remainingAmount, isFullyPaid && s.remainingAmountPaid]}>
                    {remaining.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Applied payments */}
              {appliedPayments.length > 0 && (
                <View style={s.summaryCard}>
                  <Text style={s.summaryTitle}>APPLIED</Text>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {appliedPayments.map((p, i) => (
                      <View key={i} style={[s.summaryRow, i > 0 && s.summaryRowBorder]}>
                        <Text style={s.summaryMethod}>{p.method}</Text>
                        <View style={s.sarRow}>
                          <Image source={ICONS.sarDark} style={s.sarIcon} />
                          <Text style={s.summaryAmount}>{p.amount.toFixed(2)}</Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

            </View>
          </View>

          {/* PAY + ... — full width at bottom */}
          <View style={s.actions}>
            {paidWithoutClose ? (
              <TouchableOpacity
                style={s.closeOrderBtn}
                activeOpacity={0.85}
                onPress={onNewOrder ?? onBack}
              >
                <Text style={s.closeOrderText}>Close Order</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[s.payBtn, isFullyPaid && s.payBtnActive]}
                  activeOpacity={0.85}
                  onPress={isFullyPaid ? (onNewOrder ?? onBack) : undefined}
                >
                  <Text style={[s.payBtnText, isFullyPaid && s.payBtnTextActive]}>PAY</Text>
                </TouchableOpacity>

                {/* ... button with tooltip */}
                <View>
                  {showMoreTooltip && (
                    <TouchableOpacity
                      style={s.tooltip}
                      activeOpacity={0.8}
                      onPress={() => { setShowMoreTooltip(false); setPaidWithoutClose(true); }}
                    >
                      <Text style={s.tooltipText}>Pay without close</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[s.moreBtn, isFullyPaid && s.moreBtnActive]}
                    activeOpacity={0.85}
                    onPress={() => setShowMoreTooltip(prev => !prev)}
                  >
                    <Text style={[s.moreBtnDots, isFullyPaid && s.moreDotsActive]}>•••</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

        </View>
      </View>

      <AmountPicker
        visible={showAmountPicker}
        remaining={remaining}
        onSelect={handleAmountSelect}
        onCustom={() => { setShowAmountPicker(false); setShowCustomKeypad(true); }}
        onCancel={() => { setShowAmountPicker(false); setPendingMethod(null); }}
      />

      <CustomAmountKeypad
        visible={showCustomKeypad}
        remaining={remaining}
        onSelect={amount => { setShowCustomKeypad(false); handleAmountSelect(amount); }}
        onCancel={() => { setShowCustomKeypad(false); setPendingMethod(null); }}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  right: {
    flex: 1,
    padding: 20,
    gap: 14,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  headerBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: -0.075,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -0.1,
  },

  /* Two-column layout */
  content: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },

  /* Left: methods */
  methodsCol: {
    flex: 1,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.grayText,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
    marginLeft: 2,
  },
  methodCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    height: 76,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  methodAccent: {
    width: 5,
    alignSelf: 'stretch',
  },
  methodIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  methodIcon: {
    fontSize: 22,
  },
  methodTextWrap: {
    flex: 1,
    paddingHorizontal: 14,
  },
  methodLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  methodHint: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.grayText,
    marginTop: 2,
    letterSpacing: -0.1,
  },
  methodChevron: {
    fontSize: 26,
    fontWeight: '300',
    color: Colors.grayMid,
    marginRight: 18,
    lineHeight: 30,
  },

  /* Right: summary */
  summaryCol: {
    width: 290,
    gap: 10,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.grayText,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  summaryRowBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.grayBorder,
  },
  summaryMethod: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.black,
    letterSpacing: -0.08,
  },
  summaryAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.08,
  },
  sarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  sarIcon: {
    width: 15,
    height: 17,
    resizeMode: 'contain',
  },

  /* Remaining */
  remainingCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  remainingCardPaid: {
    backgroundColor: Colors.green,
    shadowColor: Colors.green,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  remainingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.grayText,
    letterSpacing: -0.1,
  },
  remainingLabelPaid: {
    color: 'rgba(255,255,255,0.85)',
  },
  remainingAmount: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -0.8,
  },
  remainingAmountPaid: {
    color: Colors.white,
  },
  remainingZero: { color: Colors.green }, // kept for compat

  /* Actions */
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  payBtn: {
    flex: 1,
    backgroundColor: Colors.grayLight,
    borderRadius: 16,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBtnActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  payBtnText: {
    fontSize: 19,
    fontWeight: '700',
    color: Colors.grayMid,
    letterSpacing: -0.095,
  },
  payBtnTextActive: {
    color: Colors.white,
  },
  closeOrderBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  closeOrderText: {
    fontSize: 19,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.095,
  },

  tooltip: {
    position: 'absolute',
    bottom: 74,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 160,
  },
  tooltipText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.white,
    letterSpacing: -0.1,
  },

  moreBtn: {
    width: 64,
    height: 64,
    backgroundColor: Colors.grayLight,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreBtnActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  moreBtnDots: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.grayMid,
    letterSpacing: 2,
  },
  moreDotsActive: {
    color: Colors.white,
  },
});

// ─── Amount Picker Styles ─────────────────────────────────────────────────────
const ap = StyleSheet.create({
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
    width: 320,
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
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
    alignItems: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amountText: {
    fontSize: 22,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.11,
    textAlign: 'center',
  },
  sar: {
    width: 15,
    height: 17,
    resizeMode: 'contain',
    opacity: 0.5,
  },
  customText: {
    fontSize: 22,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.11,
    textAlign: 'center',
  },
  cancelText: {
    fontSize: 22,
    fontWeight: '500',
    color: Colors.red,
    letterSpacing: -0.11,
    textAlign: 'center',
  },
});

// ─── Custom Keypad Styles ─────────────────────────────────────────────────────
const KEY_W   = 92;
const KEY_H   = 72;
const KEY_GAP = 10;

const ck = StyleSheet.create({
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
  remainingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  remainingLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.grayText,
  },
  remainingValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.grayText,
    letterSpacing: -0.1,
  },
  remainingZero: {
    color: Colors.green,
  },
});
