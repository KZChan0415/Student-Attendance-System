<?php
require_once 'connectDB.php';
header('Content-Type: application/json');

$class_id = isset($_GET['class']) ? $_GET['class'] : '';
$week = isset($_GET['week']) ? $_GET['week'] : '';

if (empty($class_id) || empty($week)) {
    echo json_encode(["error" => "Missing class or week"]);
    exit;
}

$sql = "SELECT s.student_id, s.student_name, 
        IF(a.presence_status = 1, 'Present', 'Absent') AS presence_status,
        a.time_taken 
        FROM student s 
        JOIN enrollments e ON s.student_id = e.student_id
        LEFT JOIN attendance a 
        ON s.student_id = a.student_id 
        AND a.class_id = ? 
        AND a.week_number = ?   
        WHERE e.class_id = ?
        ORDER BY s.student_id ASC"; 

$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $class_id, $week, $class_id);
$stmt->execute();
$result = $stmt->get_result();

$attendanceData = array();

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $attendanceData[] = $row;
    }
}

echo json_encode($attendanceData);

$stmt->close();
$conn->close();
?>