import { Button } from "@/components/ui/button";
import type { FormStatus } from "../lib/use-web3-form";

export function SubmitButton({
  status,
  idleLabel,
  submittingLabel,
}: {
  status: FormStatus;
  idleLabel: string;
  submittingLabel: string;
}) {
  const submitting = status === "submitting";

  return (
    <Button type="submit" size="lg" disabled={submitting} aria-busy={submitting} className="w-fit">
      {submitting ? submittingLabel : idleLabel}
    </Button>
  );
}
