import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-slate-300 bg-white shadow-sm">
        <div className="h-7 w-7 rounded-full border-[5px] border-blue-500 border-t-slate-200 border-r-cyan-500 border-b-indigo-500 border-l-sky-300" />
      </div>
      <div>
        <div className="text-2xl font-semibold tracking-tight text-slate-900">EVENTAURA</div>
        <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Dashboard access</div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fromPath = useMemo(() => location.state?.from?.pathname || "/organizer/dashboard", [location.state]);

  const handleSubmit = (event) => {
    event.preventDefault();
    localStorage.setItem("financial-app-auth", "true");
    localStorage.setItem("financial-app-user", email.trim());
    navigate(fromPath, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 px-4 py-6 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl items-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white/75 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative hidden items-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-700 px-12 py-14 text-white lg:flex">
            <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-sky-400/20 blur-2xl" />
            <div className="absolute bottom-10 right-10 h-52 w-52 rounded-full bg-indigo-400/15 blur-3xl" />
            <div className="relative z-10 max-w-md space-y-8">
              <BrandMark />
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight">Sign in to your account</h1>
                <p className="text-base leading-7 text-slate-200">
                  Manage sponsorship requests, payments, and financial reports from one secure place.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-lg backdrop-blur-sm">
                  <div className="text-sm text-slate-200">Revenue overview</div>
                  <div className="mt-2 text-3xl font-semibold">Rs. 1.24M</div>
                  <div className="mt-2 text-sm text-slate-300">Updated for the current month</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                    <div className="text-sm text-slate-300">Pending approvals</div>
                    <div className="mt-2 text-2xl font-semibold">18</div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                    <div className="text-sm text-slate-300">Success rate</div>
                    <div className="mt-2 text-2xl font-semibold">97%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-14">
            <div className="w-full max-w-md space-y-8">
              <div className="lg:hidden">
                <BrandMark />
              </div>

              <div className="space-y-2 text-center lg:text-left">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Sign in to your account</h2>
                <p className="text-sm text-slate-600">Use your email and password to continue to the dashboard.</p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email or username
                  </label>
                  <input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    autoComplete="username"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    autoComplete="current-password"
                    required
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button type="button" className="text-sm font-medium text-blue-600 transition hover:text-blue-700">
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center rounded-2xl bg-blue-600 text-sm font-semibold tracking-wide text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
                >
                  SIGN IN
                </button>
              </form>

              <div className="text-center text-sm text-slate-600">
                New here? <button className="font-semibold text-blue-600 transition hover:text-blue-700">Register</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
