"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateAdminService } from "@/services/admin/services/api";

import type { UpdateAdminServiceRequest } from "@/services/admin/services/types";

export function useUpdateAdminService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: UpdateAdminServiceRequest;
    }) => updateAdminService(id, request),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-services"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-service", variables.id],
      });
    },
  });
}
