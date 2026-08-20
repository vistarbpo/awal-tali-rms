import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import RootModal from '../components/RootModal';
import {
  View, Text, TouchableOpacity, TouchableWithoutFeedback, ScrollView, TextInput,
  Animated, PanResponder, StyleSheet,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';
import { AVAIL_CATEGORIES } from './ProductAvailabilityCategoriesScreen';
import { CATEGORY_PRODUCTS } from './ProductAvailabilityProductsScreen';

// ─── Data ─────────────────────────────────────────────────────────────────────

const PRINTER_MODELS: { brand: string; models: string[] }[] = [
  { brand: 'EPSON',     models: ['TM_T20', 'TM_T20II', 'TM_T20III', 'TM_m30', 'TM_m30II', 'TM_m30III', 'TM_P80', 'TM_T88V', 'TM_T20X', 'TM_L100'] },
  { brand: 'STAR',      models: ['TSP100', 'mC_Print3', 'bSC10'] },
  { brand: 'BIXOLON',   models: ['SRP_E300', 'SRP_275III', 'SRP_S300'] },
  { brand: 'HPRT',      models: ['TP80BE'] },
  { brand: 'SUNMI',     models: ['NT311'] },
  { brand: 'SNBC',      models: ['AF800N', 'AF800S'] },
  { brand: 'XPRINTER',  models: ['XP_K200L', 'XP_80T'] },
  { brand: 'HONEYWELL', models: ['PC42D'] },
];

const PRINTER_TYPES = ['Cashier', 'Kitchen', 'Order info', 'Kitchen Sticky Printer'];
const KDS_TYPES     = ['TalabOS', 'Custom'];
const ORDER_TYPES   = ['Dine In', 'Pick Up', 'Delivery', 'Drive Thru'];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PrinterDevice {
  id:                string;
  model:             string | null;
  type:              string | null;
  name:              string;
  ipAddress:         string;
  copies:            number;
  enabledOrderTypes: string[];
  online:            boolean;
}

export interface KDSDevice {
  id:                string;
  name:              string;
  ipAddress:         string;
  isActive:          boolean;
  enabledOrderTypes: string[];
  type:              string;
  enabledCategories: string[];
  enabledProducts:   string[];
  online:            boolean;
}

export interface SubCashierDevice {
  id:        string;
  name:      string;
  ipAddress: string;
  online:    boolean;
}

type SubView =
  | 'list'
  | 'printer-info' | 'model-picker' | 'printer-type-picker' | 'printer-order-types'
  | 'kds-info'     | 'kds-type-picker' | 'kds-order-types' | 'kds-categories' | 'kds-products'
  | 'sub-cashier-info';

type DeviceKind = 'printer' | 'kds' | 'sub';

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

function Hairline() {
  return <View style={s.hairline} />;
}

function GroupGap() {
  return <View style={s.groupGap} />;
}

/** Brand-orange toggle — replaces the platform Switch so both themes match. */
function BrandSwitch({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  return (
    <TouchableOpacity
      style={[sw.track, value && sw.trackOn]}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.85}
    >
      <View style={[sw.thumb, value && sw.thumbOn]} />
    </TouchableOpacity>
  );
}

const sw = StyleSheet.create({
  track:   { width: 50, height: 30, borderRadius: 15, backgroundColor: '#E4E4E7', padding: 2, justifyContent: 'center' },
  trackOn: { backgroundColor: Colors.primary },
  thumb: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.white, alignSelf: 'flex-start',
    shadowColor: Colors.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.18, shadowRadius: 2, elevation: 2,
  },
  thumbOn: { alignSelf: 'flex-end' },
});

function StatusPill({ online, pinging }: { online: boolean; pinging: boolean }) {
  const { t, af } = useI18n();
  if (pinging) {
    return (
      <View style={[s.pill, s.pillPinging]}>
        <Text style={[s.pillText, s.pillTextPinging, { fontFamily: af('semibold') }]}>{t('pinging')}</Text>
      </View>
    );
  }
  return (
    <View style={[s.pill, online ? s.pillOnline : s.pillOffline]}>
      <Text style={[s.pillText, { fontFamily: af('semibold') }]}>{online ? t('online') : t('offline')}</Text>
    </View>
  );
}

