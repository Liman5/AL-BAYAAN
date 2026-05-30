# Grades Module - UI Layout & Components

## Page Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         AppHeader                              │
│  [Logo] [Navigation] [School Info] [Notifications] [Profile]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                     Page Title Section                    │ │
│  │              📊 Grades & Assessments                      │ │
│  │         Manage and track student grades across terms     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │        Academic Level Selector                           │ │
│  │  ┌──────────────────┐  ┌──────────────────┐             │ │
│  │  │ 📚 Primary (5e)  │  │ 🎓 Middle (3e)   │             │ │
│  │  └──────────────────┘  └──────────────────┘             │ │
│  │           (Active)           (Inactive)                 │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │           School & Subject Info Card                     │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │ │
│  │  │ SCHOOL       │ │ CLASS        │ │ SUBJECT      │     │ │
│  │  │ AL-BAYAAN    │ │ 5e           │ │ Mathématiques│     │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              Term Tabs Navigation                        │ │
│  │  📍 First Term │ 📍 Second Term │ 📍 Third Term          │ │
│  │  (Active ───────)  (Inactive)      (Inactive)           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │        Collapsible Term Section (First Term)             │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │ ▼ 📍 First Term                         8 students │ │ │
│  │  │                                                     │ │ │
│  │  │ ┌────────────────────────────────────────────────┐ │ │ │
│  │  │ │ Select Assessment Type:                       │ │ │ │
│  │  │ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────┐ │ │ │
│  │  │ │ │ 📋 Class │ │ 📚 Home- │ │ 📝 Cont. │ │📊  │ │ │ │
│  │  │ │ │ Assign.  │ │ work     │ │ Assess.  │ │Final│ │ │ │
│  │  │ │ └──────────┘ └──────────┘ └──────────┘ └────┘ │ │ │
│  │  │ │ (Active)    (Inactive)    (Inactive)  (Inactive)│ │ │
│  │  │ └────────────────────────────────────────────────┘ │ │ │
│  │  │                                                     │ │ │
│  │  │ ┌────────────────────────────────────────────────┐ │ │ │
│  │  │ │           Grade Grid Table                    │ │ │ │
│  │  │ │                                                │ │ │ │
│  │  │ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │ │ │
│  │  │ │ │ AVG  │ │ MAX  │ │ MIN  │ │ EVAL │          │ │ │ │
│  │  │ │ │16.15 │ │ 20   │ │ 8    │ │ 8/8  │          │ │ │
│  │  │ │ └──────┘ └──────┘ └──────┘ └──────┘          │ │ │
│  │  │ │         (Statistics Row)                       │ │ │
│  │  │ │                                                │ │ │
│  │  │ │ ┌─────────────────────────────────────────────┐│ │
│  │  │ │ │ Student │ CA │ HW │ CA │ FE │ AVG│REM│SIG│ ││ │
│  │  │ │ ├─────────────────────────────────────────────┤│ │
│  │  │ │ │ Ahmed   │18  │17  │16  │15  │16.15│VG │───│ ││ │
│  │  │ │ │ Fatima  │19  │18  │17  │18  │18.0 │Exc│───│ ││ │
│  │  │ │ │ Mohamed │14  │13  │15  │12  │13.8 │Fair│──│ ││ │
│  │  │ │ │ ...     │... │... │... │... │...  │... │..│ ││ │
│  │  │ │ └─────────────────────────────────────────────┘│ │
│  │  │ │         (Editable Table with Scrolling)       │ │ │
│  │  │ │                                                │ │ │
│  │  │ │ Grading Configuration:                        │ │ │
│  │  │ │ CA(20%) | HW(15%) | CA(25%) | FE(40%)        │ │ │
│  │  │ │ Thresholds: Excellent(18)|VG(16)|Good(14)... │ │ │
│  │  │ └────────────────────────────────────────────────┘ │ │
│  │  │                                                     │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │ ▶ 📍 Second Term                        8 students │ │ │
│  │  │ (Collapsed)                                         │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │ ▶ 📍 Third Term                         8 students │ │ │
│  │  │ (Collapsed)                                         │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                  Info Footer                            │ │
│  │  💡 Tip: Click any cell to edit. Averages and remarks   │ │
│  │  are calculated automatically.                          │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                     Navigation Bar (Fixed Bottom)              │
│  🏠 Home │ 👥 Students │ 📝 Exercises │ 📊 Grades │ 📅 Planning │
└─────────────────────────────────────────────────────────────────┘
```

---

## Grade Grid Table - Detailed Layout

### Statistics Bar
```
┌────────────────────────────────────────────────────────────┐
│ Average: 16.15  │  Max: 20  │  Min: 8  │  Evaluated: 8/8 │
│ (Blue card)     │(Green)    │ (Red)    │ (Purple)        │
└────────────────────────────────────────────────────────────┘
```

### Table Header
```
┌────────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┐
│ Student    │ Class  │Homework│ Cont.  │ Final  │ Average│ Remark │Signature│
│ (Sticky)   │Assign. │        │Assess. │ Exam   │(Calc)  │ (Auto) │(Edit)  │
└────────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┘
```

### Table Row (Data Row)
```
┌────────────┬────────┬────────┬────────┬────────┬────────┬──────────┬────────┐
│Ahmed       │ [18]   │ [17]   │ [16]   │ [15]   │ 16.15  │ Very Good│ [Sign] │
│Benhamida   │(input) │(input) │(input) │(input) │ (auto) │(Blue✓)  │(input) │
│(Read-only) │ 0-20   │ 0-20   │ 0-20   │ 0-20   │rounded │ 6 levels │        │
│(Sticky)    │ Max:20 │ Max:20 │ Max:20 │ Max:20 │2 decimals│colored│        │
└────────────┴────────┴────────┴────────┴────────┴────────┴──────────┴────────┘
```

### Remark Color Coding
```
Score   | Badge Color | Text
────────┼─────────────┼──────────────
18-20   | Green       | Excellent
16-17   | Blue        | Very Good
14-15   | Cyan        | Good
12-13   | Yellow      | Fair
10-11   | Orange      | Pass
<10     | Red         | Fail
```

---

## Responsive Design Breakpoints

### Desktop (≥1024px)
```
Full width table visible
All columns displayed
Horizontal scroll for overflow
Student name sticky (left)
```

### Tablet (768px - 1023px)
```
Most content visible
Some horizontal scroll needed
Student name remains sticky
Comfortable touch targets
```

### Mobile (≤767px)
```
Vertical layout where possible
Horizontal scroll for table
Student names in fixed column
Tab interface for navigation
Stacked selector buttons
```

---

## Color Scheme Reference

### Primary Colors
```
Primary Blue:     #2563EB (Buttons, active states)
Dark Gray:        #111827 (Text)
Light Gray:       #F3F4F6 (Backgrounds)
Border Gray:      #D1D5DB (Borders)
```

### Status Colors
```
Success Green:    #16A34A (Excellent grades)
Info Blue:        #0284C7 (Very Good grades)
Warning Yellow:   #CA8A04 (Fair grades)
Alert Orange:     #EA580C (Pass grades)
Error Red:        #DC2626 (Fail grades)
Cyan:             #0891B2 (Good grades)
```

### Hover/Active States
```
Button Hover:     Slightly darker shade
Input Focus:      Blue ring (ring-2 ring-blue-500)
Card Hover:       Subtle background change
Row Hover:        Light blue background
```

---

## Interactive Elements

### Buttons
```
Active Button:
┌─────────────────────┐
│ 📚 Primary School   │  ← Blue background
│                     │     White text
└─────────────────────┘     Cursor pointer

