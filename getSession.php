<?php
$apiKey = 'AIzaSyDGzyLnzNtd6F_OHim_OAkD3rob0rocz1c';
//$apiKey = 'AIzaSyBkHdA_RCSmoGnmgvi3a0Nj5IHsu3Wb7vk';
$url = "https://tile.googleapis.com/v1/createSession?key=$apiKey";

/*
$postData = json_encode([
    "mapType" => "roadmap",
    "language" => "en-US",
    "region" => "US",
    "layerTypes" => [ "layerRoadmap" ],
    "overlay" => true,
    "scale" => "scaleFactor1x",
    "styles" => [
        [
            "featureType" => "road",
            "elementType" => "geometry",
            "stylers" => [
                [ "color" => "#CCFFFF" ]
            ]
        ]
    ]
]);
*/

$postData = json_encode([
    "mapType" => "roadmap",
    "language" => "en-US",
    "region" => "US",
    "layerTypes" => ["layerRoadmap"],
    "overlay" => true,
    "scale" => "scaleFactor1x",
    "styles" => [
        // ✅ Show roads geometry (with custom color)
        [
            "featureType" => "road",
            "elementType" => "geometry",
            "stylers" => [
                [ "color" => "#CCFFFF" ]
            ]
        ],
        // ✅ Show road labels
        [
            "featureType" => "road",
            "elementType" => "labels.text.fill",
            "stylers" => [
                [ "color" => "#000000" ]
            ]
        ],
        [
            "featureType" => "road",
            "elementType" => "labels.text.stroke",
            "stylers" => [
                [ "color" => "#ffffff" ]
            ]
        ],
        // 🚫 Hide everything else
        [ "featureType" => "administrative", "stylers" => [ [ "visibility" => "off" ] ] ],
        [ "featureType" => "poi", "stylers" => [ [ "visibility" => "off" ] ] ],
        [ "featureType" => "landscape", "stylers" => [ [ "visibility" => "off" ] ] ],
        [ "featureType" => "transit", "stylers" => [ [ "visibility" => "off" ] ] ],
        [ "featureType" => "water", "stylers" => [ [ "visibility" => "off" ] ] ],
        [ "featureType" => "administrative.country", "stylers" => [ [ "visibility" => "off" ] ] ],
        [ "featureType" => "administrative.locality", "stylers" => [ [ "visibility" => "off" ] ] ],
        [ "featureType" => "administrative.neighborhood", "stylers" => [ [ "visibility" => "off" ] ] ],
        [ "featureType" => "administrative.province", "stylers" => [ [ "visibility" => "off" ] ] ],
        [ "elementType" => "labels.icon", "stylers" => [ [ "visibility" => "off" ] ] ],
        [ "featureType" => "poi.park", "stylers" => [ [ "visibility" => "off" ] ] ],
        [ "featureType" => "poi.business", "stylers" => [ [ "visibility" => "off" ] ] ],
        [ "featureType" => "poi.school", "stylers" => [ [ "visibility" => "off" ] ] ],
        [ "featureType" => "poi.medical", "stylers" => [ [ "visibility" => "off" ] ] ]
    ]
]);

/*
$postData = json_encode([
    "mapType" => "satellite",
    "language" => "en-US",
    "region" => "us",
    "layerTypes" => [ "layerRoadmap", "layerStreetview" ],
    "overlay" => true,
    "scale" => "scaleFactor1x",
    "styles" => [
        [
            "stylers" => [
                [ "hue" => "#00ffe6" ],
                [ "saturation" => -20 ]
            ]
        ],
        [
            "featureType" => "road",
            "elementType" => "geometry",
            "stylers" => [
                [ "lightness" => 100 ],
                [ "visibility" => "simplified" ]
            ]
        ]
    ]
]);
*/


$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

$response = curl_exec($ch);

if ($response === false) {
    echo "cURL Error: " . curl_error($ch);
} else {
    //header('Content-Type: application/json');
	$info = curl_getinfo($ch);
	//echo "<pre>";print_r($info);
    // Output response
	header('Content-Type: application/json');
	//http_response_code($httpCode);
	echo $response;
}

curl_close($ch);

//header('Content-Type: application/json');
//echo $response;

//echo "<pre>";print_r($response);
?>