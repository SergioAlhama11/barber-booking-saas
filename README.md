# barber-booking-saas

## Configuracion de entorno

El proyecto ya no debe guardar secretos reales ni URLs temporales en el repo.

- `backend/.env.example`: variables necesarias para Quarkus
- `frontend/.env.example`: variables publicas del frontend
- `docker/.env.example`: variables para levantar servicios locales con Docker Compose

Flujo recomendado:

1. Copia cada archivo ejemplo a su version real local.
2. Rellena los valores reales solo en tus archivos `.env`.
3. En staging o produccion, configura esas variables en el proveedor de despliegue y no en Git.

Notas:

- Rota cualquier secreto que haya estado previamente en texto plano.
- No uses URLs de `ngrok` ni claves reales como defaults en `application.properties`.
- `NEXT_PUBLIC_*` solo debe contener valores publicos; nunca secretos.
