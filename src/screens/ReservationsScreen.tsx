import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { Colors } from '../constants/colors';
import { layout } from '../styles/screenLayout';

// ─── Icons ────────────────────────────────────────────────────────────────────
import { iconSearch } from '../assets/icons';

const ICONS = {
  search: iconSearch,
};

// ─── Types ────────────────────────────────────────────────────────────────────
type ResStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
type FilterTab = 'ALL' | ResStatus;

interface Reservation {
  id:        string;
  guest:     string;
  phone:     string;
  date:      string;
  time:      string;
  seats:     number;
  section:   string;
  tableNo:   string;
  status:    ResStatus;
  notes?:    string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK: Reservation[] = [
  { id: 'r1',  guest: 'Ahmed Al-Rashidi',   phone: '0501234567', date: 'Today',    time: '07:00 PM', seats: 4, section: 'VIP',            tableNo: 'Table 1', status: 'CONFIRMED', notes: 'Window seat preferred' },
  { id: 'r2',  guest: 'Sara Mohammed',      phone: '0559876543', date: 'Today',    time: '08:30 PM', seats: 2, section: 'Family Section', tableNo: 'Table 3', status: 'CONFIRMED' },
  { id: 'r3',  guest: 'Khalid Al-Zahrani',  phone: '0544112233', date: 'Today',    time: '09:00 PM', seats: 6, section: 'VIP',            tableNo: 'Table 2', status: 'PENDING',   notes: 'Birthday celebration' },
  { id: 'r4',  guest: 'Fatima Nasser',      phone: '0531122334', date: 'Tomorrow', time: '01:00 PM', seats: 3, section: 'Family Section', tableNo: 'Table 5', status: 'PENDING' },
  { id: 'r5',  guest: 'Omar Al-Otaibi',     phone: '0508765432', date: 'Tomorrow', time: '07:30 PM', seats: 8, section: 'Family Section', tableNo: 'Table 2', status: 'CONFIRMED', notes: 'Allergy: nuts' },
  { id: 'r6',  guest: 'Nora Al-Hamdan',     phone: '0566778899', date: 'Tomorrow', time: '08:00 PM', seats: 2, section: 'Single Section', tableNo: 'Table 1', status: 'CANCELLED' },
  { id: 'r7',  guest: 'Hassan Al-Ghamdi',   phone: '0527654321', date: 'Wed Mar 12', time: '12:30 PM', seats: 5, section: 'VIP',          tableNo: 'Table 3', status: 'CONFIRMED' },
  { id: 'r8',  guest: 'Mona Al-Shehri',     phone: '0543219876', date: 'Wed Mar 12', time: '06:00 PM', seats: 4, section: 'Family Section', tableNo: 'Table 4', status: 'PENDING',  notes: 'High chair needed' },
];

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<ResStatus, string> = {
  PENDING:   'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
};

const STATUS_COLOR: Record<ResStatus, string> = {
  PENDING:   Colors.yellowGold,
  CONFIRMED: Colors.green,
  CANCELLED: Colors.red,
};

const STATUS_BG: Record<ResStatus, string> = {
  PENDING:   '#FFF8EC',
  CONFIRMED: '#E8F5EE',
  CANCELLED: '#FAE8E8',
};

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'ALL',       label: 'All' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PENDING',   label: 'Pending' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

// ─── Drawn icons ──────────────────────────────────────────────────────────────
function CalendarIcon() {
  return (
    <View style={di.calWrap}>
      <View style={di.calTop} />
      <View style={di.calGrid}>
        {[0,1,2,3,0,1].map((_, i) => <View key={i} style={di.calDot} />)}
      </View>
    </View>
  );
}

function ClockIcon() {
  return (
    <View style={di.clock}>
      <View style={di.clockHand} />
    </View>
  );
}

function PeopleIcon() {
  return (
    <View style={di.people}>
      <View style={di.head} />
      <View style={di.body} />
    </View>
  );
}

function TableIcon() {
  return (
    <View style={di.tableWrap}>
      <View style={di.tableSurface} />
      <View style={di.tableLeg} />
    </View>
  );
}

function PhoneIcon() {
  return <View style={di.phone} />;
}

const di = StyleSheet.create({
  calWrap:   { width: 13, height: 13, borderWidth: 1.2, borderColor: Colors.grayText, borderRadius: 3, overflow: 'hidden', justifyContent: 'flex-end' },
  calTop:    { height: 4, backgroundColor: Colors.grayBorder },
  calGrid:   { flex: 1, flexDirection: 'row', flexWrap: 'wrap', padding: 1, gap: 1 },
  calDot:    { width: 2.5, height: 2.5, borderRadius: 1, backgroundColor: Colors.grayText },
  clock:     { width: 13, height: 13, borderRadius: 7, borderWidth: 1.2, borderColor: Colors.grayText, alignItems: 'center', justifyContent: 'center' },
  clockHand: { width: 1.5, height: 4, backgroundColor: Colors.grayText, marginTop: -2 },
  people:    { width: 13, height: 13, alignItems: 'center', justifyContent: 'flex-end' },
  head:      { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.grayText, marginBottom: 1 },
  body:      { width: 9, height: 5, borderRadius: 3, backgroundColor: Colors.grayText },
  tableWrap: { width: 13, height: 13, alignItems: 'center', justifyContent: 'center' },
  tableSurface: { width: 13, height: 4, borderRadius: 2, backgroundColor: Colors.grayText },
  tableLeg:  { width: 2, height: 7, backgroundColor: Colors.grayText },
  phone:     { width: 9, height: 13, borderRadius: 2, borderWidth: 1.5, borderColor: Colors.grayText },
});

// ─── Reservation card ─────────────────────────────────────────────────────────
function ReservationCard({ res }: { res: Reservation }) {
  return (
    <View style={c.card}>
      {/* Left accent bar based on status */}
      <View style={[c.accent, { backgroundColor: STATUS_COLOR[res.status] }]} />

      <View style={c.cardBody}>

        {/* Row 1: guest name + status badge */}
        <View style={c.row1}>
          <Text style={c.guestName}>{res.guest}</Text>
          <View style={[c.statusBadge, { backgroundColor: STATUS_BG[res.status] }]}>
            <View style={[c.statusDot, { backgroundColor: STATUS_COLOR[res.status] }]} />
            <Text style={[c.statusText, { color: STATUS_COLOR[res.status] }]}>
              {STATUS_LABEL[res.status]}
            </Text>
          </View>
        </View>

        {/* Row 2: details chips */}
        <View style={c.chips}>
          <View style={c.chip}>
            <CalendarIcon />
            <Text style={c.chipText}>{res.date}</Text>
          </View>
          <View style={c.chipSep} />
          <View style={c.chip}>
            <ClockIcon />
            <Text style={c.chipText}>{res.time}</Text>
          </View>
          <View style={c.chipSep} />
          <View style={c.chip}>
            <PeopleIcon />
            <Text style={c.chipText}>{res.seats} guests</Text>
          </View>
          <View style={c.chipSep} />
          <View style={c.chip}>
            <TableIcon />
            <Text style={c.chipText}>{res.tableNo} · {res.section}</Text>
          </View>
          <View style={c.chipSep} />
          <View style={c.chip}>
            <PhoneIcon />
            <Text style={c.chipText}>{res.phone}</Text>
          </View>
        </View>

        {/* Notes */}
        {res.notes && (
          <View style={c.notesRow}>
            <View style={c.notesDot} />
            <Text style={c.notesText}>{res.notes}</Text>
          </View>
        )}

      </View>

      {/* Right: action buttons */}
      {res.status !== 'CANCELLED' && (
        <View style={c.actions}>
          {res.status === 'PENDING' && (
            <TouchableOpacity style={c.confirmBtn} activeOpacity={0.8}>
              <Text style={c.confirmBtnText}>Confirm</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={c.cancelBtn} activeOpacity={0.8}>
            <Text style={c.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  onBack: () => void;
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ReservationsScreen({ onBack }: Props) {
  const searchRef = useRef<TextInput>(null);
  const [search, setSearch]         = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeFilter, setActiveFilter]   = useState<FilterTab>('ALL');

  const filtered = MOCK.filter(r => {
    const matchesFilter = activeFilter === 'ALL' || r.status === activeFilter;
    const q = search.toLowerCase();
    const matchesSearch = !q || r.guest.toLowerCase().includes(q) || r.phone.includes(q) || r.tableNo.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  // Group by date
  const groups: { date: string; items: Reservation[] }[] = [];
  for (const res of filtered) {
    const last = groups[groups.length - 1];
    if (last && last.date === res.date) {
      last.items.push(res);
    } else {
      groups.push({ date: res.date, items: [res] });
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* ── Top bar ── */}
      <View style={s.topBar}>
        <View style={s.topLeft}>
          <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.7}>
            <Text style={s.backText}>Back</Text>
          </TouchableOpacity>
          <View style={s.topSep} />
          <Text style={s.topTitle}>Reservations</Text>
        </View>
        <View style={s.topRight}>
          <View style={s.reservationCount}>
            <Text style={s.reservationCountText}>{MOCK.filter(r => r.status !== 'CANCELLED').length} active</Text>
          </View>
          <TouchableOpacity style={s.newBtn} activeOpacity={0.8}>
            <Text style={s.newBtnText}>+ New Reservation</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.content}>

        {/* ── Search ── */}
        <Pressable
          style={[layout.searchBar, searchFocused && layout.searchBarFocused, s.searchOverride]}
          onPress={() => searchRef.current?.focus()}
        >
          <View style={layout.searchIconWrap}>
            <Image source={ICONS.search} style={layout.searchIcon} />
          </View>
          <View style={layout.searchInputWrap}>
            <TextInput
              ref={searchRef}
              style={layout.searchInput}
              placeholder="Search by guest, phone or table…"
              placeholderTextColor={Colors.placeholder}
              value={search}
              onChangeText={setSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </View>
          {search.length > 0 && (
            <TouchableOpacity style={s.clearBtn} onPress={() => setSearch('')}>
              <Text style={s.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </Pressable>

        {/* ── Filter tabs ── */}
        <View style={s.filterBar}>
          {FILTER_TABS.map(tab => {
            const active = tab.key === activeFilter;
            const count  = tab.key === 'ALL' ? MOCK.length : MOCK.filter(r => r.status === tab.key).length;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[s.filterTab, active && s.filterTabActive]}
                onPress={() => setActiveFilter(tab.key)}
                activeOpacity={0.7}
              >
                <Text style={[s.filterTabText, active && s.filterTabTextActive]}>{tab.label}</Text>
                <View style={[s.filterCount, active && s.filterCountActive]}>
                  <Text style={[s.filterCountText, active && s.filterCountTextActive]}>{count}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── List ── */}
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyTitle}>No reservations found</Text>
              <Text style={s.emptySubtitle}>
                {search ? 'Try a different search term' : 'No reservations match this filter'}
              </Text>
            </View>
          ) : (
            groups.map(group => (
              <View key={group.date}>
                {/* Date group header */}
                <View style={s.groupHeader}>
                  <Text style={s.groupDate}>{group.date}</Text>
                  <View style={s.groupLine} />
                  <Text style={s.groupCount}>{group.items.length}</Text>
                </View>
                {/* Cards */}
                {group.items.map(res => (
                  <ReservationCard key={res.id} res={res} />
                ))}
              </View>
            ))
          )}
          <View style={{ height: 20 }} />
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}

// ─── Card styles ──────────────────────────────────────────────────────────────
const c = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
  },
  accent: {
    width: 4,
    borderRadius: 0,
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 10,
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guestName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  chips: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 2,
  },
  chipSep: {
    width: 1,
    height: 12,
    backgroundColor: Colors.grayBorder,
    marginHorizontal: 10,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.1,
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: Colors.grayLight,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  notesDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.yellowGold,
    flexShrink: 0,
  },
  notesText: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.05,
    flex: 1,
  },
  actions: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 16,
    paddingVertical: 16,
    gap: 8,
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3,
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.1,
  },
  cancelBtn: {
    backgroundColor: '#FAE8E8',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.red,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.red,
    letterSpacing: -0.1,
  },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
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
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reservationCount: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
  },
  reservationCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.1,
  },
  newBtn: {
    height: 42,
    paddingHorizontal: 20,
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
  newBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  searchOverride: {
    marginBottom: 14,
  },
  clearBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 14,
    color: Colors.grayText,
  },

  /* Filter tabs */
  filterBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 5,
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 4,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 10,
    borderRadius: 10,
  },
  filterTabActive: {
    backgroundColor: Colors.primaryLight,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.grayText,
    letterSpacing: -0.1,
  },
  filterTabTextActive: {
    color: Colors.primary,
  },
  filterCount: {
    minWidth: 22,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterCountActive: {
    backgroundColor: Colors.primary,
  },
  filterCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.grayText,
  },
  filterCountTextActive: {
    color: Colors.white,
  },

  /* List */
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 12,
  },

  /* Date group header */
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
    marginTop: 4,
  },
  groupDate: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  groupLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.grayBorder,
  },
  groupCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.grayText,
    backgroundColor: Colors.grayLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  /* Empty state */
  empty: {
    flex: 1,
    paddingTop: 80,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.grayText,
  },
});
