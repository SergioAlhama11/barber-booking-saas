import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getAdminUsers } from "@/services/admin/users/api";

export function useAdminUsers() {
  const [search, setSearch] = useState("");

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAdminUsers,
  });

  const users = useMemo(() => {
    const term = search.toLowerCase();

    return (usersQuery.data ?? []).filter((user) =>
      user.email.toLowerCase().includes(term),
    );
  }, [usersQuery.data, search]);

  return {
    search,
    setSearch,
    users,
    isLoading: usersQuery.isLoading,
  };
}
