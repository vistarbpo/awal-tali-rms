import React, { useState, useEffect } from 'react';
import RootModal from './RootModal';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';
import type { TKey } from '../i18n/translations';

export interface ReturnItem {
  name: string;
  nameKey?: TKey;
  qty: number;
  price: number;
  isWaste: boolean;
  note?: string;
  noteKey?: TKey;
}

interface OrderItem {
  name: string;
  nameKey?: TKey;
  qty: number;
  price: number;
  note?: string;
  noteKey?: TKey;
}

interface Props {
  visible: boolean;
  items: OrderItem[];
  onClose: () => void;
  onDone: (items: ReturnItem[]) => void;
}

// ─── View-drawn icons (no font/asset dependency) ─────────────────────────────
function MinusIcon() {
  return <View style={icon.bar} />;
}

function PlusIcon() {
  return (
    <View style={icon.plusWrap}>
      <View style={icon.bar} />
      <View style={icon.barV} />
    </View>
  );
}

const icon = StyleSheet.create({
  bar:     { width: 14, height: 2.5, backgroundColor: Colors.white, borderRadius: 2 },
  plusWrap:{ width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  barV:    { width: 2.5, height: 14, backgroundColor: Colors.white, borderRadius: 2, position: 'absolute' },
});

// ─── Preview flag (Figma capture) ─────────────────────────────────────────────
const PREVIEW_ALL_WASTE = false;

// ─── Component ────────────────────────────────────────────────────────────────
export default function ReturnOrderDialog({ visible, items, onClose, onDone }: Props) {
  const { t, af, isRTL } = useI18n();
  const [returnQtys, setReturnQtys] = useState<number[]>([]);
  const [wastes, setWastes]         = useState<boolean[]>([]);

  useEffect(() => {
    if (visible) {
      setReturnQtys(PREVIEW_ALL_WASTE ? items.map(item => item.qty) : items.map(() => 0));
      setWastes(items.map(() => PREVIEW_ALL_WASTE));
    }
  }, [visible]);

  function increment(i: number) {
    setReturnQtys(prev => {
      const next = [...prev];
      if (next[i] < items[i].qty) next[i]++;
      return next;
    });
  }

  function decrement(i: number) {
    setReturnQtys(prev => {
      const next = [...prev];
      if (next[i] > 0) next[i]--;
      return next;
    });
  }

  function toggleWaste(i: number) {
    setWastes(prev => { const n = [...prev]; n[i] = !n[i]; return n; });
  }

  const allSelected = items.length > 0 && returnQtys.every((q, i) => q === items[i]?.qty);

  function selectAll() {
    if (allSelected) {
      setReturnQtys(items.map(() => 0));
    } else {
      setReturnQtys(items.map(item => item.qty));
    }
  }

  function handleDone() {
    const selected = items
      .map((item, i) => ({
        name: item.name,
        nameKey: item.nameKey,
        qty: returnQtys[i],
        price: item.price,
        isWaste: wastes[i],
        ...(item.note || item.noteKey ? { note: item.note, noteKey: item.noteKey } : {}),
      }))
      .filter(r => r.qty > 0);
    onDone(selected);
  }

  return (
    <RootModal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={s.card}>

          {/* Header */}
          <View style={s.header}>
            <Text style={[s.headerTitle, { fontFamily: af('bold') }]}>{t('selectReturnItems')}</Text>
            <Text style={[s.headerSub, { fontFamily: af('regular') }]}>{t('chooseQtyAndWaste')}</Text>
          </View>

          {/* Select / Deselect All */}
          <View style={s.selectAllRow}>
            <TouchableOpacity
              style={[s.selectAllBtn, allSelected && s.selectAllBtnOn, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
              onPress={selectAll}
              activeOpacity={0.75}
            >
              <View style={[s.checkbox, allSelected && s.checkboxOn]}>
                {allSelected && <View style={s.checkmark} />}
              </View>
              <Text style={[s.selectAllText, allSelected && s.selectAllTextOn, { fontFamily: af('semibold') }]}>
                {allSelected ? t('deselectAll') : t('selectAll')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Item rows */}
          <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
            {items.map((item, i) => {
              const qty    = returnQtys[i] ?? 0;
              const isWaste = wastes[i] ?? false;
              const atMax  = qty >= item.qty;
              const atMin  = qty === 0;

              return (
                <View key={i}>
                  {i > 0 && <View style={s.divider} />}
                  <View style={[s.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>

                    {/* Name + note */}
                    <View style={s.nameCol}>
                      <Text style={s.itemName} numberOfLines={2}>
                        {item.nameKey ? t(item.nameKey) : item.name}
                      </Text>
                      {(item.note || item.noteKey) && (
                        <Text style={s.itemNote}>{item.noteKey ? t(item.noteKey) : item.note}</Text>
                      )}
                    </View>

                    {/* Stepper */}
                    <View style={s.stepper}>
                      <TouchableOpacity
                        style={[s.stepBtn, s.stepBtnMinus, atMin && s.stepBtnDisabled]}
                        onPress={() => decrement(i)}
                        activeOpacity={atMin ? 1 : 0.7}
                      >
                        <MinusIcon />
                      </TouchableOpacity>

                      <View style={s.qtyBox}>
                        <Text style={s.qtyNum}>{qty}</Text>
                        <Text style={s.qtyOf}>/ {item.qty}</Text>
                      </View>

                      <TouchableOpacity
                        style={[s.stepBtn, s.stepBtnPlus, atMax && s.stepBtnDisabled]}
                        onPress={() => increment(i)}
                        activeOpacity={atMax ? 1 : 0.7}
                      >
                        <PlusIcon />
                      </TouchableOpacity>
                    </View>

                    {/* Waste toggle */}
                    <TouchableOpacity
                      style={[s.wasteBtn, isWaste && s.wasteBtnOn, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                      onPress={() => toggleWaste(i)}
                      activeOpacity={0.7}
                    >
                      <View style={[s.wasteDot, isWaste && s.wasteDotOn]} />
                      <Text style={[s.wasteLabel, isWaste && s.wasteLabelOn]}>{t('waste')}</Text>
                    </TouchableOpacity>

                  </View>
                </View>
              );
            })}
            <View style={{ height: 6 }} />
          </ScrollView>

          {/* Footer */}
          <View style={s.footer}>
            <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={s.cancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <View style={s.footerDivider} />
            <TouchableOpacity style={s.doneBtn} onPress={handleDone} activeOpacity={0.8}>
              <Text style={s.footerText}>{t('done')}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </RootModal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 560,
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 32,
    elevation: 16,
  },

  /* Header */
  header: {
    backgroundColor: Colors.warmTint,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 20,
    gap: 5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.1,
    textAlign: 'center',
  },

  selectAllRow: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  selectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.grayBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  selectAllBtnOn: {
    backgroundColor: Colors.darkInk,
    borderColor: Colors.darkInk,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.grayMid,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    borderColor: Colors.white,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  checkmark: {
    width: 10,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: Colors.white,
    marginTop: -2,
    transform: [{ rotate: '-45deg' }],
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.1,
  },
  selectAllTextOn: {
    color: Colors.white,
  },

  scroll: { maxHeight: 400 },

  divider: {
    height: 1,
    backgroundColor: Colors.grayBorder,
    marginHorizontal: 24,
  },

  /* Row */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,
  },
  nameCol: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  itemNote: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.grayText,
  },

  /* Stepper */
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    overflow: 'hidden',
  },
  stepBtn: {
    width: 40,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnMinus: {
    backgroundColor: Colors.darkInk,
  },
  stepBtnPlus: {
    backgroundColor: Colors.goldShade,
  },
  stepBtnDisabled: {
    opacity: 0.35,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 14,
    gap: 3,
    minWidth: 64,
    justifyContent: 'center',
  },
  qtyNum: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.brand,
    letterSpacing: -0.3,
  },
  qtyOf: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.grayText,
  },

  /* Waste toggle */
  wasteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.grayBorder,
    backgroundColor: Colors.white,
  },
  wasteBtnOn: {
    backgroundColor: Colors.cancelSurface,
    borderColor: Colors.darkInk,
  },
  wasteDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.grayMid,
  },
  wasteDotOn: {
    backgroundColor: Colors.darkInk,
  },
  wasteLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.grayText,
  },
  wasteLabelOn: {
    color: Colors.darkInk,
    fontWeight: '600',
  },

  /* Footer */
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.grayBorder,
    height: 64,
  },
  footerDivider: {
    width: 1,
    backgroundColor: Colors.grayBorder,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cancelSurface,
  },
  cancelText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.darkInk,
    letterSpacing: -0.2,
  },
  doneBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brand,
  },
  footerText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: -0.2,
  },
});
