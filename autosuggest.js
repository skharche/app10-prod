/*
const data = [
    { id: 1, name: "Apple" },
    { id: 2, name: "Orange" },
    { id: 3, name: "Banana" },
    { id: 4, name: "Pineapple" },
    { id: 5, name: "Grapes" },
    { id: 6, name: "Mango" },
    { id: 7, name: "Strawberry" },
    { id: 8, name: "Blueberry" },
    { id: 9, name: "Peach" },
    { id: 10, name: "Watermelon" },
];
*/

const searchBox = document.getElementById("searchBox");
const suggestions = document.getElementById("suggestions");
let activeIndex = -1; // Tracks the active suggestion

searchBox.addEventListener("input", () => {
    const query = searchBox.value.trim().toLowerCase();
    suggestions.innerHTML = "";
    activeIndex = -1;

    if (query === "") return;

	/*
    const filtered = searchBuildingData
        .filter((item) => item.name.toLowerCase().startsWith(query.toLowerCase()))
        .slice(0, 10);
	*/
    const lowerQuery = query.toLowerCase();
    const filtered = [];
    const seenIds = new Set(); // To ensure unique entries

    for (const item of searchBuildingData) {
      if (seenIds.has(item.id)) continue;
      //console.log("Item", item);
      if (item.name.toLowerCase().startsWith(lowerQuery)) {
        filtered.push({ id: item.id, display: item.name, type: "name", index: item.index, entityIndex: item.entityIndex });
        seenIds.add(item.id);
      } else if (item.address.toLowerCase().startsWith(lowerQuery)) {
        filtered.push({ id: item.id, display: item.address, type: "address", index: item.index, entityIndex: item.entityIndex });
        seenIds.add(item.id);
      }
    }
	//console.log("Filtered Rows", filtered);
    filtered.forEach((item, index) => {
        const highlightedName = item.display.replace(
            new RegExp(query, "gi"),
            (match) => `<b>${match}</b>`
        );

        const li = document.createElement("li");
        li.className = "suggestion-item";
        li.dataset.index = index;
        li.innerHTML = highlightedName;
		li.setAttribute("data-id", item.id);
		li.setAttribute("data-index", item.index);
        li.setAttribute("data-entity-index", item.entityIndex);
        li.addEventListener("click", () => {
			
			var timeoutvalue = 0;
			//Toggle OFF rotate if search is open
			if(autoRotateSlow)
			{
				window.autoLoadCityCamera = true;
				ToggleCameraRotationSlowly();
				timeoutvalue = 500;
			}
			setTimeout(function (){
				monentarilyGenerateBuildingDash(item.id, item.index);
				flyToBuildingCamera(item.id);
				searchBox.value = item.name;
				suggestions.innerHTML = "";
				toggleSearchBox(true);
				return;
				window.autoLoadCityCamera = false;
				ShowInfobox(item.id, item.index);
				highlightSearchedBuilding(item.id, item.index, item.entityIndex);
				eventsToExecuteBeforeNewBuilding();
				//selectedPrimitive = primitiveCollection[item.entityIndex];
				//selectedPrimitiveId = "bldg-"+item.id+"-"+item.index;
			}, timeoutvalue);
            
        });

        suggestions.appendChild(li);
    });
});

function highlightSearchedBuilding(id, index, entityIndex)
{
	return;
	resetLastSelectedPrimitive();
	//console.log("highlightSearchedBuilding("+id+", "+index+")");return "";
	selectedPrimitive = primitiveCollection[entityIndex];
	if(typeof selectedPrimitive != "undefined")
	{
		selectedPrimitiveId = "bldg-"+id+"-"+index;
		var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
		if(typeof attributes != "undefined")
		{
			console.log(attributes.color);
			if(typeof attributes != "undefined")
			{
				selectedPrimitiveColor = attributes.color;
				//var tempSelectedPrimitiveColor = selectedPrimitiveColor;
				//tempSelectedPrimitiveColor[3] = 179;
				//attributes.color = [attributes.color[0], attributes.color[1], attributes.color[2], 179];
				attributes.color = [selectedPrimitiveColor[0], selectedPrimitiveColor[1], selectedPrimitiveColor[2], 179];;
				attributes.show = [1];
			}
		}
	}
}

function eventsToExecuteBeforeNewBuilding()
{
    var AtlastOneEffectActive = clearAllEffectsEnabled();
    
	if(AtlastOneEffectActive)
	{
		("#legendPanel").show();
		highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false, true);
	}
}
function clearAllEffectsEnabled()
{
    var AtlastOneEffectActive = false;
    if(isolateEffectActive)
    {
        clearIsolateEffect();
        AtlastOneEffectActive = true;
        isolateEffectActive = false;
    }
    if(spotlightEffectActive)
	{
		AtlastOneEffectActive = true;
		clearSpotlightEffect();
		spotlightEffectActive = false;
	}
    
	if(newHighlightEffectActive)
	{
		AtlastOneEffectActive = true;
		clearApp6HighlightEffect();
		newHighlightEffectActive = false;
	}

	if(highlightEffectActive)
	{
		AtlastOneEffectActive = true;
		clearHighlightEffect();
		highlightEffectActive = false;
	}
	return AtlastOneEffectActive;
}

