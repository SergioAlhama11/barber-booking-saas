import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createAdminAppointment } from "@/services/admin/appointments/api";

import type {
  AdminAppointment,
  AdminCreateAppointmentRequest,
} from "@/services/admin/appointments/types";

export function useAdminCreateAppointment() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    AdminAppointment,
    Error,
    AdminCreateAppointmentRequest
  >({
    mutationFn: createAdminAppointment,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-appointments"],
      });
    },
  });

  return {
    create: mutation.mutateAsync,
    loading: mutation.isPending,
  };
}
