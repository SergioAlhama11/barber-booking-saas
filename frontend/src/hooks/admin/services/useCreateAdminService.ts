"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createAdminService } from "@/services/admin/services/api";

export function useCreateAdminService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminService,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-services"],
      });
    },
  });
}
