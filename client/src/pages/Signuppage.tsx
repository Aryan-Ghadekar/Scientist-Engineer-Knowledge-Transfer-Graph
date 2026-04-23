// src/pages/Signuppage.tsx
import React, { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Rocket, Cpu, FlaskConical, Microscope, GraduationCap, BookOpen, Sparkles,
  Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Check,
} from "lucide-react";
import authService from "../components/types/authservice";
import { useAuth } from "../components/auth/Authcontext";
import { PROFESSIONS, type ProfessionType, type ProfessionMeta } from "../components/types/auth.types";

// ─── Icon map ────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ReactNode> = {
  Cpu:           <Cpu           className="w-6 h-6" />,
  FlaskConical:  <FlaskConical  className="w-6 h-6" />,
  Microscope:    <Microscope    className="w-6 h-6" />,
  GraduationCap: <GraduationCap className="w-6 h-6" />,
  BookOpen:      <BookOpen      className="w-6 h-6" />,
  Sparkles:      <Sparkles      className="w-6 h-6" />,
};

const STEPS = ["Profession", "Profile", "Account"] as const;

interface FormState {
  profession:   ProfessionType | null;
  full_name:    string;
  username:     string;
  organization: string;
  department:   string;
  email:        string;
  password:     string;
  confirmPwd:   string;
}

const INITIAL: FormState = {
  profession: null, full_name: "", username: "", organization: "",
  department: "", email: "", password: "", confirmPwd: "",
};

// ─── Sub-components ──────────────────────────────────────────────

