import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

// =================== Types ===================
type TxType = "add" | "deduct";
interface Tx {
  id: string;
  type: TxType;
  amount: number;
  balanceAfter: number;
  timestamp: number; // ms
  note?: string;
}
interface Settings {
  fare: number;
  lowBalance: number;
  currency: string;
  dark: boolean;
}

const STORAGE_TX = "tcash:tx:v1";
const STORAGE_SETTINGS = "tcash:settings:v1";

const DEFAULT_SETTINGS: Settings = {
  fare: 30,
  lowBalance: 100,
  currency: "PKR",
  dark: false,
};

// =================== Helpers ===================
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const fmtMoney = (n: number, currency = "PKR") =>
  `${currency === "PKR" ? "Rs." : currency} ${n.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
const fmtTime = (ts: number) =>
  new Date(ts).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

function loadTx(): Tx[] {
  try {
    const raw = localStorage.getItem(STORAGE_TX);
    return raw ? (JSON.parse(raw) as Tx[]) : [];
  } catch {
    return [];
  }
}
function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// =================== Icons (inline SVG) ===================
const Icon = {
  Plus: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5v14M5 12h14" /></svg>
  ),
  Minus: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14" /></svg>
  ),
  Bus: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M8 6v6"/><path d="M16 6v6"/><path d="M2 12h19.6"/><path d="M18 18h2a1 1 0 0 0 1-1v-6.8a4 4 0 0 0-.8-2.4L19 5.4a2 2 0 0 0-1.6-.8H6.6a2 2 0 0 0-2 1.7l-.8 5a4 4 0 0 0 0 .8V17a1 1 0 0 0 1 1h2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
  ),
  Home: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>
  ),
  List: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
  ),
  Chart: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></svg>
  ),
  Cog: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.2.6.7 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
  ),
  Menu: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 6h18M3 12h18M3 18h18"/></svg>
  ),
  Close: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>
  ),
  Undo: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 7v6h6"/><path d="M3 13a9 9 0 1 0 3-7"/></svg>
  ),
  Receipt: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2V2"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>
  ),
  Search: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
  ),
  Download: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>
  ),
  Upload: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/></svg>
  ),
  Moon: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
  ),
};

// =================== Root App ===================
type Tab = "home" | "history" | "stats" | "settings";

export function TCashApp() {
  const [hydrated, setHydrated] = useState(false);
  const [tx, setTx] = useState<Tx[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [tab, setTab] = useState<Tab>("home");
  const [toast, setToast] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [atmOpen, setAtmOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [lastUndone, setLastUndone] = useState<Tx | null>(null);

  // Hydrate from localStorage (client only)
  useEffect(() => {
    setTx(loadTx());
    setSettings(loadSettings());
    setHydrated(true);
  }, []);

  // Persist
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_TX, JSON.stringify(tx));
  }, [tx, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings));
  }, [settings, hydrated]);

  // Theme
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", settings.dark);
  }, [settings.dark]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const balance = useMemo(
    () => tx.reduce((s, t) => s + (t.type === "add" ? t.amount : -t.amount), 0),
    [tx],
  );
  const low = balance < settings.lowBalance;

  const showToast = (msg: string) => setToast(msg);

  const addTx = (type: TxType, amount: number, note?: string) => {
    if (!amount || amount <= 0) return;
    const newBalance =
      balance + (type === "add" ? amount : -amount);
    const t: Tx = {
      id: uid(),
      type,
      amount,
      balanceAfter: newBalance,
      timestamp: Date.now(),
      note: note?.trim() || undefined,
    };
    setTx((prev) => [t, ...prev]);
    setLastUndone(null);
    showToast(
      type === "add"
        ? `Added ${fmtMoney(amount, settings.currency)}`
        : `Fare deducted ${fmtMoney(amount, settings.currency)}`,
    );
  };

  const undoLast = () => {
    if (tx.length === 0) return;
    const [last, ...rest] = tx;
    setLastUndone(last);
    setTx(rest);
    showToast("Last transaction undone");
  };

  const restoreUndone = () => {
    if (!lastUndone) return;
    setTx((prev) => [lastUndone, ...prev]);
    setLastUndone(null);
  };

  const clearAll = () => {
    if (!confirm("Erase ALL transactions? This cannot be undone.")) return;
    setTx([]);
    showToast("All data cleared");
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col max-w-md mx-auto relative">
      <TopBar
        title={
          tab === "home"
            ? "T-Cash Tracker"
            : tab === "history"
              ? "Transactions"
              : tab === "stats"
                ? "Statistics"
                : "Settings"
        }
        onMenu={() => setMenuOpen(true)}
        onAtm={() => setAtmOpen(true)}
      />

      <main className="flex-1 pb-28 px-4 pt-3">
        {tab === "home" && (
          <HomeView
            balance={balance}
            low={low}
            settings={settings}
            tx={tx}
            onAdd={() => setAddOpen(true)}
            onDeduct={(amount, note) => addTx("deduct", amount, note)}
            onUndo={undoLast}
            canUndo={tx.length > 0}
            lastUndone={lastUndone}
            onRestore={restoreUndone}
            onAtm={() => setAtmOpen(true)}
          />
        )}
        {tab === "history" && (
          <HistoryView tx={tx} settings={settings} />
        )}
        {tab === "stats" && <StatsView tx={tx} settings={settings} />}
        {tab === "settings" && (
          <SettingsView
            settings={settings}
            setSettings={setSettings}
            tx={tx}
            setTx={setTx}
            showToast={showToast}
            clearAll={clearAll}
          />
        )}
      </main>

      <BottomNav tab={tab} setTab={setTab} />


      {/* Drawer menu */}
      {menuOpen && (
        <SideDrawer
          settings={settings}
          setSettings={setSettings}
          onClose={() => setMenuOpen(false)}
          onNavigate={(t) => {
            setTab(t);
            setMenuOpen(false);
          }}
          onAtm={() => {
            setMenuOpen(false);
            setAtmOpen(true);
          }}
        />
      )}

      {/* Add balance modal */}
      {addOpen && (
        <AddBalanceSheet
          currency={settings.currency}
          onClose={() => setAddOpen(false)}
          onAdd={(amt, note) => {
            addTx("add", amt, note);
            setAddOpen(false);
          }}
        />
      )}

      {/* ATM receipt */}
      {atmOpen && (
        <AtmReceipt
          balance={balance}
          currency={settings.currency}
          onClose={() => setAtmOpen(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-foreground/95 text-background text-sm font-medium px-4 py-2 rounded-full shadow-soft animate-slide-up">
          {toast}
        </div>
      )}
    </div>
  );
}

// =================== Top bar ===================
function TopBar({
  title,
  onMenu,
  onAtm,
}: {
  title: string;
  onMenu: () => void;
  onAtm: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 bg-background/85 backdrop-blur border-b border-border px-2 py-2 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
      <button
        onClick={onMenu}
        aria-label="Open menu"
        className="h-10 w-10 grid place-items-center rounded-full hover:bg-accent tap-scale"
      >
        <Icon.Menu className="h-5 w-5" />
      </button>
      <h1 className="truncate text-base font-bold tracking-tight">{title}</h1>
      <button
        onClick={onAtm}
        aria-label="ATM balance inquiry"
        className="h-10 w-10 grid place-items-center rounded-full hover:bg-accent tap-scale"
      >
        <Icon.Receipt className="h-5 w-5" />
      </button>
    </header>
  );
}

// =================== Bottom nav ===================
function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: { id: Tab; label: string; icon: any }[] = [
    { id: "home", label: "Home", icon: Icon.Home },
    { id: "history", label: "History", icon: Icon.List },
    { id: "stats", label: "Stats", icon: Icon.Chart },
    { id: "settings", label: "Settings", icon: Icon.Cog },
  ];
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-30 bg-background/95 backdrop-blur border-t border-border safe-bottom">
      <div className="grid grid-cols-4">
        {items.map((it) => {
          const I = it.icon;
          const active = it.id === tab;
          return (
            <button
              key={it.id}
              onClick={() => setTab(it.id)}
              className={`flex flex-col items-center gap-0.5 py-2.5 tap-scale ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <I className="h-5 w-5" />
              <span className="text-[11px] font-medium">{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// =================== Home ===================
function HomeView({
  balance,
  low,
  settings,
  tx,
  onAdd,
  onDeduct,
  onUndo,
  canUndo,
  lastUndone,
  onRestore,
  onAtm,
}: {
  balance: number;
  low: boolean;
  settings: Settings;
  tx: Tx[];
  onAdd: () => void;
  onDeduct: (amount: number, note?: string) => void;
  onUndo: () => void;
  canUndo: boolean;
  lastUndone: Tx | null;
  onRestore: () => void;
  onAtm: () => void;
}) {
  const recent = tx.slice(0, 5);
  return (
    <div className="space-y-4">
      {/* Balance card */}
      <div
        className={`relative overflow-hidden rounded-3xl p-5 text-primary-foreground shadow-card ${
          low ? "bg-gradient-danger" : "bg-gradient-card"
        }`}
      >
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute top-1/2 -left-10 h-32 w-32 rounded-full bg-white/5 blur-xl" />
        <div className="relative">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest opacity-80">
            <span>T-Cash Card</span>
            <span>{settings.currency}</span>
          </div>
          <div className="mt-3 text-[13px] opacity-85">Current Balance</div>
          <div className="mt-1 text-5xl font-black tracking-tight font-mono">
            {fmtMoney(balance, settings.currency)}
          </div>
          {low && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              ⚠ Low balance — top up soon
            </div>
          )}
          <div className="mt-6 flex items-end justify-between">
            <div>
              <div className="text-[11px] opacity-75 uppercase tracking-wider">Default fare</div>
              <div className="text-lg font-bold font-mono">
                {fmtMoney(settings.fare, settings.currency)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] opacity-75 uppercase tracking-wider">Trips logged</div>
              <div className="text-lg font-bold font-mono">
                {tx.filter((t) => t.type === "deduct").length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onAdd}
          className="rounded-2xl bg-gradient-primary text-primary-foreground p-4 flex flex-col items-start gap-2 shadow-soft tap-scale"
        >
          <div className="h-9 w-9 rounded-xl bg-white/20 grid place-items-center">
            <Icon.Plus className="h-5 w-5" />
          </div>
          <div className="text-left">
            <div className="font-bold">Add Balance</div>
            <div className="text-xs opacity-85">Recharge your card</div>
          </div>
        </button>
        <button
          onClick={() => onDeduct(settings.fare)}
          className="rounded-2xl bg-gradient-danger text-primary-foreground p-4 flex flex-col items-start gap-2 shadow-soft tap-scale"
        >
          <div className="h-9 w-9 rounded-xl bg-white/20 grid place-items-center">
            <Icon.Bus className="h-5 w-5" />
          </div>
          <div className="text-left">
            <div className="font-bold">
              Deduct {fmtMoney(settings.fare, settings.currency)}
            </div>
            <div className="text-xs opacity-85">Tap on bus boarding</div>
          </div>
        </button>
      </div>

      {/* Undo + ATM row */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-semibold disabled:opacity-40 tap-scale"
        >
          <Icon.Undo className="h-4 w-4" /> Undo last
        </button>
        <button
          onClick={onAtm}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-semibold tap-scale"
        >
          <Icon.Receipt className="h-4 w-4" /> ATM Check
        </button>
      </div>

      {lastUndone && (
        <button
          onClick={onRestore}
          className="w-full rounded-xl bg-accent text-accent-foreground py-2.5 text-sm font-semibold tap-scale"
        >
          Restore last transaction (+{fmtMoney(lastUndone.amount, settings.currency)})
        </button>
      )}

      {/* Recent */}
      <section className="pt-1">
        <div className="flex items-center justify-between px-1 pb-2">
          <h2 className="text-sm font-bold tracking-wide uppercase text-muted-foreground">
            Recent activity
          </h2>
        </div>
        <div className="rounded-2xl bg-card border border-border divide-y divide-border overflow-hidden">
          {recent.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No transactions yet. Tap <b>Add Balance</b> to start.
            </div>
          )}
          {recent.map((t) => (
            <TxRow key={t.id} t={t} currency={settings.currency} />
          ))}
        </div>
      </section>
    </div>
  );
}