Inactive Button:
┌─────────────────────┐
│ 🎓 Middle School    │  ← Gray background
│                     │     Dark text
└─────────────────────┘     Cursor pointer
```

### Input Fields
```
Empty State:
┌─────────────┐
│      ___    │  ← Placeholder text (gray)
└─────────────┘

Focused State:
┌═════════════┐
│    [18]     │  ← Blue ring, value displayed
└═════════════┘

Invalid State (would be added):
┌─────────────┐
│    [999]    │  ← Red ring, rejected
└─────────────┘
```

### Collapsible Section
```
Expanded:
┌─────────────────────────────────────┐
│ ▼ 📍 First Term       [8 students] │
├─────────────────────────────────────┤
│ [Content displayed here]            │
└─────────────────────────────────────┘

Collapsed:
┌─────────────────────────────────────┐
│ ▶ 📍 Second Term      [8 students] │
└─────────────────────────────────────┘
```

---

## Data Entry Workflow

### Step 1: Select Term
```
┌──────────────────────────────────────┐
│ 📍 First Term | Second | Third       │
│ (Click active)                       │
└──────────────────────────────────────┘
```

### Step 2: Expand Term (if collapsed)
```
┌────────────────────────────────────────┐
│ ▼ 📍 First Term      [8 students] │
│   [Content now visible]                │
└────────────────────────────────────────┘
```

### Step 3: Select Assessment Type
```
┌─────────────────────────────────────────┐
│ Select Assessment Type:                │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│ │📋 CA │ │📚 HW │ │📝 CA │ │📊 FE │  │
│ │(Sel.)│ │      │ │      │ │      │  │
│ └──────┘ └──────┘ └──────┘ └──────┘  │
└─────────────────────────────────────────┘
```

### Step 4: Enter Grades
```
│ Ahmed      │ [18] │ [17] │ [16] │ [15] │
│            │  ↑   │  ↑   │  ↑   │  ↑   │
│            │Click │Click │Click │Click │
│            │Type  │Type  │Type  │Type  │
│            │Enter │Enter │Enter │Enter │
```

### Step 5: Auto-Update Results
```
│ Ahmed      │ 18 │ 17 │ 16 │ 15 │ 16.15 │ Very Good │
│            │    │    │    │    │   ↑   │    ↑      │
│            │    │    │    │    │ Auto  │   Auto    │
│            │    │    │    │    │ Calc  │ Assigned  │
```

---

## Accessibility Features

### Keyboard Navigation
```
Tab     → Move between cells (left to right, top to bottom)
Shift+Tab → Move to previous cell
Enter   → Submit/move to next row
Escape  → Cancel edit
Arrow Keys → Navigate within table (if implemented)
```

### Screen Reader Support
```
Each cell has: semantic HTML elements
Tables have: proper thead/tbody structure
Forms have: proper labels and ARIA attributes
Buttons have: clear text labels
Links have: descriptive text
```

### Visual Indicators
```
Focus State: Visible blue ring around active element
Hover State: Clear visual feedback on interactive elements
Color Use: Colors not the only indicator of status
Contrast: WCAG AA compliant color combinations
Font Size: Readable on all screen sizes
```

---

## Empty States

### No Grades Entered
```
┌──────────────────────────────────────┐
│  📊 No grades entered yet            │
│                                      │
│  Start by clicking on a cell and    │
│  entering a grade (0-20)            │
│                                      │
│  Averages will calculate            │
│  automatically                      │
└──────────────────────────────────────┘
```

### No Students
```
┌──────────────────────────────────────┐
│  👥 No students in this class        │
│                                      │
│  Add students to the class first    │
└──────────────────────────────────────┘
```

---

## Animation & Transitions

### Expand/Collapse
```
Duration: 200ms
Easing: ease-in-out
Effect: Smooth height change
```

### Button Hover
```
Duration: 150ms
Effect: Color change + subtle lift (shadow)
```

### Input Focus
```
Duration: 200ms
Effect: Ring appears + background change
```

### Table Row Hover
```
Duration: 150ms
Effect: Subtle background color change
```

---

## Mobile-Specific Layout

### Landscape Mode (Mobile)
```
┌─────────────────────────────────────┐
│ Academic Level │ Term Tabs │ Search │
├─────────────────────────────────────┤
│ Student │ CA │ HW │ Cont │ Final  │
│ [Horz Scroll]                       │
├─────────────────────────────────────┤
│ Ahmed   │18  │17  │ 16   │ 15     │
│ [Horz Scroll]                       │
└─────────────────────────────────────┘
```

### Portrait Mode (Mobile)
```
┌─────────────────────┐
│ Academic Level      │
├─────────────────────┤
│ Term Tabs (scroll)  │
├─────────────────────┤
│ Assessment Type     │
├─────────────────────┤
│ Stats Cards         │
├─────────────────────┤
│ Table (h-scroll)    │
├─────────────────────┤
│ Info Footer         │
└─────────────────────┘
```

---

## Summary

The UI provides:
✅ Intuitive navigation
✅ Clear data hierarchy
✅ Fast entry workflow
✅ Real-time feedback
✅ Responsive design
✅ Accessible interface
✅ Professional appearance
✅ Mobile-friendly experience
