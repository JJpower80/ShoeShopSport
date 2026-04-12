<?php
/**
 * Pasarela de pago virtual (simulada) - Solo para entorno académico
 */

header('Content-Type: application/json');
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

// Validar campos obligatorios
$campos = ['numero_tarjeta', 'titular', 'caducidad', 'cvv', 'cliente', 'productos'];
foreach ($campos as $campo) {
    if (empty($data[$campo])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Campo requerido: $campo"]);
        exit;
    }
}

// Limpiar número de tarjeta (eliminar espacios)
$numero = preg_replace('/\s+/', '', $data['numero_tarjeta']);

// Validar que solo tenga dígitos y longitud correcta
if (!ctype_digit($numero) || strlen($numero) < 13 || strlen($numero) > 19) {
    echo json_encode(['success' => false, 'message' => 'Número de tarjeta inválido']);
    exit;
}

// Validar caducidad (formato MM/YY)
if (!preg_match('/^(0[1-9]|1[0-2])\/\d{2}$/', $data['caducidad'])) {
    echo json_encode(['success' => false, 'message' => 'Formato de caducidad inválido (MM/AA)']);
    exit;
}

// Comprobar que la tarjeta no esté caducada
[$mes, $anio] = explode('/', $data['caducidad']);
$anioCompleto = 2000 + (int)$anio;
$mesActual = (int)date('m');
$anioActual = (int)date('Y');
if ($anioCompleto < $anioActual || ($anioCompleto === $anioActual && (int)$mes < $mesActual)) {
    echo json_encode(['success' => false, 'message' => 'La tarjeta está caducada']);
    exit;
}

// Validar CVV
if (!ctype_digit($data['cvv']) || strlen($data['cvv']) < 3 || strlen($data['cvv']) > 4) {
    echo json_encode(['success' => false, 'message' => 'CVV inválido']);
    exit;
}

// Validar titular
$titular = trim($data['titular']);
if (strlen($titular) < 3) {
    echo json_encode(['success' => false, 'message' => 'Nombre del titular inválido']);
    exit;
}

// ── Tarjetas de prueba especiales ──────────────────────────────────────────
// 4242 4242 4242 4242  → siempre APROBADA
// 4000 0000 0000 0002  → siempre RECHAZADA
// Cualquier otra con Luhn válido → aprobada (simulación)
// ──────────────────────────────────────────────────────────────────────────
$resultado_pago = null;
$codigo_autorizacion = null;

if ($numero === '4242424242424242') {
    $resultado_pago = true;
} elseif ($numero === '4000000000000002') {
    $resultado_pago = false;
} else {
    // Algoritmo de Luhn para validar que el número sea plausible
    $suma = 0;
    $alternar = false;
    for ($i = strlen($numero) - 1; $i >= 0; $i--) {
        $n = (int)$numero[$i];
        if ($alternar) {
            $n *= 2;
            if ($n > 9) $n -= 9;
        }
        $suma += $n;
        $alternar = !$alternar;
    }
    $resultado_pago = ($suma % 10 === 0);
}

if (!$resultado_pago) {
    echo json_encode([
        'success' => false,
        'message' => 'Pago rechazado. Comprueba los datos de la tarjeta o usa una tarjeta diferente.'
    ]);
    exit;
}

// ── Pago APROBADO → registrar pedido ──────────────────────────────────────
try {
    // Calcular total
    $total = 0;
    foreach ($data['productos'] as $producto) {
        $total += floatval($producto['precio']) * intval($producto['cantidad']);
    }

    $pdo->beginTransaction();

    $usuario_id   = $_SESSION['usuario']['id'] ?? null;
    $cliente      = $data['cliente'];
    $nombre       = htmlspecialchars($cliente['nombre']   ?? '', ENT_QUOTES, 'UTF-8');
    $email        = filter_var($cliente['email']          ?? '', FILTER_SANITIZE_EMAIL);
    $telefono     = htmlspecialchars($cliente['telefono'] ?? '', ENT_QUOTES, 'UTF-8');
    $direccion    = htmlspecialchars($cliente['direccion'] ?? '', ENT_QUOTES, 'UTF-8');

    // Generar código de autorización ficticio
    $codigo_autorizacion = strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));

    // Insertar pedido con estado 'pagado'
    $stmt = $pdo->prepare("
        INSERT INTO pedidos (usuario_id, cliente_nombre, cliente_email, cliente_telefono,
                             direccion, total, estado, fecha)
        VALUES (?, ?, ?, ?, ?, ?, 'pagado', NOW())
    ");
    $stmt->execute([$usuario_id, $nombre, $email, $telefono, $direccion, $total]);
    $pedido_id = $pdo->lastInsertId();

    // Insertar detalles del pedido
    $stmt = $pdo->prepare("
        INSERT INTO pedido_detalles (pedido_id, producto_nombre, precio, cantidad)
        VALUES (?, ?, ?, ?)
    ");
    foreach ($data['productos'] as $producto) {
        $stmt->execute([
            $pedido_id,
            htmlspecialchars($producto['nombre'], ENT_QUOTES, 'UTF-8'),
            floatval($producto['precio']),
            intval($producto['cantidad'])
        ]);
    }

    $pdo->commit();

    // Limpiar carrito de sesión
    $_SESSION['carrito'] = [];

    echo json_encode([
        'success'              => true,
        'message'              => 'Pago procesado correctamente',
        'pedido_id'            => $pedido_id,
        'total'                => $total,
        'codigo_autorizacion'  => $codigo_autorizacion
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al registrar el pedido']);
}
?>
