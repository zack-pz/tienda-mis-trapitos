# Architecture — Tienda Mis Trapitos

## 1. Objetivo

Definir la arquitectura por módulos para construir el e-commerce sobre el starter actual sin convertir el repo en una ensalada de pantallas, hooks y queries pegadas con cinta.

El principio rector es este: **la aplicación debe gritar negocio de e-commerce, no gritar framework demo**.

---

## 2. Estado actual verificado

El repositorio ya parte de estas bases:

- **TanStack Start**
- **TanStack Router** con file-based routing
- **Better Auth** básico
- **Drizzle + Postgres/Neon**
- estructura modular inicial:

```txt
src/
  app/
  routes/
  features/
  shared/
```

Esto está BIEN. No hay que tirar la base; hay que hacer que la base trabaje para el dominio.

---

## 3. Estilo arquitectónico propuesto

### 3.1 Modular monolith

Para el MVP recomiendo un **monolito modular**.

¿Por qué?

- el dominio tiene varias capacidades acopladas entre sí;
- todavía no hay escala que justifique microservicios;
- pagos, pedidos, inventario y compras necesitan consistencia antes que distribución.

### 3.2 Vertical slicing por negocio

Cada módulo debe agrupar:

- modelo del dominio,
- casos de uso,
- acceso a datos,
- UI del módulo,
- páginas del módulo.

Nada de organizar por “components”, “services”, “hooks” globales como si todo fuera lo mismo. Eso es cocinar TODO junto en una sola olla y después pretender distinguir sabores.

---

## 4. Principios de diseño

### P1. Rutas finas

`src/routes` solo declara rutas, loaders y handlers finos.

### P2. Módulos dueños de su lógica

La lógica de negocio vive en `src/features/<modulo>`.

### P3. Shared mínimo y honesto

`src/shared` solo debe contener:

- UI reutilizable;
- utilidades puras;
- infraestructura transversal;
- configuración;
- acceso base a DB.

### P4. No acoplar features entre sí por UI

Un feature no debería importar componentes de UI de otro feature para resolver negocio.

### P5. Casos de uso explícitos

Operaciones críticas como pagar, crear pedido, recibir mercadería o ajustar stock deben vivir como casos de uso explícitos del servidor.

### P6. Stripe es infraestructura, no dominio

El dominio conoce “pagos” y “transacciones”; Stripe es un adaptador.

### P7. Inventario se mueve por eventos de negocio

El stock cambia porque pasó algo del negocio:

- venta confirmada,
- recepción de compra,
- ajuste manual,
- devolución.

No porque un formulario “pisó” un número y listo.

---

## 5. Mapa de módulos

## 5.1 Módulos core

| Módulo | Responsabilidad principal | Entidades clave |
| --- | --- | --- |
| `auth` | login, sesión, registro base | auth user, session |
| `iam` | roles internos y políticas de acceso | staff users |
| `catalog` | productos, categorías, variantes, imágenes | products, categories, variants |
| `pricing` | precio base e historial de precios | variant prices |
| `offers` | promociones vigentes y prioridad | offers |
| `cart` | carrito del lado cliente y validaciones | cart items |
| `checkout` | captura de datos y preparación del pago | checkout draft |
| `payments` | integración Stripe y webhooks | payment transactions, webhook events |
| `orders` | pedidos de venta, estados y snapshots | sales orders, order items |
| `customers` | perfiles, direcciones e historial | customer profiles, addresses |
| `inventory` | balances, movimientos, ajustes | inventory balances, movements |
| `purchasing` | proveedores, órdenes de compra, recepciones | suppliers, purchase orders |
| `marketing` | home, contenido promocional simple | landing content |

### 5.2 Dependencias recomendadas entre módulos

```txt
marketing ───────────────┐
catalog ──> pricing ──> checkout ──> payments
catalog ──> offers ────> checkout ──> orders ──> inventory
auth ────> customers ──┘
auth ────> iam
catalog ───────────────> inventory
catalog ───────────────> purchasing ────────> inventory
orders ────────────────> customers (historial / consulta)
```

Regla práctica:

- `orders` NO debe depender de componentes de Stripe;
- `payments` NO debe decidir reglas comerciales del catálogo;
- `inventory` NO debe recalcular precios;
- `catalog` NO debe conocer estados de órdenes de compra.

---

## 6. Estructura de carpetas propuesta

```txt
src/
  app/
    providers/
    shell/
    guards/

  routes/
    __root.tsx
    index.tsx
    productos/
      index.tsx
      $slug.tsx
    carrito.tsx
    checkout.tsx
    cuenta/
      index.tsx
      pedidos.tsx
      pedidos.$orderNumber.tsx
    admin/
      index.tsx
      productos.tsx
      categorias.tsx
      precios.tsx
      ofertas.tsx
      inventario.tsx
      clientes.tsx
      pedidos.tsx
      proveedores.tsx
      compras.tsx
      usuarios.tsx
    api/
      auth/
      payments/
        stripe-webhook.ts

  features/
    auth/
      client/
      server/
      ui/
    iam/
      model/
      server/
    marketing/
      pages/
      ui/
    catalog/
      model/
      server/
        repositories/
        queries/
        commands/
      ui/
        storefront/
        admin/
      pages/
    pricing/
      model/
      server/
    offers/
      model/
      server/
    cart/
      model/
      ui/
    checkout/
      model/
      server/
      ui/
      pages/
    payments/
      model/
      server/
        stripe/
    orders/
      model/
      server/
      ui/
      pages/
    customers/
      model/
      server/
      ui/
      pages/
    inventory/
      model/
      server/
      ui/
    purchasing/
      model/
      server/
      ui/

  shared/
    db/
      drizzle/
      neon/
    lib/
    ui/
    config/
    types/
```

