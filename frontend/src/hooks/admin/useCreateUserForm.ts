import { useState } from "react";

export type AdminRole = "SUPER_ADMIN" | "OWNER" | "BARBER";

export interface CreateUserForm {
  email: string;
  password: string;
  role: AdminRole;
  barbershopId: number | "";
  barberId: number | "";
}

export type CreateUserFormErrors = Partial<
  Record<keyof CreateUserForm, string>
>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM: CreateUserForm = {
  email: "",
  password: "",
  role: "SUPER_ADMIN",
  barbershopId: "",
  barberId: "",
};

export function useCreateUserForm() {
  const [form, setForm] = useState<CreateUserForm>(INITIAL_FORM);

  const [errors, setErrors] = useState<CreateUserFormErrors>({});

  function reset() {
    setForm(INITIAL_FORM);
    setErrors({});
  }

  function validate(): boolean {
    const validationErrors: CreateUserFormErrors = {};

    if (!form.email.trim()) {
      validationErrors.email = "El email es obligatorio";
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      validationErrors.email = "Introduce un email válido";
    }

    if (!form.password.trim()) {
      validationErrors.password = "La contraseña es obligatoria";
    } else if (form.password.length < 8) {
      validationErrors.password =
        "La contraseña debe tener al menos 8 caracteres";
    }

    if (form.role === "OWNER" && !form.barbershopId) {
      validationErrors.barbershopId = "Selecciona una barbería";
    }

    if (form.role === "BARBER") {
      if (!form.barbershopId) {
        validationErrors.barbershopId = "Selecciona una barbería";
      }

      if (!form.barberId) {
        validationErrors.barberId = "Selecciona un barbero";
      }
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  }

  function clearError(field: keyof CreateUserForm) {
    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function updateField<K extends keyof CreateUserForm>(
    field: K,
    value: CreateUserForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    clearError(field);
  }

  return {
    form,
    errors,
    reset,
    validate,
    updateField,
    setForm,
  };
}
