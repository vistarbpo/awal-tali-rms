import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Colors } from '../constants/colors';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ProductAvailabilityItem {
  available: boolean;
  quantity: number | null;
}
export type ProductAvailabilityMap = Record<string, ProductAvailabilityItem>;

import { iconSearch } from '../assets/icons';

const ICONS = {
  search: iconSearch,
};

// ─── Mock product data per category ──────────────────────────────────────────
interface AvailProduct { id: string; name: string; }

const CATEGORY_PRODUCTS: Record<string, AvailProduct[]> = {
  c1: [{ id: 'p1', name: 'FRIED RICE' }, { id: 'p2', name: 'PASTA PRIMAVERA' }],
  c2: [{ id: 'p3', name: 'GARDEN SALAD' }, { id: 'p4', name: 'GRILLED CHICKEN' }],
  c3: [{ id: 'p3', name: 'GARDEN SALAD' }, { id: 'p9', name: 'CAESAR SALAD' }],
  c4: [{ id: 'p8', name: 'VEGGIE WRAP' }, { id: 'p1', name: 'FRIED RICE' }, { id: 'p2', name: 'PASTA PRIMAVERA' }],
  c5: [{ id: 'p10', name: 'CHICKEN TIKKA' }, { id: 'p12', name: 'FISH & CHIPS' }],
  c6: [
    { id: 'p4', name: 'HASHI BALADI' },
    { id: 'p5', name: 'HASHI AHMAR' },
    { id: 'p6', name: 'ASEEDA' },
    { id: 'p7', name: 'HASHI ABYAD' },
    { id: 'p11', name: 'ARESH' },
    { id: 'p9', name: 'VITAMIN' },
  ],
  c7: [{ id: 'p3', name: 'GARDEN SALAD' }, { id: 'p8', name: 'VEGGIE WRAP' }, { id: 'p12', name: 'FISH & CHIPS' }],
  c8: [{ id: 'p2', name: 'PASTA PRIMAVERA' }, { id: 'p10', name: 'CHICKEN TIKKA' }],
  c9: [{ id: 'p10', name: 'CHICKEN TIKKA' }, { id: 'p11', name: 'MIXED GRILL' }],
};

