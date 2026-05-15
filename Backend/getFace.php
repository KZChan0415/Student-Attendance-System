<?php
require_once 'connectDB.php';
header('Content-Type: application/json');

$student_id = isset($_GET['student_id']) ? trim($_GET['student_id']) : '';

if (empty($student_id)) {
    echo json_encode(["status" => "error", "message" => "Missing student ID."]);
    exit;
}

$stmt = $conn->prepare("SELECT face_descriptor FROM student WHERE student_id = ?");
$stmt->bind_param("s", $student_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Student not found."]);
    exit;
}

$row = $result->fetch_assoc();

if (empty($row['face_descriptor'])) {
    echo json_encode(["status" => "error", "message" => "No face registered for this student."]);
} else {
    echo json_encode([
        "status" => "success", 
        "face_descriptor" => $row['face_descriptor']
    ]);
}

$stmt->close();
$conn->close();
?>