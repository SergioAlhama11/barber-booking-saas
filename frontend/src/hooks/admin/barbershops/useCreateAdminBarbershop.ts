"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAdminBarbershop } from "@/services/admin/barbershops/api";

export function useCreateAdminBarbershop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminBarbershop,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-barbershops"],
      });
    },
  });
}
