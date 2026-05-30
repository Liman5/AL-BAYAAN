# Grades Module - Architecture & Data Flow

## Component Hierarchy

```
GradesPage (app/teacher/grades/page.tsx)
├── AppHeader (existing)
├── GradesModule (main orchestrator)
│   ├── AcademicLevelSelector
│   │   └── Button Group (Primary/Middle School)
│   ├── Info Card (School/Class/Subject)
│   ├── TermTabs
│   │   └── Tab Group (First/Second/Third)
│   ├── CollapsibleTermSection × 3 (one per term)
│   │   ├── Expandable Header
│   │   ├── AssessmentTypeSelector
│   │   │   └── Button Group (4 types)
│   │   └── GradeGridTable
│   │       ├── Statistics Cards (4)
│   │       ├── Table Header
│   │       ├── Table Body (rows per student)
│   │       └── Summary Footer
│   └── Info Footer
└── Navigation Bar (existing)
```

---

## State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    GradesModule State                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  academicLevel: 'primary' | 'middle_school'                │
│      ↓                                                      │
│  Triggers: getMockGrades(academicLevel, term)              │
│      ↓                                                      │
│  termGrades: {                                             │
│    first: [GradeEntry[], ...],                            │
│    second: [GradeEntry[], ...],                           │
│    third: [GradeEntry[], ...]                             │
│  }                                                          │
│      ↓                                                      │
│  selectedTerm: 'first' | 'second' | 'third'              │
│      ↓                                                      │
│  gradingConfig = getGradingConfig(academicLevel)          │
│      ↓                                                      │
│  Passes to CollapsibleTermSection (for selectedTerm)      │
│                                                             │
│  selectedAssessmentType: AssessmentType | null            │
│      ↓                                                      │
│  Passes to GradeGridTable                                  │
│                                                             │
│  expandedTerms: Set<Term>                                 │
│      ↓                                                      │
│  Controls which terms show their content                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│ Teacher Interaction                                              │
└────────────┬─────────────────────────────────────────────────────┘
             │
             ├─→ Click Academic Level Selector
             │   └─→ handleLevelChange()
             │       └─→ Reload termGrades with new level
             │
             ├─→ Click Term Tab
             │   └─→ handleTermChange()
             │       └─→ setSelectedTerm(term)
             │       └─→ Auto-expand term
             │
             ├─→ Click Expand/Collapse Term Header
             │   └─→ toggleTermExpanded(term)
             │
             ├─→ Click Assessment Type Selector
             │   └─→ setSelectedAssessmentType(type)
             │
             └─→ Edit Grade Cell
                 └─→ updateGrade(studentId, field, value)
                     ├─→ Validate input (0-20)
                     ├─→ Update termGrades[selectedTerm]
                     ├─→ Calculate new average
                     ├─→ Assign new remark
                     ├─→ Re-render table
                     └─→ Update statistics
```

---

## Grade Calculation Pipeline

```
User enters grade in input field
         ↓
Input validation (0-20 range)
         ↓
State update: termGrades[term][studentIndex][field] = value
         ↓
calculateAverage(classAssignments, homework, continuousAssessment, finalExam, config)
         ↓
Apply weights:
├─ classAssignments × 0.2
├─ homework × 0.15
├─ continuousAssessment × 0.25
└─ finalExam × 0.4
         ↓
Sum weighted scores
         ↓
Calculate total coefficient (sum of non-null coefficients)
         ↓
average = total / coefficient
         ↓
Round to 2 decimal places
         ↓
Store in: termGrades[term][studentIndex].average
         ↓
getTeacherRemark(average, config)
         ↓
Compare average to thresholds:
├─ If ≥ 18 → 'Excellent'
├─ If ≥ 16 → 'Very Good'
├─ If ≥ 14 → 'Good'
├─ If ≥ 12 → 'Fair'
├─ If ≥ 10 → 'Pass'
└─ Else   → 'Fail'
         ↓
Store in: termGrades[term][studentIndex].remark
         ↓
Re-render GradeGridTable with updated values
         ↓
Display updated average in numeric form
         ↓
