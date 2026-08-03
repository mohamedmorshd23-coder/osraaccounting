import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from "recharts";
import {
  Stethoscope, Calendar, Users, Receipt, Wallet, LayoutDashboard, BarChart3,
  FileSpreadsheet, ShieldCheck, DatabaseBackup, LogOut, Plus, Pencil, Trash2,
  Printer, Search, X, Check, Lock, ChevronLeft, ChevronRight, Download, Upload,
  AlertTriangle, User as UserIcon, KeyRound, Gem, Banknote, Menu, FileText,
} from "lucide-react";

/* ============================= THEME ============================= */
const C = {
  bg: "#F4F8F7",
  surface: "#FFFFFF",
  primary: "#1F6F5C",
  primaryDark: "#164F42",
  primarySoft: "#E5F2EE",
  accent: "#B8863B",
  accentSoft: "#F5EDE0",
  text: "#1E2A28",
  textMuted: "#647774",
  border: "#E1E9E7",
  danger: "#B3453A",
  dangerSoft: "#F8E9E7",
  cash: "#1F6F5C",
  vodafone: "#B8863B",
};

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Tajawal:wght@400;500;700&display=swap');`;

const RANK_COLORS = [
  "#3B7DC4", "#2FA876", "#E08A3C", "#8B6DC9", "#D9534F",
  "#2AA6A0", "#C99A2E", "#4A6FE3", "#3FAE7A", "#D65A86",
];

const EXPENSE_CATEGORIES = [
  "خامات", "معامل", "نثريات", "كهرباء", "مياه", "منظفات", "مرتبات", "سلف", "صيانات", "اخرى",
];

const SALARY_ROLES = ["محاسب", "ريسبشن", "تمريض", "عاملة", "أخرى"];

const PAGES = [
  { key: "days", label: "الأيام", icon: Calendar },
  { key: "doctors", label: "الأطباء", icon: Stethoscope },
  { key: "expenses", label: "المصروفات", icon: Receipt },
  { key: "salaries", label: "المرتبات والإيجار", icon: Wallet },
  { key: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { key: "reports", label: "التقارير", icon: BarChart3 },
  { key: "summary", label: "الملخص الشهري", icon: FileSpreadsheet },
  { key: "audit", label: "السجلات", icon: ShieldCheck },
  { key: "users", label: "المستخدمين", icon: Users },
  { key: "backup", label: "النسخ الاحتياطي", icon: DatabaseBackup },
];

const ADMIN_PIN = "7229590";
const AR_WEEKDAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const AR_MONTHS = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); }
function fmt(n) { return (Math.round((Number(n) || 0) * 100) / 100).toLocaleString("ar-EG"); }
function todayISO() { const d = new Date(); return d.toISOString().slice(0, 10); }
function monthKeyOf(dateStr) { return dateStr.slice(0, 7); }
function daysInMonth(y, m) { return new Date(y, m, 0).getDate(); }
function pad2(n) { return String(n).padStart(2, "0"); }

/* ============================= STORAGE HELPERS ============================= */
async function loadKey(key, fallback) {
  try {
    const r = await window.storage.get(key, true);
    if (!r || r.value === undefined || r.value === null) return fallback;
    return JSON.parse(r.value);
  } catch (e) {
    return fallback;
  }
}
async function saveKey(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value), true);
    return true;
  } catch (e) {
    return false;
  }
}

