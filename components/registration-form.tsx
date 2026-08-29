"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { branchOptions, yearOptions } from "@/lib/event-data";

const initialForm = {
  fullName: "",
  branch: "",
  year: "",
  email: "",
};

export function RegistrationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validateClient = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!formData.branch.trim()) {
      nextErrors.branch = "Please select your branch.";
    }

    if (!formData.year.trim()) {
      nextErrors.year = "Please select your year.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateClient()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          branch: formData.branch,
          year: formData.year,
          email: formData.email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ form: data.error || "Please review the form and try again." });
        return;
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "robotics-workshop-registration",
          JSON.stringify({
            registration: data.registration,
            ticket: data.ticket,
          }),
        );
      }

      router.push("/register/success");
    } catch {
      setErrors({
        form: "Something went wrong while submitting. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-8">
      <div className="space-y-5">
        <div>
          <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-slate-700">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Your full name"
            className="w-full rounded-xl border border-slate-200 bg-stone-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
          />
          {errors.fullName && <p className="mt-2 text-sm text-red-600">{errors.fullName}</p>}
        </div>

        <div>
          <label htmlFor="branch" className="mb-2 block text-sm font-medium text-slate-700">
            Branch
          </label>
          <select
            id="branch"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 bg-stone-50 px-4 py-3 text-slate-900 focus:border-slate-400 focus:outline-none"
          >
            <option value="">Select your branch</option>
            {branchOptions.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
          {errors.branch && <p className="mt-2 text-sm text-red-600">{errors.branch}</p>}
        </div>

        <div>
          <label htmlFor="year" className="mb-2 block text-sm font-medium text-slate-700">
            Year
          </label>
          <select
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 bg-stone-50 px-4 py-3 text-slate-900 focus:border-slate-400 focus:outline-none"
          >
            <option value="">Select your year</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {errors.year && <p className="mt-2 text-sm text-red-600">{errors.year}</p>}
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            className="w-full rounded-xl border border-slate-200 bg-stone-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
          />
          {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
        </div>
      </div>

      {errors.form && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.form}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Submitting..." : "Register for Workshop"}
      </button>
    </form>
  );
}
