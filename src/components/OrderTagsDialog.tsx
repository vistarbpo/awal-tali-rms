import React, { useState, useEffect } from 'react';
import RootModal from './RootModal';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';
import type { TKey } from '../i18n/translations';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface OrderTag {
  id:    string;
  tKey:  TKey;
}

export const ORDER_TAGS: OrderTag[] = [
  { id: 'no_spice',    tKey: 'tagNoSpice' },
  { id: 'extra_sauce', tKey: 'tagExtraSauce' },
  { id: 'no_onion',    tKey: 'tagNoOnion' },
  { id: 'no_garlic',   tKey: 'tagNoGarlic' },
  { id: 'gluten_free', tKey: 'tagGlutenFree' },
  { id: 'dairy_free',  tKey: 'tagDairyFree' },
  { id: 'vegan',       tKey: 'tagVegan' },
  { id: 'allergy',     tKey: 'tagAllergy' },
  { id: 'vip',         tKey: 'tagVip' },
  { id: 'priority',    tKey: 'tagPriority' },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible:     boolean;
  activeTags:  string[];              // array of selected tag ids
  onClose:     () => void;
  onApply:     (tagIds: string[]) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function OrderTagsDialog({ visible, activeTags, onClose, onApply }: Props) {
  const { t, af, isRTL } = useI18n();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (visible) setSelected(activeTags);
  }, [visible]);

  function toggleTag(id: string) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  }

  function handleDone() {
    onApply(selected);
    onClose();
  }

  return (
    <RootModal
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
        <View style={s.card}>

          {/* Header */}
          <View style={s.header}>
            <Text style={[s.headerTitle, { fontFamily: af('semibold') }]}>{t('orderTagsTitle')}</Text>
          </View>

          {/* List */}
          <ScrollView style={s.list} bounces={false}>
            {ORDER_TAGS.map((tag, index) => {
              const isSelected = selected.includes(tag.id);
              return (
                <TouchableOpacity
                  key={tag.id}
                  activeOpacity={0.7}
                  onPress={() => toggleTag(tag.id)}
                >
                  {index > 0 && <View style={s.divider} />}
                  <View style={s.row}>
                    <Text style={[s.rowLabel, isSelected && s.rowLabelSelected, { fontFamily: af('regular') }]}>
                      {t(tag.tKey)}
                    </Text>
                    {isSelected && <Text style={s.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={s.footer}>
            <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={[s.footerBtnText, { fontFamily: af('bold') }]}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.doneBtn} onPress={handleDone} activeOpacity={0.85}>
              <Text style={[s.footerBtnText, { fontFamily: af('bold') }]}>{t('done')}</Text>
            </TouchableOpacity>
          </View>

        </View>
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
  card: {
    width: 440,
    maxHeight: 560,
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
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
  list: {
    flexGrow: 0,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.29)',
    marginStart: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  rowLabel: {
    flex: 1,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.3,
  },
  rowLabelSelected: {
    color: Colors.primary,
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: '600',
  },
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
  doneBtn: {
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
});
