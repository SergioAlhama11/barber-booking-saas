"use client";

import { AdminModal } from "@/components/admin/common/AdminModal";

import { useState } from "react";

import { formatDateTime } from "@/services/dateService";

import {
  previewAppointmentImport,
  confirmAppointmentImport,
} from "@/services/admin/imports/api";

import type {
  ImportedAppointment,
  AppointmentImportPreviewResponse,
} from "@/services/admin/imports/types";

import type { AdminBarber } from "@/services/admin/barbers/types";
import type { AdminService } from "@/services/admin/services/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onImported?: () => Promise<void>;

  barbershopId: number;

  barbers: AdminBarber[];
  services: AdminService[];
};

export function ImportAppointmentModal({
  open,
  onClose,
  onImported,
  barbershopId,
  barbers,
  services,
}: Props) {
  const updateAppointment = (
    index: number,
    changes: Partial<ImportedAppointment>,
  ) => {
    const copy = [...appointments];

    const updated = {
      ...copy[index],
      ...changes,
    };

    copy[index] = validateAppointment(updated);

    setAppointments(copy);
  };

  const [barberId, setBarberId] = useState<number>();
  const [serviceId, setServiceId] = useState<number>();

  const [dragging, setDragging] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);

  const [file, setFile] = useState<File | null>(null);

  const [appointments, setAppointments] = useState<ImportedAppointment[]>([]);

  const [importResult, setImportResult] = useState<{
    imported: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [preview, setPreview] =
    useState<AppointmentImportPreviewResponse | null>(null);

  const resetState = () => {
    setFile(null);

    setAppointments([]);
    setPreview(null);

    setBarberId(undefined);
    setServiceId(undefined);

    setImportResult(null);
    setErrorMessage(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelected = (selectedFile: File | null) => {
    setFile(selectedFile);

    setPreview(null);
    setAppointments([]);
  };

  const validateAppointment = (
    appointment: ImportedAppointment,
  ): ImportedAppointment => {
    const warnings: string[] = [];

    if (!appointment.customerName?.trim()) {
      warnings.push("Falta el nombre");
    }

    if (!appointment.startTime) {
      warnings.push("No se ha detectado la fecha");
    }

    if (
      appointment.customerEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(appointment.customerEmail)
    ) {
      warnings.push("Email inválido");
    }

    return {
      ...appointment,
      valid: warnings.length === 0,
      warning: warnings.length > 0 ? warnings.join(". ") : undefined,
    };
  };

  if (!open) {
    return null;
  }

  const handlePreview = async () => {
    if (!file) {
      return;
    }

    try {
      setLoadingPreview(true);

      const result = await previewAppointmentImport(barbershopId, file);

      setPreview(result);
      setAppointments(result.appointments.map(validateAppointment));
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleImport = async () => {
    if (!barberId || !serviceId) {
      return;
    }

    try {
      setLoadingImport(true);

      setErrorMessage(null);
      setImportResult(null);

      const validAppointments = appointments.filter(
        (appointment) => appointment.valid,
      );

      const response = await confirmAppointmentImport({
        barbershopId,
        barberId,
        serviceId,
        appointments: validAppointments,
      });

      if (response.error || !response.data) {
        throw new Error(response.message ?? "Error importando citas");
      }

      await onImported?.();

      setImportResult(response.data);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se han podido importar las citas",
      );
    } finally {
      setLoadingImport(false);
    }
  };

  const validCount = appointments.filter(
    (appointment) => appointment.valid,
  ).length;

  const invalidCount = appointments.length - validCount;

  return (
    <AdminModal
      open={open}
      title="Importar citas"
      onClose={handleClose}
      maxWidth="5xl"
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <select
            value={barberId ?? ""}
            onChange={(e) => setBarberId(Number(e.target.value))}
            className="
      rounded-xl
      border
      border-white/10
      bg-slate-800
      p-3
      text-white
    "
          >
            <option value="">Selecciona un barbero</option>

            {barbers.map((barber) => (
              <option key={barber.id} value={barber.id}>
                {barber.name}
              </option>
            ))}
          </select>

          <select
            value={serviceId ?? ""}
            onChange={(e) => setServiceId(Number(e.target.value))}
            className="
      rounded-xl
      border
      border-white/10
      bg-slate-800
      p-3
      text-white
    "
          >
            <option value="">Selecciona un servicio</option>

            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => {
            setDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();

            setDragging(false);

            const droppedFile = e.dataTransfer.files?.[0];

            if (droppedFile) {
              handleFileSelected(droppedFile);
            }
          }}
          className={`
            flex
            cursor-pointer
            flex-col
            items-center
            justify-center
            rounded-2xl
            border
            border-dashed
            px-6
            py-10
            text-center
            transition
            ${dragging ? "border-cyan-400 bg-cyan-500/10" : "border-cyan-500/20 bg-white/[0.02]"}
            hover:bg-white/[0.04]
          `}
        >
          <input
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => {
              handleFileSelected(e.target.files?.[0] ?? null);
            }}
          />

          <div className="text-4xl">📄</div>

          <p className="mt-3 text-white font-medium">
            Arrastra una imagen o PDF
          </p>

          <p className="mt-1 text-sm text-slate-400">
            o haz clic para seleccionar
          </p>

          {file && (
            <div className="mt-4 rounded-xl bg-cyan-500/10 px-3 py-2 text-cyan-300">
              {file.name}
            </div>
          )}
        </label>

        <button
          disabled={!file || !barberId || !serviceId || loadingPreview}
          onClick={handlePreview}
          className="
            rounded-xl
            bg-cyan-300
            px-4
            py-2
            font-semibold
            text-slate-950
            disabled:opacity-50
          "
        >
          {loadingPreview ? "Analizando..." : "Analizar archivo"}
        </button>

        {appointments.length > 0 && (
          <div className="space-y-4">
            {preview && (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-4">
                  <p className="text-xs text-slate-400">Detectadas</p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    {preview.total}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <p className="text-xs text-emerald-300">
                    Listas para importar
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-emerald-200">
                    {validCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <p className="text-xs text-amber-300">Requieren revisión</p>

                  <p className="mt-1 text-2xl font-semibold text-amber-200">
                    {invalidCount}
                  </p>
                </div>
              </div>
            )}

            {appointments.map((appointment, index) => (
              <div
                key={index}
                className={`rounded-2xl border p-4 ${
                  appointment.valid
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-amber-500/20 bg-amber-500/5"
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className={`text-sm font-medium ${
                      appointment.valid ? "text-emerald-300" : "text-amber-300"
                    }`}
                  >
                    {appointment.valid
                      ? "✓ Lista para importar"
                      : "⚠ Revisión requerida"}
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={appointment.customerName}
                    onChange={(e) =>
                      updateAppointment(index, {
                        customerName: e.target.value,
                      })
                    }
                    placeholder="Cliente"
                    className="
      rounded-xl
      border
      border-white/10
      bg-slate-800
      p-2
      text-white
    "
                  />

                  <input
                    value={appointment.customerEmail ?? ""}
                    onChange={(e) =>
                      updateAppointment(index, {
                        customerEmail: e.target.value,
                      })
                    }
                    placeholder="Email"
                    className="
                      rounded-xl
                      border
                      border-white/10
                      bg-slate-800
                      p-2
                      text-white
                    "
                  />

                  <input
                    value={formatDateTime(appointment.startTime)}
                    readOnly
                    className="
                      md:col-span-2
                      rounded-xl
                      border
                      border-white/10
                      bg-slate-800
                      p-2
                      text-white
                      opacity-70
                    "
                  />
                </div>

                {appointment.warning && (
                  <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200">
                    {appointment.warning}
                  </div>
                )}
              </div>
            ))}

            <div className="space-y-3">
              {errorMessage && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                  {errorMessage}
                </div>
              )}

              <button
                disabled={validCount === 0 || loadingImport}
                onClick={handleImport}
                className="rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50"
              >
                {loadingImport ? "Importando..." : `Importar (${validCount})`}
              </button>

              {importResult && (
                <div className="rounded-2xl border border-white/10 bg-slate-800 p-4">
                  <p className="font-semibold text-emerald-300">
                    ✓ {importResult.imported} citas importadas
                  </p>

                  {importResult.failed > 0 && (
                    <p className="mt-2 text-amber-300">
                      ⚠ {importResult.failed} citas fallidas
                    </p>
                  )}

                  {importResult.errors.length > 0 && (
                    <ul className="mt-3 space-y-1 text-sm text-slate-300">
                      {importResult.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminModal>
  );
}
