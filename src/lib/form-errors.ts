export function submitErrorMessage(status: number): string {
  if (status === 429) return "Too many attempts. Please wait a minute and try again.";
  if (status === 403) return "The security check didn't pass. Please refresh the page and try again.";
  if (status === 400) return "Please check that your name and a valid email address are filled in.";
  if (status === 413) return "That message is too long. Please shorten it and try again.";
  return "We couldn't send that just now. Please try again, or email hello@ecostorage.sg.";
}

export const NETWORK_ERROR_MESSAGE = "We couldn't reach the server. Please check your connection and try again.";
