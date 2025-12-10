<?php
/**
 * API para gestión de pedidos
 */

header('Content-Type: application/json');
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'POST':
            // Crear nuevo pedido desde el carrito
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validar que haya productos en el carrito
            if (empty($data['productos'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'El carrito está vacío'
                ]);
                exit;
            }
            
            // Calcular total
            $total = 0;
            foreach ($data['productos'] as $producto) {
                $total += $producto['precio'] * $producto['cantidad'];
            }
            
            // Iniciar transacción
            $pdo->beginTransaction();
            
            // Datos del cliente (puede venir del usuario logueado o del formulario)
            $usuario_id = $_SESSION['usuario']['id'] ?? null;
            $cliente_nombre = $data['cliente']['nombre'] ?? $_SESSION['usuario']['nombre'] ?? 'Cliente';
            $cliente_email = $data['cliente']['email'] ?? $_SESSION['usuario']['email'] ?? '';
            $cliente_telefono = $data['cliente']['telefono'] ?? $_SESSION['usuario']['telefono'] ?? '';
            $direccion = $data['cliente']['direccion'] ?? $_SESSION['usuario']['direccion'] ?? '';
            
            // Insertar pedido
            $stmt = $pdo->prepare("
                INSERT INTO pedidos (usuario_id, cliente_nombre, cliente_email, cliente_telefono, 
                                     direccion, total, estado, fecha) 
                VALUES (?, ?, ?, ?, ?, ?, 'pendiente', NOW())
            ");
            
            $stmt->execute([
                $usuario_id,
                $cliente_nombre,
                $cliente_email,
                $cliente_telefono,
                $direccion,
                $total
            ]);
            
            $pedido_id = $pdo->lastInsertId();
            
            // Insertar detalles del pedido
            $stmt = $pdo->prepare("
                INSERT INTO pedido_detalles (pedido_id, producto_nombre, precio, cantidad) 
                VALUES (?, ?, ?, ?)
            ");
            
            foreach ($data['productos'] as $producto) {
                $stmt->execute([
                    $pedido_id,
                    $producto['nombre'],
                    $producto['precio'],
                    $producto['cantidad']
                ]);
            }
            
            // Confirmar transacción
            $pdo->commit();
            
            // Limpiar carrito de la sesión
            $_SESSION['carrito'] = [];
            
            echo json_encode([
                'success' => true,
                'message' => 'Pedido realizado exitosamente',
                'pedido_id' => $pedido_id,
                'total' => $total
            ]);
            break;
            
        case 'GET':
            // Obtener pedidos (requiere autenticación)
            if (isset($_GET['id'])) {
                // Obtener un pedido específico
                $stmt = $pdo->prepare("
                    SELECT p.*, 
                           GROUP_CONCAT(
                               CONCAT(pd.producto_nombre, ' (x', pd.cantidad, ')') 
                               SEPARATOR ', '
                           ) as productos
                    FROM pedidos p
                    LEFT JOIN pedido_detalles pd ON p.id = pd.pedido_id
                    WHERE p.id = ?
                    GROUP BY p.id
                ");
                $stmt->execute([$_GET['id']]);
                $pedido = $stmt->fetch();
                
                if ($pedido) {
                    echo json_encode([
                        'success' => true,
                        'data' => $pedido
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Pedido no encontrado'
                    ]);
                }
            } else {
                // Obtener todos los pedidos
                $stmt = $pdo->query("
                    SELECT p.*, 
                           COUNT(pd.id) as num_productos
                    FROM pedidos p
                    LEFT JOIN pedido_detalles pd ON p.id = pd.pedido_id
                    GROUP BY p.id
                    ORDER BY p.fecha DESC
                ");
                $pedidos = $stmt->fetchAll();
                
                echo json_encode([
                    'success' => true,
                    'data' => $pedidos
                ]);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Método no permitido'
            ]);
    }
} catch(PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al procesar el pedido: ' . $e->getMessage()
    ]);
}
?>
