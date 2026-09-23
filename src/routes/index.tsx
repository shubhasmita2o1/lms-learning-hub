import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import campusImage from "@/assets/unisphere-campus.jpg";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthApiError, getSafeRedirect, login } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email address is required").email("Enter a valid email address").max(254),
  password: z.string().min(1, "Password is required").max(128, "Password is too long"),
  tenantId: z
    .string()
    .trim()
    .max(24)
    .refine((value) => !value || /^[0-9a-fA-F]{24}$/.test(value), {
      message: "Institution ID must be a 24-character identifier",
    }),
});

type LoginValues = z.infer<typeof loginSchema>;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign In — UniSphere" },
      { name: "description", content: "Sign in to your UniSphere university learning workspace." },
      { property: "og:title", content: "Sign In — UniSphere" },
      { property: "og:description", content: "Access your courses, campus resources, and academic workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className={cn("grid shrink-0 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm", compact ? "size-9" : "size-11")}>
        <GraduationCap className={compact ? "size-5" : "size-6"} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className={cn("truncate font-display font-semibold leading-none", compact ? "text-xl" : "text-2xl")}>UniSphere</p>
        <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-current/65">Digital Campus</p>
      </div>
    </div>
  );
}

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showInstitution, setShowInstitution] = useState(false);
  const [tenantCandidates, setTenantCandidates] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const defaultTenantId = import.meta.env["VITE_DEFAULT_TENANT_ID"] || "";
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", tenantId: defaultTenantId },
  });
  const selectedTenant = watch("tenantId");

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);
    setSuccessMessage(null);
    setTenantCandidates([]);
    try {
      await login({
        email: values.email,
        password: values.password,
        ...(values.tenantId ? { tenantId: values.tenantId } : {}),
      });
      setSuccessMessage("Signed in successfully. Opening your workspace…");
      const destination = getSafeRedirect(new URLSearchParams(window.location.search).get("from"));
      window.setTimeout(() => window.location.assign(destination), 350);
    } catch (error) {
      if (error instanceof AuthApiError && error.code === "TENANT_REQUIRED" && error.details?.tenantIds?.length) {
        setTenantCandidates(error.details.tenantIds);
        setShowInstitution(true);
        setServerError("Your email belongs to more than one institution. Choose the correct campus to continue.");
        return;
      }
      setServerError(error instanceof Error ? error.message : "Authentication failed. Please verify your credentials.");
    }
  };

  return (
    <main className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(520px,0.92fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-brand-deep text-primary-foreground lg:flex lg:flex-col lg:justify-between" aria-label="UniSphere digital campus">
        <img src={campusImage} alt="Students walking through a modern university learning commons at dusk" width={1280} height={1536} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-brand-deep/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-deep/75 via-brand-deep/20 to-brand-deep/90" />

        <header className="relative z-10 p-10 xl:p-14">
          <BrandMark />
        </header>

        <div className="relative z-10 max-w-2xl p-10 xl:p-14">
          <div className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
            <span className="h-px w-8 bg-brand-teal" />
            One campus. Every possibility.
          </div>
          <h2 className="max-w-xl font-display text-5xl font-medium leading-[1.04] xl:text-6xl">
            Your academic world, thoughtfully connected.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-7 text-primary-foreground/75">
            Learn, collaborate, and stay connected to your university community—all from one secure workspace.
          </p>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 border-t border-primary-foreground/20 pt-6 text-sm text-primary-foreground/80">
            <span className="flex items-center gap-2"><BookOpen className="size-4 text-brand-teal" /> Courses</span>
            <span className="flex items-center gap-2"><Building2 className="size-4 text-brand-teal" /> Campus</span>
            <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-brand-teal" /> Secure</span>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen flex-col bg-background">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border px-5 py-4 lg:hidden">
          <BrandMark compact />
          <span className="shrink-0 text-xs font-medium text-muted-foreground">University LMS</span>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10 lg:px-14 xl:px-20">
          <div className="auth-rise w-full max-w-md">
            <div className="mb-8">
              <div className="mb-5 hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary lg:flex">
                <span className="grid size-7 place-items-center rounded-md bg-brand-soft"><GraduationCap className="size-4" /></span>
                University learning workspace
              </div>
              <h1 className="font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">Welcome Back</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">Sign in to continue to your learning workspace.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <div aria-live="polite" className="space-y-3">
                {serverError && (
                  <div role="alert" className="flex items-start gap-3 rounded-md border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                    <p className="leading-5">{serverError}</p>
                  </div>
                )}
                {successMessage && (
                  <div role="status" className="flex items-start gap-3 rounded-md border border-success/25 bg-success-soft px-4 py-3 text-sm text-success">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                    <p className="leading-5">{successMessage}</p>
                  </div>
                )}
              </div>

              {tenantCandidates.length > 0 && (
                <fieldset className="rounded-md border border-primary/20 bg-brand-soft p-4">
                  <legend className="px-1 text-xs font-semibold uppercase tracking-[0.1em] text-primary">Choose your institution</legend>
                  <div className="mt-2 grid gap-2">
                    {tenantCandidates.map((tenantId) => (
                      <Button key={tenantId} type="button" variant={selectedTenant === tenantId ? "default" : "outline"} className="h-10 justify-start font-mono text-xs" onClick={() => setValue("tenantId", tenantId, { shouldValidate: true })}>
                        <Building2 className="size-4" /> {tenantId}
                      </Button>
                    ))}
                  </div>
                </fieldset>
              )}

              <Field label="Email or username" error={errors.email?.message} htmlFor="email">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" autoComplete="username" placeholder="name@university.edu" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} className="h-12 bg-card pl-10 text-sm shadow-none focus-visible:ring-2" {...register("email")} />
              </Field>

              <Field label="Password" error={errors.password?.message} htmlFor="password" action={<a href="/forgot-password" className="font-semibold text-primary underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Forgot password?</a>}>
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined} className="h-12 bg-card px-10 text-sm shadow-none focus-visible:ring-2" {...register("password")} />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1.5 top-1/2 size-9 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} title={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </Field>

              {(showInstitution || defaultTenantId) && (
                <Field label="Institution ID" error={errors.tenantId?.message} htmlFor="tenantId">
                  <Building2 className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="tenantId" autoComplete="organization" placeholder="24-character institution ID" aria-invalid={Boolean(errors.tenantId)} aria-describedby={errors.tenantId ? "tenantId-error" : undefined} className="h-12 bg-card pl-10 font-mono text-sm shadow-none focus-visible:ring-2" {...register("tenantId")} />
                </Field>
              )}

              {!showInstitution && !defaultTenantId && (
                <Button type="button" variant="link" className="h-auto p-0 text-xs text-muted-foreground" onClick={() => setShowInstitution(true)}>
                  <Building2 className="size-3.5" /> Use a specific institution ID
                </Button>
              )}

              <div className="flex items-center gap-2.5">
                <Checkbox id="remember" checked disabled aria-describedby="remember-note" />
                <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">Keep me signed in</Label>
                <span id="remember-note" className="sr-only">UniSphere securely restores your session on this device.</span>
              </div>

              <Button type="submit" size="lg" disabled={isSubmitting} className="h-12 w-full text-sm font-semibold shadow-md transition-transform active:scale-[0.99]">
                {isSubmitting ? (
                  <><span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" /> Signing in…</>
                ) : (
                  <>Sign In <ArrowRight className="size-4" /></>
                )}
              </Button>

              <p className="border-t border-border pt-5 text-center text-sm text-muted-foreground">
                Don&apos;t have an account? <a href="/register" className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Create student account</a>
              </p>
            </form>

            <p className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-success" /> Protected by UniSphere campus security
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({ label, error, htmlFor, action, children }: { label: string; error: string | undefined; htmlFor: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor={htmlFor} className="text-sm font-semibold text-foreground">{label}</Label>
        {action && <div className="shrink-0 text-xs">{action}</div>}
      </div>
      <div className="relative">{children}</div>
      {error && <p id={`${htmlFor}-error`} role="alert" className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
