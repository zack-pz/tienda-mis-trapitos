# MVP Backlog — Tienda Mis Trapitos

## 1. Propósito

Este backlog baja el `PRD.md` a entregables concretos para un **MVP vendible y operable**.

La idea es simple: primero habilitar la venta real, después asegurar operación interna mínima, y recién más adelante sofisticar promociones, logística y multi-depósito.

---

## 2. Supuestos del MVP

- Una sola tienda online y un solo catálogo público.
- Una sola moneda operativa en MVP.
- Un depósito principal inicial, pero con modelo extensible a múltiples ubicaciones.
- Checkout con registro opcional.
- Confirmación de pago basada en Stripe + webhook idempotente.
- Sin carrito persistente cross-device en la primera versión.
- Envíos, impuestos y política formal de devoluciones quedan como definición funcional prioritaria antes de cerrar el desarrollo del checkout.

---

## 3. Prioridades

- **P0** = bloqueante / obligatorio para salir a producción.
- **P1** = muy importante para operar bien el MVP.
- **P2** = mejora posterior o endurecimiento no bloqueante.

---

## 4. Secuencia recomendada

1. **Fundaciones**
2. **Venta online**
3. **Operación interna**
4. **Hardening y trazabilidad**

Sí, hermano: ESTE ORDEN importa. Si arrancás por proveedores o promociones antes de poder vender, estás construyendo paredes sin haber hecho los cimientos.

---

## 5. Backlog priorizado

### Epic A — Definiciones bloqueantes

#### MVP-001 — Cerrar reglas pendientes de negocio
- **Prioridad**: P0
- **Objetivo**: documentar decisiones de envíos, impuestos, devoluciones y estados finales de pedido.
- **Dependencias**: ninguna.
- **Criterios de aceptación**:
  - existe documento aprobado con reglas de envío;
  - existe definición de impuestos/precio final visible al cliente;
  - existe política operativa de devolución y reembolso;
  - están definidos los estados del pedido para cliente y backoffice.

### Epic B — Fundaciones técnicas y seguridad

#### MVP-002 — Persistir autenticación y perfiles de usuario
- **Prioridad**: P0
- **Objetivo**: usar Better Auth con base de datos y separar perfiles de cliente e interno.
- **Dependencias**: MVP-001.
- **Criterios de aceptación**:
  - login y registro persisten usuarios en base;
  - existe distinción entre cliente y usuario interno;
  - el sistema soporta compra con cuenta y sin cuenta.

#### MVP-003 — Implementar roles fijos para usuarios internos
- **Prioridad**: P0
- **Objetivo**: soportar `super_admin`, `admin_comercial`, `operador_inventario`, `compras`, `atencion_ventas`.
- **Dependencias**: MVP-002.
- **Criterios de aceptación**:
  - cada usuario interno tiene un único rol fijo;
  - rutas y acciones administrativas validan permisos;
  - accesos no autorizados son rechazados.

#### MVP-004 — Crear schema base e-commerce y migraciones
- **Prioridad**: P0
- **Objetivo**: materializar el modelo de datos mínimo de catálogo, ventas, inventario, clientes y compras.
- **Dependencias**: MVP-002.
- **Criterios de aceptación**:
  - existen tablas base del dominio;
  - hay migraciones reproducibles;
  - el schema deja de ser demo-only.

#### MVP-005 — Reemplazar navegación demo por navegación de producto
- **Prioridad**: P1
- **Objetivo**: convertir la shell actual en navegación real de tienda + administración.
- **Dependencias**: ninguna.
- **Criterios de aceptación**:
  - navegación pública apunta a home, catálogo, carrito y cuenta;
  - navegación administrativa queda separada;
  - los enlaces demo dejan de ser la interfaz principal.

### Epic C — Catálogo y comercial

#### MVP-006 — CRUD de categorías
- **Prioridad**: P0
- **Objetivo**: alta, edición, activación y desactivación de categorías.
- **Dependencias**: MVP-004.
- **Criterios de aceptación**:
  - categorías visibles en admin;
  - cada categoría tiene slug y estado;
  - pueden usarse en filtros públicos.

