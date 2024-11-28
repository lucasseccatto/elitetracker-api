import { ZodIssue } from "zod";

export function ErrorMessageValidation(issues: ZodIssue[]): string[] {
  const errors = issues.map(
    (item) => `${item.path.join(".")}: ${item.message}`
  );

  return errors;
}
