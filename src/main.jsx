import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import {
  LayoutDashboard, BriefcaseBusiness, ClipboardCheck, Wallet,
  ArrowDownToLine, ArrowUpFromLine, Gift, CreditCard, Bell,
  LifeBuoy, UserRound, LogOut, Menu, X, ChevronRight
} from "lucide-react";
import "./styles.css";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const nav = [
  ["Dashboard", LayoutDashboard],
  ["Available Tasks", BriefcaseBusiness],
  ["My Tasks", ClipboardCheck],
  ["Submissions", ClipboardCheck],
  ["Wallet", Wallet],
  ["Recharge", ArrowDownToLine],
  ["Withdraw", ArrowUpFromLine],
  ["Refer & Earn", Gift],
  ["My Subscription", CreditCard],
  ["Notifications", Bell],
  ["Support", LifeBuoy],
  ["Profile", UserRound],
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function loadProfile() {
      if (!supabase || !session?.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      setProfile(data);
    }
    loadProfile();
  }, [session]);

  async function logout() {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }

  const displayName =
    profile?.full_name ||
    session?.user?.email?.split("@")[0] ||
    "Member";

  return (
    <div className="app">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brandMark">X</div>
          <div>
            <strong>XIGA</strong>
            <span>HUB</span>
          </div>
          <button className="mobileClose" onClick={() => setMenuOpen(false)}><X size={20}/></button>
        </div>

        <nav>
          {nav.map(([label, Icon]) => (
            <button
              key={label}
              className={active === label ? "navItem active" : "navItem"}
              onClick={() => { setActive(label); setMenuOpen(false); }}
            >
              <Icon size={18}/>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <button className="logout" onClick={logout}>
          <LogOut size={18}/> Logout
        </button>
      </aside>

      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}

      <main className="main">
        <header className="topbar">
          <button className="menuBtn" onClick={() => setMenuOpen(true)}><Menu size={22}/></button>
          <div>
            <div className="eyebrow">XIGA HUB</div>
            <h1>{active}</h1>
          </div>
          <div className="topUser">
            <div className="avatar">{displayName.charAt(0).toUpperCase()}</div>
            <div className="topUserText">
              <strong>{displayName}</strong>
              <span>{profile?.role === "admin" ? "Administrator" : "Member"}</span>
            </div>
          </div>
        </header>

        {!supabase && (
          <div className="notice">
            <strong>Frontend ready.</strong> Supabase connection is not configured yet.
            Add the values from <code>.env</code> before connecting live data.
          </div>
        )}

        {active === "Dashboard" ? (
          <Dashboard displayName={displayName} />
        ) : (
          <section className="placeholder">
            <div className="placeholderIcon"><ChevronRight size={28}/></div>
            <h2>{active}</h2>
            <p>This section is part of the XIGA Hub interface. Live Supabase data and actions will be connected in the next development step.</p>
          </section>
        )}
      </main>
    </div>
  );
}

function Dashboard({ displayName }) {
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
          <span className="pill">Subscription Active</span>
          <h2>Welcome back, {displayName}</h2>
          <p>Complete tasks, submit your Canva designs, and manage your XIGA Hub balance.</p>
        </div>
        <div className="welcomeBadge">XIGA<br/><small>HUB</small></div>
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
        <button className="textBtn">View all <ChevronRight size={16}/></button>
      </section>

      <div className="taskGrid">
        {tasks.map(([amount, concepts, time, status]) => (
          <div className="card task" key={amount}>
            <div className="taskTop"><span className="taskAmount">{amount}</span><span className="available">{status}</span></div>
            <h4>Canva Design Task</h4>
            <div className="taskMeta"><span>{concepts}</span><span>{time}</span></div>
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
          <ClipboardCheck size={28}/>
          <strong>No tasks claimed yet</strong>
          <span>Claim an available task to start working.</span>
        </div>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
