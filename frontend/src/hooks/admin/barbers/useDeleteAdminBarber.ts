"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteAdminBarber } from "@/services/admin/barbers/api";

export function useDeleteAdminBarber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminBarber,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-barbers"],
      });
    },
  });
}
