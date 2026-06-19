import { useAuthContext } from "@/components/AuthProvider";

export function useSession() {
  return useAuthContext();
}
