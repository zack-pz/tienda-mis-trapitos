# Technical Tickets — Tienda Mis Trapitos

## 1. Objetivo

Traducir el backlog MVP a tickets técnicos implementables, agrupados por iteración y pensados para un equipo full-stack trabajando sobre TanStack Start + Drizzle + Better Auth + Stripe.

---

## 2. Convenciones

- **Tipo**: feature | infra | hardening | docs
- **Prioridad**: P0 | P1
- **Estimación relativa**: S | M | L
- **Dependencias**: tickets previos o IDs del `MVP-BACKLOG.md`

---

## 3. Iteración 0 — Fundaciones

### TKT-001 — Cerrar reglas operativas del checkout
- **Tipo**: docs
- **Prioridad**: P0
- **Estimación**: M
- **Backlog**: MVP-001
- **Objetivo**: cerrar envíos, impuestos, devoluciones y estados del pedido.
- **Entregables**:
  - documento aprobado con reglas de envío;
  - definición de impuestos/precio final;
  - política de devolución/reembolso;
  - matriz de estados del pedido.
- **DoD**:
  - reglas listas para implementar sin ambigüedad;
  - checkout y pedidos tienen estados definitivos.

### TKT-002 — Persistir Better Auth con Drizzle
- **Tipo**: infra
- **Prioridad**: P0
- **Estimación**: M
- **Backlog**: MVP-002
- **Dependencias**: TKT-001
- **Objetivo**: conectar Better Auth a Postgres mediante Drizzle adapter.
- **Entregables**:
  - dependencia del adapter instalada;
  - `auth.ts` usando base de datos real;
  - tablas core de auth operativas;
  - flujo login/registro persistente.
- **DoD**:
  - usuarios, sesiones y verificaciones persisten en DB;
  - auth local deja de ser stateless demo.

### TKT-003 — Implementar perfiles y roles internos
- **Tipo**: feature
- **Prioridad**: P0
- **Estimación**: M
- **Backlog**: MVP-003
- **Dependencias**: TKT-002
- **Objetivo**: modelar `customer_profiles`, `staff_users` y políticas de autorización server-side.
- **Entregables**:
  - helpers `requireStaffUser`, `requireRole`, `requireAnyRole`;
  - seed del primer `super_admin`;
  - guards reutilizables para admin.
- **DoD**:
  - acciones administrativas rechazan usuarios sin rol;
  - el rol vive en DB y no solo en frontend.

### TKT-004 — Materializar schema base e-commerce
- **Tipo**: infra
- **Prioridad**: P0
- **Estimación**: L
- **Backlog**: MVP-004
- **Dependencias**: TKT-002
- **Objetivo**: llevar el modelo lógico a schema Drizzle y migración inicial.
- **Entregables**:
  - tablas de catálogo, pedidos, inventario, proveedores y compras;
  - enums del dominio;
  - migración inicial reproducible;
  - corrección de `drizzle.config.ts`.
- **DoD**:
  - el schema demo deja de ser la base principal;
  - la migración puede aplicarse desde cero.

### TKT-005 — Reemplazar shell demo por shell de producto
- **Tipo**: feature
- **Prioridad**: P1
- **Estimación**: M
- **Backlog**: MVP-005
- **Dependencias**: ninguna
- **Objetivo**: separar navegación pública y administrativa.
- **Entregables**:
  - navegación pública: home, catálogo, carrito, cuenta;
  - navegación admin: productos, pedidos, inventario, compras, usuarios;
  - demos fuera del flujo principal.
- **DoD**:
  - la app deja de verse como starter template.

---

## 4. Iteración 1 — Catálogo y comercial

### TKT-006 — CRUD de categorías
- **Tipo**: feature
- **Prioridad**: P0
- **Estimación**: M
- **Backlog**: MVP-006
- **Dependencias**: TKT-004
- **Objetivo**: alta/edición/activación de categorías y slugs.
- **Entregables**:
  - queries y commands server-side;
  - pantallas admin;
  - validaciones de slug único.

### TKT-007 — CRUD de productos con variantes e imágenes
- **Tipo**: feature
- **Prioridad**: P0
- **Estimación**: L
- **Backlog**: MVP-007
- **Dependencias**: TKT-006
- **Objetivo**: administrar producto padre, variantes, SKU, color, talla e imágenes.
- **Entregables**:
  - formularios admin;
  - persistencia de variantes;
  - validación de combinación única producto+talla+color.

### TKT-008 — Pricing base por variante
- **Tipo**: feature
- **Prioridad**: P0
- **Estimación**: M
- **Backlog**: MVP-008
- **Dependencias**: TKT-007
- **Objetivo**: definir precio vigente por variante y registrar historial básico.
- **Entregables**:
  - caso de uso para publicar precio;
  - query para resolver precio vigente;
  - traza mínima de cambios.

### TKT-009 — Ofertas básicas por producto/variante
- **Tipo**: feature
- **Prioridad**: P1
- **Estimación**: M
- **Backlog**: MVP-009
- **Dependencias**: TKT-008
- **Objetivo**: crear promociones con vigencia, prioridad y target simple.
- **Entregables**:
  - CRUD de ofertas;
  - motor simple de resolución de oferta aplicable;
  - integración en precio final público.

### TKT-010 — Storefront de catálogo
- **Tipo**: feature
- **Prioridad**: P0
- **Estimación**: L
- **Backlog**: MVP-010, MVP-011
- **Dependencias**: TKT-007, TKT-008
- **Objetivo**: exponer listado público, filtros y detalle de producto con selección de variante.
- **Entregables**:
  - rutas `/productos` y `/productos/$slug`;
  - filtros por categoría, talla, color, precio y ofertas;
  - detalle con disponibilidad real.

