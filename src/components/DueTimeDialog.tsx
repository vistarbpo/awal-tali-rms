import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEM_H = 52;
const VISIBLE_ROWS = 5;
const DRUM_HEIGHT = ITEM_H * VISIBLE_ROWS;

const HOURS: string[] = Array.from({ length: 12 }, (_, i) =>
  String(i + 1),
);
const MINUTES: string[] = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, '0'),
);
const PERIODS: string[] = ['AM', 'PM'];

const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Build a 6-row calendar grid (always 42 cells) for the given month. */
function buildCalendarGrid(
  year: number,
  month: number,
): Array<{ date: Date; currentMonth: boolean }> {
  const firstDay = startOfMonth(year, month).getDay(); // 0=Sun
  const totalDays = daysInMonth(year, month);
  const cells: Array<{ date: Date; currentMonth: boolean }> = [];

  // Leading empty cells from previous month
  for (let i = 0; i < firstDay; i++) {
    const d = new Date(year, month, 1 - (firstDay - i));
    cells.push({ date: d, currentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ date: new Date(year, month, d), currentMonth: true });
  }

  // Trailing empty cells to complete the grid (up to 42)
  let trailing = 1;
  while (cells.length < 42) {
    cells.push({ date: new Date(year, month + 1, trailing++), currentMonth: false });
  }

  return cells;
}

