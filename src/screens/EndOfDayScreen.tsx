import React, { useState } from 'react';
import RootModal from '../components/RootModal';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TouchableWithoutFeedback, Image } from 'react-native';
import { Colors } from '../constants/colors';
import { iconSarGray, iconSarWhite } from '../assets/icons';
import { useI18n } from '../i18n';

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 'summary' | 'cash-count' | 'done';

interface Props {
  visible:   boolean;
  onClose:   () => void;
  onEndDay?: () => void;
}

// ─── Mock day data ─────────────────────────────────────────────────────────────
const DAY_DATA = {
  date:          'Saturday, 15 Mar 2026',
  openTime:      '9:00 AM',
  branch:        'Branch Shawqiyah – Makkah',
  totalOrders:   47,
  completed:     45,
  voided:        2,
  gross:         3842.50,
  discount:      192.13,
  netSales:      3650.37,
  tax:           476.13,
  cashSales:     1840.00,
  cardSales:     1810.37,
  openingFloat:  500.00,
};
const EXPECTED_CASH = DAY_DATA.openingFloat + DAY_DATA.cashSales; // 2340.00

// ─── Numpad ───────────────────────────────────────────────────────────────────
const NUMPAD: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['C', '0', '.'],
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionHeader({ title, rtl }: { title: string; rtl: boolean }) {
  return (
    <View style={[s.sectionHeader, rtl && s.sectionHeaderRtl]}>
      <Text style={[s.sectionTitle, rtl && s.sectionTitleRtl]}>{title}</Text>
    </View>
  );
}

