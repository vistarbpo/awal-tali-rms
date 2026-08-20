import React from 'react';
import RootModal from './RootModal';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';
import type { TKey } from '../i18n/translations';

const RETURN_REASON_KEYS: TKey[] = [
  'returnReasonCustomerRequest',
  'returnReasonWrongItem',
  'returnReasonNotAsDescribed',
  'returnReasonDamaged',
  'returnReasonOther',
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (reason: string) => void;
}

export default function ReturnReasonDialog({ visible, onClose, onSelect }: Props) {
  const { t, af } = useI18n();
  return (
    <RootModal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>

      <View style={s.center} pointerEvents="box-none">
        <View style={s.card}>

          {/* Header */}
          <View style={s.header}>
            <Text style={[s.title, { fontFamily: af('semibold') }]}>{t('returnOrderTitle')}</Text>
            <Text style={[s.subtitle, { fontFamily: af('regular') }]}>{t('selectReasonBelow')}</Text>
          </View>

          {/* Reasons */}
          {RETURN_REASON_KEYS.map((key, i) => (
            <View key={key}>
              {i > 0 && <View style={s.divider} />}
              <TouchableOpacity
                style={s.row}
                onPress={() => onSelect(t(key))}
                activeOpacity={0.6}
              >
                <Text style={[s.reasonText, { fontFamily: af('regular') }]}>{t(key)}</Text>
              </TouchableOpacity>
            </View>
          ))}

        </View>
      </View>
    </RootModal>
  );
}

const s = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  center:   { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },

  card: {
    width: 415,
    backgroundColor: 'rgba(242,242,242,0.96)',
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },

  header: {
    alignItems: 'center',
    paddingTop: 22,
    paddingBottom: 18,
    paddingHorizontal: 26,
    gap: 6,
  },
  title: {
    fontSize: 19,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '300',
    color: Colors.black,
    textAlign: 'center',
    opacity: 0.7,
  },

  divider: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.29)',
    marginStart: 24,
  },
  row: {
    paddingHorizontal: 26,
    paddingVertical: 18,
    alignItems: 'center',
  },
  reasonText: {
    fontSize: 18,
    fontWeight: '400',
    color: Colors.primary,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
});