const StepIndicator: React.FC<{ current: number }> = ({ current }) => (
  <div className="flex items-center justify-center gap-3 mb-8">
    {STEPS.map((label, i) => {
      const done = i < current, active = i === current;
      return (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
              ${done   ? "bg-primary text-on-primary-fixed" : ""}
              ${active ? "bg-primary/20 border-2 border-primary text-primary" : ""}
              ${!done && !active ? "bg-surface-container border border-outline-variant/20 text-on-surface-variant" : ""}`}>
              {done ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-[10px] font-bold tracking-widest uppercase ${active ? "text-primary" : "text-on-surface-variant/50"}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px w-10 transition-all ${done ? "bg-primary" : "bg-outline-variant/20"}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const ProfessionCard: React.FC<{ meta: ProfessionMeta; selected: boolean; onClick: () => void }> = ({ meta, selected, onClick }) => (
  <button onClick={onClick}
    className={`relative p-5 rounded-2xl border text-left transition-all duration-200 active:scale-95 group
      ${selected ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-lg shadow-primary/10"
                 : "border-outline-variant/15 bg-surface-container hover:border-primary/30 hover:bg-primary/5"}`}>
    {selected && <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-primary" />}
    <div className={`mb-3 ${selected ? "text-primary" : "text-on-surface-variant group-hover:text-primary"}`}>
      {ICON_MAP[meta.icon]}
    </div>
    <p className={`font-bold text-sm mb-0.5 ${selected ? "text-primary" : "text-on-surface"}`}>{meta.label}</p>
    <p className="text-on-surface-variant text-[11px] leading-relaxed">{meta.description}</p>
  </button>
);

interface InputFieldProps {
  label: string; name: keyof FormState; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; optional?: boolean; hint?: string;
  suffix?: React.ReactNode; error?: string;
}
const InputField: React.FC<InputFieldProps> = ({ label, name, type = "text", value, onChange, placeholder, optional, hint, suffix, error }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant">{label}</label>
      {optional && <span className="text-[10px] text-on-surface-variant/50 bg-surface-container px-2 py-0.5 rounded-full font-medium">Optional</span>}
    </div>
    <div className="relative">
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className={`w-full bg-surface-container border rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 text-sm outline-none transition-all ${suffix ? "pr-12" : ""}
          ${error ? "border-error/40 focus:border-error/60 focus:ring-2 focus:ring-error/10"
                  : "border-outline-variant/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"}`} />
      {suffix && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant">{suffix}</div>}
    </div>
    {hint && !error && <p className="mt-1 text-[11px] text-on-surface-variant/60">{hint}</p>}
    {error && <p className="mt-1 text-[11px] text-error flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
  </div>
);

// ─── Main ────────────────────────────────────────────────────────

const SignupPage: React.FC = () => {
  const navigate       = useNavigate();
  const { refresh }    = useAuth();   // ← use refresh() to sync context after signup

  const [step, setStep]               = useState(0);
  const [form, setForm]               = useState<FormState>(INITIAL);
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    if (globalError) setGlobalError(null);
  };

  const checkUsername = useCallback((() => {
    let timer: ReturnType<typeof setTimeout>;
    return (username: string) => {
      clearTimeout(timer);
      if (username.length < 3) { setUsernameStatus("idle"); return; }
      setUsernameStatus("checking");
      timer = setTimeout(async () => {
        try {
          const res = await authService.checkUsername(username);
          setUsernameStatus(res.available ? "available" : "taken");
          if (!res.available) setFieldErrors((p) => ({ ...p, username: "Username already taken" }));
        } catch { setUsernameStatus("idle"); }
      }, 500);
    };
  })(), []);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    checkUsername(e.target.value);
  };

  const validateStep = (): boolean => {
    const errors: Partial<Record<keyof FormState, string>> = {};
    if (step === 0 && !form.profession) { setGlobalError("Please select your profession."); return false; }
    if (step === 1) {
      if (!form.full_name.trim()) errors.full_name = "Full name is required.";
      if (!form.username.trim())  errors.username  = "Username is required.";
      else if (form.username.length < 3) errors.username = "At least 3 characters.";
      else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) errors.username = "Letters, numbers, underscore only.";
      if (usernameStatus === "taken") errors.username = "Username already taken.";
    }
    if (step === 2) {
      if (!form.email.trim()) errors.email = "Email is required.";
      else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = "Invalid email.";
      if (!form.password) errors.password = "Password is required.";
      else if (form.password.length < 8) errors.password = "At least 8 characters.";
      else if (!/[A-Z]/.test(form.password)) errors.password = "Include one uppercase letter.";
      else if (!/[0-9]/.test(form.password)) errors.password = "Include one number.";
      if (form.password !== form.confirmPwd) errors.confirmPwd = "Passwords do not match.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => { if (validateStep()) setStep((s) => s + 1); };
  const handleBack = () => { setStep((s) => s - 1); setGlobalError(null); setFieldErrors({}); };

  const handleSubmit = async () => {
    if (!validateStep() || !form.profession) return;
    setLoading(true);
    setGlobalError(null);
    try {
      // 1. Call API (stores tokens in localStorage)
      await authService.signup({
        email:        form.email,
        password:     form.password,
        username:     form.username.toLowerCase(),
        full_name:    form.full_name,
        profession:   form.profession,
        organization: form.organization || undefined,
        department:   form.department   || undefined,
      });
      // 2. Sync AuthContext so isAuthed becomes true immediately
      await refresh();
      // 3. Navigate
      navigate("/", { replace: true });
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const usernameSuffix = usernameStatus === "checking"
    ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
    : usernameStatus === "available" ? <CheckCircle2 className="w-4 h-4 text-primary" />
    : usernameStatus === "taken"     ? <AlertCircle  className="w-4 h-4 text-error"   />
    : null;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg">
              <Rocket className="w-7 h-7 text-on-primary-fixed" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="px-3 py-1 rounded-full bg-primary-container/20 text-primary text-[10px] font-bold tracking-widest uppercase border border-primary/20">Join the Network</span>
          </div>
          <h1 className="text-3xl font-bold font-headline text-on-surface tracking-tight mb-1">Create your account</h1>
          <p className="text-on-surface-variant text-sm font-light">Connect science and engineering in one graph</p>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/15 rounded-2xl p-8 shadow-xl">
          <StepIndicator current={step} />

          {globalError && (
            <div className="flex items-center gap-3 bg-error-container/20 border border-error/20 rounded-xl px-4 py-3 text-error text-sm mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" /><span>{globalError}</span>
            </div>
          )}

          {/* Step 0 — Profession */}
          {step === 0 && (
            <div>
              <h2 className="text-lg font-bold font-headline text-on-surface mb-1">What's your role?</h2>
              <p className="text-on-surface-variant text-sm mb-6 font-light">This helps us tailor your graph experience.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PROFESSIONS.map((p) => (
                  <ProfessionCard key={p.value} meta={p} selected={form.profession === p.value}
                    onClick={() => { setForm((prev) => ({ ...prev, profession: p.value })); setGlobalError(null); }} />
                ))}
              </div>
            </div>
          )}

          {/* Step 1 — Profile */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold font-headline text-on-surface mb-1">Tell us about yourself</h2>
                <p className="text-on-surface-variant text-sm font-light">Your public identity on the knowledge graph.</p>
              </div>
              <InputField label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} placeholder="Ada Lovelace" error={fieldErrors.full_name} />
              <InputField label="Username" name="username" value={form.username} onChange={handleUsernameChange} placeholder="ada_research"
                hint="3–50 chars · letters, numbers, underscore" suffix={usernameSuffix} error={fieldErrors.username} />
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-on-surface-variant mb-2">Profession</label>
                <div className="flex items-center gap-3 bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3">
                  <span className="text-primary">{ICON_MAP[PROFESSIONS.find((p) => p.value === form.profession)?.icon ?? "Sparkles"]}</span>
                  <span className="text-on-surface text-sm font-medium capitalize">{PROFESSIONS.find((p) => p.value === form.profession)?.label}</span>
                  <button onClick={() => setStep(0)} className="ml-auto text-[11px] text-primary hover:underline font-bold">Change</button>
                </div>
              </div>
              <InputField label="Organization / University" name="organization" value={form.organization} onChange={handleChange} placeholder="MIT CSAIL, Stanford…" optional />
              <InputField label="Department / Field" name="department" value={form.department} onChange={handleChange} placeholder="Machine Learning, Bioengineering…" optional />
            </div>
          )}

          {/* Step 2 — Credentials */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold font-headline text-on-surface mb-1">Secure your account</h2>
                <p className="text-on-surface-variant text-sm font-light">Your login credentials — keep them safe.</p>
              </div>
              <InputField label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} placeholder="ada@university.edu" error={fieldErrors.email} />
              <InputField label="Password" name="password" type={showPwd ? "text" : "password"} value={form.password} onChange={handleChange}
                placeholder="Min 8 chars, 1 uppercase, 1 number" error={fieldErrors.password}
                suffix={<button type="button" onClick={() => setShowPwd((v) => !v)} className="hover:text-primary transition-colors">{showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>} />
              <InputField label="Confirm Password" name="confirmPwd" type={showConfirm ? "text" : "password"} value={form.confirmPwd} onChange={handleChange}
                placeholder="Repeat your password" error={fieldErrors.confirmPwd}
                suffix={<button type="button" onClick={() => setShowConfirm((v) => !v)} className="hover:text-primary transition-colors">{showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>} />
              <div className="bg-surface-container rounded-xl border border-outline-variant/15 p-4 space-y-2 text-sm">
                <p className="text-xs font-bold tracking-widest uppercase text-on-surface-variant mb-3">Account Summary</p>
                <div className="flex justify-between"><span className="text-on-surface-variant">Username</span><span className="text-on-surface font-medium">@{form.username}</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Role</span><span className="text-on-surface font-medium capitalize">{form.profession}</span></div>
                {form.organization && <div className="flex justify-between"><span className="text-on-surface-variant">Organization</span><span className="text-on-surface font-medium">{form.organization}</span></div>}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className={`flex gap-3 mt-8 ${step > 0 ? "justify-between" : "justify-end"}`}>
            {step > 0 && (
              <button onClick={handleBack} className="flex items-center gap-2 px-5 py-3 rounded-xl border border-outline-variant/20 text-on-surface-variant text-sm font-bold hover:bg-surface-container-high transition-all active:scale-95">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step < 2 ? (
              <button onClick={handleNext} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed text-sm font-bold transition-all active:scale-95 shadow-lg shadow-primary/20 ml-auto">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed text-sm font-bold transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary/20 ml-auto">
                {loading ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Creating account…</> : <><Rocket className="w-4 h-4" /> Launch Account</>}
              </button>
            )}
          </div>

          {step === 0 && (
            <p className="text-center text-sm text-on-surface-variant mt-6">
              Already a member?{" "}
              <Link to="/auth/login" className="text-primary font-bold hover:underline">Sign in →</Link>
            </p>
          )}
        </div>

        <p className="text-center text-xs text-on-surface-variant/40 mt-6 font-light tracking-wide">
          Scientist–Engineer Knowledge Transfer Graph
        </p>
      </div>
    </div>
  );
};

export default SignupPage;