// ─── Toggle component ─────────────────────────────────────────────────────────
function ToggleSwitch({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  return (
    <TouchableOpacity
      style={[ts.track, value && ts.trackOn]}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.8}
    >
      <View style={[ts.thumb, value && ts.thumbOn]} />
    </TouchableOpacity>
  );
}
const ts = StyleSheet.create({
  track:   { width: 50, height: 28, borderRadius: 14, backgroundColor: '#E4E4E7', padding: 2, justifyContent: 'center' },
  trackOn: { backgroundColor: Colors.primary },
  thumb:   { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.white, alignSelf: 'flex-start', shadowColor: Colors.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 2 },
  thumbOn: { alignSelf: 'flex-end' },
});

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  categoryId:          string;
  categoryName:        string;
  productAvailability: ProductAvailabilityMap;
  onBack:              () => void;
  onDone:              (updated: ProductAvailabilityMap) => void;
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ProductAvailabilityProductsScreen({
  categoryId,
  categoryName,
  productAvailability,
  onBack,
  onDone,
}: Props) {
  const searchRef                       = useRef<TextInput>(null);
  const qtyRef                          = useRef<TextInput>(null);
  const [search, setSearch]             = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [qtyFocused, setQtyFocused]     = useState(false);
  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [localAvail, setLocalAvail]     = useState<ProductAvailabilityMap>({ ...productAvailability });

  const allProducts = CATEGORY_PRODUCTS[categoryId] ?? [];
  const products    = allProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const setCount    = allProducts.filter(p => localAvail[p.id] !== undefined).length;

  const selectedProduct = products.find(p => p.id === selectedId);
  const selectedAvail   = selectedId ? localAvail[selectedId] : null;

  function toggleAvailable(val: boolean) {
    if (!selectedId) return;
    setLocalAvail(prev => ({
      ...prev,
      [selectedId]: { available: val, quantity: val ? (prev[selectedId]?.quantity ?? null) : null },
    }));
  }

  function handleQuantity(text: string) {
    if (!selectedId) return;
    const num = parseInt(text, 10);
    setLocalAvail(prev => ({
      ...prev,
      [selectedId]: { available: prev[selectedId]?.available ?? true, quantity: isNaN(num) ? null : num },
    }));
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundAlt} />

      <View style={s.row}>

        {/* ── LEFT PANEL: product list ── */}
        <View style={s.leftPanel}>
          {/* Header */}
          <View style={s.listHeader}>
            <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.8}>
              <Text style={s.backText}>BACK</Text>
            </TouchableOpacity>
            <Text style={s.catName} numberOfLines={2}>{categoryName}</Text>
            {setCount > 0 && (
              <View style={s.countBadge}>
                <Text style={s.countText}>{setCount}</Text>
              </View>
            )}
          </View>

          {/* Search */}
          <Pressable
            style={[s.searchWrap, searchFocused && s.fieldFocused]}
            onPress={() => searchRef.current?.focus()}
          >
            <View style={s.searchIconWrap}>
              <Image source={ICONS.search} style={s.searchIcon} />
            </View>
            <TextInput
              ref={searchRef}
              style={s.searchInput}
              placeholder="Search Products"
              placeholderTextColor={Colors.placeholder}
              value={search}
              onChangeText={setSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </Pressable>

          {/* Products */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {products.map(product => {
              const avail    = localAvail[product.id];
              const selected = product.id === selectedId;
              return (
                <TouchableOpacity
                  key={product.id}
                  style={[s.productRow, selected && s.productRowSelected]}
                  onPress={() => setSelectedId(product.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.productRowName, selected && s.productRowNameSelected]} numberOfLines={1}>
                    {product.name}
                  </Text>
                  {avail !== undefined && (
                    <View style={[s.rowBadge, !avail.available && s.rowBadgeDanger]}>
                      <Text style={s.rowBadgeText}>
                        {avail.available ? String(avail.quantity ?? '∞') : '0'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── RIGHT PANEL: product detail + DONE ── */}
        <View style={s.detailArea}>
          {selectedProduct ? (
            <ScrollView style={s.detailScroll} contentContainerStyle={s.detailContent} showsVerticalScrollIndicator={false}>
              {/* Product title + availability badge */}
              <View style={s.detailHeader}>
                <Text style={s.detailName}>{selectedProduct.name}</Text>
                <View style={s.detailBadgeWrap}>
                  <Text style={s.detailBadgeLabel}>Quantity on hand</Text>
                  {selectedAvail !== undefined && selectedAvail !== null ? (
                    <View style={[s.detailBadge, selectedAvail.available ? s.detailBadgeAvail : s.detailBadgeUnavail]}>
                      <Text style={s.detailBadgeText}>
                        {selectedAvail.available ? 'Available' : 'Unavailable'}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>

              <View style={s.divider} />
              <Text style={s.sectionLabel}>Set product availability</Text>
              <View style={s.divider} />

              {/* Available toggle */}
              <View style={s.settingRow}>
                <Text style={s.settingLabel}>Available</Text>
                <ToggleSwitch
                  value={selectedAvail?.available ?? false}
                  onValueChange={toggleAvailable}
                />
              </View>
              <View style={s.divider} />

              {/* Quantity input */}
              <View style={s.settingRow}>
                <Text style={s.settingLabel}>Available Quantity</Text>
                <View style={[s.qtyInputWrap, qtyFocused && s.fieldFocused]}>
                  <TextInput
                    ref={qtyRef}
                    style={s.qtyInput}
                    keyboardType="number-pad"
                    value={selectedAvail?.available && selectedAvail.quantity !== null
                      ? String(selectedAvail.quantity)
                      : ''}
                    onChangeText={handleQuantity}
                    placeholder="0"
                    placeholderTextColor={Colors.placeholder}
                    editable={selectedAvail?.available ?? false}
                    onFocus={() => setQtyFocused(true)}
                    onBlur={() => setQtyFocused(false)}
                  />
                </View>
              </View>
              <View style={s.divider} />
            </ScrollView>
          ) : (
            <View style={s.emptyState}>
              <Text style={s.emptyText}>Select a product to set its availability</Text>
            </View>
          )}

          {/* ── DONE button — bottom of right panel ── */}
          <View style={s.doneBtnWrap}>
            <TouchableOpacity style={s.doneBtn} onPress={() => onDone(localAvail)} activeOpacity={0.8}>
              <Text style={s.doneText}>DONE</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const LEFT_W = 320;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.backgroundAlt },
  row:  { flex: 1, flexDirection: 'row' },

  // Left panel
  leftPanel: {
    width: LEFT_W,
    backgroundColor: Colors.white,
    borderRightWidth: 1,
    borderRightColor: Colors.grayBorder,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.grayBorder,
  },
  backBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  backText: { fontSize: 14, fontWeight: '500', color: Colors.white, letterSpacing: -0.07 },
  catName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.4,
  },
  countBadge: {
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { fontSize: 14, fontWeight: '600', color: Colors.white },

  searchWrap: {
    margin: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    height: 56,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  fieldFocused: {
    borderColor: Colors.primary,
    shadowOpacity: 0.10,
  },
  searchIconWrap: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    opacity: 0.35,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    color: Colors.black,
    padding: 0,
    paddingRight: 12,
    height: 40,
    outlineWidth: 0,
    outlineStyle: 'none',
  } as any,

  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.grayBorder,
  },
  productRowSelected: { backgroundColor: Colors.liteColor },
  productRowName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.4,
  },
  productRowNameSelected: { color: Colors.primary },
  rowBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBadgeDanger: { backgroundColor: Colors.red },
  rowBadgeText:   { fontSize: 13, fontWeight: '600', color: Colors.white },

  // Detail area
  detailArea:    { flex: 1, backgroundColor: Colors.backgroundAlt, flexDirection: 'column' },
  detailScroll:  { flex: 1 },
  detailContent: { padding: 28 },
  detailHeader:  { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 },
  detailName: {
    flex: 1,
    fontSize: 30,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.4,
    marginRight: 16,
  },
  detailBadgeWrap: { alignItems: 'center', gap: 6 },
  detailBadgeLabel: { fontSize: 13, fontWeight: '400', color: Colors.black, letterSpacing: -0.4 },
  detailBadge: { borderRadius: 7, paddingHorizontal: 16, paddingVertical: 7 },
  detailBadgeAvail:   { backgroundColor: Colors.availGreen },
  detailBadgeUnavail: { backgroundColor: Colors.red },
  detailBadgeText: { fontSize: 16, fontWeight: '400', color: Colors.white, letterSpacing: -0.4 },

  sectionLabel: {
    fontSize: 18,
    fontWeight: '400',
    color: '#404040',
    letterSpacing: -0.4,
    paddingVertical: 18,
  },
  divider: { height: 1, backgroundColor: Colors.grayBorder },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '400',
    color: '#404040',
    letterSpacing: -0.4,
  },
  qtyInputWrap: {
    width: 140,
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: Colors.white,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  qtyInput: {
    flex: 1,
    alignSelf: 'stretch',
    fontSize: 20,
    fontWeight: '400',
    color: Colors.black,
    padding: 0,
    paddingHorizontal: 14,
    textAlign: 'center',
    outlineWidth: 0,
    outlineStyle: 'none',
  } as any,

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText:  { fontSize: 16, color: Colors.grayText, letterSpacing: -0.3 },

  // DONE button
  doneBtnWrap: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.grayBorder,
  },
  doneBtn: {
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 8,
    elevation: 4,
  },
  doneText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
});
