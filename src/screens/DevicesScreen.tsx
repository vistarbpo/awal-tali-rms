import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  Switch,
  StyleSheet,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';

// ─── Data ─────────────────────────────────────────────────────────────────────

const PRINTER_MODELS: { brand: string; models: string[] }[] = [
  {
    brand: 'EPSON',
    models: ['TM_T20', 'TM_T20II', 'TM_T20III', 'TM_m30', 'TM_m30II', 'TM_P80', 'TM_T88V', 'TM_T20X', 'TM_L100'],
  },
  {
    brand: 'STAR',
    models: ['TSP100', 'TSP650II', 'TSP700II', 'SP700', 'mC-Print3', 'mC-Print2'],
  },
];

const PRINTER_TYPES = ['Cashier', 'Kitchen', 'Order info', 'Kitchen Sticky Printer'];
const KDS_TYPES     = ['Foodics', 'Custom'];
const ORDER_TYPES   = ['Dine In', 'Pick Up', 'Delivery', 'Drive Thru'];

const ADD_DEVICE_OPTIONS = ['Printer', 'KDS', 'Sub Cashier'];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PrinterDevice {
  id:                string;
  model:             string | null;
  type:              string | null;
  name:              string;
  ipAddress:         string;
  enabledOrderTypes: string[];
}

export interface KDSDevice {
  id:                string;
  ipAddress:         string;
  isActive:          boolean;
  enabledOrderTypes: string[];
  type:              string;
}

export interface SubCashierDevice {
  id:        string;
  ipAddress: string;
}

type SubView =
  | 'list'
  | 'printer-info' | 'model-picker' | 'printer-type-picker' | 'printer-order-types'
  | 'kds-info'     | 'kds-type-picker' | 'kds-order-types'
  | 'sub-cashier-info';

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

