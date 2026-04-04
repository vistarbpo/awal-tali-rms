import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  PanResponder,
  Animated,
} from 'react-native';
import { Colors } from '../constants/colors';
import { CartItem } from './OrderPanel';
import { useI18n } from '../i18n';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SplitData {
  id:      string;
  label:   string;
  itemIds: string[];
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  items:          CartItem[];
  orderType?:     string | null;
  tableNumber?:   string;
  onDone:         (splits: SplitData[]) => void;
  onCancel:       () => void;
  initialSplits?: SplitData[];
}

function baseLabel(
  orderType: string | null | undefined,
  tableNumber: string | undefined,
  index: number,
): string {
  const base = tableNumber ? `Table ${tableNumber}` : (orderType ?? 'Order');
  return `${base}/${index + 1}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SplitOrderView({ items, orderType, tableNumber, onDone, onCancel, initialSplits }: Props) {
  const { t, af, isRTL } = useI18n();
  const [splits, setSplits] = useState<SplitData[]>(() => initialSplits ?? [
    { id: 's0', label: baseLabel(orderType, tableNumber, 0), itemIds: items.map(i => i.id) },
    { id: 's1', label: baseLabel(orderType, tableNumber, 1), itemIds: [] },
  ]);

  // ─── Drag state ───────────────────────────────────────────────────────────
  const dragPos   = useRef(new Animated.ValueXY()).current;
  const [draggingItemId,   setDraggingItemId]   = useState<string | null>(null);
  const [draggingItemName, setDraggingItemName] = useState('');

  // Absolute layout of each panel (indexed by split position in the panels row)
  const panelLayouts = useRef<{ x: number; width: number }[]>([]);
  const panelRefs    = useRef<(View | null)[]>([]);

  // PanResponder cache: key = `${itemId}-${fromSplitIdx}`
  const prCache = useRef<Map<string, ReturnType<typeof PanResponder.create>>>(new Map());

  function getItemPanResponder(itemId: string, fromSplitIdx: number) {
    const key = `${itemId}-${fromSplitIdx}`;
    if (!prCache.current.has(key)) {
      prCache.current.set(key, PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder:  () => true,

        onPanResponderGrant: e => {
          const { pageX, pageY } = e.nativeEvent;
          dragPos.setValue({ x: pageX - 80, y: pageY - 22 });
          const item = items.find(i => i.id === itemId);
          setDraggingItemId(itemId);
          setDraggingItemName(item?.name ?? '');
        },

        onPanResponderMove: (_, gs) => {
          dragPos.x.setValue(gs.moveX - 80);
          dragPos.y.setValue(gs.moveY - 22);
        },

        onPanResponderRelease: (_, gs) => {
          const dropX = gs.moveX;
          let targetIdx = fromSplitIdx;
          panelLayouts.current.forEach((layout, i) => {
            if (dropX >= layout.x && dropX <= layout.x + layout.width) {
              targetIdx = i;
            }
          });
          if (targetIdx !== fromSplitIdx) {
            setSplits(prev => prev.map((s, i) => {
              if (i === fromSplitIdx) return { ...s, itemIds: s.itemIds.filter(id => id !== itemId) };
              if (i === targetIdx)    return { ...s, itemIds: [...s.itemIds, itemId] };
              return s;
            }));
            // Invalidate cache entries for this item (position changed)
            prCache.current.forEach((_, k) => {
              if (k.startsWith(itemId + '-')) prCache.current.delete(k);
            });
          }
          setDraggingItemId(null);
        },

        onPanResponderTerminate: () => setDraggingItemId(null),
      }));
    }
    return prCache.current.get(key)!;
  }

  function measurePanel(idx: number, ref: View | null) {
    panelRefs.current[idx] = ref;
    if (ref) {
      ref.measure((_x, _y, width, _h, pageX) => {
        panelLayouts.current[idx] = { x: pageX, width };
      });
    }
  }

  // ─── Actions ──────────────────────────────────────────────────────────────
  function addSplit() {
    setSplits(prev => {
      const idx = prev.length;
      return [...prev, { id: `s${idx}`, label: baseLabel(orderType, tableNumber, idx), itemIds: [] }];
    });
  }

  function handleDone() {
    const nonEmpty = splits.filter(s => s.itemIds.length > 0);
    onDone(nonEmpty.length > 1 ? nonEmpty : splits);
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>

      {/* ── Panels ── */}
      <View style={s.panels}>
        {splits.map((split, si) => {
          const splitItems = items.filter(i => split.itemIds.includes(i.id));
          const isLast     = si === splits.length - 1;
          const isActive   = isLast && split.itemIds.length > 0;

          return (
            <View
              key={split.id}
              style={s.panel}
              ref={ref => measurePanel(si, ref as any)}
              onLayout={() => {
                const ref = panelRefs.current[si];
                if (ref) ref.measure((_x, _y, w, _h, px) => {
                  panelLayouts.current[si] = { x: px, width: w };
                });
              }}
            >
              {/* Panel header */}
              <View style={s.panelHeader}>
                <Text style={[s.panelTitle, isActive && s.panelTitleActive]}>{split.label}</Text>
              </View>
              <View style={s.panelDivider} />

              {/* Items */}
              <ScrollView style={s.panelScroll} showsVerticalScrollIndicator={false}>
                {splitItems.map((item, ii) => {
                  const pr     = getItemPanResponder(item.id, si);
                  const isGhost = item.id === draggingItemId;
                  return (
                    <View key={item.id} style={{ opacity: isGhost ? 0.35 : 1 }}>
                      <View style={s.itemRow}>
                        <Text style={s.itemQty}>{item.qty} x</Text>
                        <View style={s.itemInfo}>
                          <Text style={s.itemName}>{item.name}</Text>
                          {item.comboSelectionLabels?.map((label, li) => (
                            <Text key={li} style={s.itemSub}>+ {label}</Text>
                          ))}
                          {!!item.kitchenNote && (
                            <Text style={s.itemSub}>{item.kitchenNote}</Text>
                          )}
                        </View>

                        {/* Drag handle */}
                        <View style={s.dragHandle} {...pr.panHandlers}>
                          <View style={s.handleLine} />
                          <View style={s.handleLine} />
                          <View style={s.handleLine} />
                        </View>
                      </View>
                      {ii < splitItems.length - 1 && <View style={s.rowDivider} />}
                    </View>
                  );
                })}
              </ScrollView>

              {/* Panel footer nav */}
              {split.itemIds.length > 0 && (
                <View style={[s.panelNav, isActive && s.panelNavActive]}>
                  <View style={s.navArrow} />
                  <Text style={s.navLabel}>{split.label}</Text>
                  <View style={s.navArrow} />
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* ── Bottom bar ── */}
      <View style={[s.footer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity style={s.addOrderBtn} onPress={addSplit} activeOpacity={0.75}>
          <Text style={[s.addOrderText, { fontFamily: af('semibold') }]}>{t('addOrderBtn')}</Text>
        </TouchableOpacity>
        <View style={s.footerRight}>
          <TouchableOpacity style={s.cancelBtn} onPress={onCancel} activeOpacity={0.75}>
            <Text style={[s.cancelText, { fontFamily: af('semibold') }]}>{t('cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.doneBtn} onPress={handleDone} activeOpacity={0.85}>
            <Text style={[s.doneText, { fontFamily: af('semibold') }]}>{t('done')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Drag ghost ── */}
      {draggingItemId && (
        <Animated.View
          pointerEvents="none"
          style={[s.ghost, { transform: dragPos.getTranslateTransform() }]}
        >
          <View style={s.handleLine} />
          <View style={s.handleLine} />
          <View style={s.handleLine} />
          <Text style={s.ghostText} numberOfLines={1}>{draggingItemName}</Text>
        </Animated.View>
      )}

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
    flexDirection: 'column',
  },

  // ── Panels row ──
  panels: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    paddingBottom: 0,
  },
  panel: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'column',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  panelHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  panelTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  panelTitleActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  panelDivider: {
    height: 1,
    backgroundColor: Colors.grayBorder,
  },
  panelScroll: {
    flex: 1,
    paddingTop: 4,
  },

  // ── Item rows ──
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
  },
  itemQty: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.grayText,
    width: 28,
    marginTop: 1,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.2,
  },
  itemSub: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.1,
  },
  dragHandle: {
    gap: 3,
    paddingTop: 3,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    alignSelf: 'stretch',
    cursor: 'grab' as any,
  },
  handleLine: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.grayMid,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.grayBorder,
    marginHorizontal: 20,
  },

  // ── Panel nav footer ──
  panelNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  panelNavActive: {
    backgroundColor: Colors.primary,
  },
  navArrow: {
    width: 24,
  },
  navLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: -0.2,
  },

  // ── Footer bar ──
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  addOrderBtn: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  addOrderText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  footerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.red,
    letterSpacing: -0.2,
  },
  doneBtn: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
  },
  doneText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.2,
  },

  // ── Drag ghost ──
  ghost: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 999,
  },
  ghostText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: -0.2,
    maxWidth: 160,
  },
});
