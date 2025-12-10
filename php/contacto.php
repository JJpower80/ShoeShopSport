<?php
/**
 * API para procesar formulario de contacto
 */

header('Content-Type: application/json');
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validar datos requeridos
    if (empty($data['nombre']) || empty($data['email']) || empty($data['asunto']) || empty($data['mensaje'])) {
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
    
    // Insertar en la base de datos
    $stmt = $pdo->prepare("
        INSERT INTO contactos (nombre, email, telefono, asunto, mensaje, fecha) 
        VALUES (?, ?, ?, ?, ?, NOW())
    ");
    
    $stmt->execute([
        $data['nombre'],
        $data['email'],
        $data['telefono'] ?? null,
        $data['asunto'],
        $data['mensaje']
    ]);
    
    // Enviar email (opcional - descomentar si tienes configurado mail)
    /*
    $to = 'info@shoeshopsport.com';
    $subject = 'Nuevo mensaje de contacto - ' . $data['asunto'];
    $message = "Nombre: {$data['nombre']}\n";
    $message .= "Email: {$data['email']}\n";
    $message .= "Teléfono: {$data['telefono']}\n\n";
    $message .= "Mensaje:\n{$data['mensaje']}";
    $headers = "From: {$data['email']}\r\n";
    
    mail($to, $subject, $message, $headers);
    */
    
    echo json_encode([
        'success' => true,
        'message' => '¡Mensaje enviado correctamente! Te responderemos pronto.',
        'id' => $pdo->lastInsertId()
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al procesar el mensaje: ' . $e->getMessage()
    ]);
}
?>
