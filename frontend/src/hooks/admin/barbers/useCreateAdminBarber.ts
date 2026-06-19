"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createAdminBarber } from "@/services/admin/barbers/api";

export function useCreateAdminBarber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminBarber,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-barbers"],
      });
    },
  });
}
