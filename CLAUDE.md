# Awal Tali RMS — Claude Code Guidelines

## Project Overview
Restaurant Management System (RMS) cashier app built with **React Native + Expo** (TypeScript).
Tablet-first layout (iPad landscape). No Tailwind — all styling via `StyleSheet.create`.

## Tech Stack
- React Native 0.83 + Expo 55
- TypeScript
- React Native Web (for web preview)
- No navigation library — screen switching via `useState<Screen>` in `App.tsx`

## Project Structure
```
src/
  components/    # Reusable UI components (dialogs, panels)
  constants/     # Colors, shared tokens
  navigation/    # (reserved)
  screens/       # Full-screen views
  styles/        # Shared layout styles (screenLayout.ts)
```

---

## Brand Palette (`src/constants/colors.ts`)

| Token | Hex | Usage |
|---|---|---|
| `Colors.primary` | `#1D353F` | Buttons, headers, primary text |
| `Colors.red` | `#D45757` | Void / danger actions |
| `Colors.redShadow` | `#F2A7A7` | Shadow for danger buttons |
| `Colors.shadow` | `#D5D2C3` | Shadow for primary buttons |
| `Colors.black` | `#0B151A` | Body text |
| `Colors.white` | `#FFFFFF` | Card backgrounds |
| `Colors.backgroundAlt` | `#FAFAFA` | Screen background |
| `Colors.grayLight` | `#F5F5F5` | Dialog headers, Add Course strip |
| `Colors.grayText` | `#979797` | Secondary labels |
| `Colors.grayBorder` | `#EEEEEE` | Dividers, borders |
| `Colors.grayMid` | `#D8D8D8` | Disabled labels |
| `Colors.placeholder` | `#C9C9C9` | Input placeholders |
| `Colors.primaryLight` | `#F3F7F8` | Selected item tint |
| `Colors.liteColor2` | `#F4F3F1` | Voided order item background |
| `Colors.liteColor` | `#E7E2DC` | Subtle tint |
| `Colors.green` | `#4CAF82` | Success / clocked-in |
| `Colors.goldShade` | `#CEAB95` | Gold accents |
| `Colors.yellowGold` | `#A0814B` | Add Customer link |

---

## Modal / Dialog Pattern

All dialogs follow the same branded template. Use this as the base for any new dialog:

```tsx
<Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
  <TouchableWithoutFeedback onPress={onClose}>
    <View style={s.backdrop} />          {/* rgba(0,0,0,0.45) */}
  </TouchableWithoutFeedback>

  <View style={s.center} pointerEvents="box-none">
    <View style={s.card}>               {/* white, borderRadius: 24, width: 360 */}

      {/* Header band */}
      <View style={s.header}>           {/* Colors.grayLight bg, height 72, centered */}
        <Text style={s.headerTitle} />  {/* Colors.primary, fontSize 20, fontWeight 600 */}
      </View>

      {/* Content rows */}
      <View style={s.list}>
        {/* Dividers: height 0.5, rgba(60,60,67,0.29), marginLeft: 24 */}
        {/* Rows: paddingHorizontal 26, paddingVertical 20 */}
      </View>

    </View>
  </View>
</Modal>
```

### Card Specs
- `width: 360`
- `backgroundColor: Colors.white`
- `borderRadius: 24`
- `overflow: 'hidden'`
- Shadow: `color: Colors.black, offset: {0,8}, opacity: 0.18, radius: 24, elevation: 12`

### Header Band Specs
- `backgroundColor: Colors.grayLight` (`#F5F5F5`)
- `height: 72` (or `paddingVertical: 18` for multi-line)
- `alignItems: 'center', justifyContent: 'center'`
- Title: `fontSize: 20, fontWeight: '600', color: Colors.primary, letterSpacing: -0.4`
- Subtitle (optional): `fontSize: 13, fontWeight: '400', color: Colors.grayText`

### Row / List Item Specs
- `paddingHorizontal: 26, paddingVertical: 20`
- Label: `fontSize: 18-20, fontWeight: '500', letterSpacing: -0.35 to -0.4`
- Use `Colors.primary` for primary actions, `Colors.grayText` for neutral options

### Divider Specs
- `height: 0.5, backgroundColor: 'rgba(60,60,67,0.29)', marginLeft: 24`
- Full-width divider: `height: 1, backgroundColor: Colors.grayBorder`

### Danger Dialog Variant (e.g. VoidReasonDialog)
When a dialog represents a destructive action, add these enhancements on top of the base pattern:
- **Accent bar**: `height: 4, backgroundColor: Colors.red` at the very top of the card
- **Icon circle**: 52×52, `backgroundColor: '#FAE8E8'` (light red tint), inner dot 20×20 `Colors.red`
- **Title**: `fontWeight: '700', color: Colors.black` (stronger than standard)
- **Row dots**: small `8×8` red dot (`Colors.red`) before each destructive option label
- **Reason labels**: `Colors.primary`, `fontSize: 16, fontWeight: '500'`

