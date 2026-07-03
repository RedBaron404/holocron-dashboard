const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

interface Exceptions {
  policyDue: { policy: { policyId: string; title: string }; window: string }[];
  programAlerts: { task: { taskId: string; title: string }; severity: string }[];
  staleRisks: { riskId: string; aspect: string }[];
  auditEscalations: number;
  totalExceptions: number;
}

export default async function DashboardPage() {
  const [health, exceptions, policies, program] = await Promise.all([
    fetchJson<{ status: string; workspace: string }>('/health'),
    fetchJson<Exceptions>('/api/agent/exceptions'),
    fetchJson<{ policies: { policyId: string; title: string; status: string; nextReviewDate: string }[] }>('/api/policies'),
    fetchJson<{ tasks: { taskId: string; title: string; nextDueDate: string; status: string }[] }>('/api/program/calendar'),
  ]);

  const pendingApprovals =
    policies?.policies.filter((p) => p.status === 'In Review') ?? [];

  return (
    <main className="mx-auto max-w-6xl p-8">
      <header className="mb-8 border-b border-slate-200 pb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Corporate IMS — GRC Analyst Agent
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Holocron Dashboard
        </h1>
        <p className="mt-2 text-slate-600">
          Exception queue, pending approvals, and program calendar status.
        </p>
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-4">
        <StatCard
          label="Total exceptions"
          value={exceptions?.totalExceptions ?? '—'}
          alert={(exceptions?.totalExceptions ?? 0) > 0}
        />
        <StatCard
          label="Policies due"
          value={exceptions?.policyDue.length ?? '—'}
        />
        <StatCard
          label="Stale risks"
          value={exceptions?.staleRisks.length ?? '—'}
        />
        <StatCard
          label="Workspace"
          value={health?.workspace ?? 'offline'}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Pending approvals">
          {pendingApprovals.length === 0 ? (
            <p className="text-sm text-slate-500">No policies in review.</p>
          ) : (
            <ul className="space-y-2">
              {pendingApprovals.map((p) => (
                <li
                  key={p.policyId}
                  className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{p.policyId}</span> — {p.title}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Program calendar alerts">
          {!exceptions?.programAlerts.length ? (
            <p className="text-sm text-slate-500">No active alerts.</p>
          ) : (
            <ul className="space-y-2">
              {exceptions.programAlerts.map((a) => (
                <li
                  key={a.task.taskId}
                  className="rounded border border-slate-200 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{a.task.taskId}</span> —{' '}
                  {a.task.title}
                  <span className="ml-2 text-amber-700">({a.severity})</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Policy review queue">
          {!exceptions?.policyDue.length ? (
            <p className="text-sm text-slate-500">All policies on schedule.</p>
          ) : (
            <ul className="space-y-2">
              {exceptions.policyDue.map((d) => (
                <li
                  key={d.policy.policyId}
                  className="rounded border border-slate-200 px-3 py-2 text-sm"
                >
                  {d.policy.policyId} — {d.window}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Upcoming program tasks">
          {!program?.tasks.length ? (
            <p className="text-sm text-slate-500">Configure program calendar.</p>
          ) : (
            <ul className="space-y-2">
              {program.tasks
                .filter((t) => t.status === 'Active')
                .slice(0, 8)
                .map((t) => (
                  <li
                    key={t.taskId}
                    className="flex justify-between rounded border border-slate-200 px-3 py-2 text-sm"
                  >
                    <span>{t.title}</span>
                    <span className="text-slate-500">{t.nextDueDate}</span>
                  </li>
                ))}
            </ul>
          )}
        </Panel>
      </div>

      <footer className="mt-8 text-center text-sm text-slate-500">
        <a href={`${API_URL}/auth/login`} className="text-blue-600 hover:underline">
          Sign in with Google
        </a>
        {' · '}
        Daily scan: <code>npm run daily-scan</code>
      </footer>
    </main>
  );
}

function StatCard({
  label,
  value,
  alert,
}: {
  label: string;
  value: string | number;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${alert ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}
    >
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-medium text-slate-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
