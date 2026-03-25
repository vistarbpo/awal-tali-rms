import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors } from '../constants/colors';

// ─── Menu definitions ─────────────────────────────────────────────────────────
export type OrderMenuStatus = 'active' | 'voided' | 'returned' | 'done';

interface MenuItem { key: string; label: string; danger?: boolean }

const ACTIVE_ITEMS: MenuItem[] = [
  { key: 'set_guests',       label: 'Set Guests' },
  { key: 'add_due_time',     label: 'Add Due Time' },
  { key: 'add_charge',       label: 'Add Charge' },
  { key: 'add_call_name',    label: 'Add Call Name' },
  { key: 'remove_customer',  label: 'Remove Customer' },
  { key: 'assign_price_tag', label: 'Assign Price Tag' },
  { key: 'assign_table',     label: 'Assign Table' },
  { key: 'add_coupon',       label: 'Add Coupon' },
  { key: 'join_order',       label: 'Join Order' },
  { key: 'split_order',      label: 'Split Order' },
  { key: 'redeem_reward',    label: 'Redeem Reward' },
  { key: 'scan_loyalty_qr',  label: 'Scan Loyalty QR' },
];

const DONE_ITEMS: MenuItem[] = [
  { key: 'return_order',  label: 'Return order' },
  { key: 'view_receipt',  label: 'View Receipt' },
];

const VOIDED_ITEMS: MenuItem[] = [
  { key: 'view_receipt', label: 'View Receipt' },
  { key: 'print',        label: 'Print' },
];

const RETURNED_ITEMS: MenuItem[] = [
  { key: 'view_receipt', label: 'View Receipt' },
];

function getItems(status: OrderMenuStatus): MenuItem[] {
  if (status === 'done')     return DONE_ITEMS;
  if (status === 'voided')   return VOIDED_ITEMS;
  if (status === 'returned') return RETURNED_ITEMS;
  return ACTIVE_ITEMS;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible:      boolean;
  onClose:      () => void;
  onItemPress?: (key: string) => void;
  status:       OrderMenuStatus;
  hasCustomer?: boolean;
  anchorRight?: number;
  anchorTop?:   number;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function OrderMoreMenu({
  visible,
  onClose,
  onItemPress,
  status,
  hasCustomer = false,
  anchorRight = 20,
  anchorTop   = 130,
}: Props) {
  const items = getItems(status).filter(
    item => item.key !== 'remove_customer' || hasCustomer,
  );

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

      <View
        style={[s.anchor, { right: anchorRight, top: anchorTop }]}
        pointerEvents="box-none"
      >
        {/* Card with embedded triangle tip */}
        <View style={s.card}>
          {/* Triangle — absolutely positioned above the card, pointing up */}
          <View style={s.triangleWrap} pointerEvents="none">
            <View style={s.triangle} />
          </View>
          {items.map((item, index) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => { onItemPress?.(item.key); onClose(); }}
              activeOpacity={0.7}
            >
              {index > 0 && <View style={s.divider} />}
              <View style={s.row}>
                <Text style={[s.label, item.danger && s.labelDanger]}>
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const MENU_W = 280;

const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  anchor: {
    position: 'absolute',
    width: MENU_W,
    alignItems: 'flex-end',
  },
  triangleWrap: {
    position: 'absolute',
    top: -12,
    right: 24,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 13,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.white,
  },
  card: {
    width: MENU_W,
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingVertical: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 10,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.29)',
  },
  row: {
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.4,
  },
  labelDanger: {
    color: Colors.red,
  },
});
