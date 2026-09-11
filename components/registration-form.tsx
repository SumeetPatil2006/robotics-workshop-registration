"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { branchOptions, yearOptions } from "@/lib/event-data";
import { CustomSelect } from "@/components/custom-select";

const initialForm = {
  fullName: "",
  branch: "",
  year: "",
  email: "",
  mobile: "",
};

export function RegistrationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
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

    if (!formData.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!formData.mobile.trim()) {
      nextErrors.mobile = "Mobile number is required.";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      nextErrors.mobile = "Enter a valid 10-digit mobile number.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
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
          mobile: formData.mobile.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          form:
            data.error ||
            "Please review the form and try again.",
        });
        return;
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "robotics-workshop-registration",
          JSON.stringify({
            registration: data.registration,
            ticket: data.ticket,
          })
        );
      }

      router.push("/register/success");
    } catch {
      setErrors({
        form:
          "Something went wrong while submitting. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-8"
    >
      <div className="space-y-5">

        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Full Name
          </label>

          <input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Your full name"
            required
            className="w-full rounded-xl border border-slate-200 bg-stone-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
          />

          {errors.fullName && (
            <p className="mt-2 text-sm text-red-600">
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Branch */}
        <div>
          <label
            htmlFor="branch"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Branch
          </label>

          <CustomSelect
            id="branch"
            name="branch"
            value={formData.branch}
            onChange={(value) => {
              setFormData((current) => ({ ...current, branch: value }));
              setErrors((current) => ({ ...current, branch: "" }));
            }}
            options={branchOptions.map(b => ({ value: b, label: b }))}
            placeholder="Select your branch"
            required
            className="w-full rounded-xl border border-slate-200 bg-stone-50 px-4 py-3 text-slate-900 focus:border-slate-400 focus:outline-none transition hover:border-slate-300"
          />

          {errors.branch && (
            <p className="mt-2 text-sm text-red-600">
              {errors.branch}
            </p>
          )}
        </div>

        {/* Year */}
        <div>
          <label
            htmlFor="year"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Year
          </label>

          <CustomSelect
            id="year"
            name="year"
            value={formData.year}
            onChange={(value) => {
              setFormData((current) => ({ ...current, year: value }));
              setErrors((current) => ({ ...current, year: "" }));
            }}
            options={yearOptions.map(y => ({ value: y, label: y }))}
            placeholder="Select your year"
            required
            className="w-full rounded-xl border border-slate-200 bg-stone-50 px-4 py-3 text-slate-900 focus:border-slate-400 focus:outline-none transition hover:border-slate-300"
          />

          {errors.year && (
            <p className="mt-2 text-sm text-red-600">
              {errors.year}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Email Address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            required
            className="w-full rounded-xl border border-slate-200 bg-stone-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
          />

          {errors.email && (
            <p className="mt-2 text-sm text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label
            htmlFor="mobile"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Mobile Number
          </label>

          <input
            id="mobile"
            name="mobile"
            type="tel"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Enter 10-digit mobile number"
            required
            maxLength={10}
            inputMode="numeric"
            pattern="[6-9][0-9]{9}"
            className="w-full rounded-xl border border-slate-200 bg-stone-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
          />

          {errors.mobile && (
            <p className="mt-2 text-sm text-red-600">
              {errors.mobile}
            </p>
          )}
        </div>
      </div>

      {/* Form Error */}
      {errors.form && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.form}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting
          ? "Submitting..."
          : "Register for Workshop"}
      </button>
    </form>
  );
}