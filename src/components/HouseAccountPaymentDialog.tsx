import React, { useState, useEffect } from 'react';
import RootModal from './RootModal';
import { View, Text, Image, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, ScrollView, TextInput } from 'react-native';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';
import type { TKey } from '../i18n/translations';
import { iconSarGray, iconSarDark } from '../assets/icons';

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 'form' | 'customers' | 'amount' | 'payment_method';

interface Customer {
  id:    string;
  name:  string;
  phone: string;
}

interface PaymentMethod {
  id:    string;
  tKey:  TKey;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Ahmed Al-Rashidi',   phone: '+966 50 123 4567' },
  { id: 'c2', name: 'Sara Al-Qahtani',    phone: '+966 55 234 5678' },
  { id: 'c3', name: 'Mohammed Al-Dosari', phone: '+966 54 345 6789' },
  { id: 'c4', name: 'Fatima Al-Harbi',    phone: '+966 56 456 7890' },
  { id: 'c5', name: 'Khalid Al-Ghamdi',   phone: '+966 59 567 8901' },
  { id: 'c6', name: 'Noura Al-Otaibi',    phone: '+966 50 678 9012' },
  { id: 'c7', name: 'Abdullah Al-Zahrani',phone: '+966 55 789 0123' },
  { id: 'c8', name: 'Lama Al-Shahrani',   phone: '+966 54 890 1234' },
];

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'cash',          tKey: 'payMethodCash' },
  { id: 'atm',           tKey: 'payMethodAtm' },
  { id: 'hungerstation', tKey: 'payMethodHungerStation' },
  { id: 'keeta',         tKey: 'payMethodKeeta' },
  { id: 'jahez',         tKey: 'payMethodJahez' },
  { id: 'credit',        tKey: 'payMethodCredit' },
];

