-- Base de datos ShoeShopSport
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS shoeshopsport CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shoeshopsport;

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    imagen VARCHAR(255),
    stock INT DEFAULT 100,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de usuarios (clientes y administradores)
CREATE TABLE IF NOT EXISTS usuarios (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de contactos
CREATE TABLE IF NOT EXISTS contactos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    asunto VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente', 'respondido') DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    cliente_nombre VARCHAR(255) NOT NULL,
    cliente_email VARCHAR(255) NOT NULL,
    cliente_telefono VARCHAR(50),
    direccion TEXT,
    total DECIMAL(10, 2) NOT NULL,
    estado ENUM('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado') DEFAULT 'pendiente',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de detalles de pedidos
CREATE TABLE IF NOT EXISTS pedido_detalles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_nombre VARCHAR(255) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    cantidad INT NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar datos de ejemplo de productos
INSERT INTO productos (nombre, descripcion, precio, imagen, stock) VALUES
('Zapatilla Deportiva Clásica', 'Zapatilla cómoda y resistente, perfecta para entrenamientos diarios y actividades deportivas.', 89.99, 'img/photo-1515955656352-a1fa3ffcd111.webp', 50),
('Zapatilla Running Pro', 'Diseñada para corredores profesionales con amortiguación avanzada y tecnología de agarre superior.', 129.99, 'img/photo-1539185441755-769473a23570.webp', 30),
('Zapatilla Urban Style', 'Estilo urbano con comodidad deportiva, ideal para el día a día y actividades casuales.', 75.99, 'img/photo-1542291026-7eec264c27ff.webp', 75),
('Zapatilla Trail Mountain', 'Perfecta para senderismo y terrenos difíciles con tracción extrema y protección robusta.', 139.99, 'img/photo-1561909848-977d0617f275.webp', 40),
('Zapatilla Fitness Training', 'Diseñada especialmente para entrenamientos de fitness con máxima estabilidad lateral.', 99.99, 'img/photo-1562424995-2efe650421dd.webp', 60),
('Zapatilla Basketball Elite', 'Zapatilla de baloncesto de alto rendimiento con tecnología de salto mejorado.', 149.99, 'img/photo-1571601035754-5c927f2d7edc.webp', 25),
('Zapatilla Water Sports', 'Especialmente diseñada para deportes acuáticos con drenaje rápido y agarre en superficies mojadas.', 85.99, 'img/photo-1576491110919-df70d852860f.webp', 45),
('Zapatilla Casual Comfort', 'Comodidad máxima para uso casual con diseño moderno y transpirable.', 69.99, 'img/photo-1595950653106-6c9ebd614d3a.webp', 100),
('Zapatilla Sprint Racing', 'Diseñada para velocidad y rendimiento en competiciones de atletismo profesional.', 159.99, 'img/photo-1600185365483-26d7a4cc7519.webp', 20);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_productos_precio ON productos(precio);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha);
CREATE INDEX idx_contactos_fecha ON contactos(fecha);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- Insertar usuarios de ejemplo
-- Password para todos: admin123 (hash bcrypt con cost 10)
INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES
('Administrador', 'admin@shoeshopsport.com', '$2y$10$HuR2YdC5k8ubLcP4ZR/Wie.jw6vLpR4aFIFYwvB.dUCfyBtlEqRs2', 'admin', TRUE),
('Cliente Demo', 'cliente@demo.com', '$2y$10$HuR2YdC5k8ubLcP4ZR/Wie.jw6vLpR4aFIFYwvB.dUCfyBtlEqRs2', 'cliente', TRUE);
