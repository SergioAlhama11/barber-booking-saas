"use client";

export default function SlotSelector({
  slots,
  selectedSlot,
  onSelect,
}: {
  slots: string[];
  selectedSlot: string | null;
  onSelect: (slot: string) => void;
}) {
  if (slots.length === 0) return null;

  return (
    <>
      <h2 className="text-xl font-semibold mt-6 mb-2">Horarios disponibles:</h2>

      <div className="grid grid-cols-3 gap-2">
        {slots.map((slot) => (
          <button
            key={slot}
            onClick={() => onSelect(slot)}
            className={`border p-2 rounded ${
              selectedSlot === slot
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {slot.slice(0, 5)}
          </button>
        ))}
      </div>
    </>
  );
}
