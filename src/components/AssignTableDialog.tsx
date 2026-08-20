import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Colors } from '../constants/colors';
import RootModal from './RootModal';
import { useI18n } from '../i18n';
import type { TKey } from '../i18n/translations';

// ─── Table data (mirrors TablesScreen) ────────────────────────────────────────
type TableStatus = 'available' | 'occupied' | 'paid';

interface TableItem {
  id:      string;
  name:    string;
  section: string;
  seats:   number;
  status:  TableStatus;
}

const SECTIONS = ['VIP', 'Family Section', 'Single Section'];

const ALL_TABLES: TableItem[] = [
  { id: 't1',  name: 'Table 1', section: 'VIP',            seats: 6, status: 'paid'      },
  { id: 't2',  name: 'Table 2', section: 'VIP',            seats: 7, status: 'occupied'  },
  { id: 't3',  name: 'Table 3', section: 'VIP',            seats: 4, status: 'available' },
  { id: 't4',  name: 'Table 4', section: 'VIP',            seats: 6, status: 'available' },
  { id: 't5',  name: 'Table 5', section: 'VIP',            seats: 8, status: 'occupied'  },
  { id: 't6',  name: 'Table 6', section: 'VIP',            seats: 5, status: 'available' },
  { id: 't7',  name: 'Table 1', section: 'Family Section', seats: 8, status: 'paid'      },
  { id: 't8',  name: 'Table 2', section: 'Family Section', seats: 8, status: 'occupied'  },
  { id: 't9',  name: 'Table 3', section: 'Family Section', seats: 8, status: 'occupied'  },
  { id: 't10', name: 'Table 4', section: 'Family Section', seats: 6, status: 'available' },
  { id: 't11', name: 'Table 5', section: 'Family Section', seats: 6, status: 'available' },
  { id: 't12', name: 'Table 6', section: 'Family Section', seats: 4, status: 'available' },
  { id: 't13', name: 'Table 7', section: 'Family Section', seats: 4, status: 'available' },
  { id: 't14', name: 'Table 1', section: 'Single Section', seats: 2, status: 'paid'      },
  { id: 't15', name: 'Table 2', section: 'Single Section', seats: 2, status: 'available' },
  { id: 't16', name: 'Table 3', section: 'Single Section', seats: 2, status: 'occupied'  },
  { id: 't17', name: 'Table 4', section: 'Single Section', seats: 2, status: 'available' },
];

function statusColor(status: TableStatus) {
  if (status === 'available') return Colors.green;
  if (status === 'occupied')  return Colors.red;
  return Colors.yellowGold;
}
function statusLabel(status: TableStatus, t: (key: TKey) => string) {
  if (status === 'available') return t('available');
  if (status === 'occupied')  return t('occupied');
  return t('tablePaid');
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible:         boolean;
  currentTableId?: string | null;
  onClose:         () => void;
  onAssign:        (tableId: string, tableName: string, section: string) => void;
  onClear:         () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AssignTableDialog({ visible, currentTableId, onClose, onAssign, onClear }: Props) {
  const { t, af } = useI18n();
  const [activeSection, setActiveSection] = useState(SECTIONS[0]);

  const sectionTables = ALL_TABLES.filter(t => t.section === activeSection);

  const cardJSX = (
    <View style={s.card}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={onClose} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[s.cancelText, { fontFamily: af('medium') }]}>{t('cancel')}</Text>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { fontFamily: af('semibold') }]}>{t('assignTableTitle')}</Text>
        <TouchableOpacity
          onPress={() => { onClear(); onClose(); }}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={!currentTableId}
        >
          <Text style={[s.clearText, !currentTableId && s.clearTextDisabled, { fontFamily: af('semibold') }]}>{t('remove')}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Section tabs ── */}
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

      {/* ── Table grid ── */}
      <ScrollView style={s.scroll} contentContainerStyle={s.grid} showsVerticalScrollIndicator={false}>
        {sectionTables.map(table => {
          const isSelected = table.id === currentTableId;
          return (
            <TouchableOpacity
              key={table.id}
              style={[s.tableCard, isSelected && s.tableCardSelected]}
              onPress={() => { onAssign(table.id, table.name, table.section); onClose(); }}
              activeOpacity={0.75}
            >
              <View style={[s.statusDot, { backgroundColor: statusColor(table.status) }]} />
              <Text style={[s.tableName, isSelected && s.tableNameSelected]}>{table.name}</Text>
              <Text style={[s.tableSeats, { fontFamily: af('regular') }]}>{table.seats} {t('seats')}</Text>
              <Text style={[s.tableStatus, { color: statusColor(table.status) }]}>
                {statusLabel(table.status, t)}
              </Text>
              {isSelected && <View style={s.selectedCheck}><Text style={s.selectedCheckText}>✓</Text></View>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

    </View>
  );

  return (
    <RootModal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>
      <View style={s.center} pointerEvents="box-none">
        {cardJSX}
      </View>
    </RootModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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
  inlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  card: {
    width: 500,
    maxHeight: 620,
    backgroundColor: Colors.white,
    borderRadius: 24,
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
    paddingHorizontal: 24,
    height: 64,
    backgroundColor: Colors.grayLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
    letterSpacing: -0.2,
    minWidth: 56,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.4,
  },
  clearText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.red,
    letterSpacing: -0.2,
    minWidth: 56,
    textAlign: 'right',
  },
  clearTextDisabled: {
    color: Colors.placeholder,
  },

  // ── Section tabs ──
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.grayLight,
  },
  tabActive: {
    backgroundColor: Colors.primary,
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

  // ── Grid ──
  scroll: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 10,
  },

  tableCard: {
    width: 136,
    paddingVertical: 16,
    paddingHorizontal: 14,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.grayBorder,
    gap: 4,
  },
  tableCardSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  tableName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  tableNameSelected: {
    color: Colors.primary,
  },
  tableSeats: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.1,
  },
  tableStatus: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: -0.1,
    textTransform: 'uppercase',
  },
  selectedCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  selectedCheckText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
  },
});
