// =========================
// DATE SERVICE (PRO)
// =========================

// =========================
// LOCAL HELPERS (CLAVE)
// =========================

// 👉 HOY en formato local YYYY-MM-DD
export function getTodayLocal(): string {
  const d = new Date();

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// 👉 Date → YYYY-MM-DD (LOCAL)
export function formatLocalDate(date: Date): string {
  assertValidDate(date);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// =========================
// BUILD (frontend → backend)
// =========================

// 👉 Date → ISO UTC
export function toUTCISOString(date: Date): string {
  assertValidDate(date);
  return date.toISOString();
}

// 👉 Construye Date LOCAL
export function buildLocalDateTime(date: string, time: string): Date {
  validateDate(date);

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute, second] = normalizeTime(time).split(":").map(Number);

  const d = new Date(year, month - 1, day, hour, minute, second);

  assertValidDate(d);

  return d;
}

// 👉 Construye ISO UTC
export function buildUTCDateTime(date: string, time: string): string {
  return buildLocalDateTime(date, time).toISOString();
}

// =========================
// PARSE
// =========================

export function parseISO(dateString?: string): Date | null {
  if (!dateString) return null;

  const d = new Date(dateString);
  if (isNaN(d.getTime())) return null;

  return d;
}

// =========================
// FORMAT (UI)
// =========================

export function formatDate(dateString?: string): string {
  const d = parseISO(dateString);
  return d ? d.toLocaleDateString() : "-";
}

export function formatTime(dateString?: string): string {
  const d = parseISO(dateString);
  if (!d) return "-";

  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function formatDateTime(dateString?: string): string {
  const d = parseISO(dateString);
  return d ? d.toLocaleString() : "-";
}

export function formatTimeFromDate(date: Date): string {
  assertValidDate(date);

  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function formatSmartDate(date: string) {
  const d = new Date(date);
  const today = new Date();

  const dCopy = new Date(d);
  const todayCopy = new Date(today);

  dCopy.setHours(0, 0, 0, 0);
  todayCopy.setHours(0, 0, 0, 0);

  const diff = (dCopy.getTime() - todayCopy.getTime()) / (1000 * 60 * 60 * 24);

  if (diff === 1) return "mañana";
  if (diff === 0) return "hoy";

  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

export function formatTimeSlot(time: string): string {
  const [h, m] = time.split(":");

  return `${Number(h)}:${m}`;
}

// =========================
// VALIDATION
// =========================

function validateDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid date format: ${date}`);
  }
}

function normalizeTime(time: string): string {
  if (/^\d{2}:\d{2}$/.test(time)) return `${time}:00`;
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) return time;

  throw new Error(`Invalid time format: ${time}`);
}

function assertValidDate(date: Date) {
  if (isNaN(date.getTime())) {
    throw new Error("Invalid Date");
  }
}
