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
  FlatList,
  useWindowDimensions,
  ImageSourcePropType,
} from 'react-native';
import { Colors } from '../constants/colors';
import { CARD_GAP } from '../styles/screenLayout';

import { iconSearch, catImg0, catImg1, catImg2, catImg3, catImg4 } from '../assets/icons';

const ICONS = {
  search: iconSearch,
};

const CAT_IMG = {
  img0: catImg0,
  img1: catImg1,
  img2: catImg2,
  img3: catImg3,
  img4: catImg4,
};

export interface AvailCategory {
  id: string;
  name: string;
  image: ImageSourcePropType;
}

export const AVAIL_CATEGORIES: AvailCategory[] = [
  { id: 'c1', name: 'MAIN CATEGORY 1', image: CAT_IMG.img0 },
  { id: 'c2', name: 'MAIN CATEGORY 2', image: CAT_IMG.img1 },
  { id: 'c3', name: 'SALADS',          image: CAT_IMG.img2 },
  { id: 'c4', name: 'BREAKFAST',       image: CAT_IMG.img3 },
  { id: 'c5', name: 'BEVERAGES',       image: CAT_IMG.img4 },
  { id: 'c6', name: 'MAIN DISHES',     image: CAT_IMG.img0 },
  { id: 'c7', name: 'SIDE DISHES',     image: CAT_IMG.img1 },
  { id: 'c8', name: 'DESSERTS',        image: CAT_IMG.img2 },
  { id: 'c9', name: 'SPECIALS',        image: CAT_IMG.img3 },
];

const COLS   = 7;
const NAME_H = 46;
const PAD    = 24;

interface Props {
  onBack:             () => void;
  onCategorySelect:   (categoryId: string, categoryName: string) => void;
}

export default function ProductAvailabilityCategoriesScreen({ onBack, onCategorySelect }: Props) {
  const { width: screenW }                 = useWindowDimensions();
  const searchRef                          = useRef<TextInput>(null);
  const [search, setSearch]                = useState('');
  const [searchFocused, setSearchFocused]  = useState(false);

  const cardW = Math.floor((screenW - PAD * 2 - CARD_GAP * (COLS - 1)) / COLS);
  const cardH = cardW + NAME_H;

  const filtered = AVAIL_CATEGORIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundAlt} />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Text style={s.backText}>BACK</Text>
        </TouchableOpacity>
        <View style={s.titleWrap}>
          <Text style={s.title}>Product Availability</Text>
          <Text style={s.subtitle}>Category list</Text>
        </View>
        <View style={{ width: 80 }} />
      </View>

      {/* ── Body ── */}
      <View style={s.body}>
        <Pressable
          style={[s.searchBar, searchFocused && s.searchBarFocused]}
          onPress={() => searchRef.current?.focus()}
        >
          <View style={s.searchIconWrap}>
            <Image source={ICONS.search} style={s.searchIcon} />
          </View>
          <View style={s.searchInputWrap}>
            <TextInput
              ref={searchRef}
              style={s.searchInput}
              placeholder="Search Categories"
              placeholderTextColor={Colors.placeholder}
              value={search}
              onChangeText={setSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </View>
        </Pressable>

        <FlatList
          data={filtered}
          keyExtractor={c => c.id}
          numColumns={COLS}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 8 }}
          columnWrapperStyle={{ gap: CARD_GAP }}
          ItemSeparatorComponent={() => <View style={{ height: CARD_GAP }} />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[s.card, { width: cardW, height: cardH }]}
              onPress={() => onCategorySelect(item.id, item.name)}
              activeOpacity={0.85}
            >
              <View style={[s.cardImgWrap, { height: cardW }]}>
                <Image source={item.image} style={s.cardImg} />
              </View>
              <View style={[s.cardNameWrap, { height: NAME_H }]}>
                <Text style={s.cardName} numberOfLines={2}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PAD,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.grayBorder,
  },
  backBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  backText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.white,
    letterSpacing: -0.075,
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.4,
    marginTop: 2,
  },
  body: {
    flex: 1,
    padding: PAD,
  },
  searchBar: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  searchBarFocused: {
    borderColor: Colors.primary,
  },
  searchIconWrap: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    opacity: 0.35,
  },
  searchInputWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 14,
  },
  searchInput: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.black,
    padding: 0,
    height: 36,
    outlineWidth: 0,
    outlineStyle: 'none',
  } as any,
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImgWrap: {
    width: '100%',
  },
  cardImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardNameWrap: {
    width: '100%',
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  cardName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.black,
    textAlign: 'center',
    letterSpacing: -0.065,
    lineHeight: 16,
  },
});