function NavRow({
  label, value, placeholder, onPress,
}: {
  label: string; value?: string | null; placeholder?: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={s.row} activeOpacity={0.7} onPress={onPress}>
      <Text style={s.rowLabel}>{label}</Text>
      <View style={s.rowRight}>
        <Text style={value ? s.rowValue : s.rowPlaceholder}>
          {value ?? placeholder ?? 'Not set'}
        </Text>
        <Text style={s.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible: boolean;
  onClose: () => void;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
const BLANK_PRINTER: PrinterDevice  = { id: '', model: null, type: null, name: '', ipAddress: '', enabledOrderTypes: [] };
const BLANK_KDS: KDSDevice          = { id: '', ipAddress: '', isActive: true, enabledOrderTypes: [], type: 'Foodics' };
const BLANK_SUB_CASHIER: SubCashierDevice = { id: '', ipAddress: '' };

// ─── Component ────────────────────────────────────────────────────────────────
export default function DevicesScreen({ visible, onClose }: Props) {
  const { t, af, isRTL } = useI18n();
  const [subView, setSubView]         = useState<SubView>('list');
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const [printers,     setPrinters]     = useState<PrinterDevice[]>([]);
  const [kdsDevices,   setKdsDevices]   = useState<KDSDevice[]>([]);
  const [subCashiers,  setSubCashiers]  = useState<SubCashierDevice[]>([]);

  const [printerDraft,    setPrinterDraft]    = useState<PrinterDevice>(BLANK_PRINTER);
  const [kdsDraft,        setKdsDraft]        = useState<KDSDevice>(BLANK_KDS);
  const [subCashierDraft, setSubCashierDraft] = useState<SubCashierDevice>(BLANK_SUB_CASHIER);

  // ── Handlers ──

  function handleAddDevice(type: string) {
    setAddMenuOpen(false);
    if (type === 'Printer')     { setPrinterDraft(BLANK_PRINTER);         setSubView('printer-info'); }
    if (type === 'KDS')         { setKdsDraft(BLANK_KDS);                 setSubView('kds-info'); }
    if (type === 'Sub Cashier') { setSubCashierDraft(BLANK_SUB_CASHIER);  setSubView('sub-cashier-info'); }
  }

  function handleSavePrinter() {
    if (printerDraft.id) {
      setPrinters(prev => prev.map(p => p.id === printerDraft.id ? printerDraft : p));
    } else {
      setPrinters(prev => [...prev, { ...printerDraft, id: `printer-${Date.now()}` }]);
    }
    setSubView('list');
  }

  function handleSaveKDS() {
    if (kdsDraft.id) {
      setKdsDevices(prev => prev.map(k => k.id === kdsDraft.id ? kdsDraft : k));
    } else {
      setKdsDevices(prev => [...prev, { ...kdsDraft, id: `kds-${Date.now()}` }]);
    }
    setSubView('list');
  }

  function handleSaveSubCashier() {
    if (subCashierDraft.id) {
      setSubCashiers(prev => prev.map(c => c.id === subCashierDraft.id ? subCashierDraft : c));
    } else {
      setSubCashiers(prev => [...prev, { ...subCashierDraft, id: `sub-${Date.now()}` }]);
    }
    setSubView('list');
  }

  function togglePrinterOrderType(type: string) {
    setPrinterDraft(prev => {
      const has = prev.enabledOrderTypes.includes(type);
      return { ...prev, enabledOrderTypes: has ? prev.enabledOrderTypes.filter(t => t !== type) : [...prev.enabledOrderTypes, type] };
    });
  }

  function toggleKdsOrderType(type: string) {
    setKdsDraft(prev => {
      const has = prev.enabledOrderTypes.includes(type);
      return { ...prev, enabledOrderTypes: has ? prev.enabledOrderTypes.filter(t => t !== type) : [...prev.enabledOrderTypes, type] };
    });
  }

  function handleClose() {
    setSubView('list');
    setAddMenuOpen(false);
    onClose();
  }

  const hasNoDevices = printers.length === 0 && kdsDevices.length === 0 && subCashiers.length === 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={() => { if (addMenuOpen) setAddMenuOpen(false); }}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>

      <View style={s.center} pointerEvents="box-none">
        <View style={s.card}>

          {/* ── Device List ── */}
          {subView === 'list' && (
            <>
              <View style={s.header}>
                <TouchableOpacity onPress={handleClose} style={s.headerSide} activeOpacity={0.7}>
                  <Text style={[s.headerAction, { fontFamily: af() }]}>{t('close')}</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Devices</Text>
                <TouchableOpacity onPress={() => setAddMenuOpen(p => !p)} style={s.headerSideRight} activeOpacity={0.7}>
                  <Text style={s.headerActionPlus}>+</Text>
                </TouchableOpacity>
              </View>

              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                {printers.length > 0 && (
                  <>
                    <SectionHeader title="PRINTERS" />
                    <View style={s.group}>
                      {printers.map((p, i) => (
                        <React.Fragment key={p.id}>
                          {i > 0 && <Hairline />}
                          <TouchableOpacity style={s.row} activeOpacity={0.7}
                            onPress={() => { setPrinterDraft(p); setSubView('printer-info'); }}>
                            <Text style={s.rowLabel}>{p.name || 'Unnamed Printer'}</Text>
                            <View style={s.rowRight}>
                              <Text style={s.rowValue}>{p.type ?? ''}</Text>
                              <Text style={s.chevron}>›</Text>
                            </View>
                          </TouchableOpacity>
                        </React.Fragment>
                      ))}
                    </View>
                  </>
                )}

                {kdsDevices.length > 0 && (
                  <>
                    <SectionHeader title="KDS" />
                    <View style={s.group}>
                      {kdsDevices.map((k, i) => (
                        <React.Fragment key={k.id}>
                          {i > 0 && <Hairline />}
                          <TouchableOpacity style={s.row} activeOpacity={0.7}
                            onPress={() => { setKdsDraft(k); setSubView('kds-info'); }}>
                            <Text style={s.rowLabel}>{k.ipAddress || 'KDS Device'}</Text>
                            <View style={s.rowRight}>
                              <Text style={s.rowValue}>{k.type}</Text>
                              <Text style={s.chevron}>›</Text>
                            </View>
                          </TouchableOpacity>
                        </React.Fragment>
                      ))}
                    </View>
                  </>
                )}

                {subCashiers.length > 0 && (
                  <>
                    <SectionHeader title="SUB CASHIERS" />
                    <View style={s.group}>
                      {subCashiers.map((c, i) => (
                        <React.Fragment key={c.id}>
                          {i > 0 && <Hairline />}
                          <TouchableOpacity style={s.row} activeOpacity={0.7}
                            onPress={() => { setSubCashierDraft(c); setSubView('sub-cashier-info'); }}>
                            <Text style={s.rowLabel}>{c.ipAddress || 'Sub Cashier'}</Text>
                            <Text style={s.chevron}>›</Text>
                          </TouchableOpacity>
                        </React.Fragment>
                      ))}
                    </View>
                  </>
                )}

                {hasNoDevices && (
                  <View style={s.emptyState}>
                    <Text style={s.emptyText}>No devices added yet.</Text>
                    <Text style={s.emptyHint}>Tap + to add a device.</Text>
                  </View>
                )}

                <View style={s.bottomPad} />
              </ScrollView>

              {addMenuOpen && (
                <View style={[s.addMenu, isRTL ? { right: undefined, left: 16 } : {}]}>
                  {ADD_DEVICE_OPTIONS.map((opt, i) => (
                    <React.Fragment key={opt}>
                      {i > 0 && <Hairline />}
                      <TouchableOpacity style={s.addMenuItem} activeOpacity={0.7} onPress={() => handleAddDevice(opt)}>
                        <Text style={s.addMenuLabel}>{opt}</Text>
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
              <View style={s.header}>
                <TouchableOpacity onPress={() => setSubView('list')} style={s.headerSide} activeOpacity={0.7}>
                  <Text style={[s.headerAction, { fontFamily: af() }]}>{t('back')}</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Printer Info</Text>
                <TouchableOpacity onPress={handleSavePrinter} style={s.headerSideRight} activeOpacity={0.7}>
                  <Text style={[s.headerAction, { fontFamily: af() }]}>{t('save')}</Text>
                </TouchableOpacity>
              </View>

              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                <View style={s.group}>
                  <NavRow label="Model" value={printerDraft.model} onPress={() => setSubView('model-picker')} />
                  <Hairline />
                  <NavRow label="Type" value={printerDraft.type} onPress={() => setSubView('printer-type-picker')} />
                  <Hairline />
                  <View style={s.row}>
                    <Text style={s.rowLabel}>Name</Text>
                    <TextInput
                      style={s.rowInput}
                      value={printerDraft.name}
                      onChangeText={t => setPrinterDraft(p => ({ ...p, name: t }))}
                      placeholder="Drinks printer"
                      placeholderTextColor={Colors.placeholder}
                    />
                  </View>
                  <Hairline />
                  <View style={s.row}>
                    <Text style={s.rowLabel}>IP address</Text>
                    <TextInput
                      style={s.rowInput}
                      value={printerDraft.ipAddress}
                      onChangeText={t => setPrinterDraft(p => ({ ...p, ipAddress: t }))}
                      placeholder="192.168.1.10"
                      placeholderTextColor={Colors.placeholder}
                      keyboardType="numeric"
                    />
                  </View>
                  <Hairline />
                  <NavRow
                    label="Enabled order types"
                    value={printerDraft.enabledOrderTypes.length > 0 ? printerDraft.enabledOrderTypes.join(', ') : null}
                    placeholder="Not set"
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
              <View style={s.header}>
                <TouchableOpacity onPress={() => setSubView('printer-info')} style={s.headerSide} activeOpacity={0.7}>
                  <Text style={[s.headerAction, { fontFamily: af() }]}>{t('back')}</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Model</Text>
                <View style={s.headerSideRight} />
              </View>

              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                {PRINTER_MODELS.map(brand => (
                  <React.Fragment key={brand.brand}>
                    <SectionHeader title={brand.brand} />
                    <View style={s.group}>
                      {brand.models.map((model, i) => (
                        <React.Fragment key={model}>
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
              <View style={s.header}>
                <TouchableOpacity onPress={() => setSubView('printer-info')} style={s.headerSide} activeOpacity={0.7}>
                  <Text style={[s.headerAction, { fontFamily: af() }]}>{t('back')}</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Type</Text>
                <View style={s.headerSideRight} />
              </View>

              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                <View style={s.group}>
                  {PRINTER_TYPES.map((type, i) => (
                    <React.Fragment key={type}>
                      {i > 0 && <Hairline />}
                      <TouchableOpacity style={s.row} activeOpacity={0.7}
                        onPress={() => { setPrinterDraft(p => ({ ...p, type })); setSubView('printer-info'); }}>
                        <Text style={s.rowLabel}>{type}</Text>
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
              <View style={s.header}>
                <TouchableOpacity onPress={() => setSubView('printer-info')} style={s.headerSide} activeOpacity={0.7}>
                  <Text style={[s.headerAction, { fontFamily: af() }]}>{t('back')}</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Enabled order types</Text>
                <View style={s.headerSideRight} />
              </View>

              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                <SectionHeader title="ENABLED ORDER TYPES" />
                <View style={s.group}>
                  {ORDER_TYPES.map((type, i) => (
                    <React.Fragment key={type}>
                      {i > 0 && <Hairline />}
                      <TouchableOpacity style={s.row} activeOpacity={0.7} onPress={() => togglePrinterOrderType(type)}>
                        <Text style={s.rowLabel}>{type}</Text>
                        {printerDraft.enabledOrderTypes.includes(type) && <Text style={s.checkmark}>✓</Text>}
                      </TouchableOpacity>
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
              <View style={s.header}>
                <TouchableOpacity onPress={() => setSubView('list')} style={s.headerSide} activeOpacity={0.7}>
                  <Text style={[s.headerAction, { fontFamily: af() }]}>{t('back')}</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Kds info</Text>
                <TouchableOpacity onPress={handleSaveKDS} style={s.headerSideRight} activeOpacity={0.7}>
                  <Text style={[s.headerAction, { fontFamily: af() }]}>{t('save')}</Text>
                </TouchableOpacity>
              </View>

              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                <View style={s.group}>
                  <View style={s.row}>
                    <Text style={s.rowLabel}>IP address</Text>
                    <TextInput
                      style={s.rowInput}
                      value={kdsDraft.ipAddress}
                      onChangeText={t => setKdsDraft(k => ({ ...k, ipAddress: t }))}
                      placeholder="192.168.1.10"
                      placeholderTextColor={Colors.placeholder}
                      keyboardType="numeric"
                    />
                  </View>
                  <Hairline />
                  <View style={s.row}>
                    <Text style={s.rowLabel}>Is active</Text>
                    <Switch
                      value={kdsDraft.isActive}
                      onValueChange={v => setKdsDraft(k => ({ ...k, isActive: v }))}
                      trackColor={{ false: Colors.grayMid, true: Colors.green }}
                      thumbColor={Colors.white}
                    />
                  </View>
                  <Hairline />
                  <NavRow
                    label="Enabled order types"
                    value={kdsDraft.enabledOrderTypes.length > 0 ? kdsDraft.enabledOrderTypes.join(', ') : null}
                    placeholder="Not set"
                    onPress={() => setSubView('kds-order-types')}
                  />
                </View>

                <GroupGap />

                <View style={s.group}>
                  <NavRow
                    label="Type"
                    value={kdsDraft.type}
                    onPress={() => setSubView('kds-type-picker')}
                  />
                </View>

                <View style={s.bottomPad} />
              </ScrollView>
            </>
          )}

          {/* ── KDS Type Picker ── */}
          {subView === 'kds-type-picker' && (
            <>
              <View style={s.header}>
                <TouchableOpacity onPress={() => setSubView('kds-info')} style={s.headerSide} activeOpacity={0.7}>
                  <Text style={[s.headerAction, { fontFamily: af() }]}>{t('back')}</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Type</Text>
                <View style={s.headerSideRight} />
              </View>

              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                <View style={s.group}>
                  {KDS_TYPES.map((type, i) => (
                    <React.Fragment key={type}>
                      {i > 0 && <Hairline />}
                      <TouchableOpacity style={s.row} activeOpacity={0.7}
                        onPress={() => { setKdsDraft(k => ({ ...k, type })); setSubView('kds-info'); }}>
                        <Text style={s.rowLabel}>{type}</Text>
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
              <View style={s.header}>
                <TouchableOpacity onPress={() => setSubView('kds-info')} style={s.headerSide} activeOpacity={0.7}>
                  <Text style={[s.headerAction, { fontFamily: af() }]}>{t('back')}</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Enabled order types</Text>
                <View style={s.headerSideRight} />
              </View>

              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                <SectionHeader title="ENABLED ORDER TYPES" />
                <View style={s.group}>
                  {ORDER_TYPES.map((type, i) => (
                    <React.Fragment key={type}>
                      {i > 0 && <Hairline />}
                      <TouchableOpacity style={s.row} activeOpacity={0.7} onPress={() => toggleKdsOrderType(type)}>
                        <Text style={s.rowLabel}>{type}</Text>
                        {kdsDraft.enabledOrderTypes.includes(type) && <Text style={s.checkmark}>✓</Text>}
                      </TouchableOpacity>
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
              <View style={s.header}>
                <TouchableOpacity onPress={() => setSubView('list')} style={s.headerSide} activeOpacity={0.7}>
                  <Text style={[s.headerAction, { fontFamily: af() }]}>{t('back')}</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Sub Cashier Info</Text>
                <TouchableOpacity onPress={handleSaveSubCashier} style={s.headerSideRight} activeOpacity={0.7}>
                  <Text style={[s.headerAction, { fontFamily: af() }]}>{t('save')}</Text>
                </TouchableOpacity>
              </View>

              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                <View style={s.group}>
                  <View style={s.row}>
                    <Text style={s.rowLabel}>IP address</Text>
                    <TextInput
                      style={s.rowInput}
                      value={subCashierDraft.ipAddress}
                      onChangeText={t => setSubCashierDraft(c => ({ ...c, ipAddress: t }))}
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
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_W = 660;

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
    width: CARD_W,
    maxHeight: 700,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.20,
    shadowRadius: 32,
    elevation: 16,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 20,
    backgroundColor: Colors.backgroundAlt,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(60,60,67,0.18)',
  },
  headerSide: {
    width: 80,
  },
  headerSideRight: {
    width: 80,
    alignItems: 'flex-end',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  headerAction: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  headerActionPlus: {
    fontSize: 26,
    fontWeight: '400',
    color: Colors.primary,
    textAlign: 'right',
    lineHeight: 30,
  },

  // ── Section ──
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  // ── Group card ──
  group: {
    marginHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 14,
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
    paddingVertical: 17,
    minHeight: 54,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.2,
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
    maxWidth: 200,
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
    fontWeight: '600',
  },
  hairline: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.18)',
    marginStart: 18,
  },

  // ── Add device dropdown ──
  addMenu: {
    position: 'absolute',
    top: 56,
    right: 16,
    width: 220,
    backgroundColor: Colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 10,
  },
  addMenuItem: {
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  addMenuLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.primary,
    letterSpacing: -0.2,
  },

  // ── Empty state ──
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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

  bottomPad: { height: 24 },
});
