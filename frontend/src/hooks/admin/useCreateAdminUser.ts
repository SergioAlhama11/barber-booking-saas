import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createAdminUser } from "@/services/admin/users/api";

export function useCreateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminUser,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-users"],
      });
    },
  });
}
