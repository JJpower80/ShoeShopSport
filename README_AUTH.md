# Sistema de Autenticación - ShoeShopSport

## 🔐 Funcionalidades Implementadas

### Para Clientes:
- **Registro de Cuenta**: Los clientes pueden crear su cuenta proporcionando nombre, email, contraseña, teléfono (opcional) y dirección (opcional).
- **Inicio de Sesión**: Login con email y contraseña.
- **Gestión de Perfil**: Los clientes pueden actualizar su información personal.
- **Compras con Cuenta**: Los pedidos se vinculan automáticamente al usuario logueado.

### Para Administradores:
- **Panel de Administración**: Acceso exclusivo para gestionar productos.
- **CRUD de Productos**: Crear, editar, actualizar y eliminar productos desde el panel.
- **Protección de Endpoints**: Solo los administradores pueden modificar productos (POST, PUT, DELETE protegidos).

## 🚀 Uso del Sistema

### Credenciales de Prueba

**Administrador:**
- Email: `admin@shoeshopsport.com`
- Password: `admin123`

**Cliente Demo:**
- Email: `cliente@demo.com`
- Password: `admin123`

### Flujo de Cliente

1. **Registro**: Haz clic en "Iniciar Sesión" → "Regístrate aquí" → Completa el formulario.
2. **Login**: Ingresa con tu email y contraseña.
3. **Comprar**: Agrega productos al carrito y finaliza la compra. Tus datos se autocompletarán.
4. **Cerrar Sesión**: Haz clic en "Cerrar Sesión" en la barra superior.

### Flujo de Administrador

1. **Login**: Inicia sesión con las credenciales de administrador.
2. **Abrir Panel**: Haz clic en el botón "Panel Admin" que aparece al lado de tu nombre.
3. **Gestionar Productos**:
   - **Crear**: Completa el formulario y haz clic en "Guardar Producto".
   - **Editar**: Haz clic en "Editar" junto al producto deseado, modifica los campos y guarda.
   - **Eliminar**: Haz clic en "Eliminar" y confirma.
4. **Cerrar Panel**: Haz clic en la "X" en la esquina superior derecha del panel.

## 📁 Estructura de Archivos

### Backend (PHP)
- **`php/auth.php`**: Endpoints de autenticación (registro, login, logout, perfil, actualización).
- **`php/productos.php`**: CRUD de productos con protección de admin para POST/PUT/DELETE.
- **`php/pedidos.php`**: Creación de pedidos vinculados a usuarios logueados.
- **`php/config.php`**: Configuración de base de datos y gestión de sesiones.

### Frontend
- **`index.html`**: Incluye modales de login/registro y panel de administración.
- **`script.js`**: Lógica de autenticación, gestión de sesiones y panel admin.
- **`api-client.js`**: Cliente API con métodos para auth (`API.auth.*`).
- **`styles.css`**: Estilos para modales, panel admin e info de usuario.

### Base de Datos
- **`database/shoeshopsport.sql`**: Incluye tabla `usuarios` con roles (cliente/admin) y relación con `pedidos`.

## 🔒 Seguridad

- **Passwords Encriptados**: Se usa `password_hash()` con bcrypt (cost 10).
- **Sesiones PHP**: La autenticación se maneja mediante `$_SESSION`.
- **Protección de Endpoints**: Los endpoints críticos verifican `$_SESSION['usuario']['rol']`.
- **Validaciones**: Email válido, campos obligatorios, unicidad de email en registro.

## 🗄️ Tabla de Usuarios

```sql
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    direccion TEXT,
    rol ENUM('cliente', 'admin') DEFAULT 'cliente',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_conexion TIMESTAMP NULL,
    activo BOOLEAN DEFAULT TRUE
);
```

### Relación con Pedidos
La tabla `pedidos` ahora incluye:
- `usuario_id INT NULL`: Referencia al usuario logueado que realizó el pedido.
- `FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL`

## 🧪 Testing

### Probar Registro:
1. Abre `http://localhost/WebShoeShopSport/`.
2. Haz clic en "Iniciar Sesión" → "Regístrate aquí".
3. Completa el formulario con tus datos.
4. Verifica que aparezca tu nombre en la barra superior.

### Probar Login de Admin:
1. Inicia sesión con `admin@shoeshopsport.com` / `admin123`.
2. Verifica que aparezca el botón "Panel Admin".
3. Abre el panel y prueba crear/editar/eliminar un producto.

### Probar API vía cURL:

**Login:**
```bash
curl -X POST 'http://localhost/WebShoeShopSport/php/auth.php?action=login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@shoeshopsport.com","password":"admin123"}'
```

**Registro:**
```bash
curl -X POST 'http://localhost/WebShoeShopSport/php/auth.php?action=registro' \
  -H 'Content-Type: application/json' \
  -d '{
    "nombre":"Nuevo Usuario",
    "email":"nuevo@ejemplo.com",
    "password":"mipassword123",
    "telefono":"612345678",
    "direccion":"Calle Ejemplo 123"
  }'
```

**Logout:**
```bash
curl -X POST 'http://localhost/WebShoeShopSport/php/auth.php?action=logout'
```

## 📝 Notas Importantes

- **Sesiones**: Las sesiones PHP se inician automáticamente en `config.php`.
- **Cookies**: Asegúrate de que las cookies estén habilitadas en el navegador.
- **Permisos**: Los archivos PHP deben tener permisos de lectura/escritura para gestionar sesiones.
- **Base de Datos**: Ejecuta el script `database/shoeshopsport.sql` para crear todas las tablas necesarias.

## 🎨 Personalización

Para cambiar las credenciales de admin o agregar más usuarios:

1. Genera un nuevo hash de password:
   ```bash
   /Applications/XAMPP/xamppfiles/bin/php -r "echo password_hash('tupassword', PASSWORD_BCRYPT);"
   ```

2. Inserta el usuario en la base de datos:
   ```sql
   INSERT INTO usuarios (nombre, email, password, rol, activo) 
   VALUES ('Nombre', 'email@ejemplo.com', 'HASH_GENERADO', 'admin', TRUE);
   ```

---

**Desarrollado por JJDev** - ShoeShopSport © 2025