### CTA Button Specs (inside dialogs)
- `height: 56, borderRadius: 14, backgroundColor: Colors.primary`
- Shadow: `color: Colors.primary, offset: {0,4}, opacity: 0.35, radius: 8, elevation: 4`
- Text: `fontSize: 17, fontWeight: '700', color: Colors.white, letterSpacing: -0.2`

---

## Action Button (toolbar) Pattern

Used in `layout.actionBtn` (see `screenLayout.ts`):
- Normal: `Colors.primary` background, `Colors.shadow` shadow
- Danger (Void): `Colors.red` background, `Colors.redShadow` shadow
- Icon: 36×36, `resizeMode: 'contain'`
- Label: `fontSize: 12, fontWeight: '500', color: Colors.white`
- `borderRadius: 14`, `paddingHorizontal: 12, paddingVertical: 14`

---

## Typography Scale

| Usage | Size | Weight | Color |
|---|---|---|---|
| Dialog title | 20 | 600 | `Colors.primary` |
| Dialog subtitle | 13 | 400 | `Colors.grayText` |
| List row label | 18–20 | 500 | `Colors.primary` / `Colors.grayText` |
| Order item name | 14 | 400 | `Colors.black` |
| Order item price | 18 | 600 | `Colors.black` |
| Total label | 23 | 600 | `Colors.white` |
| Tab label | 13 | 700 | `Colors.grayText` / `Colors.primary` (active) |
| Action bar label | 12 | 500 | `Colors.white` |
| Section header | 15 | 600 | `Colors.primary` |

---

## Key Screens

| Screen | File | Notes |
|---|---|---|
| Login | `LoginScreen.tsx` | PIN entry |
| Welcome / Clock-in | `WelcomeScreen.tsx` | Clock in/out, till |
| Home (categories) | `HomeScreen.tsx` | Category grid |
| Home (products) | `HomeProductsScreen.tsx` | Main cashier view |
| Payment | `PaymentScreen.tsx` | Checkout |

## Key Components

| Component | File | Notes |
|---|---|---|
| Order panel | `OrderPanel.tsx` | Left sidebar cart; accepts `isVoided` prop |
| More menu | `MoreMenu.tsx` | Home button overlay menu |
| Confirm dialog | `ConfirmDialog.tsx` | Yes/No confirmation |
| Order type dialog | `OrderTypeDialog.tsx` | Dine in / Pick up / Delivery / Drive thru |
| Till amount dialog | `TillAmountDialog.tsx` | Numpad amount entry |
| Void reason dialog | `VoidReasonDialog.tsx` | Cancel order reason selection |

---

## Void Order Flow

1. Cashier taps **Void** button on main action bar
2. `VoidReasonDialog` appears — user selects a reason
3. Order items get `Colors.liteColor2` background (`isVoided=true` on `OrderPanel`)
4. Order is non-editable; cashier taps **NEW** to clear and start fresh

---

## Form Field Style

All text inputs and form fields (search bars, quantity inputs, text fields) must match the search bar style from `layout.searchBar` in `screenLayout.ts`:

```ts
{
  backgroundColor: Colors.white,
  borderRadius: 16,
  height: 56–60,           // use 60 for full-width, 56 for compact
  borderWidth: 1.5,
  borderColor: 'transparent',   // Colors.primary when focused
  shadowColor: Colors.black,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
}
```

- Reuse `layout.searchBar` / `layout.searchBarFocused` directly when possible
- Never use flat borders (`borderColor: grayBorder`) or low `borderRadius` (< 12) for inputs
- **Structure**: always `flexDirection: 'row'` with a left icon wrap (44px wide) + `TextInput` (`flex: 1`)
- **Focused state** (required): track focus with `useState`, apply `borderColor: Colors.primary` + `shadowOpacity: 0.10`
- Use `Pressable` as the outer wrapper so tapping anywhere in the field focuses the input
- Placeholder color: always `Colors.placeholder` (`#C9C9C9`)

---

## Coding Conventions

- Use `StyleSheet.create` — never inline style objects for static styles
- Import colors from `Colors` — never hardcode hex values
- All shared layout styles go in `src/styles/screenLayout.ts`
- Screen-specific styles live at the bottom of each screen file
- Icon assets imported as `{ uri: 'https://...' }` from Figma MCP asset URLs
- New dialogs must follow the branded dialog pattern above
- No third-party UI libraries — build from primitives
