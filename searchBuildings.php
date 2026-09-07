<?php

include_once(__DIR__."/classes/connection.php");

// Route incoming AJAX action
if (isset($_POST['action']) && $_POST['action'] === 'searchBuildings') {
    searchBuildings();
    exit;
}

function searchBuildings() {
    header('Content-Type: application/json');

    $conn = new dbConnection();
    $mysqliObj = $conn->Connect();

    $term = isset($_POST['term']) ? trim($_POST['term']) : '';

    if ($term === '') {
        echo json_encode([]);
        return;
    }

    $likeTerm = '%' . $term . '%';

    // Only Office, Multifamily/Residential and Hotel classes are searchable for now - Retail is
    // omitted because loading the Retail visualisation from a text-search hit isn't supported yet.
    $searchableClasses = "'A','AA','AAA','B','C','APT','MDU','SENIOR','Apartments','Condominiums','HOTEL'";

    $sql = "SELECT idtbuilding, sbuildingname, address, tbuilding.class, tbuilding.idtsubmarket, tsubmarket.idtmarket, tsubmarket.ssubname, tcity.scityname, tcity.idtcity
            FROM tbuilding
			LEFT JOIN tsubmarket ON tsubmarket.idtsubmarket = tbuilding.idtsubmarket
			LEFT JOIN tcity ON tcity.idtcity = tsubmarket.idtcity

            WHERE (sbuildingname LIKE ?
               OR address LIKE ?
               OR idtbuilding LIKE ?)
			   AND tbuilding.tstatus IN ('Completed', 'Under Construction', 'Proposed')
			   AND tbuilding.class IN (".$searchableClasses.")
            ORDER BY sbuildingname ASC
            LIMIT 15";

    $stmt = $mysqliObj->prepare($sql);

    if (!$stmt) {
        echo json_encode(['error' => 'Query preparation failed']);
        return;
    }

    $stmt->bind_param('sss', $likeTerm, $likeTerm, $likeTerm);
    $stmt->execute();
    $result = $stmt->get_result();

    $buildings = [];
    while ($row = $result->fetch_assoc()) {
        $buildings[] = [
            'idtbuilding'   => $row['idtbuilding'],
            'sbuildingname' => $row['sbuildingname'],
            'address'      => $row['address'],
            'class'        => $row['class'],
            'idtsubmarket' => $row['idtsubmarket'],
            'idtmarket'    => $row['idtmarket'],
            'scityname' => $row['scityname'],
            'idtcity' => $row['idtcity']
        ];
    }

    $stmt->close();
    $mysqliObj->close();

    echo json_encode($buildings);
}

?>