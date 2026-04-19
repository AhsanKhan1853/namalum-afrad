/**
 * PaisaKid – Shared State Module
 * Django integration: include this script before any page-specific script.
 * State is kept in memory; swap localStorage/sessionStorage or Django REST calls as needed.
 */

const now = Date.now();

const DEFAULT_STATE = {
  parentName: "Sarah",
  childName: "Ali",
  studentId: "S123",
  merchantName: "Ahmed",
  balance: 800,
  dailyLimit: 500,
  todaySpent: 0,
  purchasesEnabled: true,
  transactions: [
    {
      id: "t1",
      studentId: "S123",
      merchant: "School Canteen",
      item: "Sandwich",
      amount: 150,
      timestamp: now - 2 * 60 * 60 * 1000,
      status: "Success",
    },
    {
      id: "t2",
      studentId: "S123",
      merchant: "Stationery Shop",
      item: "Notebook",
      amount: 80,
      timestamp: now - 5 * 60 * 60 * 1000,
      status: "Success",
    },
  ],
  alerts: [],
};

let _state = JSON.parse(JSON.stringify(DEFAULT_STATE));
const _listeners = new Set();

function subscribe(fn) { _listeners.add(fn); return () => _listeners.delete(fn); }
function notify() { _listeners.forEach(fn => fn(_state)); }
function getState() { return _state; }

function formatPKR(n) {
  return `PKR ${Number(n).toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}

function relativeTime(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function maskStudentId(id) {
  if (id.length < 4) return id;
  return `${id[0]}***${id.slice(-3)}`;
}

function addAlert(message, severity = "warning") {
  _state.alerts = [
    { id: `a${Date.now()}${Math.random().toString(36).slice(2, 6)}`, message, timestamp: Date.now(), severity },
    ..._state.alerts,
  ];
}

function topUp(amount) {
  if (amount <= 0) return;
  _state.balance += amount;
  notify();
}

function setDailyLimit(n) {
  _state.dailyLimit = Math.max(0, Math.min(2000, n));
  notify();
}

function togglePurchases(v) {
  _state.purchasesEnabled = v;
  notify();
}

function resetDay() {
  _state.todaySpent = 0;
  notify();
}

function processPayment({ studentId, item, amount, merchant }) {
  const fail = (reason) => {
    const tx = {
      id: `t${Date.now()}`,
      studentId: studentId || "—",
      merchant,
      item: item || "—",
      amount,
      timestamp: Date.now(),
      status: "Failed",
      failureReason: reason,
    };
    _state.transactions = [tx, ..._state.transactions];
    notify();
    return { ok: false, message: reason, transaction: tx };
  };

  if (!/^S\d{3}$/.test((studentId || "").trim())) return fail("Invalid student ID");
  if (!item || !item.trim()) return fail("Item name required");
  if (!Number.isFinite(amount) || amount <= 0) return fail("Invalid amount");
  if (!_state.purchasesEnabled) return fail("Payments disabled by parent");
  if (_state.todaySpent + amount > _state.dailyLimit) return fail("Daily limit exceeded");
  if (amount > _state.balance) return fail("Insufficient balance");

  const tx = {
    id: `t${Date.now()}`,
    studentId: studentId.trim(),
    merchant,
    item: item.trim(),
    amount,
    timestamp: Date.now(),
    status: "Success",
  };

  _state.balance -= amount;
  _state.todaySpent += amount;
  _state.transactions = [tx, ..._state.transactions];

  const recent = _state.transactions.filter(t => t.status === "Success" && Date.now() - t.timestamp < 60_000);
  if (recent.length >= 3) {
    addAlert("Multiple rapid transactions detected – review activity.", "danger");
  }

  notify();
  return { ok: true, message: `Payment approved – PKR ${amount} deducted from student.`, transaction: tx };
}

function disputeTransaction(id) {
  _state.transactions = _state.transactions.map(t => t.id === id ? { ...t, status: "Flagged" } : t);
  addAlert(`Transaction #${id.slice(-4)} disputed – review required.`, "warning");
  notify();
}

// Expose globally
window.PaisaKid = {
  getState, subscribe, notify,
  formatPKR, relativeTime, maskStudentId,
  topUp, setDailyLimit, togglePurchases, resetDay,
  processPayment, disputeTransaction,
};
