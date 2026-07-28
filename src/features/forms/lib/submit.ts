import { WEB3FORMS_ENDPOINT, web3formsAccessKey } from "./web3forms";

/**
 * Posts directly to Web3Forms from the browser. Takes the FormData built
 * by useWeb3Form so an hCaptcha token can be folded in later — e.g.
 * `data.set("h-captcha-response", token)` right before this is called —
 * without reworking the submission path.
 */
export async function submitToWeb3Forms(data: FormData): Promise<boolean> {
  data.set("access_key", web3formsAccessKey);

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: data,
    });
    const result = (await response.json().catch(() => null)) as {
      success?: boolean;
    } | null;
    return response.ok && result?.success === true;
  } catch {
    return false;
  }
}
