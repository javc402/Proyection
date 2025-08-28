# PROYECTION 💰📊

Aplicación para **gestión financiera personal** con soporte de:

* **Control de gastos** e ingresos.
* **Inversiones diversificadas** (ETF, acciones, fondos, bonos, cripto, inmuebles).
* **Créditos** (hipotecario, personal, tarjetas).
* **Transferencias entre cuentas** con costos nacionales/internacionales y comisiones.
* **Gestión de inmuebles y arriendos** (contratos, reajuste por IPC, vacancia).
* **Multimoneda** (EUR, USD, COP y cualquier otra configurable en el perfil).
* **Proyecciones financieras** a corto, medio y largo plazo con tasas de interés e IPC variables.

---

## 📂 Estructura del proyecto

```
PROYECTION
│── app/     # API en Node.js + Express + MongoDB
│── view/    # Frontend en Vue 3 + Vite
│── prompt_func.md  # Instrucciones para GitHub Copilot
│── README.md
```

---

## 🚀 Tecnologías principales

* **Backend (/app)**:

  * Node.js, Express, MongoDB (Mongoose)
  * Nodemon, dotenv, Jest + Supertest
  * Swagger/OpenAPI
* **Frontend (/view)**:

  * Vue 3 + Vite
  * Pinia (estado global), Vue Router
  * Axios, Chart.js, Tailwind opcional

---

## ⚙️ Variables de entorno (ejemplo)

Archivo `.env` en `/app`:

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/proyection
JWT_SECRET=changeme
FX_PRIMARY_URL=https://api.frankfurter.app
FX_FALLBACK_URL=https://api.exchangerate.host
FX_CACHE_TTL_HOURS=24
```

---

## 🤖 Instrucciones para GitHub Copilot

Este proyecto tiene un archivo de instrucciones dedicado:
👉 [prompt\_func.md](./prompt_func.md)

> **Nota:** Copilot debe considerar siempre este archivo para entender las reglas de desarrollo, convenciones y casos de uso de la aplicación.

---

## 📌 Próximos pasos

1. Configurar conexión a MongoDB (`proyection`).
2. Inicializar colecciones (`user`, `accounts`, `movements`, `investments`, `loans`, `properties`, `leases`, `fx_cache`, `ipc`).
3. Generar el esqueleto de la API en `/app` con Express + Mongoose.
4. Crear scaffold de Vue 3 en `/view` con Router + Pinia.
5. Implementar endpoints base y pantallas de cuentas/gastos.

---

## 📋 Archivos del Proyecto

### 🎯 Controllers

#### Authentication
- **`app/controllers/authController.js`** - Control de autenticación de usuarios (registro, login, perfil)

#### Utilities
- **`app/controllers/utilities/bankController.js`** - Obtener información de bancos por país
- **`app/controllers/utilities/countryController.js`** - Obtener información de países

#### Management
- **`app/controllers/management/bankAccountController.js`** - Gestión de cuentas bancarias de usuarios (CRUD, activar/desactivar, borrado lógico)

### 🎯 Models

#### Core Models
- **`app/models/User.js`** - Modelo de usuario con validaciones de email y contraseña
- **`app/models/Country.js`** - Modelo de países con códigos ISO y información geográfica
- **`app/models/Bank.js`** - Modelo de bancos con información por país
- **`app/models/BankAccount.js`** - Modelo de cuentas bancarias de usuarios con borrado lógico

### 🎯 Routes
- **`app/routes/auth.js`** - Rutas de autenticación
- **`app/routes/utilities.js`** - Rutas de utilidades (países y bancos)
- **`app/routes/management.js`** - Rutas de gestión de cuentas bancarias

### 🎯 Configuration & Utils
- **`app/config/database.js`** - Configuración de conexión a MongoDB
- **`app/config/jwt.js`** - Configuración de JWT
- **`app/middleware/auth.js`** - Middleware de autenticación
- **`app/utils/jwt.js`** - Utilidades para manejo de JWT
- **`app/utils/logger.js`** - Sistema de logging
- **`app/utils/seed.js`** - Seed de datos iniciales

### 🎯 Data & Testing
- **`app/data/`** - Archivos JSON con datos iniciales de países, bancos y usuarios
- **`app/postman/`** - Colección de Postman actualizada con todos los endpoints
- **`app/tests/`** - Pruebas unitarias y de integración

---
