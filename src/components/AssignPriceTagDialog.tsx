import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Colors } from '../constants/colors';
import RootModal from './RootModal';
import { useI18n } from '../i18n';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PriceTag {
  id:         string;
  label:      string;
  multiplier: number;   // 1.0 = no change, 1.2 = 20% higher
}

export const PRICE_TAGS: PriceTag[] = [
  { id: 'default',  label: 'Default (Store Price)',   multiplier: 1.00 },
  { id: 'delivery', label: 'App Delivery Products',   multiplier: 1.15 },
  { id: 'keeta',    label: 'Keeta',                   multiplier: 1.20 },
  { id: 'jahez',    label: 'Jahez',                   multiplier: 1.18 },
  { id: 'hungerst', label: 'HungerStation',           multiplier: 1.18 },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible:        boolean;
  activePriceTag: PriceTag | null;
  onClose:        () => void;
  onApply:        (tag: PriceTag | null) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AssignPriceTagDialog({ visible, activePriceTag, onClose, onApply }: Props) {
  const { t, af } = useI18n();
  const [selected, setSelected] = useState<PriceTag | null>(null);

  useEffect(() => {
    if (visible) setSelected(activePriceTag);
  }, [visible]);

  function handleDone() {
    onApply(selected?.id === 'default' ? null : selected);
    onClose();
  }

  const cardJSX = (
    <View style={s.card}>
      <View style={s.header}>
        <Text style={[s.headerTitle, { fontFamily: af('semibold') }]}>{t('priceTagTitle')}</Text>
      </View>
      <ScrollView style={s.list} bounces={false}>
        {PRICE_TAGS.map((tag, index) => {
          const isSelected = selected?.id === tag.id || (tag.id === 'default' && selected === null);
          return (
            <TouchableOpacity key={tag.id} activeOpacity={0.7} onPress={() => setSelected(tag.id === 'default' ? null : tag)}>
              {index > 0 && <View style={s.divider} />}
              <View style={s.row}>
                <Text style={[s.rowLabel, isSelected && s.rowLabelSelected]}>{tag.label}</Text>
                {isSelected && <Text style={s.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={s.footer}>
        <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.85}>
          <Text style={[s.footerBtnText, { fontFamily: af('bold') }]}>{t('cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.doneBtn} onPress={handleDone} activeOpacity={0.85}>
          <Text style={[s.footerBtnText, { fontFamily: af('bold') }]}>{t('done')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
  card: {
    width: 480,
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
    marginLeft: 24,
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
  inlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
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
