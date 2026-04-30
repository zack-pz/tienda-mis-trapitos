# PRD — Tienda Mis Trapitos

## 1. Resumen ejecutivo

**Tienda Mis Trapitos** será una plataforma de e-commerce para venta de ropa con catálogo público, checkout con Stripe, administración interna y operación comercial completa.

El producto deberá cubrir dos frentes:

1. **Canal de venta online** para clientes finales.
2. **Backoffice administrativo** para operar catálogo, precios, inventario, ofertas, clientes, proveedores y órdenes de compra.

> Estado actual validado: el repositorio parte de una base técnica existente, pero todavía no implementa el dominio e-commerce. Este PRD define el producto objetivo sobre esa base.

---

## 2. Visión del producto

Construir una tienda online simple de usar para el cliente y sólida para la operación interna, permitiendo vender ropa con variantes comerciales (talla, color), cobrar con Stripe, controlar stock y sostener el circuito comercial desde la compra al proveedor hasta la venta al cliente.

---

## 3. Objetivos de negocio

- Vender ropa online con una experiencia de compra clara y confiable.
- Reducir fricción en el checkout permitiendo compra con registro opcional.
- Centralizar la gestión comercial en un solo sistema.
- Mantener control trazable sobre precios, stock, ofertas y compras a proveedores.
- Contar con historial de compras por cliente para atención, fidelización y análisis.

---

## 4. Objetivos del producto

- Permitir navegación de catálogo, carrito y checkout desde web.
- Integrar pagos online con Stripe.
- Gestionar productos con categorías, tallas, colores, precios y ofertas.
- Permitir registro e inicio de sesión de clientes, sin obligarlo para comprar.
- Mantener historial de compras accesible para clientes registrados y para administración.
- Gestionar inventario con movimientos de entrada, salida, ajuste y devolución.
- Administrar proveedores y órdenes de compra.
- Restringir accesos mediante roles fijos de usuario interno.

---

## 5. Alcance funcional

### 5.1 Canal público / tienda online

- Home comercial.
- Listado de productos.
- Filtros por categoría, talla, color, precio y ofertas.
- Detalle de producto con variantes.
- Carrito de compras.
- Checkout.
- Pago con Stripe.
- Confirmación de compra.
- Consulta de estado e historial de pedidos para clientes registrados.

### 5.2 Backoffice administrativo

- Administración de usuarios con roles fijos.
- Alta y edición de productos.
- Alta y edición de categorías.
- Alta y edición de atributos comerciales: talla, color, precio, oferta.
- Gestión de inventario y movimientos.
- Gestión de clientes.
- Consulta de historial de compras.
- Gestión de proveedores.
- Gestión de órdenes de compra.
- Gestión de pedidos de venta.

> **Nota importante**: la gestión de pedidos de venta no estaba explicitada como módulo, pero es un requisito derivado OBLIGATORIO. Sin eso no existe operación real de e-commerce; solo tendrías cobro, pero no trazabilidad del negocio.

---

## 6. Tipos de usuario

### 6.1 Cliente invitado

- Puede navegar catálogo.
- Puede agregar productos al carrito.
- Puede completar compra sin crear cuenta.
- Recibe confirmación de compra por email.
- No accede a panel persistente de historial hasta registrar una cuenta o reclamar compras previas.

### 6.2 Cliente registrado

- Todo lo del invitado.
- Puede iniciar sesión.
- Puede consultar historial de compras.
- Puede gestionar datos básicos de su cuenta.

### 6.3 Usuarios internos con roles fijos

Se propone iniciar con estos roles fijos:

1. **Super Admin**
   - Acceso total.
2. **Administrador Comercial**
   - Productos, categorías, precios, ofertas y clientes.
3. **Operador de Inventario**
   - Movimientos, stock y devoluciones.
4. **Compras**
   - Proveedores y órdenes de compra.
5. **Atención / Ventas**
   - Consulta de clientes, pedidos e historial.

> Esto es mejor que arrancar con permisos totalmente custom desde día uno. ¿Y sabés por qué? Porque roles fijos reducen complejidad operativa, errores de autorización y tiempo de implementación. Primero fundamento, después flexibilidad.

---

## 7. Requerimientos funcionales

### 7.1 Catálogo y productos

- **RF-01**: El sistema debe permitir crear, editar, activar y desactivar productos.
- **RF-02**: Cada producto debe pertenecer al menos a una categoría.
- **RF-03**: Cada producto podrá manejar variantes comerciales por combinación de talla y color.
- **RF-04**: Cada variante debe tener stock, precio y SKU propios.
- **RF-05**: El catálogo público debe mostrar nombre, imágenes, precio, disponibilidad, tallas y colores.

