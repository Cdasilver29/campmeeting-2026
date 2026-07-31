import type { ComponentProps, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const selectClasses =
  "h-11 lg:h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm text-ink transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30";

/**
 * The width cap lives on the shell rather than on the control, so the
 * label, the hint and the error message end where the input does. Capping
 * the input alone leaves a hint line running out past its own field,
 * which is the thing that makes a form look like it has no column.
 *
 * `wide` is for the textarea only. See the field-width note in globals.css
 * for why a message box is allowed more room than a Name field.
 */
function FieldShell({
  id,
  label,
  error,
  hint,
  required,
  wide,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", !wide && "field-control")}>
      <label htmlFor={id} className="text-xs font-medium text-ink-muted">
        {label}
        {required ? null : (
          <span className="ml-1 font-normal text-ink-muted/70">(optional)</span>
        )}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type FieldBaseProps = {
  id: string;
  name: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
};

export function TextField({
  id,
  name,
  label,
  error,
  hint,
  required,
  className,
  ...rest
}: FieldBaseProps &
  Omit<ComponentProps<typeof Input>, "id" | "name" | "aria-invalid" | "aria-describedby">) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      <Input
        id={id}
        name={name}
        required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy || undefined}
        className={className}
        {...rest}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  id,
  name,
  label,
  error,
  hint,
  required,
  className,
  rows = 6,
  ...rest
}: FieldBaseProps &
  Omit<ComponentProps<typeof Textarea>, "id" | "name" | "aria-invalid" | "aria-describedby">) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required} wide>
      <Textarea
        id={id}
        name={name}
        required={required}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={describedBy || undefined}
        className={className}
        {...rest}
      />
    </FieldShell>
  );
}

export function SelectField({
  id,
  name,
  label,
  error,
  hint,
  required,
  placeholder,
  options,
  className,
  ...rest
}: FieldBaseProps &
  Omit<ComponentProps<"select">, "id" | "name" | "aria-invalid" | "aria-describedby"> & {
    placeholder?: string;
    options: { value: string; label: string }[];
  }) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      <select
        id={id}
        name={name}
        required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy || undefined}
        className={cn(selectClasses, className)}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
