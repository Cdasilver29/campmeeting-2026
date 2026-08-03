import { eventInfo } from "@/data";

/**
 * The pre-paint event-phase correction, as a string for
 * dangerouslySetInnerHTML.
 *
 * Every page here is statically generated, so the served HTML can only
 * carry the phase the build was made in. That is wrong for the entire week
 * the site exists for: a deploy made on the 10th says "before" to every
 * visitor between the 15th and the 22nd. Correcting it on mount is too
 * late — mount is after first paint, so anything that depends on the phase
 * moves, which is a layout shift.
 *
 * So the phase is resolved twice and never on mount: at build time as the
 * rendered attribute value, then corrected during parse by this script,
 * which re-reads the Africa/Nairobi date and rewrites the attribute before
 * anything is painted. Descendants read it through group-data variants, so
 * there is exactly one attribute to set and nothing can be left holding a
 * stale value.
 *
 * This was the home hero's technique first (it is why the hero can size
 * itself by phase without a 40%-of-viewport shift) and it now has two
 * callers, so it lives here rather than under features/home. The same
 * approach next-themes already uses in this app to avoid a flash of the
 * wrong theme.
 *
 * Everything interpolated is a build-time constant from event.ts passed
 * through JSON.stringify, so no user input goes anywhere near it.
 *
 * Wrapped in try/catch on purpose: if Intl or the time zone is somehow
 * unavailable the attribute simply keeps its server value, which is a
 * stale phase rather than a broken page.
 */
export function eventPhaseScript(elementId: string, attribute: string): string {
  return `(function(){try{
var d=new Intl.DateTimeFormat("en-CA",{timeZone:${JSON.stringify(eventInfo.timezone)},year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
var p=d<${JSON.stringify(eventInfo.startDate)}?"before":d>${JSON.stringify(eventInfo.endDate)}?"after":"during";
var e=document.getElementById(${JSON.stringify(elementId)});
if(e)e.setAttribute(${JSON.stringify(attribute)},p);
}catch(_){}})();`;
}
