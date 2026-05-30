# Teacher Grades Module - Comprehensive Documentation

## Overview

The Grades Module is a modern, spreadsheet-like interface designed for teachers to manage and track student grades across multiple terms and assessment types. It features automatic calculations, configurable grading rules for different academic levels, and an intuitive user experience optimized for fast data entry.

---

## Module Architecture

### Directory Structure

```
components/
├── grades/
│   ├── grades-module.tsx                    # Main container component
│   ├── academic-level-selector.tsx          # Level switcher (Primary/Middle School)
│   ├── term-tabs.tsx                        # Term navigation
│   ├── collapsible-term-section.tsx         # Term container with assessment types
│   └── grade-grid-table.tsx                 # Editable grade table with calculations

lib/
├── gradingConfigs.ts                        # Grading rules and calculation logic
└── mockGradesData.ts                        # Mock student data for demo

types/
└── grades.ts                                # TypeScript interfaces and types

app/
└── teacher/
    └── grades/
        └── page.tsx                         # Main grades page with layout
```

---

## Core Components

### 1. **GradesModule** (`grades-module.tsx`)
The main orchestrator component that manages all state and coordinates sub-components.

**Features:**
- Academic level selection (Primary School vs Middle School)
- Term management and navigation
- State management for editable grades
- Mock data initialization
- Expandable/collapsible term sections

**Props:** None (manages internal state)

**Key State:**
- `academicLevel`: Selected academic level
- `selectedTerm`: Currently active term
- `selectedAssessmentType`: Current assessment type filter
- `expandedTerms`: Set of expanded term sections
- `termGrades`: Record of grades for each term

---

### 2. **AcademicLevelSelector** (`academic-level-selector.tsx`)
Allows teachers to select between Primary School (5e) and Middle School (3e) grading systems.

**Props:**
```typescript
interface AcademicLevelSelectorProps {
  academicLevel: AcademicLevel;
  onLevelChange: (level: AcademicLevel) => void;
}
```

**Behavior:**
- Switching levels reloads all student data
- Updates grading configuration automatically
- Shows different student cohorts and names per level

---

### 3. **TermTabs** (`term-tabs.tsx`)
Tab-based navigation between three academic terms.

**Props:**
```typescript
interface TermTabsProps {
  selectedTerm: Term;
  onTermChange: (term: Term) => void;
}
```

**Terms:**
- First Term (📍)
- Second Term (📍)
- Third Term (📍)

---

### 4. **CollapsibleTermSection** (`collapsible-term-section.tsx`)
Container for a single term with collapsible functionality and assessment type selector.

**Props:**
```typescript
interface CollapsibleTermSectionProps {
  termLabel: string;
  assessmentTypes: { type: AssessmentType; label: string; icon: string }[];
  selectedAssessmentType: AssessmentType | null;
  onAssessmentTypeSelect: (type: AssessmentType) => void;
  grades: GradeEntry[];
  onGradesChange: (grades: GradeEntry[]) => void;
  gradingConfig: GradingConfig;
  isExpanded: boolean;
  onToggleExpand: () => void;
}
```

**Assessment Types:**
- 📋 Class Assignments
- 📚 Homework
- 📝 Continuous Assessment
- 📊 Final Exam / Composition

---

### 5. **GradeGridTable** (`grade-grid-table.tsx`)
The main spreadsheet-like interface for entering and viewing grades.

**Props:**
```typescript
interface GradeGridTableProps {
  grades: GradeEntry[];
  onGradesChange: (grades: GradeEntry[]) => void;
  gradingConfig: GradingConfig;
  assessmentType: AssessmentType;
}
```

**Features:**
- **Editable Input Cells**: Direct grade entry with validation (0-20)
- **Automatic Average Calculation**: Real-time updates as scores are entered
- **Automatic Remarks**: Assigns remarks based on average score
- **Statistics Display**: Shows average, min, max, and evaluation count
- **Signature Field**: Teacher can add signatures
- **Color-Coded Remarks**: Visual feedback with color badges
- **Responsive Design**: Horizontal scroll on mobile, full table on desktop

**Columns:**
| Column | Type | Behavior |
|--------|------|----------|
| Student Name | Read-only | Sticky left, shows student name |
| Class Assignments | Editable | Weight: 20% |
| Homework | Editable | Weight: 15% |
| Continuous Assessment | Editable | Weight: 25% |
| Final Exam | Editable | Weight: 40% |
| Average | Auto-calculated | Shows weighted average |
| Remark | Auto-generated | Excellent/Very Good/Good/Fair/Pass/Fail |
| Signature | Editable | For teacher's signature |

---

## Type Definitions

### Main Types (`types/grades.ts`)

