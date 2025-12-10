<?php
/**
 * API para gestión de productos
 */

header('Content-Type: application/json');
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            // Obtener todos los productos o uno específico
            if (isset($_GET['id'])) {
                $stmt = $pdo->prepare("SELECT * FROM productos WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                $producto = $stmt->fetch();
                
                if ($producto) {
                    echo json_encode([
                        'success' => true,
                        'data' => $producto
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Producto no encontrado'
                    ]);
                }
            } else {
                // Obtener todos los productos
                $stmt = $pdo->query("SELECT * FROM productos ORDER BY id ASC");
                $productos = $stmt->fetchAll();
                
                echo json_encode([
                    'success' => true,
                    'data' => $productos
                ]);
            }
            break;
            
        case 'POST':
            // Crear nuevo producto (requiere autenticación de admin)
            if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['rol'] !== 'admin') {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Acceso denegado. Solo administradores pueden crear productos.'
                ]);
                exit;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("
                INSERT INTO productos (nombre, descripcion, precio, imagen, stock) 
                VALUES (?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $data['nombre'],
                $data['descripcion'],
                $data['precio'],
                $data['imagen'],
                $data['stock'] ?? 100
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Producto creado exitosamente',
                'id' => $pdo->lastInsertId()
            ]);
            break;
            
        case 'PUT':
            // Actualizar producto existente (requiere autenticación de admin)
            if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['rol'] !== 'admin') {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Acceso denegado. Solo administradores pueden actualizar productos.'
                ]);
                exit;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("
                UPDATE productos 
                SET nombre = ?, descripcion = ?, precio = ?, imagen = ?, stock = ?
                WHERE id = ?
            ");
            
            $stmt->execute([
                $data['nombre'],
                $data['descripcion'],
                $data['precio'],
                $data['imagen'],
                $data['stock'],
                $data['id']
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Producto actualizado exitosamente'
            ]);
            break;
            
        case 'DELETE':
            // Eliminar producto (requiere autenticación de admin)
            if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['rol'] !== 'admin') {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Acceso denegado. Solo administradores pueden eliminar productos.'
                ]);
                exit;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("DELETE FROM productos WHERE id = ?");
            $stmt->execute([$data['id']]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Producto eliminado exitosamente'
            ]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Método no permitido'
            ]);
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error en la base de datos: ' . $e->getMessage()
    ]);
}
?>
