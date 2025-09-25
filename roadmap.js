//var googleRoadMapAPIKey = "AIzaSyDGzyLnzNtd6F_OHim_OAkD3rob0rocz1c";
var googleRoadMapAPIKey = "AIzaSyBkHdA_RCSmoGnmgvi3a0Nj5IHsu3Wb7vk";
var sessionId = null;
/*
$.getJSON("/getSession.php", function (data) {
  sessionId = data.session;
  console.log(data);
});
*/
function createImagery()
{
	var z = 15;//Zoom Level
	var x = 1;
	var y = 1;
	imageryProvider3 = new Cesium.UrlTemplateImageryProvider({
		url: 'https://tile.googleapis.com/v1/2dtiles/'+z+'/'+x+'/'+y+'?key='+googleRoadMapAPIKey+'&session='+sessionId+'&orientation=0',
		tilingScheme: new Cesium.WebMercatorTilingScheme(),
		maximumLevel: 20,
		credit: "© Google"
	});

	viewer.imageryLayers.addImageryProvider(imageryProvider3);
}

async function getSessionId()
{
	$.getJSON("getSession.php", function (data) {
		sessionId = data.session;
		console.log(data);
		if(typeof data.session != "undefined")
		{
			sessionId = data.session;
		}
		else
		{
			console.log("Error with Session ID");
		}
	});
}