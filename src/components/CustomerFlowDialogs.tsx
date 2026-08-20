import React, { useState } from 'react';
import RootModal from './RootModal';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, ScrollView, TextInput, Image, StyleSheet, Platform } from 'react-native';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DeliveryCustomer {
  name: string;
  phone: string;
  address: string;
}

type Step = 'customers' | 'create-customer' | 'addresses' | 'create-address';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCustomerAssigned: (customer: DeliveryCustomer) => void;
  initialStep?: Step;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_CUSTOMERS = [
  { id: '1', name: 'Ahmed Al-Rashidi',  phone: '+966 50 123 4567' },
  { id: '2', name: 'Fatimah Al-Otaibi', phone: '+966 55 987 6543' },
  { id: '3', name: 'Mohammed Al-Zahrani', phone: '+966 54 321 0987' },
  { id: '4', name: 'Sara Al-Harbi',     phone: '+966 56 456 7890' },
  { id: '5', name: 'Khalid Al-Dosari',  phone: '+966 59 234 5678' },
];

const MOCK_ADDRESSES = [
  { id: '1', address: 'King Fahd Road, Al Olaya', description: 'Near Al Faisaliyah Tower', zoneKey: 'zoneA' as const },
  { id: '2', address: 'Prince Sultan St, Al Malaz', description: 'Apt 12, Floor 3', zoneKey: 'zoneB' as const },
];

// ─── View-drawn icons ─────────────────────────────────────────────────────────
function ChevronLeftIcon() {
  return (
    <View style={ico.chevronWrap}>
      <View style={ico.chevronArm1} />
      <View style={ico.chevronArm2} />
    </View>
  );
}

function PlusIcon({ color = Colors.white }: { color?: string }) {
  return (
    <View style={ico.plusWrap}>
      <View style={[ico.plusH, { backgroundColor: color }]} />
      <View style={[ico.plusV, { backgroundColor: color }]} />
    </View>
  );
}

import { iconSearch } from '../assets/icons';
const SEARCH_ICON = iconSearch;

function SearchIcon() {
  return <Image source={SEARCH_ICON} style={ico.searchImg} />;
}

function ChevronRightIcon() {
  return (
    <View style={ico.chevronWrap}>
      <View style={ico.chevronRArm1} />
      <View style={ico.chevronRArm2} />
    </View>
  );
}

function SyncIcon() {
  return (
    <View style={ico.syncCircle} />
  );
}

