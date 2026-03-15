import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { Colors } from '../constants/colors';

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
function SectionHeader({ title }: { title: string }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

function Row({ label, value, valueStyle }: { label: string; value: string; valueStyle?: object }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, valueStyle]}>{value}</Text>
    </View>
  );
}

function ActionRow({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={s.row} activeOpacity={0.7} onPress={onPress}>
      <Text style={s.rowLabelPrimary}>{label}</Text>
    </TouchableOpacity>
  );
}

function ChevronRow({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={s.row} activeOpacity={0.7} onPress={onPress}>
      <Text style={s.rowLabelPrimary}>{label}</Text>
      <View style={s.rowRight}>
        <Text style={s.rowValue}>{value}</Text>
        <Text style={s.chevron}>›</Text>
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

          {/* ── Header ── */}
          <View style={s.header}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={s.headerSide}>
              <Text style={s.headerClose}>Close</Text>
            </TouchableOpacity>
            <Text style={s.headerTitle}>Diagnostics</Text>
            <TouchableOpacity onPress={handleSend} activeOpacity={0.7} style={s.headerSide} disabled={sending}>
              <Text style={[s.headerSend, sent && s.headerSendDone]}>
                {sending ? 'Sending…' : sent ? 'Sent ✓' : 'Send'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>

            {/* ── General ── */}
            <SectionHeader title="General" />
            <View style={s.group}>
              <ActionRow label="Settings" />
              <Hairline />
              <Row label="Name" value="Branch Manager" />
              <Hairline />
              <Row
                label="Shift status"
                value={isClockedIn ? 'Clocked in' : 'Clocked out'}
                valueStyle={isClockedIn ? s.rowValueGreen : undefined}
              />
              <Hairline />
              <Row
                label="Till status"
                value={isTillOpen ? 'Till opened' : 'Till closed'}
                valueStyle={isTillOpen ? s.rowValueGreen : undefined}
              />
              <Hairline />
              <Row label="Business day" value={todayFormatted()} />
              <Hairline />
              <ChevronRow label="Clocked in Users" value="1" />
            </View>

            {/* ── Sync ── */}
            <SectionHeader title="Sync" />
            <View style={s.group}>
              <Row label="Last synced at" value={lastSyncFormatted()} />
              <Hairline />
              <View style={s.row}>
                <Text style={s.rowLabel}>Orders pending sync</Text>
                <Text style={[s.rowValue, pendingSyncStyle]}>{ordersPendingSync}</Text>
              </View>
              <Hairline />
              <ActionRow label="Cleaning Database" />
              <Hairline />
              <ActionRow label="Remove Duplicated Customers" />
            </View>

            {/* ── Diagnostics ── */}
            <SectionHeader title="Diagnostics" />
            <View style={s.group}>
              <Row
                label="Internet status"
                value="Connected"
                valueStyle={s.rowValueGreen}
              />
              <Hairline />
              <Row label="IP address" value="192.168.2.209" />
              <Hairline />
              <Row label="Account number" value="302641" />
              <Hairline />
              <Row label="Business name" value="اول و تالي" />
              <Hairline />
              <Row label="Branch name" value="Branch Shawqiyah -Makkah (B02)" />
              <Hairline />
              <Row label="Device name" value="Cashier Test (B02C02)" />
              <Hairline />
              <Row label="Application version" value="5.0.131 (11336)" />
              <Hairline />
              <Row label="System version" value="iOS 17.6.1" />
            </View>

            <View style={s.bottomPad} />
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
    </Modal>
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
  headerSendDone: {
    color: Colors.green,
  },

  // Section headers
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.grayText,
    letterSpacing: 0.2,
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 52,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.2,
  },
  rowLabelPrimary: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.2,
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  rowValueGreen:   { color: Colors.green,  fontWeight: '500' },
  rowValueWarning: { color: '#F59E0B',     fontWeight: '600' },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chevron: {
    fontSize: 18,
    color: Colors.grayMid,
    marginLeft: 2,
  },

  // Divider
  hairline: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.18)',
    marginLeft: 20,
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