Display updated remark with color badge
```

---

## Configuration Selection Logic

```
Academic Level Selection
         │
         ├─→ If 'primary'
         │   └─→ getGradingConfig('primary')
         │       └─→ Return primarySchoolConfig {
         │           classAssignmentsCoefficient: 0.2,
         │           homeworkCoefficient: 0.15,
         │           continuousAssessmentCoefficient: 0.25,
         │           finalExamCoefficient: 0.4,
         │           excellentThreshold: 18,
         │           veryGoodThreshold: 16,
         │           goodThreshold: 14,
         │           fairThreshold: 12,
         │           passThreshold: 10,
         │           ...
         │         }
         │
         └─→ If 'middle_school'
             └─→ getGradingConfig('middle_school')
                 └─→ Return middleSchoolConfig {
                     ... (same structure, could be customized)
                   }
```

---

## Type Dependencies

```
GradeEntry (main data structure)
├─ studentId: string
├─ studentName: string
├─ classAssignments: number | null
├─ homework: number | null
├─ continuousAssessment: number | null
├─ finalExam: number | null
├─ coefficient?: number
├─ average?: number (CALCULATED)
├─ remark?: TeacherRemark (AUTO-GENERATED)
├─ teacherSignature?: string
└─ teacherComments?: string

GradingConfig (configuration structure)
├─ academicLevel: AcademicLevel
├─ schoolName: string
├─ subject: string
├─ className: string
├─ classAssignmentsCoefficient: number
├─ homeworkCoefficient: number
├─ continuousAssessmentCoefficient: number
├─ finalExamCoefficient: number
├─ maxScore: number
├─ passingScore: number
├─ excellentThreshold: number
├─ veryGoodThreshold: number
├─ goodThreshold: number
├─ fairThreshold: number
└─ passThreshold: number
```

---

## Data Storage Structure

```
GradesModule Component State:

termGrades: {
  first: [
    GradeEntry {
      studentId: '1',
      studentName: 'Ahmed Benhamida',
      classAssignments: 18,
      homework: 17,
      continuousAssessment: 16,
      finalExam: 15,
      average: 16.15,
      remark: 'Very Good',
      teacherSignature: ''
    },
    GradeEntry { ... },
    ... (more students)
  ],
  second: [
    GradeEntry { ... },
    ... (more students)
  ],
  third: [
    GradeEntry { ... },
    ... (more students)
  ]
}
```

---

## Component Props Flow

```
GradesModule
    │
    ├─→ AcademicLevelSelector
    │   Props: { academicLevel, onLevelChange }
    │
    ├─→ TermTabs
    │   Props: { selectedTerm, onTermChange }
    │
    └─→ CollapsibleTermSection (× 3, one per term)
        Props: {
          termLabel,
          assessmentTypes,
          selectedAssessmentType,
          onAssessmentTypeSelect,
          grades: termGrades[term],
          onGradesChange: handleGradesChange,
          gradingConfig,
          isExpanded: expandedTerms.has(term),
          onToggleExpand
        }
        │
        └─→ GradeGridTable
            Props: {
              grades,
              onGradesChange,
              gradingConfig,
              assessmentType
            }
```

---

## Event Handling Chain

```
UI Event → Handler Function → State Update → Component Re-render → UI Update

Example: Grade Cell Edit

1. User clicks input cell
2. onChange event fires
3. updateGrade(studentId, field, value) called
4. State updates: termGrades[selectedTerm][index][field] = value
5. calculateAverage() recalculates
6. getTeacherRemark() generates remark
7. Component re-renders
8. New values displayed in cells
9. Statistics recalculate
10. New stats displayed
```

---

## Calculation Pipeline Visualization

```
Input: All four score types per student

┌─────────────────────────────────────────┐
│  Raw Scores                             │
│  ┌────────┬────────┬─────────┬─────┐   │
│  │ Class  │ Home   │Continuous│Final│   │
│  │ 18     │ 17     │ 16      │ 15  │   │
│  └────────┴────────┴─────────┴─────┘   │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  Apply Coefficients                     │
│  ┌────────┬────────┬─────────┬─────┐   │
│  │ 18×0.2 │ 17×0.15│ 16×0.25 │ 15×0.4  │
│  │ = 3.6  │ = 2.55 │ = 4.0   │ = 6.0   │
│  └────────┴────────┴─────────┴─────┘   │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  Sum Results                            │
│  3.6 + 2.55 + 4.0 + 6.0 = 16.15        │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  Final Average                          │
│  16.15 ÷ 1.0 = 16.15 / 20              │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  Assign Remark                          │
│  16.15 ≥ 16 → "Very Good" (Blue)       │
└─────────────────────────────────────────┘
```

---

## Performance Optimization

```
Component              Optimization Strategy
─────────────────────────────────────────────
GradesModule           • useState for term/level state
                       • useMemo for gradingConfig
                       • useCallback for handlers