---

## 5. Iteración 2 — Checkout, pagos y pedidos

### TKT-011 — Carrito de compras
- **Tipo**: feature
- **Prioridad**: P0
- **Estimación**: M
- **Backlog**: MVP-012
- **Dependencias**: TKT-010
- **Objetivo**: carrito de sesión con ítems por variante y recálculo de totales.
- **Entregables**:
  - store del carrito;
  - validaciones de cantidad;
  - snapshots básicos del ítem seleccionado.

### TKT-012 — Checkout guest + autenticado
- **Tipo**: feature
- **Prioridad**: P0
- **Estimación**: M
- **Backlog**: MVP-013
- **Dependencias**: TKT-011, TKT-002
- **Objetivo**: capturar datos del comprador sin obligar registro.
- **Entregables**:
  - formulario de checkout;
  - validaciones server-side;
  - soporte para cliente invitado y autenticado.

### TKT-013 — Integración Stripe Checkout
- **Tipo**: feature
- **Prioridad**: P0
- **Estimación**: M
- **Backlog**: MVP-014
- **Dependencias**: TKT-012
- **Objetivo**: crear checkout session y persistir correlación preliminar del pago.
- **Entregables**:
  - adapter Stripe en `features/payments/server/stripe`;
  - endpoint/server function para crear sesión;
  - URLs de éxito/cancelación.

### TKT-014 — Webhook Stripe idempotente + creación de pedido
- **Tipo**: feature
- **Prioridad**: P0
- **Estimación**: L
- **Backlog**: MVP-015, MVP-023
- **Dependencias**: TKT-013, TKT-004
- **Objetivo**: procesar pagos confirmados sin duplicar órdenes ni transacciones.
- **Entregables**:
  - webhook handler validado por firma;
  - persistencia de `payment_webhook_events`;
  - caso de uso `create-order-from-payment` transaccional.

### TKT-015 — Backoffice e historial de pedidos
- **Tipo**: feature
- **Prioridad**: P0
- **Estimación**: M
- **Backlog**: MVP-016, MVP-017
- **Dependencias**: TKT-014, TKT-003
- **Objetivo**: exponer consulta de pedidos para cliente registrado y administración.
- **Entregables**:
  - panel `cuenta/pedidos`;
  - listado admin de pedidos;
  - filtros por cliente, fecha y estado.

---

## 6. Iteración 3 — Inventario, compras y hardening

### TKT-016 — Ledger de inventario y balance materializado
- **Tipo**: feature
- **Prioridad**: P0
- **Estimación**: L
- **Backlog**: MVP-018
- **Dependencias**: TKT-004, TKT-007, TKT-014
- **Objetivo**: implementar movimientos auditables y saldo por variante/ubicación.
- **Entregables**:
  - commands de entrada, salida, ajuste y devolución;
  - balance actualizado transaccionalmente;
  - salida automática al confirmar venta.

### TKT-017 — Gestión de proveedores y órdenes de compra
- **Tipo**: feature
- **Prioridad**: P1
- **Estimación**: L
- **Backlog**: MVP-020, MVP-021
- **Dependencias**: TKT-004, TKT-007, TKT-003
- **Objetivo**: administrar proveedores y órdenes de compra multi-ítem.
- **Entregables**:
  - CRUD de proveedores;
  - creación de órdenes con estados;
  - consulta y detalle en admin.

### TKT-018 — Recepción de mercadería e impacto en stock
- **Tipo**: feature
- **Prioridad**: P1
- **Estimación**: M
- **Backlog**: MVP-019
- **Dependencias**: TKT-016, TKT-017
- **Objetivo**: recibir parcial o totalmente órdenes de compra y reflejar el stock.
- **Entregables**:
  - caso de uso de recepción;
  - generación de `purchase_receipts` y `inventory_movements`;
  - actualización del estado de la orden.

### TKT-019 — Auditoría operativa mínima
- **Tipo**: hardening
- **Prioridad**: P1
- **Estimación**: M
- **Backlog**: MVP-022
- **Dependencias**: TKT-014, TKT-016
- **Objetivo**: centralizar trazas de eventos críticos de precio, stock, pago y estado de pedido.
- **Entregables**:
  - convenciones de auditoría;
  - hooks o casos de uso que registren actor y referencia;
  - vistas de consulta básica para admin.

### TKT-020 — QA de flujos críticos
- **Tipo**: hardening
- **Prioridad**: P0
- **Estimación**: M
- **Backlog**: MVP-024
- **Dependencias**: TKT-010, TKT-014, TKT-018
- **Objetivo**: validar punta a punta catálogo, compra y recepción.
- **Entregables**:
  - checklist QA manual;
  - pruebas automatizadas prioritarias en server/domain;
  - matriz de permisos por rol.

---

## 7. Orden recomendado de ejecución

1. TKT-001 a TKT-005
2. TKT-006 a TKT-010
3. TKT-011 a TKT-015
4. TKT-016 a TKT-020

---

## 8. Recomendación de liderazgo técnico

Si querés mover esto con criterio:

- **backend/schema primero**: TKT-002, TKT-003, TKT-004;
- **luego catálogo**: TKT-006, TKT-007, TKT-008;
- **recién después checkout y Stripe**: TKT-011 a TKT-014.

¿Por qué? Porque sin catálogo, variantes y precios, el checkout no tiene nada serio que cobrar. Es así de fácil.