const ico = StyleSheet.create({
  chevronWrap: { width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  chevronArm1: { width: 9, height: 2, backgroundColor: Colors.primary, borderRadius: 1, transform: [{ rotate: '-45deg' }, { translateY: -3 }], position: 'absolute' },
  chevronArm2: { width: 9, height: 2, backgroundColor: Colors.primary, borderRadius: 1, transform: [{ rotate: '45deg' }, { translateY: 3 }], position: 'absolute' },
  chevronRArm1: { width: 9, height: 2, backgroundColor: Colors.grayText, borderRadius: 1, transform: [{ rotate: '45deg' }, { translateY: -3 }], position: 'absolute' },
  chevronRArm2: { width: 9, height: 2, backgroundColor: Colors.grayText, borderRadius: 1, transform: [{ rotate: '-45deg' }, { translateY: 3 }], position: 'absolute' },
  plusWrap: { width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  plusH: { width: 12, height: 2, borderRadius: 1, position: 'absolute' },
  plusV: { width: 2, height: 12, borderRadius: 1, position: 'absolute' },
  searchImg: { width: 20, height: 20, resizeMode: 'contain', opacity: 0.45 },
  syncCircle: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: Colors.primary, borderTopColor: 'transparent' },
});

// ─── Component ────────────────────────────────────────────────────────────────
export default function CustomerFlowDialogs({ visible, onClose, onCustomerAssigned, initialStep }: Props) {
  const { t, af, isRTL, rtlText } = useI18n();
  const [step, setStep]                   = useState<Step>(initialStep ?? 'customers');
  const [search, setSearch]               = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Create-customer form
  const [newName, setNewName]   = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCountry, setNewCountry] = useState('');

  // Create-address form
  const [newAddress, setNewAddress]     = useState('');
  const [newDesc, setNewDesc]           = useState('');
  const [newZone, setNewZone]           = useState('');

  function resetAndClose() {
    setStep('customers');
    setSearch('');
    setSelectedCustomerId(null);
    setNewName(''); setNewPhone(''); setNewEmail(''); setNewCountry('');
    setNewAddress(''); setNewDesc(''); setNewZone('');
    onClose();
  }

  function openCreateCustomer() {
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewCountry(t('countrySaudiArabia'));
    setStep('create-customer');
  }

  function handleSelectCustomer(id: string) {
    setSelectedCustomerId(id);
    setStep('addresses');
  }

  function handleSaveCustomer() {
    if (!newName.trim()) return;
    setSelectedCustomerId('new');
    setStep('addresses');
  }

  function handleSelectAddress(addr: { address: string }) {
    const customer = selectedCustomerId === 'new'
      ? { name: newName, phone: newPhone, address: addr.address }
      : (() => {
          const c = MOCK_CUSTOMERS.find(x => x.id === selectedCustomerId);
          return { name: c?.name ?? '', phone: c?.phone ?? '', address: addr.address };
        })();
    onCustomerAssigned(customer);
    resetAndClose();
  }

  function handleSaveAddress() {
    if (!newAddress.trim()) return;
    handleSelectAddress({ address: newAddress });
  }

  const filteredCustomers = MOCK_CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <RootModal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={resetAndClose}>
      <TouchableWithoutFeedback onPress={resetAndClose}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>

      <View style={s.center} pointerEvents="box-none">
        <View style={s.card}>

          {/* ── STEP 1: Customers list ── */}
          {step === 'customers' && (
            <>
              <View style={[s.header, isRTL && s.headerRtl]}>
                <TouchableOpacity style={s.headerSide} onPress={resetAndClose} activeOpacity={0.6}>
                  <Text style={[s.headerActionText, { fontFamily: af('regular'), textAlign: rtlText('left') }]}>{t('cancel')}</Text>
                </TouchableOpacity>
                <Text style={[s.headerTitle, { fontFamily: af('semibold') }]}>{t('cfCustomersTitle')}</Text>
                <View style={s.headerSideRight}>
                  <TouchableOpacity style={s.iconBtn} activeOpacity={0.7}>
                    <SyncIcon />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.plusBtn}
                    onPress={openCreateCustomer}
                    activeOpacity={0.7}
                  >
                    <PlusIcon />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Search */}
              <View style={s.searchRow}>
                <View style={[s.searchBox, isRTL && s.searchBoxRtl]}>
                  <SearchIcon />
                  <TextInput
                    style={[s.searchInput, { fontFamily: af('regular'), textAlign: rtlText('left') }]}
                    placeholder={t('cfSearchCustomersPh')}
                    placeholderTextColor={Colors.placeholder}
                    value={search}
                    onChangeText={setSearch}
                  />
                </View>
              </View>

              <View style={s.listDivider} />

              <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
                {filteredCustomers.map((c, i) => (
                  <View key={c.id}>
                    {i > 0 && <View style={s.rowDivider} />}
                    <TouchableOpacity style={[s.customerRow, isRTL && s.rowRtl]} onPress={() => handleSelectCustomer(c.id)} activeOpacity={0.7}>
                      <View style={s.customerInfo}>
                        <Text style={[s.customerName, { fontFamily: af('medium') }]}>{c.name}</Text>
                        <Text style={[s.customerPhone, { fontFamily: af('regular') }]}>{c.phone}</Text>
                      </View>
                      <View style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}>
                        <ChevronRightIcon />
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
                {filteredCustomers.length === 0 && (
                  <View style={s.emptyRow}>
                    <Text style={[s.emptyText, { fontFamily: af('regular') }]}>{t('cfNoCustomersFound')}</Text>
                  </View>
                )}
                <View style={{ height: 8 }} />
              </ScrollView>
            </>
          )}

          {/* ── STEP 2: Create customer ── */}
          {step === 'create-customer' && (
            <>
              <View style={[s.header, s.headerChromeLtr]}>
                <TouchableOpacity style={s.headerSide} onPress={() => setStep('customers')} activeOpacity={0.6}>
                  <View style={s.backRow}>
                    <View style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}>
                      <ChevronLeftIcon />
                    </View>
                    <Text style={[s.headerActionText, { fontFamily: af('regular') }]}>{t('back')}</Text>
                  </View>
                </TouchableOpacity>
                <Text style={[s.headerTitle, { fontFamily: af('semibold') }]}>{t('cfCreateNewCustomer')}</Text>
                <TouchableOpacity style={[s.headerSide, s.headerSideRight]} onPress={handleSaveCustomer} activeOpacity={0.6}>
                  <Text style={[s.headerActionText, s.headerActionSave, { fontFamily: af('semibold') }]}>{t('save')}</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={[s.scroll, isRTL && s.formScrollRtl]} showsVerticalScrollIndicator={false}>
                <FormRow label={t('country')} value={newCountry} onChangeText={setNewCountry} placeholder={t('phCountryField')} />
                <View style={s.rowDivider} />
                <FormRow label={t('nameLabel')} value={newName} onChangeText={setNewName} placeholder={t('fullName')} />
                <View style={s.rowDivider} />
                <FormRow
                  label={t('phone')}
                  value={newPhone}
                  onChangeText={setNewPhone}
                  placeholder={t('phPhoneSa')}
                  keyboardType="phone-pad"
                  inputLtr
                />
                <View style={s.rowDivider} />
                <FormRow
                  label={t('email')}
                  value={newEmail}
                  onChangeText={setNewEmail}
                  placeholder={t('phEmailExample')}
                  keyboardType="email-address"
                  inputLtr
                />
                <View style={{ height: 16 }} />
              </ScrollView>
            </>
          )}

          {/* ── STEP 3: Address list ── */}
          {step === 'addresses' && (
            <>
              <View style={[s.header, isRTL && s.headerRtl]}>
                <TouchableOpacity style={s.headerSide} onPress={resetAndClose} activeOpacity={0.6}>
                  <Text style={[s.headerActionText, { fontFamily: af('regular'), textAlign: rtlText('left') }]}>{t('cancel')}</Text>
                </TouchableOpacity>
                <Text style={[s.headerTitle, { fontFamily: af('semibold') }]}>{t('cfAddressTitle')}</Text>
                <TouchableOpacity
                  style={[s.headerSide, s.headerSideRight]}
                  onPress={() => setStep('create-address')}
                  activeOpacity={0.6}
                >
                  <Text style={[s.headerActionText, s.headerActionSave, { fontFamily: af('semibold') }]}>{t('cfCreateNewShort')}</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
                {MOCK_ADDRESSES.map((addr, i) => (
                  <View key={addr.id}>
                    {i > 0 && <View style={s.rowDivider} />}
                    <TouchableOpacity style={[s.addressRow, isRTL && s.rowRtl]} onPress={() => handleSelectAddress(addr)} activeOpacity={0.7}>
                      <View style={s.addressInfo}>
                        <Text style={[s.addressText, { fontFamily: af('medium') }]}>{addr.address}</Text>
                        <Text style={[s.addressDesc, { fontFamily: af('regular') }]}>{addr.description}</Text>
                      </View>
                      <Text style={[s.addressZone, { fontFamily: af('medium') }]}>{t(addr.zoneKey)}</Text>
                      <View style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}>
                        <ChevronRightIcon />
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={{ height: 8 }} />
              </ScrollView>
            </>
          )}

          {/* ── STEP 4: Create address ── */}
          {step === 'create-address' && (
            <>
              <View style={[s.header, s.headerChromeLtr]}>
                <TouchableOpacity style={s.headerSide} onPress={() => setStep('addresses')} activeOpacity={0.6}>
                  <View style={s.backRow}>
                    <View style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}>
                      <ChevronLeftIcon />
                    </View>
                    <Text style={[s.headerActionText, { fontFamily: af('regular') }]}>{t('back')}</Text>
                  </View>
                </TouchableOpacity>
                <Text style={[s.headerTitle, { fontFamily: af('semibold') }]}>{t('cfCreateNewAddress')}</Text>
                <TouchableOpacity style={[s.headerSide, s.headerSideRight]} onPress={handleSaveAddress} activeOpacity={0.6}>
                  <Text style={[s.headerActionText, s.headerActionSave, { fontFamily: af('semibold') }]}>{t('save')}</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={[s.scroll, isRTL && s.formScrollRtl]} showsVerticalScrollIndicator={false}>
                <FormRow label={t('addressField')} value={newAddress} onChangeText={setNewAddress} placeholder={t('phStreetBuilding')} />
                <View style={s.rowDivider} />
                <FormRow label={t('cfDescription')} value={newDesc} onChangeText={setNewDesc} placeholder={t('phFloorLandmark')} />
                <View style={s.rowDivider} />
                <FormRow label={t('cfDeliveryZone')} value={newZone} onChangeText={setNewZone} placeholder={t('phZoneExample')} />
                <View style={{ height: 16 }} />
              </ScrollView>
            </>
          )}

        </View>
      </View>
    </RootModal>
  );
}

