---
title: "Parte 3: Prototipado y Código Propuesto para Pruebas"
description: Prototipo de UI/UX y código propuesto para pruebas modulares (unit testing y mocks) del sistema de tutorías.
---

## 1. Prototipo de Interfaz de Usuario (UI/UX)

### Mockup / Wireframe de las Pantallas Clave

Prototipo interactivo en Figma: [Lumina — Figma](https://www.figma.com/design/powgiB6VMj4Tdz9LB7aNNz/Lumina?node-id=0-1&t=eJRLtLAAHvV8Lis6-1)

:::note
Las capturas de abajo se ven reducidas y con poco detalle en pantallas con muchos elementos. Para verlas en buena calidad, entra directamente al [enlace de Figma](https://www.figma.com/design/powgiB6VMj4Tdz9LB7aNNz/Lumina?node-id=0-1&t=eJRLtLAAHvV8Lis6-1).
:::

![Vista general del archivo de Figma](/figma-overview.png)

![Landing page](/lumina-landing.png)

![Pantalla de autenticación](/lumina-auth.png)

![Dashboard del estudiante](/lumina-dashboard-estudiante.png)

![Dashboard del tutor](/lumina-dashboard-tutor.png)

## 2. Código Propuesto para Pruebas Modulares (Unit Testing & Mocks)

### ¿Cómo funciona Vitest?

El proyecto usa [Vitest](https://vitest.dev) como framework de pruebas unitarias (`vitest` en `devDependencies`, script `"test": "vitest run"` en `package.json`). Ideas clave:

- Detecta y ejecuta cualquier archivo `*.test.ts` / `*.test.mjs` del repo; usa Vite por debajo para transformar TypeScript/ESM al vuelo, sin un paso de build previo.
- `describe(...)` agrupa un conjunto de casos relacionados (una función, un módulo); cada caso individual es un `it(...)`; `expect(actual).toBe(esperado)` (u otro *matcher*) compara el resultado real contra el esperado y falla el test si no coincide.
- `vi.fn()` crea una función simulada (*mock*) que registra sus llamadas; `vi.mock("@/lib/db", factory)` sustituye un módulo completo —aquí, la conexión a Postgres— por una versión falsa, para poder probar la lógica sin una base de datos real.
- La configuración vive en `vitest.config.mts` (raíz de `app/`), donde se resuelve el alias `@` → raíz del proyecto (igual que en `tsconfig.json`), para que los tests puedan importar con `@/lib/...` como el resto de la app.
- Se corre con `pnpm test`.

### Módulos a Probar

#### Módulo 1 — `getDashboardPath` (`lib/dashboard-path.ts`)

Función pura: dado el rol de un usuario ya autenticado, decide a qué ruta se le redirige tras login/registro. Es el único lugar que define "a dónde va cada rol", así que cambiarla ahí basta para redirigir todos los flujos de entrada.

```ts
export function getDashboardPath(role: UserRole): string {
  if (role === "admin") return "/admin/verificacion";
  return role === "estudiante" ? "/tutores" : "/mi-perfil";
}
```

#### Módulo 2 — `crearReserva` (`lib/reservas.ts`)

Implementa [CU02 — Reservar una franja](/parte-2-arquitectura#cu02--reservar-una-franja): confirma la reserva dentro de una transacción con lock de fila (`for update`). Si dos estudiantes confirman la misma franja casi al mismo tiempo, el segundo ve la franja ya no disponible y recibe `FranjaNoDisponibleError` (409) en vez de pisar la reserva del primero.

```ts
export async function crearReserva(
  franjaId: string,
  estudianteId: string,
): Promise<string> {
  const client = await pool.connect();
  try {
    await client.query("begin");

    const { rows: libres } = await client.query(
      `select id from public.franja_horaria
       where id = $1 and estado = 'libre' and inicio > now()
       for update`,
      [franjaId],
    );
    if (libres.length === 0) {
      throw new FranjaNoDisponibleError();
    }

    const { rows: reservas } = await client.query<{ id: string }>(
      `insert into public.reserva (franja_id, estudiante_id)
       values ($1, $2)
       returning id`,
      [franjaId, estudianteId],
    );

    await client.query(
      `update public.franja_horaria set estado = 'ocupada' where id = $1`,
      [franjaId],
    );

    await client.query("commit");
    return reservas[0].id;
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}
```

### Suite de Pruebas Unitarias

#### Pruebas — Módulo 1 (`lib/dashboard-path.test.ts`)

No necesita mocks al ser una función pura sin dependencias externas: se prueban los tres roles posibles.

```ts
import { describe, it, expect } from "vitest";
import { getDashboardPath } from "@/lib/dashboard-path";

describe("getDashboardPath", () => {
  it("manda al estudiante a /tutores", () => {
    expect(getDashboardPath("estudiante")).toBe("/tutores");
  });
  it("manda al tutor a /mi-perfil", () => {
    expect(getDashboardPath("tutor")).toBe("/mi-perfil");
  });
  it("manda al admin a /admin/verificacion", () => {
    expect(getDashboardPath("admin")).toBe("/admin/verificacion");
  });
});
```

#### Pruebas — Módulo 2 (`lib/reservas.test.ts`)

`crearReserva` sí toca la base de datos, así que el test mockea `@/lib/db` por completo: `pool.connect()` devuelve un `mockClient` falso cuyas respuestas a `query(...)` se encadenan con `mockResolvedValueOnce`, simulando —paso a paso de la transacción— lo que devolvería Postgres.

```ts
import { describe, expect, it, vi, beforeEach } from "vitest";

const mockClient = { query: vi.fn(), release: vi.fn() };

vi.mock("@/lib/db", () => ({
  pool: { connect: vi.fn(() => mockClient) },
}));

const { crearReserva, FranjaNoDisponibleError } =
  await import("@/lib/reservas");

describe("crearReserva", () => {
  beforeEach(() => {
    mockClient.query.mockReset();
    mockClient.release.mockReset();
  });

  it("crea una reserva y marca la franja ocupada cuando esta libre", async () => {
    mockClient.query
      .mockResolvedValueOnce(undefined) // begin
      .mockResolvedValueOnce({ rows: [{ id: "franja-1" }] }) // select ... for update
      .mockResolvedValueOnce({ rows: [{ id: "reserva-1" }] }) // insert reserva
      .mockResolvedValueOnce(undefined) // update franja
      .mockResolvedValueOnce(undefined); // commit

    const id = await crearReserva("franja-1", "estudiante-1");

    expect(id).toBe("reserva-1");
    expect(mockClient.query).toHaveBeenCalledWith("commit");
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });

  it("lanza FranjaNoDisponibleError y hace rollback si la franja ya no esta libre", async () => {
    mockClient.query
      .mockResolvedValueOnce(undefined) // begin
      .mockResolvedValueOnce({ rows: [] }); // select ... for update -> ya ocupada

    await expect(crearReserva("franja-1", "estudiante-1")).rejects.toThrow(
      FranjaNoDisponibleError,
    );
    expect(mockClient.query).toHaveBeenCalledWith("rollback");
    expect(mockClient.query).not.toHaveBeenCalledWith("commit");
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });
});
```

### Resultado de la ejecución

```
$ pnpm test

 RUN  v5.0.2 C:/Users/.../TutoriasWeb/app

 ✓ lib/dashboard-path.test.ts > getDashboardPath > manda al estudiante a /tutores
 ✓ lib/dashboard-path.test.ts > getDashboardPath > manda al tutor a /mi-perfil
 ✓ lib/dashboard-path.test.ts > getDashboardPath > manda al admin a /admin/verificacion
 ✓ lib/reservas.test.ts > crearReserva > crea una reserva y marca la franja ocupada cuando esta libre
 ✓ lib/reservas.test.ts > crearReserva > lanza FranjaNoDisponibleError y hace rollback si la franja ya no esta libre

 Test Files  2 passed (2)
      Tests  5 passed (5)
```

![Captura de la ejecución de los tests: dashboard-path.test.ts y reservas.test.ts, todos en verde](/captura-tests.png)
