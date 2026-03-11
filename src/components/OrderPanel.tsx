import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/colors';
import { OrderDiscount } from './DiscountDialog';

// ─── Shared types ─────────────────────────────────────────────────────────────
export interface CartItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  discount?: OrderDiscount | null;
}

// ─── Icons (Figma node 43-382) ────────────────────────────────────────────────
const ICONS = {
  sarDark:      { uri: 'https://www.figma.com/api/mcp/asset/9abd0b7f-8af7-4a1b-8191-c6434269d8d7' },
  sarGray:      { uri: 'https://www.figma.com/api/mcp/asset/a87a31c4-ad15-4c7d-8cbd-fbc065a2fff7' },
  sarWhite:     { uri: 'https://www.figma.com/api/mcp/asset/79841237-e621-48bf-836f-e1dd0aa820dc' },
  xClose:       { uri: 'https://www.figma.com/api/mcp/asset/a3c1b4c3-adf5-47fc-94cb-779ead2c9f31' },
  chevronRight: { uri: 'https://www.figma.com/api/mcp/asset/2030ebbb-d2ee-41de-b21b-96523c3e0860' },
};

const TAX_RATE = 0.15;

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  items: CartItem[];
  selectedId: string | null;
  onSelectItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  orderType?: string | null;
  onOrderTypePress?: () => void;
  customer?: { name: string; phone: string; address: string } | null;
  onAddCustomerPress?: () => void;
  onTotalPress?: () => void;
  onCountPress?: () => void;
  orderSeq?: number;
  isPaymentOpen?: boolean;
  isVoided?:     boolean;
  isReturned?:   boolean;
  tableNumber?:  string;
  status?: string;
  discount?: OrderDiscount | null;
  onDiscountPress?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
function itemEffectiveTotal(item: CartItem): number {
  const base = item.price * item.qty;
  if (!item.discount) return base;
  if (item.discount.kind === 'percentage') return base * (1 - item.discount.value / 100);
  return Math.max(0, base - item.discount.value);
}

function statusColor(s: string) {
  const map: Record<string, string> = { ACTIVE: Colors.primary, PENDING: Colors.yellowGold, DONE: '#4CAF82', VOID: '#D45757', RETURNED: '#7C6DB5' };
  return map[s.toUpperCase()] ?? Colors.grayText;
}
function statusBg(s: string) {
  const map: Record<string, string> = { ACTIVE: Colors.primaryLight, PENDING: '#FFF8EC', DONE: '#E8F5EE', VOID: '#FAE8E8', RETURNED: '#F0EDF9' };
  return map[s.toUpperCase()] ?? Colors.grayLight;
}

