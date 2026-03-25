import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
} from 'react-native';
import { Colors } from '../constants/colors';
import { OrderDiscount } from './DiscountDialog';

// ─── Mock coupon database ─────────────────────────────────────────────────────
const VALID_COUPONS: Record<string, { label: string; kind: 'percent' | 'fixed'; value: number }> = {
  'SAVE10':  { label: 'Coupon SAVE10',  kind: 'percent', value: 10 },
  'FLAT20':  { label: 'Coupon FLAT20',  kind: 'fixed',   value: 20 },
  'WELCOME': { label: 'Coupon WELCOME', kind: 'percent', value: 15 },
  'VIP50':   { label: 'Coupon VIP50',   kind: 'percent', value: 50 },
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible: boolean;
  onClose: () => void;
  onApply: (discount: OrderDiscount) => void;
}

type Status = 'idle' | 'error' | 'success';

// ─── Component ────────────────────────────────────────────────────────────────
export default function CouponDialog({ visible, onClose, onApply }: Props) {
  const [code, setCode]     = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [matched, setMatched] = useState<(typeof VALID_COUPONS)[string] | null>(null);
  const inputRef = useRef<TextInput>(null);
  const shakeX   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setCode('');
      setStatus('idle');
      setMatched(null);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [visible]);

  function shake() {
    Animated.sequence([
      Animated.timing(shakeX, { toValue: -8,  duration: 50,  useNativeDriver: true }),
      Animated.timing(shakeX, { toValue:  8,  duration: 50,  useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -6,  duration: 50,  useNativeDriver: true }),
      Animated.timing(shakeX, { toValue:  6,  duration: 50,  useNativeDriver: true }),
      Animated.timing(shakeX, { toValue:  0,  duration: 50,  useNativeDriver: true }),
    ]).start();
  }

  function handleApply() {
    const upper = code.trim().toUpperCase();
    const coupon = VALID_COUPONS[upper];
    if (coupon) {
      setMatched(coupon);
      setStatus('success');
    } else {
      setStatus('error');
      shake();
    }
  }

  function handleConfirm() {
    if (matched) {
      onApply({ label: matched.label, kind: matched.kind, value: matched.value });
      onClose();
    }
  }

  function handleClose() {
    onClose();
  }

  const discountLine =
    matched?.kind === 'percent'
      ? `${matched.value}% off your entire order`
      : `SAR ${matched?.value?.toFixed(2)} off your entire order`;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>

      <View style={s.center} pointerEvents="box-none">
        <Animated.View style={[s.card, { transform: [{ translateX: shakeX }] }]}>

          {/* ── Header ── */}
          <View style={s.header}>
            <TouchableOpacity style={s.headerSide} onPress={handleClose} activeOpacity={0.7}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <View style={s.headerCenter}>
              <Text style={s.headerTitle}>Coupon</Text>
            </View>
            <TouchableOpacity
              style={s.headerSide}
              onPress={status === 'success' ? handleConfirm : handleApply}
              activeOpacity={0.7}
            >
              <Text style={[s.applyText, status === 'success' && s.applyTextSuccess]}>
                {status === 'success' ? 'Done' : 'Apply'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Input area ── */}
          <View style={s.inputArea}>
            {status === 'success' ? (
              /* Success state */
              <View style={s.successWrap}>
                <View style={s.successIconWrap}>
                  <Text style={s.successIcon}>✓</Text>
                </View>
                <Text style={s.successCode}>{code.trim().toUpperCase()}</Text>
                <Text style={s.successDesc}>{discountLine}</Text>
              </View>
            ) : (
              /* Input state */
              <View style={[s.inputWrap, status === 'error' && s.inputWrapError]}>
                <Text style={s.inputPrefix}>🏷</Text>
                <TextInput
                  ref={inputRef}
                  style={s.input}
                  value={code}
                  onChangeText={t => { setCode(t); setStatus('idle'); }}
                  placeholder="Enter coupon code"
                  placeholderTextColor={Colors.placeholder}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleApply}
                />
                {code.length > 0 && (
                  <TouchableOpacity style={s.clearBtn} onPress={() => { setCode(''); setStatus('idle'); }} activeOpacity={0.7}>
                    <Text style={s.clearText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Error message */}
            {status === 'error' && (
              <View style={s.errorBanner}>
                <Text style={s.errorIcon}>⚠</Text>
                <Text style={s.errorText}>Coupon not found. Please check the code and try again.</Text>
              </View>
            )}
          </View>

          {/* ── Hint ── */}
          {status === 'idle' && (
            <View style={s.hintRow}>
              <Text style={s.hintText}>Enter the coupon code exactly as provided.</Text>
            </View>
          )}

        </Animated.View>
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
  card: {
    width: 400,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
    backgroundColor: Colors.white,
  },
  headerSide: {
    width: 72,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.2,
  },
  applyText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.2,
    textAlign: 'right',
  },
  applyTextSuccess: {
    color: Colors.green,
  },

  // ── Input area ──
  inputArea: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 12,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grayLight,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: 16,
    height: 60,
    gap: 10,
  },
  inputWrapError: {
    borderColor: Colors.red,
    backgroundColor: '#FEF2F2',
  },
  inputPrefix: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    fontSize: 22,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: 1,
    outlineWidth: 0,
    outlineStyle: 'none',
  } as any,
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.grayMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },

  // ── Error banner ──
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorIcon: {
    fontSize: 14,
    color: Colors.red,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: Colors.red,
    letterSpacing: -0.1,
  },

  // ── Success state ──
  successWrap: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  successIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  successIcon: {
    fontSize: 26,
    color: Colors.white,
    fontWeight: '700',
  },
  successCode: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 2,
  },
  successDesc: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.1,
  },

  // ── Hint row ──
  hintRow: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  hintText: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.placeholder,
    textAlign: 'center',
    letterSpacing: -0.1,
  },
});