function formatMonthYear(year: number, month: number): string {
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${MONTHS[month]} ${year}`;
}

function format12Hour(hour24: number, minute: number): string {
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const h = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${h}:${String(minute).padStart(2, '0')} ${period}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  current: Date | null;
  onClose: () => void;
  onSave: (date: Date) => void;
}

// ─── Drum column component ────────────────────────────────────────────────────

interface DrumColumnProps {
  items: string[];
  selectedIndex: number;
  scrollRef: React.RefObject<ScrollView | null>;
  onIndexChange: (index: number) => void;
}

function DrumColumn({ items, selectedIndex, scrollRef, onIndexChange }: DrumColumnProps) {
  const handleMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const idx = clamp(Math.round(y / ITEM_H), 0, items.length - 1);
      onIndexChange(idx);
    },
    [items.length, onIndexChange],
  );

  return (
    <View style={drum.columnWrap}>
      {/* Selection highlight band */}
      <View pointerEvents="none" style={drum.selectionBand} />

      <ScrollView
        ref={scrollRef as React.RefObject<ScrollView>}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumEnd}
        contentContainerStyle={drum.contentContainer}
        style={drum.scroll}
      >
        {items.map((label, idx) => (
          <View key={label + idx} style={drum.item}>
            <Text
              style={[
                drum.itemText,
                idx === selectedIndex && drum.itemTextSelected,
              ]}
            >
              {label}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const drum = StyleSheet.create({
  columnWrap: {
    flex: 1,
    height: DRUM_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
  },
  selectionBand: {
    position: 'absolute',
    top: ITEM_H * 2,
    left: 0,
    right: 0,
    height: ITEM_H,
    backgroundColor: Colors.grayLight,
    borderRadius: 10,
    zIndex: 0,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: ITEM_H * 2,
    paddingBottom: ITEM_H * 2,
  },
  item: {
    height: ITEM_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 20,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.3,
  },
  itemTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DueTimeDialog({ visible, current, onClose, onSave }: Props) {
  const { t, af } = useI18n();
  const today = useMemo(() => new Date(), []);

  // ── Calendar state ──────────────────────────────────────────────────────────
  const [viewYear, setViewYear] = useState<number>(today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(current ?? today);

  // ── Time state ──────────────────────────────────────────────────────────────
  // Derived from hour24 for easy round-tripping
  const initHour24 = (current ?? today).getHours();
  const initMinuteRaw = (current ?? today).getMinutes();
  // Snap minute to nearest 5
  const initMinute = Math.round(initMinuteRaw / 5) * 5 % 60;

  const [hour24, setHour24] = useState<number>(initHour24);
  const [minute, setMinute] = useState<number>(initMinute);

  // Derived 12-hour indices
  const periodIndex = hour24 >= 12 ? 1 : 0; // 0=AM 1=PM
  const hourIndex = (hour24 % 12 === 0 ? 11 : (hour24 % 12) - 1); // 0-based within 1-12
  const minuteIndex = clamp(Math.floor(minute / 5), 0, 11);

  // ── Drum picker visibility ──────────────────────────────────────────────────
  const [showDrum, setShowDrum] = useState<boolean>(false);

  // ── Scroll refs ─────────────────────────────────────────────────────────────
  const periodRef = useRef<ScrollView>(null);
  const hourRef = useRef<ScrollView>(null);
  const minuteRef = useRef<ScrollView>(null);

  // ── Sync state when dialog opens ────────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;

    const base = current ?? new Date();
    const h24 = base.getHours();
    const m5 = Math.round(base.getMinutes() / 5) * 5 % 60;

    setSelectedDate(base);
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
    setHour24(h24);
    setMinute(m5);
    setShowDrum(false);
  }, [visible, current]);

  // ── Scroll drums to initial position when shown ──────────────────────────────
  useEffect(() => {
    if (!showDrum) return;

    const pIdx = hour24 >= 12 ? 1 : 0;
    const hIdx = hour24 % 12 === 0 ? 11 : (hour24 % 12) - 1;
    const mIdx = clamp(Math.floor(minute / 5), 0, 11);

    const scroll = (ref: React.RefObject<ScrollView | null>, idx: number) => {
      setTimeout(() => {
        ref.current?.scrollTo({ y: idx * ITEM_H, animated: false });
      }, 50);
    };

    scroll(periodRef, pIdx);
    scroll(hourRef, hIdx);
    scroll(minuteRef, mIdx);
  }, [showDrum]); // intentionally not including hour24/minute to avoid loops

  // ── Calendar grid ────────────────────────────────────────────────────────────
  const calendarCells = useMemo(
    () => buildCalendarGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handlePrevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const handleDayPress = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handlePeriodChange = useCallback(
    (idx: number) => {
      const currentPeriod = hour24 >= 12 ? 1 : 0;
      if (idx === currentPeriod) return;
      setHour24((h) => (idx === 1 ? h + 12 : h - 12));
    },
    [hour24],
  );

  const handleHourChange = useCallback(
    (idx: number) => {
      // idx 0-11 maps to hours 1-12
      const h12 = idx + 1;
      const isPm = hour24 >= 12;
      const newH = isPm ? (h12 === 12 ? 12 : h12 + 12) : (h12 === 12 ? 0 : h12);
      setHour24(newH);
    },
    [hour24],
  );

  const handleMinuteChange = useCallback((idx: number) => {
    setMinute(idx * 5);
  }, []);

  const handleSave = useCallback(() => {
    const out = new Date(selectedDate);
    out.setHours(hour24, minute, 0, 0);
    onSave(out);
    onClose();
  }, [selectedDate, hour24, minute, onSave, onClose]);

  const formattedTime = format12Hour(hour24, minute);

  // ── Render ───────────────────────────────────────────────────────────────────

  const cardJSX = (
        <View style={s.card}>

          {/* ── Header ── */}
          <View style={s.header}>
            <TouchableOpacity onPress={onClose} style={s.headerSideBtn} hitSlop={8}>
              <Text style={[s.cancelText, { fontFamily: af('medium') }]}>{t('cancel')}</Text>
            </TouchableOpacity>

            <Text style={[s.headerTitle, { fontFamily: af('bold') }]}>{t('dueTimeTitle')}</Text>

            <TouchableOpacity onPress={handleSave} style={s.headerSideBtn} hitSlop={8}>
              <Text style={[s.saveText, { fontFamily: af('bold') }]}>{t('save')}</Text>
            </TouchableOpacity>
          </View>

          {/* ── Calendar / Drum body ── */}
          <View style={s.body}>

            {showDrum ? (
              /* ── Scroll-drum time picker ── */
              <View style={s.drumWrap}>
                <DrumColumn
                  items={PERIODS}
                  selectedIndex={periodIndex}
                  scrollRef={periodRef}
                  onIndexChange={handlePeriodChange}
                />
                <View style={s.drumDivider} />
                <DrumColumn
                  items={HOURS}
                  selectedIndex={hourIndex}
                  scrollRef={hourRef}
                  onIndexChange={handleHourChange}
                />
                <View style={s.drumDivider} />
                <DrumColumn
                  items={MINUTES}
                  selectedIndex={minuteIndex}
                  scrollRef={minuteRef}
                  onIndexChange={handleMinuteChange}
                />
              </View>
            ) : (
              /* ── Calendar ── */
              <View style={s.calendarWrap}>

                {/* Month nav */}
                <View style={s.monthRow}>
                  <TouchableOpacity onPress={handlePrevMonth} style={s.chevronBtn} hitSlop={8}>
                    <Text style={s.chevronText}>{'<'}</Text>
                  </TouchableOpacity>

                  <Text style={s.monthLabel}>
                    {formatMonthYear(viewYear, viewMonth)}
                  </Text>

                  <TouchableOpacity onPress={handleNextMonth} style={s.chevronBtn} hitSlop={8}>
                    <Text style={s.chevronText}>{'>'}</Text>
                  </TouchableOpacity>
                </View>

                {/* Day-of-week headers */}
                <View style={s.dowRow}>
                  {DAYS_OF_WEEK.map((d) => (
                    <View key={d} style={s.dowCell}>
                      <Text style={s.dowText}>{d}</Text>
                    </View>
                  ))}
                </View>

                {/* Day grid */}
                <View style={s.gridWrap}>
                  {calendarCells.map(({ date, currentMonth }, idx) => {
                    const isToday = isSameDay(date, today);
                    const isSelected = isSameDay(date, selectedDate);
                    const highlighted = isToday || isSelected;

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={s.dayCell}
                        onPress={() => handleDayPress(date)}
                        activeOpacity={0.7}
                      >
                        <View style={[s.dayCircle, highlighted && s.dayCircleHighlighted]}>
                          <Text
                            style={[
                              s.dayText,
                              !currentMonth && s.dayTextOtherMonth,
                              highlighted && s.dayTextHighlighted,
                            ]}
                          >
                            {date.getDate()}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

              </View>
            )}

            {/* ── Divider ── */}
            <View style={s.divider} />

            {/* ── Time row ── */}
            <TouchableOpacity
              style={s.timeRow}
              onPress={() => setShowDrum((v) => !v)}
              activeOpacity={0.7}
            >
              <Text style={[s.timeLabel, { fontFamily: af('semibold') }]}>Time</Text>
              <View style={s.timePill}>
                <Text style={s.timePillText}>{formattedTime}</Text>
              </View>
            </TouchableOpacity>

          </View>
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

const s = StyleSheet.create({
  // Backdrop
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  // Centering container
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  inlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  // Card
  card: {
    width: 460,
    backgroundColor: Colors.white,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.grayLight,
    height: 64,
    paddingHorizontal: 20,
  },
  headerSideBtn: {
    minWidth: 64,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -0.4,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.2,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.2,
    textAlign: 'right',
  },

  // ── Body ──
  body: {
    paddingTop: 16,
    paddingBottom: 4,
  },

  // ── Calendar ──
  calendarWrap: {
    paddingHorizontal: 20,
  },

  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  monthLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -0.35,
  },
  chevronBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: Colors.grayLight,
  },
  chevronText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    lineHeight: 18,
  },

  // Day-of-week row
  dowRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dowCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  dowText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.grayText,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Grid
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  dayCell: {
    width: `${100 / 7}%` as unknown as number,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleHighlighted: {
    backgroundColor: Colors.primary,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.black,
    letterSpacing: -0.2,
  },
  dayTextOtherMonth: {
    color: Colors.placeholder,
  },
  dayTextHighlighted: {
    color: Colors.white,
    fontWeight: '700',
  },

  // ── Drum picker ──
  drumWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  drumDivider: {
    width: 1,
    height: DRUM_HEIGHT * 0.6,
    backgroundColor: Colors.grayBorder,
    alignSelf: 'center',
  },

  // ── Divider ──
  divider: {
    height: 1,
    backgroundColor: Colors.grayBorder,
    marginHorizontal: 20,
    marginVertical: 8,
  },

  // ── Time row ──
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  timeLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  timePill: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  timePillText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
});