// ─── Form row ────────────────────────────────────────────────────────────────
interface FormRowProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
  /** Phone / email: force LTR digits and @ so placeholders are not reshaped by RTL. */
  inputLtr?: boolean;
}

function FormRow({ label, value, onChangeText, placeholder, keyboardType = 'default', inputLtr }: FormRowProps) {
  const { af, isRTL, rtlText } = useI18n();
  const [focused, setFocused] = useState(false);
  const inputDirStyle = inputLtr
    ? ({ textAlign: 'left' as const, writingDirection: 'ltr' as const })
    : { textAlign: rtlText('left') };
  return (
    <View style={[s.formRow, isRTL && s.formRowRtlDir]}>
      <Text style={[s.formLabel, focused && s.formLabelFocused, { fontFamily: af('medium'), textAlign: rtlText('left') }]}>
        {label}
      </Text>
      <View style={[s.inputBox, focused && s.inputBoxFocused]}>
        <TextInput
          style={[s.formInput, { fontFamily: af('regular') }, inputDirStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholder}
          keyboardType={keyboardType}
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={Colors.primary}
          {...(Platform.OS === 'android' ? { cursorColor: Colors.primary } : {})}
        />
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.40)' },
  center:   { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },

  card: {
    width: 520,
    maxHeight: 700,
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.20,
    shadowRadius: 28,
    elevation: 14,
  },

  /* Header — sides stretch full height so the whole area is tappable */
  header: {
    backgroundColor: Colors.grayLight,
    height: 72,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.grayBorder,
  },
  headerSide: {
    minWidth: 90,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  headerSideRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.35,
    textAlign: 'center',
    alignSelf: 'center',
  },
  /** List pickers: mirror toolbar like native RTL. */
  headerRtl: {
    direction: 'rtl',
  },
  /** Create forms: keep Back on the left and Save on the right (physical). */
  headerChromeLtr: {
    direction: 'ltr',
  },
  headerActionText: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  headerActionSave: {
    fontWeight: '600',
    color: Colors.primary,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Search */
  searchRow: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grayLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    paddingHorizontal: 14,
    height: 56,
    gap: 10,
  },
  searchBoxRtl: {
    flexDirection: 'row-reverse',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.black,
    letterSpacing: -0.2,
    height: 56,
    outlineWidth: 0,
    outlineStyle: 'none',
  },

  listDivider: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.29)',
  },

  scroll: { maxHeight: 480 },

  rowDivider: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.29)',
    marginStart: 20,
  },

  /* Customer row */
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 22,
    gap: 12,
    minHeight: 72,
  },
  customerInfo: {
    flex: 1,
    gap: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.black,
    letterSpacing: -0.25,
  },
  customerPhone: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.1,
  },
  rowRtl: {
    direction: 'rtl',
  },

  emptyRow: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.placeholder,
  },

  /* Address row */
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 22,
    gap: 10,
    minHeight: 72,
  },
  addressInfo: {
    flex: 1,
    gap: 4,
  },
  addressText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.black,
    letterSpacing: -0.25,
  },
  addressDesc: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.grayText,
  },
  addressZone: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
  },

  /* Form row */
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 68,
    gap: 16,
  },
  formRowRtlDir: {
    direction: 'rtl',
  },
  formScrollRtl: {
    direction: 'rtl',
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.black,
    letterSpacing: -0.25,
    minWidth: 110,
  },
  formLabelFocused: {
    color: Colors.primary,
    fontWeight: '600',
  },
  inputBox: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.grayLight,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: 12,
    justifyContent: 'center',
    outlineWidth: 0,
  },
  inputBoxFocused: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    outlineWidth: 0,
  },
  formInput: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.primary,
    letterSpacing: -0.2,
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 0,
    outlineWidth: 0,
    outlineStyle: 'none',
  },
} as any);
