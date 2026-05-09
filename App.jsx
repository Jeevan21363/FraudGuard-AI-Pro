import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Download,
  Eye,
  Lock,
  LogOut,
  Moon,
  Play,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sun,
  XCircle,
} from "lucide-react";
import { api, clearToken, getToken, setToken, wsUrl } from "./api";

const emptyForm = {
  amount: 95000,
  user_average: 7000,
  bank_name: "HDFC Bank",
  payment_method: "International Card",
  transaction_type: "Transfer",
  location: "Dubai",
  city: "Dubai City",
  device: "new",
  category: "Electronics",
  hour: 2,
  failed_attempts: 4,
};

function money(value) {
  return `INR ${Number(value || 0).toLocaleString("en-IN")}`;
}

function riskClass(score) {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function Login({ onLogin }) {
  const [username, setUsername] = useState("fraud.admin");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    try {
      const result = await api.login({ username, password });
      setToken(result.token);
      onLogin();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="brand-mark">FG</div>
        <h1>FraudGuard AI Pro</h1>
        <p>Secure analyst dashboard for real-time transaction risk monitoring.</p>
        <label>
          Username
          <input value={username} onChange={(event) => setUsername(event.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {error && <div className="error">{error}</div>}
        <button className="btn primary" type="submit">
          <Lock size={17} />
          Login
        </button>
      </form>
    </main>
  );
}

function MetricCard({ label, value, hint, icon: Icon }) {
  return (
    <article className="metric-card">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{hint}</small>
      </div>
      <Icon size={24} />
    </article>
  );
}

function BarRows({ distribution }) {
  const max = Math.max(1, ...Object.values(distribution || {}));
  return (
    <div className="bar-list">
      {Object.entries(distribution || {}).map(([label, value]) => (
        <div className="bar-row" key={label}>
          <span>{label}</span>
          <div className="bar-track">
            <div className={`bar-fill ${label.toLowerCase()}`} style={{ width: `${(value / max) * 100}%` }} />
          </div>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function TransactionForm({ onSubmit }) {
  const [form, setForm] = useState(emptyForm);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    await onSubmit({
      ...form,
      amount: Number(form.amount),
      user_average: Number(form.user_average),
      hour: Number(form.hour),
      failed_attempts: Number(form.failed_attempts),
    });
  }

  return (
    <form className="panel transaction-form" onSubmit={submit}>
      <h2>Check Transaction</h2>
      <label>
        Amount
        <input type="number" value={form.amount} onChange={(event) => update("amount", event.target.value)} />
      </label>
      <label>
        User Average
        <input type="number" value={form.user_average} onChange={(event) => update("user_average", event.target.value)} />
      </label>
      <label>
        Bank
        <select value={form.bank_name} onChange={(event) => update("bank_name", event.target.value)}>
          {["HDFC Bank", "SBI", "ICICI Bank", "Axis Bank", "Kotak Bank", "Unknown Bank"].map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label>
        Payment Method
        <select value={form.payment_method} onChange={(event) => update("payment_method", event.target.value)}>
          {["UPI", "Debit Card", "Credit Card", "Net Banking", "International Card", "Wallet"].map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label>
        Transaction Type
        <select value={form.transaction_type} onChange={(event) => update("transaction_type", event.target.value)}>
          {["Purchase", "Transfer", "Withdrawal", "Subscription"].map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label>
        Location
        <select value={form.location} onChange={(event) => update("location", event.target.value)}>
          {["India", "Dubai", "USA", "Russia", "Singapore", "Germany"].map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label>
        City
        <input value={form.city} onChange={(event) => update("city", event.target.value)} />
      </label>
      <label>
        Device
        <select value={form.device} onChange={(event) => update("device", event.target.value)}>
          <option value="known">Known device</option>
          <option value="new">New device</option>
        </select>
      </label>
      <label>
        Category
        <select value={form.category} onChange={(event) => update("category", event.target.value)}>
          {["Food", "Shopping", "Travel", "Electronics", "Crypto", "Gaming"].map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label>
        Hour
        <input type="number" min="0" max="23" value={form.hour} onChange={(event) => update("hour", event.target.value)} />
      </label>
      <label>
        Failed Attempts
        <input type="number" min="0" value={form.failed_attempts} onChange={(event) => update("failed_attempts", event.target.value)} />
      </label>
      <button className="btn primary" type="submit">
        <ShieldAlert size={17} />
        Check Risk
      </button>
    </form>
  );
}

function ReportModal({ analytics, onClose }) {
  const report = analytics?.report;
  if (!report) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal" onClick={(event) => event.stopPropagation()}>
        <header>
          <h2>AI Executive Report</h2>
          <button className="btn subtle" onClick={onClose}>Close</button>
        </header>
        <div className="summary-list">
          <div><strong>Threat Level</strong><span>{report.threatLevel}</span></div>
          <div><strong>Top Pattern</strong><span>{report.topPattern}</span></div>
          <div><strong>Top Payment Method</strong><span>{report.topPaymentMethod}</span></div>
          <div><strong>Highest Risk Case</strong><span>{report.highestRiskCase ? `${report.highestRiskCase.id} at ${report.highestRiskCase.risk_score}%` : "No data"}</span></div>
          <div><strong>Recommended Action</strong><span>{report.recommendation}</span></div>
        </div>
      </section>
    </div>
  );
}

function CaseModal({ transaction, onClose }) {
  if (!transaction) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal" onClick={(event) => event.stopPropagation()}>
        <header>
          <h2>{transaction.id}</h2>
          <button className="btn subtle" onClick={onClose}>Close</button>
        </header>
        <div className="case-grid">
          <div><strong>User</strong><span>{transaction.user_id}</span></div>
          <div><strong>Amount</strong><span>{money(transaction.amount)}</span></div>
          <div><strong>Bank</strong><span>{transaction.bank_name}</span></div>
          <div><strong>Method</strong><span>{transaction.payment_method}</span></div>
          <div><strong>Device</strong><span>{transaction.device_id}</span></div>
          <div><strong>IP</strong><span>{transaction.ip_address}</span></div>
          <div><strong>Engine</strong><span>{transaction.engine_mode}</span></div>
          <div><strong>Status</strong><span>{transaction.status}</span></div>
        </div>
        <h3>Risk Reasons</h3>
        <ul className="reason-list">
          {transaction.reasons.map((reason, index) => (
            <li key={`${reason.text}-${index}`}>
              <span>{reason.text}</span>
              <strong>+{reason.points}</strong>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(getToken()));
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("fraudguard-theme") || "light");
  const [error, setError] = useState("");

  const metrics = analytics?.metrics || {};
  const latest = transactions[0];

  async function refresh() {
    if (!getToken()) return;
    try {
      const [items, stats] = await Promise.all([
        api.transactions({ status, search }),
        api.analytics(),
      ]);
      setTransactions(items);
      setAnalytics(stats);
      setError("");
    } catch (err) {
      setError(err.message);
      if (err.message.includes("token")) {
        clearToken();
        setIsLoggedIn(false);
      }
    }
  }

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem("fraudguard-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (isLoggedIn) refresh();
  }, [isLoggedIn, status, search]);

  useEffect(() => {
    if (!isLoggedIn) return undefined;
    const socket = new WebSocket(wsUrl());
    socket.onmessage = () => refresh();
    return () => socket.close();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLive) return undefined;
    const timer = setInterval(async () => {
      await api.generate();
      await refresh();
    }, 2600);
    return () => clearInterval(timer);
  }, [isLive]);

  const feed = useMemo(() => transactions.slice(0, 6), [transactions]);

  async function run(action) {
    try {
      await action();
      await refresh();
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  function logout() {
    clearToken();
    setIsLoggedIn(false);
  }

  function exportCsv() {
    const header = ["id", "user", "amount", "bank", "method", "city", "risk", "status"];
    const rows = transactions.map((item) => [
      item.id,
      item.user_id,
      item.amount,
      item.bank_name,
      item.payment_method,
      item.city,
      item.risk_score,
      item.status,
    ]);
    const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "fraudguard-pro-transactions.csv";
    link.click();
  }

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">FG</div>
          <div>
            <h1>FraudGuard AI Pro</h1>
            <p>FastAPI + SQLite + WebSocket + optional ML fraud risk engine</p>
          </div>
        </div>
        <div className="toolbar">
          <span className="live-pill">{isLive ? "Live simulation running" : "Manual mode"}</span>
          <button className="btn subtle" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
            Theme
          </button>
          <button className="btn subtle" onClick={logout}>
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </header>

      {error && <div className="error banner">{error}</div>}

      <section className="metrics-grid">
        <MetricCard label="Total" value={metrics.total || 0} hint="Stored in SQLite" icon={Activity} />
        <MetricCard label="Blocked" value={metrics.blocked || 0} hint="High-risk decisions" icon={XCircle} />
        <MetricCard label="Review" value={metrics.review || 0} hint="Manual verification" icon={Siren} />
        <MetricCard label="Approved" value={metrics.approved || 0} hint="Low-risk flow" icon={CheckCircle2} />
        <MetricCard label="Avg Risk" value={`${metrics.averageRisk || 0}%`} hint="Current session" icon={BarChart3} />
        <MetricCard label="Escalation" value={`${metrics.escalationRate || 0}%`} hint="Review + blocked" icon={ShieldCheck} />
      </section>

      <section className="control-row">
        <button className="btn primary" onClick={() => run(api.generate)}>
          <RefreshCw size={17} />
          Generate Transaction
        </button>
        <button className="btn primary" onClick={() => setIsLive((current) => !current)}>
          <Play size={17} />
          {isLive ? "Stop Live" : "Start Live"}
        </button>
        <button className="btn subtle" onClick={() => run(api.demo)}>Load Demo Data</button>
        <button className="btn subtle" onClick={() => setShowReport(true)}>AI Report</button>
        <button className="btn subtle" onClick={exportCsv}>
          <Download size={17} />
          Export CSV
        </button>
        <button className="btn danger" onClick={() => run(api.clear)}>Reset</button>
      </section>

      <section className="main-grid">
        <TransactionForm onSubmit={(payload) => run(() => api.createTransaction(payload))} />

        <div className="workspace">
          <section className="panel risk-panel">
            <div className={`risk-ring ${riskClass(latest?.risk_score || 0)}`}>
              <strong>{latest?.risk_score || 0}%</strong>
              <span>Risk Score</span>
            </div>
            <div>
              <h2>{latest ? latest.risk_level : "Waiting for transaction"}</h2>
              <p>{latest ? latest.action : "Generate, load demo data, or check a transaction."}</p>
              {latest && <span className="engine-tag">{latest.engine_mode}</span>}
            </div>
          </section>

          <section className="analytics-grid">
            <article className="panel">
              <h2>Status Distribution</h2>
              <BarRows distribution={analytics?.statusDistribution || { Approved: 0, Review: 0, Blocked: 0 }} />
            </article>
            <article className="panel">
              <h2>Risk Trend</h2>
              <div className="trend">
                {(analytics?.riskTrend || []).map((item) => (
                  <div className={`trend-bar ${riskClass(item.score)}`} key={item.id} style={{ height: `${Math.max(10, item.score)}%` }}>
                    <span>{item.score}</span>
                  </div>
                ))}
              </div>
            </article>
            <article className="panel">
              <h2>Category Heatmap</h2>
              <div className="heatmap">
                {(analytics?.categoryHeatmap || []).map((item) => (
                  <div className={`heat-item ${riskClass(item.averageRisk)}`} key={item.category}>
                    <strong>{item.category}</strong>
                    <span>{item.count} txn, avg {item.averageRisk}%</span>
                  </div>
                ))}
              </div>
            </article>
            <article className="panel">
              <h2>Live Alert Feed</h2>
              <div className="feed">
                {feed.length === 0 && <p>No live alerts yet.</p>}
                {feed.map((item) => (
                  <button className={`feed-item ${riskClass(item.risk_score)}`} key={item.id} onClick={() => setSelected(item)}>
                    <strong>{item.id} - {item.risk_score}%</strong>
                    <span>{item.user_id} spent {money(item.amount)} via {item.payment_method}</span>
                  </button>
                ))}
              </div>
            </article>
          </section>
        </div>
      </section>

      <section className="panel table-panel">
        <header className="table-head">
          <h2>Transaction Review Queue</h2>
          <div className="filters">
            <input placeholder="Search user, bank, city, category" value={search} onChange={(event) => setSearch(event.target.value)} />
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option>All</option>
              <option>Approved</option>
              <option>Review</option>
              <option>Blocked</option>
            </select>
          </div>
        </header>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Amount</th>
                <th>Bank</th>
                <th>Method</th>
                <th>Location</th>
                <th>Risk</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.user_id}</td>
                  <td>{money(item.amount)}</td>
                  <td>{item.bank_name}</td>
                  <td>{item.payment_method}</td>
                  <td>{item.city}, {item.location}</td>
                  <td><span className={`badge ${riskClass(item.risk_score)}`}>{item.risk_score}%</span></td>
                  <td>{item.status}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" title="View case" onClick={() => setSelected(item)}><Eye size={16} /></button>
                      <button className="icon-btn good" title="Approve" onClick={() => run(() => api.updateStatus(item.id, "Approved"))}><CheckCircle2 size={16} /></button>
                      <button className="icon-btn warn" title="Review" onClick={() => run(() => api.updateStatus(item.id, "Review"))}><Siren size={16} /></button>
                      <button className="icon-btn danger" title="Block" onClick={() => run(() => api.updateStatus(item.id, "Blocked"))}><XCircle size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="9" className="empty">No transactions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <CaseModal transaction={selected} onClose={() => setSelected(null)} />
      {showReport && <ReportModal analytics={analytics} onClose={() => setShowReport(false)} />}
    </main>
  );
}

export default App;
