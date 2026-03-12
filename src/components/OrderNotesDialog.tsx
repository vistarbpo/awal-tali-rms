import React, { useState, useEffect, useRef } from 'react';
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

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible:        boolean;
  receiptNotes:   string;
  kitchenNotes:   string;
  onClose:        () => void;
  onSave:         (receiptNotes: string, kitchenNotes: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function OrderNotesDialog({
  visible,
  receiptNotes: initialReceipt,
  kitchenNotes: initialKitchen,
  onClose,
  onSave,
}: Props) {
  const [receipt,        setReceipt]        = useState('');
  const [kitchen,        setKitchen]        = useState('');
  const [receiptFocused, setReceiptFocused] = useState(false);
  const [kitchenFocused, setKitchenFocused] = useState(false);

  useEffect(() => {
    if (visible) {
      setReceipt(initialReceipt);
      setKitchen(initialKitchen);
    }
  }, [visible]);

  function handleSave() {
    onSave(receipt, kitchen);
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
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={s.headerTitle}>Order Notes</Text>
            <View style={s.cancelWrap} />
          </View>

          {/* Receipt Notes */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Receipt Notes</Text>
            <TextInput
              style={[s.textArea, receiptFocused && s.textAreaFocused]}
              value={receipt}
              onChangeText={setReceipt}
              placeholder="Add a note printed on the receipt..."
              placeholderTextColor={Colors.placeholder}
              multiline
              numberOfLines={3}
              onFocus={() => setReceiptFocused(true)}
              onBlur={() => setReceiptFocused(false)}
              textAlignVertical="top"
            />
          </View>

          <View style={s.divider} />

          {/* Kitchen Notes */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Kitchen Notes</Text>
            <TextInput
              style={[s.textArea, kitchenFocused && s.textAreaFocused]}
              value={kitchen}
              onChangeText={setKitchen}
              placeholder="Add a note sent to the kitchen..."
              placeholderTextColor={Colors.placeholder}
              multiline
              numberOfLines={3}
              onFocus={() => setKitchenFocused(true)}
              onBlur={() => setKitchenFocused(false)}
              textAlignVertical="top"
            />
          </View>

          {/* Save */}
          <View style={s.footer}>
            <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={s.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
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
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },

  // Header
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
    width: 80,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.red,
    letterSpacing: -0.3,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.4,
    textAlign: 'center',
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
    height: 88,
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
  },
  textAreaFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },

  divider: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.29)',
    marginHorizontal: 20,
  },

  // Footer
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
