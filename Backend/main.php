<?php
require_once 'connectDB.php';
header('Content-Type: application/json');

date_default_timezone_set('Asia/Kuala_Lumpur');

// Get POST data
$nfc_uid = isset($_POST['nfc_id']) ? trim($_POST['nfc_id']) : '';
$student_id = isset($_POST['student_id']) ? trim($_POST['student_id']) : '';
$class_id = isset($_POST['class_id']) ? trim($_POST['class_id']) : '';
$week = isset($_POST['week']) ? trim($_POST['week']) : '';

if (empty($nfc_uid) || empty($student_id) || empty($class_id) || empty($week)) {
    echo json_encode(["status" => "error", "message" => "Missing data."]);
    exit;
}

// 1. Authenticate Card
$stmt = $conn->prepare("SELECT student_name FROM student WHERE nfc_id = ? AND student_id = ?");
$stmt->bind_param("ss", $nfc_uid, $student_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Card not recognized."]);
    exit;
}
$student_name = $result->fetch_assoc()['student_name'];
$stmt->close();

// 2. Check Enrollment
$enroll_stmt = $conn->prepare("SELECT enrollment_id FROM enrollments WHERE student_id = ? AND class_id = ?");
$enroll_stmt->bind_param("ss", $student_id, $class_id);
$enroll_stmt->execute();
if ($enroll_stmt->get_result()->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Not enrolled in this class."]);
    exit;
}
$enroll_stmt->close();

// 3. Duplicate Check
$dup_stmt = $conn->prepare("SELECT log_id FROM attendance WHERE student_id = ? AND class_id = ? AND week_number = ?");
$dup_stmt->bind_param("ssi", $student_id, $class_id, $week);
$dup_stmt->execute();
if ($dup_stmt->get_result()->num_rows > 0) {
    echo json_encode([
        "status" => "error", 
        "message" => "Already scanned for Week $week.",
        "student_name" => $student_name,
        "student_id" => $student_id
    ]);
    exit;
}
$dup_stmt->close();

// 4. Record Attendance
$current_time = date('H:i:s'); 
$insert_stmt = $conn->prepare("INSERT INTO attendance (student_id, class_id, week_number, presence_status, time_taken) VALUES (?, ?, ?, 1, ?)");
$insert_stmt->bind_param("ssis", $student_id, $class_id, $week, $current_time);

if ($insert_stmt->execute()) {
    echo json_encode([
        "status" => "success", 
        "student_name" => $student_name,
        "student_id" => $student_id
    ]);
} else {
    echo json_encode(["status" => "error", "message" => "DB Error: " . $conn->error]);
}

$insert_stmt->close();
$conn->close();
?>