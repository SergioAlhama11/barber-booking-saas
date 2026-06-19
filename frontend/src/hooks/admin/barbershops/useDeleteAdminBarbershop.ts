"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAdminBarbershop } from "@/services/admin/barbershops/api";

export function useDeleteAdminBarbershop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminBarbershop,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-barbershops"],
      });
    },
  });
}
