"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateAdminBarber } from "@/services/admin/barbers/api";

import type { UpdateAdminBarberRequest } from "@/services/admin/barbers/types";

export function useUpdateAdminBarber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: UpdateAdminBarberRequest;
    }) => updateAdminBarber(id, request),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-barbers"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-barber", variables.id],
      });
    },
  });
}
