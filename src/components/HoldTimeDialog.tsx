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

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible:       boolean;
  itemName:      string;
  onClose:       () => void;
  onConfirm:     (minutes: number) => void;
  onFireLater?:  () => void;  // hold indefinitely — no countdown timer
}

const PRESETS = [5, 10, 15, 20, 30, 45];

const NUMPAD: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['C', '0', '⌫'],
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function HoldTimeDialog({ visible, itemName, onClose, onConfirm, onFireLater }: Props) {
  const { t, af, isRTL } = useI18n();
  const [customMode,  setCustomMode]  = useState(false);
  const [customInput, setCustomInput] = useState('');

  useEffect(() => {
    if (visible) { setCustomMode(false); setCustomInput(''); }
  }, [visible]);

  function handleNumKey(key: string) {
    if (key === 'C') {
      setCustomInput('');
    } else if (key === '⌫') {
      setCustomInput(prev => prev.slice(0, -1));
    } else {
      setCustomInput(prev => {
        const next = prev === '0' ? key : prev + key;
        return Number(next) > 999 ? prev : next;
      });
    }
  }

  function handleCustomConfirm() {
    const min = parseInt(customInput, 10);
    if (min > 0) { onConfirm(min); onClose(); }
  }

  const customMinutes = parseInt(customInput, 10);
  const customValid   = customMinutes > 0;

  const cardJSX = (
    <View style={s.card}>

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={[s.headerLabel, { fontFamily: af('bold') }]}>{t('holdTimeTitle').toUpperCase()}</Text>
          <Text style={[s.headerItem, { fontFamily: af('medium') }]} numberOfLines={1}>{itemName}</Text>
        </View>

        {/* Custom input box — amber border, tappable */}
        <TouchableOpacity
          style={[s.customBox, customMode && s.customBoxActive]}
          onPress={() => setCustomMode(true)}
          activeOpacity={0.75}
        >
          {customMode && customInput ? (
            <>
              <Text style={s.customBoxValue}>{customInput}</Text>
              <Text style={s.customBoxUnit}>min</Text>
            </>
          ) : (
            <Text style={[s.customBoxPlaceholder, { fontFamily: af('semibold') }]}>Custom</Text>
          )}
        </TouchableOpacity>
      </View>

      {customMode ? (
        /* ── Numpad view ── */
        <>
          {/* Display */}
          <View style={s.numDisplay}>
            <Text style={[s.numDisplayValue, { fontFamily: af('bold') }]}>
              {customInput || '0'}
            </Text>
            <Text style={[s.numDisplayUnit, { fontFamily: af('medium') }]}>min</Text>
          </View>

          <View style={s.numpadWrap}>
            {NUMPAD.map((row, ri) => (
              <View key={ri} style={s.numRow}>
                {row.map(key => {
                  const isAction = key === 'C' || key === '⌫';
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[s.numKey, isAction && s.numKeyAction]}
                      onPress={() => handleNumKey(key)}
                      activeOpacity={0.6}
                    >
                      <Text style={[s.numKeyText, isAction && s.numKeyActionText]}>
                        {key}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            {/* Footer */}
            <View style={s.numFooter}>
              <TouchableOpacity
                style={s.numBackBtn}
                onPress={() => { setCustomMode(false); setCustomInput(''); }}
                activeOpacity={0.85}
              >
                <Text style={[s.numFooterText, { fontFamily: af('bold') }]}>{t('back')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.numConfirmBtn, !customValid && s.numConfirmBtnDisabled]}
                onPress={handleCustomConfirm}
                activeOpacity={0.85}
                disabled={!customValid}
              >
                <Text style={[s.numFooterText, { fontFamily: af('bold') }]}>{t('confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : (
        /* ── Presets grid ── */
        <>
          <View style={s.grid}>
            {PRESETS.map(min => (
              <TouchableOpacity
                key={min}
                style={s.timeBtn}
                onPress={() => { onConfirm(min); onClose(); }}
                activeOpacity={0.75}
              >
                <Text style={[s.timeBtnValue, { fontFamily: af('bold') }]}>{min}</Text>
                <Text style={[s.timeBtnUnit, { fontFamily: af('medium') }]}>min</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.footerRow}>
            {onFireLater && (
              <TouchableOpacity
                style={s.fireLaterBtn}
                onPress={() => { onFireLater(); onClose(); }}
                activeOpacity={0.85}
              >
                <Text style={[s.fireLaterText, { fontFamily: af('bold') }]}>Fire Later</Text>

              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[s.cancelBtn, !!onFireLater && s.cancelBtnSmall]}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={[s.cancelText, { fontFamily: af('bold') }]}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

    </View>
  );

  if (Platform.OS === 'web') {
    if (!visible) return null;
    return (
      <View style={s.inlineOverlay}>
        {cardJSX}
      </View>
    );
  }

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
        {cardJSX}
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const BTN_SIZE = 88;
const KEY_W    = 84;
const KEY_H    = 64;
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
  inlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  card: {
    width: BTN_SIZE * 3 + 16 * 4,
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 14,
    gap: 12,
  },
  headerLeft: {
    flex: 1,
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

  // Custom box (top right)
  customBox: {
    width: 96,
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245,158,11,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customBoxActive: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245,158,11,0.10)',
  },
  customBoxValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#B45309',
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  customBoxUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B45309',
    letterSpacing: 0.2,
    lineHeight: 14,
  },
  customBoxPlaceholder: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F59E0B',
    letterSpacing: 0.1,
  },

  // Preset grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 10,
  },
  timeBtn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: 16,
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 1.5,
    borderColor: Colors.grayBorder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  timeBtnValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -1,
  },
  timeBtnUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: 0.2,
  },

  footerRow: {
    flexDirection: 'row',
    margin: 16,
    marginTop: 8,
    gap: 10,
  },
  fireLaterBtn: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 8,
    elevation: 4,
  },
  fireLaterText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
  cancelBtn: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnSmall: {},
  cancelText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },

  // Numpad display
  numDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 16,
    gap: 6,
  },
  numDisplayValue: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -2,
  },
  numDisplayUnit: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.grayText,
    marginBottom: 8,
  },

  // Numpad keys
  numpadWrap: {
    backgroundColor: Colors.backgroundAlt,
    padding: 16,
    gap: KEY_GAP,
    borderTopWidth: 1,
    borderTopColor: Colors.grayBorder,
  },
  numRow: {
    flexDirection: 'row',
    gap: KEY_GAP,
  },
  numKey: {
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
  numKeyAction: {
    backgroundColor: Colors.grayLight,
  },
  numKeyText: {
    fontSize: 24,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.5,
  },
  numKeyActionText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.grayText,
  },

  // Numpad footer
  numFooter: {
    flexDirection: 'row',
    gap: KEY_GAP,
    marginTop: 4,
  },
  numBackBtn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numConfirmBtn: {
    flex: 2,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  numConfirmBtnDisabled: {
    opacity: 0.4,
  },
  numFooterText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
});
