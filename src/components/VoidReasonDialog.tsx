import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';

const VOID_REASON_KEYS = ['reasonNotAvail', 'reasonNoShow', 'reasonCancelled'] as const;

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectReason: (reason: string) => void;
}

export default function VoidReasonDialog({ visible, onClose, onSelectReason }: Props) {
  const { t, af } = useI18n();
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
        <View style={s.card}>

          {/* Red accent bar */}
          <View style={s.accentBar} />

          {/* Icon + header */}
          <View style={s.header}>
            <View style={s.iconWrap}>
              <View style={s.iconInner} />
            </View>
            <Text style={[s.title, { fontFamily: af('bold') }]}>{t('cancelOrder')}</Text>
            <Text style={[s.subtitle, { fontFamily: af('regular') }]}>{t('selectVoidReason')}</Text>
          </View>

          {/* Reason list */}
          <View style={s.dividerFull} />
          {VOID_REASON_KEYS.map((key, index) => (
            <React.Fragment key={key}>
              {index > 0 && <View style={s.divider} />}
              <TouchableOpacity
                style={s.row}
                onPress={() => onSelectReason(t(key))}
                activeOpacity={0.55}
              >
                <View style={s.rowDot} />
                <Text style={[s.rowLabel, { fontFamily: af('medium') }]}>{t(key)}</Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}

          {/* Cancel button */}
          <View style={s.dividerFull} />
          <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.65}>
            <Text style={[s.cancelText, { fontFamily: af('semibold') }]}>{t('cancel')}</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

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
    width: 380,
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 14,
  },

  /* Red accent bar at top */
  accentBar: {
    height: 4,
    backgroundColor: Colors.red,
  },

  /* Header */
  header: {
    backgroundColor: Colors.grayLight,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FAE8E8',   // light red tint — redShadow at low opacity
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.red,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.1,
    textAlign: 'center',
  },

  /* Reason rows */
  dividerFull: {
    height: 1,
    backgroundColor: Colors.grayBorder,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.18)',
    marginHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    gap: 14,
  },
  rowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.red,
    flexShrink: 0,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
    letterSpacing: -0.3,
    lineHeight: 22,
  },

  /* Cancel button */
  cancelBtn: {
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.grayText,
    letterSpacing: -0.2,
  },
});
