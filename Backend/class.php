<?php
require_once 'connectDB.php';
header('Content-Type: application/json');

$sql = "SELECT class_id, class_name FROM classes ORDER BY class_name ASC";
$result = $conn->query($sql);

$classes = array();

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $classes[] = $row;
    }
}

echo json_encode($classes);
?>