function Row({
  label,
  value,
  sub,
  valueColor,
  rtl,
}: {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
  rtl: boolean;
}) {
  return (
    <View style={[s.row, rtl && s.rowRtl]}>
      <View style={s.rowLeft}>
        <Text style={[s.rowLabel, rtl && s.rowLabelRtl]} numberOfLines={2}>
          {label}
        </Text>
        {sub ? <Text style={[s.rowSub, rtl && s.rowSubRtl]}>{sub}</Text> : null}
      </View>
      <Text
        style={[s.rowValueCell, rtl && s.rowValueCellRtl, valueColor ? { color: valueColor } : undefined]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

function Hairline() {
  return <View style={s.hairline} />;
}

function SarRow({
  label,
  amount,
  bold,
  green,
  red,
  rtl,
}: {
  label: string;
  amount: number;
  bold?: boolean;
  green?: boolean;
  red?: boolean;
  rtl: boolean;
}) {
  const color = green ? Colors.green : red ? Colors.red : Colors.grayText;
  return (
    <View style={[s.row, rtl && s.rowRtl]}>
      <Text style={[s.rowLabel, bold && s.rowLabelBold, rtl && s.rowLabelRtl, s.sarRowLabel]} numberOfLines={2}>
        {label}
      </Text>
      <View style={s.sarRow}>
        <Text style={[s.sarAmountText, bold && s.rowValueBold, { color }]}>
          {red ? '−' : ''}
          {fmt(amount)}
        </Text>
        <Image source={iconSarGray} style={s.sarIcon} />
      </View>
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function EndOfDayScreen({ visible, onClose, onEndDay }: Props) {
  const { t, af, isRTL } = useI18n();
  const [step,        setStep]        = useState<Step>('summary');
  const [cashInput,   setCashInput]   = useState('');

  function reset() {
    setStep('summary');
    setCashInput('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleNumKey(key: string) {
    if (key === 'C') {
      setCashInput(prev => prev.slice(0, -1));
    } else if (key === '.') {
      if (!cashInput.includes('.')) setCashInput(prev => prev + '.');
    } else {
      const next = cashInput + key;
      const parts = next.split('.');
      if (parts[0].length <= 8 && (!parts[1] || parts[1].length <= 2)) {
        setCashInput(next);
      }
    }
  }

  const cashEntered   = parseFloat(cashInput) || 0;
  const cashDiff      = cashEntered - EXPECTED_CASH;
  const diffColor     = Math.abs(cashDiff) < 0.01 ? Colors.green : cashDiff > 0 ? Colors.green : Colors.red;
  const diffLabel     = cashDiff >= 0 ? `+ ${fmt(Math.abs(cashDiff))}` : `− ${fmt(Math.abs(cashDiff))}`;

  // ── Summary step ────────────────────────────────────────────────────────────
  if (step === 'summary') {
    return (
      <RootModal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={handleClose}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={s.backdrop} />
        </TouchableWithoutFeedback>

        <View style={s.center} pointerEvents="box-none">
          <View style={[s.card, isRTL && s.cardRtl]}>

            <View style={s.header}>
              <TouchableOpacity onPress={handleClose} activeOpacity={0.7} style={s.headerSide}>
                <Text style={[s.headerClose, { fontFamily: af() }]}>{t('close')}</Text>
              </TouchableOpacity>
              <Text style={[s.headerTitle, { fontFamily: af('semibold') }]}>{t('endOfDayTitle')}</Text>
              <View style={s.headerSide}>
                <Text style={[s.headerDate, isRTL && s.headerDateRtl]}>{DAY_DATA.date}</Text>
              </View>
            </View>

            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
              <View style={isRTL ? s.scrollRtl : undefined}>

              <SectionHeader title={t('eodSectionBusiness')} rtl={isRTL} />
              <View style={s.group}>
                <Row rtl={isRTL} label={t('eodBranch')}     value={DAY_DATA.branch} />
                <Hairline />
                <Row rtl={isRTL} label={t('eodOpenedAt')}  value={DAY_DATA.openTime} />
                <Hairline />
                <Row rtl={isRTL} label={t('eodDate')}       value={DAY_DATA.date} />
              </View>

              <SectionHeader title={t('eodSectionOrders')} rtl={isRTL} />
              <View style={s.group}>
                <Row rtl={isRTL} label={t('eodTotalOrders')}  value={String(DAY_DATA.totalOrders)} />
                <Hairline />
                <Row rtl={isRTL} label={t('eodCompleted')}     value={String(DAY_DATA.completed)} valueColor={Colors.green} />
                <Hairline />
                <Row rtl={isRTL} label={t('eodVoided')}        value={String(DAY_DATA.voided)}    valueColor={Colors.red} />
              </View>

              <SectionHeader title={t('eodSectionSales')} rtl={isRTL} />
              <View style={s.group}>
                <SarRow rtl={isRTL} label={t('eodGrossSales')}   amount={DAY_DATA.gross} />
                <Hairline />
                <SarRow rtl={isRTL} label={t('eodDiscount')}      amount={DAY_DATA.discount} red />
                <Hairline />
                <SarRow rtl={isRTL} label={t('eodNetSales')}     amount={DAY_DATA.netSales} bold />
                <Hairline />
                <SarRow rtl={isRTL} label={t('eodTaxIncl')}   amount={DAY_DATA.tax} />
              </View>

              <SectionHeader title={t('eodSectionPayMethods')} rtl={isRTL} />
              <View style={s.group}>
                <SarRow rtl={isRTL} label={t('eodCash')}   amount={DAY_DATA.cashSales} />
                <Hairline />
                <SarRow rtl={isRTL} label={t('eodCard')}   amount={DAY_DATA.cardSales} />
                <Hairline />
                <SarRow rtl={isRTL} label={t('eodTotal')}  amount={DAY_DATA.gross} bold />
              </View>

              <SectionHeader title={t('eodSectionDrawer')} rtl={isRTL} />
              <View style={s.group}>
                <SarRow rtl={isRTL} label={t('eodOpeningFloat')} amount={DAY_DATA.openingFloat} />
                <Hairline />
                <SarRow rtl={isRTL} label={t('eodCashSales')}    amount={DAY_DATA.cashSales} />
                <Hairline />
                <SarRow rtl={isRTL} label={t('eodExpectedCash')} amount={EXPECTED_CASH} bold green />
              </View>

              <View style={s.bottomPad} />
              </View>
            </ScrollView>

            <View style={s.ctaWrap}>
              <TouchableOpacity style={s.ctaBtn} onPress={() => setStep('cash-count')} activeOpacity={0.85}>
                <Text style={[s.ctaBtnText, { fontFamily: af('bold') }]}>{t('eodCountCloseCta')}</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </RootModal>
    );
  }

  // ── Cash count step ──────────────────────────────────────────────────────────
  if (step === 'cash-count') {
    return (
      <RootModal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={handleClose}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={s.backdrop} />
        </TouchableWithoutFeedback>

        <View style={s.center} pointerEvents="box-none">
          <View style={[s.card, s.cardNarrow, isRTL && s.cardRtl]}>

            <View style={s.header}>
              <TouchableOpacity onPress={() => setStep('summary')} activeOpacity={0.7} style={s.headerSide}>
                <Text style={[s.headerClose, { fontFamily: af() }]}>
                  {isRTL ? '› ' : '‹ '}
                  {t('back')}
                </Text>
              </TouchableOpacity>
              <Text style={[s.headerTitle, { fontFamily: af('semibold') }]}>{t('eodCountCashTitle')}</Text>
              <View style={s.headerSide} />
            </View>

            {/* Expected vs entered summary */}
            <View style={[s.cashSummary, isRTL && s.cashSummaryRtl]}>
              <View style={s.cashSummaryCol}>
                <Text style={[s.cashSummaryLabel, isRTL && s.cashSummaryLabelRtl]}>{t('eodExpected')}</Text>
                <View style={s.cashSummaryVal}>
                  <Text style={s.cashSummaryAmt}>{fmt(EXPECTED_CASH)}</Text>
                  <Image source={iconSarGray} style={s.sarIconSm} />
                </View>
              </View>
              <View style={s.cashSummaryDivider} />
              <View style={s.cashSummaryCol}>
                <Text style={[s.cashSummaryLabel, isRTL && s.cashSummaryLabelRtl]}>{t('eodDifference')}</Text>
                <Text style={[s.cashSummaryDiff, { color: diffColor }, isRTL && s.cashSummaryDiffRtl]}>
                  {cashInput ? diffLabel : '—'}
                </Text>
              </View>
            </View>

            {/* Amount display */}
            <View style={s.amountRow}>
              <Text style={s.amountValue} numberOfLines={1} adjustsFontSizeToFit>
                {cashInput || '0'}
              </Text>
              <Image source={iconSarGray} style={s.amountCurrency} />
            </View>

            <View style={s.divider} />

            {/* Numpad */}
            <View style={[s.numpad, s.numpadLtr]}>
              {NUMPAD.map((row, ri) => (
                <View key={ri} style={s.numRow}>
                  {row.map(key => {
                    const isAction = key === 'C' || key === '.';
                    return (
                      <TouchableOpacity
                        key={key}
                        style={[s.numKey, isAction && s.numKeyAction]}
                        onPress={() => handleNumKey(key)}
                        activeOpacity={0.6}
                      >
                        <Text style={[s.numKeyText, isAction && s.numKeyActionText]}>{key}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}

              <TouchableOpacity
                style={s.ctaBtn}
                onPress={() => setStep('done')}
                activeOpacity={0.85}
              >
                <Text style={[s.ctaBtnText, { fontFamily: af('bold') }]}>{t('endOfDayTitle')}</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </RootModal>
    );
  }

  // ── Done step ────────────────────────────────────────────────────────────────
  return (
    <RootModal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>

      <View style={s.center} pointerEvents="box-none">
        <View style={[s.card, s.cardNarrow, isRTL && s.cardRtl]}>

          <View style={s.doneWrap}>
            {/* Green circle tick */}
            <View style={s.doneCircle}>
              <View style={s.doneTick1} />
              <View style={s.doneTick2} />
            </View>

            <Text style={[s.doneTitle, { fontFamily: af('bold') }]}>{t('eodDoneTitle')}</Text>
            <Text style={s.doneDate}>{DAY_DATA.date}</Text>

            <View style={s.doneSummaryCard}>
              <View style={[s.doneSummaryRow, isRTL && s.doneSummaryRowRtl]}>
                <Text style={[s.doneSummaryLabel, isRTL && s.doneSummaryLabelRtl]}>{t('eodDoneNetSales')}</Text>
                <View style={s.sarRow}>
                  <Text style={s.doneSummaryVal}>{fmt(DAY_DATA.netSales)}</Text>
                  <Image source={iconSarGray} style={s.sarIcon} />
                </View>
              </View>
              <View style={s.doneSummaryDivider} />
              <View style={[s.doneSummaryRow, isRTL && s.doneSummaryRowRtl]}>
                <Text style={[s.doneSummaryLabel, isRTL && s.doneSummaryLabelRtl]}>{t('eodDoneOrders')}</Text>
                <Text style={[s.doneSummaryVal, s.doneSummaryValPlain]}>{DAY_DATA.completed}</Text>
              </View>
              <View style={s.doneSummaryDivider} />
              <View style={[s.doneSummaryRow, isRTL && s.doneSummaryRowRtl]}>
                <Text style={[s.doneSummaryLabel, isRTL && s.doneSummaryLabelRtl]}>{t('eodDoneCashActual')}</Text>
                <View style={s.sarRow}>
                  <Text style={s.doneSummaryVal}>{fmt(cashEntered)}</Text>
                  <Image source={iconSarGray} style={s.sarIcon} />
                </View>
              </View>
            </View>
          </View>

          <View style={s.ctaWrap}>
            <TouchableOpacity
              style={s.ctaBtn}
              onPress={() => { reset(); onEndDay?.(); onClose(); }}
              activeOpacity={0.85}
            >
              <Text style={[s.ctaBtnText, { fontFamily: af('bold') }]}>{t('eodStartNewDay')}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </RootModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const KEY_W   = 92;
const KEY_H   = 64;
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
    width: 620,
    maxHeight: 720,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.20,
    shadowRadius: 28,
    elevation: 16,
  },
  cardNarrow: {
    width: KEY_W * 3 + KEY_GAP * 2 + 48,
    maxHeight: 680,
  },
  cardRtl: {
    direction: 'rtl',
  },
  scrollRtl: {
    direction: 'rtl',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grayLight,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.grayBorder,
  },
  headerSide: {
    width: 90,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  headerClose: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  headerDate: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.1,
    textAlign: 'right',
  },
  headerDateRtl: {
    textAlign: 'left',
  },

  // Sections
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionHeaderRtl: {
    alignItems: 'flex-end',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.grayText,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  sectionTitleRtl: {
    textAlign: 'right',
  },
  group: {
    backgroundColor: Colors.white,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: Colors.grayBorder,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    minHeight: 52,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  rowLeft: { flex: 1, minWidth: 0 },
  rowLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.2,
  },
  rowLabelRtl: {
    textAlign: 'right',
  },
  rowLabelBold: {
    fontWeight: '600',
    color: Colors.primary,
  },
  rowSub: {
    fontSize: 12,
    color: Colors.grayText,
    marginTop: 2,
  },
  rowSubRtl: {
    textAlign: 'right',
  },
  sarRowLabel: {
    flex: 1,
    minWidth: 0,
  },
  rowValueCell: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.2,
    textAlign: 'right',
    flexShrink: 0,
    flexGrow: 0,
    maxWidth: '52%',
  },
  rowValueCellRtl: {
    textAlign: 'left',
  },
  sarAmountText: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.2,
    textAlign: 'right',
  },
  rowValueBold: {
    fontWeight: '600',
    color: Colors.primary,
  },
  hairline: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.18)',
    marginStart: 20,
  },
  sarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    direction: 'ltr',
  },
  sarIcon: {
    width: 11,
    height: 13,
    resizeMode: 'contain',
    opacity: 0.55,
  },
  sarIconSm: {
    width: 10,
    height: 12,
    resizeMode: 'contain',
    opacity: 0.55,
  },

  // CTA
  ctaWrap: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: Colors.backgroundAlt,
    borderTopWidth: 0.5,
    borderTopColor: Colors.grayBorder,
  },
  ctaBtn: {
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
  ctaBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },

  bottomPad: { height: 8 },

  // Cash count
  cashSummary: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  cashSummaryRtl: {
    flexDirection: 'row-reverse',
  },
  cashSummaryCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  cashSummaryDivider: {
    width: 1,
    backgroundColor: Colors.grayBorder,
    marginVertical: 12,
  },
  cashSummaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.grayText,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cashSummaryLabelRtl: {
    textAlign: 'center',
  },
  cashSummaryVal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    direction: 'ltr',
  },
  cashSummaryAmt: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.5,
  },
  cashSummaryDiff: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  cashSummaryDiffRtl: {
    writingDirection: 'ltr',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 8,
    backgroundColor: Colors.white,
    direction: 'ltr',
  },
  amountCurrency: {
    width: 22,
    height: 24,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 46,
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
    padding: 16,
    gap: KEY_GAP,
    backgroundColor: Colors.backgroundAlt,
  },
  numpadLtr: {
    direction: 'ltr',
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

  // Done
  doneWrap: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    gap: 12,
  },
  doneCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  // Checkmark built from two View rectangles
  doneTick1: {
    position: 'absolute',
    width: 3,
    height: 14,
    backgroundColor: Colors.white,
    borderRadius: 2,
    transform: [{ rotate: '-45deg' }, { translateX: -6 }, { translateY: 2 }],
  },
  doneTick2: {
    position: 'absolute',
    width: 3,
    height: 24,
    backgroundColor: Colors.white,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }, { translateX: 6 }, { translateY: -4 }],
  },
  doneTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  doneDate: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.1,
    textAlign: 'center',
    marginBottom: 8,
  },
  doneSummaryCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    overflow: 'hidden',
    marginTop: 8,
  },
  doneSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  doneSummaryRowRtl: {
    flexDirection: 'row-reverse',
  },
  doneSummaryDivider: {
    height: 0.5,
    backgroundColor: Colors.grayBorder,
    marginStart: 20,
  },
  doneSummaryLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.2,
    flex: 1,
    minWidth: 0,
  },
  doneSummaryLabelRtl: {
    textAlign: 'right',
  },
  doneSummaryVal: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.2,
  },
  doneSummaryValPlain: {
    flexShrink: 0,
    writingDirection: 'ltr',
  },
});
