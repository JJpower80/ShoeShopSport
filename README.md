# ShoeShopSport

Una tienda en línea completa para zapatos deportivos, desarrollada con tecnologías web modernas. Incluye un frontend responsivo en HTML, CSS y JavaScript, y un backend robusto en PHP con base de datos MySQL.

## 🚀 Características Principales

- **Catálogo de Productos**: Visualización de zapatos deportivos con filtros y búsqueda
- **Carrito de Compras**: Gestión completa del carrito con sesiones PHP
- **Sistema de Autenticación**: Registro y login de usuarios, con roles de cliente y administrador
- **Panel de Administración**: CRUD completo de productos para administradores
- **Gestión de Pedidos**: Creación y seguimiento de pedidos vinculados a usuarios
- **Formulario de Contacto**: Envío de mensajes con validación
- **Diseño Responsivo**: Optimizado para dispositivos móviles y desktop

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con Flexbox y Grid
- **JavaScript (ES6+)**: Interactividad y comunicación con API

### Backend
- **PHP 7.4+**: Lógica del servidor y APIs REST
- **MySQL 5.7+**: Base de datos relacional

### Herramientas de Desarrollo
- **XAMPP/MAMP/Laragon**: Entorno de desarrollo local
- **phpMyAdmin**: Gestión de base de datos
- **Git**: Control de versiones

## 📋 Requisitos del Sistema

- PHP 7.4 o superior
- MySQL 5.7 o superior (o MariaDB)
- Servidor web (Apache recomendado)
- Navegador web moderno

## 🔧 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/ShoeShopSport.git
cd ShoeShopSport
```

### 2. Configurar la Base de Datos
- Importa el archivo `database/shoeshopsport.sql` en MySQL
- Crea una base de datos llamada `shoeshopsport`

### 3. Configurar la Conexión PHP
Edita el archivo `php/config.php` con tus credenciales de base de datos:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'shoeshopsport');
define('DB_USER', 'tu_usuario');
define('DB_PASS', 'tu_contraseña');
```

### 4. Iniciar el Servidor
- Coloca el proyecto en el directorio raíz de tu servidor web (ej: `htdocs` en XAMPP)
- Accede a `http://localhost/ShoeShopSport/`

## 📖 Uso

### Para Clientes
1. **Navegar el Catálogo**: Explora los productos disponibles
2. **Agregar al Carrito**: Haz clic en "Agregar al Carrito" en cualquier producto
3. **Gestionar Carrito**: Revisa y modifica los items en el carrito
4. **Realizar Compra**: Completa el formulario de pedido (requiere login)
5. **Contacto**: Usa el formulario de contacto para consultas

### Para Administradores
1. **Iniciar Sesión**: Usa las credenciales de administrador
2. **Acceder al Panel**: Haz clic en "Panel Admin"
3. **Gestionar Productos**: Crear, editar o eliminar productos

### Credenciales de Prueba
- **Administrador**: `admin@shoeshopsport.com` / `admin123`
- **Cliente Demo**: `cliente@demo.com` / `admin123`

## 📁 Estructura del Proyecto

```
ShoeShopSport/
├── index.html              # Página principal
├── styles.css              # Estilos CSS
├── script.js               # JavaScript del frontend
├── api-client.js           # Cliente para API PHP
├── database/
│   └── shoeshopsport.sql   # Script de base de datos
├── img/                    # Imágenes del proyecto
├── php/                    # Backend PHP
│   ├── config.php          # Configuración de BD
│   ├── auth.php            # Autenticación y usuarios
│   ├── productos.php       # API de productos
│   ├── carrito.php         # Gestión del carrito
│   ├── pedidos.php         # Gestión de pedidos
│   └── contacto.php        # Formulario de contacto
├── README.md               # Este archivo
├── README_PHP.md           # Guía de integración PHP
├── README_AUTH.md          # Documentación de autenticación
└── INTEGRACION.md          # Guía rápida de integración
```

## 🔗 Documentación Adicional

- **[README_PHP.md](README_PHP.md)**: Instalación detallada de PHP y base de datos
- **[README_AUTH.md](README_AUTH.md)**: Sistema de autenticación y roles
- **[INTEGRACION.md](INTEGRACION.md)**: Guía de integración frontend-backend

## 🤝 Contribución

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Solución de Problemas

### Error de Conexión a BD
- Verifica que MySQL esté ejecutándose
- Revisa las credenciales en `php/config.php`
- Asegúrate de que la base de datos `shoeshopsport` existe

### Problemas con Permisos
- Asegúrate de que el directorio del proyecto tenga permisos de escritura
- Para sesiones PHP, verifica que `php/session_save_path` sea accesible

### Errores 404 en APIs
- Confirma que el servidor web esté configurado para procesar archivos PHP
- Verifica las rutas en `api-client.js`

## 📞 Contacto

Para preguntas o soporte, usa el formulario de contacto en la aplicación o abre un issue en GitHub.</content>
<parameter name="filePath">/Users/jjpower80/Desktop/DAW/Compartida 2º DAW/Trabajos de Enfoque 2º/Desarrollo Web Entorno Servidor/ShoeShopSport-main/README.md
