<?php
require_once 'connectDB.php';
header('Content-Type: application/json');

$student_id = isset($_GET['student_id']) ? trim($_GET['student_id']) : '';
$nfc_uid = isset($_GET['nfc_uid']) ? trim($_GET['nfc_uid']) : '';

if (empty($student_id) || empty($nfc_uid)) {
    echo json_encode(["status" => "error", "message" => "Missing data."]);
    exit;
}

$stmt = $conn->prepare("SELECT face_descriptor FROM student WHERE student_id = ? AND nfc_id = ?");
$stmt->bind_param("ss", $student_id, $nfc_uid);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Invalid Card or Unregistered Face."]);
} else {
    $row = $result->fetch_assoc();
    echo json_encode(["status" => "success", "face_descriptor" => $row['face_descriptor']]);
}

$stmt->close();
$conn->close();
?>