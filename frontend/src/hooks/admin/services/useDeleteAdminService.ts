"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteAdminService } from "@/services/admin/services/api";

export function useDeleteAdminService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminService,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-services"],
      });
    },
  });
}
