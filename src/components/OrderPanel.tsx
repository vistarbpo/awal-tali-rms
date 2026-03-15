import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/colors';
import { OrderDiscount } from './DiscountDialog';

// ─── Shared types ─────────────────────────────────────────────────────────────
export interface Course {
  id: string;
  name: string;
  isHeld?: boolean;
  holdUntil?: number;  // epoch ms — when the hold expires (auto-send to kitchen)
}

export interface CartItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  discount?: OrderDiscount | null;
  isHeld?: boolean;
  holdTime?: number;   // epoch ms when to auto-fire (Dine-In only)
  courseId?: string;   // which course this item belongs to
}

export function formatHoldCountdown(holdTime: number, now: number): string {
  const remaining = Math.max(0, holdTime - now);
  const totalSec  = Math.ceil(remaining / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
import { iconSarDark, iconSarGray, iconSarWhite, iconXClose, iconChevronRight } from '../assets/icons';
import HoldTimeDialog from './HoldTimeDialog';

const ICONS = {
  sarDark:      iconSarDark,
  sarGray:      iconSarGray,
  sarWhite:     iconSarWhite,
  xClose:       iconXClose,
  chevronRight: iconChevronRight,
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
  priceTagMultiplier?: number;
  currentTime?: number;
  courses?: Course[];
  onAddCourse?: () => void;
  onMoveItemToCourse?: (itemId: string, courseId: string) => void;
  onHoldCourse?: (courseId: string, holdUntil?: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
function itemEffectiveTotal(item: CartItem, multiplier = 1): number {
  const base = item.price * item.qty * multiplier;
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

export default function OrderPanel({ items, selectedId, onSelectItem, onRemoveItem, orderType, onOrderTypePress, customer, onAddCustomerPress, onTotalPress, onCountPress, orderSeq, isPaymentOpen, isVoided, isReturned, tableNumber, status, discount, onDiscountPress, priceTagMultiplier = 1, currentTime, courses, onAddCourse, onMoveItemToCourse, onHoldCourse }: Props) {
  const subtotal       = items.reduce((sum, i) => sum + itemEffectiveTotal(i, priceTagMultiplier), 0);
  const discountAmount = discount
    ? discount.kind === 'percentage'
      ? (subtotal * discount.value) / 100
      : Math.min(discount.value, subtotal)
    : 0;
  const discountedSub  = subtotal - discountAmount;
  const taxes          = discountedSub * TAX_RATE / (1 + TAX_RATE);
  const total          = discountedSub;

  const hasCourses = !!courses && courses.length > 0;

  // ─── Hold course dialog ───────────────────────────────────────────────────
  const [holdDialogCourse, setHoldDialogCourse] = useState<Course | null>(null);

  // ─── Drag state ───────────────────────────────────────────────────────────
  // All gesture data lives in refs so callbacks never go stale
  const panelRef          = useRef<View>(null);
  const panelPageYRef     = useRef(0);
  const scrollViewRef     = useRef<ScrollView>(null);
  // Absolute screen Y of the ScrollView's top edge — set on its onLayout
  const scrollViewPageYRef = useRef(0);
  const scrollOffsetRef   = useRef(0);
  // courseId → { y, height } in scroll-content coordinates (from onLayout)
  const courseRectsRef    = useRef<Map<string, { y: number; height: number }>>(new Map());
  // Stable refs for drag session
  const draggingItemRef   = useRef<CartItem | null>(null);
  const hoverCourseIdRef  = useRef<string | null>(null);
  const onMoveRef         = useRef(onMoveItemToCourse);
  onMoveRef.current       = onMoveItemToCourse;

  // Animated ghost Y relative to panel root
  const ghostAnimY = useRef(new Animated.Value(-300)).current;

  // State only for re-renders
  const [draggingId,    setDraggingId]    = useState<string | null>(null);
  const [hoverCourseId, setHoverCourseId] = useState<string | null>(null);

  function startDrag(item: CartItem, pageY: number) {
    draggingItemRef.current  = item;
    hoverCourseIdRef.current = null;
    // Re-measure panel for ghost positioning
    panelRef.current?.measureInWindow((_x, py) => { panelPageYRef.current = py; });
    ghostAnimY.setValue(pageY - panelPageYRef.current - 24);
    setDraggingId(item.id);
    setHoverCourseId(null);
  }

  function moveDrag(pageY: number) {
    // Ghost tracks finger relative to panel root
    ghostAnimY.setValue(pageY - panelPageYRef.current - 24);

    // Convert absolute pageY → scroll-content Y
    const contentY = pageY - scrollViewPageYRef.current + scrollOffsetRef.current;

    // Pick nearest course by center distance — makes the whole panel height
    // a valid drop zone so the user doesn't have to be precise
    let hovered: string | null = null;
    let minDist = Infinity;
    courseRectsRef.current.forEach((rect, id) => {
      const center = rect.y + rect.height / 2;
      const dist   = Math.abs(contentY - center);
      if (dist < minDist) { minDist = dist; hovered = id; }
    });

    if (hovered !== hoverCourseIdRef.current) {
      hoverCourseIdRef.current = hovered;
      setHoverCourseId(hovered);
    }
  }

  function endDrag() {
    const item   = draggingItemRef.current;
    const target = hoverCourseIdRef.current;
    if (item && target && target !== item.courseId) {
      onMoveRef.current?.(item.id, target);
    }
    draggingItemRef.current  = null;
    hoverCourseIdRef.current = null;
    ghostAnimY.setValue(-300);
    setDraggingId(null);
    setHoverCourseId(null);
  }

  function dragHandleProps(item: CartItem) {
    return {
      onStartShouldSetResponder: () => hasCourses && !isVoided && !isReturned,
      onResponderGrant: (e: any) => startDrag(item, e.nativeEvent.pageY),
      onResponderMove:  (e: any) => moveDrag(e.nativeEvent.pageY),
      onResponderRelease:    () => endDrag(),
      onResponderTerminate:  () => endDrag(),
    };
  }

  function renderItem(item: CartItem) {
    const selected  = item.id === selectedId;
    const isDragging = item.id === draggingId;
    return (
      <TouchableOpacity
        key={item.id}
        style={[s.item, isDragging && s.itemDragging]}
        onPress={() => !isDragging && !isVoided && !isReturned && onSelectItem(item.id)}
        activeOpacity={isVoided || isReturned ? 1 : 0.8}
      >
        {selected && !isVoided && !isReturned && !isDragging && <View style={s.selectedBar} />}
        {item.isHeld && !isVoided && !isReturned && <View style={s.holdBar} />}
        <View style={[
          s.itemContent,
          selected && !isVoided && !isReturned && !isDragging && s.itemContentSelected,
          isVoided    && s.itemContentVoided,
          isReturned  && s.itemContentReturned,
          item.isHeld && !isVoided && !isReturned && s.itemContentHeld,
        ]}>
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
              {item.isHeld && !isVoided && !isReturned && (
                <View style={s.holdBadge}>
                  <Text style={s.holdBadgeText}>
                    {item.holdTime && currentTime
                      ? formatHoldCountdown(item.holdTime, currentTime)
                      : 'HOLD'}
                  </Text>
                </View>
              )}
              {item.discount && (
                <Text style={s.itemDiscountBadge}>{item.discount.label}</Text>
              )}
            </View>
          </View>
          <View style={s.itemRight}>
            <View style={s.itemPriceCol}>
              {item.discount && (
                <Text style={s.itemOrigPrice}>{(item.price * item.qty * priceTagMultiplier).toFixed(2)}</Text>
              )}
              <View style={s.itemPriceRow}>
                <Image source={ICONS.sarDark} style={s.sarDark} />
                <Text style={[s.itemPriceText, !!item.discount && s.itemPriceDiscounted]}>
                  {itemEffectiveTotal(item, priceTagMultiplier).toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Drag handle — gesture responder applied directly so it intercepts the parent TouchableOpacity */}
            {hasCourses && !isVoided && !isReturned && (
              <View style={s.dragHandleBtn} {...dragHandleProps(item)}>
                <View style={s.dragLine} />
                <View style={s.dragLine} />
                <View style={s.dragLine} />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={s.root}
      ref={panelRef}
      onLayout={() => {
        panelRef.current?.measureInWindow((_x, py) => { panelPageYRef.current = py; });
      }}
    >
      <View style={s.card}>

        {/* Header */}
        <View style={s.header}>
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

        {/* Items title — glass effect */}
        <BlurView intensity={60} tint="light">
          <View style={s.itemsTitle}>
            <Text style={s.itemsTitleText}>Items</Text>
            <Text style={s.itemsCount}>{items.reduce((sum, i) => sum + i.qty, 0)}</Text>
          </View>
        </BlurView>

        {/* Order items */}
        <ScrollView
          ref={scrollViewRef}
          style={s.scroll}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!draggingId}
          onLayout={() => {
            // Capture the ScrollView's absolute screen Y so we can convert
            // gesture pageY → scroll-content Y during drag
            (scrollViewRef.current as any)?.measureInWindow(
              (_x: number, py: number) => { scrollViewPageYRef.current = py; },
            );
          }}
          onScroll={e => { scrollOffsetRef.current = e.nativeEvent.contentOffset.y; }}
          scrollEventThrottle={16}
        >
          {items.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyText}>No items yet</Text>
            </View>
          ) : courses && courses.length > 0 ? (
            courses.map(course => {
              const courseItems  = items.filter(i => i.courseId === course.id);
              const isDropTarget = !!draggingId
                && draggingItemRef.current?.courseId !== course.id
                && hoverCourseId === course.id;
              const isHovered    = !!draggingId && draggingItemRef.current?.courseId !== course.id;
              return (
                <View
                  key={course.id}
                  onLayout={e => {
                    courseRectsRef.current.set(course.id, {
                      y:      e.nativeEvent.layout.y,
                      height: e.nativeEvent.layout.height,
                    });
                  }}
                >
                  <View style={[
                    s.courseHeader,
                    course.isHeld && s.courseHeaderHeld,
                    isDropTarget && s.courseHeaderDrop,
                    isHovered && !isDropTarget && s.courseHeaderHoverable,
                  ]}>
                    <View style={s.courseHeaderLeft}>
                      {course.isHeld && <View style={s.courseHoldDot} />}
                      <Text style={[s.courseHeaderText, course.isHeld && s.courseHeaderTextHeld]}>
                        {course.name}
                      </Text>
                      {course.isHeld && course.holdUntil && currentTime ? (
                        <View style={s.courseTimerBadge}>
                          <Text style={s.courseTimerText}>
                            {formatHoldCountdown(course.holdUntil, currentTime)}
                          </Text>
                        </View>
                      ) : course.isHeld ? (
                        <View style={s.courseHeldBadge}>
                          <Text style={s.courseHeldBadgeText}>ON HOLD</Text>
                        </View>
                      ) : null}
                    </View>
                    {isDropTarget ? (
                      <View style={s.dropBadge}>
                        <Text style={s.dropBadgeText}>Drop here</Text>
                      </View>
                    ) : !draggingId && onHoldCourse && !isVoided && !isReturned ? (
                      <TouchableOpacity
                        style={[s.holdCourseBtn, course.isHeld && s.holdCourseBtnActive]}
                        onPress={() => {
                          if (course.isHeld) {
                            // Unhold immediately
                            onHoldCourse(course.id, undefined);
                          } else {
                            // Open time picker dialog
                            setHoldDialogCourse(course);
                          }
                        }}
                        activeOpacity={0.75}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={[s.holdCourseBtnText, course.isHeld && s.holdCourseBtnTextActive]}>
                          {course.isHeld ? 'Unhold' : 'Hold'}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  {courseItems.map(item => renderItem(item))}
                </View>
              );
            })
          ) : (
            items.map(item => renderItem(item))
          )}
        </ScrollView>

        {/* Add Course */}
        <TouchableOpacity style={s.addCourse} activeOpacity={0.7} onPress={onAddCourse} disabled={!onAddCourse}>
          <Text style={s.addCourseText}>Add Course</Text>
        </TouchableOpacity>

        {/* Sub Total row — only when discount applied */}
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
                <Image source={ICONS.sarWhite} style={[s.sarWhite, inactive && s.sarWhiteInactive]} />
                <Text style={[s.totalAmount, inactive && s.totalLabelInactive]}>{total.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          );
        })()}

      </View>

      {/* ── Hold course time picker ── */}
      {onHoldCourse && (
        <HoldTimeDialog
          visible={!!holdDialogCourse}
          itemName={holdDialogCourse?.name ?? ''}
          onClose={() => setHoldDialogCourse(null)}
          onConfirm={minutes => {
            if (holdDialogCourse) {
              onHoldCourse(holdDialogCourse.id, Date.now() + minutes * 60 * 1000);
              setHoldDialogCourse(null);
            }
          }}
          onFireLater={() => {
            if (holdDialogCourse) {
              onHoldCourse(holdDialogCourse.id, undefined);
              setHoldDialogCourse(null);
            }
          }}
        />
      )}

      {/* ── Drag ghost — floats above the card during drag ── */}
      {draggingId && (
        <Animated.View
          style={[s.ghost, { transform: [{ translateY: ghostAnimY }] }]}
          pointerEvents="none"
        >
          <View style={s.ghostHandle}>
            <View style={s.ghostHandleLine} />
            <View style={s.ghostHandleLine} />
            <View style={s.ghostHandleLine} />
          </View>
          <Text style={s.ghostText} numberOfLines={1}>
            {items.find(i => i.id === draggingId)?.name ?? ''}
          </Text>
        </Animated.View>
      )}
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

  // ── Course headers ──────────────────────────────────────────────────────────
  courseHeader: {
    backgroundColor: Colors.grayLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  courseHeaderHeld: {
    backgroundColor: 'rgba(245,158,11,0.10)',
    borderBottomColor: '#F59E0B',
  },
  courseHeaderDrop: {
    backgroundColor: Colors.primaryLight,
    borderBottomColor: Colors.primary,
    borderBottomWidth: 2,
  },
  courseHeaderHoverable: {
    borderBottomColor: Colors.grayMid,
  },
  courseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  courseHoldDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  courseHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.07,
  },
  courseHeaderTextHeld: {
    color: '#B45309',
  },
  courseHeldBadge: {
    backgroundColor: 'rgba(245,158,11,0.18)',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  courseHeldBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
    letterSpacing: 0.3,
  },
  courseTimerBadge: {
    backgroundColor: Colors.black,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  courseTimerText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.white,
    letterSpacing: -0.05,
    fontVariant: ['tabular-nums'],
  },
  holdCourseBtn: {
    borderWidth: 1.5,
    borderColor: Colors.grayMid,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.white,
  },
  holdCourseBtnActive: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245,158,11,0.08)',
  },
  holdCourseBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.grayText,
    letterSpacing: -0.05,
  },
  holdCourseBtnTextActive: {
    color: '#B45309',
  },
  dropBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dropBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: -0.05,
  },

  // ── Items ───────────────────────────────────────────────────────────────────
  item: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
    position: 'relative',
  },
  itemDragging: {
    opacity: 0.35,
  },
  selectedBar: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 5,
    backgroundColor: Colors.primary,
    zIndex: 1,
  },
  holdBar: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 5,
    backgroundColor: '#F59E0B',
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
    backgroundColor: 'rgba(160, 129, 75, 0.10)',
    borderLeftWidth: 3,
    borderLeftColor: Colors.yellowGold,
  },
  itemContentVoided: {
    backgroundColor: Colors.liteColor2,
  },
  itemContentHeld: {
    backgroundColor: 'rgba(245,158,11,0.07)',
  },
  holdBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  holdBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
    letterSpacing: 0.3,
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
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
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
  sarDark:          { width: 14, height: 16, resizeMode: 'contain' as const },
  sarGray:          { width: 12, height: 14, resizeMode: 'contain' as const },
  sarWhite:         { width: 16, height: 18, resizeMode: 'contain' as const },
  sarWhiteInactive: { opacity: 0.5 },

  // ── Drag handle ─────────────────────────────────────────────────────────────
  dragHandleBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3.5,
  },
  dragLine: {
    height: 2,
    width: 14,
    borderRadius: 1,
    backgroundColor: Colors.grayMid,
  },

  // ── Drag ghost (floats above card) ──────────────────────────────────────────
  ghost: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 100,
  },
  ghostHandle: {
    gap: 3.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ghostHandleLine: {
    height: 2,
    width: 14,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  ghostText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: -0.07,
  },

  // ── Add Course ──────────────────────────────────────────────────────────────
  addCourse: {
    backgroundColor: Colors.grayLight,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.grayBorder,
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
