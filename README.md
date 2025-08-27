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


## ✍️ Nuevo archivo

Siempre que se incie un nuevo archivo se debe incluir esta línea:

[// Instrucciones para Copilot: seguir prompt_func.md]

> **Nota:** Copilot siempre debe poner esta línea cuando cree un nuevo archivo ademas de incluir documentación estandar de cada metodo y clase que se cree