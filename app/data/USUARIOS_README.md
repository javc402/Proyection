# 🔐 USUARIOS DE PRUEBA - PROYECTION API

## 📋 Lista de Usuarios

| Email | Contraseña | Rol | Estado | País |
|-------|------------|-----|--------|------|
| admin@proyection.com | password123 | admin | activo | Colombia |
| juan.perez@gmail.com | password123 | user | activo | Colombia |
| maria.garcia@hotmail.com | password123 | user | activo | Colombia |
| carlos.rodriguez@yahoo.com | password123 | user | activo | Estados Unidos |
| ana.martinez@outlook.com | password123 | user | inactivo | España |

## 🔑 Información de Hash

**Todas las contraseñas están hasheadas con bcrypt usando el salt rounds = 10**

- **Contraseña original**: `password123`
- **Hash generado**: `$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi`

## 🗄️ Comandos para MongoDB

### Usar MongoDB Compass (Recomendado)
1. Conectar a: `mongodb://localhost:27017`
2. Crear/seleccionar base de datos: `proyection`
3. Crear colección: `users`
4. Importar el archivo `users.json`

### Usar MongoDB Shell (mongosh)
```bash
# Conectar a MongoDB
mongosh

# Usar la base de datos
use proyection

# Insertar usuarios desde archivo
load('C:/Users/jvillalo/source/repos/Proyection/app/data/users.json')

# O insertar manualmente:
db.users.insertMany([
  // Copiar el contenido del archivo users.json aquí
])
```

### Usar MongoDB CLI con archivo
```bash
# Importar desde archivo JSON
mongoimport --db proyection --collection users --file "C:\Users\jvillalo\source\repos\Proyection\app\data\users.json" --jsonArray
```

## ✅ Verificación

```javascript
// Verificar que los usuarios se insertaron correctamente
db.users.find().pretty()

// Contar usuarios
db.users.countDocuments()

// Buscar por email
db.users.findOne({email: "admin@proyection.com"})
```

## 🧪 Testing del Login

Puedes usar cualquiera de estos usuarios para probar el login:

```bash
# Ejemplo con curl
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@proyection.com",
    "password": "password123"
  }'
```

## 🔄 Regenerar Contraseñas

Si necesitas cambiar las contraseñas, usa este código en Node.js:

```javascript
const bcrypt = require('bcryptjs');

// Generar nuevo hash
const password = 'tu_nueva_contraseña';
const saltRounds = 10;
const hash = bcrypt.hashSync(password, saltRounds);
console.log('Nuevo hash:', hash);
```
