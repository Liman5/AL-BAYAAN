import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ============================================================
// API — Paiements (Administration)
// GET  → liste des paiements élèves + enseignants depuis la DB
// POST → créer un paiement élève / enseignant + transaction
// Utilise la clé service_role (bypass RLS)
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

export const runtime = 'nodejs';

export async function GET() {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, message: 'Configuration Supabase manquante.' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Année scolaire la plus récente
    const { data: years } = await supabaseAdmin
      .from('academic_years')
      .select('id, name')
      .order('start_date', { ascending: false })
      .limit(1);
    const yearId = years?.[0]?.id;
    const yearName = years?.[0]?.name || '';

    // Paiements élèves
    const { data: studentPayments } = yearId
      ? await supabaseAdmin
          .from('student_payments')
          .select('*, students (id, matricule, users (first_name, last_name)), academic_years (id, name)')
          .eq('academic_year_id', yearId)
          .order('created_at', { ascending: false })
      : { data: [] };

    // Paiements enseignants
    const { data: teacherPayments } = yearId
      ? await supabaseAdmin
          .from('teacher_payments')
          .select('*, teacher_profiles (id, matricule, users (first_name, last_name)), academic_years (id, name)')
          .eq('academic_year_id', yearId)
          .order('created_at', { ascending: false })
      : { data: [] };

    // Transactions
    const { data: transactions } = await supabaseAdmin
      .from('payment_transactions')
      .select('*')
      .order('date', { ascending: false })
      .limit(100);

    return NextResponse.json({
      success: true,
      data: {
        yearId,
        yearName,
        studentPayments: studentPayments || [],
        teacherPayments: teacherPayments || [],
        transactions: transactions || [],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Erreur serveur.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, message: 'Configuration Supabase manquante.' }, { status: 500 });
    }

    const body = await request.json();
    const { action, studentId, teacherId, totalAmount, amount, method, reference, period, yearId } = body;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Résoudre l'année scolaire
    let activeYearId = yearId;
    if (!activeYearId) {
      const { data: years } = await supabaseAdmin
        .from('academic_years')
        .select('id')
        .order('start_date', { ascending: false })
        .limit(1);
      activeYearId = years?.[0]?.id;
    }
    if (!activeYearId) {
      return NextResponse.json({ success: false, message: 'Aucune année scolaire trouvée.' }, { status: 400 });
    }

    // Action : initialiser un paiement élève
    if (action === 'init_student' && studentId && totalAmount) {
      const { data: existing } = await supabaseAdmin
        .from('student_payments')
        .select('id')
        .eq('student_id', studentId)
        .eq('academic_year_id', activeYearId)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ success: false, message: 'Ce paiement existe déjà pour cet élève cette année.' }, { status: 409 });
      }

      const { data: inserted, error } = await supabaseAdmin
        .from('student_payments')
        .insert({
          id: `sp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          total_amount: totalAmount,
          paid_amount: 0,
          status: 'unpaid',
          student_id: studentId,
          academic_year_id: activeYearId,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data: inserted });
    }

    // Action : enregistrer un paiement élève
    if (action === 'pay_student' && studentId && amount) {
      const { data: payment } = await supabaseAdmin
        .from('student_payments')
        .select('*')
        .eq('student_id', studentId)
        .eq('academic_year_id', activeYearId)
        .maybeSingle();

      if (!payment) {
        return NextResponse.json({ success: false, message: 'Paiement élève introuvable. Initialisez d\'abord.' }, { status: 404 });
      }

      const newPaid = (payment.paid_amount || 0) + amount;
      const newStatus = newPaid >= payment.total_amount ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid';

      const { error: updateError } = await supabaseAdmin
        .from('student_payments')
        .update({ paid_amount: newPaid, status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', payment.id);

      if (updateError) {
        return NextResponse.json({ success: false, message: updateError.message }, { status: 400 });
      }

      // Créer la transaction
      const { error: txError } = await supabaseAdmin
        .from('payment_transactions')
        .insert({
          id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          amount,
          date: new Date().toISOString(),
          reference: reference || `REF-${Date.now()}`,
          method: method || 'cash',
          student_payment_id: payment.id,
        });

      if (txError) {
        return NextResponse.json({ success: false, message: txError.message }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    // Action : initialiser un paiement enseignant
    if (action === 'init_teacher' && teacherId && totalAmount) {
      const { data: existing } = await supabaseAdmin
        .from('teacher_payments')
        .select('id')
        .eq('teacher_id', teacherId)
        .eq('academic_year_id', activeYearId)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ success: false, message: 'Ce paiement existe déjà pour cet enseignant.' }, { status: 409 });
      }

      const { data: inserted, error } = await supabaseAdmin
        .from('teacher_payments')
        .insert({
          id: `tp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          expected_salary: totalAmount,
          paid_amount: 0,
          status: 'unpaid',
          teacher_id: teacherId,
          academic_year_id: activeYearId,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data: inserted });
    }

    // Action : verser un salaire enseignant
    if (action === 'pay_teacher' && teacherId && amount) {
      const { data: payment } = await supabaseAdmin
        .from('teacher_payments')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('academic_year_id', activeYearId)
        .maybeSingle();

      if (!payment) {
        return NextResponse.json({ success: false, message: 'Paiement enseignant introuvable. Initialisez d\'abord.' }, { status: 404 });
      }

      const newPaid = (payment.paid_amount || 0) + amount;
      const newStatus = newPaid >= payment.expected_salary ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid';

      const { error: updateError } = await supabaseAdmin
        .from('teacher_payments')
        .update({ paid_amount: newPaid, status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', payment.id);

      if (updateError) {
        return NextResponse.json({ success: false, message: updateError.message }, { status: 400 });
      }

      const { error: txError } = await supabaseAdmin
        .from('payment_transactions')
        .insert({
          id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          amount,
          date: new Date().toISOString(),
          reference: reference || `REF-${Date.now()}`,
          method: method || 'cash',
          period: period || null,
          teacher_payment_id: payment.id,
        });

      if (txError) {
        return NextResponse.json({ success: false, message: txError.message }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: 'Action inconnue.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Erreur serveur.' }, { status: 500 });
  }
}