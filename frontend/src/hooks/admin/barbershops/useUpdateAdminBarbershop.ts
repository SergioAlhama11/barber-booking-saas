"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAdminBarbershop } from "@/services/admin/barbershops/api";
import type { UpdateAdminBarbershopRequest } from "@/services/admin/barbershops/types";

export function useUpdateAdminBarbershop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: UpdateAdminBarbershopRequest;
    }) => updateAdminBarbershop(id, request),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-barbershops"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-barbershop", variables.id],
      });
    },
  });
}