### 7.2 Categorías y atributos comerciales

- **RF-06**: El sistema debe permitir crear y editar categorías.
- **RF-07**: El sistema debe permitir administrar tallas y colores disponibles.
- **RF-08**: Debe ser posible asociar tallas y colores a productos específicos.

### 7.3 Precios y ofertas

- **RF-09**: El sistema debe permitir definir precio base por variante.
- **RF-10**: El sistema debe permitir crear ofertas vigentes por rango de fechas.
- **RF-11**: El catálogo y checkout deben reflejar correctamente el precio final aplicable.
- **RF-12**: Las ofertas deben poder activarse, pausarse y finalizarse.

### 7.4 Carrito, checkout y pagos

- **RF-13**: El cliente debe poder agregar, modificar y quitar productos del carrito.
- **RF-14**: El checkout debe permitir compra como invitado o como usuario registrado.
- **RF-15**: Los pagos online deben realizarse con Stripe.
- **RF-16**: El sistema debe registrar el resultado del pago y asociarlo al pedido.
- **RF-17**: Ante pago exitoso, el sistema debe generar el pedido de venta y descontar stock.
- **RF-18**: Ante pago fallido, el pedido no debe confirmarse como vendido.

### 7.5 Clientes e historial

- **RF-19**: El sistema debe permitir registro e inicio de sesión de clientes.
- **RF-20**: El registro de clientes debe ser opcional para comprar.
- **RF-21**: Los clientes registrados deben poder consultar su historial de compras.
- **RF-22**: Los usuarios internos autorizados deben poder consultar historial de compras por cliente.
- **RF-23**: El sistema debe permitir relacionar pedidos con un cliente registrado cuando corresponda.

### 7.6 Usuarios internos y roles

- **RF-24**: El sistema debe permitir alta y baja lógica de usuarios internos.
- **RF-25**: Cada usuario interno debe tener un rol fijo asignado.
- **RF-26**: Las pantallas y acciones deben respetar permisos por rol.

### 7.7 Inventario

- **RF-27**: El sistema debe mantener stock por variante.
- **RF-28**: Debe existir registro de movimientos de inventario de tipo entrada, salida, ajuste y devolución.
- **RF-29**: Todo movimiento debe quedar auditado con fecha, usuario y motivo.
- **RF-30**: La venta confirmada debe generar salida de inventario.
- **RF-31**: La recepción de compras debe generar entrada de inventario.

### 7.8 Proveedores y órdenes de compra

- **RF-32**: El sistema debe permitir alta y edición de proveedores.
- **RF-33**: El sistema debe permitir crear órdenes de compra con múltiples ítems.
- **RF-34**: Las órdenes de compra deben tener estados al menos: borrador, emitida, recibida, cancelada.
- **RF-35**: La recepción total o parcial de una orden debe impactar inventario.

### 7.9 Pedidos de venta

- **RF-36**: El sistema debe registrar pedidos de venta con detalle de ítems, importes, pago y estado.
- **RF-37**: Debe existir trazabilidad mínima del pedido desde creación hasta pago confirmado.
- **RF-38**: Administración debe poder consultar pedidos por cliente, fecha y estado.

---

## 8. Reglas de negocio

- **RN-01**: El checkout con registro opcional es obligatorio; no se debe bloquear una compra por falta de cuenta.
- **RN-02**: El historial visible para el cliente requiere identidad verificable.
- **RN-03**: Cada variante de producto se identifica por una combinación única de producto + talla + color.
- **RN-04**: El stock se controla por variante, no solo por producto padre.
- **RN-05**: Todo impacto de stock debe originarse en un movimiento auditable.
- **RN-06**: Un pago exitoso en Stripe no debe perderse aunque falle un paso posterior; se requiere trazabilidad y conciliación.
- **RN-07**: Las ofertas deben respetar vigencia temporal y prioridad definida.
- **RN-08**: Los roles internos son fijos en la primera versión.

---

## 9. Flujos críticos

### 9.1 Compra online

1. Cliente navega catálogo.
2. Selecciona producto, talla y color.
3. Agrega al carrito.
4. Inicia checkout como invitado o registrado.
5. Completa datos de compra.
6. Paga con Stripe.
7. El sistema confirma pago, crea pedido y descuenta stock.
8. Se muestra confirmación y se envía comprobación por email.

### 9.2 Alta de producto

1. Usuario con permisos crea producto.
2. Asigna categoría.
3. Define variantes por talla y color.
4. Define precios y stock inicial.
5. Publica producto.

### 9.3 Recepción de mercadería

1. Usuario de compras crea orden de compra.
2. Proveedor entrega mercadería.
3. Operador registra recepción total o parcial.
4. El sistema genera movimientos de entrada.
5. El stock queda actualizado.

