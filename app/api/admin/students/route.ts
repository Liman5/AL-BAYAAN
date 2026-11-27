import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ============================================================
// API — Gestion des élèves pour l'admin
// GET   → Liste des élèves avec enrollments
// POST  → Ajouter un nouvel élève (génération matricule auto)
// PATCH → Modifier les informations d'un élève
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

export const runtime = 'nodejs';

function getSupabaseAdmin() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET() {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: 'Configuration Supabase manquante.' },
        { status: 500 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from('students')
      .select(`
        id,
        matricule,
        date_of_birth,
        gender,
        status,
        registration_date,
        address,
        parent_id,
        user_id,
        users (id, email, first_name, last_name, phone),
        student_enrollments (
          id,
          class_id,
          academic_year_id,
          status,
          enrollment_date,
          classes (id, name, level, academic_years (id, name))
        )
      `)
      .order('matricule');

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    // Charger les parents manuellement (plus fiable que la jointure FK)
    const studentsWithParents = await Promise.all(
      (data || []).map(async (s: any) => {
        let parent = null;
        if (s.parent_id) {
          const { data: parentData } = await supabaseAdmin
            .from('parents')
            .select('*')
            .eq('id', s.parent_id)
            .maybeSingle();
          parent = parentData;
        }
        if (!parent && s.users?.email) {
          // Fallback : chercher un parent avec le même email
          const { data: parentByEmail } = await supabaseAdmin
            .from('parents')
            .select('*')
            .eq('email', s.users.email)
            .maybeSingle();
          if (parentByEmail) {
            parent = parentByEmail;
          }
        }
        return { ...s, parents: parent };
      })
    );

    return NextResponse.json({ success: true, data: studentsWithParents });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Erreur serveur.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: 'Configuration Supabase manquante.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, classId, parentName, parentPhone, parentEmail, dateOfBirth, address, status } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { success: false, message: 'Prénom et nom sont requis.' },
        { status: 400 }
      );
    }

    // Créer un mot de passe par défaut (l'élève pourra le changer via le reset)
    const defaultPassword = 'al-bayaan2026';
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Générer une matricule séquentielle (ALB-2026-0001, ALB-2026-0002, ...)
    const year = new Date().getFullYear();
    const prefix = `ALB-${year}-`;
    const { data: existingStudents } = await supabaseAdmin
      .from('students')
      .select('matricule')
      .ilike('matricule', `${prefix}%`)
      .order('matricule', { ascending: false });

    let nextNumber = 1;
    if (existingStudents && existingStudents.length > 0) {
      const usedNumbers = new Set<number>();
      for (const s of existingStudents) {
        const match = s.matricule?.match(/ALB-\d{4}-(\d+)$/);
        if (match) usedNumbers.add(parseInt(match[1], 10));
      }
      while (usedNumbers.has(nextNumber)) nextNumber++;
    }
    const matricule = `${prefix}${String(nextNumber).padStart(4, '0')}`;

    // 2. Créer l'utilisateur Supabase Auth
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email || `${matricule.toLowerCase()}@al-bayaan.local`,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName },
    });

    if (createError) {
      // Si l'email existe déjà, essayer de trouver l'utilisateur existant
      if (email) {
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', email)
          .maybeSingle();
        if (existingUser) {
          // ⚠️ Vérifier si l'utilisateur a DÉJÀ un profil étudiant
          const { data: existingStudentProfile } = await supabaseAdmin
            .from('students')
            .select('id, matricule')
            .eq('user_id', existingUser.id)
            .maybeSingle();

          if (existingStudentProfile) {
            return NextResponse.json(
              { success: false, message: `Ce compte est déjà associé à un élève (Matricule: ${existingStudentProfile.matricule}). Utilisez le bouton Modifier pour mettre à jour ses informations.` },
              { status: 409 }
            );
          }

          // Insérer le profil étudiant pour l'utilisateur existant
          const studentId = `student-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const { error: profileError } = await supabaseAdmin.from('students').insert({
            id: studentId,
            matricule,
            status: status || 'active',
            registration_date: new Date().toISOString(),
            address: address || null,
            date_of_birth: dateOfBirth || null,
            user_id: existingUser.id,
          });

          if (profileError) {
            return NextResponse.json(
              { success: false, message: `Erreur profil: ${profileError.message}` },
              { status: 400 }
            );
          }

          // Inscrire dans la classe si fournie
          if (classId) {
            const { data: yearData } = await supabaseAdmin
              .from('academic_years')
              .select('id')
              .order('start_date', { ascending: false })
              .limit(1)
              .maybeSingle();
            if (yearData) {
              await supabaseAdmin.from('student_enrollments').insert({
                id: `enr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                student_id: studentId,
                class_id: classId,
                academic_year_id: yearData.id,
                enrollment_date: new Date().toISOString(),
                status: 'active',
              });
            }
          }

          return NextResponse.json({ success: true, data: { id: studentId, matricule } });
        }
      }
      return NextResponse.json(
        { success: false, message: createError.message },
        { status: 400 }
      );
    }

    const userId = userData.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Impossible de créer le compte.' },
        { status: 500 }
      );
    }

    // 3. Insérer dans la table users
    const { error: usersError } = await supabaseAdmin.from('users').insert({
      id: userId,
      email: email || `${matricule.toLowerCase()}@al-bayaan.local`,
      password_hash: 'supabase-auth',
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      status: status || 'active',
    });

    if (usersError) {
      return NextResponse.json(
        { success: false, message: `Erreur users: ${usersError.message}` },
        { status: 400 }
      );
    }

    // 4. Insérer dans la table students
    const studentId = `student-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const { error: studentError } = await supabaseAdmin.from('students').insert({
      id: studentId,
      matricule,
      status: status || 'active',
      registration_date: new Date().toISOString(),
      address: address || null,
      date_of_birth: dateOfBirth || null,
      user_id: userId,
    });

    if (studentError) {
      return NextResponse.json(
        { success: false, message: `Erreur student: ${studentError.message}` },
        { status: 400 }
      );
    }

    // 5. Créer/associer le parent (obligatoire — infos enregistrées sur la fiche élève)
    const newParentId = `parent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    let parentId: string | null = null;
    if (parentEmail) {
      const { data: parentUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', parentEmail)
        .maybeSingle();
      if (parentUser) {
        const { data: existingParent } = await supabaseAdmin
          .from('parents')
          .select('id')
          .eq('user_id', parentUser.id)
          .maybeSingle();
        parentId = existingParent?.id || null;
      }
    }
    if (!parentId) {
      // Chercher un parent existant par email
      let parentId: string | null = null;
      if (parentEmail) {
        const { data: parentUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', parentEmail)
          .maybeSingle();
        if (parentUser) {
          const { data: existingParent } = await supabaseAdmin
            .from('parents')
            .select('id')
            .eq('user_id', parentUser.id)
            .maybeSingle();
          parentId = existingParent?.id || null;
        }
      }

      if (!parentId) {
        // Créer le parent
        // - Si un email parent est fourni → créer aussi un compte utilisateur parent
        // - Sinon → enregistrer UNIQUEMENT les infos dans la table parents (sans compte)
        let parentUserId: string | null = null;

        if (parentEmail) {
          // Vérifier si un compte parent avec cet email existe déjà
          const { data: existingUserByEmail } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', parentEmail)
            .maybeSingle();

          if (existingUserByEmail) {
            parentUserId = existingUserByEmail.id;
          } else {
            // Créer un compte utilisateur parent
            const { data: newParentUser, error: parentUserError } = await supabaseAdmin.auth.admin.createUser({
              email: parentEmail,
              password: 'parent2026',
              email_confirm: true,
              user_metadata: { first_name: parentName || 'Parent', last_name: lastName },
            });
            if (!parentUserError && newParentUser.user?.id) {
              parentUserId = newParentUser.user.id;
              await supabaseAdmin.from('users').insert({
                id: parentUserId,
                email: parentEmail,
                password_hash: 'supabase-auth',
                first_name: parentName || 'Parent',
                last_name: lastName,
                status: 'active',
              });
            }
          }
        }

        const parentPayload: any = {
          id: newParentId,
          full_name: parentName || `${lastName} (Parent)`,
          phone: parentPhone || null,
          email: parentEmail || null,
        };
        // user_id est nullable après la migration 26
        if (parentUserId) parentPayload.user_id = parentUserId;

        const { error: parentError } = await supabaseAdmin.from('parents').insert(parentPayload);

        if (!parentError) {
          parentId = newParentId;
        }
      }

      // Associer le parent à l'élève
      if (parentId) {
        await supabaseAdmin.from('students').update({ parent_id: parentId }).eq('id', studentId);
      }
    }

    // 6. Inscrire dans la classe si fournie
    if (classId) {
      const { data: yearData } = await supabaseAdmin
        .from('academic_years')
        .select('id')
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (yearData) {
        await supabaseAdmin.from('student_enrollments').insert({
          id: `enr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          student_id: studentId,
          class_id: classId,
          academic_year_id: yearData.id,
          enrollment_date: new Date().toISOString(),
          status: 'active',
        });
      }
    }

    return NextResponse.json({ success: true, data: { id: studentId, matricule } });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Erreur serveur.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: 'Configuration Supabase manquante.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { id, firstName, lastName, email, phone, classId, parentName, parentPhone, parentEmail, dateOfBirth, address, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID élève requis.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Trouver l'élève existant
    const { data: student, error: findError } = await supabaseAdmin
      .from('students')
      .select('*, users (id, email, first_name, last_name)')
      .eq('id', id)
      .maybeSingle();

    if (findError || !student) {
      return NextResponse.json(
        { success: false, message: findError?.message || 'Élève introuvable.' },
        { status: 404 }
      );
    }

    // 2. Mettre à jour infos utilisateur
    if (email || firstName || lastName || phone) {
      const updateData: any = {};
      if (email && email !== student.users?.email) updateData.email = email;
      if (firstName) updateData.first_name = firstName;
      if (lastName) updateData.last_name = lastName;
      if (phone !== undefined) updateData.phone = phone;

      if (Object.keys(updateData).length > 0 && student.user_id) {
        await supabaseAdmin.from('users').update(updateData).eq('id', student.user_id);
        // Aussi mettre à jour l'email dans Supabase Auth
        if (updateData.email) {
          await supabaseAdmin.auth.admin.updateUserById(student.user_id, { email: updateData.email });
        }
      }
    }

    // 3. Mettre à jour infos étudiant
    const studentUpdate: any = {};
    if (dateOfBirth !== undefined) studentUpdate.date_of_birth = dateOfBirth || null;
    if (address !== undefined) studentUpdate.address = address;
    if (status !== undefined) studentUpdate.status = status;

    if (Object.keys(studentUpdate).length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('students')
        .update(studentUpdate)
        .eq('id', id);
      if (updateError) {
        return NextResponse.json(
          { success: false, message: `Erreur élève: ${updateError.message}` },
          { status: 400 }
        );
      }
    }

    // 4. Mettre à jour la classe (student_enrollments)
    if (classId) {
      const { data: yearData } = await supabaseAdmin
        .from('academic_years')
        .select('id')
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (yearData) {
        // Vérifier si l'élève est déjà inscrit dans une classe pour cette année
        const { data: existingEnrollment } = await supabaseAdmin
          .from('student_enrollments')
          .select('*')
          .eq('student_id', id)
          .eq('academic_year_id', yearData.id)
          .maybeSingle();

        if (existingEnrollment) {
          // Mettre à jour la classe existante
          await supabaseAdmin
            .from('student_enrollments')
            .update({ class_id: classId, status: 'active' })
            .eq('id', existingEnrollment.id);
        } else {
          // Créer une nouvelle inscription
          await supabaseAdmin.from('student_enrollments').insert({
            id: `enr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            student_id: id,
            class_id: classId,
            academic_year_id: yearData.id,
            enrollment_date: new Date().toISOString(),
            status: 'active',
          });
        }
      }
    }

    // 5. Mettre à jour le parent (obligatoire — infos sur la fiche élève)
    if (parentName || parentPhone || parentEmail) {
      if (student.parent_id) {
        const parentUpdate: any = {};
        if (parentName) parentUpdate.full_name = parentName;
        if (parentPhone !== undefined) parentUpdate.phone = parentPhone;
        if (parentEmail !== undefined) parentUpdate.email = parentEmail;
        await supabaseAdmin.from('parents').update(parentUpdate).eq('id', student.parent_id);
      } else {
        // Si un email parent est fourni, vérifier si un compte utilisateur parent existe déjà
        let parentUserId: string | null = null;
        if (parentEmail) {
          const { data: existingParentUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', parentEmail)
            .maybeSingle();
          if (existingParentUser) {
            // Vérifier si ce user a déjà un profil parent
            const { data: existingParentProfile } = await supabaseAdmin
              .from('parents')
              .select('id')
              .eq('user_id', existingParentUser.id)
              .maybeSingle();
            if (existingParentProfile) {
              // Réutiliser ce parent existant
              await supabaseAdmin.from('students').update({ parent_id: existingParentProfile.id }).eq('id', id);
              return NextResponse.json({ success: true });
            }
            parentUserId = existingParentUser.id;
          }
        }

        // Créer un nouveau parent (avec compte si email fourni, sinon sans compte)
        const newParentId = `parent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const parentPayload: any = {
          id: newParentId,
          full_name: parentName || `${lastName || ''} (Parent)`,
          phone: parentPhone || null,
          email: parentEmail || null,
        };
        // user_id est nullable après la migration 26
        if (parentUserId) parentPayload.user_id = parentUserId;

        const { error: parentError } = await supabaseAdmin.from('parents').insert(parentPayload);
        if (!parentError) {
          await supabaseAdmin.from('students').update({ parent_id: newParentId }).eq('id', id);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Erreur serveur.' },
      { status: 500 }
    );
  }
}