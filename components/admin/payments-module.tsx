'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, UserPlus, CreditCard, Save, Loader2 } from 'lucide-react';
import { getCurrentAcademicYear } from '@/lib/schoolData';
import { fetchAdminPayments, saveAdminPayment } from '@/services/db.service';

interface PaymentsModuleProps {
  studentNames: Array<{ id: string; name: string; matricule: string; className: string }>;
  teacherNames: Array<{ id: string; name: string }>;
}

export default function PaymentsModule({ studentNames, teacherNames }: PaymentsModuleProps) {
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');
  const academicYear = getCurrentAcademicYear();
  const [loading, setLoading] = useState(true);

  // États des paiements élèves — chargés depuis la BASE via l'API
  const [studentPayments, setStudentPayments] = useState<any[]>([]);
  const [studentPaymentForm, setStudentPaymentForm] = useState({ studentId: '', amount: '', method: 'cash', reference: '' });

  // États des paiements enseignants — depuis la BASE
  const [teacherPayments, setTeacherPayments] = useState<any[]>([]);
  const [teacherPaymentForm, setTeacherPaymentForm] = useState({ teacherId: '', amount: '', method: 'transfer', reference: '', period: '' });

  // Charger les paiements réels depuis Supabase (via route API service_role)
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAdminPayments();
        const students = (data.studentPayments || []).map((sp: any) => ({
          id: sp.id,
          studentId: sp.student_id,
          studentName: `${sp.students?.users?.first_name || ''} ${sp.students?.users?.last_name || ''}`.trim() || sp.students?.matricule || 'Élève',
          matricule: sp.students?.matricule || '',
          className: '',
          totalAmount: sp.total_amount || 0,
          paidAmount: sp.paid_amount || 0,
          status: sp.status || 'unpaid',
        }));
        const teachers = (data.teacherPayments || []).map((tp: any) => ({
          id: tp.id,
          teacherId: tp.teacher_id,
          teacherName: `${tp.teacher_profiles?.users?.first_name || ''} ${tp.teacher_profiles?.users?.last_name || ''}`.trim() || 'Enseignant',
          expectedSalary: tp.expected_salary || 0,
          paidAmount: tp.paid_amount || 0,
          status: tp.status || 'unpaid',
        }));
        setStudentPayments(students);
        setTeacherPayments(teachers);
      } catch (e) {
        console.error('Erreur chargement paiements:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Statistiques calculées sur les données de la base
  const studentStats = {
    totalExpected: studentPayments.reduce((a: number, p: any) => a + p.totalAmount, 0),
    totalCollected: studentPayments.reduce((a: number, p: any) => a + p.paidAmount, 0),
    totalRemaining: studentPayments.reduce((a: number, p: any) => a + (p.totalAmount - p.paidAmount), 0),
    fullyPaid: studentPayments.filter((p: any) => p.status === 'paid').length,
    partiallyPaid: studentPayments.filter((p: any) => p.status === 'partial').length,
    unpaid: studentPayments.filter((p: any) => p.status === 'unpaid').length,
  };
  const teacherStats = {
    totalExpected: teacherPayments.reduce((a: number, p: any) => a + p.expectedSalary, 0),
    totalPaid: teacherPayments.reduce((a: number, p: any) => a + p.paidAmount, 0),
    totalRemaining: teacherPayments.reduce((a: number, p: any) => a + (p.expectedSalary - p.paidAmount), 0),
    paid: teacherPayments.filter((p: any) => p.status === 'paid').length,
    totalTeachers: teacherPayments.length,
  };

  // Recharger les paiements depuis la base
  async function reloadPayments() {
    try {
      const data = await fetchAdminPayments();
      const students = (data.studentPayments || []).map((sp: any) => ({
        id: sp.id,
        studentId: sp.student_id,
        studentName: `${sp.students?.users?.first_name || ''} ${sp.students?.users?.last_name || ''}`.trim() || sp.students?.matricule || 'Élève',
        matricule: sp.students?.matricule || '',
        className: '',
        totalAmount: sp.total_amount || 0,
        paidAmount: sp.paid_amount || 0,
        status: sp.status || 'unpaid',
      }));
      const teachers = (data.teacherPayments || []).map((tp: any) => ({
        id: tp.id,
        teacherId: tp.teacher_id,
        teacherName: `${tp.teacher_profiles?.users?.first_name || ''} ${tp.teacher_profiles?.users?.last_name || ''}`.trim() || 'Enseignant',
        expectedSalary: tp.expected_salary || 0,
        paidAmount: tp.paid_amount || 0,
        status: tp.status || 'unpaid',
      }));
      setStudentPayments(students);
      setTeacherPayments(teachers);
    } catch (e) {
      console.error('Erreur rechargement paiements:', e);
    }
  }

  // Créer un dossier de paiement élève dans la base
  async function handleInitializeStudentPayment(e: React.FormEvent) {
    e.preventDefault();
    const student = studentNames.find((s) => s.id === studentPaymentForm.studentId);
    if (!student) return;
    const totalAmount = parseFloat(studentPaymentForm.amount);
    if (isNaN(totalAmount) || totalAmount <= 0) return;

    const result = await saveAdminPayment({
      action: 'init_student',
      studentId: student.id,
      totalAmount,
    });
    if (result.success) {
      alert('✅ Dossier de paiement créé !');
      await reloadPayments();
    } else {
      alert(result.message || 'Erreur lors de la création.');
    }
    setStudentPaymentForm({ studentId: '', amount: '', method: 'espèces', reference: '' });
  }

  // Encaisser un montant élève dans la base
  async function handleRecordStudentPayment(studentId: string) {
    const payment = studentPayments.find((p) => p.studentId === studentId);
    if (!payment) return;
    const amount = prompt('Montant à payer (DA) :', '');
    if (!amount) return;
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;
    const method = prompt('Méthode (cash/check/transfer/card) :', 'cash') || 'cash';

    const result = await saveAdminPayment({
      action: 'pay_student',
      studentId,
      amount: parsed,
      method,
    });
    if (result.success) {
      alert('✅ Paiement enregistré !');
      await reloadPayments();
    } else {
      alert(result.message || "Erreur lors de l'encaissement.");
    }
  }

  // Créer une rémunération enseignant dans la base
  async function handleInitializeTeacherPayment(e: React.FormEvent) {
    e.preventDefault();
    const teacher = teacherNames.find((t) => t.id === teacherPaymentForm.teacherId);
    if (!teacher) return;
    const salary = parseFloat(teacherPaymentForm.amount);
    if (isNaN(salary) || salary <= 0) return;

    const result = await saveAdminPayment({
      action: 'init_teacher',
      teacherId: teacher.id,
      totalAmount: salary,
    });
    if (result.success) {
      alert('✅ Rémunération définie !');
      await reloadPayments();
    } else {
      alert(result.message || 'Erreur lors de la création.');
    }
    setTeacherPaymentForm({ teacherId: '', amount: '', method: 'virement', reference: '', period: '' });
  }

  // Verser un montant enseignant dans la base
  async function handleRecordTeacherPayment(teacherId: string) {
    const payment = teacherPayments.find((p) => p.teacherId === teacherId);
    if (!payment) return;
    const amount = prompt('Montant à verser (DA) :', '');
    if (!amount) return;
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;
    const period = prompt('Période (ex: Janvier 2026) :', '') || undefined;

    const result = await saveAdminPayment({
      action: 'pay_teacher',
      teacherId,
      amount: parsed,
      method: 'virement',
      period,
    });
    if (result.success) {
      alert('✅ Paiement enregistré !');
      await reloadPayments();
    } else {
      alert(result.message || 'Erreur lors du versement.');
    }
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('students')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'students'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wallet size={16} />
          Paiements élèves
        </button>
        <button
          onClick={() => setActiveTab('teachers')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'teachers'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp size={16} />
          Rémunérations enseignants
        </button>
      </div>

      {/* PAIEMENTS ÉLÈVES */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Statistiques */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Total attendu</p>
              <p className="text-lg font-bold text-slate-900">{studentStats.totalExpected.toLocaleString()} DA</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-emerald-600">Total encaissé</p>
              <p className="text-lg font-bold text-emerald-700">{studentStats.totalCollected.toLocaleString()} DA</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-red-600">Total restant</p>
              <p className="text-lg font-bold text-red-700">{studentStats.totalRemaining.toLocaleString()} DA</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-emerald-500">Payés</p>
              <p className="text-lg font-bold text-emerald-700">{studentStats.fullyPaid}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-amber-500">Partiels</p>
              <p className="text-lg font-bold text-amber-700">{studentStats.partiallyPaid}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-red-500">Non payés</p>
              <p className="text-lg font-bold text-red-700">{studentStats.unpaid}</p>
            </div>
          </div>

          {/* Formulaire initialisation */}
          <form onSubmit={handleInitializeStudentPayment} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <UserPlus size={18} className="text-emerald-600" />
              Créer un dossier de paiement
            </h3>
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Élève</label>
                <select
                  value={studentPaymentForm.studentId}
                  onChange={(e) => setStudentPaymentForm({ ...studentPaymentForm, studentId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">Sélectionner...</option>
                  {studentNames.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.className})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Montant total (DA)</label>
                <input
                  type="number"
                  min={0}
                  value={studentPaymentForm.amount}
                  onChange={(e) => setStudentPaymentForm({ ...studentPaymentForm, amount: e.target.value })}
                  placeholder="Ex: 45000"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Méthode</label>
                <select
                  value={studentPaymentForm.method}
                  onChange={(e) => setStudentPaymentForm({ ...studentPaymentForm, method: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="cash">Espèces</option>
                  <option value="check">Chèque</option>
                  <option value="transfer">Virement</option>
                  <option value="card">Carte</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  <Save size={16} />
                  Créer
                </button>
              </div>
            </div>
          </form>

          {/* Tableau des paiements */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <Wallet size={18} className="text-emerald-600" />
              Paiements élèves — {academicYear}
            </h3>
            {studentPayments.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">Aucun dossier de paiement configuré.</p>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Élève</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Classe</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Payé</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Reste</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Statut</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 bg-white">
                      {studentPayments.map((payment) => {
                        const remaining = payment.totalAmount - payment.paidAmount;
                        return (
                          <tr key={payment.id}>
                            <td className="whitespace-nowrap px-6 py-3 text-sm font-semibold text-slate-900">{payment.studentName}</td>
                            <td className="whitespace-nowrap px-6 py-3 text-sm text-slate-600">{payment.className}</td>
                            <td className="whitespace-nowrap px-6 py-3 text-sm font-bold">{payment.totalAmount.toLocaleString()} DA</td>
                            <td className="whitespace-nowrap px-6 py-3 text-sm font-bold text-emerald-700">{payment.paidAmount.toLocaleString()} DA</td>
                            <td className={`whitespace-nowrap px-6 py-3 text-sm font-bold ${remaining > 0 ? 'text-red-600' : 'text-slate-600'}`}>
                              {remaining.toLocaleString()} DA
                            </td>
                            <td className="whitespace-nowrap px-6 py-3">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700'
                                : payment.status === 'partial' ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                              }`}>
                                {payment.status === 'paid' ? '✅ Payé'
                                  : payment.status === 'partial' ? '⏳ Partiel'
                                  : '❌ Non payé'}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-3 text-center">
                              <button
                                onClick={() => handleRecordStudentPayment(payment.studentId)}
                                disabled={remaining <= 0}
                                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                                  remaining > 0
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                <CreditCard size={14} />
                                Encaisser
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RÉMUNÉRATIONS ENSEIGNANTS */}
      {activeTab === 'teachers' && (
        <div className="space-y-6">
          {/* Statistiques */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Masse salariale prévue</p>
              <p className="text-lg font-bold text-slate-900">{teacherStats.totalExpected.toLocaleString()} DA</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-emerald-600">Total versé</p>
              <p className="text-lg font-bold text-emerald-700">{teacherStats.totalPaid.toLocaleString()} DA</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-red-600">Reste à payer</p>
              <p className="text-lg font-bold text-red-700">{teacherStats.totalRemaining.toLocaleString()} DA</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Paiements effectués</p>
              <p className="text-lg font-bold text-slate-900">{teacherStats.paid} / {teacherStats.totalTeachers}</p>
            </div>
          </div>

          {/* Formulaire initialisation */}
          <form onSubmit={handleInitializeTeacherPayment} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <UserPlus size={18} className="text-emerald-600" />
              Définir une rémunération
            </h3>
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Enseignant</label>
                <select
                  value={teacherPaymentForm.teacherId}
                  onChange={(e) => setTeacherPaymentForm({ ...teacherPaymentForm, teacherId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">Sélectionner...</option>
                  {teacherNames.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Salaire annuel (DA)</label>
                <input
                  type="number"
                  min={0}
                  value={teacherPaymentForm.amount}
                  onChange={(e) => setTeacherPaymentForm({ ...teacherPaymentForm, amount: e.target.value })}
                  placeholder="Ex: 960000"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Méthode</label>
                <select
                  value={teacherPaymentForm.method}
                  onChange={(e) => setTeacherPaymentForm({ ...teacherPaymentForm, method: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="virement">Virement</option>
                  <option value="chèque">Chèque</option>
                  <option value="espèces">Espèces</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  <Save size={16} />
                  Créer
                </button>
              </div>
            </div>
          </form>

          {/* Tableau rémunérations */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <TrendingUp size={18} className="text-emerald-600" />
              Rémunérations — {academicYear}
            </h3>
            {teacherPayments.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">Aucune rémunération configurée.</p>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Enseignant</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Prévu</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Payé</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Reste</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Statut</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 bg-white">
                      {teacherPayments.map((payment) => {
                        const remaining = payment.expectedSalary - payment.paidAmount;
                        return (
                          <tr key={payment.id}>
                            <td className="whitespace-nowrap px-6 py-3 text-sm font-semibold text-slate-900">{payment.teacherName}</td>
                            <td className="whitespace-nowrap px-6 py-3 text-sm font-bold">{payment.expectedSalary.toLocaleString()} DA</td>
                            <td className="whitespace-nowrap px-6 py-3 text-sm font-bold text-emerald-700">{payment.paidAmount.toLocaleString()} DA</td>
                            <td className={`whitespace-nowrap px-6 py-3 text-sm font-bold ${remaining > 0 ? 'text-red-600' : 'text-slate-600'}`}>
                              {remaining.toLocaleString()} DA
                            </td>
                            <td className="whitespace-nowrap px-6 py-3">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700'
                                : payment.status === 'partial' ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                              }`}>
                                {payment.status === 'paid' ? '✅ Payé'
                                  : payment.status === 'partial' ? '⏳ Partiel'
                                  : '❌ Impayé'}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-3 text-center">
                              <button
                                onClick={() => handleRecordTeacherPayment(payment.teacherId)}
                                disabled={remaining <= 0}
                                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                                  remaining > 0
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                <CreditCard size={14} />
                                Verser
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}