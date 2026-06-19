import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateAdminAppointment } from "@/services/admin/appointments/api";

import type {
  AdminAppointment,
  AdminUpdateAppointmentRequest,
} from "@/services/admin/appointments/types";

type UpdateAppointmentVariables = {
  appointmentId: number;
  request: AdminUpdateAppointmentRequest;
};

export function useAdminUpdateAppointment() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    AdminAppointment,
    Error,
    UpdateAppointmentVariables
  >({
    mutationFn: ({ appointmentId, request }) =>
      updateAdminAppointment(appointmentId, request),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-appointments"],
      });
    },
  });

  return {
    update: (appointmentId: number, request: AdminUpdateAppointmentRequest) =>
      mutation.mutateAsync({
        appointmentId,
        request,
      }),

    loading: mutation.isPending,
  };
}