/* ============================= SMALL UI PRIMITIVES ============================= */
function Card({ children, style, className = "" }) {
  return (
    <div
      className={`rounded-2xl transition-shadow hover:shadow-md ${className}`}
      style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(30,42,40,0.08)", ...style }}
    >
      {children}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", icon: Icon, type = "button", disabled, style, className = "" }) {
  const variants = {
    primary: { background: C.primary, color: "#fff", border: `1px solid ${C.primary}` },
    outline: { background: "transparent", color: C.primary, border: `1.5px solid ${C.primary}` },
    danger: { background: C.danger, color: "#fff", border: `1px solid ${C.danger}` },
    ghost: { background: "transparent", color: C.textMuted, border: `1px solid ${C.border}` },
    soft: { background: C.primarySoft, color: C.primaryDark, border: `1px solid ${C.primarySoft}` },
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-95 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${className}`}
      style={{ ...variants[variant], cursor: disabled ? "not-allowed" : "pointer", ...style }}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      {label && <span className="font-medium" style={{ color: C.textMuted }}>{label}</span>}
      <input
        {...props}
        className="px-4 py-3 rounded-lg outline-none text-base font-medium transition-colors focus:border-opacity-100"
        style={{ border: `1.5px solid ${C.border}`, background: "#fff", color: C.text }}
        onFocus={(e) => e.target.style.borderColor = C.primary}
        onBlur={(e) => e.target.style.borderColor = C.border}
      />
    </label>
  );
}

function Select({ label, children, ...props }) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      {label && <span className="font-medium" style={{ color: C.textMuted }}>{label}</span>}
      <select
        {...props}
        className="px-4 py-3 rounded-lg outline-none text-base font-medium transition-colors"
        style={{ border: `1.5px solid ${C.border}`, background: "#fff", color: C.text }}
        onFocus={(e) => e.target.style.borderColor = C.primary}
        onBlur={(e) => e.target.style.borderColor = C.border}
      >
        {children}
      </select>
    </label>
  );
}

function Modal({ title, onClose, children, width = 420 }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" style={{ background: "rgba(30,42,40,0.45)" }}>
      <div className="rounded-2xl w-full overflow-hidden" style={{ maxWidth: width, background: C.surface, boxShadow: "0 10px 40px rgba(0,0,0,0.15)" }}>
        <div className="flex items-center justify-between px-5 py-4 sm:py-5" style={{ borderBottom: `1px solid ${C.border}`, background: C.primarySoft }}>
          <h3 className="font-bold text-base sm:text-lg" style={{ color: C.primaryDark }}>{title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:opacity-70 transition-opacity">
            <X size={22} color={C.primaryDark} />
          </button>
        </div>
        <div className="p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function Badge({ children, color = C.primary, bg = C.primarySoft }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ color, background: bg }}>
      {children}
    </span>
  );
}

function EmptyState({ text }) {
  return (
    <div className="py-10 text-center text-sm" style={{ color: C.textMuted }}>{text}</div>
  );
}

function RankedIncomeBars({ data }) {
  // data: [{ name, percentage, total }] already sorted desc
  const maxTotal = data[0]?.total || 1;
  return (
    <div className="flex flex-col gap-3">
      {data.map((d, i) => {
        const color = RANK_COLORS[i % RANK_COLORS.length];
        const share = d.total * (Number(d.percentage) / 100);
        const widthPct = Math.max(14, (d.total / maxTotal) * 100);
        return (
          <div key={d.name} className="flex items-center gap-3">
            <div style={{ width: "62%", maxWidth: 620 }}>
              <div
                className="flex items-center justify-between gap-2 rounded-2xl px-3"
                style={{ width: `${widthPct}%`, minWidth: 132, background: color, height: 46 }}
              >
                <span className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-white shrink-0" style={{ background: "rgba(0,0,0,0.22)" }}>
                  <Gem size={12} /> {fmt(share)}
                </span>
                <span className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-white shrink-0" style={{ background: "rgba(0,0,0,0.22)" }}>
                  <Banknote size={12} /> {fmt(d.total)}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{i + 1}. {d.name}</div>
              <div className="flex items-center gap-1 text-xs" style={{ color: C.textMuted }}>
                <BarChart3 size={11} /> نسبة: {d.percentage}% | {fmt(d.total)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================= PIN CONFIRM ============================= */
function usePinGate(editPin, onSuccess) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");
  const pendingRef = useRef(null);

  const request = (action) => {
    pendingRef.current = action;
    setVal(""); setErr(""); setOpen(true);
  };
  const confirm = () => {
    if (val === editPin) {
      setOpen(false);
      const action = pendingRef.current;
      pendingRef.current = null;
      onSuccess(action);
    } else {
      setErr("رقم سري غير صحيح");
    }
  };
  const modal = open ? (
    <Modal title="تأكيد العملية" onClose={() => setOpen(false)} width={340}>
      <div className="flex flex-col gap-3">
        <p className="text-sm" style={{ color: C.textMuted }}>أدخل الرقم السري الخاص بالتعديل/الحذف الذي حدده الأدمن.</p>
        <Input type="password" placeholder="الرقم السري" value={val} onChange={(e) => setVal(e.target.value)} autoFocus
          onKeyDown={(e) => e.key === "Enter" && confirm()} />
        {err && <span className="text-xs" style={{ color: C.danger }}>{err}</span>}
        <div className="flex gap-2 justify-end pt-1">
          <Btn variant="ghost" onClick={() => setOpen(false)}>إلغاء</Btn>
          <Btn onClick={confirm} icon={Check}>تأكيد</Btn>
        </div>
      </div>
    </Modal>
  ) : null;
  return { request, modal };
}

/* ============================= LOGIN ============================= */
function Login({ users, config, onLogin }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const submit = () => {
    // Check admin PIN - support both old hardcoded PIN and new config PIN
    const adminPin = config?.adminPin || ADMIN_PIN;
    if (pin === ADMIN_PIN || pin === adminPin) { 
      onLogin({ id: "admin", username: "الأدمن", isAdmin: true, permissions: PAGES.map(p => p.key) }); 
      return; 
    }
    const u = users.find(u => u.pin === pin);
    if (u) { onLogin({ id: u.id, username: u.username, isAdmin: false, permissions: u.permissions || [] }); return; }
    setErr("رقم سري غير صحيح");
  };
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
      <style>{FONT_IMPORT}</style>
      <Card style={{ width: 360, padding: 32 }}>
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: C.primarySoft }}>
            <Stethoscope size={26} color={C.primary} />
          </div>
          <h1 className="text-lg font-extrabold" style={{ color: C.text }}>نظام حسابات العيادة</h1>
          <p className="text-xs" style={{ color: C.textMuted }}>سجّل الدخول بالرقم السري الخاص بك</p>
        </div>
        <div className="flex flex-col gap-3">
          <Input type="password" placeholder="الرقم السري" value={pin} autoFocus
            onChange={(e) => { setPin(e.target.value); setErr(""); }}
            onKeyDown={(e) => e.key === "Enter" && submit()} />
          {err && <span className="text-xs text-center" style={{ color: C.danger }}>{err}</span>}
          <Btn onClick={submit} style={{ justifyContent: "center", width: "100%" }} icon={Lock}>دخول</Btn>
        </div>
      </Card>
    </div>
  );
}

/* ============================= APP ============================= */
function generateEmployeePDF(employee, timesheets, baseSalary, dailyHours, deductDays, notes, selMonth) {
  const totalHours = timesheets.reduce((sum, t) => {
    if (!t.checkin || !t.checkout) return sum;
    const [h1, m1] = t.checkin.split(":").map(Number);
    const [h2, m2] = t.checkout.split(":").map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    return sum + Math.max(0, diff / 60);
  }, 0);

  const workDays = timesheets.filter(t => t.checkin && t.checkout).length;
  const attendanceDays = Math.max(0, workDays - deductDays);
  const hourlyRate = baseSalary > 0 ? baseSalary / (22 * dailyHours) : 0;
  const finalSalary = totalHours * hourlyRate;

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>كشف مرتب ${employee}</title>
  <style>
    * { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; }
    body { margin: 0; padding: 20px; background: #f5f5f5; line-height: 1.6; }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1F6F5C; padding-bottom: 20px; }
    .header h1 { margin: 0; color: #1F6F5C; font-size: 26px; }
    .header p { margin: 5px 0; color: #666; font-size: 14px; }
    .info-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .info-box { border: 1px solid #ddd; padding: 12px; border-radius: 6px; background: #f9f9f9; }
    .info-label { font-size: 12px; color: #999; margin-bottom: 4px; font-weight: bold; text-transform: uppercase; }
    .info-value { font-size: 16px; color: #1F6F5C; font-weight: bold; }
    .summary { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin: 30px 0; }
    .summary-card { border: 2px solid #1F6F5C; border-radius: 8px; padding: 15px; text-align: center; background: #f0faf8; }
    .summary-card .label { font-size: 12px; color: #666; margin-bottom: 8px; }
    .summary-card .value { font-size: 22px; font-weight: bold; color: #1F6F5C; }
    .summary-card .unit { font-size: 11px; color: #999; margin-top: 4px; }
    table { width: 100%; margin: 30px 0; border-collapse: collapse; }
    th { background: #1F6F5C; color: white; padding: 12px; text-align: right; font-weight: bold; }
    td { border-bottom: 1px solid #eee; padding: 10px 12px; text-align: right; }
    tr:nth-child(even) { background: #f9f9f9; }
    .total-row { background: #f0faf8; font-weight: bold; border-top: 2px solid #1F6F5C; }
    .notes { margin-top: 30px; padding: 15px; border-left: 4px solid #B8863B; background: #fff9f0; }
    .notes-title { font-weight: bold; color: #B8863B; margin-bottom: 8px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 12px; color: #999; }
    .date { font-size: 12px; color: #999; }
    .no-print { display: block; }
    @media print { .no-print { display: none !important; } }
    @media print { body { background: white; } .container { box-shadow: none; } }
  </style>
</head>
  <div style="display: flex; gap: 10px; margin-bottom: 20px; padding: 15px 0; border-bottom: 1px solid #ddd;" class="no-print">
    <button onclick="window.print()" style="padding: 8px 16px; background: #1F6F5C; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold;">🖨️ طباعة / حفظ كـ PDF</button>
    <button onclick="window.close()" style="padding: 8px 16px; background: #666; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold;">❌ إغلاق</button>
  </div>
<body>
  <div class="container">
    <div class="header">
      <h1>كشف رواتب الموظف</h1>
      <p>نظام حسابات العيادة</p>
    </div>

    <div class="info-row">
      <div class="info-box">
        <div class="info-label">اسم الموظف</div>
        <div class="info-value">${employee}</div>
      </div>
      <div class="info-box">
        <div class="info-label">الشهر</div>
        <div class="info-value">${selMonth}</div>
      </div>
      <div class="info-box">
        <div class="info-label">الراتب الأساسي</div>
        <div class="info-value">${baseSalary.toLocaleString('ar-EG')} ج.م</div>
      </div>
      <div class="info-box">
        <div class="info-label">ساعات العمل اليومية</div>
        <div class="info-value">${dailyHours} ساعات</div>
      </div>
    </div>

    <div class="summary">
      <div class="summary-card">
        <div class="label">إجمالي الساعات</div>
        <div class="value">${totalHours.toFixed(2)}</div>
        <div class="unit">ساعة</div>
      </div>
      <div class="summary-card">
        <div class="label">أيام الحضور</div>
        <div class="value">${workDays}</div>
        <div class="unit">يوم</div>
      </div>
      <div class="summary-card">
        <div class="label">أيام الخصم</div>
        <div class="value">${deductDays}</div>
        <div class="unit">يوم</div>
      </div>
      <div class="summary-card">
        <div class="label">السعر/الساعة</div>
        <div class="value">${hourlyRate.toFixed(2)}</div>
        <div class="unit">ج.م</div>
      </div>
      <div class="summary-card" style="background: #e5f2ee; border-color: #164F42;">
        <div class="label">الراتب النهائي</div>
        <div class="value" style="color: #164F42; font-size: 24px;">${finalSalary.toFixed(2)}</div>
        <div class="unit">ج.م</div>
      </div>
    </div>

    <h3 style="color: #1F6F5C; margin-top: 30px;">سجل الدخول والخروج اليومي</h3>
    <table>
      <thead>
        <tr>
          <th>التاريخ</th>
          <th>وقت الدخول</th>
          <th>وقت الخروج</th>
          <th>الساعات</th>
        </tr>
      </thead>
      <tbody>
        ${timesheets.map(t => {
          let hours = 0;
          if (t.checkin && t.checkout) {
            const [h1, m1] = t.checkin.split(":").map(Number);
            const [h2, m2] = t.checkout.split(":").map(Number);
            hours = Math.max(0, ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60);
          }
          return `<tr>
            <td>${t.date}</td>
            <td>${t.checkin || "—"}</td>
            <td>${t.checkout || "—"}</td>
            <td style="font-weight: bold; color: #1F6F5C;">${hours.toFixed(2)}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>

    ${notes ? `<div class="notes">
      <div class="notes-title">ملاحظات</div>
      <div>${notes}</div>
    </div>` : ''}

    <div class="footer">
      <div class="date">تم الإنشاء: ${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div>© نظام حسابات العيادة 2026</div>
    </div>
  </div>

  <script>
    window.print();
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

function generateDoctorPDF(doctor, entries, daysCache, expenses, selYear, selMonth) {
  // Generate a simple text-based report that can be printed as PDF
  const entries_by_date = {};
  Object.values(daysCache).forEach(monthData => {
    Object.entries(monthData).forEach(([day, dayEntries]) => {
      dayEntries.forEach(e => {
        if (e.doctorId === doctor.id) {
          const dateKey = Object.keys(daysCache).find(mk => daysCache[mk][day]) || '';
          if (!entries_by_date[dateKey]) entries_by_date[dateKey] = [];
          entries_by_date[dateKey].push(e);
        }
      });
    });
  });
  
  const totalIncome = entries.reduce((s, e) => s + Number(e.amount || 0), 0);
  const doctorShare = entries.reduce((s, e) => s + Number(e.amount || 0) * (Number(e.percent || 0) / 100), 0);
  
  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تقرير ${doctor.name}</title>
  <style>
    * { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; }
    body { margin: 0; padding: 20px; background: #f5f5f5; line-height: 1.6; }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1F6F5C; padding-bottom: 20px; }
    .header h1 { margin: 0; color: #1F6F5C; font-size: 26px; }
    .header p { margin: 5px 0; color: #666; font-size: 14px; }
    .info-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .info-box { border: 1px solid #ddd; padding: 12px; border-radius: 6px; background: #f9f9f9; }
    .info-label { font-size: 12px; color: #999; margin-bottom: 4px; font-weight: bold; text-transform: uppercase; }
    .info-value { font-size: 16px; color: #1F6F5C; font-weight: bold; }
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }
    .summary-box { border: 2px solid #1F6F5C; border-radius: 8px; padding: 20px; text-align: center; background: #f0faf8; }
    .summary-box .label { font-size: 13px; color: #666; margin-bottom: 10px; font-weight: 600; }
    .summary-box .value { font-size: 24px; font-weight: bold; color: #1F6F5C; }
    table { width: 100%; margin: 30px 0; border-collapse: collapse; }
    th { background: #1F6F5C; color: white; padding: 12px; text-align: right; font-weight: bold; }
    td { border-bottom: 1px solid #eee; padding: 10px 12px; text-align: right; }
    tr:nth-child(even) { background: #f9f9f9; }
    .total-row { background: #f0faf8; font-weight: bold; border-top: 2px solid #1F6F5C; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 12px; color: #999; }
    @media print { body { background: white; } .container { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>تقرير دخل الطبيب</h1>
      <p>نظام حسابات العيادة</p>
    </div>

    <div class="info-row">
      <div class="info-box">
        <div class="info-label">اسم الطبيب</div>
        <div class="info-value">${doctor.name}</div>
      </div>
      <div class="info-box">
        <div class="info-label">الشهر</div>
        <div class="info-value">${AR_MONTHS[selMonth - 1]} ${selYear}</div>
      </div>
      <div class="info-box">
        <div class="info-label">التخصص</div>
        <div class="info-value">${doctor.specialty || "—"}</div>
      </div>
      <div class="info-box">
        <div class="info-label">نسبة الطبيب</div>
        <div class="info-value">${doctor.percentage}%</div>
      </div>
    </div>

    <div class="summary">
      <div class="summary-box">
        <div class="label">إجمالي الدخل</div>
        <div class="value">${totalIncome.toLocaleString('ar-EG')}</div>
      </div>
      <div class="summary-box">
        <div class="label">عدد الدفعات</div>
        <div class="value">${entries.length}</div>
      </div>
      <div class="summary-box" style="background: #e5f2ee; border-color: #164F42;">
        <div class="label">نصيب الطبيب</div>
        <div class="value" style="color: #164F42; font-size: 26px;">${doctorShare.toFixed(2)}</div>
      </div>
    </div>

    <h3 style="color: #1F6F5C; margin-top: 30px; border-bottom: 2px solid #1F6F5C; padding-bottom: 10px;">تفاصيل الدفعات</h3>
    <table>
      <thead>
        <tr>
          <th>التاريخ</th>
          <th>إجمالي الدفعة</th>
          <th>كاش</th>
          <th>فودافون</th>
          <th>نصيب الطبيب</th>
        </tr>
      </thead>
      <tbody>
        ${entries.map(e => {
          const share = Number(e.amount || 0) * (Number(e.percent || 0) / 100);
          return `<tr>
            <td>${e.date || "—"}</td>
            <td>${(Number(e.amount || 0)).toFixed(2)} ج.م</td>
            <td>${(Number(e.cash || 0)).toFixed(2)} ج.م</td>
            <td>${(Number(e.vodafone || 0)).toFixed(2)} ج.م</td>
            <td style="font-weight: bold; color: #1F6F5C;">${share.toFixed(2)} ج.م</td>
          </tr>`;
        }).join('')}
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td style="text-align: center;">الإجمالي</td>
          <td>${totalIncome.toFixed(2)} ج.م</td>
          <td>${entries.reduce((s, e) => s + Number(e.cash || 0), 0).toFixed(2)} ج.م</td>
          <td>${entries.reduce((s, e) => s + Number(e.vodafone || 0), 0).toFixed(2)} ج.م</td>
          <td>${doctorShare.toFixed(2)} ج.م</td>
        </tr>
      </tfoot>
    </table>
  
    <div class="footer">
      <div>تم الإنشاء: ${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div>© نظام حسابات العيادة 2026</div>
    </div>
  </div>

  <script>
    window.print();
  </script>
</body>
</html>`;
  
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [page, setPage] = useState("days");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [config, setConfig] = useState({ editPin: "1111" });
  const [daysCache, setDaysCache] = useState({}); // monthKey -> {dayNum: [entries]}
  const [now] = useState(new Date());
  const [selYear, setSelYear] = useState(now.getFullYear());
  const [selMonth, setSelMonth] = useState(now.getMonth() + 1);

  useEffect(() => {
    // تعيين عنوان الموقع
    document.title = "osraaccounting | نظام حسابات العيادة";
    
    (async () => {
      const [d, e, s, u, a, cfg] = await Promise.all([
        loadKey("clinic:doctors", []),
        loadKey("clinic:expenses", []),
        loadKey("clinic:salaries", []),
        loadKey("clinic:users", []),
        loadKey("clinic:auditlog", []),
        loadKey("clinic:config", { editPin: "1111" }),
      ]);
      setDoctors(d); setExpenses(e); setSalaries(s); setUsers(u); setAuditLog(a); setConfig(cfg);
      
      // إنشاء نسخة احتياطية تلقائية يومية
      try {
        const lastBackupDate = await loadKey("clinic:lastBackup", null);
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        if (lastBackupDate !== today) {
          const backupData = {
            doctors: d, expenses: e, salaries: s, users: u, auditLog: a, config: cfg,
            timestamp: new Date().toISOString(),
            date: today
          };
          await saveKey(`clinic:backup:${today}`, backupData, true); // shared backup
          await saveKey("clinic:lastBackup", today, true);
          
          // حذف النسخ الاحتياطية القديمة (أكثر من 30 يوم)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
          
          // محاولة حذف النسخ القديمة
          for (let i = 1; i <= 30; i++) {
            const oldDate = new Date();
            oldDate.setDate(oldDate.getDate() - 30 - i);
            const oldDateStr = oldDate.toISOString().split('T')[0];
            try {
              await saveKey(`clinic:backup:${oldDateStr}`, null, true); // سيحذفها
            } catch (e) {
              // تجاهل الأخطاء
            }
          }
        }
      } catch (err) {
        console.error("خطأ في النسخة الاحتياطية التلقائية:", err);
      }
      
      setLoading(false);
    })();
  }, []);

  const monthKey = `${selYear}-${pad2(selMonth)}`;
  useEffect(() => {
    if (daysCache[monthKey] !== undefined) return;
    (async () => {
      const data = await loadKey(`clinic:days:${monthKey}`, {});
      setDaysCache(prev => ({ ...prev, [monthKey]: data }));
    })();
  }, [monthKey]);

  const log = useCallback((action, details) => {
    setAuditLog(prev => {
      const next = [{ id: uid(), user: session?.username || "—", action, details, ts: new Date().toISOString() }, ...prev].slice(0, 800);
      saveKey("clinic:auditlog", next);
      return next;
    });
  }, [session]);

  const { request: gatePin, modal: pinModal } = usePinGate(config.editPin, (action) => { if (action) action(); });

  const saveDoctors = (next) => { setDoctors(next); saveKey("clinic:doctors", next); };
  const saveExpenses = (next) => { setExpenses(next); saveKey("clinic:expenses", next); };
  const saveSalaries = (next) => { setSalaries(next); saveKey("clinic:salaries", next); };
  const saveUsers = (next) => { setUsers(next); saveKey("clinic:users", next); };
  const saveConfig = (next) => { setConfig(next); saveKey("clinic:config", next); };
  const saveDays = (mk, data) => {
    setDaysCache(prev => ({ ...prev, [mk]: data }));
    saveKey(`clinic:days:${mk}`, data);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg, color: C.textMuted }}>...جاري التحميل</div>;
  }
  if (!session) return <Login users={users} config={config} onLogin={(s) => { setSession(s); log("تسجيل دخول", `دخول ${s.username}`); }} />;

  const canSee = (key) => session.isAdmin || session.permissions.includes(key);
  const visiblePages = PAGES.filter(p => canSee(p.key));

  return (
    <div dir="rtl" className="min-h-screen flex flex-col" style={{ background: C.bg, fontFamily: "'Cairo','Tajawal',sans-serif", color: C.text }}>
      <style>{`${FONT_IMPORT}
        * { direction: rtl; text-align: right; }
        button, input, select, textarea { text-align: right; direction: rtl; }
        @media print { .no-print { display: none !important; } .print-area { padding: 0 !important; } body { background: #fff !important; } }
        ::-webkit-scrollbar { width: 8px; height: 8px; } ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 8px; }
        @media (max-width: 640px) {
          .nav-item { font-size: 12px; padding: 8px 12px; gap: 8px; }
          .nav-item span { display: none; }
          .nav-item svg { margin: 0; }
        }
        button { -webkit-tap-highlight-color: transparent; }
        input, select, textarea { -webkit-appearance: none; }
      `}</style>
      {pinModal}

      {/* Top Bar with Toggle */}
      <div className="no-print flex items-center justify-between px-3 py-3 sm:px-6 sm:py-4" style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ background: C.primarySoft }}>
            <Stethoscope size={20} color={C.primary} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold">حسابات العيادة</h1>
            <p className="text-xs" style={{ color: C.textMuted }}>نظام إدارة شامل</p>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 sm:p-3 rounded-lg hover:opacity-80 transition-opacity" style={{ border: `1px solid ${C.border}` }}>
          <Menu size={20} color={C.textMuted} />
        </button>
      </div>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside className={`no-print fixed sm:relative top-0 right-0 h-screen sm:h-auto transition-all duration-300 ease-out flex flex-col gap-1 p-4 sm:p-6 shrink-0 overflow-y-auto z-40 ${sidebarOpen ? 'w-64' : 'w-0'} sm:w-72 shadow-lg sm:shadow-none`} style={{ background: C.surface, borderRight: `1px solid ${C.border}` }}>
          <div className="pb-3 mb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="text-xs font-bold" style={{ color: C.textMuted }}>المستخدم الحالي</div>
            <div className="text-sm font-semibold mt-2">{session.username}{session.isAdmin ? " (أدمن)" : ""}</div>
          </div>
          {visiblePages.map(p => {
            const Icon = p.icon;
            const active = page === p.key;
            return (
              <button 
                key={p.key} 
                onClick={() => { setPage(p.key); setSidebarOpen(false); }}
                className="nav-item flex items-center gap-3 px-4 py-3 sm:py-2.5 rounded-lg text-sm font-medium transition-all active:scale-95 active:opacity-75"
                style={{ background: active ? C.primarySoft : "transparent", color: active ? C.primaryDark : C.textMuted }}>
                <Icon size={20} className="sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="sm:inline">{p.label}</span>
              </button>
            );
          })}
          <div className="mt-auto pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
            <button 
              onClick={() => { log("تسجيل خروج", session.username); setSession(null); }}
              className="nav-item flex items-center gap-3 px-4 py-3 sm:py-2.5 rounded-lg text-sm font-medium w-full transition-all active:scale-95 active:opacity-75" 
              style={{ color: C.danger }}>
              <LogOut size={20} className="sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="sm:inline">تسجيل خروج</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 print-area overflow-x-hidden overflow-y-auto">
        {page === "days" && (
          <DaysPage {...{ doctors, expenses, monthKey, selYear, selMonth, setSelYear, setSelMonth, daysCache, saveDays, gatePin, log, session }} />
        )}
        {page === "doctors" && canSee("doctors") && (
          <DoctorsPage {...{ doctors, saveDoctors, gatePin, log }} />
        )}
        {page === "expenses" && canSee("expenses") && (
          <ExpensesPage {...{ expenses, saveExpenses, gatePin, log }} />
        )}
        {page === "salaries" && canSee("salaries") && (
          <SalariesPage {...{ salaries, saveSalaries, log }} />
        )}
        {page === "dashboard" && canSee("dashboard") && (
          <DashboardPage {...{ doctors, expenses, daysCache, setDaysCache }} />
        )}
        {page === "reports" && canSee("reports") && (
          <ReportsPage {...{ doctors, daysCache, setDaysCache }} />
        )}
        {page === "summary" && canSee("summary") && (
          <SummaryPage {...{ monthKey, selYear, selMonth, setSelYear, setSelMonth, daysCache, expenses }} />
        )}
        {page === "audit" && canSee("audit") && <AuditPage auditLog={auditLog} />}
        {page === "users" && session.isAdmin && (
          <UsersPage {...{ users, saveUsers, config, saveConfig, log }} />
        )}
        {page === "backup" && canSee("backup") && (
          <BackupPage {...{ doctors, expenses, salaries, users, auditLog, config, daysCache, setDaysCache,
            saveDoctors, saveExpenses, saveSalaries, saveUsers, saveConfig, log, monthKey }} />
        )}
      </main>
      </div>
    </div>
  );
}

/* ============================= MONTH NAV ============================= */
function MonthNav({ selYear, selMonth, setSelYear, setSelMonth }) {
  const shift = (delta) => {
    let m = selMonth + delta, y = selYear;
    if (m > 12) { m = 1; y++; } if (m < 1) { m = 12; y--; }
    setSelMonth(m); setSelYear(y);
  };
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => shift(-1)} className="p-1.5 rounded-lg" style={{ border: `1px solid ${C.border}` }}><ChevronRight size={16} /></button>
      <div className="px-3 py-1.5 rounded-lg text-sm font-bold text-center" style={{ background: C.primarySoft, color: C.primaryDark, minWidth: 120 }}>
        {AR_MONTHS[selMonth - 1]} {selYear}
      </div>
      <button onClick={() => shift(1)} className="p-1.5 rounded-lg" style={{ border: `1px solid ${C.border}` }}><ChevronLeft size={16} /></button>
    </div>
  );
}

function PageHeader({ title, subtitle, right }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-3">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">{title}</h1>
        {subtitle && <p className="text-sm mt-1 sm:mt-0.5" style={{ color: C.textMuted }}>{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">{right}</div>
    </div>
  );
}

/* ============================= DAYS PAGE ============================= */
function DaysPage({ doctors, monthKey, selYear, selMonth, setSelYear, setSelMonth, daysCache, saveDays, gatePin, log, session }) {
  const total = daysInMonth(selYear, selMonth);
  const monthData = daysCache[monthKey] || {};
  const [selDay, setSelDay] = useState(1);
  const [form, setForm] = useState({ doctorId: "", cash: "", vodafone: "" });
  const [editingEntry, setEditingEntry] = useState(null);

  useEffect(() => { setSelDay(1); }, [monthKey]);

  const dayEntries = monthData[String(selDay)] || [];
  const dateStr = `${selYear}-${pad2(selMonth)}-${pad2(selDay)}`;
  const weekday = AR_WEEKDAYS[new Date(selYear, selMonth - 1, selDay).getDay()];

  const dayTotal = (entries) => entries.reduce((s, e) => s + Number(e.amount || 0), 0);
  const dayCash = (entries) => entries.reduce((s, e) => s + Number(e.cash || 0), 0);
  const dayVoda = (entries) => entries.reduce((s, e) => s + Number(e.vodafone || 0), 0);

  const grouped = useMemo(() => {
    const map = {};
    dayEntries.forEach(e => { (map[e.doctorId] = map[e.doctorId] || []).push(e); });
    return map;
  }, [dayEntries]);

  const resetForm = () => setForm({ doctorId: doctors[0]?.id || "", cash: "", vodafone: "" });

  const addEntry = () => {
    if (!form.doctorId || (!form.cash && !form.vodafone)) return;
    const doc = doctors.find(d => d.id === form.doctorId);
    const cash = Number(form.cash || 0), voda = Number(form.vodafone || 0);
    const amount = cash + voda; // تجميع تلقائي

    // البحث عن دفعة موجودة لنفس الطبيب في نفس اليوم
    const existingEntryIndex = dayEntries.findIndex(e => e.doctorId === form.doctorId);
    
    let nextEntries;
    if (existingEntryIndex >= 0) {
      // تحديث الدفعة الموجودة بتجميع الكاش والفودافون
      const existing = dayEntries[existingEntryIndex];
      const updatedEntry = {
        ...existing,
        cash: Number(existing.cash || 0) + cash,
        vodafone: Number(existing.vodafone || 0) + voda,
        amount: Number(existing.amount || 0) + amount,
        ts: new Date().toISOString()
      };
      nextEntries = dayEntries.map((e, i) => i === existingEntryIndex ? updatedEntry : e);
      log("تحديث دفعة", `${doc?.name || ""} - كاش: +${cash} + فودافون: +${voda} = إجمالي جديد ${updatedEntry.amount} ج.م بتاريخ ${dateStr}`);
    } else {
      // إضافة دفعة جديدة إذا لم تكن موجودة
      const entry = { id: uid(), doctorId: form.doctorId, amount, cash, vodafone: voda, percent: doc?.percentage ?? 0, ts: new Date().toISOString() };
      nextEntries = [...dayEntries, entry];
      log("إضافة دفعة", `${doc?.name || ""} - كاش: ${cash} + فودافون: ${voda} = ${amount} ج.م بتاريخ ${dateStr}`);
    }
    
    const nextMonth = { ...monthData, [String(selDay)]: nextEntries };
    saveDays(monthKey, nextMonth);
    resetForm();
  };

  const removeEntry = (entryId) => gatePin(() => {
    const nextEntries = dayEntries.filter(e => e.id !== entryId);
    saveDays(monthKey, { ...monthData, [String(selDay)]: nextEntries });
    log("حذف دفعة", `بتاريخ ${dateStr}`);
  });

  const saveEditedEntry = () => {
    const nextEntries = dayEntries.map(e => e.id === editingEntry.id ? editingEntry : e);
    saveDays(monthKey, { ...monthData, [String(selDay)]: nextEntries });
    log("تعديل دفعة", `بتاريخ ${dateStr}`);
    setEditingEntry(null);
  };

  return (
    <div>
      <PageHeader title="صفحات الأيام" subtitle="سجّل دفعات كل طبيب يوميًا وتراكم المبلغ تلقائيًا"
        right={<MonthNav {...{ selYear, selMonth, setSelYear, setSelMonth }} />} />
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "auto 1fr", gridAutoColumns: "minmax(0, 1fr)" }}>
        <Card style={{ padding: 12, maxHeight: 640, overflowY: "auto", minWidth: 0 }}>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
            {Array.from({ length: total }, (_, i) => i + 1).map(d => {
              const ent = monthData[String(d)] || [];
              const active = d === selDay;
              return (
                <button key={d} onClick={() => setSelDay(d)}
                  className="rounded-lg py-1.5 sm:py-2 text-xs font-bold flex flex-col items-center gap-0.5 transition-all active:scale-95 hover:opacity-80"
                  style={{ background: active ? C.primary : ent.length ? C.primarySoft : C.bg, color: active ? "#fff" : ent.length ? C.primaryDark : C.textMuted, border: `1px solid ${active ? C.primary : C.border}`, cursor: "pointer" }}>
                  {d}
                  {ent.length > 0 && <span style={{ fontSize: 8, opacity: 0.85 }}>{fmt(dayTotal(ent))}</span>}
                </button>
              );
            })}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card style={{ padding: 18 }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-extrabold text-base">{weekday} — {selDay} {AR_MONTHS[selMonth - 1]} {selYear}</div>
                <div className="text-xs" style={{ color: C.textMuted }}>{dateStr}</div>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="text-center">
                  <div className="font-extrabold" style={{ color: C.cash }}>{fmt(dayCash(dayEntries))}</div>
                  <div style={{ color: C.textMuted, fontSize: 11 }}>كاش</div>
                </div>
                <div className="text-center">
                  <div className="font-extrabold" style={{ color: C.vodafone }}>{fmt(dayVoda(dayEntries))}</div>
                  <div style={{ color: C.textMuted, fontSize: 11 }}>فودافون</div>
                </div>
                <div className="text-center">
                  <div className="font-extrabold">{fmt(dayTotal(dayEntries))}</div>
                  <div style={{ color: C.textMuted, fontSize: 11 }}>إجمالي</div>
                </div>
              </div>
            </div>

            {/* add entry form */}
            <div className="flex flex-wrap items-end gap-2 p-3 rounded-xl mb-4" style={{ background: C.bg }}>
              <Select label="الطبيب" value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))} style={{ minWidth: 160 }}>
                <option value="">اختر طبيب</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.percentage}%)</option>)}
              </Select>
              <Input label="كاش" type="number" value={form.cash} onChange={e => setForm(f => ({ ...f, cash: e.target.value }))} style={{ width: 100 }} />
              <Input label="فودافون كاش" type="number" value={form.vodafone} onChange={e => setForm(f => ({ ...f, vodafone: e.target.value }))} style={{ width: 100 }} />
              <div style={{ padding: "6px 12px", borderRadius: "8px", background: C.primarySoft, color: C.primaryDark, fontWeight: "bold", textAlign: "center", minWidth: 110 }}>
                المجموع: {fmt(Number(form.cash || 0) + Number(form.vodafone || 0))}
              </div>
              <Btn icon={Plus} onClick={addEntry}>إضافة</Btn>
            </div>

            {Object.keys(grouped).length === 0 ? <EmptyState text="لا توجد دفعات مسجلة في هذا اليوم" /> : (
              <div className="flex flex-col gap-3">
                {Object.entries(grouped).map(([docId, entries]) => {
                  const doc = doctors.find(d => d.id === docId);
                  const total = dayTotal(entries);
                  const docShare = entries.reduce((s, e) => s + Number(e.amount || 0) * (Number(e.percent || 0) / 100), 0);
                  return (
                    <div key={docId} className="rounded-xl p-3" style={{ border: `1px solid ${C.border}` }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-sm flex items-center gap-2">
                          <Stethoscope size={14} color={C.primary} /> {doc?.name || "طبيب محذوف"}
                          <Badge>{fmt(total)} ج.م</Badge>
                        </div>
                        <div className="text-xs" style={{ color: C.textMuted }}>نصيب الطبيب: <b style={{ color: C.accent }}>{fmt(docShare)}</b></div>
                      </div>
                      <div className="flex flex-col gap-1">
                        {entries.map(e => (
                          <div key={e.id} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg" style={{ background: C.bg }}>
                            <div className="flex gap-3">
                              <span>إجمالي: <b>{fmt(e.amount)}</b></span>
                              <span style={{ color: C.cash }}>كاش: {fmt(e.cash)}</span>
                              <span style={{ color: C.vodafone }}>فودافون: {fmt(e.vodafone)}</span>
                              <span style={{ color: C.textMuted }}>نسبة: {e.percent}%</span>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => setEditingEntry(e)} className="p-1 rounded hover:opacity-70"><Pencil size={13} color={C.textMuted} /></button>
                              <button onClick={() => removeEntry(e.id)} className="p-1 rounded hover:opacity-70"><Trash2 size={13} color={C.danger} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {editingEntry && (
        <Modal title="تعديل الدفعة" onClose={() => setEditingEntry(null)}>
          <div className="flex flex-col gap-3">
            <Input label="كاش" type="number" value={editingEntry.cash} onChange={e => {
              const cash = Number(e.target.value);
              const voda = editingEntry.vodafone;
              setEditingEntry(v => ({ ...v, cash, amount: cash + voda }));
            }} />
            <Input label="فودافون كاش" type="number" value={editingEntry.vodafone} onChange={e => {
              const voda = Number(e.target.value);
              const cash = editingEntry.cash;
              setEditingEntry(v => ({ ...v, vodafone: voda, amount: cash + voda }));
            }} />
            <div style={{ padding: "8px 12px", borderRadius: "8px", background: C.primarySoft, color: C.primaryDark, fontWeight: "bold", textAlign: "center" }}>
              المبلغ الإجمالي: {fmt(editingEntry.amount)}
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Btn variant="ghost" onClick={() => setEditingEntry(null)}>إلغاء</Btn>
              <Btn icon={Check} onClick={() => gatePin(saveEditedEntry)}>حفظ</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ============================= DOCTORS PAGE ============================= */
function DoctorsPage({ doctors, saveDoctors, gatePin, log }) {
  const [modal, setModal] = useState(null); // {mode, doctor}
  const empty = { name: "", specialty: "استشاري", percentage: 40 };
  const [form, setForm] = useState(empty);

  const openAdd = () => { setForm(empty); setModal({ mode: "add" }); };
  const openEdit = (doc) => { setForm(doc); setModal({ mode: "edit" }); };

  const submit = () => {
    if (!form.name) return;
    if (modal.mode === "add") {
      const doc = { id: uid(), ...form, percentage: Number(form.percentage) };
      saveDoctors([...doctors, doc]);
      log("إضافة طبيب", doc.name);
    } else {
      saveDoctors(doctors.map(d => d.id === form.id ? { ...form, percentage: Number(form.percentage) } : d));
      log("تعديل طبيب", form.name);
    }
    setModal(null);
  };

  const remove = (doc) => gatePin(() => { saveDoctors(doctors.filter(d => d.id !== doc.id)); log("حذف طبيب", doc.name); });

  const onSpecialtyChange = (val) => {
    setForm(f => ({ ...f, specialty: val, percentage: f.percentage === 40 || f.percentage === 30 ? (val === "استشاري" ? 40 : 30) : f.percentage }));
  };

  return (
    <div>
      <PageHeader title="إدارة الأطباء" subtitle="إضافة وتعديل بيانات الأطباء ونسبهم"
        right={<Btn icon={Plus} onClick={openAdd}>إضافة طبيب</Btn>} />
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: C.bg }}>
              {["الاسم", "التخصص", "النسبة", ""].map(h => <th key={h} className="text-right px-4 py-3 font-bold text-xs" style={{ color: C.textMuted }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {doctors.map(d => (
              <tr key={d.id} style={{ borderTop: `1px solid ${C.border}` }}>
                <td className="px-4 py-3 font-semibold">{d.name}</td>
                <td className="px-4 py-3"><Badge color={d.specialty === "استشاري" ? C.primaryDark : C.accent} bg={d.specialty === "استشاري" ? C.primarySoft : C.accentSoft}>{d.specialty}</Badge></td>
                <td className="px-4 py-3">{d.percentage}%</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg hover:opacity-70" style={{ border: `1px solid ${C.border}` }}><Pencil size={14} /></button>
                    <button onClick={() => remove(d)} className="p-1.5 rounded-lg hover:opacity-70" style={{ border: `1px solid ${C.dangerSoft}` }}><Trash2 size={14} color={C.danger} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {doctors.length === 0 && <EmptyState text="لا يوجد أطباء مسجلين بعد" />}
      </Card>

      {modal && (
        <Modal title={modal.mode === "add" ? "إضافة طبيب" : "تعديل بيانات الطبيب"} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-3">
            <Input label="اسم الطبيب" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Select label="التخصص" value={form.specialty} onChange={e => onSpecialtyChange(e.target.value)}>
              <option value="استشاري">استشاري (40%)</option>
              <option value="أخصائي">أخصائي (30%)</option>
            </Select>
            <Input label="النسبة %" type="number" value={form.percentage} onChange={e => setForm(f => ({ ...f, percentage: e.target.value }))} />
            <div className="flex justify-end gap-2 pt-1">
              <Btn variant="ghost" onClick={() => setModal(null)}>إلغاء</Btn>
              <Btn icon={Check} onClick={submit}>حفظ</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ============================= EXPENSES PAGE ============================= */
function ExpensesPage({ expenses, saveExpenses, gatePin, log }) {
  const [modal, setModal] = useState(null);
  const empty = { date: todayISO(), category: EXPENSE_CATEGORIES[0], amount: "", notes: "" };
  const [form, setForm] = useState(empty);
  const [filterCat, setFilterCat] = useState("الكل");
  const [filterDate, setFilterDate] = useState("");

  const catTotals = useMemo(() => {
    const map = {};
    EXPENSE_CATEGORIES.forEach(c => map[c] = 0);
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + Number(e.amount || 0); });
    return map;
  }, [expenses]);

  const filtered = useMemo(() => {
    return expenses
      .filter(e => filterCat === "الكل" || e.category === filterCat)
      .filter(e => !filterDate || e.date === filterDate)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [expenses, filterCat, filterDate]);

  const openAdd = () => { setForm(empty); setModal({ mode: "add" }); };
  const openEdit = (exp) => { setForm(exp); setModal({ mode: "edit" }); };

  const submit = () => {
    if (!form.amount || !form.date) return;
    if (modal.mode === "add") {
      const exp = { id: uid(), ...form, amount: Number(form.amount) };
      saveExpenses([...expenses, exp]);
      log("إضافة مصروف", `${form.category} - ${form.amount} ج.م`);
    } else {
      saveExpenses(expenses.map(e => e.id === form.id ? { ...form, amount: Number(form.amount) } : e));
      log("تعديل مصروف", `${form.category}`);
    }
    setModal(null);
  };
  const remove = (exp) => gatePin(() => { saveExpenses(expenses.filter(e => e.id !== exp.id)); log("حذف مصروف", `${exp.category} - ${exp.amount}`); });

  return (
    <div>
      <PageHeader title="المصروفات" subtitle="تسجيل ومتابعة مصروفات العيادة حسب الفئة والتاريخ"
        right={<Btn icon={Plus} onClick={openAdd}>إضافة مصروف</Btn>} />

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setFilterCat("الكل")} className="px-3 py-1.5 rounded-full text-xs font-bold"
          style={{ background: filterCat === "الكل" ? C.primary : C.surface, color: filterCat === "الكل" ? "#fff" : C.text, border: `1px solid ${C.border}` }}>
          الكل ({fmt(expenses.reduce((s, e) => s + Number(e.amount || 0), 0))})
        </button>
        {EXPENSE_CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilterCat(c)} className="px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: filterCat === c ? C.primary : C.surface, color: filterCat === c ? "#fff" : C.text, border: `1px solid ${C.border}` }}>
            {c} ({fmt(catTotals[c])})
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Search size={16} color={C.textMuted} />
        <Input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ width: 170 }} />
        <Btn variant="ghost" onClick={() => setFilterDate(todayISO())}>بحث بتاريخ اليوم</Btn>
        {filterDate && <Btn variant="ghost" icon={X} onClick={() => setFilterDate("")}>مسح</Btn>}
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: C.bg }}>
              {["التاريخ", "الفئة", "المبلغ", "ملاحظات", ""].map(h => <th key={h} className="text-right px-4 py-3 font-bold text-xs" style={{ color: C.textMuted }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} style={{ borderTop: `1px solid ${C.border}` }}>
                <td className="px-4 py-3">{e.date}</td>
                <td className="px-4 py-3"><Badge>{e.category}</Badge></td>
                <td className="px-4 py-3 font-bold">{fmt(e.amount)}</td>
                <td className="px-4 py-3 text-xs" style={{ color: C.textMuted }}>{e.notes || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg" style={{ border: `1px solid ${C.border}` }}><Pencil size={14} /></button>
                    <button onClick={() => remove(e)} className="p-1.5 rounded-lg" style={{ border: `1px solid ${C.dangerSoft}` }}><Trash2 size={14} color={C.danger} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState text="لا توجد مصروفات مطابقة" />}
      </Card>

      {modal && (
        <Modal title={modal.mode === "add" ? "إضافة مصروف" : "تعديل مصروف"} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-3">
            <Input label="التاريخ" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <Select label="الفئة" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Input label="المبلغ" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            <Input label="ملاحظات / وصف" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            <div className="flex justify-end gap-2 pt-1">
              <Btn variant="ghost" onClick={() => setModal(null)}>إلغاء</Btn>
              <Btn icon={Check} onClick={submit}>حفظ</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ============================= SALARIES PAGE (Advanced with Daily Timesheets) ============================= */
function SalariesPage({ salaries, saveSalaries, log }) {
  const now = new Date();
  const curMonth = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
  
  const [selEmpName, setSelEmpName] = useState("");
  const [selMonth, setSelMonth] = useState(curMonth);
  const [empList, setEmpList] = useState(() => {
    const names = new Set();
    salaries.forEach(s => { if (s.type === "salary" && s.employeeName) names.add(s.employeeName); });
    return Array.from(names);
  });

  // Get or create record for selected employee & month
  const recordKey = `${selEmpName}|${selMonth}`;
  let monthRec = salaries.find(s => s.type === "salary" && s.employeeName === selEmpName && s.month === selMonth);
  if (!monthRec && selEmpName) {
    monthRec = {
      id: uid(),
      type: "salary",
      employeeName: selEmpName,
      role: SALARY_ROLES[0],
      baseSalary: 0,
      dailyHours: 8,
      month: selMonth,
      timesheets: [],
      deductDays: 0,
      notes: ""
    };
  }

  const saveRecord = (updated) => {
    if (!selEmpName) return;
    const nextSalaries = salaries.filter(s => !(s.type === "salary" && s.employeeName === selEmpName && s.month === selMonth));
    nextSalaries.push(updated);
    saveSalaries(nextSalaries);
  };

  if (!selEmpName) {
    return (
      <div>
        <PageHeader title="حساب الرواتب" subtitle="نظام متقدم لحساب مرتب الموظف من الدخول والخروج اليومي" />
        <Card style={{ padding: 20 }}>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-bold" style={{ color: C.text }}>أنشئ أو اختر موظفًا:</label>
              <div className="flex gap-2 mt-2">
                <input type="text" placeholder="أدخل اسم الموظف الجديد" id="newEmpName"
                  style={{ flex: 1, padding: "8px", border: `1px solid ${C.border}`, borderRadius: "8px" }} />
                <Btn onClick={() => {
                  const name = document.getElementById("newEmpName").value.trim();
                  if (name && !empList.includes(name)) {
                    setEmpList([...empList, name]);
                    setSelEmpName(name);
                    log("إضافة موظف جديد", name);
                  }
                }}>إضافة موظف</Btn>
              </div>
            </div>
            <div>
              <label className="text-sm font-bold" style={{ color: C.text }}>أو اختر من الموظفين الموجودين:</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {empList.map(name => (
                  <button key={name} onClick={() => setSelEmpName(name)}
                    className="px-3 py-2 rounded-xl text-sm font-bold"
                    style={{ background: C.primarySoft, color: C.primaryDark }}>
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const ts = monthRec?.timesheets || [];
  const baseSalary = monthRec?.baseSalary || 0;
  const dailyHours = monthRec?.dailyHours || 8;
  const deductDays = monthRec?.deductDays || 0;

  const totalHours = ts.reduce((sum, t) => {
    if (!t.checkin || !t.checkout) return sum;
    const [h1, m1] = t.checkin.split(":").map(Number);
    const [h2, m2] = t.checkout.split(":").map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    return sum + Math.max(0, diff / 60);
  }, 0);

  const workDays = ts.filter(t => t.checkin && t.checkout).length;
  const attendanceDays = Math.max(0, workDays - deductDays);
  const hourlyRate = baseSalary > 0 ? baseSalary / (22 * dailyHours) : 0;
  const finalSalary = totalHours * hourlyRate;

  const addDay = () => {
    ts.push({ date: todayISO(), checkin: "", checkout: "" });
    saveRecord({ ...monthRec, timesheets: ts });
  };

  const removeDay = (idx) => {
    ts.splice(idx, 1);
    saveRecord({ ...monthRec, timesheets: ts });
  };

  const updateDay = (idx, field, value) => {
    ts[idx][field] = value;
    saveRecord({ ...monthRec, timesheets: ts });
  };

  const updateField = (field, value) => {
    saveRecord({ ...monthRec, [field]: value });
  };

  return (
    <div>
      <PageHeader title="حساب الرواتب" subtitle={`الموظف: ${selEmpName} | الشهر: ${selMonth}`}
        right={<div className="flex gap-2">
          <Btn icon={FileText} onClick={() => generateEmployeePDF(selEmpName, ts, baseSalary, dailyHours, deductDays, monthRec?.notes || "", selMonth)}>تصدير PDF</Btn>
          <Btn variant="outline" onClick={() => setSelEmpName("")}>تغيير الموظف</Btn>
        </div>} />

      {/* Settings */}
      <Card style={{ padding: 16 }} className="mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="text-xs font-medium" style={{ color: C.textMuted }}>الراتب الأساسي</label>
            <input type="number" value={baseSalary} onChange={e => updateField("baseSalary", Number(e.target.value))}
              className="w-full px-3 py-2 mt-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: C.textMuted }}>ساعات اليوم</label>
            <input type="number" value={dailyHours} onChange={e => updateField("dailyHours", Number(e.target.value))}
              className="w-full px-3 py-2 mt-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: C.textMuted }}>الشهر</label>
            <input type="month" value={selMonth} onChange={e => setSelMonth(e.target.value)}
              className="w-full px-3 py-2 mt-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: C.textMuted }}>أيام الخصم</label>
            <input type="number" value={deductDays} onChange={e => updateField("deductDays", Number(e.target.value))}
              className="w-full px-3 py-2 mt-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: C.textMuted }}>الملاحظات</label>
            <input type="text" value={monthRec?.notes || ""} onChange={e => updateField("notes", e.target.value)}
              placeholder="ملاحظات"
              className="w-full px-3 py-2 mt-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />
          </div>
        </div>
      </Card>

      {/* Timesheets */}
      <Card style={{ padding: 16 }} className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">سجل الدخول والخروج</h3>
          <Btn icon={Plus} onClick={addDay}>إضافة يوم</Btn>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: C.bg }}>
                <th className="text-right px-3 py-2 font-bold text-xs" style={{ color: C.textMuted }}>التاريخ</th>
                <th className="text-right px-3 py-2 font-bold text-xs" style={{ color: C.textMuted }}>وقت الدخول</th>
                <th className="text-right px-3 py-2 font-bold text-xs" style={{ color: C.textMuted }}>وقت الخروج</th>
                <th className="text-right px-3 py-2 font-bold text-xs" style={{ color: C.textMuted }}>الساعات</th>
                <th className="text-right px-3 py-2 font-bold text-xs" style={{ color: C.textMuted }}></th>
              </tr>
            </thead>
            <tbody>
              {ts.map((t, i) => {
                let hours = 0;
                if (t.checkin && t.checkout) {
                  const [h1, m1] = t.checkin.split(":").map(Number);
                  const [h2, m2] = t.checkout.split(":").map(Number);
                  hours = Math.max(0, ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60);
                }
                return (
                  <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td className="px-3 py-2">
                      <input type="date" value={t.date} onChange={e => updateDay(i, "date", e.target.value)}
                        style={{ width: "100%", padding: "4px", border: `1px solid ${C.border}`, borderRadius: "4px", fontSize: "12px" }} />
                    </td>
                    <td className="px-3 py-2">
                      <input type="time" value={t.checkin} onChange={e => updateDay(i, "checkin", e.target.value)}
                        style={{ width: "100%", padding: "4px", border: `1px solid ${C.border}`, borderRadius: "4px", fontSize: "12px" }} />
                    </td>
                    <td className="px-3 py-2">
                      <input type="time" value={t.checkout} onChange={e => updateDay(i, "checkout", e.target.value)}
                        style={{ width: "100%", padding: "4px", border: `1px solid ${C.border}`, borderRadius: "4px", fontSize: "12px" }} />
                    </td>
                    <td className="px-3 py-2 text-xs font-bold" style={{ color: C.primary }}>{fmt(hours)} ساعة</td>
                    <td className="px-3 py-2">
                      <button onClick={() => removeDay(i)} className="p-1 rounded" style={{ border: `1px solid ${C.dangerSoft}` }}>
                        <Trash2 size={12} color={C.danger} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {ts.length === 0 && <EmptyState text="لا توجد أيام مسجلة — اضغط إضافة يوم" />}
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {[
          ["إجمالي الساعات", totalHours, "ساعة", C.primary],
          ["أيام الحضور", workDays, "يوم", C.cash],
          ["بعد الخصم", attendanceDays, "يوم", C.vodafone],
          ["السعر/الساعة", hourlyRate, "ج.م", C.textMuted],
          ["الراتب النهائي", finalSalary, "ج.م", C.primaryDark],
        ].map(([label, val, unit, color]) => (
          <Card key={label} style={{ padding: 12 }}>
            <div className="text-xs font-medium" style={{ color: C.textMuted }}>{label}</div>
            <div className="text-base sm:text-lg font-bold mt-2" style={{ color }}>{fmt(val)}</div>
            <div className="text-xs mt-1" style={{ color: C.textMuted }}>{unit}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ============================= AGGREGATION HELPERS ============================= */
function useRangeAggregate(daysCache, setDaysCache, fromDate, toDate) {
  const [ready, setReady] = useState(false);
  const months = useMemo(() => {
    if (!fromDate || !toDate) return [];
    const list = [];
    let [y, m] = fromDate.split("-").map(Number);
    const [ey, em] = toDate.split("-").map(Number);
    while (y < ey || (y === ey && m <= em)) {
      list.push(`${y}-${pad2(m)}`);
      m++; if (m > 12) { m = 1; y++; }
    }
    return list;
  }, [fromDate, toDate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const missing = months.filter(mk => daysCache[mk] === undefined);
      if (missing.length === 0) { setReady(true); return; }
      setReady(false);
      const results = await Promise.all(missing.map(mk => loadKey(`clinic:days:${mk}`, {})));
      if (cancelled) return;
      setDaysCache(prev => {
        const next = { ...prev };
        missing.forEach((mk, i) => { next[mk] = results[i]; });
        return next;
      });
      setReady(true);
    })();
    return () => { cancelled = true; };
  }, [months.join(",")]);

  const entries = useMemo(() => {
    if (!ready) return [];
    const out = [];
    months.forEach(mk => {
      const data = daysCache[mk] || {};
      Object.entries(data).forEach(([day, list]) => {
        const dateStr = `${mk}-${pad2(Number(day))}`;
        if (dateStr < fromDate || dateStr > toDate) return;
        list.forEach(e => out.push({ ...e, date: dateStr }));
      });
    });
    return out;
  }, [ready, months.join(","), daysCache, fromDate, toDate]);

  return { entries, ready };
}

/* ============================= DASHBOARD PAGE ============================= */
function DashboardPage({ doctors, expenses, daysCache, setDaysCache }) {
  const now = new Date();
  const defFrom = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-01`;
  const defTo = todayISO();
  const [fromDate, setFromDate] = useState(defFrom);
  const [toDate, setToDate] = useState(defTo);
  const { entries, ready } = useRangeAggregate(daysCache, setDaysCache, fromDate, toDate);

  const totalCash = entries.reduce((s, e) => s + Number(e.cash || 0), 0);
  const totalVoda = entries.reduce((s, e) => s + Number(e.vodafone || 0), 0);
  const totalIncome = totalCash + totalVoda;
  const rangeExpenses = expenses.filter(e => e.date >= fromDate && e.date <= toDate);
  const totalExpenses = rangeExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const doctorShareTotal = entries.reduce((s, e) => s + Number(e.amount || 0) * (Number(e.percent || 0) / 100), 0);
  const netMonthly = totalIncome - totalExpenses - doctorShareTotal;

  const byDoctor = useMemo(() => {
    const map = {};
    entries.forEach(e => { map[e.doctorId] = (map[e.doctorId] || 0) + Number(e.amount || 0); });
    return doctors.map(d => ({ name: d.name, total: map[d.id] || 0 })).filter(d => d.total > 0).sort((a, b) => b.total - a.total);
  }, [entries, doctors]);

  return (
    <div>
      <PageHeader title="لوحة التحكم" subtitle="نظرة شاملة على دخل العيادة خلال الفترة المحددة"
        right={<Btn variant="outline" icon={Printer} onClick={() => window.print()}>طباعة</Btn>} />

      <Card style={{ padding: 14 }} className="mb-5">
        <div className="flex flex-wrap items-end gap-3">
          <Input label="من تاريخ" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          <Input label="إلى تاريخ" type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
        </div>
      </Card>

      {!ready ? <EmptyState text="جاري التحميل..." /> : (
        <>
          <div className="grid gap-2 sm:gap-3 mb-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
            {[
              ["إجمالي الدخل", totalIncome, C.primary],
              ["كاش", totalCash, C.cash],
              ["فودافون", totalVoda, C.vodafone],
              ["المصروفات", totalExpenses, C.danger],
              ["نسب الأطباء", doctorShareTotal, C.accent],
              ["صافي الدخل", netMonthly, C.primaryDark],
            ].map(([label, val, color]) => (
              <Card key={label} style={{ padding: 12 }}>
                <div className="text-xs mb-1 font-medium" style={{ color: C.textMuted }}>{label}</div>
                <div className="text-lg sm:text-xl font-extrabold break-words" style={{ color }}>{fmt(val)}</div>
              </Card>
            ))}
          </div>

          <Card style={{ padding: 16 }}>
            <div className="font-bold text-sm mb-3">دخل الأطباء (من الأعلى للأقل)</div>
            {byDoctor.length === 0 ? <EmptyState text="لا يوجد بيانات في هذه الفترة" /> : (
              <ResponsiveContainer width="100%" height={Math.max(220, byDoctor.length * 42)}>
                <BarChart data={byDoctor} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Bar dataKey="total" fill={C.primary} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

/* ============================= REPORTS PAGE ============================= */
function ReportsPage({ doctors, daysCache, setDaysCache }) {
  const nowDate = new Date();
  const curFrom = `${nowDate.getFullYear()}-${pad2(nowDate.getMonth() + 1)}-01`;
  const curTo = todayISO();
  let py = nowDate.getMonth() === 0 ? nowDate.getFullYear() - 1 : nowDate.getFullYear();
  let pm = nowDate.getMonth() === 0 ? 12 : nowDate.getMonth();
  const prevFrom = `${py}-${pad2(pm)}-01`;
  const prevTo = `${py}-${pad2(pm)}-${pad2(daysInMonth(py, pm))}`;

  const [f1, setF1] = useState(prevFrom); const [t1, setT1] = useState(prevTo);
  const [f2, setF2] = useState(curFrom); const [t2, setT2] = useState(curTo);

  const p1 = useRangeAggregate(daysCache, setDaysCache, f1, t1);
  const p2 = useRangeAggregate(daysCache, setDaysCache, f2, t2);

  const agg = (entries) => {
    const map = {};
    entries.forEach(e => { map[e.doctorId] = (map[e.doctorId] || 0) + Number(e.amount || 0); });
    return map;
  };
  const m1 = agg(p1.entries), m2 = agg(p2.entries);
  const t1sum = Object.values(m1).reduce((a, b) => a + b, 0);
  const t2sum = Object.values(m2).reduce((a, b) => a + b, 0);

  const chartData = doctors.map(d => ({ name: d.name, "الفترة الأولى": m1[d.id] || 0, "الفترة الثانية": m2[d.id] || 0 }))
    .filter(d => d["الفترة الأولى"] > 0 || d["الفترة الثانية"] > 0)
    .sort((a, b) => b["الفترة الثانية"] - a["الفترة الثانية"]);

  const currentChartData = doctors.map(d => ({ name: d.name, total: m2[d.id] || 0, percentage: d.percentage }))
    .filter(d => d.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <div>
      <PageHeader title="التقارير" subtitle="ترتيب دخل الأطباء في الفترة الحالية، ومقارنته بفترة سابقة"
        right={<Btn variant="outline" icon={Printer} onClick={() => window.print()}>طباعة</Btn>} />

      <Card style={{ padding: 14 }} className="mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-bold mb-2" style={{ color: C.textMuted }}>الفترة الأولى (سابقة)</div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input type="date" value={f1} onChange={e => setF1(e.target.value)} />
              <Input type="date" value={t1} onChange={e => setT1(e.target.value)} />
            </div>
          </div>
          <div>
            <div className="text-xs font-bold mb-2" style={{ color: C.textMuted }}>الفترة الثانية (حالية)</div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input type="date" value={f2} onChange={e => setF2(e.target.value)} />
              <Input type="date" value={t2} onChange={e => setT2(e.target.value)} />
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ padding: 16 }} className="mb-5">
        <div className="font-bold text-sm mb-4">تقرير الفترة الحالية — دخل الأطباء من الأعلى للأقل</div>
        {currentChartData.length === 0 ? <EmptyState text="لا توجد بيانات في الفترة الحالية" /> : (
          <>
            <RankedIncomeBars data={currentChartData} />
            <table className="w-full text-sm mt-5">
              <thead><tr style={{ background: C.bg }}>{["الترتيب", "الطبيب", "نسبة الطبيب", "إجمالي الدخل", "النسبة من إجمالي الفترة", ""].map(h => <th key={h} className="text-right px-3 py-2 font-bold text-xs" style={{ color: C.textMuted }}>{h}</th>)}</tr></thead>
              <tbody>
                {currentChartData.map((d, i) => {
                  const doc = doctors.find(doc => doc.name === d.name);
                  const filteredEntries = p2.entries.filter(e => e.doctorId === doc?.id);
                  return (
                    <tr key={d.name} style={{ borderTop: `1px solid ${C.border}` }}>
                      <td className="px-3 py-2 font-bold" style={{ color: C.primary }}>#{i + 1}</td>
                      <td className="px-3 py-2 font-semibold">{d.name}</td>
                      <td className="px-3 py-2">{d.percentage}%</td>
                      <td className="px-3 py-2 font-bold">{fmt(d.total)}</td>
                      <td className="px-3 py-2">{t2sum > 0 ? fmt((d.total / t2sum) * 100) : 0}%</td>
                      <td className="px-3 py-2">
                        <button onClick={() => generateDoctorPDF(doc, filteredEntries, daysCache, [], nowDate.getFullYear(), nowDate.getMonth() + 1)}
                          className="p-1.5 rounded-lg hover:opacity-70" style={{ border: `1px solid ${C.border}` }}
                          title={`تحميل تقرير ${d.name} كـ PDF`}>
                          <FileText size={14} color={C.primary} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </Card>

      <Card style={{ padding: 16 }} className="mb-5">
        <div className="font-bold text-sm mb-3">مقارنة إجمالي الدخل: {fmt(t1sum)} ← {fmt(t2sum)}
          <span style={{ color: t2sum >= t1sum ? C.primary : C.danger }}> ({t2sum >= t1sum ? "+" : ""}{fmt(t2sum - t1sum)})</span>
        </div>
        {chartData.length === 0 ? <EmptyState text="لا توجد بيانات كافية للمقارنة" /> : (
          <ResponsiveContainer width="100%" height={Math.max(240, chartData.length * 46)}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend />
              <Bar dataKey="الفترة الأولى" fill="#B7C9C4" radius={[0, 6, 6, 0]} />
              <Bar dataKey="الفترة الثانية" fill={C.primary} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card>
        <table className="w-full text-sm">
          <thead><tr style={{ background: C.bg }}>{["الطبيب", "النسبة", "الفترة الأولى", "الفترة الثانية", "الفرق", ""].map(h => <th key={h} className="text-right px-4 py-2.5 font-bold text-xs" style={{ color: C.textMuted }}>{h}</th>)}</tr></thead>
          <tbody>
            {doctors.map(d => {
              const a = m1[d.id] || 0, b = m2[d.id] || 0;
              if (!a && !b) return null;
              const filteredEntries = p2.entries.filter(e => e.doctorId === d.id);
              return (
                <tr key={d.id} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td className="px-4 py-2.5 font-semibold">{d.name}</td>
                  <td className="px-4 py-2.5">{d.percentage}%</td>
                  <td className="px-4 py-2.5">{fmt(a)}</td>
                  <td className="px-4 py-2.5 font-bold">{fmt(b)}</td>
                  <td className="px-4 py-2.5" style={{ color: b >= a ? C.primary : C.danger }}>{b >= a ? "+" : ""}{fmt(b - a)}</td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => generateDoctorPDF(d, filteredEntries, daysCache, [], nowDate.getFullYear(), nowDate.getMonth() + 1)}
                      className="p-1.5 rounded-lg hover:opacity-70" style={{ border: `1px solid ${C.border}` }}
                      title={`تحميل تقرير ${d.name} كـ PDF`}>
                      <FileText size={14} color={C.primary} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ============================= SUMMARY PAGE ============================= */
function SummaryPage({ monthKey, selYear, selMonth, setSelYear, setSelMonth, daysCache, expenses }) {
  const total = daysInMonth(selYear, selMonth);
  const monthData = daysCache[monthKey] || {};
  let cumulative = 0;
  const rows = Array.from({ length: total }, (_, i) => i + 1).map(d => {
    const entries = monthData[String(d)] || [];
    const cash = entries.reduce((s, e) => s + Number(e.cash || 0), 0);
    const voda = entries.reduce((s, e) => s + Number(e.vodafone || 0), 0);
    const totalIncome = cash + voda;
    cumulative += totalIncome;
    return { day: d, date: `${selYear}-${pad2(selMonth)}-${pad2(d)}`, weekday: AR_WEEKDAYS[new Date(selYear, selMonth - 1, d).getDay()], cash, voda, totalIncome, cumulative };
  });

  return (
    <div>
      <PageHeader title="الملخص الشهري" subtitle="جدول تفصيلي لدخل كل يوم في الشهر"
        right={<div className="flex items-center gap-2"><MonthNav {...{ selYear, selMonth, setSelYear, setSelMonth }} /><Btn variant="outline" icon={Printer} onClick={() => window.print()}>طباعة</Btn></div>} />
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: C.bg }}>
              {["التاريخ", "اليوم", "كاش", "فودافون", "إجمالي اليوم", "الإجمالي التراكمي"].map(h => <th key={h} className="text-right px-4 py-2.5 font-bold text-xs" style={{ color: C.textMuted }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.day} style={{ borderTop: `1px solid ${C.border}`, background: r.totalIncome === 0 ? "transparent" : undefined }}>
                <td className="px-4 py-2">{r.date}</td>
                <td className="px-4 py-2">{r.weekday}</td>
                <td className="px-4 py-2" style={{ color: C.cash }}>{fmt(r.cash)}</td>
                <td className="px-4 py-2" style={{ color: C.vodafone }}>{fmt(r.voda)}</td>
                <td className="px-4 py-2 font-semibold">{fmt(r.totalIncome)}</td>
                <td className="px-4 py-2 font-bold" style={{ color: C.primaryDark }}>{fmt(r.cumulative)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ============================= AUDIT PAGE ============================= */
function AuditPage({ auditLog }) {
  return (
    <div>
      <PageHeader title="سجل الحركات (Audit Log)" subtitle="كل عمليات الإضافة والتعديل والحذف وتسجيل الدخول" />
      <Card>
        <table className="w-full text-sm">
          <thead><tr style={{ background: C.bg }}>{["الوقت", "المستخدم", "العملية", "التفاصيل"].map(h => <th key={h} className="text-right px-4 py-2.5 font-bold text-xs" style={{ color: C.textMuted }}>{h}</th>)}</tr></thead>
          <tbody>
            {auditLog.map(a => (
              <tr key={a.id} style={{ borderTop: `1px solid ${C.border}` }}>
                <td className="px-4 py-2 text-xs" style={{ color: C.textMuted }}>{new Date(a.ts).toLocaleString("ar-EG")}</td>
                <td className="px-4 py-2 font-semibold">{a.user}</td>
                <td className="px-4 py-2"><Badge>{a.action}</Badge></td>
                <td className="px-4 py-2 text-xs" style={{ color: C.textMuted }}>{a.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {auditLog.length === 0 && <EmptyState text="لا توجد حركات مسجلة بعد" />}
      </Card>
    </div>
  );
}

/* ============================= USERS PAGE (admin only) ============================= */
function UsersPage({ users, saveUsers, config, saveConfig, log }) {
  const [modal, setModal] = useState(null);
  const empty = { username: "", pin: "", permissions: [] };
  const [form, setForm] = useState(empty);
  const [editPinVal, setEditPinVal] = useState(config.editPin);
  const [adminPinModal, setAdminPinModal] = useState(false);
  const [adminPinForm, setAdminPinForm] = useState({ oldPin: "", newPin: "", confirmPin: "" });
  const [adminPinErr, setAdminPinErr] = useState("");

  const openAdd = () => { setForm(empty); setModal({ mode: "add" }); };
  const openEdit = (u) => { setForm(u); setModal({ mode: "edit" }); };

  const togglePerm = (key) => setForm(f => ({ ...f, permissions: f.permissions.includes(key) ? f.permissions.filter(p => p !== key) : [...f.permissions, key] }));

  const submit = () => {
    if (!form.username || !form.pin) return;
    if (modal.mode === "add") {
      const u = { id: uid(), ...form };
      saveUsers([...users, u]);
      log("إضافة مستخدم", form.username);
    } else {
      saveUsers(users.map(u => u.id === form.id ? form : u));
      log("تعديل مستخدم", form.username);
    }
    setModal(null);
  };
  const remove = (u) => { saveUsers(users.filter(x => x.id !== u.id)); log("حذف مستخدم", u.username); };

  const saveEditPin = () => { saveConfig({ ...config, editPin: editPinVal }); log("تغيير الرقم السري للتعديل/الحذف", "—"); };

  const changeAdminPin = () => {
    setAdminPinErr("");
    if (adminPinForm.oldPin !== ADMIN_PIN && adminPinForm.oldPin !== (config.adminPin || ADMIN_PIN)) {
      setAdminPinErr("الرقم السري القديم غير صحيح");
      return;
    }
    if (!adminPinForm.newPin || adminPinForm.newPin.length < 4) {
      setAdminPinErr("الرقم السري الجديد يجب أن يكون 4 أرقام على الأقل");
      return;
    }
    if (adminPinForm.newPin !== adminPinForm.confirmPin) {
      setAdminPinErr("الرقم السري الجديد وتأكيده غير متطابقان");
      return;
    }
    saveConfig({ ...config, adminPin: adminPinForm.newPin });
    log("تغيير كلمة المرور للأدمن", "—");
    setAdminPinModal(false);
    setAdminPinForm({ oldPin: "", newPin: "", confirmPin: "" });
  };

  return (
    <div>
      <PageHeader title="إدارة المستخدمين والصلاحيات" subtitle="متاح للأدمن فقط"
        right={<Btn icon={Plus} onClick={openAdd}>إضافة مستخدم</Btn>} />

      {/* Admin Password Change */}
      <Card style={{ padding: 16 }} className="mb-5">
        <div className="font-bold text-sm mb-2 flex items-center gap-2"><Lock size={15} color={C.danger} /> كلمة المرور الخاصة بالأدمن</div>
        <p className="text-xs mb-3" style={{ color: C.textMuted }}>غيّر كلمة المرور الخاصة بحسابك الأدمن (الحالية: {ADMIN_PIN})</p>
        <Btn icon={Pencil} onClick={() => { setAdminPinForm({ oldPin: "", newPin: "", confirmPin: "" }); setAdminPinErr(""); setAdminPinModal(true); }}>تغيير كلمة المرور</Btn>
      </Card>

      <Card style={{ padding: 16 }} className="mb-5">
        <div className="font-bold text-sm mb-2 flex items-center gap-2"><KeyRound size={15} /> الرقم السري الخاص بالتعديل/الحذف</div>
        <p className="text-xs mb-3" style={{ color: C.textMuted }}>هذا الرقم مطلوب لأي عملية تعديل أو حذف في صفحات الأيام والمصروفات والأطباء.</p>
        <div className="flex gap-2">
          <Input type="text" value={editPinVal} onChange={e => setEditPinVal(e.target.value)} style={{ width: 180 }} />
          <Btn icon={Check} onClick={saveEditPin}>حفظ</Btn>
        </div>
      </Card>

      <Card>
        <table className="w-full text-sm">
          <thead><tr style={{ background: C.bg }}>{["المستخدم", "الصلاحيات", ""].map(h => <th key={h} className="text-right px-4 py-2.5 font-bold text-xs" style={{ color: C.textMuted }}>{h}</th>)}</tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderTop: `1px solid ${C.border}` }}>
                <td className="px-4 py-2.5 font-semibold flex items-center gap-2"><UserIcon size={14} color={C.textMuted} /> {u.username}</td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {u.permissions.map(p => <Badge key={p}>{PAGES.find(pg => pg.key === p)?.label || p}</Badge>)}
                  </div>
                </td>
                <td className="px-4 py-2.5"><div className="flex gap-2 justify-end">
                  <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg" style={{ border: `1px solid ${C.border}` }}><Pencil size={14} /></button>
                  <button onClick={() => remove(u)} className="p-1.5 rounded-lg" style={{ border: `1px solid ${C.dangerSoft}` }}><Trash2 size={14} color={C.danger} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <EmptyState text="لا يوجد مستخدمون إضافيون — الأدمن فقط مسجل الدخول" />}
      </Card>

      {modal && (
        <Modal title={modal.mode === "add" ? "إضافة مستخدم" : "تعديل مستخدم"} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-3">
            <Input label="اسم المستخدم" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
            <Input label="الرقم السري لتسجيل الدخول" value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value }))} />
            <div>
              <div className="text-xs mb-1.5" style={{ color: C.textMuted }}>الصفحات المسموح بها</div>
              <div className="flex flex-wrap gap-2">
                {PAGES.filter(p => p.key !== "users").map(p => (
                  <button key={p.key} onClick={() => togglePerm(p.key)} type="button"
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: form.permissions.includes(p.key) ? C.primarySoft : C.bg, color: form.permissions.includes(p.key) ? C.primaryDark : C.textMuted, border: `1px solid ${C.border}` }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Btn variant="ghost" onClick={() => setModal(null)}>إلغاء</Btn>
              <Btn icon={Check} onClick={submit}>حفظ</Btn>
            </div>
          </div>
        </Modal>
      )}

      {adminPinModal && (
        <Modal title="تغيير كلمة المرور - الأدمن" onClose={() => setAdminPinModal(false)} width={380}>
          <div className="flex flex-col gap-3">
            <Input label="الرقم السري القديم" type="password" value={adminPinForm.oldPin} 
              onChange={e => { setAdminPinForm(f => ({ ...f, oldPin: e.target.value })); setAdminPinErr(""); }} 
              autoFocus />
            <Input label="الرقم السري الجديد" type="password" value={adminPinForm.newPin} 
              onChange={e => { setAdminPinForm(f => ({ ...f, newPin: e.target.value })); setAdminPinErr(""); }} />
            <Input label="تأكيد الرقم السري الجديد" type="password" value={adminPinForm.confirmPin} 
              onChange={e => { setAdminPinForm(f => ({ ...f, confirmPin: e.target.value })); setAdminPinErr(""); }} />
            {adminPinErr && <div className="text-xs p-2 rounded" style={{ background: C.dangerSoft, color: C.danger }}>{adminPinErr}</div>}
            <div className="flex justify-end gap-2 pt-2">
              <Btn variant="ghost" onClick={() => setAdminPinModal(false)}>إلغاء</Btn>
              <Btn icon={Check} onClick={changeAdminPin}>تغيير كلمة المرور</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ============================= BACKUP PAGE ============================= */
function BackupPage({ doctors, expenses, salaries, users, auditLog, config, daysCache, setDaysCache, saveDoctors, saveExpenses, saveSalaries, saveUsers, saveConfig, log, monthKey }) {
  const [busy, setBusy] = useState(false);
  const [importErr, setImportErr] = useState("");
  const [autoBackups, setAutoBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(true);
  const fileRef = useRef(null);

  // تحميل النسخ الاحتياطية التلقائية المتاحة
  useEffect(() => {
    (async () => {
      try {
        const backups = [];
        // البحث عن النسخ الاحتياطية لآخر 30 يوم
        for (let i = 0; i < 30; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          try {
            const backup = await window.storage.get(`clinic:backup:${dateStr}`, true);
            if (backup && backup.value) {
              const backupData = typeof backup.value === 'string' ? JSON.parse(backup.value) : backup.value;
              backups.push({
                date: dateStr,
                timestamp: backupData.timestamp,
                data: backupData
              });
            }
          } catch (e) {
            // تجاهل النسخ غير الموجودة
          }
        }
        setAutoBackups(backups.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (e) {
        console.error("خطأ في تحميل النسخ الاحتياطية:", e);
      }
      setLoadingBackups(false);
    })();
  }, []);

  const restoreAutoBackup = async (backup) => {
    if (!window.confirm(`هل تريد استعادة النسخة الاحتياطية من ${backup.date}؟ سيتم استبدال البيانات الحالية.`)) return;
    
    try {
      setBusy(true);
      const data = backup.data;
      if (data.doctors) saveDoctors(data.doctors);
      if (data.expenses) saveExpenses(data.expenses);
      if (data.salaries) saveSalaries(data.salaries);
      if (data.users) saveUsers(data.users);
      if (data.config) saveConfig(data.config);
      log("استعادة نسخة احتياطية تلقائية", `من ${backup.date}`);
      alert("تم استعادة النسخة بنجاح. قد تحتاج لتحديث الصفحة.");
      setBusy(false);
    } catch (err) {
      setImportErr("خطأ في الاستعادة");
      setBusy(false);
    }
  };

  const exportAll = async () => {
    setBusy(true);
    // gather all days keys currently known + list from storage
    let allDaysKeys = [];
    try {
      const list = await window.storage.list("clinic:days:", true);
      allDaysKeys = list?.keys || [];
    } catch (e) {}
    const daysData = {};
    for (const k of allDaysKeys) {
      const v = await loadKey(k, {});
      daysData[k.replace("clinic:days:", "")] = v;
    }
    const payload = { exportedAt: new Date().toISOString(), doctors, expenses, salaries, users, auditLog, config, days: daysData };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `نسخة-احتياطية-العيادة-${todayISO()}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    log("تصدير نسخة احتياطية", `${todayISO()}`);
    setBusy(false);
  };

  const importFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportErr("");
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result);
        setBusy(true);
        if (data.doctors) saveDoctors(data.doctors);
        if (data.expenses) saveExpenses(data.expenses);
        if (data.salaries) saveSalaries(data.salaries);
        if (data.users) saveUsers(data.users);
        if (data.config) saveConfig(data.config);
        if (data.days) {
          for (const [mk, val] of Object.entries(data.days)) {
            await saveKey(`clinic:days:${mk}`, val);
          }
          setDaysCache(prev => ({ ...prev, ...data.days }));
        }
        log("استيراد نسخة احتياطية", file.name);
        setBusy(false);
      } catch (err) {
        setImportErr("الملف غير صالح أو تالف");
        setBusy(false);
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <PageHeader title="النسخ الاحتياطي والاسترجاع" subtitle="حماية بيانات العيادة من الفقدان" />

      <Card style={{ padding: 20 }}>
        <div className="flex items-center gap-2 mb-2 font-bold"><AlertTriangle size={16} color={C.accent} /> ملاحظة مهمة</div>
        <p className="text-xs leading-6" style={{ color: C.textMuted }}>
          التطبيق يعمل نسخة احتياطية تلقائية يوميًا عند فتحه. يمكنك استعادة أي نسخة من آخر 30 يوم أدناه.
          كما يمكنك تصدير ملف JSON يحتوي كل البيانات لحفظ إضافي.
        </p>
      </Card>

      {/* النسخ الاحتياطية التلقائية */}
      <Card style={{ padding: 20 }} className="mb-4">
        <div className="flex items-center gap-2 mb-3 font-bold"><DatabaseBackup size={16} color={C.primary} /> النسخ الاحتياطية التلقائية</div>
        {loadingBackups ? (
          <p className="text-xs" style={{ color: C.textMuted }}>جاري التحميل...</p>
        ) : autoBackups.length === 0 ? (
          <p className="text-xs" style={{ color: C.textMuted }}>لا توجد نسخ احتياطية حتى الآن. ستُنشأ تلقائياً عند فتح التطبيق غداً.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: C.bg }}>
                  <th className="text-right px-4 py-2 font-bold text-xs" style={{ color: C.textMuted }}>التاريخ</th>
                  <th className="text-right px-4 py-2 font-bold text-xs" style={{ color: C.textMuted }}>الوقت</th>
                  <th className="text-right px-4 py-2 font-bold text-xs" style={{ color: C.textMuted }}>الحالة</th>
                  <th className="text-right px-4 py-2 font-bold text-xs" style={{ color: C.textMuted }}></th>
                </tr>
              </thead>
              <tbody>
                {autoBackups.map((backup, idx) => (
                  <tr key={backup.date} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td className="px-4 py-2 font-semibold">{backup.date}</td>
                    <td className="px-4 py-2 text-xs" style={{ color: C.textMuted }}>
                      {new Date(backup.timestamp).toLocaleTimeString('ar-EG')}
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-xs px-2 py-1 rounded" style={{ background: C.primarySoft, color: C.primaryDark }}>
                        {idx === 0 ? "الأحدث ✓" : "نسخة سابقة"}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button 
                        onClick={() => restoreAutoBackup(backup)}
                        disabled={busy}
                        className="px-3 py-1 text-xs rounded font-bold"
                        style={{ background: C.primarySoft, color: C.primaryDark, border: `1px solid ${C.primary}`, cursor: 'pointer' }}>
                        استعادة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card style={{ padding: 20 }}>
          <div className="flex items-center gap-2 mb-2 font-bold"><Download size={16} color={C.primary} /> تصدير نسخة احتياطية</div>
          <p className="text-xs mb-4" style={{ color: C.textMuted }}>ينزّل ملف JSON يحتوي كل البيانات: الأيام، الأطباء، المصروفات، المرتبات، المستخدمين، السجلات.</p>
          <Btn icon={Download} onClick={exportAll} disabled={busy}>{busy ? "جارٍ التجهيز..." : "تصدير الآن"}</Btn>
        </Card>
        <Card style={{ padding: 20 }}>
          <div className="flex items-center gap-2 mb-2 font-bold"><Upload size={16} color={C.accent} /> استيراد نسخة سابقة</div>
          <p className="text-xs mb-4" style={{ color: C.textMuted }}>سيتم استبدال البيانات الحالية بالبيانات الموجودة في الملف المستورد.</p>
          <input ref={fileRef} type="file" accept="application/json" onChange={importFile} className="hidden" id="import-file" />
          <Btn variant="outline" icon={Upload} onClick={() => fileRef.current?.click()} disabled={busy}>اختر ملف واستورد</Btn>
          {importErr && <div className="text-xs mt-2" style={{ color: C.danger }}>{importErr}</div>}
        </Card>
      </div>
    </div>
  );
}
