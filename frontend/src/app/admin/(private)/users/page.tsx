"use client";

import { useState } from "react";

import AdminUsersPageHeader from "@/components/admin/users/AdminUsersPageHeader";
import AdminUsersTable from "@/components/admin/users/AdminUsersTable";
import CreateUserModal from "@/components/admin/users/CreateUserModal";

export default function AdminUsersPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <AdminUsersPageHeader onCreateUser={() => setShowCreateModal(true)} />

      <AdminUsersTable />

      <CreateUserModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}
