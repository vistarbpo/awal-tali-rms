import React, { useState, useEffect, useRef } from 'react';
import RootModal from '../components/RootModal';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible:            boolean;
  onClose:            () => void;
  isTillOpen:         boolean;
  isClockedIn:        boolean;
  ordersPendingSync?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function todayFormatted(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

function lastSyncFormatted(): string {
  const d = new Date(Date.now() - 7 * 60 * 1000);
  const day  = String(d.getDate()).padStart(2,'0');
  const mon  = String(d.getMonth()+1).padStart(2,'0');
  const yr   = d.getFullYear();
  const h    = d.getHours();
  const m    = String(d.getMinutes()).padStart(2,'0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${day}/${mon}/${yr} ${h % 12 || 12}:${m} ${ampm}`;
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
  valueStyle,
  rtl,
  valueLtr,
}: {
  label: string;
  value: string;
  valueStyle?: object;
  rtl: boolean;
  valueLtr?: boolean;
}) {
  return (
    <View style={[s.row, rtl && s.rowRtl]}>
      <Text style={[s.rowLabel, rtl && s.rowLabelRtl]} numberOfLines={2}>
        {label}
      </Text>
      <Text
        style={[
          s.rowValue,
          rtl && s.rowValueRtl,
          valueLtr && s.rowValueLtr,
          valueStyle,
        ]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

function ActionRow({ label, onPress, rtl }: { label: string; onPress?: () => void; rtl: boolean }) {
  return (
    <TouchableOpacity style={[s.row, rtl && s.rowRtl]} activeOpacity={0.7} onPress={onPress}>
      <Text style={[s.rowLabelPrimary, rtl && s.rowLabelPrimaryRtl]}>{label}</Text>
    </TouchableOpacity>
  );
}

function ChevronRow({
  label,
  value,
  onPress,
  rtl,
}: {
  label: string;
  value: string;
  onPress?: () => void;
  rtl: boolean;
}) {
  const { isRTL } = useI18n();
  return (
    <TouchableOpacity style={[s.row, rtl && s.rowRtl]} activeOpacity={0.7} onPress={onPress}>
      <Text style={[s.rowLabelPrimary, rtl && s.rowLabelPrimaryRtl]}>{label}</Text>
      <View style={[s.rowRight, rtl && s.rowRightRtl]}>
        <Text style={[s.rowValue, s.rowValueLtr]}>{value}</Text>
        <Text style={s.chevron}>{isRTL ? '‹' : '›'}</Text>
      </View>
    </TouchableOpacity>
  );
}

function Hairline() {
  return <View style={s.hairline} />;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DiagnosticsScreen({
  visible,
  onClose,
  isTillOpen,
  isClockedIn,
  ordersPendingSync = 0,
}: Props) {
  const { t, af, isRTL } = useI18n();
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);

  const spinA = useRef(new Animated.Value(0)).current;
  const spinB = useRef(new Animated.Value(0)).current;
  const spinLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (sending) {
      spinA.setValue(0);
      spinB.setValue(0);
      spinLoopRef.current = Animated.loop(
        Animated.parallel([
          Animated.timing(spinA, { toValue: 1, duration: 900,  useNativeDriver: true, isInteraction: false }),
          Animated.timing(spinB, { toValue: 1, duration: 1400, useNativeDriver: true, isInteraction: false }),
        ])
      );
      spinLoopRef.current.start();
    } else {
      spinLoopRef.current?.stop();
    }
    return () => spinLoopRef.current?.stop();
  }, [sending]);

  function handleSend() {
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 2400);
    setTimeout(() => setSent(false), 4200);
  }

  const rotateA = spinA.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotateB = spinB.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });

  const pendingSyncStyle = ordersPendingSync > 0
    ? s.rowValueWarning
    : s.rowValueGreen;

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
        <View style={[s.card, isRTL && s.cardRtl]}>

          {/* ── Header ── */}
          <View style={[s.header, isRTL && s.headerRtl]}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={s.headerSide}>
              <Text style={[s.headerClose, { fontFamily: af() }]}>{t('close')}</Text>
            </TouchableOpacity>
            <Text style={[s.headerTitle, { fontFamily: af('semibold') }]}>{t('diagTitle')}</Text>
            <TouchableOpacity onPress={handleSend} activeOpacity={0.7} style={s.headerSide} disabled={sending}>
              <Text style={[s.headerSend, isRTL && s.headerSendRtl, sent && s.headerSendDone]}>
                {sending ? t('diagSending') : sent ? t('diagSent') : t('diagSend')}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <View style={isRTL ? s.scrollRtl : undefined}>

            {/* ── General ── */}
            <SectionHeader title={t('diagSectionGeneral')} rtl={isRTL} />
            <View style={s.group}>
              <ActionRow rtl={isRTL} label={t('diagSettings')} />
              <Hairline />
              <Row rtl={isRTL} label={t('diagName')} value={t('branchManager')} valueLtr />
              <Hairline />
              <Row
                rtl={isRTL}
                label={t('diagShiftStatus')}
                value={isClockedIn ? t('diagClockedIn') : t('diagClockedOut')}
                valueStyle={isClockedIn ? s.rowValueGreen : undefined}
              />
              <Hairline />
              <Row
                rtl={isRTL}
                label={t('diagTillStatus')}
                value={isTillOpen ? t('diagTillOpened') : t('diagTillClosed')}
                valueStyle={isTillOpen ? s.rowValueGreen : undefined}
              />
              <Hairline />
              <Row rtl={isRTL} label={t('diagBusinessDay')} value={todayFormatted()} valueLtr />
              <Hairline />
              <ChevronRow rtl={isRTL} label={t('diagClockedInUsers')} value="1" />
            </View>

            {/* ── Sync ── */}
            <SectionHeader title={t('diagSectionSync')} rtl={isRTL} />
            <View style={s.group}>
              <Row rtl={isRTL} label={t('diagLastSynced')} value={lastSyncFormatted()} valueLtr />
              <Hairline />
              <View style={[s.row, isRTL && s.rowRtl]}>
                <Text style={[s.rowLabel, isRTL && s.rowLabelRtl]}>{t('diagOrdersPending')}</Text>
                <Text style={[s.rowValue, isRTL && s.rowValueRtl, s.rowValueLtr, pendingSyncStyle]}>
                  {ordersPendingSync}
                </Text>
              </View>
              <Hairline />
              <ActionRow rtl={isRTL} label={t('diagCleaningDb')} />
              <Hairline />
              <ActionRow rtl={isRTL} label={t('diagRemoveDupes')} />
            </View>

            {/* ── Diagnostics ── */}
            <SectionHeader title={t('diagSectionDiag')} rtl={isRTL} />
            <View style={s.group}>
              <Row
                rtl={isRTL}
                label={t('diagInternet')}
                value={t('diagConnected')}
                valueStyle={s.rowValueGreen}
              />
              <Hairline />
              <Row rtl={isRTL} label={t('diagIpAddress')} value="192.168.2.209" valueLtr />
              <Hairline />
              <Row rtl={isRTL} label={t('diagAccountNum')} value="302641" valueLtr />
              <Hairline />
              <Row rtl={isRTL} label={t('diagBusinessName')} value="اول و تالي" />
              <Hairline />
              <Row rtl={isRTL} label={t('diagBranchName')} value="Branch Shawqiyah -Makkah (B02)" valueLtr />
              <Hairline />
              <Row rtl={isRTL} label={t('diagDeviceName')} value="Cashier Test (B02C02)" valueLtr />
              <Hairline />
              <Row rtl={isRTL} label={t('diagAppVersion')} value="5.0.131 (11336)" valueLtr />
              <Hairline />
              <Row rtl={isRTL} label={t('diagSystemVersion')} value="iOS 17.6.1" valueLtr />
            </View>

            <View style={s.bottomPad} />
            </View>
          </ScrollView>

          {/* ── Sending overlay ── */}
          {sending && (
            <View style={s.spinnerOverlay} pointerEvents="none">
              {/* Outer ring — clockwise */}
              <Animated.View style={[s.ring, s.ringOuter, { transform: [{ rotate: rotateA }] }]} />
              {/* Inner ring — counter-clockwise */}
              <Animated.View style={[s.ring, s.ringInner, { transform: [{ rotate: rotateB }] }]} />
            </View>
          )}

        </View>
      </View>
    </RootModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 660,
    maxHeight: 700,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.20,
    shadowRadius: 28,
    elevation: 16,
  },
  cardRtl: {
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
  headerRtl: {
    flexDirection: 'row-reverse',
  },
  headerSide: { width: 80 },
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
  headerSend: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.2,
    textAlign: 'right',
  },
  headerSendRtl: {
    textAlign: 'left',
  },
  headerSendDone: {
    color: Colors.green,
  },

  scrollRtl: {
    direction: 'rtl',
  },

  // Section headers
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
  },
  sectionTitleRtl: {
    textAlign: 'right',
  },

  // Groups (white cards)
  group: {
    backgroundColor: Colors.white,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: Colors.grayBorder,
  },

  // Rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 52,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.2,
    flex: 1,
    minWidth: 0,
  },
  rowLabelRtl: {
    textAlign: 'right',
  },
  rowLabelPrimary: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.primary,
    letterSpacing: -0.2,
    flex: 1,
    minWidth: 0,
  },
  rowLabelPrimaryRtl: {
    textAlign: 'right',
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.2,
    flexShrink: 0,
    maxWidth: '48%',
    textAlign: 'right',
  },
  rowValueRtl: {
    textAlign: 'left',
  },
  rowValueLtr: {
    writingDirection: 'ltr',
  },
  rowValueGreen:   { color: Colors.green,  fontWeight: '500' },
  rowValueWarning: { color: '#F59E0B',     fontWeight: '600' },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  rowRightRtl: {
    flexDirection: 'row-reverse',
  },
  chevron: {
    fontSize: 18,
    color: Colors.grayMid,
    marginStart: 2,
  },

  // Divider
  hairline: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.18)',
    marginStart: 20,
  },

  bottomPad: { height: 28 },

  // Spinner overlay
  spinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.80)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderStyle: 'solid',
  },
  ringOuter: {
    width: 96,
    height: 96,
    borderWidth: 5,
    borderColor: Colors.primary,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  ringInner: {
    width: 64,
    height: 64,
    borderWidth: 5,
    borderColor: Colors.primary,
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
    opacity: 0.55,
  },
});