function ActionChip({ label, onPress, accent }: { label: string; onPress: () => void; accent?: boolean }) {
  const { af } = useI18n();
  return (
    <TouchableOpacity style={[s.chip, accent && s.chipAccent]} activeOpacity={0.7} onPress={onPress}>
      <Text style={[s.chipText, accent && s.chipTextAccent, { fontFamily: af('semibold') }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Swipe-to-remove row ──────────────────────────────────────────────────────

const REVEAL_W = 116;

function SwipeRow({
  children, isOpen, onOpen, onSettleClosed, onRemove,
}: {
  children:        React.ReactNode;
  isOpen:          boolean;
  onOpen:          () => void;
  onSettleClosed:  () => void;
  onRemove:        () => void;
}) {
  const { t, af, isRTL } = useI18n();
  const tx     = useRef(new Animated.Value(0)).current;
  const startX = useRef(0);
  /** Mirrors the on-screen offset. The release decision reads this rather than
   *  re-deriving from gestureState.dx, so a coarse or partly-dropped move stream
   *  can never snap the row somewhere other than where the user sees it. */
  const currentX = useRef(0);
  /** Remove sits on the leading edge: swipe right in LTR, left in RTL. */
  const dir = isRTL ? -1 : 1;
  const lo  = dir > 0 ? 0 : -REVEAL_W;
  const hi  = dir > 0 ? REVEAL_W : 0;

  const snapTo = useCallback((v: number) => {
    currentX.current = v;
    Animated.spring(tx, { toValue: v, useNativeDriver: false, bounciness: 0, speed: 18 }).start();
  }, [tx]);

  // Follow the parent's open state in both directions: it closes every other row
  // when one opens, and an externally-set open row must actually render open.
  useEffect(() => { snapTo(isOpen ? dir * REVEAL_W : 0); }, [isOpen, dir, snapTo]);

  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, g) =>
      Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
    onPanResponderGrant: () => { startX.current = isOpen ? dir * REVEAL_W : 0; },
    onPanResponderMove: (_, g) => {
      const next = Math.min(Math.max(startX.current + g.dx, lo), hi);
      currentX.current = next;
      tx.setValue(next);
    },
    onPanResponderRelease: (_, g) => {
      // Fall back to gestureState only if no move ever landed.
      const at     = currentX.current !== startX.current ? currentX.current : startX.current + g.dx;
      const opened = dir > 0 ? at > REVEAL_W * 0.4 : at < -REVEAL_W * 0.4;
      if (opened) { onOpen(); snapTo(dir * REVEAL_W); }
      else        { onSettleClosed(); snapTo(0); }
    },
    onPanResponderTerminate: () => snapTo(isOpen ? dir * REVEAL_W : 0),
  }), [isOpen, dir, lo, hi, onOpen, onSettleClosed, snapTo, tx]);

  return (
    <View style={s.swipeWrap}>
      <View style={[s.removeLayer, isRTL ? { right: 0 } : { left: 0 }]}>
        <TouchableOpacity style={s.removeBtn} activeOpacity={0.85} onPress={onRemove}>
          <Text style={s.removeIcon}>✕</Text>
          <Text style={[s.removeLabel, { fontFamily: af('semibold') }]}>{t('remove')}</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[s.swipeFace, { transform: [{ translateX: tx }] }]} {...pan.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

// ─── Row / header primitives ──────────────────────────────────────────────────
// Defined at module level: nesting them inside DevicesScreen would give React a
// new component type every render, remounting each TextInput (losing focus on
// every keystroke) and resetting every SwipeRow animation.

function Header({
  leftLabel, onLeft, title, rightLabel, onRight, plus,
}: {
  leftLabel: string; onLeft: () => void; title: string;
  rightLabel?: string; onRight?: () => void; plus?: boolean;
}) {
  const { af } = useI18n();
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onLeft} style={s.headerSide} activeOpacity={0.7}>
        <Text style={[s.headerAction, { fontFamily: af('medium') }]}>{leftLabel}</Text>
      </TouchableOpacity>

      <Text style={[s.headerTitle, { fontFamily: af('semibold') }]} numberOfLines={1}>{title}</Text>

      {plus ? (
        <TouchableOpacity onPress={onRight} style={s.headerSideRight} activeOpacity={0.7}>
          <View style={s.plusBtn}><Text style={s.plusGlyph}>+</Text></View>
        </TouchableOpacity>
      ) : rightLabel ? (
        <TouchableOpacity onPress={onRight} style={s.headerSideRight} activeOpacity={0.7}>
          <Text style={[s.headerAction, { fontFamily: af('medium') }]} numberOfLines={1}>{rightLabel}</Text>
        </TouchableOpacity>
      ) : (
        <View style={s.headerSideRight} />
      )}
    </View>
  );
}

function ToggleRow({
  label, value, onToggle, onPressLabel,
}: {
  label: string; value: boolean; onToggle: () => void; onPressLabel?: () => void;
}) {
  const { af, isRTL } = useI18n();
  return (
    <View style={s.row}>
      {onPressLabel ? (
        <TouchableOpacity style={s.toggleLabelHit} activeOpacity={0.6} onPress={onPressLabel}>
          <Text style={[s.rowLabelInline, { fontFamily: af() }]} numberOfLines={1}>{label}</Text>
          <Text style={s.drillChevron}>{isRTL ? '‹' : '›'}</Text>
        </TouchableOpacity>
      ) : (
        <Text style={[s.rowLabel, { fontFamily: af() }]} numberOfLines={1}>{label}</Text>
      )}
      <BrandSwitch value={value} onValueChange={onToggle} />
    </View>
  );
}

function NavRow({
  label, value, onPress,
}: {
  label: string; value?: string | null; onPress: () => void;
}) {
  const { t, af, isRTL } = useI18n();
  return (
    <TouchableOpacity style={s.row} activeOpacity={0.7} onPress={onPress}>
      <Text style={[s.rowLabel, { fontFamily: af() }]}>{label}</Text>
      <View style={s.rowRight}>
        <Text style={value ? s.rowValue : s.rowPlaceholder} numberOfLines={1}>
          {value ?? t('notSet')}
        </Text>
        <Text style={s.chevron}>{isRTL ? '‹' : '›'}</Text>
      </View>
    </TouchableOpacity>
  );
}