```typescript
export type AcademicLevel = 'primary' | 'middle_school';
export type Term = 'first' | 'second' | 'third';
export type AssessmentType = 'class_assignments' | 'homework' | 'continuous_assessment' | 'final_exam';
export type TeacherRemark = 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Pass' | 'Fail';

export interface GradeEntry {
  studentId: string;
  studentName: string;
  classAssignments: number | null;
  homework: number | null;
  continuousAssessment: number | null;
  finalExam: number | null;
  coefficient?: number;
  average?: number;
  remark?: TeacherRemark;
  teacherSignature?: string;
  teacherComments?: string;
}

export interface GradingConfig {
  academicLevel: AcademicLevel;
  schoolName: string;
  subject: string;
  className: string;
  classAssignmentsCoefficient: number;    // 0.2 (20%)
  homeworkCoefficient: number;             // 0.15 (15%)
  continuousAssessmentCoefficient: number; // 0.25 (25%)
  finalExamCoefficient: number;            // 0.4 (40%)
  maxScore: number;                        // 20
  passingScore: number;                    // 10
  excellentThreshold: number;              // 18
  veryGoodThreshold: number;               // 16
  goodThreshold: number;                   // 14
  fairThreshold: number;                   // 12
  passThreshold: number;                   // 10
}
```

---

## Grading Configuration (`lib/gradingConfigs.ts`)

### Pre-configured Levels

#### Primary School (5e)
```typescript
classAssignmentsCoefficient: 0.2
homeworkCoefficient: 0.15
continuousAssessmentCoefficient: 0.25
finalExamCoefficient: 0.4
```

#### Middle School (3e)
Same coefficients as Primary (can be customized separately)

### Calculation Formula

```
Average = (ClassAssignments × 0.2 + Homework × 0.15 + 
           ContinuousAssessment × 0.25 + FinalExam × 0.4) / 
          (Sum of coefficients for non-null scores)
```

### Remark Assignment

| Average Score | Remark | Color |
|---|---|---|
| 18-20 | Excellent | Green |
| 16-17 | Very Good | Blue |
| 14-15 | Good | Cyan |
| 12-13 | Fair | Yellow |
| 10-11 | Pass | Orange |
| < 10 | Fail | Red |

### Helper Functions

**`getTeacherRemark(average: number, config: GradingConfig): TeacherRemark`**
- Determines appropriate remark based on score thresholds

**`calculateAverage(...)`**
- Computes weighted average considering only entered scores
- Returns null if no scores entered

**`getGradingConfig(academicLevel: AcademicLevel): GradingConfig`**
- Retrieves configuration for selected academic level

---

## Mock Data (`lib/mockGradesData.ts`)

### Student Cohorts

**Primary School (5e) - 8 Students:**
1. Ahmed Benhamida
2. Fatima Saïdi
3. Mohamed Kadri
4. Leila Ferrah
5. Karim Bouassem
6. Noor Belgacem
7. Malik Zouaoui
8. Hana Bensaid

**Middle School (3e) - 6 Students:**
1. Amina Soudi
2. Samir Mansour
3. Yasmine Belhadj
4. Rayan Hadj
5. Zara Nedjah
6. Omar Boudaoud

### Data Characteristics

- **Term Progression**: Scores improve slightly by term (×1.0 for 1st, ×1.05 for 2nd, ×1.1 for 3rd)
- **Max Score Enforcement**: Scores capped at 20
- **Realistic Distribution**: Mix of excellent, good, and struggling students

---

## Usage Guide

### For Administrators/Setup

1. **Academic Level Selection**
   - Default: Primary School
   - Switch via button at top of page
   - Changes all subsequent data to match the selected level

2. **Navigation**
   - Use Term Tabs to switch between terms
   - Click term headers to expand/collapse
   - Select assessment type to view and edit specific grade categories

3. **Customizing Grading Rules**
   - Edit `lib/gradingConfigs.ts`
   - Modify coefficients for different academic levels
   - Update threshold values as needed
   - Changes apply immediately to all calculations

### For Teachers

1. **Getting Started**
   - Select your academic level (if not already set)
   - Click on a term to expand it
   - Choose an assessment type
   - Enter student grades directly in the table

2. **Entering Grades**
   - Click any score cell
   - Type the grade (0-20)
   - Press Enter or Tab to move to next cell
   - Average updates automatically
   - Remarks generate automatically

3. **Viewing Statistics**
   - Top section shows current term stats:
     - Class Average
     - Highest Score
     - Lowest Score
     - Evaluated Students Count

4. **Teacher Signature**
   - Add your signature or initials in the Signature column
   - Helps track who graded which students

---

## Key Features Explained

### Automatic Average Calculation

The module uses a **weighted average formula** that:
- Respects the coefficient of each assessment type
- Handles missing scores intelligently (recalculates denominator)
- Updates instantly as new scores are entered
- Rounds to 2 decimal places