searchBox.addEventListener("keydown", (event) => {
    const items = suggestions.querySelectorAll(".suggestion-item");
	//console.log(items);
	//console.log(event.key);
    if (event.key === "ArrowDown") {
        event.preventDefault();
        if (items.length === 0) return;

        activeIndex = (activeIndex + 1) % items.length;
        updateActiveItem(items);
    } else if (event.key === "ArrowUp") {
        event.preventDefault();
        if (items.length === 0) return; 

        activeIndex = (activeIndex - 1 + items.length) % items.length;
        updateActiveItem(items);
    } else if (event.key === "Enter") {
        event.preventDefault();
        if (activeIndex >= 0 && activeIndex < items.length) {
            searchBox.value = items[activeIndex].textContent.trim();
			const selectedItem = {
				id: items[activeIndex].getAttribute("data-id"),
				name: items[activeIndex].textContent,
			  };
			var timeoutvalue = 0;
			//Toggle OFF rotate if search is open
			if(autoRotateSlow)
			{
				window.autoLoadCityCamera = true;
				ToggleCameraRotationSlowly();
				timeoutvalue = 500;
			}
			setTimeout(function (){
				
				window.autoLoadCityCamera = false;
				ShowInfobox(items[activeIndex].getAttribute("data-id"), items[activeIndex].getAttribute("data-index"));
				monentarilyGenerateBuildingDash(items[activeIndex].getAttribute("data-id"), items[activeIndex].getAttribute("data-index"));
				highlightSearchedBuilding(items[activeIndex].getAttribute("data-id"), items[activeIndex].getAttribute("data-index"), items[activeIndex].getAttribute("data-entity-index"));
				flyToBuildingCamera(items[activeIndex].getAttribute("data-id"));
				//selectedPrimitive = primitiveCollection[items[activeIndex].getAttribute("data-entity-index")];
				//selectedPrimitiveId = "bldg-"+items[activeIndex].getAttribute("data-id")+"-"+items[activeIndex].getAttribute("data-index");
				var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
				console.log("Selected Attributes ", attributes);
				if(typeof attributes != "undefined")
				{
					if(selectedPrimitiveColor != null)
						attributes.color = selectedPrimitiveColor;
					attributes.show = [1];
				}
				
				
				//console.log("Selecting Primitive now");
				eventsToExecuteBeforeNewBuilding();
				suggestions.innerHTML = "";
				toggleSearchBox(true);
				//console.log(selectedPrimitive);
				//console.log(selectedPrimitiveId);
			}, timeoutvalue);
        }
    }
});

document.addEventListener("click", (event) => {
    if (!event.target.closest("#suggestions") && event.target !== searchBox) {
        suggestions.innerHTML = "";
    }
});

function updateActiveItem(items) {
    items.forEach((item, index) => {
        if (index === activeIndex) {
            item.classList.add("suggestion-item-active");
            item.scrollIntoView({ block: "nearest" });
        } else {
            item.classList.remove("suggestion-item-active");
        }
    });
}

//Dropdown Toggle
window.dropdownToggleInitiated = false;
function initiateDropdownToggle()
{
	//For dropdown
	const dropdown = document.querySelector('.dropdown');
	const toggleButton = document.querySelector('.dropdown-toggle');
	const dropdownItems = document.querySelectorAll('.dropdown-item');
	console.log("Dropdown Initiated!");
	  // Toggle dropdown menu
	  toggleButton.addEventListener('click', () => {
		dropdown.classList.toggle('show');
	  });

	  // Handle tick toggle
	  var atleastOneTick = false;
	  dropdownItems.forEach(item => {
		item.addEventListener('click', () => {
		  const tick = item.querySelector('.tick');
		  if (tick.style.visibility === 'visible') {
			tick.style.visibility = 'hidden';
		  } else {
			tick.style.visibility = 'visible';
		  }
		  checkEffectsClass();
		});
	  });

	  // Close dropdown when clicking outside
	  document.addEventListener('click', (event) => {
		if (!dropdown.contains(event.target)) {
		  dropdown.classList.remove('show');
		}
	  });
	  window.dropdownToggleInitiated = true;
}

function setResetTickForEffectsButtons(btnId, flag)
{
	console.log("setResetTickForEffectsButtons("+btnId+", "+flag+")");
	if(flag == true)
	{
		$("#"+btnId+" .tick").css("visibility", "visible");
	}
	else
	{
		$("#"+btnId+" .tick").css("visibility", "");;
	}
}

function checkEffectsClass()
{
	var dropdownItems2 = document.querySelectorAll('.dropdown-item');
	var atleastOneTick = false;
	 dropdownItems2.forEach(item => {
		var tick = item.querySelector('.tick');
		  if (tick.style.visibility === 'visible') {
			atleastOneTick = true;
		  }
	  });
	  if(atleastOneTick)
	  {
		  $("#newEffectsButton").removeClass("btn-secondary");
		  $("#newEffectsButton").addClass("btn-primary");
	  }
	  else
	  {
		  $("#newEffectsButton").addClass("btn-secondary");
		  $("#newEffectsButton").removeClass("btn-primary");
	  }
}


