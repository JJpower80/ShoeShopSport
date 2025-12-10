<?php
/**
 * API para autenticación y gestión de usuarios
 */

header('Content-Type: application/json');
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    switch($method) {
        case 'POST':
            if ($action === 'registro') {
                // Registro de nuevo cliente
                $data = json_decode(file_get_contents('php://input'), true);
                
                // Validar datos requeridos
                if (empty($data['nombre']) || empty($data['email']) || empty($data['password'])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Faltan campos obligatorios'
                    ]);
                    exit;
                }
                
                // Validar email
                if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Email no válido'
                    ]);
                    exit;
                }
                
                // Verificar si el email ya existe
                $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
                $stmt->execute([$data['email']]);
                if ($stmt->fetch()) {
                    http_response_code(409);
                    echo json_encode([
                        'success' => false,
                        'message' => 'El email ya está registrado'
                    ]);
                    exit;
                }
                
                // Encriptar contraseña
                $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);
                
                // Insertar nuevo usuario
                $stmt = $pdo->prepare("
                    INSERT INTO usuarios (nombre, email, password, telefono, direccion, rol) 
                    VALUES (?, ?, ?, ?, ?, 'cliente')
                ");
                
                $stmt->execute([
                    $data['nombre'],
                    $data['email'],
                    $passwordHash,
                    $data['telefono'] ?? null,
                    $data['direccion'] ?? null
                ]);
                
                $usuario_id = $pdo->lastInsertId();
                
                // Obtener usuario creado
                $stmt = $pdo->prepare("SELECT id, nombre, email, telefono, direccion, rol FROM usuarios WHERE id = ?");
                $stmt->execute([$usuario_id]);
                $usuario = $stmt->fetch();
                
                // Guardar en sesión
                $_SESSION['usuario'] = $usuario;
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Registro exitoso',
                    'usuario' => $usuario
                ]);
                
            } elseif ($action === 'login') {
                // Login de usuario
                $data = json_decode(file_get_contents('php://input'), true);
                
                // Validar datos
                if (empty($data['email']) || empty($data['password'])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Email y contraseña son obligatorios'
                    ]);
                    exit;
                }
                
                // Buscar usuario
                $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ? AND activo = TRUE");
                $stmt->execute([$data['email']]);
                $usuario = $stmt->fetch();
                
                // Debug: verificar si se encontró el usuario
                if (!$usuario) {
                    http_response_code(401);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Credenciales inválidas',
                        'debug' => 'Usuario no encontrado o inactivo'
                    ]);
                    exit;
                }
                
                // Verificar password
                if (!password_verify($data['password'], $usuario['password'])) {
                    http_response_code(401);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Credenciales inválidas',
                        'debug' => 'Password incorrecto'
                    ]);
                    exit;
                }
                
                // Actualizar última conexión
                $stmt = $pdo->prepare("UPDATE usuarios SET ultima_conexion = NOW() WHERE id = ?");
                $stmt->execute([$usuario['id']]);
                
                // Guardar en sesión (sin password)
                unset($usuario['password']);
                $_SESSION['usuario'] = $usuario;
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Login exitoso',
                    'usuario' => $usuario
                ]);
                
            } elseif ($action === 'logout') {
                // Cerrar sesión
                $_SESSION['usuario'] = null;
                unset($_SESSION['usuario']);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Sesión cerrada'
                ]);
                
            } else {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Acción no válida'
                ]);
            }
            break;
            
        case 'GET':
            if ($action === 'perfil') {
                // Obtener perfil del usuario actual
                if (isset($_SESSION['usuario'])) {
                    echo json_encode([
                        'success' => true,
                        'usuario' => $_SESSION['usuario']
                    ]);
                } else {
                    http_response_code(401);
                    echo json_encode([
                        'success' => false,
                        'message' => 'No hay sesión activa'
                    ]);
                }
            } else {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Acción no válida'
                ]);
            }
            break;
            
        case 'PUT':
            // Actualizar perfil del usuario
            if (!isset($_SESSION['usuario'])) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'message' => 'No autenticado'
                ]);
                exit;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            $usuario_id = $_SESSION['usuario']['id'];
            
            // Preparar campos a actualizar
            $campos = [];
            $valores = [];
            
            if (isset($data['nombre'])) {
                $campos[] = "nombre = ?";
                $valores[] = $data['nombre'];
            }
            if (isset($data['telefono'])) {
                $campos[] = "telefono = ?";
                $valores[] = $data['telefono'];
            }
            if (isset($data['direccion'])) {
                $campos[] = "direccion = ?";
                $valores[] = $data['direccion'];
            }
            
            // Cambio de contraseña
            if (isset($data['password']) && !empty($data['password'])) {
                $campos[] = "password = ?";
                $valores[] = password_hash($data['password'], PASSWORD_BCRYPT);
            }
            
            if (empty($campos)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'No hay datos para actualizar'
                ]);
                exit;
            }
            
            $valores[] = $usuario_id;
            $sql = "UPDATE usuarios SET " . implode(', ', $campos) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($valores);
            
            // Obtener datos actualizados
            $stmt = $pdo->prepare("SELECT id, nombre, email, telefono, direccion, rol FROM usuarios WHERE id = ?");
            $stmt->execute([$usuario_id]);
            $usuario = $stmt->fetch();
            
            $_SESSION['usuario'] = $usuario;
            
            echo json_encode([
                'success' => true,
                'message' => 'Perfil actualizado',
                'usuario' => $usuario
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
