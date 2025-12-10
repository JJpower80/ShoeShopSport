<?php
/**
 * API para gestión del carrito de compras
 */

header('Content-Type: application/json');
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            // Obtener carrito de la sesión
            $carrito = $_SESSION['carrito'] ?? [];
            
            echo json_encode([
                'success' => true,
                'data' => $carrito,
                'total_items' => array_sum(array_column($carrito, 'cantidad')),
                'total_precio' => array_sum(array_map(function($item) {
                    return $item['precio'] * $item['cantidad'];
                }, $carrito))
            ]);
            break;
            
        case 'POST':
            // Agregar producto al carrito
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($_SESSION['carrito'])) {
                $_SESSION['carrito'] = [];
            }
            
            // Buscar si el producto ya existe en el carrito
            $existe = false;
            foreach ($_SESSION['carrito'] as &$item) {
                if ($item['nombre'] === $data['nombre']) {
                    $item['cantidad'] += $data['cantidad'] ?? 1;
                    $existe = true;
                    break;
                }
            }
            
            // Si no existe, agregarlo
            if (!$existe) {
                $_SESSION['carrito'][] = [
                    'id' => uniqid(),
                    'nombre' => $data['nombre'],
                    'precio' => $data['precio'],
                    'cantidad' => $data['cantidad'] ?? 1
                ];
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Producto agregado al carrito',
                'carrito' => $_SESSION['carrito']
            ]);
            break;
            
        case 'PUT':
            // Actualizar cantidad de un producto en el carrito
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (isset($_SESSION['carrito'])) {
                foreach ($_SESSION['carrito'] as &$item) {
                    if ($item['id'] === $data['id']) {
                        $item['cantidad'] = $data['cantidad'];
                        break;
                    }
                }
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Cantidad actualizada',
                'carrito' => $_SESSION['carrito']
            ]);
            break;
            
        case 'DELETE':
            // Eliminar producto del carrito o vaciar todo
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (isset($data['vaciar']) && $data['vaciar'] === true) {
                // Vaciar todo el carrito
                $_SESSION['carrito'] = [];
                $message = 'Carrito vaciado';
            } else {
                // Eliminar un producto específico
                if (isset($_SESSION['carrito'])) {
                    $_SESSION['carrito'] = array_filter($_SESSION['carrito'], function($item) use ($data) {
                        return $item['id'] !== $data['id'];
                    });
                    $_SESSION['carrito'] = array_values($_SESSION['carrito']); // Reindexar
                }
                $message = 'Producto eliminado del carrito';
            }
            
            echo json_encode([
                'success' => true,
                'message' => $message,
                'carrito' => $_SESSION['carrito'] ?? []
            ]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Método no permitido'
            ]);
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