**Example:**
```
Student: Ahmed Benhamida
- Class Assignments: 18 × 0.2 = 3.6
- Homework: 17 × 0.15 = 2.55
- Continuous Assessment: 16 × 0.25 = 4.0
- Final Exam: 15 × 0.4 = 6.0
─────────────────────────────
Average = 3.6 + 2.55 + 4.0 + 6.0 = 16.15 → 16.15/20
Remark: Very Good (Blue badge)
```

### Responsive Spreadsheet Interface

- **Desktop**: Full table with all columns visible
- **Tablet**: Horizontal scroll for assessment score columns
- **Mobile**: Sticky student name column, scroll scores horizontally

### Editable Cells with Validation

- Input accepts only numbers 0-20
- Invalid entries prevented
- Empty fields treated as "not yet graded"
- Graceful handling of partial data

---

## Customization Guide

### Adding a New Academic Level

1. Add to `types/grades.ts`:
```typescript
export type AcademicLevel = 'primary' | 'middle_school' | 'high_school';
```

2. Create config in `lib/gradingConfigs.ts`:
```typescript
export const highSchoolConfig: GradingConfig = {
  academicLevel: 'high_school',
  // ... configuration
};
```

3. Update `getGradingConfig()`:
```typescript
return academicLevel === 'primary' ? primarySchoolConfig : 
       academicLevel === 'middle_school' ? middleSchoolConfig :
       highSchoolConfig;
```

4. Add mock data in `lib/mockGradesData.ts`:
```typescript
const highSchoolStudents: GradeEntry[] = [/* ... */];

export const getMockGrades = (academicLevel: AcademicLevel, term: Term) => {
  const students = academicLevel === 'primary' ? primaryStudents :
                   academicLevel === 'middle_school' ? middleStudents :
                   highSchoolStudents;
  // ...
};
```

### Modifying Grading Coefficients

Edit the config object in `lib/gradingConfigs.ts`:

```typescript
export const primarySchoolConfig: GradingConfig = {
  // ... other settings
  classAssignmentsCoefficient: 0.25,      // Changed from 0.2
  homeworkCoefficient: 0.10,              // Changed from 0.15
  continuousAssessmentCoefficient: 0.25,
  finalExamCoefficient: 0.4,
  // ...
};
```

### Changing Remark Thresholds

Edit the threshold values:

```typescript
export const primarySchoolConfig: GradingConfig = {
  // ...
  excellentThreshold: 17,    // Changed from 18
  veryGoodThreshold: 15,     // Changed from 16
  goodThreshold: 13,         // Changed from 14
  fairThreshold: 11,         // Changed from 12
  passThreshold: 10,
  // ...
};
```

---

## Future Enhancement Roadmap

### Phase 2 - Backend Integration
- Save grades to database
- Retrieve real student data
- Persist teacher signatures
- Export grades to CSV/PDF

### Phase 3 - Advanced Features
- Bulk grade import
- Grade distribution analytics
- Trend analysis across terms
- Parent/Student view (read-only)
- Custom weightings per class

### Phase 4 - Admin Panel
- Manage grading scales per school
- Configure academic levels
- Student roster management
- Term calendar management
- Export analytics reports

---

## Troubleshooting

### Grades Not Calculating
- Ensure all required scores are entered (at least one score per student)
- Check that values are between 0-20
- Verify grading config coefficients sum to approximately 1.0

### Performance Issues
- For large classes (100+ students), consider pagination
- Currently optimized for classes of 10-40 students

### Data Loss
- Currently uses client-side state only
- Refresh page to reload mock data
- Backend integration will add persistence

---

## Technical Stack

- **Framework**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useCallback, useMemo)
- **Type Safety**: Full TypeScript coverage

---

## File Sizes & Performance

| File | Size | Purpose |
|------|------|---------|
| grades-module.tsx | ~4KB | Main orchestrator |
| grade-grid-table.tsx | ~8KB | Table rendering + calculations |
| collapsible-term-section.tsx | ~3KB | Term container |
| academic-level-selector.tsx | ~1KB | Level switcher |
| term-tabs.tsx | ~1KB | Term navigation |
| gradingConfigs.ts | ~3KB | Calculation logic |
| mockGradesData.ts | ~2KB | Demo data |
| **Total** | **~22KB** | All components minified |

---

## Notes for Teachers

- **Save Your Work**: Your grades are currently saved in browser memory. Refresh or close the page without proper save could lose unsaved data.
- **Browser Compatibility**: Works best on Chrome, Firefox, Safari (latest versions)
- **Keyboard Navigation**: Use Tab to move between cells, Enter to confirm
- **Mobile Entry**: The interface works on tablets but is optimized for desktop entry

---

## Support & Questions

For issues or feature requests, contact your school's IT administrator.
