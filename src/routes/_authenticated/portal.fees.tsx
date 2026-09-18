import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { feesQuery, formatDate, formatKES } from "@/lib/portal.queries";

export const Route = createFileRoute("/_authenticated/portal/fees")({
  component: FeesPage,
});

function FeesPage() {
  const { data } = useQuery(feesQuery);
  const invoices = data?.invoices ?? [];
  const payments = data?.payments ?? [];
  const billed = invoices.reduce((s, i) => s + Number(i.amount), 0);
  const paid = payments.reduce((s, p) => s + Number(p.amount), 0);
  const balance = billed - paid;

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Finance</p>
        <h1 className="mt-2 text-4xl text-ink">Fees &amp; payments</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Summary label="Total billed" value={formatKES(billed)} />
        <Summary label="Total paid" value={formatKES(paid)} />
        <Summary label="Balance" value={formatKES(balance)} highlight={balance > 0} />
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-cream">
        <h2 className="border-b border-border px-6 py-4 font-display text-lg text-ink">Invoices</h2>
        <ul className="divide-y divide-border">
          {invoices.map((i) => (
            <li key={i.id} className="flex items-center justify-between px-6 py-4 text-sm">
              <div>
                <p className="font-medium text-ink">{i.description}</p>
                <p className="text-xs text-ink/50">Term {i.term} · {i.year} · due {formatDate(i.due_date)}</p>
              </div>
              <p className="font-display font-semibold text-ink">{formatKES(Number(i.amount))}</p>
            </li>
          ))}
          {invoices.length === 0 && <li className="px-6 py-4 text-sm text-ink/60">No invoices yet.</li>}
        </ul>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-cream">
        <h2 className="border-b border-border px-6 py-4 font-display text-lg text-ink">Payments received</h2>
        <ul className="divide-y divide-border">
          {payments.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-6 py-4 text-sm">
              <div>
                <p className="font-medium text-ink">{p.method}</p>
                <p className="text-xs text-ink/50">Ref {p.reference} · {formatDate(p.paid_at)}</p>
              </div>
              <p className="font-display font-semibold text-brand">{formatKES(Number(p.amount))}</p>
            </li>
          ))}
          {payments.length === 0 && <li className="px-6 py-4 text-sm text-ink/60">No payments recorded yet.</li>}
        </ul>
      </section>

      <p className="text-sm text-ink/60">
        Pay via M-Pesa Paybill <span className="font-semibold text-ink">522522</span>, account number = your admission number.
      </p>
    </div>
  );
}

function Summary({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-cream p-5">
      <p className="text-[11px] uppercase tracking-wider text-sage">{label}</p>
      <p className={`mt-1 font-display text-2xl ${highlight ? "text-clay" : "text-ink"}`}>{value}</p>
    </div>
  );
}
