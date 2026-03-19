# Todo Application — Detailed UI/UX Design Specification

---

## Table of Contents

1. [Design Tokens](#1-design-tokens)
2. [Typography System](#2-typography-system)
3. [Component Library](#3-component-library)
4. [User Flows](#4-user-flows)
5. [Authentication Screens](#5-authentication-screens)
6. [Main Dashboard](#6-main-dashboard)
7. [Modals & Overlays](#7-modals--overlays)
8. [Responsive Behavior](#8-responsive-behavior)
9. [Motion & Transitions](#9-motion--transitions)
10. [Accessibility Notes](#10-accessibility-notes)

---

## 1. Design Tokens

### 1.1 Color Palette

```
/* ── Base Neutrals ── */
--color-white:          #FFFFFF
--color-gray-50:        #F8F9FA    /* page background */
--color-gray-100:       #F1F3F5    /* sidebar background */
--color-gray-200:       #E9ECEF    /* dividers, input borders */
--color-gray-300:       #DEE2E6    /* disabled borders */
--color-gray-400:       #CED4DA    /* placeholder text */
--color-gray-500:       #ADB5BD    /* secondary icons */
--color-gray-600:       #6C757D    /* secondary text */
--color-gray-700:       #495057    /* body text */
--color-gray-800:       #343A40    /* heading text */
--color-gray-900:       #212529    /* primary text */

/* ── Primary Accent (Indigo) ── */
--color-primary-50:     #EEF2FF
--color-primary-100:    #E0E7FF
--color-primary-200:    #C7D2FE
--color-primary-300:    #A5B4FC
--color-primary-400:    #818CF8
--color-primary-500:    #6366F1    /* ← primary */
--color-primary-600:    #4F46E5    /* hover state */
--color-primary-700:    #4338CA    /* active/pressed */
--color-primary-800:    #3730A3
--color-primary-900:    #312E81

/* ── Priority Colors ── */
--color-priority-high:         #EF4444    /* red-500 */
--color-priority-high-bg:      #FEF2F2    /* red-50 */
--color-priority-high-border:  #FECACA    /* red-200 */

--color-priority-medium:       #F59E0B    /* amber-500 */
--color-priority-medium-bg:    #FFFBEB    /* amber-50 */
--color-priority-medium-border:#FDE68A    /* amber-200 */

--color-priority-low:          #10B981    /* emerald-500 */
--color-priority-low-bg:       #ECFDF5    /* emerald-50 */
--color-priority-low-border:   #A7F3D0    /* emerald-200 */

/* ── Project Label Colors (8 options) ── */
--label-indigo:   #6366F1
--label-violet:   #8B5CF6
--label-pink:     #EC4899
--label-rose:     #F43F5E
--label-orange:   #F97316
--label-teal:     #14B8A6
--label-sky:      #0EA5E9
--label-lime:     #84CC16

/* ── Semantic ── */
--color-success:       #10B981
--color-success-bg:    #ECFDF5
--color-error:         #EF4444
--color-error-bg:      #FEF2F2
--color-warning:       #F59E0B
--color-warning-bg:    #FFFBEB
--color-info:          #3B82F6
--color-info-bg:       #EFF6FF

/* ── Shadows ── */
--shadow-xs:   0 1px 2px rgba(0,0,0,0.04)
--shadow-sm:   0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)
--shadow-md:   0 4px 6px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)
--shadow-lg:   0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04)
--shadow-xl:   0 20px 25px rgba(0,0,0,0.10), 0 8px 10px rgba(0,0,0,0.04)
--shadow-fab:  0 6px 16px rgba(99,102,241,0.35)

/* ── Overlay ── */
--overlay-backdrop:  rgba(15, 17, 26, 0.45)
```

### 1.2 Spacing Scale

```
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-5:   20px
--space-6:   24px
--space-8:   32px
--space-10:  40px
--space-12:  48px
--space-16:  64px
--space-20:  80px
```

### 1.3 Border Radius

```
--radius-sm:    4px
--radius-md:    8px
--radius-lg:    12px
--radius-xl:    16px
--radius-2xl:   20px
--radius-full:  9999px
```

---

## 2. Typography System

### 2.1 Font Stack

```
Primary:    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Monospace:  'JetBrains Mono', 'Fira Code', monospace  (task IDs, code snippets)
```

> **Loading**: Import via Google Fonts — Inter weights 400, 500, 600, 700.

### 2.2 Type Scale

| Token          | Size   | Weight | Line-height | Letter-spacing | Usage                        |
|----------------|--------|--------|-------------|----------------|------------------------------|
| `--text-xs`    | 11px   | 500    | 1.4         | +0.04em        | Labels, badges, metadata     |
| `--text-sm`    | 13px   | 400    | 1.5         | 0              | Secondary body, captions     |
| `--text-base`  | 14px   | 400    | 1.6         | 0              | Primary body, input text     |
| `--text-md`    | 15px   | 500    | 1.5         | -0.01em        | Task titles, list items      |
| `--text-lg`    | 17px   | 600    | 1.4         | -0.02em        | Section headings             |
| `--text-xl`    | 20px   | 600    | 1.3         | -0.03em        | Panel/page titles            |
| `--text-2xl`   | 24px   | 700    | 1.25        | -0.04em        | Modal headings               |
| `--text-3xl`   | 30px   | 700    | 1.2         | -0.05em        | Auth screen headings         |

---

## 3. Component Library

### 3.1 Buttons

#### Primary Button
```
Background:   --color-primary-500
Text:         #FFFFFF, --text-base, weight 600
Padding:      10px 20px
Border:       none
Radius:       --radius-md
Height:       40px
Shadow:       --shadow-sm

States:
  :hover   → background --color-primary-600, translateY(-1px), shadow --shadow-md
  :active  → background --color-primary-700, translateY(0)
  :focus   → outline: 2px solid --color-primary-300, outline-offset: 2px
  :disabled→ background --color-gray-200, color --color-gray-400, cursor not-allowed

Transition:   all 150ms ease
```

#### Secondary Button
```
Background:   transparent
Border:       1.5px solid --color-gray-200
Text:         --color-gray-700, weight 500
Padding:      10px 20px
Radius:       --radius-md
Height:       40px

States:
  :hover   → background --color-gray-50, border-color --color-gray-300
  :active  → background --color-gray-100
```

#### Ghost Button
```
Background:   transparent
Text:         --color-gray-600
Padding:      8px 12px
No border, no shadow

States:
  :hover   → background --color-gray-100, color --color-gray-800
```

#### Danger Button
```
Background:   --color-error
Text:         white
Same sizing as Primary

States:
  :hover   → background #DC2626
```

#### Icon Button (circular)
```
Size:         32px × 32px
Background:   transparent
Radius:       --radius-full
Icon:         20px, --color-gray-500

States:
  :hover   → background --color-gray-100, icon --color-gray-700
```

#### FAB (Floating Action Button)
```
Size:         52px × 52px (mobile: 56px × 56px)
Background:   --color-primary-500
Icon:         24px white "+" (Plus icon)
Radius:       --radius-full
Shadow:       --shadow-fab
Position:     fixed, bottom 32px, right 32px

States:
  :hover   → background --color-primary-600, shadow 0 8px 20px rgba(99,102,241,0.45), scale(1.05)
  :active  → scale(0.97)
Transition:   all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)
```

---

### 3.2 Form Controls

#### Text Input
```
Height:       40px
Background:   #FFFFFF
Border:       1.5px solid --color-gray-200
Radius:       --radius-md
Padding:      0 12px
Font:         --text-base, --color-gray-900
Placeholder:  --color-gray-400

States:
  :hover   → border-color --color-gray-300
  :focus   → border-color --color-primary-500,
             box-shadow: 0 0 0 3px --color-primary-100,
             outline: none
  :error   → border-color --color-error,
             box-shadow: 0 0 0 3px --color-error-bg
  :disabled→ background --color-gray-50, color --color-gray-400

Transition:   border-color 150ms ease, box-shadow 150ms ease
```

#### Textarea
```
Same styles as Text Input
Min-height:   80px
Resize:       vertical
Padding:      10px 12px
```

#### Label
```
Font:         --text-sm, weight 500, --color-gray-700
Margin-bottom:6px
Display:      block
```

#### Error Message
```
Font:         --text-sm, --color-error
Margin-top:   4px
Icon:         12px warning triangle inline before text
```

#### Select / Dropdown
```
Same as Text Input + custom chevron icon (right, 16px, --color-gray-400)
Appearance:   none
Cursor:       pointer
```

#### Checkbox (custom)
```
Size:         18px × 18px
Border:       2px solid --color-gray-300
Radius:       --radius-sm

States:
  :hover      → border-color --color-primary-400
  :checked    → background --color-primary-500,
                border-color --color-primary-500,
                check icon: white SVG checkmark
  :indeterminate → background --color-primary-100, dash icon --color-primary-500

Transition:   all 150ms ease
Scale animation on check: 0.8 → 1.0 with cubic-bezier(0.175, 0.885, 0.32, 1.275)
```

---

### 3.3 Task Card

```
┌─────────────────────────────────────────────────────┐
│  [ ]  Task Title Text                    [🔴 High] │
│       Subtitle / description preview (1 line)       │
│       📅 Dec 15, 2024          👤 Assignee Name    │
└─────────────────────────────────────────────────────┘
```

**Detailed Spec:**

```
Background:       #FFFFFF
Border:           1.5px solid --color-gray-100
Radius:           --radius-lg
Padding:          14px 16px
Shadow:           --shadow-sm
Margin-bottom:    8px
Cursor:           pointer

Layout:           CSS Grid
  grid-template:  "[checkbox] 18px  [content] 1fr  [badge] auto"
  column-gap:     12px
  align-items:    start

Checkbox zone:    top-aligned, 2px padding-top offset

Content block:
  Task title:     --text-md, --color-gray-900, weight 500
                  (completed: line-through, --color-gray-400)
  Description:    --text-sm, --color-gray-500, 1 line, overflow ellipsis
  Meta row:       display flex, gap 12px, margin-top 6px
    Due date:      --text-xs, --color-gray-500
                   Icon: calendar, 12px, same color
                   Overdue: --color-error, bg --color-error-bg, padding 2px 6px, radius --radius-full
    Assignee:      Avatar circle 20px + name, --text-xs

Badge zone:       top-aligned, self-start

States:
  :hover       → border-color --color-primary-200,
                 shadow --shadow-md,
                 translateY(-1px)
  :active      → translateY(0), shadow --shadow-sm
  completed    → background --color-gray-50, opacity 0.75
  selected     → border-color --color-primary-400,
                 background --color-primary-50,
                 box-shadow: 0 0 0 2px --color-primary-200

Transition:   all 180ms ease
```

---

### 3.4 Priority Badge

```
Layout:         inline-flex, align-items center, gap 4px
Padding:        3px 8px
Radius:         --radius-full
Font:           --text-xs, weight 600, uppercase, letter-spacing +0.03em

HIGH:
  Text:         --color-priority-high
  Background:   --color-priority-high-bg
  Border:       1px solid --color-priority-high-border
  Dot:          6px circle, --color-priority-high

MEDIUM:
  Text:         --color-priority-medium (darken slightly: #B45309)
  Background:   --color-priority-medium-bg
  Border:       1px solid --color-priority-medium-border
  Dot:          6px circle, --color-priority-medium

LOW:
  Text:         --color-priority-low (darken: #065F46)
  Background:   --color-priority-low-bg
  Border:       1px solid --color-priority-low-border
  Dot:          6px circle, --color-priority-low
```

---

### 3.5 Avatar

```
Sizes:
  xs: 24px — top nav notifications count
  sm: 32px — task card assignee chips
  md: 36px — top nav user avatar
  lg: 48px — profile dropdown
  xl: 64px — settings page

Border-radius:  --radius-full
Object-fit:     cover

Fallback (initials):