---

## 7. Estructura interna por módulo

Cada módulo debería repetir una convención simple:

```txt
features/<modulo>/
  model/      # tipos, enums, reglas puras, validaciones
  server/     # casos de uso, repositorios, queries/commands, adapters
  ui/         # componentes del módulo
  pages/      # page components del módulo
```

### Ejemplo

```txt
features/orders/
  model/
    order-status.ts
    order-types.ts
    order-policies.ts
  server/
    repositories/
      order-repository.ts
    commands/
      create-order-from-stripe-payment.ts
      change-order-status.ts
    queries/
      list-orders.ts
      get-order-detail.ts
  ui/
    order-status-badge.tsx
    admin-order-table.tsx
  pages/
    admin-orders-page.tsx
    customer-order-history-page.tsx
```

---

## 8. Capas y responsabilidades

### 8.1 Routes layer

- define URLs;
- conecta loaders/actions;
- resuelve auth/guards;
- renderiza pages del feature.

### 8.2 Page layer

- compone UI de pantalla;
- llama server functions o loaders;
- no decide reglas de negocio profundas.

### 8.3 Application / use cases

- ejecuta flujos completos;
- coordina varios repositorios;
- aplica reglas de negocio;
- maneja transacciones.

### 8.4 Domain model

- enums;
- políticas;
- validaciones;
- cálculos puros.

### 8.5 Infrastructure

- Drizzle repositories;
- cliente Neon/Postgres;
- adaptadores Stripe;
- Better Auth plumbing.

---

## 9. Diseño por flujo crítico

### 9.1 Compra online

Módulos involucrados:

`catalog -> pricing -> cart -> checkout -> payments -> orders -> inventory -> customers`

Secuencia recomendada:

1. catálogo expone variante seleccionable;
2. pricing calcula precio efectivo;
3. cart guarda selección de sesión;
4. checkout valida datos del comprador;
5. payments crea checkout session en Stripe;
6. webhook confirma pago;
7. orders crea pedido y snapshots;
8. inventory registra salida;
9. customers puede asociar historial si corresponde.

### 9.2 Alta de producto

Módulos involucrados:

`catalog -> pricing -> inventory`

Secuencia:

1. catalog crea producto y variantes;
2. pricing asigna precio base;
3. inventory registra stock inicial mediante entrada.

### 9.3 Recepción de compra

Módulos involucrados:

`purchasing -> inventory`

Secuencia:

1. purchasing crea orden de compra;
2. se registra recepción total o parcial;
3. inventory genera movimientos de entrada;
4. purchasing actualiza estado de la orden.

---

## 10. Autorización y políticas

### 10.1 Roles fijos

Roles propuestos:

- `super_admin`
- `admin_comercial`
- `operador_inventario`
- `compras`
- `atencion_ventas`

### 10.2 Política de acceso

La autorización debe resolverse con helpers server-side, por ejemplo:

- `requireAuthenticatedUser()`
- `requireStaffUser()`
- `requireRole('compras')`
- `requireAnyRole([...])`

La UI puede ocultar acciones, pero la seguridad REAL se valida en servidor. Si confiás solo en el frontend, estás dejando la puerta abierta y felicitándote porque pusiste cartel de “prohibido pasar”. Dale.

---

## 11. Integraciones externas

### Stripe

Ubicación recomendada:

```txt
features/payments/server/stripe/
```

Responsabilidades:

- crear checkout session;
- validar webhook signature;
- persistir eventos;
- traducir eventos del proveedor a estados internos.

Regla:

- el resto del sistema nunca debería depender de payloads crudos de Stripe más allá del módulo `payments`.

---

## 12. Estrategia de datos

### 12.1 Escritura

- casos de uso server-side;
- transacciones DB para flujos críticos;
- idempotencia en pagos y actualización de stock.

### 12.2 Lectura

- queries específicas por pantalla;
- joins controlados;
- proyecciones optimizadas para admin y storefront.

### 12.3 Auditoría

- inventario, pagos, precios y estados de pedido deben dejar traza.

---

## 13. Convenciones de implementación

- nombres de archivos en kebab-case;
- entidades y policies cerca del módulo dueño;
- repositorios por módulo, no un “repository” global monstruoso;
- no meter lógica de negocio en `src/routes`;
- no meter llamadas directas a Stripe desde componentes React;
- no reutilizar tablas demo para dominio real.

---

## 14. Qué NO hacer

- No mezclar catálogo, pedidos y pagos en un mismo feature genérico llamado `shop`.
- No guardar stock directo en `products`.
- No recalcular historial de pedidos mirando precios actuales.
- No usar floats para dinero.
- No dejar que un webhook impacte dominio sin registrar el evento recibido.

---

## 15. Roadmap técnico recomendado

1. `auth` + `iam`
2. `catalog`
3. `pricing` + `offers`
4. `cart` + `checkout`
5. `payments`
6. `orders`
7. `inventory`
8. `customers`
9. `purchasing`

Sí, podría cambiar un poco según el equipo. Pero conceptualmente este orden te evita rehacer media aplicación a mitad de camino.
