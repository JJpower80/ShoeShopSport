# Guía Rápida de Integración PHP

## ✅ Cambios Realizados

### Archivos Creados:
1. **api-client.js** - Cliente JavaScript para comunicarse con la API PHP
2. **php/** - Carpeta con todos los endpoints PHP
3. **database/shoeshopsport.sql** - Base de datos completa

### Archivos Modificados:
1. **index.html** - Agregado script api-client.js
2. **script.js** - Integrado con API PHP para:
   - Cargar productos desde BD
   - Gestionar carrito con sesiones PHP
   - Enviar formulario de contacto
   - Crear pedidos

## 🚀 Cómo Probarlo

### 1. Importar Base de Datos
```bash
# Opción 1: phpMyAdmin
- Abre http://localhost/phpmyadmin
- Importa: database/shoeshopsport.sql

# Opción 2: Terminal
mysql -u root -p < database/shoeshopsport.sql
```

### 2. Configurar PHP
Edita `php/config.php` si necesitas cambiar credenciales:
```php
define('DB_USER', 'root');
define('DB_PASS', ''); // tu contraseña
```

### 3. Iniciar Servidor
```bash
# Con XAMPP/MAMP/Laragon
- Copia el proyecto a htdocs/www
- Accede a: http://localhost/ShoeShopSport/

# Con PHP Built-in Server
cd "Web ShoeShopSport"
php -S localhost:8000
```

### 4. Probar Funcionalidades

**Productos (Automático):**
- Los productos se cargan ahora desde MySQL
- Ya hay 9 productos precargados en la BD

**Carrito:**
- Agregar productos → Se guarda en sesión PHP
- Cambiar cantidades → Actualiza en servidor
- Eliminar productos → Sincroniza con PHP
- Vaciar carrito → Limpia sesión

**Contacto:**
- Llenar formulario → Se guarda en tabla `contactos`
- Ver en phpMyAdmin los mensajes recibidos

**Pedidos:**
- Click en "Finalizar Compra"
- Ingresar datos del cliente
- Se crea registro en tabla `pedidos`

## 🔍 Verificar en phpMyAdmin

```sql
-- Ver productos
SELECT * FROM productos;

-- Ver mensajes de contacto
SELECT * FROM contactos ORDER BY fecha DESC;

-- Ver pedidos
SELECT p.*, 
       GROUP_CONCAT(pd.producto_nombre) as productos
FROM pedidos p
LEFT JOIN pedido_detalles pd ON p.id = pd.pedido_id
GROUP BY p.id;
```

## 🎯 Próximas Mejoras Recomendadas

1. **Autenticación de usuarios**
   - Sistema de login/registro
   - Panel de usuario con historial de pedidos

2. **Panel de administración**
   - Gestionar productos (CRUD completo)
   - Ver y gestionar pedidos
   - Responder mensajes de contacto

3. **Pasarela de pago**
   - Integración con Stripe/PayPal
   - Confirmación por email

4. **Mejoras de seguridad**
   - Validación de tokens CSRF
   - Sanitización de inputs
   - Rate limiting

## 📝 Estructura Actual

```
/ShoeShopSport/
  ├── index.html           ✅ Frontend (funciona sin servidor)
  ├── api-client.js        ✅ Nuevo - Cliente API
  ├── script.js            ✅ Modificado - Integrado con PHP
  ├── styles.css           ✓ Sin cambios
  ├── img/                 ✓ Sin cambios
  ├── php/                 ✅ Nuevo - Backend completo
  │   ├── config.php
  │   ├── productos.php
  │   ├── carrito.php
  │   ├── contacto.php
  │   └── pedidos.php
  └── database/            ✅ Nuevo
      └── shoeshopsport.sql
```

## 🐛 Resolución de Problemas

**Error: "No se puede conectar a la BD"**
- Verifica que MySQL esté corriendo
- Revisa credenciales en config.php
- Comprueba que la BD exista

**Error: "Fetch failed"**
- Asegúrate de estar usando http://localhost (no file://)
- Verifica que PHP esté corriendo
- Revisa la consola del navegador

**Carrito vacío al recargar**
- Normal si usas PHP built-in server sin cookies
- En XAMPP/MAMP las sesiones persisten correctamente

## 💡 Consejos

- Usa la consola del navegador (F12) para ver errores
- Revisa Network tab para ver las peticiones a PHP
- Los datos ahora persisten en BD, no en localStorage
- El carrito usa sesiones PHP (más seguro)

¡Todo listo para usar! 🎉
