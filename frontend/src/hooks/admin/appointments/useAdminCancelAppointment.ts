import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cancelAdminAppointment } from "@/services/admin/appointments/api";

export function useAdminCancelAppointment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: number) => cancelAdminAppointment(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-appointments"],
      });
    },
  });

  return {
    cancel: mutation.mutateAsync,
    loading: mutation.isPending,
  };
}
