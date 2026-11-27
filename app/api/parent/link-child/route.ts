import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, message: 'Configuration Supabase manquante.' }, { status: 500 });
    }

    const body = await request.json();
    const { parentId, matricule } = body;

    if (!parentId || !matricule) {
      return NextResponse.json({ success: false, message: 'parentId et matricule sont requis.' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Vérifier que le parent existe
    const { data: parent } = await supabaseAdmin
      .from('parents')
      .select('*')
      .eq('id', parentId)
      .maybeSingle();

    if (!parent) {
      return NextResponse.json({ success: false, message: 'Parent introuvable.' }, { status: 404 });
    }

    // 2. Trouver eleve par matricule
    const { data: student } = await supabaseAdmin
      .from('students')
      .select('id, matricule, parent_id')
      .eq('matricule', matricule)
      .maybeSingle();

    if (!student) {
      return NextResponse.json({ success: false, message: 'Aucun eleve trouve avec ce matricule.' }, { status: 404 });
    }

    // 3. Associer l'eleve au parent
    const { error: updateError } = await supabaseAdmin
      .from('students')
      .update({ parent_id: parent.id })
      .eq('id', student.id);

    if (updateError) {
      return NextResponse.json({ success: false, message: 'Erreur association: ' + updateError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Eleve ' + student.matricule + ' associe avec succes au parent !',
      data: { studentId: student.id, matricule: student.matricule },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Erreur serveur.' }, { status: 500 });
  }
}
