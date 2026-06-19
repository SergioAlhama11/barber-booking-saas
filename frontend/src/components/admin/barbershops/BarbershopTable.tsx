import type { AdminBarbershop } from "@/services/admin/barbershops/types";

type Props = {
  barbershops: AdminBarbershop[];
};

export function BarbershopTable({ barbershops }: Props) {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Slug</th>
        </tr>
      </thead>

      <tbody>
        {barbershops.map((shop) => (
          <tr key={shop.id}>
            <td>{shop.id}</td>
            <td>{shop.name}</td>
            <td>{shop.slug}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