// =================== Tx row ===================
function TxRow({ t, currency }: { t: Tx; currency: string }) {
  const isAdd = t.type === "add";
  return (
    <div className="flex items-center gap-3 p-3">
      <div
        className={`h-10 w-10 shrink-0 rounded-xl grid place-items-center ${
          isAdd
            ? "bg-[color-mix(in_oklab,var(--primary)_18%,transparent)] text-[color:var(--primary)]"
            : "bg-[color-mix(in_oklab,var(--destructive)_18%,transparent)] text-[color:var(--destructive)]"
        }`}
      >
        {isAdd ? <Icon.Plus className="h-5 w-5" /> : <Icon.Bus className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold truncate">
          {isAdd ? "Added Balance" : "Bus Fare"}
          {t.note && (
            <span className="ml-2 text-xs text-muted-foreground font-normal">
              · {t.note}
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {fmtDate(t.timestamp)} · {fmtTime(t.timestamp)}
        </div>
      </div>
      <div className="text-right">
        <div
          className={`font-bold font-mono ${
            isAdd ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]"
          }`}
        >
          {isAdd ? "+" : "−"}
          {fmtMoney(t.amount, currency)}
        </div>
        <div className="text-[11px] text-muted-foreground font-mono">
          Bal {fmtMoney(t.balanceAfter, currency)}
        </div>
      </div>
    </div>
  );
}

// =================== History ===================
function HistoryView({ tx, settings }: { tx: Tx[]; settings: Settings }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | TxType>("all");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return tx.filter((t) => {
      if (filter !== "all" && t.type !== filter) return false;
      if (!query) return true;
      const hay = [
        t.type === "add" ? "added balance add" : "bus fare deduct",
        t.note ?? "",
        String(t.amount),
        fmtDate(t.timestamp),
        fmtTime(t.timestamp),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [tx, q, filter]);

  // group by date
  const groups = useMemo(() => {
    const m = new Map<string, Tx[]>();
    for (const t of filtered) {
      const k = fmtDate(t.timestamp);
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(t);
    }
    return [...m.entries()];
  }, [filtered]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Icon.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search amount, date or note…"
          className="w-full rounded-xl border border-border bg-card pl-10 pr-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="flex gap-2">
        {(["all", "add", "deduct"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 rounded-full py-2 text-xs font-semibold tap-scale ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground"
            }`}
          >
            {f === "all" ? "All" : f === "add" ? "Top-ups" : "Fares"}
          </button>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="rounded-2xl bg-card border border-border p-8 text-center text-sm text-muted-foreground">
          No matching transactions.
        </div>
      )}

      {groups.map(([day, items]) => (
        <section key={day} className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
            {day}
          </div>
          <div className="rounded-2xl bg-card border border-border divide-y divide-border overflow-hidden">
            {items.map((t) => (
              <TxRow key={t.id} t={t} currency={settings.currency} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// =================== Stats ===================
function StatsView({ tx, settings }: { tx: Tx[]; settings: Settings }) {
  const stats = useMemo(() => {
    const added = tx.filter((t) => t.type === "add").reduce((s, t) => s + t.amount, 0);
    const spent = tx.filter((t) => t.type === "deduct").reduce((s, t) => s + t.amount, 0);
    const trips = tx.filter((t) => t.type === "deduct").length;
    const days =
      tx.length === 0
        ? 1
        : Math.max(
            1,
            Math.ceil(
              (Date.now() - Math.min(...tx.map((t) => t.timestamp))) /
                (1000 * 60 * 60 * 24),
            ),
          );
    const avg = spent / days;
    return { added, spent, trips, avg };
  }, [tx]);

  const monthly = useMemo(() => {
    const m = new Map<string, { added: number; spent: number; trips: number; key: string }>();
    for (const t of tx) {
      const d = new Date(t.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
      if (!m.has(label)) m.set(label, { added: 0, spent: 0, trips: 0, key });
      const row = m.get(label)!;
      if (t.type === "add") row.added += t.amount;
      else {
        row.spent += t.amount;
        row.trips += 1;
      }
    }
    return [...m.entries()].sort((a, b) => b[1].key.localeCompare(a[1].key));
  }, [tx]);

  const cur = settings.currency;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Added" value={fmtMoney(stats.added, cur)} tone="success" />
        <StatCard label="Total Spent" value={fmtMoney(stats.spent, cur)} tone="danger" />
        <StatCard label="Bus Trips" value={`${stats.trips}`} sub="rides" />
        <StatCard
          label="Avg / day"
          value={fmtMoney(Math.round(stats.avg), cur)}
          sub="spending"
        />
      </div>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground px-1 pb-2">
          Monthly reports
        </h2>
        {monthly.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border p-6 text-center text-sm text-muted-foreground">
            No data yet.
          </div>
        ) : (
          <div className="space-y-3">
            {monthly.map(([label, row]) => {
              const remaining = row.added - row.spent;
              return (
                <div key={label} className="rounded-2xl bg-card border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-bold">{label}</div>
                    <div
                      className={`font-mono text-sm font-bold ${
                        remaining >= 0
                          ? "text-[color:var(--success)]"
                          : "text-[color:var(--destructive)]"
                      }`}
                    >
                      {remaining >= 0 ? "+" : ""}
                      {fmtMoney(remaining, cur)}
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <MiniStat label="Added" value={fmtMoney(row.added, cur)} />
                    <MiniStat label="Spent" value={fmtMoney(row.spent, cur)} />
                    <MiniStat label="Trips" value={`${row.trips}`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "success" | "danger";
}) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </div>
      <div
        className={`mt-1 text-xl font-black font-mono ${
          tone === "success"
            ? "text-[color:var(--success)]"
            : tone === "danger"
              ? "text-[color:var(--destructive)]"
              : ""
        }`}
      >
        {value}
      </div>
      {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono font-bold text-sm">{value}</div>
    </div>
  );
}

// =================== Settings ===================
function SettingsView({
  settings,
  setSettings,
  tx,
  setTx,
  showToast,
  clearAll,
}: {
  settings: Settings;
  setSettings: (u: Settings | ((s: Settings) => Settings)) => void;
  tx: Tx[];
  setTx: (u: Tx[]) => void;
  showToast: (m: string) => void;
  clearAll: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    setSettings((s) => ({ ...s, [k]: v }));

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ settings, tx }, null, 2)], {
      type: "application/json",
    });
    download(blob, `tcash-backup-${Date.now()}.json`);
    showToast("JSON exported");
  };
  const exportCsv = () => {
    const rows = [
      ["id", "date", "time", "type", "amount", "balance_after", "note"],
      ...tx.map((t) => [
        t.id,
        fmtDate(t.timestamp),
        fmtTime(t.timestamp),
        t.type,
        String(t.amount),
        String(t.balanceAfter),
        (t.note ?? "").replace(/,/g, " "),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    download(new Blob([csv], { type: "text/csv" }), `tcash-history-${Date.now()}.csv`);
    showToast("CSV exported");
  };
  const importFile = async (f: File) => {
    try {
      const text = await f.text();
      const parsed = JSON.parse(text);
      if (parsed.tx && Array.isArray(parsed.tx)) {
        setTx(parsed.tx);
        if (parsed.settings) setSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
        showToast("Backup restored");
      } else throw new Error("Invalid file");
    } catch {
      showToast("Could not import file");
    }
  };

  const fareOptions = [20, 25, 30, 40, 50];
  const lowOptions = [50, 100, 150, 200];

  return (
    <div className="space-y-5">
      <Section title="Bus fare">
        <div className="flex flex-wrap gap-2">
          {fareOptions.map((v) => (
            <Chip key={v} active={settings.fare === v} onClick={() => update("fare", v)}>
              Rs. {v}
            </Chip>
          ))}
          <NumberChip
            value={fareOptions.includes(settings.fare) ? "" : String(settings.fare)}
            placeholder="Custom"
            onCommit={(n) => update("fare", n)}
          />
        </div>
      </Section>

      <Section title="Low balance warning">
        <div className="flex flex-wrap gap-2">
          {lowOptions.map((v) => (
            <Chip
              key={v}
              active={settings.lowBalance === v}
              onClick={() => update("lowBalance", v)}
            >
              Rs. {v}
            </Chip>
          ))}
          <NumberChip
            value={lowOptions.includes(settings.lowBalance) ? "" : String(settings.lowBalance)}
            placeholder="Custom"
            onCommit={(n) => update("lowBalance", n)}
          />
        </div>
      </Section>

      <Section title="Currency">
        <div className="flex gap-2">
          {(["PKR", "USD", "EUR"] as const).map((c) => (
            <Chip key={c} active={settings.currency === c} onClick={() => update("currency", c)}>
              {c}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Appearance">
        <button
          onClick={() => update("dark", !settings.dark)}
          className="w-full flex items-center justify-between rounded-xl bg-card border border-border px-4 py-3 tap-scale"
        >
          <span className="flex items-center gap-3 font-semibold">
            <Icon.Moon className="h-4 w-4" /> Dark mode
          </span>
          <span
            className={`h-6 w-11 rounded-full p-0.5 transition ${
              settings.dark ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`block h-5 w-5 rounded-full bg-card shadow-soft transition ${
                settings.dark ? "translate-x-5" : ""
              }`}
            />
          </span>
        </button>
      </Section>

      <Section title="Backup & restore">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={exportJson}
            className="flex items-center justify-center gap-2 rounded-xl bg-card border border-border py-3 text-sm font-semibold tap-scale"
          >
            <Icon.Download className="h-4 w-4" /> JSON
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center justify-center gap-2 rounded-xl bg-card border border-border py-3 text-sm font-semibold tap-scale"
          >
            <Icon.Download className="h-4 w-4" /> CSV
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importFile(f);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-card border border-border py-3 text-sm font-semibold tap-scale"
        >
          <Icon.Upload className="h-4 w-4" /> Restore from JSON
        </button>
      </Section>

      <Section title="Danger zone">
        <button
          onClick={clearAll}
          className="w-full rounded-xl bg-gradient-danger text-primary-foreground py-3 text-sm font-bold tap-scale"
        >
          Erase all transactions
        </button>
      </Section>

      <div className="text-center text-xs text-muted-foreground pb-2">
        T-Cash Tracker · works offline · {tx.length} transactions stored locally
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground px-1 pb-2">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold tap-scale ${
        active
          ? "bg-primary text-primary-foreground shadow-soft"
          : "bg-card border border-border text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
function NumberChip({
  value,
  placeholder,
  onCommit,
}: {
  value: string;
  placeholder: string;
  onCommit: (n: number) => void;
}) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return (
    <input
      type="number"
      inputMode="numeric"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => {
        const n = parseInt(v, 10);
        if (!isNaN(n) && n > 0) onCommit(n);
      }}
      placeholder={placeholder}
      className="w-24 rounded-full px-4 py-2 text-sm font-semibold bg-card border border-border outline-none focus:ring-2 focus:ring-ring text-center"
    />
  );
}

// =================== Add balance sheet ===================
function AddBalanceSheet({
  currency,
  onAdd,
  onClose,
}: {
  currency: string;
  onAdd: (amount: number, note?: string) => void;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState("");
  const presets = [100, 200, 500, 1000, 2000];

  const submit = () => {
    const n = parseInt(amount, 10);
    if (!isNaN(n) && n > 0) onAdd(n, note);
  };

  return (
    <Sheet onClose={onClose} title="Add balance">
      <div className="grid grid-cols-3 gap-2">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => setAmount(String(p))}
            className={`rounded-xl py-3 font-bold tap-scale ${
              amount === String(p)
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}
          >
            +{p}
          </button>
        ))}
      </div>
      <label className="block">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          Custom amount ({currency})
        </div>
        <input
          type="number"
          inputMode="numeric"
          autoFocus
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="w-full rounded-xl bg-muted px-4 py-4 text-3xl font-black font-mono outline-none focus:ring-2 focus:ring-ring text-center"
        />
      </label>
      <label className="block">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          Note (optional)
        </div>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Metro Bus top-up"
          className="w-full rounded-xl bg-muted px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
      <button
        onClick={submit}
        disabled={!amount || parseInt(amount, 10) <= 0}
        className="w-full rounded-xl bg-gradient-primary text-primary-foreground py-4 font-bold tap-scale disabled:opacity-50"
      >
        Add {amount ? fmtMoney(parseInt(amount, 10) || 0, currency) : "balance"}
      </button>
    </Sheet>
  );
}

// =================== Generic sheet ===================
function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background rounded-t-3xl p-5 pb-8 animate-slide-up shadow-card space-y-4 safe-bottom">
        <div className="mx-auto h-1.5 w-12 rounded-full bg-muted" />
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="h-9 w-9 grid place-items-center rounded-full hover:bg-accent tap-scale"
            aria-label="Close"
          >
            <Icon.Close className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// =================== Side drawer ===================
function SideDrawer({
  settings,
  setSettings,
  onClose,
  onNavigate,
  onAtm,
}: {
  settings: Settings;
  setSettings: (u: Settings | ((s: Settings) => Settings)) => void;
  onClose: () => void;
  onNavigate: (t: Tab) => void;
  onAtm: () => void;
}) {
  const items: { id: Tab; label: string; icon: any }[] = [
    { id: "home", label: "Dashboard", icon: Icon.Home },
    { id: "history", label: "Transactions", icon: Icon.List },
    { id: "stats", label: "Statistics", icon: Icon.Chart },
    { id: "settings", label: "Settings", icon: Icon.Cog },
  ];
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85%] bg-background shadow-card p-5 flex flex-col gap-2 animate-slide-up">
        <div className="rounded-2xl bg-gradient-card text-primary-foreground p-4 shadow-card">
          <div className="text-xs uppercase tracking-widest opacity-80">T-Cash</div>
          <div className="text-xl font-black">Tracker</div>
          <div className="text-xs opacity-85 mt-1">Offline bus card companion</div>
        </div>
        <nav className="mt-2 flex flex-col">
          {items.map((it) => {
            const I = it.icon;
            return (
              <button
                key={it.id}
                onClick={() => onNavigate(it.id)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-left font-semibold hover:bg-accent tap-scale"
              >
                <I className="h-5 w-5 text-primary" />
                {it.label}
              </button>
            );
          })}
          <button
            onClick={onAtm}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-left font-semibold hover:bg-accent tap-scale"
          >
            <Icon.Receipt className="h-5 w-5 text-primary" />
            ATM Balance Check
          </button>
        </nav>
        <div className="mt-auto">
          <button
            onClick={() => setSettings((s) => ({ ...s, dark: !s.dark }))}
            className="w-full flex items-center justify-between rounded-xl bg-card border border-border px-3 py-3 tap-scale"
          >
            <span className="flex items-center gap-2 font-semibold text-sm">
              <Icon.Moon className="h-4 w-4" /> Dark mode
            </span>
            <span
              className={`h-5 w-9 rounded-full p-0.5 transition ${
                settings.dark ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`block h-4 w-4 rounded-full bg-card shadow-soft transition ${
                  settings.dark ? "translate-x-4" : ""
                }`}
              />
            </span>
          </button>
          <div className="text-[11px] text-center text-muted-foreground mt-3">
            v1.0 · made for daily commuters
          </div>
        </div>
      </aside>
    </div>
  );
}

// =================== ATM receipt ===================
function AtmReceipt({
  balance,
  currency,
  onClose,
}: {
  balance: number;
  currency: string;
  onClose: () => void;
}) {
  const now = new Date();
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xs animate-pop">
        <div
          className="bg-[oklch(0.98_0.01_90)] text-[oklch(0.2_0_0)] font-mono p-5 shadow-card"
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% calc(100% - 12px), 96% 100%, 92% calc(100% - 12px), 88% 100%, 84% calc(100% - 12px), 80% 100%, 76% calc(100% - 12px), 72% 100%, 68% calc(100% - 12px), 64% 100%, 60% calc(100% - 12px), 56% 100%, 52% calc(100% - 12px), 48% 100%, 44% calc(100% - 12px), 40% 100%, 36% calc(100% - 12px), 32% 100%, 28% calc(100% - 12px), 24% 100%, 20% calc(100% - 12px), 16% 100%, 12% calc(100% - 12px), 8% 100%, 4% calc(100% - 12px), 0 100%)",
          }}
        >
          <div className="text-center border-b border-dashed border-current pb-2">
            <div className="font-black tracking-widest">T-CASH TRACKER</div>
            <div className="text-[10px] opacity-70">— Balance Inquiry —</div>
          </div>
          <div className="py-4 text-center">
            <div className="text-[11px] uppercase tracking-widest opacity-70">
              Available Balance
            </div>
            <div className="text-3xl font-black mt-1">
              {fmtMoney(balance, currency)}
            </div>
          </div>
          <div className="border-t border-dashed border-current pt-2 text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span>Date</span>
              <span>{now.toLocaleDateString("en-GB")}</span>
            </div>
            <div className="flex justify-between">
              <span>Time</span>
              <span>{now.toLocaleTimeString("en-GB", { hour12: true })}</span>
            </div>
            <div className="flex justify-between">
              <span>Ref</span>
              <span>{uid().slice(0, 8).toUpperCase()}</span>
            </div>
          </div>
          <div className="mt-3 text-center text-[10px] opacity-70 border-t border-dashed border-current pt-2">
            *** Thank you for using T-Cash ***
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-primary text-primary-foreground py-3 font-bold tap-scale"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// =================== Util ===================
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
