import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import {
  LayoutDashboard, BriefcaseBusiness, ClipboardCheck, Wallet,
  ArrowDownToLine, ArrowUpFromLine, Gift, CreditCard, Bell,
  LifeBuoy, UserRound, LogOut, Menu, X, ChevronRight, Mail,
  LockKeyhole, UserPlus, Eye, EyeOff, ArrowLeft
} from "lucide-react";
import "./styles.css";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const nav = [
  ["Dashboard", LayoutDashboard], ["Available Tasks", BriefcaseBusiness],
  ["My Tasks", ClipboardCheck], ["Submissions", ClipboardCheck],
  ["Wallet", Wallet], ["Recharge", ArrowDownToLine],
  ["Withdraw", ArrowUpFromLine], ["Refer & Earn", Gift],
  ["My Subscription", CreditCard], ["Notifications", Bell],
  ["Support", LifeBuoy], ["Profile", UserRound],
];

function App() {
  const [authMode, setAuthMode] = useState("login");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [message, setMessage] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) await loadUserData(data.session.user);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, nextSession) => {
        if (!mounted) return;
        setSession(nextSession);

        if (event === "PASSWORD_RECOVERY") {
          setAuthMode("reset");
        }

        if (nextSession?.user) {
          await loadUserData(nextSession.user);
        } else {
          setProfile(null);
          setSubscription(null);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function loadUserData(user) {
    if (!supabase || !user) return;

    const [{ data: profileData }, { data: subscriptionData }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("subscriptions")
          .select("status, expires_at, starts_at, amount_paid")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

    if (profileData?.is_blocked) {
      await supabase.auth.signOut();
      setAuthError(
        "This account has been blocked. Please contact XIGA Hub support."
      );
      return;
    }

    setProfile(profileData);
    setSubscription(subscriptionData);
  }

  async function logout() {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setSubscription(null);
    setActive("Dashboard");
  }

  const displayName =
    profile?.full_name ||
    session?.user?.user_metadata?.full_name ||
    session?.user?.email?.split("@")[0] ||
    "Member";

  if (authLoading) {
    return (
      <div className="authLoading">
        <div className="authSpinner" />
        <strong>Loading XIGA Hub…</strong>
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="authPage">
        <div className="authCard">
          <Brand />
          <div className="authAlert error">
            Supabase is not configured. Check the Vercel environment variables.
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <AuthScreen
        mode={authMode}
        setMode={(mode) => {
          setAuthMode(mode);
          setAuthError("");
          setMessage("");
        }}
        message={message}
        setMessage={setMessage}
        error={authError}
        setError={setAuthError}
      />
    );
  }

  return (
    <div className="app">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brandMark">X</div>
          <div>
            <strong>XIGA</strong>
            <span>HUB</span>
          </div>
          <button
            className="mobileClose"
            onClick={() => setMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav>
          {nav.map(([label, Icon]) => (
            <button
              key={label}
              className={active === label ? "navItem active" : "navItem"}
              onClick={() => {
                setActive(label);
                setMenuOpen(false);
              }}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <button className="logout" onClick={logout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {menuOpen && (
        <div className="overlay" onClick={() => setMenuOpen(false)} />
      )}

      <main className="main">
        <header className="topbar">
          <button
            className="menuBtn"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div>
            <div className="eyebrow">XIGA HUB</div>
            <h1>{active}</h1>
          </div>

          <div className="topUser">
            <div className="avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="topUserText">
              <strong>{displayName}</strong>
              <span>
                {profile?.role === "admin" ? "Administrator" : "Member"}
              </span>
            </div>
          </div>
        </header>

        {active === "Dashboard" ? (
          <Dashboard
            displayName={displayName}
            subscription={subscription}
          />
        ) : (
          <section className="placeholder">
            <div className="placeholderIcon">
              <ChevronRight size={28} />
            </div>
            <h2>{active}</h2>
            <p>
              This section is part of the XIGA Hub interface. Live Supabase
              data and actions will be connected in the next development step.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

function Brand() {
  return (
    <div className="authBrand">
      <div className="brandMark">X</div>
      <div>
        <strong>XIGA</strong>
        <span>HUB</span>
      </div>
    </div>
  );
}

function AuthScreen({
  mode,
  setMode,
  message,
  setMessage,
  error,
  setError,
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!supabase) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      if (mode === "forgot") {
        const { error: resetError } =
          await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: window.location.origin,
          });

        if (resetError) throw resetError;

        setMessage(
          "Password reset instructions have been sent to your email."
        );
        return;
      }

      if (mode === "reset") {
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }

        const { error: updateError } =
          await supabase.auth.updateUser({ password });

        if (updateError) throw updateError;

        setMessage("Your password has been updated.");
        setMode("login");
        return;
      }

      if (!email.trim() || !password) {
        throw new Error("Please enter your email and password.");
      }

      if (mode === "signup" && !fullName.trim()) {
        throw new Error("Please enter your full name.");
      }

      if (mode === "signup" && password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      if (mode === "signup") {
        const referralCode =
          new URLSearchParams(window.location.search).get("ref") || null;

        const { data, error: signUpError } =
          await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                full_name: fullName.trim(),
                referral_code: referralCode,
              },
            },
          });

        if (signUpError) throw signUpError;

        if (data.user && data.session) {
          await supabase
            .from("profiles")
            .update({ full_name: fullName.trim() })
            .eq("id", data.user.id);
        }

        if (!data.session) {
          setMessage(
            "Account created. Please check your email and confirm your address before logging in."
          );
          setMode("login");
        } else {
          setMessage("Account created successfully.");
        }

        return;
      }

      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) throw loginError;
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  const title =
    mode === "signup"
      ? "Create your account"
      : mode === "forgot"
      ? "Reset your password"
      : mode === "reset"
      ? "Set a new password"
      : "Welcome back";

  const subtitle =
    mode === "signup"
      ? "Join XIGA Hub and get started."
      : mode === "forgot"
      ? "Enter your email and we'll send you a reset link."
      : mode === "reset"
      ? "Choose a new password for your account."
      : "Sign in to continue to your XIGA Hub account.";

  return (
    <div className="authPage">
      <div className="authCard">
        <Brand />

        <div className="authHeading">
          {mode !== "login" && mode !== "signup" && (
            <button
              className="backBtn"
              onClick={() => setMode("login")}
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}

          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        {message && (
          <div className="authAlert success">{message}</div>
        )}

        {error && <div className="authAlert error">{error}</div>}

        <form onSubmit={submit} className="authForm">
          {mode === "signup" && (
            <label>
              Full name
              <div className="inputWrap">
                <UserPlus size={17} />
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </div>
            </label>
          )}

          {mode !== "reset" && (
            <label>
              Email address
              <div className="inputWrap">
                <Mail size={17} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>
          )}

          {mode !== "forgot" && (
            <label>
              Password
              <div className="inputWrap">
                <LockKeyhole size={17} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={
                    mode === "signup"
                      ? "new-password"
                      : "current-password"
                  }
                  required
                />
                <button
                  type="button"
                  className="eyeBtn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </label>
          )}

          <button className="authSubmit" disabled={busy}>
            {busy
              ? "Please wait…"
              : mode === "signup"
              ? "Create Account"
              : mode === "forgot"
              ? "Send Reset Link"
              : mode === "reset"
              ? "Update Password"
              : "Login"}
          </button>
        </form>

        <div className="authLinks">
          {mode === "login" && (
            <>
              <button onClick={() => setMode("forgot")}>
                Forgot password?
              </button>
              <span>
                Don't have an account?{" "}
                <button onClick={() => setMode("signup")}>
                  Create one
                </button>
              </span>
            </>
          )}

          {mode === "signup" && (
            <span>
              Already have an account?{" "}
              <button onClick={() => setMode("login")}>
                Login
              </button>
            </span>
          )}

          {mode === "forgot" && (
            <span>
              Remember your password?{" "}
              <button onClick={() => setMode("login")}>
                Login
              </button>
            </span>
          )}
        </div>

        <small className="authNote">
          By continuing, you agree to use XIGA Hub according to its terms
          and policies.
        </small>
      </div>
    </div>
  );
}

function Dashboard({ displayName, subscription }) {
  const activeSubscription = subscription?.status === "active";
  const subscriptionLabel = activeSubscription
    ? "Subscription Active"
    : "Subscription Required";

  const stats = [
    ["Current Balance", "Rs. 0", "Available balance"],
    ["Tasks Completed", "0", "Approved tasks"],
    ["Total Earnings", "Rs. 0", "Task earnings"],
    ["Referral Bonus", "Rs. 0", "Referral rewards"],
  ];

  const tasks = [
    ["Rs. 100", "3 concepts", "5 hours", "Available"],
    ["Rs. 200", "3 concepts", "6 hours", "Available"],
    ["Rs. 500", "3 concepts", "8 hours", "Available"],
    ["Rs. 1,000", "3 concepts", "10 hours", "Available"],
  ];

  return (
    <>
      <section className="welcome">
        <div>
          <span
            className={activeSubscription ? "pill" : "pill pending"}
          >
            {subscriptionLabel}
          </span>

          <h2>Welcome back, {displayName}</h2>
          <p>
            Complete tasks, submit your Canva designs, and manage your XIGA
            Hub balance.
          </p>
        </div>

        <div className="welcomeBadge">
          XIGA
          <br />
          <small>HUB</small>
        </div>
      </section>

      <section className="stats">
        {stats.map(([title, value, sub]) => (
          <div className="card stat" key={title}>
            <span>{title}</span>
            <strong>{value}</strong>
            <small>{sub}</small>
          </div>
        ))}
      </section>

      <section className="sectionHead">
        <div>
          <h3>Available Tasks</h3>
          <p>Choose a task level that matches your available balance.</p>
        </div>

        <button className="textBtn">
          View all <ChevronRight size={16} />
        </button>
      </section>

      <div className="taskGrid">
        {tasks.map(([amount, concepts, time, status]) => (
          <div className="card task" key={amount}>
            <div className="taskTop">
              <span className="taskAmount">{amount}</span>
              <span className="available">{status}</span>
            </div>

            <h4>Canva Design Task</h4>

            <div className="taskMeta">
              <span>{concepts}</span>
              <span>{time}</span>
            </div>

            <button className="claim">Claim Task</button>
          </div>
        ))}
      </div>

      <section className="sectionHead">
        <div>
          <h3>My Tasks</h3>
          <p>Your currently claimed work.</p>
        </div>
      </section>

      <div className="card tableCard">
        <div className="empty">
          <ClipboardCheck size={28} />
          <strong>No tasks claimed yet</strong>
          <span>Claim an available task to start working.</span>
        </div>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
