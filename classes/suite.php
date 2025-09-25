<?php
if(!defined("suite"))
{
	define("suite",1);
	/************************************************************************************************************************/
	/*		Included files																									*/
	/************************************************************************************************************************/
	include_once(__DIR__."/connection.php");
	/************************************************************************************************************************/	
	
	class suite
	{
		/********************************************************************************************************************/
		/*		Member Variables																						   	*/
		/********************************************************************************************************************/
		//!!!!!!!!! IF USING A MEMBER VARIABLE AS AN ARRAY INITIALIZE THE ARRAY TO null 	!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		//!!!!!!!!! OR IT WILL MESS UP count()												!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		
		/**@ignore************************************************************************************************************
		*	@access 	private
		*	@var 		mixed (1=ok, Otherwise and error code is given)
		@ignore***************************************************************************************************************/
		var $status = 1;	//variable to hold class status throughout usage.
		
		/**@ignore************************************************************************************************************
		*	@access 	private
		*	@var 		int
		@ignore***************************************************************************************************************/
		var $id = 0;		//most of our data based classes contain an ID field

		
		/**@ignore************************************************************************************************************
		*	@access 	private
		*	@var 		int
		@ignore***************************************************************************************************************/
		var $active = 1;	//Most tables have an active field.  
		
		/**@ignore************************************************************************************************************
		*	@access 	private
		*	@var 		int
		@ignore***************************************************************************************************************/
		var $collection = 1;	//Most tables have an active field.  
		
		/**@ignore************************************************************************************************************
		*	@access 	private
		*	@var 		int
		@ignore***************************************************************************************************************/
		var $flags = array();	//Most tables have an active field.  
		
		/********************************************************************************************************************/
		
		/**@ignore************************************************************************************************************
		*		@name			events
		*		@abstract		constructor for object
		*		@copyright		03.23.2018 
		*		@signatures		<ul>
		*							<li> events() </li>
		*							<li> events() </li>
		*						</ul>
		*		@throws			<ul>
		*							<li>INVALID_ACTION</li>
		*						</ul>
		*		@return 		void
		*		@author 		Swapnil Kharche <swapnil.k00@gmail.com>
		*		@since 			System	Version
		*		@auditTrail
		*			<ul>
 		*				<li>03.23.2018	SK	date created</li> 		
 		*			</ul>
		@ignore***************************************************************************************************************/
		function __CONSTRUCT()
		{
			//Args is used to overload the method. Unused cases should be removed. 
			$args = func_get_args();
			switch(count($args))
			{
				case 0:
					break;
			}
		}
		
		function getBuildingFloorplanDetails()
		{
			$args = func_get_args();
			$idtbuilding = 0;
			switch(count($args))
			{
				case 1:
					$idtbuilding = $args[0];
					break;
				default:
					return $this->status = 'INVALID_ACTION';
			}
			
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$q = "SELECT tsuite.idtsuite, tsuite.suite_name, tsuite.suite_description, tsuite.suite_area, tsuite.floor_number, tbuilding.floors, tbuilding.floorheight as building_floor_height, tfloors.idtfloors, tfloors.floor_height, tsuiteimages.image_name, tsuiteimages.image_path, tcoords.coords FROM tsuite
					LEFT JOIN tsuiteimages ON tsuiteimages.idtsuite = tsuite.idtsuite
					LEFT JOIN tbuilding ON tbuilding.idtbuilding = tsuite.idtbuilding
					LEFT JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
					LEFT JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto

					WHERE tsuite.is_active = 1 AND tfloors.number = tsuite.floor_number AND tsuiteimages.image_type = 'floor-plan-images'
					AND tsuite.idtbuilding = '".$idtbuilding."'
				";
			
			$suiteFloorplanDetails = array();
			if($result = mysqli_query($mysqliObj, $q))
			{
				$i=0;
				while($row = mysqli_fetch_assoc($result))
				{
					$row["coordsOriginal"] = trim($row["coords"], " ");
					$row["coords"] = trim($row["coords"], " ");
					$row["coords"] = trim($row["coords"], "\t");
					$row["coords"] = trim(trim($row["coords"], ""), ",**");
					$row["coords"] = str_replace("**", "", $row["coords"]);
					
					$suiteFloorplanDetails[$row["floor_number"]][] = $row;
					$i++;
				}
			}
			
			$suiteOtherImages = array();
			$q = "SELECT tsuiteimages.* FROM tsuite
					LEFT JOIN tsuiteimages ON tsuiteimages.idtsuite = tsuite.idtsuite
					LEFT JOIN tbuilding ON tbuilding.idtbuilding = tsuite.idtbuilding
					LEFT JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
					LEFT JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto

					WHERE tsuite.is_active = 1 AND tfloors.number = 1 AND tsuiteimages.image_type != 'floor-plan-images'
					AND tbuilding.idtbuilding = '".$idtbuilding."' order by tsuiteimages.idtsuite, tsuiteimages.image_type    ";
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($row = mysqli_fetch_assoc($result))
				{
					$suiteOtherImages[$row["idtsuite"]][$row["image_type"]][] = $row;
				}
			}
			
			return array($suiteFloorplanDetails, $suiteOtherImages);
		}
		
		function getAvailableOfficeSpaceDetails()
		{
			$idtmarket = 0;
			$args = func_get_args();
			switch(count($args))
			{
				case 0:
					break;
				case 1:
					$idtmarket = $args[0];
					break;
				default:
					return $this->status = 'INVALID_ACTION';
			}
			
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			$summaryDetails = array();
			$summaryDetails["Direct"] = array("buildings" => array(), "officeArea" => 0, "totalSuites" => 0, "availableOfficeArea" => 0, "availableArea" => 0, "vacancy" => 0);
			$summaryDetails["Sublease"] = array("buildings" => array(), "officeArea" => 0, "totalSuites" => 0, "availableOfficeArea" => 0, "availableArea" => 0, "vacancy" => 0);
			$summaryDetails["Co-Working"] = array("buildings" => array(), "officeArea" => 0, "totalSuites" => 0, "availableOfficeArea" => 0, "availableArea" => 0, "vacancy" => 0);
			$summaryDetails["Retail"] = array("buildings" => array(), "officeArea" => 0, "totalSuites" => 0, "availableOfficeArea" => 0, "availableArea" => 0, "vacancy" => 0);
			
			$q = "SELECT 
					SUM(CAST(REPLACE(tbuilding.grossofficearea, ',', '') AS UNSIGNED)) AS officeArea
				FROM 
				tbuilding 
				JOIN tsubmarket ON tsubmarket.idtsubmarket = tbuilding.idtsubmarket
				WHERE 
					tsubmarket.idtmarket = '".$idtmarket."'
					AND tbuilding.class IN ('A', 'AA', 'AAA', 'B', 'C')
					AND UPPER(tbuilding.tstatus) = 'COMPLETED' ";
			$totalOfficeArea = 0;
			if($result = mysqli_query($mysqliObj, $q))
			{
				$eachRow = mysqli_fetch_assoc($result);
				$totalOfficeArea = $eachRow["officeArea"];
			}
			//SUM(CAST(REPLACE(tbuilding.grossofficearea, ',', '') AS UNSIGNED)) AS grossofficearea
			$q = " SELECT tsuite.*, tsuiteimages.image_name, tsuiteimages.image_path, tfloors.number, tfloors.floor_height, tf2.floor_height as floor_height2, tf2.extruded_height, (tbuilding.altitude / tbuilding.floors) as building_floor_height, YEAR(CURDATE()) - yearbuilt AS year_difference, tbuilding.basefloorheight, tbuilding.address, tbuilding.idtsubmarket, tsubmarket.ssubname, tbuilding.sbuildingname, tbuilding.class, tbuilding.latitude, tbuilding.longitude, CAST(REPLACE(tbuilding.grossofficearea, ',', '') AS UNSIGNED) as grossofficearea, tcompany.companyname, tcompany.companyimage, tcoords.coords 
				FROM tsuite
				LEFT JOIN tsuiteimages ON tsuiteimages.idtsuite = tsuite.idtsuite
				LEFT JOIN tbuilding ON tbuilding.idtbuilding = tsuite.idtbuilding
				LEFT JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
				LEFT JOIN tfloors as tf2 ON tf2.idtbuilding = tbuilding.idtbuilding
				LEFT JOIN tcoords on tcoords.idtcoords = tfloors.idtcoords_auto
				LEFT JOIN tsubmarket ON tsubmarket.idtsubmarket = tbuilding.idtsubmarket
				LEFT JOIN tcompany ON tcompany.idtcompany = tsuite.idtcompany
				
				WHERE 1 AND tsubmarket.idtmarket = '".$idtmarket."' AND tsuite.space_type = 'Office' AND tsuite.is_active = 1 AND tfloors.number = 1 and tf2.number = tsuite.floor_number AND tsuiteimages.image_type = 'floor-plan-images' order by tsuite.floor_number, tsuite.suite_name  ";
			
			$suiteDetails = array();
			
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$eachRow["coordsOriginal"] = trim($eachRow["coords"], " ");
					$eachRow["coords"] = trim($eachRow["coords"], " ");
					$eachRow["coords"] = trim($eachRow["coords"], "\t");
					$eachRow["coords"] = trim(trim($eachRow["coords"], ""), ",**");
					$eachRow["coords"] = str_replace("**", "", $eachRow["coords"]);
					
					//Use updated floor height
					if((int)$eachRow["floor_height2"] > 0)
					{
						$eachRow["floor_height"] = $eachRow["floor_height2"];
					}
					//$eachRow["grossofficearea"] = str_replace(",", "", $eachRow["grossofficearea"]);
					
					$type = $eachRow["lease_type"];
					if(!in_array($eachRow["idtbuilding"], $summaryDetails[$type]["buildings"]))
					{
						array_push($summaryDetails[$type]["buildings"], $eachRow["idtbuilding"]);
						$summaryDetails[$type]["officeArea"] += (int)$eachRow["grossofficearea"];
					}
					$summaryDetails[$type]["totalSuites"]++;
					$summaryDetails[$type]["availableOfficeArea"] += (int)$eachRow["suite_area"];
					$suiteDetails[] = $eachRow;
				}
				mysqli_free_result($result);
				unset($row);
			}
			
			$suiteOtherImages = array();
			$q = "SELECT tsuiteimages.* FROM tsuite
					LEFT JOIN tsuiteimages ON tsuiteimages.idtsuite = tsuite.idtsuite
					LEFT JOIN tbuilding ON tbuilding.idtbuilding = tsuite.idtbuilding
					LEFT JOIN tsubmarket ON tsubmarket.idtsubmarket = tbuilding.idtsubmarket
					LEFT JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
					LEFT JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto

					WHERE tsuite.is_active = 1 AND tfloors.number = 1 AND tsuiteimages.image_type != 'floor-plan-images'
					AND tsubmarket.idtmarket = '".$idtmarket."' order by tsuiteimages.idtsuite, tsuiteimages.image_type    ";
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($row = mysqli_fetch_assoc($result))
				{
					$suiteOtherImages[$row["idtsuite"]][$row["image_type"]][] = $row;
				}
			}
			
			return array($summaryDetails, $suiteDetails, $suiteOtherImages, $totalOfficeArea);
		}
		
		
		function getCityFloorplanDetails()
		{
			$args = func_get_args();
			$idtcity = 0;
			switch(count($args))
			{
				case 1:
					$idtcity = $args[0];
					break;
				default:
					return $this->status = 'INVALID_ACTION';
			}
			
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$q = "SELECT tsuite.idtsuite, tsuite.suite_name, tsuite.suite_description, tsuite.suite_area, tsuite.floor_number, tbuilding.class, tbuilding.grossofficearea, tbuilding.sbuildingname, tbuilding.idtbuilding, tbuilding.latitude, tbuilding.longitude, tbuilding.floors, tbuilding.basefloorheight, tbuilding.altitude, tbuilding.floorheight as building_floor_height, tfloors.idtfloors, tfloors.floor_height, tsuiteimages.image_name, tsuiteimages.image_path, tcoords.coords FROM tsuite
					LEFT JOIN tsuiteimages ON tsuiteimages.idtsuite = tsuite.idtsuite
					LEFT JOIN tbuilding ON tbuilding.idtbuilding = tsuite.idtbuilding
					LEFT JOIN tsubmarket ON tsubmarket.idtsubmarket = tbuilding.idtsubmarket 
					LEFT JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
					LEFT JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto

					WHERE tsuite.is_active = 1 AND tfloors.number = 1 AND tsuiteimages.image_type = 'floor-plan-images'
					AND tsubmarket.idtcity = '".$idtcity."'
				";
			//echo $q;
			$suiteFloorplanDetails = array();
			$buildingDetails = array();
			$suiteOtherImages = array();
			$uniqueBuildings = array();
			
			$summaryDetails = array(
				"Office" => array("buildings" => array(), "totalBuildings" => 0, "totalSuites" => 0, "totalArea" => 0),
				//"Residential" => array("buildings" => array(), "totalBuildings" => 0, "totalSuites" => 0, "totalArea" => 0),
				//"Hotel" => array("buildings" => array(), "totalBuildings" => 0, "totalSuites" => 0, "totalArea" => 0),
				"Retail" => array("buildings" => array(), "totalBuildings" => 0, "totalSuites" => 0, "totalArea" => 0),
			);
			
			if($result = mysqli_query($mysqliObj, $q))
			{
				$i=0;
				while($row = mysqli_fetch_assoc($result))
				{
					$row["coordsOriginal"] = trim($row["coords"], " ");
					$row["coords"] = trim($row["coords"], " ");
					$row["coords"] = trim($row["coords"], "\t");
					$row["coords"] = trim(trim($row["coords"], ""), ",**");
					$row["coords"] = str_replace("**", "", $row["coords"]);
					$type = "";
					if(!in_array($row["idtbuilding"], $uniqueBuildings))
					{
						array_push($uniqueBuildings, $row["idtbuilding"]);
						$buildingDetails[$row["idtbuilding"]]["sbuildingname"] = $row["sbuildingname"];
						$buildingDetails[$row["idtbuilding"]]["altitude"] = $row["altitude"];
						$buildingDetails[$row["idtbuilding"]]["floors"] = $row["floors"];
						$buildingDetails[$row["idtbuilding"]]["basefloorheight"] = $row["basefloorheight"];
						
						$buildingDetails[$row["idtbuilding"]]["floorDetails"] = array();
						
						if(in_array($row["class"], array("A", "AA", "AAA", "B", "C")))
						{
							$type = "Office";
							$buildingDetails[$row["idtbuilding"]]["bldgclass"] = "Office";
							if(!in_array($row["idtbuilding"], $summaryDetails["Office"]))
							{
								array_push($summaryDetails["Office"]["buildings"], $row["idtbuilding"]);
							}
							$summaryDetails["Office"]["totalBuildings"]++;
							
						}
						/*
						if(in_array($row["class"], array("MDU", "APT")))
						{
							$type = "Residential";
							$buildingDetails[$row["idtbuilding"]]["bldgclass"] = "MDU";
							$summaryDetails["Residential"]["totalBuildings"]++;
							$summaryDetails["Residential"]["totalArea"] += (int)$row["suite_area"];
							if(!in_array($row["idtbuilding"], $summaryDetails["Residential"]))
							{
								array_push($summaryDetails["Residential"]["buildings"], $row["idtbuilding"]);
							}
						}
						if(in_array($row["class"], array("HOTEL")))
						{
							$type = "Hotel";
							$buildingDetails[$row["idtbuilding"]]["bldgclass"] = "Hotel";
							$summaryDetails["Hotel"]["totalBuildings"]++;
							//$summaryDetails["Office"]["totalArea"] += $row["grossofficearea"];
							if(!in_array($row["idtbuilding"], $summaryDetails["Hotel"]))
							{
								array_push($summaryDetails["Hotel"]["buildings"], $row["idtbuilding"]);
							}
						}
						*/
						if(in_array($row["class"], array("Retail", "RETAIL")))
						{
							$type = "Retail";
							$buildingDetails[$row["idtbuilding"]]["bldgclass"] = "Retail";
							$summaryDetails["Retail"]["totalBuildings"]++;
							//$summaryDetails["Office"]["totalArea"] += $row["grossofficearea"];
							if(!in_array($row["idtbuilding"], $summaryDetails["Retail"]))
							{
								array_push($summaryDetails["Retail"]["buildings"], $row["idtbuilding"]);
							}
						}
					}
					else
					{
						if(in_array($row["class"], array("A", "AA", "AAA", "B", "C")))
						{
							$type = "Office";
						}
						if(in_array($row["class"], array("MDU", "APT")))
						{
							$type = "Residential";
						}
						if(in_array($row["class"], array("HOTEL")))
						{
							$type = "Hotel";
						}
						if(in_array($row["class"], array("Retail", "RETAIL")))
						{
							$type = "Retail";
						}
					}
					if(isset($summaryDetails[$type]))
						$summaryDetails[$type]["totalSuites"]++;
					$suiteFloorplanDetails[$row["idtbuilding"]][$row["floor_number"]][] = $row;
					$summaryDetails[$type]["totalArea"] += (int)$row["suite_area"];
					$i++;
				}
			}
			
			$q = "SELECT tsuiteimages.* FROM tsuite
					LEFT JOIN tsuiteimages ON tsuiteimages.idtsuite = tsuite.idtsuite
					LEFT JOIN tbuilding ON tbuilding.idtbuilding = tsuite.idtbuilding
					LEFT JOIN tsubmarket ON tsubmarket.idtsubmarket = tbuilding.idtsubmarket 
					LEFT JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
					LEFT JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto

					WHERE tsuite.is_active = 1 AND tfloors.number = 1 AND tsuiteimages.image_type != 'floor-plan-images'
					AND tsubmarket.idtcity = '".$idtcity."' order by tsuiteimages.idtsuite, tsuiteimages.image_type    ";
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($row = mysqli_fetch_assoc($result))
				{
					$suiteOtherImages[$row["idtsuite"]][$row["image_type"]][] = $row;
				}
			}
			$floorDetails = array();
			if($i > 0)
			{
				//echo "<pre>";print_r($buildingDetails);
				$q = "SELECT idtbuilding, idtfloors, number, idtcoords_auto, floor_height
					FROM 
					tfloors 
					WHERE idtbuilding IN (".implode(", ", $uniqueBuildings).") order by number ";
				//echo $q;
				if($r2 = mysqli_query($mysqliObj, $q))
				{
					while($floorRow = mysqli_fetch_assoc($r2))
					{
						/*
						if(!isset($buildingDetails[$floorRow["idtbuilding"]]["floorDetails"][$floorRow["number"]]))
							$buildingDetails[$floorRow["idtbuilding"]]["floorDetails"][$floorRow["number"]] = array();
						*/
						
						array_push($buildingDetails[$floorRow["idtbuilding"]]["floorDetails"], $floorRow);
					}
				}
			}
			return array($suiteFloorplanDetails, $buildingDetails, $summaryDetails, $suiteOtherImages);
		}
		
		function destroy()
		{
			//unset($this);
		}
		
		/********************************************************************************************************************/
	}	//end of class definition
	/************************************************************************************************************************/
	
}	//end of ifndef
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!DO NOT PUT WHITESPACE AFTER THE PHP CLOSING TAG!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
?>