import { z } from "zod";

export const registrationSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required."),
  branch: z.string().trim().min(2, "Please select your branch."),
  year: z.string().trim().min(2, "Please select your year."),
  email: z.string().trim().email("Enter a valid email address."),
});

export const validateRegistrationInput = (input: unknown) => {
  const parsed = registrationSchema.safeParse(input);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      success: false as const,
      error: issue?.message || "Please review the form and try again.",
    };
  }

  const data = parsed.data;

  return {
    success: true as const,
    data: {
      fullName: data.fullName.trim(),
      branch: data.branch.trim(),
      year: data.year.trim(),
      email: data.email.trim().toLowerCase(),
    },
  };
};
