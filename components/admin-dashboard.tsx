"use client";

import { useMemo, useState } from "react";

type RegistrationRow = {
  id: string;
  fullName: string;
  email: string;
  event: string;
  college: string;
  createdAt: string;
};

const exampleRows: RegistrationRow[] = [
  {
    id: "EVT-1024",
    fullName: "Aisha Khanna",
    email: "aisha@college.edu",
    event: "Hackathon",
    college: "NIT Trichy",
    createdAt: "2026-08-28",
  },
  {
    id: "EVT-1031",
    fullName: "Rohan Mehta",
    email: "rohan@campus.edu",
    event: "Code Sprint",
    college: "VIT Pune",
    createdAt: "2026-08-28",
  },
  {
    id: "EVT-1045",
    fullName: "Priya Nair",
    email: "priya@tech.ac.in",
    event: "UI/UX Challenge",
    college: "IIT Hyderabad",
    createdAt: "2026-08-27",
  },
];

export function AdminDashboard() {
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("All events");

  const filteredRows = useMemo(() => {
    return exampleRows.filter((row) => {
      const matchesQuery =
        row.fullName.toLowerCase().includes(query.toLowerCase()) ||
        row.email.toLowerCase().includes(query.toLowerCase()) ||
        row.id.toLowerCase().includes(query.toLowerCase());

      const matchesFilter =
        eventFilter === "All events" ? true : row.event === eventFilter;

      return matchesQuery && matchesFilter;
    });
  }, [query, eventFilter]);

  const totalRegistrations = exampleRows.length;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Total registrations</p>
          <p className="mt-3 text-3xl font-bold text-white">{totalRegistrations}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Open competitions</p>
          <p className="mt-3 text-3xl font-bold text-white">6</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Peak attendance</p>
          <p className="mt-3 text-3xl font-bold text-white">320</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <label className="mb-2 block text-sm text-slate-300">Search registrations</label>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              placeholder="Search by name, email, or ID"
            />
          </div>

          <div className="md:w-64">
            <label className="mb-2 block text-sm text-slate-300">Filter by event</label>
            <select
              value={eventFilter}
              onChange={(event) => setEventFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
            >
              <option>All events</option>
              <option>Hackathon</option>
              <option>Code Sprint</option>
              <option>UI/UX Challenge</option>
            </select>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
            <thead className="bg-slate-950/90 text-slate-300">
              <tr>
                <th className="px-4 py-3 font-medium">Registration ID</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">College</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900 text-slate-100">
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/60">
                    <td className="px-4 py-3 font-medium text-cyan-300">{row.id}</td>
                    <td className="px-4 py-3">{row.fullName}</td>
                    <td className="px-4 py-3">{row.email}</td>
                    <td className="px-4 py-3">{row.event}</td>
                    <td className="px-4 py-3">{row.college}</td>
                    <td className="px-4 py-3">{row.createdAt}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    No registrations match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
