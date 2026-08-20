import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TouchableWithoutFeedback,
  FlatList, TextInput, Image, StyleSheet,
} from 'react-native';
import { Colors } from '../constants/colors';
import RootModal from './RootModal';
import { useI18n } from '../i18n';
import { iconSearch } from '../assets/icons';

// ─── Mock drivers ─────────────────────────────────────────────────────────────
const MOCK_DRIVERS = [
  { id: 'd1', name: 'Sainudheen'        },
  { id: 'd2', name: 'Saud Al Osaimi'    },
  { id: 'd3', name: 'احمد'              },
  { id: 'd4', name: 'ابوبكر يس'        },
  { id: 'd5', name: 'ابو بكر يس'       },
  { id: 'd6', name: 'ام فيصل'          },
  { id: 'd7', name: 'نوره'             },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectDriver: (driver: { id: string; name: string }) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SelectDriverDialog({ visible, onClose, onSelectDriver }: Props) {
  const { t, af } = useI18n();
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = MOCK_DRIVERS.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleClose() {
    setSearch('');
    onClose();
  }

  const inner = (
    <View style={s.sheet}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={handleClose} style={s.cancelWrap}>
          <Text style={[s.cancelText, { fontFamily: af('regular') }]}>{t('cancel')}</Text>
        </TouchableOpacity>
        <Text style={[s.title, { fontFamily: af('semibold') }]}>{t('selectDriverTitle')}</Text>
        <TouchableOpacity style={s.searchIconWrap} onPress={() => {}}>
          <Image source={iconSearch} style={s.searchIcon} />
        </TouchableOpacity>
      </View>

      {/* Search bar (shown when focused) */}
      {searchFocused && (
        <View style={s.searchBarWrap}>
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder={t('search')}
            placeholderTextColor={Colors.placeholder}
            autoFocus
            onBlur={() => { if (!search) setSearchFocused(false); }}
          />
        </View>
      )}

      {/* Driver list */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        scrollEnabled
        renderItem={({ item, index }) => (
          <>
            {index > 0 && <View style={s.divider} />}
            <TouchableOpacity
              style={s.row}
              activeOpacity={0.7}
              onPress={() => {
                setSearch('');
                setSearchFocused(false);
                onSelectDriver(item);
              }}
            >
              <Text style={s.driverName}>{item.name}</Text>
            </TouchableOpacity>
          </>
        )}
      />
    </View>
  );

  return (
    <RootModal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>
      <View style={s.container} pointerEvents="box-none">
        {inner}
      </View>
    </RootModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  sheet: {
    width: 660,
    maxHeight: 560,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grayLight,
    height: 56,
    paddingHorizontal: 20,
  },
  cancelWrap: {
    width: 80,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.4,
  },
  searchIconWrap: {
    width: 80,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  searchIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    opacity: 0.5,
  },
  searchBarWrap: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.grayLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  searchInput: {
    height: 40,
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.black,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.29)',
    marginLeft: 0,
  },
  row: {
    paddingHorizontal: 26,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  driverName: {
    fontSize: 18,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: -0.3,
  },
});