export default function OrderPanel({ items, selectedId, onSelectItem, onRemoveItem, orderType, onOrderTypePress, customer, onAddCustomerPress, onTotalPress, onCountPress, orderSeq, isPaymentOpen, isVoided, isReturned, tableNumber, status, discount, onDiscountPress }: Props) {
  const subtotal        = items.reduce((sum, i) => sum + itemEffectiveTotal(i), 0);
  const discountAmount  = discount
    ? discount.kind === 'percentage'
      ? (subtotal * discount.value) / 100
      : Math.min(discount.value, subtotal)
    : 0;
  const discountedSub   = subtotal - discountAmount;
  // Taxes are inclusive — extracted from the total price
  const taxes           = discountedSub * TAX_RATE / (1 + TAX_RATE);
  const total           = discountedSub;

  return (
    <View style={s.root}>
      <View style={s.card}>

        {/* Header */}
        <View style={s.header}>
          {/* Row 1: seq# (left) + status badge (right) */}
          <View style={s.headerRow}>
            {orderSeq !== undefined ? (
              <TouchableOpacity onPress={onCountPress} activeOpacity={0.6} disabled={!onCountPress}>
                <Text style={[s.countNum, !!onCountPress && s.countNumLink]}>{String(orderSeq).padStart(2, '0')}</Text>
              </TouchableOpacity>
            ) : <View />}
            {status && (
              <View style={[s.statusBadge, { backgroundColor: statusBg(status) }]}>
                <Text style={[s.statusText, { color: statusColor(status) }]}>{status}</Text>
              </View>
            )}
          </View>

          {/* Row 2: delivery type (left) + customer name (right) */}
          <View style={s.headerRow}>
            <TouchableOpacity onPress={onOrderTypePress} activeOpacity={0.6} disabled={!onOrderTypePress}>
              <Text style={s.pickup}>{orderType ?? 'Order Type'}</Text>
            </TouchableOpacity>
            {customer ? (
              <TouchableOpacity onPress={onAddCustomerPress} activeOpacity={0.6}>
                <Text style={s.customerName} numberOfLines={1}>{customer.name}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={onAddCustomerPress} activeOpacity={0.6}>
                <Text style={s.addCustomer}>Add Customer</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={s.divider} />

        {/* Items section title — glass effect */}
        <BlurView intensity={60} tint="light">
          <View style={s.itemsTitle}>
            <Text style={s.itemsTitleText}>Items</Text>
            <Text style={s.itemsCount}>{items.reduce((sum, i) => sum + i.qty, 0)}</Text>
          </View>
        </BlurView>

        {/* Order items */}
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
          {items.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyText}>No items yet</Text>
            </View>
          ) : (
            items.map(item => {
              const selected = item.id === selectedId;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={s.item}
                  onPress={() => !isVoided && !isReturned && onSelectItem(item.id)}
                  activeOpacity={isVoided || isReturned ? 1 : 0.8}
                >
                  {selected && !isVoided && !isReturned && <View style={s.selectedBar} />}
                  <View style={[s.itemContent, selected && !isVoided && !isReturned && s.itemContentSelected, isVoided && s.itemContentVoided, isReturned && s.itemContentReturned]}>
                    <View style={s.itemLeft}>
                      <Text style={s.itemQty}>{item.qty}</Text>
                      <View>
                        <Image source={ICONS.xClose} style={s.itemX} />
                      </View>
                      <View style={s.itemNameCol}>
                        <Text style={s.itemName} numberOfLines={2}>{item.name}</Text>
                        {(tableNumber || orderType?.toLowerCase().includes('dine')) && (
                          <View style={s.tableBadge}>
                            <Text style={s.tableBadgeText}>{tableNumber ?? 'Table'}</Text>
                          </View>
                        )}
                        {item.discount && (
                          <Text style={s.itemDiscountBadge}>{item.discount.label}</Text>
                        )}
                      </View>
                    </View>
                    <View style={s.itemPriceCol}>
                      {item.discount && (
                        <Text style={s.itemOrigPrice}>{(item.price * item.qty).toFixed(2)}</Text>
                      )}
                      <View style={s.itemPriceRow}>
                        <Image source={ICONS.sarDark} style={s.sarDark} />
                        <Text style={[s.itemPriceText, !!item.discount && s.itemPriceDiscounted]}>
                          {itemEffectiveTotal(item).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* Add Course */}
        <TouchableOpacity style={s.addCourse} activeOpacity={0.7}>
          <Text style={s.addCourseText}>Add Course</Text>
        </TouchableOpacity>

        {/* Sub Total row — only visible when an order-level discount is applied */}
        {discount ? (
          <View style={s.subTotalRow}>
            <Text style={s.subTotalLabel}>Sub Total</Text>
            <View style={s.taxesVal}>
              <Image source={ICONS.sarGray} style={s.sarGray} />
              <Text style={s.subTotalValText}>{subtotal.toFixed(2)}</Text>
            </View>
          </View>
        ) : null}

        {/* Discount row */}
        {discount ? (
          <TouchableOpacity style={s.discountRow} onPress={onDiscountPress} activeOpacity={0.75}>
            <View style={s.discountLeft}>
              <View style={s.discountDot} />
              <Text style={s.discountLabel}>{discount.label}</Text>
            </View>
            <View style={s.discountVal}>
              <Text style={s.discountValText}>− </Text>
              <Image source={ICONS.sarGray} style={s.sarGray} />
              <Text style={s.discountValText}>{discountAmount.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Taxes */}
        <View style={s.taxesRow}>
          <Text style={s.taxesLabel}>Tax (incl.)</Text>
          <View style={s.taxesVal}>
            <Image source={ICONS.sarGray} style={s.sarGray} />
            <Text style={s.taxesValText}>{taxes.toFixed(2)}</Text>
          </View>
        </View>

        {/* TOTAL button */}
        {(() => {
          const inactive = isPaymentOpen || (!!status && status.toUpperCase() !== 'ACTIVE');
          return (
            <TouchableOpacity style={[s.totalBtn, inactive && s.totalBtnPayment]} onPress={inactive ? undefined : onTotalPress} activeOpacity={0.85}>
              <View style={s.totalLeft}>
                <Text style={[s.totalLabel, inactive && s.totalLabelInactive]}>TOTAL</Text>
                <Image source={ICONS.chevronRight} style={[s.totalChevron, inactive && s.totalChevronInactive]} />
              </View>
              <View style={s.totalRight}>
                <Image source={inactive ? ICONS.sarDark : ICONS.sarWhite} style={s.sarWhite} />
                <Text style={[s.totalAmount, inactive && s.totalLabelInactive]}>{total.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          );
        })()}

      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    width: 350,
    backgroundColor: Colors.backgroundAlt,
    padding: 20,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'column',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickup: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  addCustomer: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.yellowGold,
    letterSpacing: -0.1,
    textDecorationLine: 'underline',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.1,
    maxWidth: 160,
  },
  customerAddress: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.05,
    marginTop: -6,
  },
  countNum: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.1,
  },
  countNumLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.1,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.grayBorder,
  },

  itemsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  itemsTitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.1,
  },
  itemsCount: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.grayText,
  },

  scroll: { flex: 1 },

  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.placeholder,
    fontWeight: '400',
  },

  item: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
    position: 'relative',
  },
  selectedBar: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 5,
    backgroundColor: Colors.primary,
    zIndex: 1,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 18,
    paddingRight: 14,
    paddingVertical: 14,
    gap: 8,
  },
  itemContentSelected: {
    backgroundColor: Colors.primaryLight,
  },
  itemContentReturned: {
    backgroundColor: 'rgba(160, 129, 75, 0.10)',  // Colors.yellowGold tint
    borderLeftWidth: 3,
    borderLeftColor: Colors.yellowGold,
  },
  itemContentVoided: {
    backgroundColor: Colors.liteColor2,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  itemQty: {
    fontSize: 19,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.095,
  },
  itemX: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    opacity: 0.4,
  },
  itemNameCol: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.black,
    lineHeight: 18,
    letterSpacing: -0.07,
  },
  tableBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tableBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: 0.1,
  },
  itemDiscountBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.05,
  },
  itemPriceCol: {
    alignItems: 'flex-end',
    gap: 1,
    flexShrink: 0,
  },
  itemOrigPrice: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.05,
    textDecorationLine: 'line-through',
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 0,
  },
  itemPriceText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.09,
  },
  itemPriceDiscounted: {
    color: Colors.primary,
  },
  sarDark:  { width: 13, height: 15, resizeMode: 'contain' },
  sarGray:  { width: 12, height: 14, resizeMode: 'contain' },
  sarWhite: { width: 16, height: 18, resizeMode: 'contain' },

  addCourse: {
    backgroundColor: Colors.grayLight,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCourseText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.grayText,
    letterSpacing: -0.07,
  },

  subTotalRow: {
    backgroundColor: Colors.grayLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.grayBorder,
  },
  subTotalLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.075,
  },
  subTotalValText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.075,
  },

  discountRow: {
    backgroundColor: Colors.primaryLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.grayBorder,
  },
  discountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  discountDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  discountLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    letterSpacing: -0.075,
    flex: 1,
  },
  discountVal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  discountValText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.07,
  },

  taxesRow: {
    backgroundColor: Colors.grayLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.grayBorder,
  },
  taxesLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.075,
  },
  taxesVal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  taxesValText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.075,
  },

  totalBtnPayment: {
    backgroundColor: Colors.grayLight,
  },
  totalLabelInactive: {
    color: Colors.grayText,
  },
  totalChevronInactive: {
    tintColor: Colors.grayText,
  },
  totalBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  totalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalLabel: {
    fontSize: 23,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: -0.115,
  },
  totalChevron: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    tintColor: Colors.white,
  },
  totalRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  totalAmount: {
    fontSize: 23,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: -0.115,
  },
});
