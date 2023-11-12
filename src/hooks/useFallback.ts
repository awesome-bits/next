import { useUserMode } from "@/hooks";
import { userModes } from "@/constants";

export function useFallback() {
  const mode = useUserMode();

  const redirection = {
    [userModes.GUEST]: "/auth/login",
    [userModes.SEMI_AUTHENTICATED]: "/auth/email/confirm",
    [userModes.FIRST_AUTHENTICATED]: "/auth/profile",
    [userModes.AUTHENTICATED]: "/app/getting-started",
    [userModes.SUBSCRIBED]: "/subscription/pricing",
  };

  return redirection[mode];
}