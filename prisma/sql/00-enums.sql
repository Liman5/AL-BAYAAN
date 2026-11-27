-- ============================================================
-- AL-BAYAAN — 00. Énumérations
-- ============================================================

CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE student_status AS ENUM ('pending', 'active', 'transferred', 'graduated', 'inactive');
CREATE TYPE teacher_status AS ENUM ('pending', 'active', 'on_leave', 'inactive');
CREATE TYPE admin_level AS ENUM ('super_admin', 'school_admin');
CREATE TYPE class_level AS ENUM ('primary', 'middle_school', 'high_school');
CREATE TYPE academic_year_status AS ENUM ('previous', 'current', 'upcoming');
CREATE TYPE term AS ENUM ('first', 'second', 'third');
CREATE TYPE assessment_type AS ENUM ('class_assignments', 'homework', 'continuous_assessment', 'final_exam');
CREATE TYPE grade_type AS ENUM ('devoir', 'interrogation', 'examen');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
CREATE TYPE payment_status AS ENUM ('paid', 'partial', 'unpaid', 'pending');
CREATE TYPE payment_method AS ENUM ('cash', 'check', 'transfer', 'card');
CREATE TYPE homework_status AS ENUM ('draft', 'published', 'closed');
CREATE TYPE announcement_audience AS ENUM ('admin', 'teacher', 'student', 'parent', 'class');