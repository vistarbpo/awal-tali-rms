import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';

interface Props {
  visible:    boolean;
  itemName:   string;
  note:       string;
  onClose:    () => void;
  onSave:     (note: string) => void;
}

export default function ItemNoteDialog({ visible, itemName, note: initialNote, onClose, onSave }: Props) {
  const { t, af, isRTL } = useI18n();
  const [note,    setNote]    = useState('');
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (visible) setNote(initialNote);
  }, [visible]);

  function handleSave() {
    onSave(note);
    onClose();
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
        <View style={s.card}>

          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={s.cancelWrap}>
              <Text style={[s.cancelText, { fontFamily: af('medium') }]}>{t('cancel')}</Text>
            </TouchableOpacity>
            <View style={s.headerTitleWrap}>
              <Text style={[s.headerTitle, { fontFamily: af('semibold') }]}>{t('itemNoteTitle')}</Text>
              <Text style={[s.headerSub, { fontFamily: af('regular') }]} numberOfLines={1}>{itemName}</Text>
            </View>
            <View style={s.cancelWrap} />
          </View>

          {/* Note input */}
          <View style={s.section}>
            <Text style={[s.sectionLabel, { fontFamily: af('semibold') }]}>{t('itemNoteTitle')}</Text>
            <TextInput
              style={[s.textArea, focused && s.textAreaFocused, { fontFamily: af('regular'), textAlign: isRTL ? 'right' : 'left' }]}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note sent to the kitchen..."
              placeholderTextColor={Colors.placeholder}
              multiline
              numberOfLines={4}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              textAlignVertical="top"
              autoFocus
              {...{ outlineWidth: 0, outlineStyle: 'none' } as any}
            />
          </View>

          {/* Save */}
          <View style={s.footer}>
            <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={[s.saveBtnText, { fontFamily: af('bold') }]}>{t('save')}</Text>
            </TouchableOpacity>
          </View>

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
    width: 400,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grayLight,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  cancelWrap: {
    width: 72,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.red,
    letterSpacing: -0.3,
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.2,
    marginTop: 2,
  },

  section: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.grayText,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  textArea: {
    height: 108,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.2,
  } as any,
  textAreaFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },

  footer: {
    padding: 16,
    paddingTop: 12,
  },
  saveBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
});
