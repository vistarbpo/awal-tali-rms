import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { Colors } from '../constants/colors';

// ─── Calendar helpers ─────────────────────────────────────────────────────────
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAYS_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function buildCells(year: number, month: number): (number | null)[] {
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function formatDateLabel(year: number, month: number, day: number): string {
  return new Date(year, month, day).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function OrdersSyncDialog({ visible, onClose }: Props) {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selDay,    setSelDay]    = useState<number | null>(today.getDate());
  const [selMonth,  setSelMonth]  = useState(today.getMonth());
  const [selYear,   setSelYear]   = useState(today.getFullYear());

  const [phase, setPhase] = useState<'pick' | 'syncing' | 'done'>('pick');

  const spinA    = useRef(new Animated.Value(0)).current;
  const spinB    = useRef(new Animated.Value(0)).current;
  const loopRef  = useRef<Animated.CompositeAnimation | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset when dialog opens
  useEffect(() => {
    if (visible) {
      setPhase('pick');
      setSelDay(today.getDate());
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
    }
  }, [visible]);

  // Spinner lifecycle
  useEffect(() => {
    if (phase === 'syncing') {
      spinA.setValue(0);
      spinB.setValue(0);
      loopRef.current = Animated.loop(
        Animated.parallel([
          Animated.timing(spinA, { toValue: 1, duration: 900,  useNativeDriver: true, isInteraction: false }),
          Animated.timing(spinB, { toValue: 1, duration: 1400, useNativeDriver: true, isInteraction: false }),
        ])
      );
      loopRef.current.start();
      timerRef.current = setTimeout(() => {
        loopRef.current?.stop();
        setPhase('done');
      }, 2600);
    }
    return () => {
      loopRef.current?.stop();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase]);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }
  function selectDay(day: number) {
    setSelDay(day); setSelMonth(viewMonth); setSelYear(viewYear);
  }
  function isSelected(day: number) {
    return day === selDay && viewMonth === selMonth && viewYear === selYear;
  }

  function handleSync() {
    if (!selDay) return;
    setPhase('syncing');
  }

  function handleClose() {
    loopRef.current?.stop();
    if (timerRef.current) clearTimeout(timerRef.current);
    onClose();
  }

  const rotateA = spinA.interpolate({ inputRange: [0, 1], outputRange: ['0deg',   '360deg'] });
  const rotateB = spinB.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'  ] });

  const cells = buildCells(viewYear, viewMonth);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const dateLabel = selDay ? formatDateLabel(selYear, selMonth, selDay) : '';
  const syncReady = selDay !== null && phase === 'pick';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={phase === 'syncing' ? undefined : handleClose}
    >
      {phase !== 'syncing' && (
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={s.backdrop} />
        </TouchableWithoutFeedback>
      )}
      {phase === 'syncing' && <View style={s.backdrop} />}

      <View style={s.center} pointerEvents="box-none">
        <View style={s.card}>

          {/* ── Header ── */}
          <View style={s.header}>
            <TouchableOpacity
              style={s.headerSide}
              onPress={handleClose}
              disabled={phase === 'syncing'}
              activeOpacity={0.7}
            >
              <Text style={[s.cancelText, phase === 'syncing' && s.textDisabled]}>Cancel</Text>
            </TouchableOpacity>

            <Text style={s.title}>Sync Orders</Text>

            <TouchableOpacity
              style={s.headerSide}
              onPress={handleSync}
              disabled={!syncReady}
              activeOpacity={0.7}
            >
              <Text style={[s.syncText, !syncReady && s.textDisabled]}>Sync</Text>
            </TouchableOpacity>
          </View>

          <View style={s.headerDivider} />

          {/* ── Date row ── */}
          <View style={s.dateRow}>
            <Text style={s.dateRowLabel}>Business date</Text>
            <Text style={[s.dateRowValue, !selDay && s.dateRowPlaceholder]}>
              {selDay ? dateLabel : 'Select a date'}
            </Text>
          </View>

          <View style={s.calDivider} />

          {/* ── Calendar ── */}
          <View style={s.calendar}>
            <View style={s.monthNav}>
              <Text style={s.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
              <View style={s.monthArrows}>
                <TouchableOpacity onPress={prevMonth} style={s.arrowBtn} activeOpacity={0.7}>
                  <Text style={s.arrowText}>‹</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={nextMonth} style={s.arrowBtn} activeOpacity={0.7}>
                  <Text style={s.arrowText}>›</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={s.dayHeaders}>
              {DAYS_EN.map(d => (
                <Text key={d} style={s.dayHeader}>{d}</Text>
              ))}
            </View>

            {rows.map((row, ri) => (
              <View key={ri} style={s.weekRow}>
                {Array.from({ length: 7 }, (_, ci) => {
                  const day = row[ci] ?? null;
                  const sel = day !== null && isSelected(day);
                  return (
                    <TouchableOpacity
                      key={ci}
                      style={[s.dayCell, sel && s.dayCellSel]}
                      onPress={day ? () => selectDay(day) : undefined}
                      activeOpacity={day ? 0.7 : 1}
                      disabled={!day}
                    >
                      <Text style={[s.dayText, sel && s.dayTextSel, !day && s.dayTextEmpty]}>
                        {day ?? ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          <View style={s.bottomSpacer} />

          {/* ── Spinner / done overlay ── */}
          {(phase === 'syncing' || phase === 'done') && (
            <View style={s.overlay}>
              {phase === 'syncing' ? (
                <>
                  <Animated.View style={[s.ring, s.ringOuter, { transform: [{ rotate: rotateA }] }]} />
                  <Animated.View style={[s.ring, s.ringInner, { transform: [{ rotate: rotateB }] }]} />
                  <Text style={s.overlayText}>Syncing orders…</Text>
                </>
              ) : (
                <>
                  <View style={s.checkCircle}>
                    <Text style={s.checkMark}>✓</Text>
                  </View>
                  <Text style={[s.overlayText, s.doneText]}>Sync complete</Text>
                  <TouchableOpacity style={s.doneBtn} onPress={handleClose} activeOpacity={0.8}>
                    <Text style={s.doneBtnText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_W = 420;
const COL_W  = Math.floor((CARD_W - 32) / 7);

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
    width: CARD_W,
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
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: Colors.grayLight,
  },
  headerSide: { width: 72 },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  syncText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.2,
    textAlign: 'right',
  },
  textDisabled: {
    color: Colors.grayMid,
  },

  headerDivider: {
    height: 1,
    backgroundColor: Colors.grayBorder,
  },

  // Date row
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  dateRowLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.2,
  },
  dateRowValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  dateRowPlaceholder: {
    color: Colors.placeholder,
    fontWeight: '400',
  },

  calDivider: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.29)',
    marginHorizontal: 24,
  },

  // Calendar
  calendar: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  monthArrows: { flexDirection: 'row', gap: 4 },
  arrowBtn: {
    width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 8,
  },
  arrowText: {
    fontSize: 22,
    fontWeight: '400',
    color: Colors.primary,
    lineHeight: 26,
  },

  dayHeaders: { flexDirection: 'row', marginBottom: 4 },
  dayHeader: {
    width: COL_W,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
    color: Colors.grayText,
    paddingBottom: 6,
  },

  weekRow: { flexDirection: 'row', marginBottom: 2 },
  dayCell: {
    width: COL_W, height: 48,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 24,
  },
  dayCellSel: { backgroundColor: Colors.primary },
  dayText: { fontSize: 17, fontWeight: '400', color: Colors.black },
  dayTextSel: { color: Colors.white, fontWeight: '600' },
  dayTextEmpty: { color: 'transparent' },

  bottomSpacer: { height: 24 },

  // Overlay (spinner / done)
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
  },
  ringOuter: {
    width: 96, height: 96,
    borderWidth: 5,
    borderColor: Colors.primary,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  ringInner: {
    width: 64, height: 64,
    borderWidth: 5,
    borderColor: Colors.primary,
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
    opacity: 0.55,
  },
  overlayText: {
    marginTop: 60,
    fontSize: 17,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  checkCircle: {
    width: 80, height: 80,
    borderRadius: 40,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 36,
    color: Colors.white,
    fontWeight: '700',
    lineHeight: 44,
  },
  doneText: { color: Colors.green, marginTop: 0 },
  doneBtn: {
    marginTop: 4,
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.primary,
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
});
