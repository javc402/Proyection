# PROMPT — Instrucciones para GitHub Copilot (Proyecto **PROYECTION**)

> **Estructura de capas**
>
> * **/app** → API (Node.js + Express, MongoDB, Nodemon, dotenv).
> * **/view** → Frontend (Vue 3 + Vite, Pinia para estado, Vue Router, Chart.js para gráficas).
>
> **Objetivo**: Plataforma de finanzas personales y patrimoniales con **multimoneda** (soporta cualquier moneda configurable por perfil), **inversiones diversificadas**, **créditos** (hipotecario, personal, TC), **transferencias entre cuentas con costos** (nacionales/internacionales y comisiones), **gestión de inmuebles y arriendos**, **proyecciones** con **interés variable** + **IPC variable** y **tasas FX** en tiempo real con caché y fallback.

> Copilot --> todo debera esta escrito siempre en lenguaje Es-CO
> Copilot --> cada vez que creemos un controlador nuevo u operación nueva, actualizaremos la collection de postman
> Copilot --> cada vez que creemos un archivo o carpeta actualizaremos la estructura del proyecto en el readme
---

## Base de datos MongoDB

* Nombre de la base: **proyection**
* Colecciones iniciales:

  * **user** → usuarios con perfil, monedas permitidas, país de residencia.
  * **accounts** → cuentas (bancos, tarjetas, préstamos, billeteras) con moneda y país.
  * **movements** → ingresos, gastos y transferencias (incluye costos: comisiones, spread FX, impuestos).
  * **investments** → inversiones diversificadas (ETF, acciones, bonos, fondos, cripto, inmuebles).
  * **loans** → créditos hipotecarios, personales y tarjetas de crédito.
  * **properties** → inmuebles.
  * **leases** → contratos de arriendo asociados a propiedades.
  * **fx\_cache** → tasas de cambio cacheadas por 24h.
  * **ipc** → valores de IPC históricos o simulados.
* Configuración recomendada:

  * Índices: `user.email` único, `movements.fecha` ascendente, `accounts.userId` compuesto con `pais`.
  * Usuario dedicado de BD: `proyection_user` con rol `readWrite` en BD `proyection`.

Cadena de conexión (ejemplo .env):

```env
MONGO_URI=mongodb://proyection_user:password@localhost:27017/proyection?authSource=admin
```

---

## Stack & convenciones

* **API (/app)**: Node 20+, Express, MongoDB (Mongoose), Nodemon, dotenv, Zod (validación), Winston (logging), Swagger/OpenAPI, Jest + Supertest.
* **Front (/view)**: Vue 3 + Vite, TypeScript, Pinia, Vue Router, Axios, Chart.js, Tailwind opcional.
* **Estilo**: TypeScript en ambos lados cuando sea posible. Convención camelCase para variables y PascalCase para tipos/clases.
* **I18n y moneda**: guardar montos en **moneda de la cuenta** y normalizar a **moneda base del perfil** para reportes.

---

## Variables de entorno (.env en /app)

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/proyection
JWT_SECRET=changeme
FX_PRIMARY_URL=https://api.frankfurter.app
FX_FALLBACK_URL=https://api.exchangerate.host
FX_CACHE_TTL_HOURS=24
```

> Copilot: siempre leer config desde `process.env` con `dotenv` y `zod` para validar.

### Scripts (package.json)

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc -p .",
    "start": "node dist/server.js",
    "test": "jest --runInBand",
    "lint": "eslint ."
  }
}
```

---

## API — módulos mínimos

* **Auth & Perfiles**: usuarios, moneda base (ej. EUR), lista de **monedas permitidas** por usuario, país de residencia por cuenta.
* **Cuentas**: bancarias, billeteras, tarjetas de crédito, préstamos (hipotecario/personal). Campos: `nombre`, `tipo`, `moneda`, `pais`, `saldoInicial`, `limite` (TC), `tasaInteres` (si aplica), `comisionTransferencia` por defecto.
* **Movimientos**: ingresos/gastos/traslados. En traslados registrar **costos**: `comision`, `spreadFX`, `impuesto` y banderas `nacional`/`internacional`.
* **Inversiones**: tipo (ETF, acciones, fondos, bonos, cripto, inmueble), `aporteMensual`, `comision`, `politicaRiesgo`, `moneda`, y **tasa variable** por periodo.
* **Créditos**: hipotecario, personal, TC; amortización francesa; comisiones; prepago.
* **Inmuebles**: propiedades, arriendos (contratos, depósitos, reajuste por IPC/IGP, períodos de vacancia, gastos de administración), integración con **Cuentas**.
* **FX Service**: tasas en tiempo real + **caché** (TTL configurable) + **fallback**.
* **IPC Service**: IPC por país configurable (histórico o simulado con media/σ) y aplicación a proyecciones/contratos de arriendo.
* **Proyecciones**: horizonte 3/5/10/15/20 años (variable y configurable), escenarios **Optimista/Base/Pesimista**, shocks (`{fecha, delta%}`), tasas e IPC **variables** mes a mes.

### Endpoints sugeridos (prefijos REST)

