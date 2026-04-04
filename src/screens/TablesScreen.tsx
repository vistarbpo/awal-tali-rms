import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  PanResponder,
  useWindowDimensions,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';
import type { TKey } from '../i18n/translations';
import GuestCountDialog from '../components/GuestCountDialog';

// ─── Types ────────────────────────────────────────────────────────────────────
type TableStatus = 'available' | 'occupied' | 'paid';

interface TableData {
  id:      string;
  name:    string;
  section: string;
  seats:   number;
  status:  TableStatus;
  x:       number;
  y:       number;
  timer?:  string;
  waiter?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CARD   = 130; // square size in px
const SECTIONS = ['VIP', 'Family Section', 'Single Section'];
const SECTION_I18N_KEY: Record<string, TKey> = {
  'VIP':            'vip',
  'Family Section': 'family',
  'Single Section': 'single',
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const INITIAL_TABLES: TableData[] = [
  // VIP
  { id: 't1',  name: 'Table 1', section: 'VIP',            seats: 6, status: 'paid',      x: 30,  y: 30,  timer: '10 mins', waiter: 'Branch Manager' },
  { id: 't2',  name: 'Table 2', section: 'VIP',            seats: 7, status: 'occupied',  x: 185, y: 30,  timer: '8 mins',  waiter: 'Mohammed' },
  { id: 't3',  name: 'Table 3', section: 'VIP',            seats: 4, status: 'available', x: 340, y: 30  },
  { id: 't4',  name: 'Table 4', section: 'VIP',            seats: 6, status: 'available', x: 495, y: 30  },
  { id: 't5',  name: 'Table 5', section: 'VIP',            seats: 8, status: 'occupied',  x: 30,  y: 185, timer: '22 mins', waiter: 'Sara' },
  { id: 't6',  name: 'Table 6', section: 'VIP',            seats: 5, status: 'available', x: 185, y: 185 },
  // Family Section
  { id: 't7',  name: 'Table 1', section: 'Family Section', seats: 8, status: 'paid',      x: 30,  y: 30,  timer: '12 mins', waiter: 'Sara' },
  { id: 't8',  name: 'Table 2', section: 'Family Section', seats: 8, status: 'occupied',  x: 185, y: 30,  timer: '5 mins',  waiter: 'Mohammed' },
  { id: 't9',  name: 'Table 3', section: 'Family Section', seats: 8, status: 'occupied',  x: 340, y: 30,  timer: '17 mins', waiter: 'Sara' },
  { id: 't10', name: 'Table 4', section: 'Family Section', seats: 6, status: 'available', x: 495, y: 30  },
  { id: 't11', name: 'Table 5', section: 'Family Section', seats: 6, status: 'available', x: 650, y: 30  },
  { id: 't12', name: 'Table 6', section: 'Family Section', seats: 4, status: 'available', x: 30,  y: 185 },
  { id: 't13', name: 'Table 7', section: 'Family Section', seats: 4, status: 'available', x: 185, y: 185 },
  // Single Section
  { id: 't14', name: 'Table 1', section: 'Single Section', seats: 2, status: 'paid',      x: 30,  y: 30,  timer: '6 mins',  waiter: 'Mohammed' },
  { id: 't15', name: 'Table 2', section: 'Single Section', seats: 2, status: 'available', x: 185, y: 30  },
  { id: 't16', name: 'Table 3', section: 'Single Section', seats: 2, status: 'occupied',  x: 340, y: 30,  timer: '3 mins',  waiter: 'Sara' },
  { id: 't17', name: 'Table 4', section: 'Single Section', seats: 2, status: 'available', x: 495, y: 30  },
];

// ─── Status colors ─────────────────────────────────────────────────────────────
function borderCol(status: TableStatus): string {
  switch (status) {
    case 'paid':      return Colors.brandYellow;
    case 'occupied':  return Colors.red;
    case 'available': return Colors.availGreen;
  }
}

function bgCol(status: TableStatus): string {
  switch (status) {
    case 'paid':      return 'rgba(217,192,150,0.13)';
    case 'occupied':  return 'rgba(212,87,87,0.08)';
    case 'available': return 'rgba(76,169,36,0.08)';
  }
}

// ─── Drawn icons ──────────────────────────────────────────────────────────────
function ClockIcon() {
  return (
    <View style={ic.clock}>
      <View style={ic.clockHand} />
    </View>
  );
}
function PersonIcon() {
  return (
    <View style={ic.person}>
      <View style={ic.head} />
      <View style={ic.body} />
    </View>
  );
}
function SeatsIcon() {
  return (
    <View style={ic.seats}>
      <View style={ic.seatDot} />
      <View style={ic.seatDot} />
    </View>
  );
}
function GripDots() {
  return (
    <View style={ic.grip}>
      {[0, 1, 2].map(r => (
        <View key={r} style={ic.gripRow}>
          <View style={ic.gripDot} />
          <View style={ic.gripDot} />
        </View>
      ))}
    </View>
  );
}

const ic = StyleSheet.create({
  clock:     { width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: Colors.grayText, alignItems: 'center', justifyContent: 'center' },
  clockHand: { width: 1.5, height: 3.5, backgroundColor: Colors.grayText, marginTop: -1 },
  person:    { width: 11, height: 11, alignItems: 'center', justifyContent: 'flex-end' },
  head:      { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.grayText, marginBottom: 1 },
  body:      { width: 8, height: 4.5, borderRadius: 2, backgroundColor: Colors.grayText },
  seats:     { flexDirection: 'row', gap: 2, alignItems: 'center' },
  seatDot:   { width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.grayText },
  grip:      { gap: 3.5 },
  gripRow:   { flexDirection: 'row', gap: 3.5 },
  gripDot:   { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.grayMid },
});

// ─── Draggable table card ─────────────────────────────────────────────────────
interface CardProps {
  table:       TableData;
  editMode:    boolean;
  canvasDims:  React.MutableRefObject<{ w: number; h: number }>;
  onMove:      (id: string, x: number, y: number) => void;
  onPress:     (table: TableData) => void;
}

function DraggableCard({ table, editMode, canvasDims, onMove, onPress }: CardProps) {
  const { t, af, isRTL } = useI18n();
  const editRef  = useRef(editMode);
  editRef.current = editMode;

  const lastPos = useRef({ x: table.x, y: table.y });
  const pan     = useRef(new Animated.ValueXY({ x: table.x, y: table.y })).current;
  const [lifted, setLifted] = useState(false);

  const pr = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => editRef.current,
      onMoveShouldSetPanResponder:  () => editRef.current,
      onPanResponderGrant: () => {
        setLifted(true);
        pan.setOffset(lastPos.current);
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false },
      ),
      onPanResponderRelease: (_, { dx, dy }) => {
        setLifted(false);
        pan.flattenOffset();
        const { w, h } = canvasDims.current;
        const newX = Math.max(0, Math.min(w > 0 ? w - CARD : Infinity, lastPos.current.x + dx));
        const newY = Math.max(0, Math.min(h > 0 ? h - CARD : Infinity, lastPos.current.y + dy));
        lastPos.current = { x: newX, y: newY };
        pan.setValue({ x: newX, y: newY });
        onMove(table.id, newX, newY);
      },
      onPanResponderTerminate: () => {
        setLifted(false);
        pan.flattenOffset();
      },
    })
  ).current;

  const border = borderCol(table.status);
  const bg     = bgCol(table.status);

  return (
    <Animated.View
      style={[
        s.card,
        { left: pan.x, top: pan.y, borderColor: border, backgroundColor: bg },
        lifted && s.cardLifted,
      ]}
      {...(editMode ? pr.panHandlers : {})}
    >
      <TouchableOpacity
        style={s.cardInner}
        onPress={() => { if (!editRef.current) onPress(table); }}
        activeOpacity={editMode ? 1 : 0.8}
      >
        {/* Drag grip — edit only */}
        {editMode && (
          <View style={[s.gripWrap, isRTL ? { right: undefined, left: 8 } : { right: 8 }]}>
            <GripDots />
          </View>
        )}

        {/* Name + timer */}
        <View style={s.cardTop}>
          <Text style={[s.tableName, { fontFamily: af('semibold') }]}>{table.name}</Text>
          {table.timer && (
            <View style={s.row}>
              <ClockIcon />
              <Text style={[s.timerText, { fontFamily: af('regular') }]}>{table.timer}</Text>
            </View>
          )}
        </View>

        {/* Paid badge + waiter + divider + seats */}
        <View style={s.cardBottom}>
          {table.status === 'paid' && (
            <View style={s.paidBadge}>
              <Text style={[s.paidText, { fontFamily: af('semibold') }]}>Paid</Text>
            </View>
          )}
          {table.waiter && (
            <View style={s.row}>
              <PersonIcon />
              <Text style={[s.waiterText, { fontFamily: af('regular') }]} numberOfLines={1}>{table.waiter}</Text>
            </View>
          )}
          <View style={s.cardDivider} />
          <View style={s.row}>
            <SeatsIcon />
            <Text style={[s.seatsText, { fontFamily: af('medium') }]}>{table.seats}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Preview mode (Figma capture) ────────────────────────────────────────────
// Set to: 'vip' | 'family' | 'single' | 'tooltip' | 'edit' | 'edit-rearranged' | 'guest-dialog' | null
const PREVIEW_DIALOG: string | null = null;

// Rearranged VIP positions for the 'edit-rearranged' preview
const REARRANGED_VIP: Record<string, { x: number; y: number }> = {
  t1: { x: 290, y: 210 },
  t2: { x: 55,  y: 130 },
  t3: { x: 470, y: 60  },
  t4: { x: 150, y: 310 },
  t5: { x: 380, y: 280 },
  t6: { x: 560, y: 170 },
};

// ─── Screen ───────────────────────────────────────────────────────────────────
interface Props {
  onBack:          () => void;
  onReservations?: () => void;
  onStartOrder?:   (tableName: string, section: string, guests: number) => void;
}

export default function TablesScreen({ onBack, onReservations, onStartOrder }: Props) {
  const { t, af, isRTL } = useI18n();
  const _initialTables = PREVIEW_DIALOG === 'edit-rearranged'
    ? INITIAL_TABLES.map(t => REARRANGED_VIP[t.id] ? { ...t, ...REARRANGED_VIP[t.id] } : t)
    : INITIAL_TABLES;
  const [tables, setTables]               = useState<TableData[]>(_initialTables);
  const [editMode, setEditMode]           = useState(PREVIEW_DIALOG === 'edit' || PREVIEW_DIALOG === 'edit-rearranged');
  const [activeSection, setActiveSection] = useState(
    PREVIEW_DIALOG === 'family' ? SECTIONS[1] :
    PREVIEW_DIALOG === 'single' ? SECTIONS[2] :
    SECTIONS[0]
  );
  const _previewTable = PREVIEW_DIALOG === 'tooltip' || PREVIEW_DIALOG === 'guest-dialog'
    ? INITIAL_TABLES.find(t => t.id === 't3') ?? null
    : null;
  const [tappedTable, setTappedTable]     = useState<TableData | null>(_previewTable);
  const [guestDialogOpen, setGuestDialogOpen] = useState(PREVIEW_DIALOG === 'guest-dialog');
  const canvasDims = useRef(
    PREVIEW_DIALOG === 'tooltip' || PREVIEW_DIALOG === 'guest-dialog'
      ? { w: 1180, h: 698 }
      : { w: 0, h: 0 }
  );

  const sectionTables = tables.filter(t => t.section === activeSection);

  function handleMove(id: string, x: number, y: number) {
    setTables(prev => prev.map(t => t.id === id ? { ...t, x, y } : t));
  }

  function handleTablePress(table: TableData) {
    if (editMode) return;
    // Toggle: tap same table again to dismiss
    setTappedTable(prev => prev?.id === table.id ? null : table);
  }

  function handleStartOrder(guests: number) {
    if (!tappedTable) return;
    setGuestDialogOpen(false);
    setTappedTable(null);
    onStartOrder?.(tappedTable.name, tappedTable.section, guests);
  }

  // Tooltip position: show below the card, clamp to canvas bottom
  const TOOLTIP_H = 88;
  const TOOLTIP_W = 200;
  function tooltipStyle(table: TableData) {
    const { w, h } = canvasDims.current;
    const spaceBelow = h - (table.y + CARD + 12 + TOOLTIP_H);
    const top = spaceBelow >= 0
      ? table.y + CARD + 12
      : table.y - TOOLTIP_H - 12;
    const leftVal = Math.min(Math.max(0, table.x + CARD / 2 - TOOLTIP_W / 2), w - TOOLTIP_W - 8);
    return isRTL
      ? { top, right: w > 0 ? w - leftVal - TOOLTIP_W : leftVal, width: TOOLTIP_W }
      : { top, left: leftVal, width: TOOLTIP_W };
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* ── Top bar ── */}
      <View style={s.topBar}>
        <View style={s.topLeft}>
          <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.7}>
            <Text style={[s.backText, { fontFamily: af('medium') }]}>{t('back')}</Text>
          </TouchableOpacity>
          <View style={s.topSep} />
          <Text style={[s.topTitle, { fontFamily: af('medium') }]}>Tables Plan</Text>
        </View>

        <View style={s.topRight}>
          <TouchableOpacity style={s.reservationsBtn} onPress={onReservations} activeOpacity={0.7}>
            <Text style={[s.reservationsText, { fontFamily: af('medium') }]}>Reservations</Text>
          </TouchableOpacity>

          {editMode ? (
            <TouchableOpacity style={s.doneBtn} onPress={() => setEditMode(false)} activeOpacity={0.8}>
              <Text style={[s.doneBtnText, { fontFamily: af('semibold') }]}>{t('done')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={s.editBtn} onPress={() => setEditMode(true)} activeOpacity={0.8}>
              <Text style={[s.editBtnText, { fontFamily: af('semibold') }]}>{t('edit')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Edit hint strip ── */}
      {editMode && (
        <View style={s.hintBar}>
          <Text style={[s.hintText, { fontFamily: af('medium') }]}>Drag tables to rearrange the floor plan</Text>
        </View>
      )}

      {/* ── Canvas ── */}
      <View
        style={s.canvas}
        onLayout={e => {
          canvasDims.current = {
            w: e.nativeEvent.layout.width,
            h: e.nativeEvent.layout.height,
          };
        }}
      >
        {/* Dismiss overlay — sits behind tooltip, above tables */}
        {tappedTable && (
          <TouchableOpacity
            style={[StyleSheet.absoluteFillObject, s.dismissOverlay]}
            onPress={() => setTappedTable(null)}
            activeOpacity={1}
          />
        )}

        {sectionTables.map(table => (
          <DraggableCard
            key={table.id}
            table={table}
            editMode={editMode}
            canvasDims={canvasDims}
            onMove={handleMove}
            onPress={handleTablePress}
          />
        ))}

        {/* Tooltip */}
        {tappedTable && (
          <View style={[s.tooltip, tooltipStyle(tappedTable)]}>
            {/* Arrow pointing up */}
            {tappedTable.y + CARD + 12 + TOOLTIP_H <= (canvasDims.current.h || 9999) && (
              <View style={[s.tooltipArrow, { left: TOOLTIP_W / 2 - 8, top: -8 }]} />
            )}
            <Text style={[s.tooltipName, { fontFamily: af('bold') }]}>{tappedTable.name}</Text>
            <Text style={[s.tooltipSection, { fontFamily: af('medium') }]}>{SECTION_I18N_KEY[tappedTable.section] ? t(SECTION_I18N_KEY[tappedTable.section]) : tappedTable.section}</Text>
            <TouchableOpacity
              style={s.startOrderBtn}
              onPress={() => setGuestDialogOpen(true)}
              activeOpacity={0.85}
            >
              <Text style={[s.startOrderText, { fontFamily: af('bold') }]}>▶  {t('startOrder')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Section tabs ── */}
      <View style={s.tabBar}>
        {SECTIONS.map(sec => {
          const active = sec === activeSection;
          return (
            <TouchableOpacity
              key={sec}
              style={[s.tab, active && s.tabActive]}
              onPress={() => { setActiveSection(sec); setTappedTable(null); }}
              activeOpacity={0.7}
            >
              <Text style={[s.tabText, active && s.tabTextActive, { fontFamily: af(active ? 'bold' : 'medium') }]}>
                {SECTION_I18N_KEY[sec] ? t(SECTION_I18N_KEY[sec]) : sec}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Guest count dialog ── */}
      <GuestCountDialog
        visible={guestDialogOpen}
        tableName={tappedTable?.name ?? ''}
        section={tappedTable?.section ?? ''}
        onClose={() => setGuestDialogOpen(false)}
        onConfirm={handleStartOrder}
      />

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },

  /* Top bar */
  topBar: {
    height: 68,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  topSep: {
    width: 1,
    height: 20,
    backgroundColor: Colors.grayBorder,
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.2,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reservationsBtn: {
    height: 42,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reservationsText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    letterSpacing: -0.1,
  },
  editBtn: {
    height: 42,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.1,
  },
  doneBtn: {
    height: 42,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: -0.1,
  },

  /* Hint bar */
  hintBar: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: 9,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  hintText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
    letterSpacing: -0.1,
  },

  /* Canvas */
  canvas: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Colors.backgroundAlt,
  },

  /* Table card */
  card: {
    position: 'absolute',
    width: CARD,
    height: CARD,
    borderRadius: 14,
    borderWidth: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLifted: {
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 999,
    transform: [{ scale: 1.05 }],
  },
  cardInner: {
    flex: 1,
    padding: 11,
    justifyContent: 'space-between',
  },
  gripWrap: {
    position: 'absolute',
    top: 8,
    zIndex: 1,
  },
  cardTop: {
    gap: 4,
  },
  tableName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.05,
  },
  cardBottom: {
    gap: 3,
  },
  paidBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#D6E5CF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 1,
  },
  paidText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4D8C3A',
    letterSpacing: 0.1,
  },
  waiterText: {
    fontSize: 10,
    fontWeight: '400',
    color: Colors.grayText,
    flex: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.grayBorder,
    marginVertical: 1,
  },
  seatsText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.grayText,
  },

  /* Section tab bar */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.grayBorder,
    height: 64,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    backgroundColor: Colors.primaryLight,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.1,
  },
  tabTextActive: {
    fontWeight: '700',
    color: Colors.primary,
  },

  /* Dismiss overlay */
  dismissOverlay: {
    zIndex: 50,
  },

  /* Tooltip */
  tooltip: {
    position: 'absolute',
    zIndex: 200,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 14,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
  },
  tooltipArrow: {
    position: 'absolute',
    width: 16,
    height: 8,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.white,
  },
  tooltipName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  tooltipSection: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.05,
    marginBottom: 4,
  },
  startOrderBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3,
  },
  startOrderText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.1,
  },
});
