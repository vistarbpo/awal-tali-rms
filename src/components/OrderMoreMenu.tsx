import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';

// ─── Menu definitions ─────────────────────────────────────────────────────────
export type OrderMenuStatus = 'active' | 'voided' | 'returned' | 'done';

interface MenuItem { key: string; label: string; danger?: boolean }

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible:      boolean;
  onClose:      () => void;
  onItemPress?: (key: string) => void;
  status:       OrderMenuStatus;
  hasCustomer?: boolean;
  orderType?:   string | null;
  anchorRight?: number;
  anchorTop?:   number;
  useModal?:    boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function OrderMoreMenu({
  visible,
  onClose,
  onItemPress,
  status,
  hasCustomer = false,
  orderType,
  anchorRight = 20,
  anchorTop   = 130,
  useModal    = Platform.OS !== 'web',
}: Props) {
  const { t, af } = useI18n();

  const ACTIVE_ITEMS: MenuItem[] = [
    { key: 'set_guests',       label: t('setGuests') },
    { key: 'add_due_time',     label: t('addDueTime') },
    { key: 'add_charge',       label: t('addCharge') },
    { key: 'add_call_name',    label: t('addCallName') },
    { key: 'remove_customer',  label: t('removeCustomer') },
    { key: 'assign_price_tag', label: t('assignPriceTag') },
    { key: 'assign_table',     label: t('assignTable') },
    { key: 'add_coupon',       label: t('addCoupon') },
    { key: 'join_order',       label: t('joinOrder') },
    { key: 'split_order',      label: t('splitOrder') },
    { key: 'redeem_reward',    label: t('redeemReward') },
    { key: 'scan_loyalty_qr',  label: t('scanLoyaltyQr') },
  ];

  const DONE_ITEMS: MenuItem[] = [
    { key: 'return_order',  label: t('returnOrder') },
    { key: 'view_receipt',  label: t('viewReceipt') },
  ];

  const VOIDED_ITEMS: MenuItem[] = [
    { key: 'view_receipt', label: t('viewReceipt') },
    { key: 'print',        label: 'Print' },
  ];

  const RETURNED_ITEMS: MenuItem[] = [
    { key: 'view_receipt', label: t('viewReceipt') },
  ];

  function getItems(s: OrderMenuStatus): MenuItem[] {
    if (s === 'done')     return DONE_ITEMS;
    if (s === 'voided')   return VOIDED_ITEMS;
    if (s === 'returned') return RETURNED_ITEMS;
    return ACTIVE_ITEMS;
  }

  const isDelivery = orderType === 'Delivery';
  const items = getItems(status)
    .filter(item => item.key !== 'remove_customer' || hasCustomer)
    .reduce<MenuItem[]>((acc, item) => {
      acc.push(item);
      // Insert delivery-specific items after 'add_charge'
      if (item.key === 'add_charge' && isDelivery) {
        acc.push({ key: 'add_delivery_address', label: t('addDeliveryAddress') });
        acc.push({ key: 'add_driver',           label: t('addDriver') });
      }
      return acc;
    }, []);

  const inner = (
    <>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>
      <View
        style={[s.anchor, { right: anchorRight, top: anchorTop }]}
        pointerEvents="box-none"
      >
        <View style={s.card}>
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
                <Text style={[s.label, item.danger && s.labelDanger, { fontFamily: af('regular') }]}>
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );

  if (useModal) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        {inner}
      </Modal>
    );
  }

  if (!visible) return null;
  return <View style={s.inlineOverlay} pointerEvents="box-none">{inner}</View>;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const MENU_W = 280;

const s = StyleSheet.create({
  inlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
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
