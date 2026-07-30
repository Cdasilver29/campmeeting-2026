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
    // min-h-11 below sm for the same reason the Input is taller there:
    // 36px is under the tap-target floor, and this is the one control on
    // the page that has to be hit.
    <Button
      type="submit"
      size="lg"
      disabled={submitting}
      aria-busy={submitting}
      className="min-h-11 w-fit px-4 sm:min-h-0 sm:px-2.5"
    >
      {submitting ? submittingLabel : idleLabel}
    </Button>
  );
}
