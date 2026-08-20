import React, { useState } from 'react';
import RootModal from './RootModal';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';
import OrdersSummaryReportModal from './OrdersSummaryReportModal';
import TillsSummaryReportModal from './TillsSummaryReportModal';
import ProductsMixReportModal from './ProductsMixReportModal';
import ActiveDeliveryReportModal from './ActiveDeliveryReportModal';
import DriverPaymentsReportModal from './DriverPaymentsReportModal';

// ─── Calendar helpers ─────────────────────────────────────────────────────────
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const DAYS_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function buildCells(year: number, month: number): (number | null)[] {
  const firstDay    = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function formatDateLabel(year: number, month: number, day: number): string {
  const d = new Date(year, month, day);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Deterministic mock order count per day (3–9)
function mockOrderCount(year: number, month: number, day: number): number {
  return ((year * 31 + month * 13 + day * 7) % 7) + 3;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible:     boolean;
  onBack:      () => void;
  onClose:     () => void;
  title?:      string;
  reportType?: 'orders' | 'tills' | 'products' | 'active-delivery' | 'driver-payments';
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function OrdersSummaryDialog({ visible, onBack, onClose, title = 'Orders Summary', reportType = 'orders' }: Props) {
  const { t, af, isRTL } = useI18n();
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selDay,    setSelDay]    = useState(today.getDate());
  const [selMonth,  setSelMonth]  = useState(today.getMonth());
  const [selYear,   setSelYear]   = useState(today.getFullYear());
  const [reportVisible, setReportVisible] = useState(false);

  const cells    = buildCells(viewYear, viewMonth);
  const count    = mockOrderCount(selYear, selMonth, selDay);
  const dateLabel = formatDateLabel(selYear, selMonth, selDay);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  function selectDay(day: number) {
    setSelDay(day);
    setSelMonth(viewMonth);
    setSelYear(viewYear);
  }

  function isSelected(day: number) {
    return day === selDay && viewMonth === selMonth && viewYear === selYear;
  }

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <>
    <RootModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onBack}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>

      <View style={s.center} pointerEvents="box-none">
        <View style={s.card}>

          {/* ── Header ── */}
          <View style={[s.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity onPress={onBack} style={s.backBtn} activeOpacity={0.7}>
              <Text style={[s.backText, { fontFamily: af('medium') }]}>{t('back')}</Text>
            </TouchableOpacity>

            <Text style={s.title}>{title}</Text>

            <View style={s.viewWrap}>
              {/* Count badge */}
              <View style={s.countBadge}>
                <Text style={s.countText}>{count}</Text>
              </View>
              <TouchableOpacity
                style={s.viewBtn}
                onPress={() => setReportVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={s.viewBtnText}>{t('viewBtn')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.headerDivider} />

          {/* ── Business date row ── */}
          <View style={[s.dateRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={s.dateRowLabel}>{t('businessDate')}</Text>
            <Text style={s.dateRowValue}>{dateLabel}</Text>
          </View>

          <View style={s.calDivider} />

          {/* ── Calendar ── */}
          <View style={s.calendar}>

            {/* Month nav */}
            <View style={s.monthNav}>
              <Text style={s.monthLabel}>
                {MONTHS[viewMonth]} {viewYear} {isRTL ? '‹' : '›'}
              </Text>
              <View style={s.monthArrows}>
                <TouchableOpacity onPress={prevMonth} style={s.arrowBtn} activeOpacity={0.7}>
                  <Text style={s.arrowText}>{isRTL ? '›' : '‹'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={nextMonth} style={s.arrowBtn} activeOpacity={0.7}>
                  <Text style={s.arrowText}>{isRTL ? '‹' : '›'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Day headers */}
            <View style={s.dayHeaders}>
              {DAYS_EN.map(d => (
                <Text key={d} style={s.dayHeader}>{d}</Text>
              ))}
            </View>

            {/* Day grid */}
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

          {/* ── Bottom spacer ── */}
          <View style={s.bottomSpacer} />

        </View>
      </View>
    </RootModal>

    {reportType === 'orders' && (
      <OrdersSummaryReportModal
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        dateLabel={dateLabel}
        openedAt={`${selYear}/${String(selMonth + 1).padStart(2,'0')}/${String(selDay).padStart(2,'0')} 09:00:00 AM`}
        closedAt={`${selYear}/${String(selMonth + 1).padStart(2,'0')}/${String(selDay).padStart(2,'0')} 11:59:59 PM`}
      />
    )}
    {reportType === 'tills' && (
      <TillsSummaryReportModal
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        dateLabel={dateLabel}
        printedAt={`${selYear}/${String(selMonth + 1).padStart(2,'0')}/${String(selDay).padStart(2,'0')} 11:59:59 PM`}
      />
    )}
    {reportType === 'products' && (
      <ProductsMixReportModal
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        dateLabel={dateLabel}
        printedAt={`${selYear}/${String(selMonth + 1).padStart(2,'0')}/${String(selDay).padStart(2,'0')} 11:59:59 PM`}
      />
    )}
    {reportType === 'active-delivery' && (
      <ActiveDeliveryReportModal
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        dateLabel={dateLabel}
        printedAt={`${selYear}/${String(selMonth + 1).padStart(2,'0')}/${String(selDay).padStart(2,'0')} 11:59:59 PM`}
      />
    )}
    {reportType === 'driver-payments' && (
      <DriverPaymentsReportModal
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        dateLabel={dateLabel}
        printedAt={`${selYear}/${String(selMonth + 1).padStart(2,'0')}/${String(selDay).padStart(2,'0')} 11:59:59 PM`}
      />
    )}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_W  = 420;
const COL_W   = Math.floor((CARD_W - 32) / 7);

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
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: Colors.grayLight,
  },
  backBtn:  { width: 64 },
  backText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  viewWrap: {
    width: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  countBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  viewBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.2,
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
  monthArrows: {
    flexDirection: 'row',
    gap: 4,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  arrowText: {
    fontSize: 22,
    fontWeight: '400',
    color: Colors.primary,
    lineHeight: 26,
  },

  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayHeader: {
    width: COL_W,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
    color: Colors.grayText,
    paddingBottom: 6,
  },

  weekRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  dayCell: {
    width: COL_W,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  dayCellSel: {
    backgroundColor: Colors.primary,
  },
  dayText: {
    fontSize: 17,
    fontWeight: '400',
    color: Colors.black,
  },
  dayTextSel: {
    color: Colors.white,
    fontWeight: '600',
  },
  dayTextEmpty: {
    color: 'transparent',
  },

  bottomSpacer: {
    height: 24,
  },
});
