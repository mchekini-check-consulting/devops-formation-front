import React, { useEffect, useState } from "react";
import { paymentService, API_CONFIG } from "../../lib/api";
import {
  AlertIcon,
  CreditIcon,
  CheckIcon,
  CrossIcon,
} from "../../components/icons";
import { Payment } from "../../types/api";

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}
function fmtDate(s: string | undefined) {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

export default function PaymentPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    paymentService
      .getPayments()
      .then(setPayments)
      .catch(() => {
        const payUrl =
          typeof window !== "undefined" &&
          process.env.NODE_ENV === "development"
            ? "/api/payments"
            : API_CONFIG.PAYMENT;
        setError(
          `Impossible de charger les paiements. Vérifiez que le payment-service est actif (${payUrl}).`
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const success = payments.filter((p) => p.status === "SUCCESS");
  const failed = payments.filter((p) => p.status === "FAILED");
  const volume = success.reduce((s, p) => s + p.amount, 0);
  const rate =
    payments.length > 0
      ? Math.round((success.length / payments.length) * 100)
      : 0;

  return (
    <div>
      <div className="page-header">
        <div className="breadcrumb">
          <span>payment-service</span>
          <span>›</span>
          <span>GET /payments</span>
        </div>
        <h1>Historique des paiements</h1>
        <p>
          {payments.length} transaction{payments.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Simulation notice */}
      <div className="alert alert-info mb-4" style={{ marginBottom: 24 }}>
        <AlertIcon />
        <div>
          <strong>Mode simulation</strong> — Le payment-service retourne{" "}
          <code>SUCCESS</code> avec une probabilité de 80% et{" "}
          <code>FAILED</code> avec 20%.
        </div>
      </div>

      {/* Stats */}
      {payments.length > 0 && (
        <div className="grid-4 mb-4">
          {[
            {
              label: "Transactions",
              value: payments.length,
              sub: "total",
              cls: "",
            },
            {
              label: "Acceptées",
              value: success.length,
              sub: `${rate}% de succès`,
              cls: "text-green",
            },
            {
              label: "Refusées",
              value: failed.length,
              sub: `${100 - rate}% d'échec`,
              cls: "text-red",
            },
            {
              label: "Volume traité",
              value: fmt(volume),
              sub: "paiements acceptés",
              cls: "text-blue",
            },
          ].map((s) => (
            <div className="card stat-card" key={s.label}>
              <div className="stat-label">{s.label}</div>
              <div
                className={`stat-value ${s.cls}`}
                style={{ fontSize: typeof s.value === "string" ? 20 : 28 }}
              >
                {s.value}
              </div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="alert alert-danger mb-4">
          <AlertIcon />
          {error}
        </div>
      )}

      {loading ? (
        <div className="card">
          <div
            className="card-body"
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: 40 }} />
            ))}
          </div>
        </div>
      ) : payments.length === 0 ? (
        <div className="empty-state">
          <CreditIcon size={40} />
          <h3>Aucun paiement</h3>
          <p>
            Les paiements s'afficheront ici après avoir traité des commandes
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <CreditIcon size={14} />
            Transactions ({payments.length})
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID Paiement</th>
                  <th>Commande</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <code
                        className="font-mono text-xs"
                        style={{ color: "var(--gray-600)" }}
                      >
                        {p.id}
                      </code>
                    </td>
                    <td>
                      <code
                        className="font-mono text-xs"
                        style={{ color: "var(--blue)" }}
                      >
                        ...{p.order_id.slice(-10).toUpperCase()}
                      </code>
                    </td>
                    <td className="text-sm text-muted font-mono">
                      {p.user_id}
                    </td>
                    <td className="text-sm text-muted">
                      {fmtDate(p.created_at)}
                    </td>
                    <td style={{ fontWeight: 700 }}>{fmt(p.amount)}</td>
                    <td>
                      {p.status === "SUCCESS" ? (
                        <span className="badge badge-success">
                          <CheckIcon size={10} /> SUCCESS
                        </span>
                      ) : (
                        <span className="badge badge-danger">
                          <CrossIcon size={10} /> FAILED
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-footer">
            <span className="text-xs text-muted">
              Volume total accepté : <strong>{fmt(volume)}</strong>
              {" · "}
              Taux de succès : <strong>{rate}%</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
