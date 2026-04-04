import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors } from '../constants/colors';
import { iconSarDark } from '../assets/icons';
import { useI18n } from '../i18n';

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 'main' | 'form' | 'type' | 'reason' | 'amount' | 'open_reason';

type DrawerType = 'Pay In' | 'Pay Out' | 'Cash Drop' | 'Open Drawer';

interface DrawerEntry {
  id: string;
  type: DrawerType;
  amount: string;
  reason: string;
  notes: string;
  date: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DRAWER_TYPES: DrawerType[] = ['Pay In', 'Pay Out', 'Cash Drop', 'Open Drawer'];

const REASONS: Record<DrawerType, string[]> = {
  'Pay In':       ['Cash Change', 'Miscellaneous'],
  'Pay Out':      ['Vendor Payment', 'Miscellaneous'],
  'Cash Drop':    ['Cash Drop', 'Miscellaneous'],
  'Open Drawer':  ['Cash Change', 'No Sale', 'Miscellaneous'],
};

const NUMPAD_KEYS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['.', '0', '⌫'],
];

function todayFormatted(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DrawerOperationsDialog({ visible, onClose }: Props) {
  const { t, af } = useI18n();
  const [step,       setStep]       = useState<Step>('main');
  const [entries,    setEntries]    = useState<DrawerEntry[]>([]);
  const [formType,   setFormType]   = useState<DrawerType | ''>('');
  const [formAmount, setFormAmount] = useState('');
  const [formReason, setFormReason] = useState('');
  const [formNotes,  setFormNotes]  = useState('');

  useEffect(() => {
    if (visible) {
      setStep('main');
      setFormType('');
      setFormAmount('');
      setFormReason('');
      setFormNotes('');
    }
  }, [visible]);

  // ── Amount numpad handlers ──
  function handleNumKey(key: string) {
    if (key === '⌫') {
      setFormAmount(prev => prev.slice(0, -1));
    } else if (key === '.') {
      if (!formAmount.includes('.')) setFormAmount(prev => prev + '.');
    } else {
      setFormAmount(prev => {
        if (prev === '0') return key;
        const parts = (prev + key).split('.');
        if (parts[1] !== undefined && parts[1].length > 2) return prev;
        return prev + key;
      });
    }
  }

  // ── Save form entry ──
  function handleSave() {
    if (!formType) return;
    const entry: DrawerEntry = {
      id:     Date.now().toString(),
      type:   formType as DrawerType,
      amount: formAmount || '0.00',
      reason: formReason,
      notes:  formNotes,
      date:   todayFormatted(),
    };
    setEntries(prev => [entry, ...prev]);
    setStep('main');
  }

  // ── Open Drawer quick action ──
  function handleOpenDrawerReason(reason: string) {
    const entry: DrawerEntry = {
      id:     Date.now().toString(),
      type:   'Open Drawer',
      amount: '0.00',
      reason,
      notes:  '',
      date:   todayFormatted(),
    };
    setEntries(prev => [entry, ...prev]);
    setStep('main');
  }

  // ── Shared back nav ──
  function goBack() {
    if (step === 'form')        setStep('main');
    else if (step === 'type')   setStep('form');
    else if (step === 'reason') setStep('form');
    else if (step === 'amount') setStep('form');
    else if (step === 'open_reason') setStep('main');
  }

  const displayAmount = formAmount || '0.00';

  // ── Header render ──
  function renderHeader() {
    if (step === 'main') {
      return (
        <View style={s.header}>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={s.headerSide}>
            <Text style={[s.headerClose, { fontFamily: af('regular') }]}>{t('close')}</Text>
          </TouchableOpacity>
          <Text style={[s.headerTitle, { fontFamily: af('semibold') }]}>{t('drawerOpsTitle')}</Text>
          <TouchableOpacity
            onPress={() => {
              setFormType(''); setFormAmount(''); setFormReason(''); setFormNotes('');
              setStep('form');
            }}
            activeOpacity={0.7}
            style={s.headerSide}
          >
            <Text style={s.headerAction}>+</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const titles: Record<Step, string> = {
      main:         'Drawer Operations',
      form:         'Drawer Operation',
      type:         'Type',
      reason:       'Reason',
      amount:       'Amount',
      open_reason:  'Reason',
    };
    const showSave = step === 'form';

    return (
      <View style={s.header}>
        <TouchableOpacity onPress={goBack} activeOpacity={0.7} style={s.headerSide}>
          <Text style={[s.headerBack, { fontFamily: af('regular') }]}>{'< ' + t('back')}</Text>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { fontFamily: af('semibold') }]}>{titles[step]}</Text>
        {showSave ? (
          <TouchableOpacity onPress={handleSave} activeOpacity={0.7} style={s.headerSide} disabled={!formType}>
            <Text style={[s.headerAction, !formType && s.headerActionDisabled, { fontFamily: af('semibold') }]}>{t('save')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.headerSide} />
        )}
      </View>
    );
  }

  // ── Content render ──
  function renderContent() {
    // ── Main ──
    if (step === 'main') {
      return (
        <>
          <ScrollView style={s.listScroll} bounces={false} showsVerticalScrollIndicator={false}>
            {entries.length === 0 ? (
              <View style={s.emptyArea} />
            ) : (
              <View style={s.group}>
                {entries.map((e, i) => (
                  <React.Fragment key={e.id}>
                    {i > 0 && <View style={s.hairline} />}
                    <View style={s.entryRow}>
                      <View>
                        <Text style={s.entryType}>{e.type}</Text>
                        {e.reason ? <Text style={s.entryReason}>{e.reason}</Text> : null}
                      </View>
                      <View style={s.entryRight}>
                        <View style={s.entryAmountRow}>
                          <Image source={iconSarDark} style={s.entrySarIcon} />
                          <Text style={s.entryAmount}>{e.amount}</Text>
                        </View>
                        <Text style={s.entryDate}>{e.date}</Text>
                      </View>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={s.openDrawerBtn} activeOpacity={0.85} onPress={() => setStep('open_reason')}>
            <Text style={[s.openDrawerText, { fontFamily: af('bold') }]}>{t('openTill')}</Text>
          </TouchableOpacity>
        </>
      );
    }

    // ── Form ──
    if (step === 'form') {
      return (
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          <View style={s.formGroup}>
            {/* Business date */}
            <View style={s.formRow}>
              <Text style={s.formLabel}>Business date</Text>
              <Text style={s.formValue}>{todayFormatted()}</Text>
            </View>

            <View style={s.hairline} />

            {/* Type */}
            <TouchableOpacity style={s.formRow} activeOpacity={0.7} onPress={() => setStep('type')}>
              <Text style={s.formLabel}>Type</Text>
              <View style={s.formRight}>
                {formType ? <Text style={s.formValueSelected}>{formType}</Text> : null}
                <Text style={s.formChevron}>›</Text>
              </View>
            </TouchableOpacity>

            <View style={s.hairline} />

            {/* Amount */}
            <TouchableOpacity style={s.formRow} activeOpacity={0.7} onPress={() => setStep('amount')}>
              <Text style={s.formLabel}>Amount</Text>
              <Text style={[s.formValue, formAmount && s.formValueSelected]}>
                <Image source={iconSarDark} style={s.formSarIcon} />{formAmount || '0.00'}
              </Text>
            </TouchableOpacity>

            <View style={s.hairline} />

            {/* Reason */}
            <TouchableOpacity
              style={s.formRow}
              activeOpacity={0.7}
              onPress={() => { if (formType) setStep('reason'); }}
              disabled={!formType}
            >
              <Text style={[s.formLabel, !formType && s.formLabelDisabled]}>Reason</Text>
              <View style={s.formRight}>
                {formReason ? <Text style={s.formValueSelected}>{formReason}</Text> : null}
                <Text style={[s.formChevron, !formType && s.formLabelDisabled]}>›</Text>
              </View>
            </TouchableOpacity>

            <View style={s.hairline} />

            {/* Notes */}
            <View style={s.formRowNotes}>
              <Text style={s.formLabel}>Notes</Text>
              <TextInput
                style={s.notesInput}
                value={formNotes}
                onChangeText={setFormNotes}
                placeholder="Optional"
                placeholderTextColor={Colors.placeholder}
                multiline
              />
            </View>
          </View>
          <View style={{ height: 24 }} />
        </ScrollView>
      );
    }

    // ── Type picker ──
    if (step === 'type') {
      return (
        <View style={s.group}>
          {DRAWER_TYPES.map((t, i) => (
            <React.Fragment key={t}>
              {i > 0 && <View style={s.hairline} />}
              <TouchableOpacity
                style={s.listRow}
                activeOpacity={0.7}
                onPress={() => {
                  setFormType(t);
                  setFormReason('');
                  setStep('form');
                }}
              >
                <Text style={[s.listRowLabel, formType === t && s.listRowLabelSelected]}>
                  {t}
                </Text>
                {formType === t && <Text style={s.checkmark}>✓</Text>}
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
      );
    }

    // ── Reason picker ──
    if (step === 'reason' || step === 'open_reason') {
      const reasons = step === 'open_reason'
        ? REASONS['Open Drawer']
        : formType ? REASONS[formType as DrawerType] : [];

      return (
        <View style={s.group}>
          {reasons.map((r, i) => (
            <React.Fragment key={r}>
              {i > 0 && <View style={s.hairline} />}
              <TouchableOpacity
                style={s.listRow}
                activeOpacity={0.7}
                onPress={() => {
                  if (step === 'open_reason') {
                    handleOpenDrawerReason(r);
                  } else {
                    setFormReason(r);
                    setStep('form');
                  }
                }}
              >
                <Text style={[s.listRowLabel, formReason === r && s.listRowLabelSelected]}>
                  {r}
                </Text>
                {formReason === r && step !== 'open_reason' && <Text style={s.checkmark}>✓</Text>}
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
      );
    }

    // ── Amount numpad ──
    if (step === 'amount') {
      return (
        <View style={s.numpadContainer}>
          {/* Display */}
          <View style={s.amountDisplay}>
            <Image source={iconSarDark} style={s.amountDisplaySarIcon} />
            <Text style={s.amountDisplayValue}>{displayAmount}</Text>
          </View>

          <View style={s.amountDivider} />

          {/* Numpad */}
          <View style={s.numpad}>
            {NUMPAD_KEYS.map((row, ri) => (
              <View key={ri} style={s.numpadRow}>
                {row.map(key => (
                  <TouchableOpacity
                    key={key}
                    style={[s.numKey, key === '⌫' && s.numKeyAction]}
                    onPress={() => handleNumKey(key)}
                    activeOpacity={0.6}
                  >
                    <Text style={[s.numKeyText, key === '⌫' && s.numKeyActionText]}>{key}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            <TouchableOpacity style={s.amountDoneBtn} onPress={() => setStep('form')} activeOpacity={0.85}>
              <Text style={[s.amountDoneBtnText, { fontFamily: af('bold') }]}>{t('done')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return null;
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
        <View style={[s.card, step === 'amount' && s.cardNarrow]}>
          {renderHeader()}
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const KEY_W = 88;
const KEY_H = 68;
const KEY_GAP = 10;

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
    maxHeight: 660,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.20,
    shadowRadius: 28,
    elevation: 16,
  },
  cardNarrow: {
    width: KEY_W * 3 + KEY_GAP * 2 + 48,
    maxHeight: 700,
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
  headerSide:            { width: 80 },
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
  headerBack: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  headerAction: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.2,
    textAlign: 'right',
  },
  headerActionDisabled: {
    opacity: 0.35,
  },

  // Main list
  listScroll: {
    flex: 1,
    minHeight: 380,
  },
  emptyArea: {
    height: 380,
    backgroundColor: Colors.backgroundAlt,
  },
  group: {
    backgroundColor: Colors.white,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: Colors.grayBorder,
  },
  hairline: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.18)',
    marginLeft: 20,
  },

  // Entry rows (main list)
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 60,
  },
  entryType: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.black,
    letterSpacing: -0.2,
  },
  entryReason: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.grayText,
    marginTop: 2,
  },
  entryRight: { alignItems: 'flex-end' },
  entryAmountRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  entrySarIcon: { width: 13, height: 14, resizeMode: 'contain' },
  formSarIcon: { width: 13, height: 14, resizeMode: 'contain', marginRight: 4 },
  entryAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  entryDate: {
    fontSize: 12,
    color: Colors.grayText,
    marginTop: 2,
  },

  // Open Drawer bottom button
  openDrawerBtn: {
    height: 64,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openDrawerText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },

  // Form
  formGroup: {
    backgroundColor: Colors.white,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: Colors.grayBorder,
    marginTop: 0,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    minHeight: 56,
  },
  formRowNotes: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 18,
    minHeight: 56,
    gap: 12,
  },
  formLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.2,
  },
  formLabelDisabled: {
    color: Colors.grayMid,
  },
  formValue: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.2,
  },
  formValueSelected: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.2,
    marginRight: 4,
  },
  formRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formChevron: {
    fontSize: 18,
    color: Colors.grayMid,
    marginLeft: 2,
  },
  notesInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.2,
    minHeight: 40,
    paddingTop: 0,
    outlineWidth: 0,
    outlineStyle: 'none',
  } as any,

  // List picker rows (type / reason)
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    minHeight: 60,
  },
  listRowLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.2,
    flex: 1,
  },
  listRowLabelSelected: {
    color: Colors.primary,
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Amount numpad
  numpadContainer: {
    backgroundColor: Colors.white,
  },
  amountDisplaySarIcon: {
    width: 18,
    height: 20,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  amountDisplay: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    gap: 6,
  },
  amountDisplayValue: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -1.5,
  },
  amountDivider: {
    height: 1,
    backgroundColor: Colors.grayBorder,
  },
  numpad: {
    padding: 24,
    gap: KEY_GAP,
    backgroundColor: Colors.backgroundAlt,
  },
  numpadRow: {
    flexDirection: 'row',
    gap: KEY_GAP,
  },
  numKey: {
    width: KEY_W,
    height: KEY_H,
    backgroundColor: Colors.white,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  numKeyAction: {
    backgroundColor: Colors.grayLight,
  },
  numKeyText: {
    fontSize: 24,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.5,
  },
  numKeyActionText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.grayText,
  },
  amountDoneBtn: {
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  amountDoneBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
});
