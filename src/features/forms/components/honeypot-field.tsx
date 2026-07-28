/**
 * Spam trap: off-screen (not display:none — some bots skip fields hidden
 * that way) and out of the tab order, with the wrapper hidden from
 * assistive tech so a screen reader user never lands on it either.
 */
export function HoneypotField() {
  return (
    <div aria-hidden="true" className="absolute h-px w-px overflow-hidden opacity-0" style={{ left: "-9999px" }}>
      <label htmlFor="botcheck">Leave this field blank</label>
      <input type="text" id="botcheck" name="botcheck" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
