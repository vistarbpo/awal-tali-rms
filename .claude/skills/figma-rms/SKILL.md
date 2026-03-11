---
name: figma-rms
description: Implement UI from Figma designs for the Awal Tali RMS project. Use when the user provides a Figma URL or says "implement this design from Figma". Figma designs are treated as inspiration and feature reference — NOT pixel-perfect specs. Always follow the project's own design system, color tokens, and existing screen patterns.
---

# Figma → Awal Tali RMS Implementation

## Core Philosophy

**Figma designs are for ideas — the project design system is the source of truth.**

The Figma designs for this project are work-in-progress and may have:
- Inconsistent spacing, sizing, or colors that deviate from the design system
- Components that don't follow the established patterns
- Layout decisions that don't suit the iPad landscape form factor

**Always default to project conventions over Figma specs.**

---

## Step 1 — Fetch the Figma design

Extract `fileKey` and `nodeId` from the URL and call `get_design_context` + `get_screenshot`.

```
get_design_context(fileKey=":fileKey", nodeId=":nodeId")
get_screenshot(fileKey=":fileKey", nodeId=":nodeId")
```

Use the screenshot as a **feature inventory** — understand what components and information are present.

If the response is too large, use `get_metadata` first, then fetch child nodes individually.

---

## Step 2 — Extract intent, not pixels

From the Figma output, identify:
- **What screens or components** need to be built
- **What information** is shown (labels, values, states)
- **What interactions** exist (taps, navigation, dialogs)
- **What states** are shown (empty, filled, loading, error, active)

**Ignore:**
- Exact pixel dimensions — use the project's established spacing
- Hardcoded hex colors — always map to `Colors.*` tokens
- Font families (SF Pro etc.) — the project uses system defaults
- Any layout that doesn't match the existing screen patterns

---

## Step 3 — Map to the project design system

### Colors — always use tokens from `src/constants/colors.ts`

| Figma value | Token to use |
|---|---|
| `#1D353F` | `Colors.primary` |
| `#D45757` | `Colors.red` |
| `#0B151A` | `Colors.black` |
| `#FFFFFF` | `Colors.white` |
| `#FAFAFA` | `Colors.backgroundAlt` |
| `#F5F5F5` | `Colors.grayLight` |
| `#979797` | `Colors.grayText` |
| `#EEEEEE` | `Colors.grayBorder` |
| `#D8D8D8` | `Colors.grayMid` |
| `#C9C9C9` | `Colors.placeholder` |
| `#F3F7F8` | `Colors.primaryLight` |
| `#4CAF82` | `Colors.green` |
| `#A0814B` | `Colors.yellowGold` |
| `rgba(0,0,0,0.29)` hairline | `'rgba(60,60,67,0.29)'` |

### Styling rules
- **All styles via `StyleSheet.create`** — no inline style objects for static values
- **No Tailwind, no CSS** — this is React Native
- Follow existing component file structure

### Dialogs — use the established modal pattern
```tsx
<Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
  <TouchableWithoutFeedback onPress={onClose}>
    <View style={s.backdrop} />   {/* rgba(0,0,0,0.45) */}
  </TouchableWithoutFeedback>
  <View style={s.center} pointerEvents="box-none">
    <View style={s.card}>         {/* white, borderRadius 24, width 360-520 */}
      <View style={s.header}>     {/* Colors.grayLight, height 72, centered */}
        <Text style={s.title} />  {/* Colors.primary, 20px, weight 600 */}
      </View>
      {/* content */}
    </View>
  </View>
</Modal>
```

### Action buttons (toolbar)
- `borderRadius: 14`, `paddingHorizontal: 12`, `paddingVertical: 14`
- Normal: `Colors.primary` bg, `Colors.shadow` shadow
- Danger: `Colors.red` bg, `Colors.redShadow` shadow
- Icon: `36×36`, `resizeMode: 'contain'`
- Label: `fontSize: 12`, `fontWeight: '500'`, `Colors.white`

### Touch targets (iPad)
- All interactive elements: minimum **44×44pt** hit area
- Row heights: minimum **64–72pt** for list rows
- Use `hitSlop` when visual size is smaller than touch target

---

## Step 4 — Reuse before creating

Before writing any new component, check:
- `src/components/` — existing dialogs, panels, buttons
- `src/styles/screenLayout.ts` — shared layout styles
- `src/constants/colors.ts` — all color tokens

**Extend an existing component** rather than creating a new one when possible.

---

## Step 5 — Implement following project conventions

### File placement
- New dialogs/components → `src/components/`
- New full screens → `src/screens/`
- Shared styles → `src/styles/screenLayout.ts`
- No new utility files unless genuinely shared across 3+ files

### Component structure
```tsx
// ─── Types ────────────────────────
interface Props { ... }

// ─── Constants/data ───────────────
const MOCK_DATA = [...]

// ─── Component ────────────────────
export default function MyComponent({ ... }: Props) {
  // state
  // handlers
  // render
}

// ─── Styles ───────────────────────
const s = StyleSheet.create({ ... });
```

### Icons
- Use Figma MCP asset URLs for icons: `{ uri: 'https://www.figma.com/api/mcp/asset/...' }`
- Store in a local `ICONS` constant at the top of the file
- For simple shapes (dividers, dots, chevrons) use view-drawn elements

### State management
- No Redux, no Context — local `useState` within components
- Multi-step dialogs: manage step state inside the dialog component
- Cart/order state: lives in `App.tsx`, passed down via props

---

## Step 6 — What to skip from Figma

**Do not implement:**
- Status bar / system UI (already handled by SafeAreaView)
- Exact rotation transforms the Figma uses for its own layout methodology
- Placeholder/lorem ipsum content that isn't meaningful
- Decorative elements that don't serve a functional purpose
- Anything already implemented in the current codebase

**Do implement:**
- New screens or dialogs shown in the design
- New data fields, labels, or information not currently shown
- New interaction flows and navigation paths
- New states (empty, loading, error, success, disabled)

---

## Step 7 — Validate before finishing

Check the implementation against:
- [ ] All colors use `Colors.*` tokens — no hardcoded hex
- [ ] All styles in `StyleSheet.create` — no inline objects
- [ ] All touch targets ≥ 44pt
- [ ] TypeScript compiles: run `npx tsc --noEmit`
- [ ] No new dependencies added
- [ ] Follows the existing modal/dialog pattern from CLAUDE.md
- [ ] Component integrates correctly with existing screens (props wired up)
