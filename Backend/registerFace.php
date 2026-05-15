<?php
require_once 'connectDB.php';
header('Content-Type: application/json');

$student_id = isset($_POST['student_id']) ? trim($_POST['student_id']) : '';
$face_descriptor = isset($_POST['face_descriptor']) ? trim($_POST['face_descriptor']) : '';

if (empty($student_id) || empty($face_descriptor)) {
    echo json_encode(["status" => "error", "message" => "Missing Student ID or face data."]);
    exit;
}

$check_stmt = $conn->prepare("SELECT student_name FROM student WHERE student_id = ?");
$check_stmt->bind_param("s", $student_id);
$check_stmt->execute();

if ($check_stmt->get_result()->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Student ID not found in the database."]);
    $check_stmt->close();
    exit;
}
$check_stmt->close();

$update_stmt = $conn->prepare("UPDATE student SET face_descriptor = ? WHERE student_id = ?");
$update_stmt->bind_param("ss", $face_descriptor, $student_id);

if ($update_stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Face registered successfully."]);
} else {
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
}

$update_stmt->close();
$conn->close();
?>