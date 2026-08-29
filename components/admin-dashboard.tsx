"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpDown, Camera, CheckCircle2, LogOut, RefreshCcw, Search, Users, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type RegistrationRow = {
  id: string;
  registration_id: string;
  full_name: string;
  email: string;
  branch: string;
  year: string;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
};

type DashboardStats = {
  totalRegistrations: number;
  checkedInCount: number;
  notCheckedInCount: number;
  attendancePercentage: number;
};

const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatShortDate = (value: string | null | undefined) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function AdminDashboard() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRegistrations: 0,
    checkedInCount: 0,
    notCheckedInCount: 0,
    attendancePercentage: 0,
  });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "checked_in" | "not_checked_in">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRegistrations = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/registrations", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = (await response.json()) as {
        registrations?: RegistrationRow[];
        stats?: DashboardStats;
        error?: string;
      };

      if (!response.ok || !data.registrations) {
        setError(data.error || "Unable to load registrations from the database.");
        setRegistrations([]);
        setStats({
          totalRegistrations: 0,
          checkedInCount: 0,
          notCheckedInCount: 0,
          attendancePercentage: 0,
        });
        return;
      }

      setRegistrations(data.registrations);
      setStats(
        data.stats || {
          totalRegistrations: data.registrations.length,
          checkedInCount: data.registrations.filter((row) => row.checked_in).length,
          notCheckedInCount: data.registrations.filter((row) => !row.checked_in).length,
          attendancePercentage:
            data.registrations.length === 0
              ? 0
              : (data.registrations.filter((row) => row.checked_in).length / data.registrations.length) * 100,
        },
      );
    } catch {
      setError("Unable to load registrations right now. Please try again.");
      setRegistrations([]);
      setStats({
        totalRegistrations: 0,
        checkedInCount: 0,
        notCheckedInCount: 0,
        attendancePercentage: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      if (cancelled) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/admin/registrations", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = (await response.json()) as {
          registrations?: RegistrationRow[];
          stats?: DashboardStats;
          error?: string;
        };

        if (cancelled) {
          return;
        }

        if (!response.ok || !data.registrations) {
          setError(data.error || "Unable to load registrations from the database.");
          setRegistrations([]);
          setStats({
            totalRegistrations: 0,
            checkedInCount: 0,
            notCheckedInCount: 0,
            attendancePercentage: 0,
          });
          return;
        }

        setRegistrations(data.registrations);
        setStats(
          data.stats || {
            totalRegistrations: data.registrations.length,
            checkedInCount: data.registrations.filter((row) => row.checked_in).length,
            notCheckedInCount: data.registrations.filter((row) => !row.checked_in).length,
            attendancePercentage:
              data.registrations.length === 0
                ? 0
                : (data.registrations.filter((row) => row.checked_in).length / data.registrations.length) * 100,
          },
        );
      } catch {
        if (!cancelled) {
          setError("Unable to load registrations right now. Please try again.");
          setRegistrations([]);
          setStats({
            totalRegistrations: 0,
            checkedInCount: 0,
            notCheckedInCount: 0,
            attendancePercentage: 0,
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRegistrations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return registrations.filter((row) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        row.full_name.toLowerCase().includes(normalizedQuery) ||
        row.email.toLowerCase().includes(normalizedQuery) ||
        row.registration_id.toLowerCase().includes(normalizedQuery) ||
        row.branch.toLowerCase().includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "checked_in"
            ? row.checked_in
            : !row.checked_in;

      return matchesQuery && matchesStatus;
    });
  }, [query, registrations, statusFilter]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[30px] border border-[var(--border)] bg-white p-5 shadow-[0_14px_40px_rgba(13,29,59,0.05)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--blue)]">Organizer access</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-[var(--navy)]">Event Dashboard</h1>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Monitor registrations, attendee check-ins, and workshop attendance in real time.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void loadRegistrations()}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--navy)] transition hover:border-[var(--blue)] hover:text-[var(--blue)]"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>

              <Link
                href="/admin/scan"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--blue)]"
              >
                <Camera className="h-4 w-4" />
                Scan QR Ticket
              </Link>

              <button
                type="button"
                onClick={() => void handleLogout()}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--navy)] transition hover:border-red-300 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-[var(--border)] bg-white p-5 shadow-[0_8px_25px_rgba(13,29,59,0.04)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--muted)]">Total registrations</p>
              <Users className="h-4 w-4 text-[var(--blue)]" />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-[var(--navy)]">
              {stats.totalRegistrations}
            </p>
          </div>

          <div className="rounded-[24px] border border-[var(--border)] bg-white p-5 shadow-[0_8px_25px_rgba(13,29,59,0.04)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--muted)]">Checked-in</p>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-[var(--navy)]">
              {stats.checkedInCount}
            </p>
          </div>

          <div className="rounded-[24px] border border-[var(--border)] bg-white p-5 shadow-[0_8px_25px_rgba(13,29,59,0.04)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--muted)]">Not checked-in</p>
              <XCircle className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-[var(--navy)]">
              {stats.notCheckedInCount}
            </p>
          </div>

          <div className="rounded-[24px] border border-[var(--border)] bg-white p-5 shadow-[0_8px_25px_rgba(13,29,59,0.04)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--muted)]">Attendance</p>
              <ArrowUpDown className="h-4 w-4 text-[var(--blue)]" />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-[var(--navy)]">
              {stats.totalRegistrations === 0 ? "0%" : `${stats.attendancePercentage.toFixed(1)}%`}
            </p>
          </div>
        </div>

        <div className="rounded-[30px] border border-[var(--border)] bg-white p-5 shadow-[0_14px_40px_rgba(13,29,59,0.05)] sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex-1 xl:max-w-xl">
              <label className="mb-2 block text-sm font-medium text-[var(--muted)]">Search</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by name, email, registration ID, or branch"
                  className="w-full rounded-full border border-[var(--border)] bg-[var(--soft-blue)] py-3 pl-10 pr-4 text-sm text-[var(--navy)] placeholder:text-[var(--muted)] focus:border-[var(--blue)] focus:outline-none"
                />
              </div>
            </div>

            <div className="xl:w-52">
              <label className="mb-2 block text-sm font-medium text-[var(--muted)]">Status</label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as "all" | "checked_in" | "not_checked_in")}
                className="w-full rounded-full border border-[var(--border)] bg-[var(--soft-blue)] px-4 py-3 text-sm text-[var(--navy)] focus:border-[var(--blue)] focus:outline-none"
              >
                <option value="all">All</option>
                <option value="checked_in">Checked in</option>
                <option value="not_checked_in">Not checked in</option>
              </select>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[22px] border border-[var(--border)]">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-sm text-[var(--muted)]">
                Loading registrations...
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-16 text-sm text-red-600">{error}</div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-sm text-[var(--muted)]">
                No registrations match the current search and filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-[#f8fbff] text-[var(--muted)]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Registration ID</th>
                      <th className="px-4 py-3 font-semibold">Full name</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Branch</th>
                      <th className="px-4 py-3 font-semibold">Year</th>
                      <th className="px-4 py-3 font-semibold">Registration date</th>
                      <th className="px-4 py-3 font-semibold">Check-in</th>
                      <th className="px-4 py-3 font-semibold">Check-in time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] bg-white text-[var(--navy)]">
                    {filteredRegistrations.map((row) => (
                      <tr key={row.id} className="align-top">
                        <td className="px-4 py-3 font-medium text-[var(--blue)]">{row.registration_id}</td>
                        <td className="px-4 py-3">{row.full_name}</td>
                        <td className="px-4 py-3 break-all">{row.email}</td>
                        <td className="px-4 py-3">{row.branch}</td>
                        <td className="px-4 py-3">{row.year}</td>
                        <td className="px-4 py-3">{formatShortDate(row.created_at)}</td>
                        <td className="px-4 py-3">
                          {row.checked_in ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Checked in
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                              <XCircle className="h-3.5 w-3.5" />
                              Not checked in
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">{formatDateTime(row.checked_in_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