```
POST   /api/auth/register | /login
GET    /api/profile        | GET/PUT monedaBase, monedasPermitidas
CRUD   /api/accounts       | ?type=bank|card|loan|wallet&country=XX
CRUD   /api/movements      | ingresos/gastos/traslados (+costos)
CRUD   /api/investments    | diversificación por tipo/moneda
CRUD   /api/properties     | inmuebles
CRUD   /api/leases         | contratos de arriendo (IPC, reajuste, vacancia)
POST   /api/transfer       | entre cuentas (calcular costos + FX)
GET    /api/fx/convert     | convertir montos (con caché)
POST   /api/projections    | calcula escenarios
```

---

## Esquemas Mongo (Mongoose, bosquejo)

```ts
// User
{ _id, nombre, email, passwordHash, monedaBase, monedasPermitidas:[string], pais, createdAt }

// Account
{ _id, userId, nombre, tipo: 'bank'|'card'|'loan'|'wallet', moneda, pais,
  saldoInicial, limite?, tasaInteresAnual?, comisionTransferenciaDefault?, createdAt }

// Movement
{ _id, userId, accountId, tipo: 'income'|'expense'|'transfer', fecha, moneda,
  monto, categoria, etiquetas:[string], notas,
  origenId?, destinoId?, comision?, spreadFX?, impuesto?, esInternacional? }

// Investment
{ _id, userId, cuentaId, tipo, moneda, aporteMensual, comision, politicaRiesgo,
  tasasPeriodo:[{ mes, interesAnual, ipc }] }

// Loan
{ _id, userId, accountId, tipo:'mortgage'|'personal'|'card', moneda, tasa, plazoMeses,
  cuotaMensual?, comisiones:[{tipo, monto}] }

// Property & Lease
{ _id, userId, direccion, pais, moneda, valorCompra, gastosFijos,
  contratos:[{ inquilino, inicio, fin?, canon, moneda, reajuste:{indice:'IPC', mesAnual:int},
               deposito?, gastosAdmin?, vacanciaMesesPromedio? }] }
```

---

## Reglas de negocio clave (para Copilot)

1. **Multimoneda**

   * Toda cuenta tiene **moneda** y **país**; transferencias con distinta moneda usan **FX** del día (o fecha del movimiento) + `spreadFX`.
   * Reportes se normalizan a **moneda base del perfil**.
2. **Transferencias**

   * Registrar **costos**: `comision`, `impuesto` (p.ej. 4x1000 si aplica), `spreadFX`.
   * Distinguir **nacional** vs **internacional** (afecta costos y tiempos).
3. **Inversiones**

   * Permitir múltiples tipos y monedas; **tasa de interés variable** por periodo.
   * Proyecciones contemplan **IPC variable** y **shocks** de mercado.
4. **Créditos**

   * Hipotecario y personal con amortización y prepagos; TC con intereses por saldo y pago mínimo.
5. **Arriendos**

   * Contrato con **reajuste** por índice (IPC u otro), **vacancia** y gastos.

---

## Proyecciones (motor)

* Entrada: horizonte, escenario, tasa media anual, σ, IPC medio y σ, shocks, aportes periódicos, comisiones.
* Salida: series mensuales (aportado, rentabilidad, comisiones, IPC, saldo por cuenta/inversión), KPIs (CAGR, drawdown, rentas pasivas estimadas).
* Diseño: **funciones puras** para el cálculo; IO/Fx/IPC fuera del núcleo.

---

## Front (/view) — lineamientos

* Páginas base: **Dashboard**, **Cuentas**, **Movimientos**, **Transferencias**, **Inversiones**, **Créditos**, **Inmuebles/Arriendos**, **Proyecciones**, **Perfil**.
* Estado global con **Pinia**; API vía **Axios**; manejo de errores con toasts.
* Componentes: tablas con filtros/búsqueda, formularios con validación, gráficas (Chart.js) para patrimonio, cashflow, distribución, drawdown.
* i18n: formateo numérico/moneda según perfil.

---

## Cómo quiero que Copilot ayude

1. Antes de generar código, listar: **suposiciones**, **interfaces**, **casos borde**.
2. Sugerir DTOs/Esquemas/Endpoints y crear **tests** (Jest + Supertest) para rutas críticas: FX, transferencias, proyecciones, créditos.
3. Al crear endpoints, incluir **ejemplos** de request/response y validar con **Zod**.
4. Usar **dotenv** + validación de config y **no** hardcodear secretos.
5. Implementar **caché** para FX y reintento con **fallback**.

---

## Tareas iniciales sugeridas

1. **/app**: bootstrap Express, conexión Mongo, validación .env, módulos `fx`, `ipc`, `accounts`, `movements`, `transfers`, `investments`, `loans`, `properties`, `leases`.
2. **/app**: OpenAPI (Swagger) de endpoints anteriores.
3. **/view**: scaffold con Vite + Vue Router + Pinia; layout base y pantalla de **Cuentas**.
4. **Tests**: FX convert + transferencias con costos + proyección simple.

> **Nota para Copilot**: seguir este documento y, ante ambigüedad, proponer 2–3 opciones con pros/contras antes de generar código final.