GradeGridTable         • useMemo for statistics
                       • useCallback for updateGrade
                       • Table cell optimization

CollapsibleTermSection • Props memoization friendly
                       • Minimal re-renders

TermTabs               • Button states managed by parent
                       • Minimal re-renders

AcademicLevelSelector  • Button states managed by parent
                       • Minimal re-renders

Calculation Functions  • Pure functions (no side effects)
                       • Can be memoized
```

---

## Error Handling Flow

```
User Input
    ↓
Input Validation
├─ Check if value is number
├─ Check if value is in range 0-20
└─ If invalid → reject input, show feedback
    ↓
Process Valid Input
├─ Update state
├─ Calculate average
├─ Assign remark
└─ Re-render
    ↓
Display Result
└─ Show updated grades
```

---

## Extensibility Points

```
To Add Features:

1. New Academic Level
   └─ Edit gradingConfigs.ts
      └─ Add new config object
      └─ Update getGradingConfig()
      └─ Add mock data
      └─ Update getMockGrades()
      └─ UI updates automatically

2. New Assessment Type
   └─ Edit grades.ts
      └─ Add to AssessmentType type
      └─ Update assessmentTypes array in grades-module.tsx
      └─ UI updates automatically

3. Different Coefficients per Class
   └─ Modify gradingConfig to include classId
      └─ Load config based on classId
      └─ Pass to calculations

4. Backend Integration
   └─ Replace getMockGrades() with API call
      └─ Replace handleGradesChange with save API call
      └─ Add error handling for API

5. Export/Import
   └─ Add export function
      └─ Add import function
      └─ Validate imported data
      └─ Merge with existing
```

---

## Testing Points

```
Unit Tests:
├─ calculateAverage() → returns correct average
├─ getTeacherRemark() → returns correct remark
├─ Threshold comparisons → correct assignments
└─ Input validation → rejects invalid values

Integration Tests:
├─ Grade entry workflow
├─ Academic level switching
├─ Term switching
├─ Assessment type selection
├─ Statistics calculation
└─ Remark color assignment

E2E Tests:
├─ Full grade entry workflow
├─ Multi-student, multi-term scenario
├─ Data persistence check
└─ Responsive design on devices
```

---

## Database Schema (Future Backend)

```sql
-- grades table
CREATE TABLE grades (
  id UUID PRIMARY KEY,
  teacher_id UUID REFERENCES teachers(id),
  class_id UUID REFERENCES classes(id),
  subject_id UUID REFERENCES subjects(id),
  academic_level ENUM('primary', 'middle_school'),
  term ENUM('first', 'second', 'third'),
  assessment_type ENUM('class_assignments', 'homework', 'continuous_assessment', 'final_exam'),
  
  student_id UUID REFERENCES students(id),
  class_assignments FLOAT,
  homework FLOAT,
  continuous_assessment FLOAT,
  final_exam FLOAT,
  average FLOAT COMPUTED,
  remark VARCHAR(20),
  teacher_signature TEXT,
  teacher_comments TEXT,
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  UNIQUE(teacher_id, class_id, student_id, term, assessment_type)
);

-- grading_configs table
CREATE TABLE grading_configs (
  id UUID PRIMARY KEY,
  school_id UUID REFERENCES schools(id),
  academic_level ENUM('primary', 'middle_school'),
  
  class_assignments_coefficient FLOAT,
  homework_coefficient FLOAT,
  continuous_assessment_coefficient FLOAT,
  final_exam_coefficient FLOAT,
  
  excellent_threshold FLOAT,
  very_good_threshold FLOAT,
  good_threshold FLOAT,
  fair_threshold FLOAT,
  pass_threshold FLOAT,
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## Summary

The Grades Module architecture follows these principles:

✅ **Separation of Concerns** - Each component has single responsibility
✅ **Type Safety** - Full TypeScript coverage
✅ **Reusability** - Components can be reused in other contexts
✅ **Scalability** - Easy to add new features
✅ **Performance** - Optimized calculations and renders
✅ **Maintainability** - Clear code structure and documentation
✅ **Testability** - Pure functions, clear data flow

This foundation makes it easy to extend with backend integration, analytics, and additional features.
