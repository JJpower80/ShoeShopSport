# ShoeShopSport - Integración PHP

## Instalación de la Base de Datos

### 1. Requisitos previos
- PHP 7.4 o superior
- MySQL 5.7 o superior (o MariaDB)
- Servidor web (Apache/XAMPP/MAMP/Laragon)

### 2. Importar la base de datos

**Opción A: Usando phpMyAdmin**
1. Abre phpMyAdmin (http://localhost/phpmyadmin)
2. Crea una nueva base de datos llamada `shoeshopsport`
3. Selecciona la base de datos
4. Ve a la pestaña "Importar"
5. Selecciona el archivo `database/shoeshopsport.sql`
6. Haz clic en "Continuar"

**Opción B: Usando línea de comandos**
```bash
mysql -u root -p < database/shoeshopsport.sql
```

### 3. Configurar la conexión

Edita `php/config.php` con tus credenciales:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'shoeshopsport');
define('DB_USER', 'root');      // Tu usuario de MySQL
define('DB_PASS', '');          // Tu contraseña de MySQL
```

### 4. Estructura del proyecto

```
/ShoeShopSport/
  ├── index.html          # Frontend principal
  ├── styles.css          # Estilos
  ├── script.js           # JavaScript frontend
  ├── img/                # Imágenes
  ├── php/                # Backend PHP
  │   ├── config.php      # Configuración BD
  │   ├── productos.php   # API productos
  │   ├── carrito.php     # API carrito
  │   ├── contacto.php    # API contacto
  │   └── pedidos.php     # API pedidos
  └── database/           # Scripts SQL
      └── shoeshopsport.sql
```

## API Endpoints

### Productos
- `GET php/productos.php` - Obtener todos los productos
- `GET php/productos.php?id=1` - Obtener producto específico
- `POST php/productos.php` - Crear producto
- `PUT php/productos.php` - Actualizar producto
- `DELETE php/productos.php` - Eliminar producto

### Carrito
- `GET php/carrito.php` - Obtener carrito actual
- `POST php/carrito.php` - Agregar producto al carrito
- `PUT php/carrito.php` - Actualizar cantidad
- `DELETE php/carrito.php` - Eliminar producto o vaciar carrito

### Contacto
- `POST php/contacto.php` - Enviar formulario de contacto

### Pedidos
- `GET php/pedidos.php` - Obtener todos los pedidos
- `GET php/pedidos.php?id=1` - Obtener pedido específico
- `POST php/pedidos.php` - Crear nuevo pedido

## Próximos pasos

### Para integrar con el frontend actual:

1. **Cambiar index.html a index.php** (opcional, si quieres usar PHP en el HTML)

2. **Modificar script.js** para cargar productos desde la BD:
```javascript
// En lugar de productos hardcodeados, hacer:
fetch('php/productos.php')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            renderizarProductos(data.data);
        }
    });
```

3. **Integrar carrito con sesión PHP**:
```javascript
function agregarAlCarrito(nombre, precio) {
    fetch('php/carrito.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, precio, cantidad: 1 })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            actualizarCarritoUI();
        }
    });
}
```

4. **Conectar formulario de contacto**:
```javascript
contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    fetch('php/contacto.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            asunto: document.getElementById('asunto').value,
            mensaje: document.getElementById('mensaje').value
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion(data.message);
            contactForm.reset();
        }
    });
});
```

## Pruebas

Puedes probar los endpoints con:
- **Navegador**: Para peticiones GET
- **Postman**: Para todas las peticiones
- **cURL**: Línea de comandos

Ejemplo con cURL:
```bash
# Obtener productos
curl http://localhost/ShoeShopSport/php/productos.php

# Agregar al carrito
curl -X POST http://localhost/ShoeShopSport/php/carrito.php \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Zapatilla Test","precio":99.99,"cantidad":1}'
```

## Notas importantes

- Los archivos PHP deben ejecutarse desde un servidor web (no abrir directamente)
- Asegúrate de que las sesiones estén habilitadas en PHP
- Para producción, agrega validación de seguridad adicional
- Considera agregar autenticación para operaciones sensibles