---

## 10. Alcance MVP propuesto

### En MVP

- Catálogo público.
- Productos con variantes de talla y color.
- Categorías.
- Carrito y checkout.
- Pago con Stripe.
- Registro/login opcional para clientes.
- Historial de compras para registrados.
- Backoffice con roles fijos.
- Gestión básica de inventario.
- Gestión básica de ofertas.
- Gestión básica de proveedores y órdenes de compra.
- Gestión básica de pedidos de venta.

### Fuera de alcance inicial / fase posterior recomendada

- Programa de puntos o fidelización.
- Gift cards.
- Marketplace multi-vendedor.
- Multi-moneda.
- Multi-sucursal o multi-depósito avanzado.
- Reglas promocionales complejas tipo “lleva 3 paga 2”.
- Integraciones contables o ERP.

---

## 11. Requerimientos no funcionales

- **RNF-01 Seguridad**: pagos delegados en Stripe y control de acceso por roles.
- **RNF-02 Auditoría**: cambios críticos de stock, precio y pedidos deben quedar trazados.
- **RNF-03 Performance**: navegación fluida en mobile y desktop.
- **RNF-04 Responsive**: experiencia usable en celular, tablet y desktop.
- **RNF-05 Disponibilidad**: operación estable para ventas y backoffice.
- **RNF-06 Escalabilidad**: estructura preparada para crecer en catálogo, pedidos y usuarios.
- **RNF-07 SEO básico**: páginas públicas indexables para categorías y productos.

---

## 12. Integraciones externas

### Stripe

Uso previsto:

- Cobro del checkout.
- Confirmación de pago.
- Registro del estado del pago en el pedido.
- Posible manejo futuro de reembolsos.

---

## 13. Métricas de éxito

- Tasa de conversión de visita a compra.
- Tasa de abandono de carrito.
- Tasa de éxito de pagos con Stripe.
- Tiempo promedio de alta de producto.
- Exactitud de stock.
- Cantidad de pedidos con incidencia manual.
- Recompra de clientes registrados.

---

## 14. Riesgos y consideraciones

- La combinación de e-commerce + inventario + compras a proveedores ya entra en terreno de sistema comercial completo, no solo “tiendita web”.
- Si no se define bien el modelo de variantes desde el inicio, después corregir stock y precios es una PESADILLA.
- Stripe resuelve pago, pero no define por sí mismo reglas de pedido, devolución, conciliación ni logística.
- Permitir compra invitada obliga a diseñar bien cómo se relacionarán luego pedidos con clientes registrados.

---

## 15. Puntos a mejorar / decisiones pendientes

Estos son los puntos que te recomiendo cerrar cuanto antes, porque cambian alcance real:

1. **Envíos y logística**
   - Falta definir si habrá retiro en tienda, envío nacional, cálculo de envío y tracking.
2. **Impuestos y facturación**
   - No está definido si el precio incluye impuestos ni si habrá comprobantes/facturas.
3. **Devoluciones y reembolsos**
   - Hoy solo aparece devolución como movimiento de stock; falta política de negocio completa.
4. **Modelo de historial para compras invitadas**
   - Recomendación: asociar compras por email verificado para poder reclamarlas al crear cuenta.
5. **Gestión de imágenes y contenido**
   - Falta definir cuántas imágenes por producto, orden, portada y assets promocionales.
6. **Depósito único o múltiples depósitos**
   - Si habrá más de un depósito, cambia mucho el diseño de inventario.
7. **Estados de pedido**
   - Conviene definir al menos: pendiente, pagado, preparado, enviado, entregado, cancelado, devuelto.

---

## 16. Recomendación de implementación

Mi recomendación, bien de arquitecto pesado pero con cariño, es esta:

1. **Primero cerrar dominio de catálogo + variantes + pedidos + pagos**.
2. **Después inventario operativo**.
3. **Después compras a proveedores si querés profundidad real**.

¿Por qué? Porque si mezclás todo desde el día uno sin ordenar prioridades, terminás con una obra sin cimientos. Y en software eso siempre explota en stock inconsistente, permisos mal definidos y pedidos imposibles de reconciliar.

---

## 17. Criterio de éxito del PRD

Este PRD se considera válido si permite pasar a las siguientes etapas:

- diseño funcional de pantallas,
- modelado de datos,
- definición de backlog,
- priorización de MVP,
- planificación técnica por módulos.

---

## 18. Documentos derivados

- [MVP Backlog](./MVP-BACKLOG.md)
- [Data Model](./DATA-MODEL.md)
- [Architecture](./ARCHITECTURE.md)