#### MVP-007 — CRUD de productos con variantes
- **Prioridad**: P0
- **Objetivo**: alta y edición de productos con talla, color, SKU, imágenes y estado.
- **Dependencias**: MVP-004, MVP-006.
- **Criterios de aceptación**:
  - existe producto padre con variantes;
  - cada variante tiene SKU único;
  - la combinación producto+talla+color no se repite;
  - el catálogo puede mostrar disponibilidad por variante.

#### MVP-008 — Gestión de precios base
- **Prioridad**: P0
- **Objetivo**: definir precio base por variante con trazabilidad mínima.
- **Dependencias**: MVP-007.
- **Criterios de aceptación**:
  - cada variante tiene precio vigente;
  - el sistema conserva al menos historial básico de cambios;
  - checkout usa el precio vigente correcto.

#### MVP-009 — Gestión básica de ofertas
- **Prioridad**: P1
- **Objetivo**: permitir ofertas con vigencia y prioridad.
- **Dependencias**: MVP-008.
- **Criterios de aceptación**:
  - se pueden crear ofertas activas/inactivas;
  - la vigencia temporal impacta el precio final;
  - se evita aplicar dos ofertas incompatibles sin una regla definida.

### Epic D — Storefront y conversión

#### MVP-010 — Listado público de catálogo con filtros
- **Prioridad**: P0
- **Objetivo**: navegación del catálogo por categoría, talla, color, precio y ofertas.
- **Dependencias**: MVP-006, MVP-007, MVP-008.
- **Criterios de aceptación**:
  - el usuario puede listar productos;
  - los filtros responden correctamente;
  - solo se muestran productos publicables.

#### MVP-011 — Detalle de producto con selección de variante
- **Prioridad**: P0
- **Objetivo**: permitir elegir talla/color y ver disponibilidad real.
- **Dependencias**: MVP-007, MVP-008.
- **Criterios de aceptación**:
  - el cliente selecciona variante válida;
  - el precio visible coincide con la variante;
  - no se puede comprar una variante inactiva.

#### MVP-012 — Carrito de compras
- **Prioridad**: P0
- **Objetivo**: agregar, editar y eliminar ítems antes del checkout.
- **Dependencias**: MVP-011.
- **Criterios de aceptación**:
  - el carrito recalcula subtotales y total;
  - no permite cantidades inválidas;
  - conserva snapshots básicos de variante seleccionada durante la sesión.

#### MVP-013 — Checkout guest + registrado
- **Prioridad**: P0
- **Objetivo**: capturar datos del comprador sin forzar registro.
- **Dependencias**: MVP-012, MVP-002.
- **Criterios de aceptación**:
  - existe compra como invitado;
  - existe compra autenticada;
  - se validan datos mínimos del pedido antes de enviar a Stripe.

#### MVP-014 — Integración Stripe Checkout
- **Prioridad**: P0
- **Objetivo**: crear sesión de pago y redirigir al flujo de Stripe.
- **Dependencias**: MVP-013.
- **Criterios de aceptación**:
  - se genera checkout session válida;
  - se guarda correlación entre carrito/orden/pago;
  - existen URLs de éxito y cancelación controladas.

#### MVP-015 — Webhook Stripe + creación de pedido
- **Prioridad**: P0
- **Objetivo**: registrar pagos confirmados y crear el pedido de venta de forma idempotente.
- **Dependencias**: MVP-014, MVP-004.
- **Criterios de aceptación**:
  - un mismo evento no duplica pedidos ni pagos;
  - el pedido queda creado con snapshot de productos y precios;
  - el estado del pago queda trazado.

#### MVP-016 — Cuenta de cliente e historial de compras
- **Prioridad**: P1
- **Objetivo**: permitir que clientes registrados consulten pedidos previos.
- **Dependencias**: MVP-015.
- **Criterios de aceptación**:
  - el cliente ve su listado de pedidos;
  - puede entrar al detalle;
  - los pedidos guest pueden asociarse por email verificado según regla definida.

### Epic E — Pedidos e inventario

