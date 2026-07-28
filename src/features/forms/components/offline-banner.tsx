/**
 * Says plainly that this form needs a connection.
 *
 * Two moments, one message. Before a send is attempted it is a quiet
 * heads-up, so nobody types a long prayer request and only then finds
 * out. After one is attempted with no signal it is the result, announced
 * assertively because the person just acted and needs to know it did not
 * go. Neither case touches the form: the fields are uncontrolled DOM
 * inputs and are only ever cleared on a successful send, so everything
 * typed is still on the page in both.
 */
export function OfflineBanner({
  attempted,
  noun,
  fallbackEmail,
}: {
  /** True once submit has been pressed without a connection. */
  attempted: boolean;
  /** What is being sent, e.g. "message" or "prayer request". */
  noun: string;
  fallbackEmail: string;
}) {
  return (
    <div
      role={attempted ? "alert" : "status"}
      className="rounded-card bg-surface-muted p-4 text-sm text-ink ring-1 ring-line"
    >
      {attempted ? (
        <>
          Your {noun} was not sent. There was no connection when you pressed
          send, and nothing is waiting to go out later, so it will not send
          itself once signal returns.
        </>
      ) : (
        <>
          This device has no connection right now, so a {noun} cannot be sent
          yet.
        </>
      )}{" "}
      Everything you have typed is still here. Press send again once you have
      signal, or email{" "}
      <a href={`mailto:${fallbackEmail}`} className="underline underline-offset-4">
        {fallbackEmail}
      </a>
      .
    </div>
  );
}
