"use client";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
 AlertCircle,
 Eye,
 EyeOff,
 Loader2,
 LockKeyhole,
 Mail,
} from "lucide-react";
export default function LoginForm() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const callbackUrl =
   searchParams.get("callbackUrl") || "/";
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [showPassword, setShowPassword] =
   useState(false);
 const [loading, setLoading] =
   useState(false);
 const [error, setError] =
   useState<string | null>(null);
 async function handleSubmit(
   event: FormEvent<HTMLFormElement>
 ) {
   event.preventDefault();
   setError(null);
   if (!email.trim() || !password) {
     setError(
       "Enter your email address and password."
     );
     return;
   }
   setLoading(true);
   try {
     const result = await signIn(
       "credentials",
       {
         email: email.trim().toLowerCase(),
         password,
         redirect: false,
         redirectTo: callbackUrl,
       }
     );
     if (result?.error) {
       setError(
         "Invalid email or password."
       );
       return;
     }
     router.push(
       result?.url || callbackUrl
     );
     router.refresh();
   } catch (loginError) {
     console.error(
       "Login failed:",
       loginError
     );
     setError(
       "Unable to sign in. Please try again."
     );
   } finally {
     setLoading(false);
   }
 }
 return (
<form
     onSubmit={handleSubmit}
     className="mt-8 space-y-5"
>
     {error && (
<div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
<AlertCircle
           size={18}
           className="mt-0.5 shrink-0"
         />
<span>{error}</span>
</div>
     )}
<div>
<label
         htmlFor="email"
         className="mb-2 block text-sm font-medium text-slate-700"
>
         Email address
</label>
<div className="relative">
<Mail
           size={18}
           className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
         />
<input
           id="email"
           type="email"
           autoComplete="email"
           value={email}
           onChange={(event) =>
             setEmail(
               event.target.value
             )
           }
           disabled={loading}
           placeholder="admin@example.com"
           className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
         />
</div>
</div>
<div>
<label
         htmlFor="password"
         className="mb-2 block text-sm font-medium text-slate-700"
>
         Password
</label>
<div className="relative">
<LockKeyhole
           size={18}
           className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
         />
<input
           id="password"
           type={
             showPassword
               ? "text"
               : "password"
           }
           autoComplete="current-password"
           value={password}
           onChange={(event) =>
             setPassword(
               event.target.value
             )
           }
           disabled={loading}
           placeholder="Enter your password"
           className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
         />
<button
           type="button"
           onClick={() =>
             setShowPassword(
               (current) =>
                 !current
             )
           }
           disabled={loading}
           aria-label={
             showPassword
               ? "Hide password"
               : "Show password"
           }
           className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed"
>
           {showPassword ? (
<EyeOff size={18} />
           ) : (
<Eye size={18} />
           )}
</button>
</div>
</div>
<button
       type="submit"
       disabled={loading}
       className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
>
       {loading ? (
<>
<Loader2
             size={18}
             className="animate-spin"
           />
           Signing in...
</>
       ) : (
<>
<LockKeyhole size={18} />
           Sign in
</>
       )}
</button>
<p className="text-center text-xs leading-5 text-slate-400">
       Authorized personnel only.
       Access may be monitored and
       recorded.
</p>
</form>
 );
}