#### MVP-017 — Backoffice de pedidos de venta
- **Prioridad**: P0
- **Objetivo**: listar y consultar pedidos por fecha, cliente y estado.
- **Dependencias**: MVP-015.
- **Criterios de aceptación**:
  - administración puede ver pedidos;
  - se pueden filtrar;
  - el detalle muestra ítems, totales y estado de pago.

#### MVP-018 — Ledger de inventario y balance por variante
- **Prioridad**: P0
- **Objetivo**: registrar entradas, salidas, ajustes y devoluciones con auditoría.
- **Dependencias**: MVP-007, MVP-004.
- **Criterios de aceptación**:
  - todo movimiento queda registrado con tipo, motivo y usuario;
  - existe stock actual por variante;
  - la venta confirmada genera salida de stock.

#### MVP-019 — Recepción de mercadería e impacto en stock
- **Prioridad**: P1
- **Objetivo**: permitir ingreso de stock desde compras.
- **Dependencias**: MVP-018, MVP-021.
- **Criterios de aceptación**:
  - recepción total o parcial genera entradas;
  - el balance cambia correctamente;
  - queda trazabilidad con la orden de compra.

### Epic F — Compras y proveedores

#### MVP-020 — Gestión de proveedores
- **Prioridad**: P1
- **Objetivo**: alta, edición y consulta de proveedores.
- **Dependencias**: MVP-004.
- **Criterios de aceptación**:
  - cada proveedor tiene datos comerciales básicos;
  - puede activarse/desactivarse;
  - queda disponible para órdenes de compra.

#### MVP-021 — Órdenes de compra
- **Prioridad**: P1
- **Objetivo**: crear órdenes de compra con múltiples ítems y estados.
- **Dependencias**: MVP-020, MVP-007.
- **Criterios de aceptación**:
  - existe borrador, emisión, cancelación y recepción;
  - se pueden agregar múltiples variantes;
  - la orden soporta recepción parcial.

### Epic G — Hardening

#### MVP-022 — Auditoría operativa mínima
- **Prioridad**: P1
- **Objetivo**: registrar actor, fecha y referencia en cambios críticos.
- **Dependencias**: MVP-003, MVP-015, MVP-018.
- **Criterios de aceptación**:
  - cambios de precio, stock y estado de pedido dejan traza;
  - eventos de pago quedan registrados;
  - existe criterio mínimo de consulta administrativa.

#### MVP-023 — Manejo de errores e idempotencia en pagos
- **Prioridad**: P0
- **Objetivo**: evitar duplicaciones o estados inconsistentes por reintentos.
- **Dependencias**: MVP-015.
- **Criterios de aceptación**:
  - reintentos de webhook no duplican efectos;
  - si falla una etapa posterior al pago, queda incidencia recuperable;
  - existe correlación entre order, payment intent y webhook event.

#### MVP-024 — QA de flujos críticos
- **Prioridad**: P0
- **Objetivo**: validar punta a punta alta de producto, compra y recepción de mercadería.
- **Dependencias**: MVP-007, MVP-015, MVP-019.
- **Criterios de aceptación**:
  - compra online completa funciona;
  - recepción de stock impacta balance;
  - un usuario interno con rol incorrecto no puede ejecutar acciones restringidas.

---

## 6. Corte recomendado para salir a producción

### MVP mínimo publicable

Obligatorios:

- MVP-001 a MVP-008
- MVP-010 a MVP-015
- MVP-017
- MVP-018
- MVP-023
- MVP-024

### MVP operativo recomendado

Además de lo anterior:

- MVP-009
- MVP-016
- MVP-020
- MVP-021
- MVP-019
- MVP-022

---

## 7. Riesgos de implementación

- Si no se resuelve temprano la política de stock durante checkout, podés terminar vendiendo más de lo disponible.
- Si el pedido no guarda snapshots de nombre/SKU/precio, el historial se rompe cuando cambian los productos.
- Si Stripe se integra sin idempotencia de webhook, vas a duplicar órdenes o pagos. Es casi una ley de la vida.

---

## 8. Próximo paso recomendado

Tomar este backlog y convertirlo en:

1. **tickets de implementación**;
2. **modelo de datos físico con Drizzle**;
3. **roadmap por iteraciones**.