const NUMPAD: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['C', '0', '.'],
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible:  boolean;
  onClose:  () => void;
  onSave?:  (data: { customerId: string; amount: string; paymentMethodId: string }) => void;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function todayLabel(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function HouseAccountPaymentDialog({ visible, onClose, onSave }: Props) {
  const { t, af, isRTL } = useI18n();
  const [step,            setStep]            = useState<Step>('form');
  const [customer,        setCustomer]        = useState<Customer | null>(null);
  const [amount,          setAmount]          = useState('');
  const [paymentMethod,   setPaymentMethod]   = useState<PaymentMethod | null>(null);
  const [customerSearch,  setCustomerSearch]  = useState('');
  const [searchFocused,   setSearchFocused]   = useState(false);

  useEffect(() => {
    if (visible) {
      setStep('form');
      setCustomer(null);
      setAmount('');
      setPaymentMethod(null);
      setCustomerSearch('');
    }
  }, [visible]);

  function handleNumKey(key: string) {
    if (key === 'C') {
      setAmount(prev => prev.slice(0, -1));
    } else if (key === '.') {
      if (!amount.includes('.')) setAmount(prev => prev + '.');
    } else {
      setAmount(prev => prev + key);
    }
  }

  function handleSave() {
    onSave?.({
      customerId:      customer?.id ?? '',
      amount:          amount || '0',
      paymentMethodId: paymentMethod?.id ?? '',
    });
    onClose();
  }

  const filteredCustomers = customerSearch.trim()
    ? MOCK_CUSTOMERS.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch)
      )
    : MOCK_CUSTOMERS;

  const amountDisplay = amount || '0';

  // ── Customers step ──────────────────────────────────────────────────────────
  if (step === 'customers') {
    return (
      <RootModal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setStep('form')}>
        <TouchableWithoutFeedback onPress={() => setStep('form')}>
          <View style={s.backdrop} />
        </TouchableWithoutFeedback>

        <View style={s.center} pointerEvents="box-none">
          <View style={s.card}>

            {/* Header */}
            <View style={s.subHeader}>
              <TouchableOpacity style={s.backBtn} onPress={() => setStep('form')} activeOpacity={0.7}>
                <Text style={[s.backText, { fontFamily: af('medium') }]}>
                  {isRTL ? '› ' : '‹ '}
                  {t('back')}
                </Text>
              </TouchableOpacity>
              <Text style={[s.subHeaderTitle, { fontFamily: af('semibold') }]}>{t('cfCustomersTitle')}</Text>
              <View style={s.backBtn} />
            </View>

            {/* Search */}
            <View style={s.searchWrap}>
              <View style={[s.searchBar, searchFocused && s.searchBarFocused]}>
                <TextInput
                  style={[s.searchInput, { fontFamily: af('regular') }]}
                  placeholder={t('search')}
                  placeholderTextColor={Colors.placeholder}
                  value={customerSearch}
                  onChangeText={setCustomerSearch}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* List */}
            <ScrollView style={s.subList} bounces={false}>
              {filteredCustomers.map((c, i) => (
                <TouchableOpacity
                  key={c.id}
                  activeOpacity={0.7}
                  onPress={() => { setCustomer(c); setStep('form'); }}
                >
                  {i > 0 && <View style={s.hairline} />}
                  <View style={s.customerRow}>
                    <Text style={[s.customerName, customer?.id === c.id && s.customerNameSelected, { fontFamily: af('medium') }]}>
                      {c.name}
                    </Text>
                    <Text style={[s.customerPhone, { fontFamily: af('regular') }]}>{c.phone}</Text>
                    {customer?.id === c.id && <Text style={s.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

          </View>
        </View>
      </RootModal>
    );
  }

  // ── Payment method step ─────────────────────────────────────────────────────
  if (step === 'payment_method') {
    return (
      <RootModal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setStep('form')}>
        <TouchableWithoutFeedback onPress={() => setStep('form')}>
          <View style={s.backdrop} />
        </TouchableWithoutFeedback>

        <View style={s.center} pointerEvents="box-none">
          <View style={[s.card, s.cardNarrow]}>

            {/* Header */}
            <View style={s.subHeader}>
              <TouchableOpacity style={s.backBtn} onPress={() => setStep('form')} activeOpacity={0.7}>
                <Text style={[s.backText, { fontFamily: af('medium') }]}>
                  {isRTL ? '› ' : '‹ '}
                  {t('back')}
                </Text>
              </TouchableOpacity>
              <Text style={[s.subHeaderTitle, { fontFamily: af('semibold') }]}>{t('paymentMethodTitle')}</Text>
              <View style={s.backBtn} />
            </View>

            {/* List */}
            <ScrollView style={s.subList} bounces={false}>
              {PAYMENT_METHODS.map((pm, i) => (
                <TouchableOpacity
                  key={pm.id}
                  activeOpacity={0.7}
                  onPress={() => { setPaymentMethod(pm); setStep('form'); }}
                >
                  {i > 0 && <View style={s.hairline} />}
                  <View style={s.pmRow}>
                    <Text style={[s.pmLabel, paymentMethod?.id === pm.id && s.pmLabelSelected, { fontFamily: af('medium') }]}>
                      {t(pm.tKey)}
                    </Text>
                    {paymentMethod?.id === pm.id && <Text style={s.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

          </View>
        </View>
      </RootModal>
    );
  }

  // ── Amount step ─────────────────────────────────────────────────────────────
  if (step === 'amount') {
    return (
      <RootModal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setStep('form')}>
        <TouchableWithoutFeedback onPress={() => setStep('form')}>
          <View style={s.backdrop} />
        </TouchableWithoutFeedback>

        <View style={s.center} pointerEvents="box-none">
          <View style={s.cardAmount}>

            {/* Label */}
            <View style={s.amountHeader}>
              <Text style={[s.amountHeaderLabel, { fontFamily: af('semibold') }]}>{t('enterAmount').toUpperCase()}</Text>
            </View>

            {/* Display */}
            <View style={s.amountDisplay}>
              <Text style={s.amountValue} numberOfLines={1} adjustsFontSizeToFit>
                {amountDisplay}
              </Text>
              <Image source={iconSarGray} style={s.amountCurrency} />
            </View>

            <View style={s.amountDivider} />

            {/* Numpad */}
            <View style={s.numpad}>
              {NUMPAD.map((row, ri) => (
                <View key={ri} style={s.numRow}>
                  {row.map(key => {
                    const isAction = key === 'C' || key === '.';
                    return (
                      <TouchableOpacity
                        key={key}
                        style={[s.numKey, isAction && s.numKeyAction]}
                        onPress={() => handleNumKey(key)}
                        activeOpacity={0.6}
                      >
                        <Text style={[s.numKeyText, isAction && s.numKeyActionText]}>{key}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}

              {/* Footer */}
              <View style={s.amountFooter}>
                <TouchableOpacity style={s.amountCancelBtn} onPress={() => setStep('form')} activeOpacity={0.85}>
                  <Text style={[s.amountFooterText, { fontFamily: af('bold') }]}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.amountDoneBtn} onPress={() => setStep('form')} activeOpacity={0.85}>
                  <Text style={[s.amountFooterText, { fontFamily: af('bold') }]}>{t('done')}</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </View>
      </RootModal>
    );
  }

  // ── Form step (main) ────────────────────────────────────────────────────────
  return (
    <RootModal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>

      <View style={s.center} pointerEvents="box-none">
        <View style={s.card}>

          {/* Header */}
          <View style={s.header}>
            <Text style={[s.headerTitle, { fontFamily: af('semibold') }]}>{t('houseAccountTitle')}</Text>
          </View>

          {/* Form fields */}
          <View style={s.formBody}>

            {/* Business Date */}
            <View style={s.formRow}>
              <Text style={[s.fieldLabel, { fontFamily: af('medium') }]}>{t('houseFieldBusinessDate')}</Text>
              <Text style={[s.fieldValue, { fontFamily: af('regular') }]}>{todayLabel()}</Text>
            </View>

            <View style={s.hairlineFull} />

            {/* Customer */}
            <TouchableOpacity style={s.formRow} onPress={() => setStep('customers')} activeOpacity={0.7}>
              <Text style={[s.fieldLabel, { fontFamily: af('medium') }]}>{t('houseFieldCustomer')}</Text>
              <Text style={[s.fieldValue, !customer && s.fieldPlaceholder, { fontFamily: af('regular') }]}>
                {customer ? customer.name : t('houseSelectCustomer')}
              </Text>
              <Text style={s.chevron}>{isRTL ? '‹' : '›'}</Text>
            </TouchableOpacity>

            <View style={s.hairlineFull} />

            {/* Amount */}
            <TouchableOpacity style={s.formRow} onPress={() => setStep('amount')} activeOpacity={0.7}>
              <Text style={[s.fieldLabel, { fontFamily: af('medium') }]}>{t('houseFieldAmount')}</Text>
              <View style={s.fieldAmountWrap}>
                <Text style={[s.fieldValue, !amount && s.fieldPlaceholder, { fontFamily: af('regular') }]}>
                  {amount || '0.00'}
                </Text>
                <Image source={iconSarDark} style={s.fieldSarIcon} />
              </View>
              <Text style={s.chevron}>{isRTL ? '‹' : '›'}</Text>
            </TouchableOpacity>

            <View style={s.hairlineFull} />

            {/* Payment Method */}
            <TouchableOpacity style={s.formRow} onPress={() => setStep('payment_method')} activeOpacity={0.7}>
              <Text style={[s.fieldLabel, { fontFamily: af('medium') }]}>{t('houseFieldPaymentMethod')}</Text>
              <Text style={[s.fieldValue, !paymentMethod && s.fieldPlaceholder, { fontFamily: af('regular') }]}>
                {paymentMethod ? t(paymentMethod.tKey) : t('houseSelectMethod')}
              </Text>
              <Text style={s.chevron}>{isRTL ? '‹' : '›'}</Text>
            </TouchableOpacity>

          </View>

          {/* Footer */}
          <View style={s.footer}>
            <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={[s.footerBtnText, { fontFamily: af('bold') }]}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={[s.footerBtnText, { fontFamily: af('bold') }]}>{t('save')}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </RootModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const KEY_W   = 92;
const KEY_H   = 72;
const KEY_GAP = 10;
const NUMPAD_W = KEY_W * 3 + KEY_GAP * 2 + 48;

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

  // ── Cards ──
  card: {
    width: 480,
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  cardNarrow: {
    width: 380,
  },
  cardAmount: {
    width: NUMPAD_W,
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },

  // ── Form header ──
  header: {
    backgroundColor: Colors.grayLight,
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.4,
  },

  // ── Sub-step header ──
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grayLight,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  subHeaderTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  backBtn: {
    width: 72,
  },
  backText: {
    fontSize: 17,
    fontWeight: '500',
    color: Colors.primary,
    letterSpacing: -0.3,
  },

  // ── Form body ──
  formBody: {
    paddingVertical: 8,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    minHeight: 64,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.black,
    letterSpacing: -0.3,
    width: 150,
  },
  fieldAmountWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    direction: 'ltr',
  },
  fieldSarIcon: {
    width: 14,
    height: 15,
    resizeMode: 'contain',
  },
  fieldValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.3,
    textAlign: 'right',
    marginRight: 4,
  },
  fieldPlaceholder: {
    color: Colors.placeholder,
  },
  chevron: {
    fontSize: 20,
    color: Colors.grayMid,
    marginLeft: 4,
  },

  // ── Dividers ──
  hairline: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.29)',
    marginLeft: 24,
  },
  hairlineFull: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.29)',
  },

  // ── Footer (form) ──
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.grayBorder,
  },
  cancelBtn: {
    flex: 1,
    height: 60,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flex: 1,
    height: 60,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },

  // ── Search ──
  searchWrap: {
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.grayBorder,
  },
  searchBar: {
    height: 48,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  searchBarFocused: {
    borderColor: Colors.primary,
    shadowOpacity: 0.10,
  },
  searchInput: {
    flex: 1,
    alignSelf: 'stretch',
    fontSize: 15,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.2,
    padding: 0,
    paddingHorizontal: 16,
    outlineWidth: 0,
    outlineStyle: 'none',
  } as any,

  // ── Sub lists ──
  subList: {
    maxHeight: 400,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  customerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  customerNameSelected: {
    color: Colors.primary,
  },
  customerPhone: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.2,
    marginRight: 12,
  },
  pmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  pmLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.3,
  },
  pmLabelSelected: {
    color: Colors.primary,
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: '600',
  },

  // ── Amount step ──
  amountHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  amountHeaderLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.grayText,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  amountDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 8,
    direction: 'ltr',
  },
  amountCurrency: {
    width: 22,
    height: 24,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -1.5,
    flexShrink: 1,
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
  numRow: {
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
    fontSize: 26,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.5,
  },
  numKeyActionText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.grayText,
  },
  amountFooter: {
    flexDirection: 'row',
    gap: KEY_GAP,
    marginTop: 6,
  },
  amountCancelBtn: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountDoneBtn: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountFooterText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
});
