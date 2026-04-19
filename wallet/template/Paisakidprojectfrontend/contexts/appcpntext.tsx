import { createContext, useContext, useMemo, useState, ReactNode, useCallback } from "react";

export type TxStatus = "Success" | "Failed" | "Flagged";

export interface Transaction {
  id: string;
  studentId: string;
  merchant: string;
  item: string;
  amount: number;
  timestamp: number;
  status: TxStatus;
  failureReason?: string;
}

export interface Alert {
  id: string;
  message: string;
  timestamp: number;
  severity: "info" | "warning" | "danger";
}

interface AppState {
  parentName: string;
  childName: string;
  studentId: string;
  merchantName: string;
  balance: number;
  dailyLimit: number;
  todaySpent: number;
  purchasesEnabled: boolean;
  transactions: Transaction[];
  alerts: Alert[];
}

interface PaymentResult {
  ok: boolean;
  message: string;
  transaction?: Transaction;
}

interface AppContextValue extends AppState {
  topUp: (amount: number) => void;
  setDailyLimit: (n: number) => void;
  togglePurchases: (v: boolean) => void;
  resetDay: () => void;
  processPayment: (input: { studentId: string; item: string; amount: number; merchant: string }) => PaymentResult;
  disputeTransaction: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const now = Date.now();
const initialTransactions: Transaction[] = [
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
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(800);
  const [dailyLimit, setDailyLimitState] = useState(500);
  const [todaySpent, setTodaySpent] = useState(0);
  const [purchasesEnabled, setPurchasesEnabled] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = useCallback((message: string, severity: Alert["severity"] = "warning") => {
    setAlerts((prev) => [
      { id: `a${Date.now()}${Math.random().toString(36).slice(2, 6)}`, message, timestamp: Date.now(), severity },
      ...prev,
    ]);
  }, []);

  const topUp = useCallback((amount: number) => {
    if (amount <= 0) return;
    setBalance((b) => b + amount);
  }, []);

  const setDailyLimit = useCallback((n: number) => {
    setDailyLimitState(Math.max(0, Math.min(2000, n)));
  }, []);

  const togglePurchases = useCallback((v: boolean) => {
    setPurchasesEnabled(v);
  }, []);

  const resetDay = useCallback(() => {
    setTodaySpent(0);
  }, []);

  const processPayment: AppContextValue["processPayment"] = useCallback(
    ({ studentId, item, amount, merchant }) => {
      const fail = (reason: string): PaymentResult => {
        const tx: Transaction = {
          id: `t${Date.now()}`,
          studentId: studentId || "—",
          merchant,
          item: item || "—",
          amount,
          timestamp: Date.now(),
          status: "Failed",
          failureReason: reason,
        };
        setTransactions((prev) => [tx, ...prev]);
        return { ok: false, message: reason, transaction: tx };
      };

      if (!/^S\d{3}$/.test(studentId.trim())) return fail("Invalid student ID");
      if (!item.trim()) return fail("Item name required");
      if (!Number.isFinite(amount) || amount <= 0) return fail("Invalid amount");
      if (!purchasesEnabled) return fail("Payments disabled by parent");
      if (todaySpent + amount > dailyLimit) return fail("Daily limit exceeded");
      if (amount > balance) return fail("Insufficient balance");

      const tx: Transaction = {
        id: `t${Date.now()}`,
        studentId: studentId.trim(),
        merchant,
        item: item.trim(),
        amount,
        timestamp: Date.now(),
        status: "Success",
      };

      setBalance((b) => b - amount);
      setTodaySpent((s) => s + amount);
      setTransactions((prev) => {
        const next = [tx, ...prev];
        // rapid transaction detection: 3+ successes in last 60s
        const recent = next.filter((t) => t.status === "Success" && Date.now() - t.timestamp < 60_000);
        if (recent.length >= 3) {
          addAlert("Multiple rapid transactions detected – review activity.", "danger");
        }
        return next;
      });

      return { ok: true, message: `Payment approved – PKR ${amount} deducted from student.`, transaction: tx };
    },
    [purchasesEnabled, todaySpent, dailyLimit, balance, addAlert],
  );

  const disputeTransaction = useCallback(
    (id: string) => {
      setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, status: "Flagged" as TxStatus } : t)));
      addAlert(`Transaction #${id.slice(-4)} disputed – review required.`, "warning");
    },
    [addAlert],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      parentName: "Sarah",
      childName: "Ali",
      studentId: "S123",
      merchantName: "Ahmed",
      balance,
      dailyLimit,
      todaySpent,
      purchasesEnabled,
      transactions,
      alerts,
      topUp,
      setDailyLimit,
      togglePurchases,
      resetDay,
      processPayment,
      disputeTransaction,
    }),
    [balance, dailyLimit, todaySpent, purchasesEnabled, transactions, alerts, topUp, setDailyLimit, togglePurchases, resetDay, processPayment, disputeTransaction],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
