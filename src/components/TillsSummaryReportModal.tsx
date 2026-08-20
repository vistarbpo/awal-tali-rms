import React from 'react';
import RootModal from './RootModal';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { iconSarDark } from '../assets/icons';
import { useI18n } from '../i18n';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TillRow {
  label:  string;
  amount: number | string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function FmtAmt({ val, bold }: { val: number | string; bold?: boolean }) {
  if (typeof val === 'number') {
    return (
      <View style={r.sarAmtWrap}>
        <Text style={[r.sarAmtText, bold && r.rowBold]}>{val.toFixed(2)}</Text>
        <Image source={iconSarDark} style={r.sarAmtIcon} />
      </View>
    );
  }
  return <Text style={[r.rowAmount, bold && r.rowBold]}>{String(val)}</Text>;
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function Divider() {
  return <View style={r.divider} />;
}

function SectionTitle({ title }: { title: string }) {
  return (
    <View style={r.sectionTitleWrap}>
      <Text style={r.sectionTitleText}>{title}</Text>
    </View>
  );
}

function Row({ label, amount, bold, rtl }: TillRow & { bold?: boolean; rtl?: boolean }) {
  return (
    <View style={[r.row, rtl && r.rowRtl]}>
      <Text style={[r.rowLabel, rtl && r.rowLabelRtl, bold && r.rowBold]}>{label}</Text>
      <FmtAmt val={amount} bold={bold} />
    </View>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible:    boolean;
  onClose:    () => void;
  dateLabel:  string;
  printedAt:  string;
}

// ─── Till data constants ──────────────────────────────────────────────────────
const CASH         = 1840.00;
const MADA         = 1260.37;
const TOTAL_PAY    = CASH + MADA;          // 3100.37
const PAY_IN       = 0;
const PAY_OUT      = 150.00;
const CASH_DROPS   = 0;
const OPENING      = 500.00;
const CLOSING      = 2490.00;
// Estimated = Opening + Cash + Pay In - Pay Out - Cash Drops
const ESTIMATED    = OPENING + CASH + PAY_IN - PAY_OUT - CASH_DROPS;  // 2190.00
const DIFF         = CLOSING - ESTIMATED;  // positive → surplus, negative → shortage

// ─── Component ────────────────────────────────────────────────────────────────
export default function TillsSummaryReportModal({ visible, onClose, dateLabel, printedAt }: Props) {
  const { t, af, isRTL } = useI18n();
  const surplusLabel   = DIFF > 0 ? t('tillSurplus') : t('tillShortage');
  const surplusAmount  = Math.abs(DIFF);

  return (
    <RootModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={r.backdrop} />

      <View style={r.center} pointerEvents="box-none">
        <View style={r.card}>

          {/* ── Header bar ── */}
          <View style={[r.headerBar, isRTL && r.headerBarRtl]}>
            <TouchableOpacity onPress={onClose} style={r.doneBtn} activeOpacity={0.7}>
              <Text style={[r.doneText, { fontFamily: af('semibold') }]}>{t('done')}</Text>
            </TouchableOpacity>
            <Text style={[r.headerTitle, { fontFamily: af('bold') }]}>{t('tillsSummary')}</Text>
            <TouchableOpacity style={r.printBtn} activeOpacity={0.7}>
              <Text style={[r.printText, { fontFamily: af('semibold') }]}>{t('print')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={r.scroll}
            contentContainerStyle={r.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Report meta ── */}
            <View style={r.metaBlock}>
              <Text style={r.metaLine}>اول و تالي - فرع الشوقية</Text>
              <Text style={r.metaLine}>B01</Text>
              <Text style={r.metaLine}>{t('tillCloseReport')}</Text>
              <Text style={r.metaLine}>
                {t('tillBizDate')} {dateLabel}
              </Text>
              <Text style={r.metaLine}>
                {t('tillPrintedAt')} {printedAt}
              </Text>
            </View>

            <Divider />

            {/* ── Till info ── */}
            <View style={r.tillInfo}>
              <Text style={r.infoLine}>
                {t('tillUser')} Sara
              </Text>
              <Text style={r.infoLine}>
                {t('tillOpenedAt')} {dateLabel} 09:00 AM
              </Text>
              <Text style={r.infoLine}>
                {t('tillClosedAt')} {dateLabel} 11:59 PM
              </Text>
            </View>

            <Divider />

            {/* ── Payments ── */}
            <SectionTitle title={t('tillPaySection')} />
            <Row rtl={isRTL} label={t('tillPayHouseAcct')}    amount={0} />
            <Row rtl={isRTL} label={t('tillPaySoloVisa')}        amount={0} />
            <Row rtl={isRTL} label={t('tillPaySoloApple')}   amount={0} />
            <Row rtl={isRTL} label={t('tillPayCash')}             amount={CASH} />
            <Row rtl={isRTL} label={t('tillPayGift')}        amount={0} />
            <Row rtl={isRTL} label={t('tillPayMada')}             amount={MADA} />
            <Row rtl={isRTL} label={t('tillPaySoloMc')}  amount={0} />
            <Row rtl={isRTL} label={t('tillPayTotal')}   amount={TOTAL_PAY} bold />
            <Row rtl={isRTL} label={t('tillPayReturns')}    amount={0} />
            <Row rtl={isRTL} label={t('tillPayNet')}     amount={TOTAL_PAY} bold />

            <Divider />

            {/* ── Drawer Operations ── */}
            <SectionTitle title={t('tillDrawerSection')} />
            <Row rtl={isRTL} label={t('tillDrawerPayIn')}               amount={PAY_IN} />
            <Row rtl={isRTL} label={t('tillDrawerPayOut')}              amount={PAY_OUT} />
            <Row rtl={isRTL} label={t('tillDrawerDrops')}           amount={CASH_DROPS} />
            <Row rtl={isRTL} label={t('tillDrawerPayOps')}   amount={CASH} />
            <Row rtl={isRTL} label={t('tillDrawerRetOps')}    amount={0} />
            <Row rtl={isRTL} label={t('tillDrawerOpenCount')}      amount={0} />

            <Divider />

            {/* ── Cash summary ── */}
            <Row rtl={isRTL} label={t('tillOpenAmt')}              amount={OPENING} />
            <Row rtl={isRTL} label={t('tillCloseAmt')}              amount={CLOSING} />
            <Row rtl={isRTL} label={t('tillEstCash')}  amount={ESTIMATED} />
            <Row rtl={isRTL} label={surplusLabel}                 amount={surplusAmount} bold />

            <Divider />

            <Text style={r.endOfReport}>{t('tillEndReport')}</Text>

          </ScrollView>
        </View>
      </View>
    </RootModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_W = 380;

const r = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.50)',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: CARD_W,
    maxHeight: '90%',
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 24,
    elevation: 14,
  },

  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
    backgroundColor: Colors.grayLight,
  },
  headerBarRtl: {
    flexDirection: 'row-reverse',
  },
  doneBtn: { width: 48 },
  doneText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: Colors.black,
  },
  printBtn: { width: 48, alignItems: 'flex-end' },
  printText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.black,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  metaBlock: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 2,
  },
  metaLine: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.black,
    textAlign: 'center',
    lineHeight: 22,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.black,
    opacity: 0.18,
    marginHorizontal: 14,
    marginVertical: 4,
  },

  tillInfo: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 3,
    alignItems: 'center',
  },
  infoLine: {
    fontSize: 13,
    color: Colors.black,
    textAlign: 'center',
  },

  sectionTitleWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  sectionTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.black,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  rowLabel: {
    fontSize: 13,
    color: Colors.black,
    fontWeight: '400',
    flex: 1,
    minWidth: 0,
    paddingEnd: 4,
  },
  rowLabelRtl: {
    textAlign: 'right',
  },
  sarAmtWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 5,
    flexShrink: 0,
    direction: 'ltr',
  },
  sarAmtIcon: { width: 11, height: 12, resizeMode: 'contain' },
  sarAmtText: { fontSize: 13, color: Colors.black },
  rowAmount: {
    fontSize: 13,
    color: Colors.black,
    fontWeight: '400',
    textAlign: 'right',
    minWidth: 90,
    flexShrink: 0,
  },
  rowBold: {
    fontWeight: '700',
  },

  endOfReport: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: Colors.black,
    paddingVertical: 20,
    letterSpacing: 0.5,
  },
});