function DeviceRow({
  name, ip, online, pinging, chips, isOpen, onOpen, onSettleClosed, onRemove,
}: {
  name: string; ip: string; online: boolean; pinging: boolean;
  chips: { label: string; onPress: () => void; accent?: boolean }[];
  isOpen: boolean; onOpen: () => void; onSettleClosed: () => void; onRemove: () => void;
}) {
  const { af } = useI18n();
  return (
    <SwipeRow isOpen={isOpen} onOpen={onOpen} onSettleClosed={onSettleClosed} onRemove={onRemove}>
      <View style={s.deviceRow}>
        <View style={s.deviceIdent}>
          <View style={s.deviceNameLine}>
            <Text style={[s.deviceName, { fontFamily: af('semibold') }]} numberOfLines={1}>{name}</Text>
            <StatusPill online={online} pinging={pinging} />
          </View>
          <Text style={s.deviceIp} numberOfLines={1}>{ip}</Text>
        </View>

        <View style={s.chipRow}>
          {chips.map(c => <ActionChip key={c.label} label={c.label} onPress={c.onPress} accent={c.accent} />)}
        </View>
      </View>
    </SwipeRow>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible: boolean;
  onClose: () => void;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
const BLANK_PRINTER: PrinterDevice = {
  id: '', model: null, type: null, name: '', ipAddress: '', copies: 1, enabledOrderTypes: [], online: true,
};
const BLANK_KDS: KDSDevice = {
  id: '', name: '', ipAddress: '', isActive: true, enabledOrderTypes: [], type: 'TalabOS',
  enabledCategories: [], enabledProducts: [], online: true,
};
const BLANK_SUB_CASHIER: SubCashierDevice = { id: '', name: '', ipAddress: '', online: true };

const SEED_PRINTERS: PrinterDevice[] = [
  { id: 'printer-1', model: 'TM_T20II', type: 'Cashier', name: 'Cashier', ipAddress: '192.168.100.143', copies: 1, enabledOrderTypes: ['Dine In', 'Pick Up'], online: true },
];
const SEED_KDS: KDSDevice[] = [
  { id: 'kds-1', name: 'KDS-01', ipAddress: '192.168.100.190', isActive: true,  enabledOrderTypes: ['Delivery', 'Pick Up'], type: 'TalabOS', enabledCategories: ['c1', 'c6'], enabledProducts: ['p4', 'p5'], online: false },
  { id: 'kds-2', name: 'KDS-03', ipAddress: '192.168.100.168', isActive: true,  enabledOrderTypes: ['Delivery', 'Pick Up', 'Drive Thru'], type: 'TalabOS', enabledCategories: ['c6'], enabledProducts: ['p4'], online: true },
  { id: 'kds-3', name: 'KDS-02', ipAddress: '192.168.100.196', isActive: false, enabledOrderTypes: ['Dine In'], type: 'Custom', enabledCategories: [], enabledProducts: [], online: false },
];
const SEED_SUB_CASHIERS: SubCashierDevice[] = [
  { id: 'sub-1', name: '2nd Floor Cashier', ipAddress: '192.168.100.184', online: false },
];

// ─── Preview staging ──────────────────────────────────────────────────────────
// Opens the modal straight onto one sub-view for Figma capture. Same convention
// as PREVIEW_DIALOG elsewhere — REVERT to null after capturing.
//   'add-menu' | 'swiped' | 'printer-info' | 'model-picker' | 'printer-type-picker'
// | 'printer-order-types' | 'kds-info' | 'kds-type-picker' | 'kds-order-types'
// | 'kds-categories' | 'kds-products' | 'sub-cashier-info' | null
const PREVIEW_SUBVIEW: string | null = null;

const OVERLAY_PREVIEWS = ['add-menu', 'swiped'];
const PREVIEW_VIEW: SubView | null =
  PREVIEW_SUBVIEW && !OVERLAY_PREVIEWS.includes(PREVIEW_SUBVIEW) ? PREVIEW_SUBVIEW as SubView : null;

// ─── Component ────────────────────────────────────────────────────────────────
export default function DevicesScreen({ visible, onClose }: Props) {
  const { t, af, isRTL } = useI18n();
  const [subView, setSubView]         = useState<SubView>(PREVIEW_VIEW ?? 'list');
  const [addMenuOpen, setAddMenuOpen] = useState(PREVIEW_SUBVIEW === 'add-menu');

  const [printers,    setPrinters]    = useState<PrinterDevice[]>(SEED_PRINTERS);
  const [kdsDevices,  setKdsDevices]  = useState<KDSDevice[]>(SEED_KDS);
  const [subCashiers, setSubCashiers] = useState<SubCashierDevice[]>(SEED_SUB_CASHIERS);

  const [printerDraft,    setPrinterDraft]    = useState<PrinterDevice>(PREVIEW_SUBVIEW ? SEED_PRINTERS[0] : BLANK_PRINTER);
  const [kdsDraft,        setKdsDraft]        = useState<KDSDevice>(PREVIEW_SUBVIEW ? SEED_KDS[1] : BLANK_KDS);
  const [subCashierDraft, setSubCashierDraft] = useState<SubCashierDevice>(PREVIEW_SUBVIEW ? SEED_SUB_CASHIERS[0] : BLANK_SUB_CASHIER);

  /** Row currently swiped open — only one at a time. */
  const [openRowId, setOpenRowId] = useState<string | null>(PREVIEW_SUBVIEW === 'swiped' ? 'kds-2' : null);
  const [pingingId, setPingingId] = useState<string | null>(null);
  const pingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Category whose products are being edited; null = every product. */
  const [scopedCategory, setScopedCategory] = useState<{ id: string; name: string } | null>(
    PREVIEW_SUBVIEW === 'kds-products' ? { id: 'c6', name: 'MAIN DISHES' } : null,
  );

  useEffect(() => () => { if (pingTimer.current) clearTimeout(pingTimer.current); }, []);

  // ── Handlers ──

  function handleAddDevice(kind: DeviceKind) {
    setAddMenuOpen(false);
    if (kind === 'printer') { setPrinterDraft(BLANK_PRINTER);        setSubView('printer-info'); }
    if (kind === 'kds')     { setKdsDraft(BLANK_KDS);                setSubView('kds-info'); }
    if (kind === 'sub')     { setSubCashierDraft(BLANK_SUB_CASHIER); setSubView('sub-cashier-info'); }
  }

  function handleSavePrinter() {
    setPrinters(prev => printerDraft.id
      ? prev.map(p => p.id === printerDraft.id ? printerDraft : p)
      : [...prev, { ...printerDraft, id: `printer-${Date.now()}` }]);
    setSubView('list');
  }

  function handleSaveKDS() {
    setKdsDevices(prev => kdsDraft.id
      ? prev.map(k => k.id === kdsDraft.id ? kdsDraft : k)
      : [...prev, { ...kdsDraft, id: `kds-${Date.now()}` }]);
    setSubView('list');
  }

  function handleSaveSubCashier() {
    setSubCashiers(prev => subCashierDraft.id
      ? prev.map(c => c.id === subCashierDraft.id ? subCashierDraft : c)
      : [...prev, { ...subCashierDraft, id: `sub-${Date.now()}` }]);
    setSubView('list');
  }

  function handleRemove(kind: DeviceKind, id: string) {
    setOpenRowId(null);
    if (kind === 'printer') setPrinters(prev => prev.filter(p => p.id !== id));
    if (kind === 'kds')     setKdsDevices(prev => prev.filter(k => k.id !== id));
    if (kind === 'sub')     setSubCashiers(prev => prev.filter(c => c.id !== id));
  }

  function handlePing(id: string) {
    if (pingTimer.current) clearTimeout(pingTimer.current);
    setPingingId(id);
    pingTimer.current = setTimeout(() => setPingingId(null), 900);
  }

  /** Products always enters through the category list, against a saved device. */
  function openMenuScreen(device: KDSDevice) {
    setKdsDraft(device);
    setScopedCategory(null);
    setSubView('kds-categories');
  }

  function toggleOrderType(list: string[], type: string) {
    return list.includes(type) ? list.filter(x => x !== type) : [...list, type];
  }

  /** Category / product screens have no Save button — edits persist immediately. */
  function commitKdsDraft(next: KDSDevice) {
    setKdsDraft(next);
    if (next.id) setKdsDevices(prev => prev.map(k => k.id === next.id ? next : k));
  }

  function toggleCategory(id: string) {
    commitKdsDraft({
      ...kdsDraft,
      enabledCategories: kdsDraft.enabledCategories.includes(id)
        ? kdsDraft.enabledCategories.filter(x => x !== id)
        : [...kdsDraft.enabledCategories, id],
    });
  }

  function toggleProduct(id: string) {
    commitKdsDraft({
      ...kdsDraft,
      enabledProducts: kdsDraft.enabledProducts.includes(id)
        ? kdsDraft.enabledProducts.filter(x => x !== id)
        : [...kdsDraft.enabledProducts, id],
    });
  }

  function handleClose() {
    setSubView('list');
    setAddMenuOpen(false);
    setOpenRowId(null);
    onClose();
  }

  function goBackToList() {
    setSubView('list');
    setOpenRowId(null);
  }

  const visibleProducts = scopedCategory ? (CATEGORY_PRODUCTS[scopedCategory.id] ?? []) : [];
  const allProductsOn   = visibleProducts.length > 0 && visibleProducts.every(p => kdsDraft.enabledProducts.includes(p.id));
  const allCategoriesOn = AVAIL_CATEGORIES.every(c => kdsDraft.enabledCategories.includes(c.id));

  function selectAllCategories() {
    commitKdsDraft({
      ...kdsDraft,
      enabledCategories: allCategoriesOn ? [] : AVAIL_CATEGORIES.map(c => c.id),
    });
  }

  function selectAllProducts() {
    const ids  = visibleProducts.map(p => p.id);
    const kept = kdsDraft.enabledProducts.filter(id => !ids.includes(id));
    commitKdsDraft({
      ...kdsDraft,
      enabledProducts: allProductsOn ? kept : [...kept, ...ids],
    });
  }

  const hasNoDevices = printers.length === 0 && kdsDevices.length === 0 && subCashiers.length === 0;

  /** Wires a saved device into the shared swipe/ping state. */
  function rowState(kind: DeviceKind, id: string) {
    return {
      pinging:        pingingId === id,
      isOpen:         openRowId === id,
      onOpen:         () => setOpenRowId(id),
      onSettleClosed: () => setOpenRowId(prev => (prev === id ? null : prev)),
      onRemove:       () => handleRemove(kind, id),
    };
  }

  return (
    <RootModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={() => {
        if (addMenuOpen) setAddMenuOpen(false);
        if (openRowId)   setOpenRowId(null);
      }}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>

      <View style={s.center} pointerEvents="box-none">
        <View style={s.card}>

          {/* ── Device List ── */}
          {subView === 'list' && (
            <>
              <Header
                leftLabel={t('close')} onLeft={handleClose}
                title={t('devices')} onRight={() => setAddMenuOpen(p => !p)} plus
              />

              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                {printers.length > 0 && (
                  <>
                    <SectionHeader title={t('printers')} />
                    <View style={s.group}>
                      {printers.map((p, i) => (
                        <React.Fragment key={p.id}>
                          {i > 0 && <Hairline />}
                          <DeviceRow
                            {...rowState('printer', p.id)}
                            online={p.online}
                            name={p.name || 'Unnamed Printer'} ip={p.ipAddress}
                            chips={[
                              { label: t('ping'), onPress: () => handlePing(p.id) },
                              { label: t('edit'), onPress: () => { setPrinterDraft(p); setSubView('printer-info'); }, accent: true },
                            ]}
                          />
                        </React.Fragment>
                      ))}
                    </View>
                  </>
                )}

                {subCashiers.length > 0 && (
                  <>
                    <SectionHeader title={t('subCashiers')} />
                    <View style={s.group}>
                      {subCashiers.map((c, i) => (
                        <React.Fragment key={c.id}>
                          {i > 0 && <Hairline />}
                          <DeviceRow
                            {...rowState('sub', c.id)}
                            online={c.online}
                            name={c.name || 'Sub Cashier'} ip={c.ipAddress}
                            chips={[
                              { label: t('ping'), onPress: () => handlePing(c.id) },
                              { label: t('edit'), onPress: () => { setSubCashierDraft(c); setSubView('sub-cashier-info'); }, accent: true },
                            ]}
                          />
                        </React.Fragment>
                      ))}
                    </View>
                  </>
                )}

                {kdsDevices.length > 0 && (
                  <>
                    <SectionHeader title={t('kdsSection')} />
                    <View style={s.group}>
                      {kdsDevices.map((k, i) => (
                        <React.Fragment key={k.id}>
                          {i > 0 && <Hairline />}
                          <DeviceRow
                            {...rowState('kds', k.id)}
                            online={k.online}
                            name={k.name || 'KDS Device'} ip={k.ipAddress}
                            chips={[
                              { label: t('ping'),     onPress: () => handlePing(k.id) },
                              { label: t('products'), onPress: () => openMenuScreen(k) },
                              { label: t('edit'),     onPress: () => { setKdsDraft(k); setSubView('kds-info'); }, accent: true },
                            ]}
                          />
                        </React.Fragment>
                      ))}
                    </View>
                  </>
                )}

                {hasNoDevices ? (
                  <View style={s.emptyState}>
                    <Text style={[s.emptyText, { fontFamily: af('medium') }]}>{t('noDevices')}</Text>
                    <Text style={[s.emptyHint, { fontFamily: af() }]}>{t('noDevicesHint')}</Text>
                  </View>
                ) : (
                  <Text style={[s.swipeHint, { fontFamily: af() }]}>{t('swipeToRemove')}</Text>
                )}

                <View style={s.bottomPad} />
              </ScrollView>

              {addMenuOpen && (
                <View style={[s.addMenu, isRTL ? { right: undefined, left: 16 } : {}]}>
                  {([
                    ['printer', t('addPrinter')],
                    ['kds',     t('addKds')],
                    ['sub',     t('addSubCashier')],
                  ] as [DeviceKind, string][]).map(([kind, label], i) => (
                    <React.Fragment key={kind}>
                      {i > 0 && <Hairline />}
                      <TouchableOpacity style={s.addMenuItem} activeOpacity={0.7} onPress={() => handleAddDevice(kind)}>
                        <Text style={[s.addMenuLabel, { fontFamily: af('medium') }]}>{label}</Text>
                      </TouchableOpacity>
                    </React.Fragment>
                  ))}
                </View>
              )}
            </>
          )}

          {/* ── Printer Info ── */}
          {subView === 'printer-info' && (
            <>
              <Header
                leftLabel={t('back')} onLeft={goBackToList}
                title={t('printerInfo')}
                rightLabel={t('save')} onRight={handleSavePrinter}
              />

              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                <View style={s.groupTop}>
                  <NavRow label={t('deviceModel')} value={printerDraft.model} onPress={() => setSubView('model-picker')} />
                  <Hairline />
                  <NavRow label={t('deviceType')} value={printerDraft.type} onPress={() => setSubView('printer-type-picker')} />
                  <Hairline />
                  <View style={s.row}>
                    <Text style={[s.rowLabel, { fontFamily: af() }]}>{t('deviceName')}</Text>
                    <TextInput
                      style={s.rowInput}
                      value={printerDraft.name}
                      onChangeText={v => setPrinterDraft(p => ({ ...p, name: v }))}
                      placeholder="Drinks printer"
                      placeholderTextColor={Colors.placeholder}
                    />
                  </View>
                  <Hairline />
                  <View style={s.row}>
                    <Text style={[s.rowLabel, { fontFamily: af() }]}>{t('ipAddress')}</Text>
                    <TextInput
                      style={s.rowInput}
                      value={printerDraft.ipAddress}
                      onChangeText={v => setPrinterDraft(p => ({ ...p, ipAddress: v }))}
                      placeholder="192.168.1.10"
                      placeholderTextColor={Colors.placeholder}
                      keyboardType="numeric"
                    />
                  </View>
                  <Hairline />
                  <View style={s.row}>
                    <Text style={[s.rowLabel, { fontFamily: af() }]}>{t('numberOfCopies')}</Text>
                    <View style={s.stepper}>
                      <TouchableOpacity
                        style={[s.stepBtn, printerDraft.copies <= 1 && s.stepBtnOff]}
                        activeOpacity={0.7}
                        disabled={printerDraft.copies <= 1}
                        onPress={() => setPrinterDraft(p => ({ ...p, copies: Math.max(1, p.copies - 1) }))}
                      >
                        <Text style={[s.stepGlyph, printerDraft.copies <= 1 && s.stepGlyphOff]}>−</Text>
                      </TouchableOpacity>
                      <Text style={s.stepValue}>{printerDraft.copies}</Text>
                      <TouchableOpacity
                        style={[s.stepBtn, printerDraft.copies >= 9 && s.stepBtnOff]}
                        activeOpacity={0.7}
                        disabled={printerDraft.copies >= 9}
                        onPress={() => setPrinterDraft(p => ({ ...p, copies: Math.min(9, p.copies + 1) }))}
                      >
                        <Text style={[s.stepGlyph, printerDraft.copies >= 9 && s.stepGlyphOff]}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Hairline />
                  <NavRow
                    label={t('enabledOrderTypes')}
                    value={printerDraft.enabledOrderTypes.length > 0 ? printerDraft.enabledOrderTypes.join(', ') : null}
                    onPress={() => setSubView('printer-order-types')}
                  />
                </View>
                <View style={s.bottomPad} />
              </ScrollView>
            </>
          )}

          {/* ── Model Picker ── */}
          {subView === 'model-picker' && (
            <>
              <Header leftLabel={t('back')} onLeft={() => setSubView('printer-info')} title={t('deviceModel')} />

              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                {PRINTER_MODELS.map(brand => (
                  <React.Fragment key={brand.brand}>
                    <SectionHeader title={brand.brand} />
                    <View style={s.group}>
                      {brand.models.map((model, i) => (
                        <React.Fragment key={`${brand.brand}-${model}`}>
                          {i > 0 && <Hairline />}
                          <TouchableOpacity style={s.row} activeOpacity={0.7}
                            onPress={() => { setPrinterDraft(p => ({ ...p, model })); setSubView('printer-info'); }}>
                            <Text style={s.rowLabel}>{model}</Text>
                            {printerDraft.model === model && <Text style={s.checkmark}>✓</Text>}
                          </TouchableOpacity>
                        </React.Fragment>
                      ))}
                    </View>
                  </React.Fragment>
                ))}
                <View style={s.bottomPad} />
              </ScrollView>
            </>
          )}

          {/* ── Printer Type Picker ── */}
          {subView === 'printer-type-picker' && (
            <>
              <Header leftLabel={t('back')} onLeft={() => setSubView('printer-info')} title={t('deviceType')} />

              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                <View style={s.groupTop}>
                  {PRINTER_TYPES.map((type, i) => (
                    <React.Fragment key={type}>
                      {i > 0 && <Hairline />}
                      <TouchableOpacity style={s.row} activeOpacity={0.7}
                        onPress={() => { setPrinterDraft(p => ({ ...p, type })); setSubView('printer-info'); }}>
                        <Text style={[s.rowLabel, { fontFamily: af() }]}>{type}</Text>
                        {printerDraft.type === type && <Text style={s.checkmark}>✓</Text>}
                      </TouchableOpacity>
                    </React.Fragment>
                  ))}
                </View>
                <View style={s.bottomPad} />
              </ScrollView>
            </>
          )}

          {/* ── Printer Order Types Picker ── */}
          {subView === 'printer-order-types' && (
            <>
              <Header leftLabel={t('back')} onLeft={() => setSubView('printer-info')} title={t('enabledOrderTypes')} />

              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                <View style={s.groupTop}>
                  {ORDER_TYPES.map((type, i) => (
                    <React.Fragment key={type}>
                      {i > 0 && <Hairline />}
                      <ToggleRow
                        label={type}
                        value={printerDraft.enabledOrderTypes.includes(type)}
                        onToggle={() => setPrinterDraft(p => ({ ...p, enabledOrderTypes: toggleOrderType(p.enabledOrderTypes, type) }))}
                      />
                    </React.Fragment>
                  ))}
                </View>
                <View style={s.bottomPad} />
              </ScrollView>
            </>
          )}

          {/* ── KDS Info ── */}
          {subView === 'kds-info' && (
            <>
              <Header
                leftLabel={t('back')} onLeft={goBackToList}
                title={t('kdsInfo')}
                rightLabel={t('save')} onRight={handleSaveKDS}
              />

              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                <View style={s.groupTop}>
                  <View style={s.row}>
                    <Text style={[s.rowLabel, { fontFamily: af() }]}>{t('deviceName')}</Text>
                    <TextInput
                      style={s.rowInput}
                      value={kdsDraft.name}
                      onChangeText={v => setKdsDraft(k => ({ ...k, name: v }))}
                      placeholder="KDS-01"
                      placeholderTextColor={Colors.placeholder}
                    />
                  </View>
                  <Hairline />
                  <View style={s.row}>
                    <Text style={[s.rowLabel, { fontFamily: af() }]}>{t('ipAddress')}</Text>
                    <TextInput
                      style={s.rowInput}
                      value={kdsDraft.ipAddress}
                      onChangeText={v => setKdsDraft(k => ({ ...k, ipAddress: v }))}
                      placeholder="192.168.1.10"
                      placeholderTextColor={Colors.placeholder}
                      keyboardType="numeric"
                    />
                  </View>
                  <Hairline />
                  <ToggleRow
                    label={t('isActive')}
                    value={kdsDraft.isActive}
                    onToggle={() => setKdsDraft(k => ({ ...k, isActive: !k.isActive }))}
                  />
                  <Hairline />
                  <NavRow
                    label={t('enabledOrderTypes')}
                    value={kdsDraft.enabledOrderTypes.length > 0 ? kdsDraft.enabledOrderTypes.join(', ') : null}
                    onPress={() => setSubView('kds-order-types')}
                  />
                </View>

                <GroupGap />

                <View style={s.group}>
                  <NavRow
                    label={t('products')}
                    value={kdsDraft.enabledProducts.length > 0 ? `${kdsDraft.enabledProducts.length}` : null}
                    onPress={() => { setScopedCategory(null); setSubView('kds-categories'); }}
                  />
                  <Hairline />
                  <NavRow label={t('deviceType')} value={kdsDraft.type} onPress={() => setSubView('kds-type-picker')} />
                </View>

                <View style={s.bottomPad} />
              </ScrollView>
            </>
          )}

          {/* ── KDS Type Picker ── */}
          {subView === 'kds-type-picker' && (
            <>
              <Header leftLabel={t('back')} onLeft={() => setSubView('kds-info')} title={t('deviceType')} />

              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                <View style={s.groupTop}>
                  {KDS_TYPES.map((type, i) => (
                    <React.Fragment key={type}>
                      {i > 0 && <Hairline />}
                      <TouchableOpacity style={s.row} activeOpacity={0.7}
                        onPress={() => { setKdsDraft(k => ({ ...k, type })); setSubView('kds-info'); }}>
                        <Text style={[s.rowLabel, { fontFamily: af() }]}>{type}</Text>
                        {kdsDraft.type === type && <Text style={s.checkmark}>✓</Text>}
                      </TouchableOpacity>
                    </React.Fragment>
                  ))}
                </View>
                <View style={s.bottomPad} />
              </ScrollView>
            </>
          )}

          {/* ── KDS Order Types Picker ── */}
          {subView === 'kds-order-types' && (
            <>
              <Header leftLabel={t('back')} onLeft={() => setSubView('kds-info')} title={t('enabledOrderTypes')} />

              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                <View style={s.groupTop}>
                  {ORDER_TYPES.map((type, i) => (
                    <React.Fragment key={type}>
                      {i > 0 && <Hairline />}
                      <ToggleRow
                        label={type}
                        value={kdsDraft.enabledOrderTypes.includes(type)}
                        onToggle={() => setKdsDraft(k => ({ ...k, enabledOrderTypes: toggleOrderType(k.enabledOrderTypes, type) }))}
                      />
                    </React.Fragment>
                  ))}
                </View>
                <View style={s.bottomPad} />
              </ScrollView>
            </>
          )}

          {/* ── KDS Categories ── */}
          {subView === 'kds-categories' && (
            <>
              <Header
                leftLabel={t('back')} onLeft={() => setSubView('list')}
                title={t('categories')}
                rightLabel={allCategoriesOn ? t('deselectAll') : t('selectAll')} onRight={selectAllCategories}
              />

              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                <Text style={[s.screenHint, { fontFamily: af() }]}>
                  {kdsDraft.name || t('kdsSection')} · {kdsDraft.ipAddress}
                </Text>
                <View style={s.groupTop}>
                  {AVAIL_CATEGORIES.map((cat, i) => (
                    <React.Fragment key={cat.id}>
                      {i > 0 && <Hairline />}
                      <ToggleRow
                        label={cat.name}
                        value={kdsDraft.enabledCategories.includes(cat.id)}
                        onToggle={() => toggleCategory(cat.id)}
                        onPressLabel={() => { setScopedCategory({ id: cat.id, name: cat.name }); setSubView('kds-products'); }}
                      />
                    </React.Fragment>
                  ))}
                </View>
                <View style={s.bottomPad} />
              </ScrollView>
            </>
          )}

          {/* ── KDS Products ── */}
          {subView === 'kds-products' && (
            <>
              <Header
                leftLabel={t('back')}
                onLeft={() => { setScopedCategory(null); setSubView('kds-categories'); }}
                title={scopedCategory ? scopedCategory.name : t('products')}
                rightLabel={allProductsOn ? t('deselectAll') : t('selectAll')} onRight={selectAllProducts}
              />

              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                <Text style={[s.screenHint, { fontFamily: af() }]}>
                  {kdsDraft.name || t('kdsSection')} · {kdsDraft.ipAddress}
                </Text>
                <View style={s.groupTop}>
                  {visibleProducts.map((p, i) => (
                    <React.Fragment key={p.id}>
                      {i > 0 && <Hairline />}
                      <ToggleRow
                        label={p.name}
                        value={kdsDraft.enabledProducts.includes(p.id)}
                        onToggle={() => toggleProduct(p.id)}
                      />
                    </React.Fragment>
                  ))}
                </View>
                <View style={s.bottomPad} />
              </ScrollView>
            </>
          )}

          {/* ── Sub Cashier Info ── */}
          {subView === 'sub-cashier-info' && (
            <>
              <Header
                leftLabel={t('back')} onLeft={goBackToList}
                title={t('subCashierInfo')}
                rightLabel={t('save')} onRight={handleSaveSubCashier}
              />

              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                <View style={s.groupTop}>
                  <View style={s.row}>
                    <Text style={[s.rowLabel, { fontFamily: af() }]}>{t('deviceName')}</Text>
                    <TextInput
                      style={s.rowInput}
                      value={subCashierDraft.name}
                      onChangeText={v => setSubCashierDraft(c => ({ ...c, name: v }))}
                      placeholder="2nd Floor Cashier"
                      placeholderTextColor={Colors.placeholder}
                    />
                  </View>
                  <Hairline />
                  <View style={s.row}>
                    <Text style={[s.rowLabel, { fontFamily: af() }]}>{t('ipAddress')}</Text>
                    <TextInput
                      style={s.rowInput}
                      value={subCashierDraft.ipAddress}
                      onChangeText={v => setSubCashierDraft(c => ({ ...c, ipAddress: v }))}
                      placeholder="192.168.1.10"
                      placeholderTextColor={Colors.placeholder}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View style={s.bottomPad} />
              </ScrollView>
            </>
          )}

        </View>
      </View>
    </RootModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_W = 720;

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
    maxHeight: 720,
    backgroundColor: Colors.background,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 34,
    elevation: 16,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 18,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  headerSide: {
    width: 108,
  },
  headerSideRight: {
    width: 108,
    alignItems: 'flex-end',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  headerAction: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  plusBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusGlyph: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '400',
    color: Colors.white,
  },

  // ── Section ──
  sectionHeader: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.grayText,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  screenHint: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 10,
    fontSize: 12.5,
    color: Colors.grayText,
    letterSpacing: -0.1,
  },
  swipeHint: {
    paddingHorizontal: 22,
    paddingTop: 16,
    fontSize: 12.5,
    color: Colors.placeholder,
    textAlign: 'center',
  },

  // ── Group card ──
  group: {
    marginHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  groupTop: {
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  groupGap: {
    height: 16,
  },

  // ── Rows ──
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 15,
    minHeight: 58,
    backgroundColor: Colors.white,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.2,
  },
  rowLabelInline: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.2,
  },
  toggleLabelHit: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    paddingVertical: 4,
    paddingEnd: 12,
  },
  drillChevron: {
    fontSize: 20,
    lineHeight: 22,
    color: Colors.primary,
    fontWeight: '700',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontSize: 15,
    color: Colors.grayText,
    letterSpacing: -0.2,
    maxWidth: 260,
    textAlign: 'right',
  },
  rowPlaceholder: {
    fontSize: 15,
    color: Colors.placeholder,
    letterSpacing: -0.2,
  },
  rowInput: {
    fontSize: 15,
    color: Colors.black,
    textAlign: 'right',
    flex: 1,
    letterSpacing: -0.2,
    outlineWidth: 0,
    outlineStyle: 'none',
  } as any,
  chevron: {
    fontSize: 20,
    color: Colors.grayText,
    marginStart: 2,
  },
  checkmark: {
    fontSize: 17,
    color: Colors.primary,
    fontWeight: '700',
  },
  hairline: {
    height: 1,
    backgroundColor: Colors.grayBorder,
    marginStart: 18,
  },

  // ── Device row ──
  swipeWrap: {
    position: 'relative',
    overflow: 'hidden',
    // No red fill here — the reveal layer supplies it. A red wrap bled a
    // hairline past the face's edge at fractional device pixels.
    backgroundColor: Colors.white,
  },
  removeLayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: REVEAL_W,
  },
  removeBtn: {
    flex: 1,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  removeIcon: {
    fontSize: 17,
    color: Colors.white,
    fontWeight: '600',
  },
  removeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.1,
  },
  swipeFace: {
    backgroundColor: Colors.white,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    minHeight: 84,
    backgroundColor: Colors.white,
  },
  deviceIdent: {
    flex: 1,
    gap: 3,
    paddingEnd: 12,
    // Cross-axis start flips with writing direction, so the name and the IP
    // beneath it hug the same edge in both LTR and RTL.
    alignItems: 'flex-start',
  },
  deviceNameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.25,
    flexShrink: 1,
  },
  deviceIp: {
    fontSize: 12.5,
    color: Colors.grayText,
    letterSpacing: -0.1,
  },

  // ── Status pill ──
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pillOnline:  { backgroundColor: Colors.green },
  pillOffline: { backgroundColor: Colors.red },
  pillPinging: { backgroundColor: Colors.primaryLight },
  pillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.1,
  },
  pillTextPinging: { color: Colors.primary },

  // ── Action chips ──
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chip: {
    height: 50,
    minWidth: 112,
    paddingHorizontal: 20,
    borderRadius: 13,
    backgroundColor: Colors.grayLight,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipAccent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.1,
  },
  chipTextAccent: {
    color: Colors.white,
  },

  // ── Copies stepper ──
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.grayLight,
    borderRadius: 11,
    padding: 3,
  },
  stepBtn: {
    width: 32,
    height: 30,
    borderRadius: 9,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnOff: {
    backgroundColor: 'transparent',
  },
  stepGlyph: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.primary,
    lineHeight: 20,
  },
  stepGlyphOff: {
    color: Colors.placeholder,
  },
  stepValue: {
    minWidth: 26,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
  },

  // ── Add device dropdown ──
  addMenu: {
    position: 'absolute',
    top: 62,
    right: 16,
    width: 220,
    backgroundColor: Colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 10,
  },
  addMenuItem: {
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  addMenuLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.black,
    letterSpacing: -0.2,
  },

  // ── Empty state ──
  emptyState: {
    alignItems: 'center',
    paddingVertical: 70,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.grayText,
    fontWeight: '500',
  },
  emptyHint: {
    fontSize: 14,
    color: Colors.placeholder,
  },

  bottomPad: { height: 26 },
});
