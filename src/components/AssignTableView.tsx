import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';

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

const SECTIONS = ['VIP', 'Family Section', 'Single Section'];
const CARD = 130;

const ALL_TABLES: TableData[] = [
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

function borderCol(status: TableStatus): string {
  switch (status) {
    case 'paid':      return '#C9A96E';
    case 'occupied':  return Colors.red;
    case 'available': return Colors.green;
  }
}
function bgCol(status: TableStatus): string {
  switch (status) {
    case 'paid':      return 'rgba(217,192,150,0.13)';
    case 'occupied':  return 'rgba(212,87,87,0.08)';
    case 'available': return 'rgba(76,175,82,0.08)';
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

const ic = StyleSheet.create({
  clock:     { width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: Colors.grayText, alignItems: 'center', justifyContent: 'center' },
  clockHand: { width: 1.5, height: 3.5, backgroundColor: Colors.grayText, marginTop: -1 },
  person:    { width: 11, height: 11, alignItems: 'center', justifyContent: 'flex-end' },
  head:      { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.grayText, marginBottom: 1 },
  body:      { width: 8, height: 4.5, borderRadius: 2, backgroundColor: Colors.grayText },
  seats:     { flexDirection: 'row', gap: 2, alignItems: 'center' },
  seatDot:   { width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.grayText },
});

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  currentTableId?: string | null;
  onAssign:        (tableId: string, tableName: string, section: string) => void;
  onClear:         () => void;
  onBack:          () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AssignTableView({ currentTableId, onAssign, onClear, onBack }: Props) {
  const { t, af } = useI18n();
  const [activeSection, setActiveSection] = useState(SECTIONS[0]);

  const sectionTables = ALL_TABLES.filter(t => t.section === activeSection);

  // Compute canvas size from table positions
  const maxRight  = Math.max(...sectionTables.map(t => t.x + CARD));
  const maxBottom = Math.max(...sectionTables.map(t => t.y + CARD));
  const canvasW   = maxRight  + 30;
  const canvasH   = maxBottom + 30;

  return (
    <View style={s.root}>

      {/* ── Top bar ── */}
      <View style={s.topBar}>
        <View style={s.tabs}>
          {SECTIONS.map(sec => (
            <TouchableOpacity
              key={sec}
              style={[s.tab, activeSection === sec && s.tabActive]}
              onPress={() => setActiveSection(sec)}
              activeOpacity={0.7}
            >
              <Text style={[s.tabText, activeSection === sec && s.tabTextActive]}>{sec}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={s.topActions}>
          {currentTableId && (
            <TouchableOpacity style={s.clearBtn} onPress={() => { onClear(); onBack(); }} activeOpacity={0.7}>
              <Text style={[s.clearBtnText, { fontFamily: af('semibold') }]}>{t('remove')} {t('table')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.7}>
            <Text style={[s.backBtnText, { fontFamily: af('semibold') }]}>{t('back')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Legend ── */}
      <View style={s.legend}>
        {[
          { label: t('available'), color: Colors.green },
          { label: t('occupied'),  color: Colors.red },
          { label: 'Paid',        color: '#C9A96E' },
        ].map(item => (
          <View key={item.label} style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: item.color }]} />
            <Text style={s.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Canvas (absolute-positioned tables) ── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={[s.canvas, { width: canvasW, height: canvasH }]}>
            {sectionTables.map(table => {
              const isSelected = table.id === currentTableId;
              const border     = borderCol(table.status);
              const bg         = bgCol(table.status);
              return (
                <TouchableOpacity
                  key={table.id}
                  style={[
                    s.card,
                    { left: table.x, top: table.y, borderColor: border, backgroundColor: bg },
                    isSelected && s.cardSelected,
                  ]}
                  onPress={() => onAssign(table.id, table.name, table.section)}
                  activeOpacity={0.75}
                >
                  <Text style={s.cardName}>{table.name}</Text>

                  {table.timer ? (
                    <View style={s.cardRow}>
                      <ClockIcon />
                      <Text style={s.cardMeta}>{table.timer}</Text>
                    </View>
                  ) : null}

                  {table.waiter ? (
                    <View style={s.cardRow}>
                      <PersonIcon />
                      <Text style={s.cardMeta} numberOfLines={1}>{table.waiter}</Text>
                    </View>
                  ) : null}

                  <View style={[s.cardRow, s.cardRowBottom]}>
                    <SeatsIcon />
                    <Text style={s.cardMeta}>{table.seats}</Text>
                  </View>

                  {isSelected && (
                    <View style={s.selectedBadge}>
                      <Text style={s.selectedCheck}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },

  // ── Top bar ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.grayText,
    letterSpacing: -0.1,
  },
  tabTextActive: {
    color: Colors.white,
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  clearBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FAE8E8',
    borderWidth: 1,
    borderColor: Colors.red,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.red,
    letterSpacing: -0.1,
  },
  backBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.1,
  },

  // ── Legend ──
  legend: {
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.1,
  },

  // ── Canvas ──
  scroll: {
    flex: 1,
  },
  canvas: {
    position: 'relative',
  },

  // ── Table card ──
  card: {
    position: 'absolute',
    width: CARD,
    height: CARD,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardSelected: {
    borderWidth: 2.5,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardRowBottom: {
    marginTop: 'auto' as any,
  },
  cardMeta: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.1,
    flex: 1,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCheck: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
});
