<?php
if(!defined("building"))
{
	define("building",1);
	/************************************************************************************************************************/
	/*		Included files																									*/
	/************************************************************************************************************************/
	include_once(__DIR__."/connection.php");
	/************************************************************************************************************************/	
	
	class building
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
		
		var $BuildingClasses = "";
		var $DevelopmentClasses = " 'PROPOSED', 'UNDER CONSTRUCTION' ";
		
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
			$this->BuildingClasses = " 'A', 'AA', 'AAA', 'B', 'C', 'APT', 'SENIOR', 'MDU', 'HOTEL', 'GOV', 'Retail', 'EDU', 'MED', 'PRKS' ";
			//Args is used to overload the method. Unused cases should be removed. 
			$args = func_get_args();
			switch(count($args))
			{
				case 0:
					break;
			}
		}
		
		function randomCalgaryBuildingHighlight()
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
			
			$q = "SELECT tbuilding.idtbuilding, tbuilding.sbuildingname, tbuilding.class as buildingclass, tbuilding.address, tbuilding.yearbuilt, tbuilding.lastreno, tbuilding.altitude, tbuilding.floors, tbuilding.basefloorheight, tbuilding.units, tbuilding.hoteldoors, CAST(REPLACE(tbuilding.grossofficearea, ',', '') AS SIGNED) as grossofficearea, CAST(REPLACE(tbuilding.grossretailarea, ',', '') AS SIGNED) as grossretailarea, tfloors.idtfloors, tfloors.name, tfloors.idtcoords, tcoords.coords FROM 
				tbuilding 
				JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
				JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto
				WHERE 
					tbuilding.idtbuilding IN ( 18540, 118, 18302, 42, 53057, 1578, 173, 55744, 1600, 1592, 14684 )
					AND tbuilding.class IN ('A', 'AA', 'AAA', 'B', 'C', 'APT', 'MDU')
					AND upper(tbuilding.tstatus) = 'COMPLETED' 
					AND tfloors.number = 1 LIMIT 0,10  ";
			//echo $q;
			$buildingDetails = array();
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$eachRow["address"] = $this->skipUTFEncode($eachRow["address"]);
					$eachRow["sbuildingname"] = $this->skipUTFEncode($eachRow["sbuildingname"]);
					
					$eachRow["coordsOriginal"] = trim($eachRow["coords"], " ");
					$eachRow["coords"] = trim($eachRow["coords"], " ");
					$eachRow["coords"] = trim($eachRow["coords"], "\t");
					$eachRow["coords"] = trim(trim($eachRow["coords"], ""), ",**");
					$eachRow["coords"] = str_replace("**", "", $eachRow["coords"]);
					//$eachRow["extrudedHeight"] = ($eachRow["number"] - 1) * $eachRow["floorheight"];
					
					$buildingDetails[] = $eachRow;
				}
				mysqli_free_result($result);
				unset($row);
			}
			else
			{
				$this->status = "INVALID_QUERY";
			}
			
			return $buildingDetails;
		}
		
		function skipUTFEncode($str)
		{
			return $str;
		}
		
		function getAClassBuildings()
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
			
			$q = "SELECT tbuilding.idtbuilding, tbuilding.idtsubmarket, tbuilding.idtcamera, tsubmarket.ssubname, tbuilding.sbuildingname, tbuilding.parkingstalls, tbuilding.class as buildingclass, YEAR(CURDATE()) - yearbuilt AS year_difference , tbuilding.address, tbuilding.yearbuilt, tbuilding.total_additional_rent, tbuilding.op_maint, tbuilding.realty_tax, tbuilding.lastreno, tbuilding.altitude, tbuilding.floors, tbuilding.basefloorheight, tbuilding.units, tbuilding.hoteldoors, CAST(REPLACE(tbuilding.grossofficearea, ',', '') AS UNSIGNED) as grossofficearea, CAST(REPLACE(tbuilding.grossretailarea, ',', '') AS UNSIGNED) as grossretailarea, tfloors.idtfloors, tfloors.name, tfloors.idtcoords, tfloors.floor_height, tbuilding.floorheight as buildingfloorheight, tcoords.coords, thotelclass.star_rating
			,(
				SELECT SUM(suite_area)
				FROM tsuite
				WHERE tsuite.idtbuilding = tbuilding.idtbuilding
			) AS total_available_office_area
			FROM 
				tbuilding 
				LEFT JOIN tsubmarket ON tsubmarket.idtsubmarket = tbuilding.idtsubmarket
				JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
				JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto
				LEFT JOIN thotelclass ON thotelclass.idtbuilding = tbuilding.idtbuilding
				WHERE 
					tbuilding.idtsubmarket IN (SELECT idtsubmarket FROM tsubmarket WHERE idtmarket = ".$idtmarket." )
					AND tbuilding.class IN (".$this->BuildingClasses.")
					AND upper(tbuilding.tstatus) = 'COMPLETED' 
					AND LENGTH(coords) > 40
					AND tfloors.number = 1   ";
			//echo $q;
			$buildingDetails = array();
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$eachRow["address"] = $this->skipUTFEncode($eachRow["address"]);
					$eachRow["sbuildingname"] = $this->skipUTFEncode($eachRow["sbuildingname"]);
					$eachRow["ssubname"] = $this->skipUTFEncode($eachRow["ssubname"]);
					
					$eachRow["coordsOriginal"] = trim($eachRow["coords"], " ");
					$eachRow["coords"] = trim($eachRow["coords"], " ");
					$eachRow["coords"] = trim($eachRow["coords"], "\t");
					$eachRow["coords"] = trim(trim($eachRow["coords"], ""), ",**");
					$eachRow["coords"] = str_replace("**", "", $eachRow["coords"]);
					//$eachRow["extrudedHeight"] = ($eachRow["number"] - 1) * $eachRow["floorheight"];
					
					$buildingDetails[] = $eachRow;
				}
				mysqli_free_result($result);
			}
			//print_r($buildingDetails);
			$q = "SELECT tbuilding.idtbuilding, tbuilding.idtsubmarket, tbuilding.idtcamera, tsubmarket.ssubname, tbuilding.sbuildingname, tbuilding.class as buildingclass, tbuilding.address, tbuilding.yearbuilt, tbuilding.lastreno, tbuilding.altitude, tbuilding.floors, tbuilding.tstatus, tbuilding.basefloorheight, tbuilding.units, tbuilding.hoteldoors, CAST(REPLACE(tbuilding.grossofficearea, ',', '') AS UNSIGNED) as grossofficearea, CAST(REPLACE(tbuilding.grossretailarea, ',', '') AS UNSIGNED) as grossretailarea, tfloors.idtfloors, tfloors.name, tfloors.idtcoords, tfloors.floor_height, tbuilding.floorheight as buildingfloorheight, tcoords.coords, thotelclass.star_rating FROM 
				tbuilding 
				LEFT JOIN tsubmarket ON tsubmarket.idtsubmarket = tbuilding.idtsubmarket
				JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
				JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto
				LEFT JOIN thotelclass ON thotelclass.idtbuilding = tbuilding.idtbuilding
				WHERE 
					tbuilding.idtsubmarket IN (SELECT idtsubmarket FROM tsubmarket WHERE idtmarket = ".$idtmarket." )
					AND upper(tbuilding.tstatus) IN ( ".$this->DevelopmentClasses." )
					AND tfloors.number = 1 AND tbuilding.altitude IS NOT NULL AND tfloors.idtcoords_auto IS NOT NULL   ";
			//echo $q;
			$proposedBuildings = array();
			$proposedBuildingsIds = array();
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					array_push($proposedBuildingsIds, $eachRow["idtbuilding"]);
					$eachRow["address"] = $this->skipUTFEncode($eachRow["address"]);
					$eachRow["sbuildingname"] = $this->skipUTFEncode($eachRow["sbuildingname"]);
					$eachRow["ssubname"] = $this->skipUTFEncode($eachRow["ssubname"]);
					
					$eachRow["coordsOriginal"] = trim($eachRow["coords"], " ");
					$eachRow["coords"] = trim($eachRow["coords"], " ");
					$eachRow["coords"] = trim($eachRow["coords"], "\t");
					$eachRow["coords"] = trim(trim($eachRow["coords"], ""), ",**");
					$eachRow["coords"] = str_replace("**", "", $eachRow["coords"]);
					//$eachRow["extrudedHeight"] = ($eachRow["number"] - 1) * $eachRow["floorheight"];
					
					$proposedBuildings[] = $eachRow;
				}
				mysqli_free_result($result);
			}
			
			$devBuildingFloors = array();
			if(count($proposedBuildingsIds) > 0)
			{
				$q = "SELECT * FROM 
					tfloors 
					WHERE 
						tfloors.idtbuilding IN ( ".implode(",", $proposedBuildingsIds)." ) ";
				//echo $q;
				if($result = mysqli_query($mysqliObj, $q))
				{
					while($eachRow = mysqli_fetch_assoc($result))
					{
						$devBuildingFloors[$eachRow["idtbuilding"]][] = $eachRow;
					}
					mysqli_free_result($result);
				}
			}
			
			$buildingFiles = array();
			$q = "SELECT tbuilding.idtbuilding, tsuite.suite_name, tsuite.floor_number, aos_document_id, aos_document.filename, aos_document.filetype, length(aos_document.filedata) as filesize
			FROM aos_document
			LEFT JOIN tsuite on tsuite.idtsuite = aos_document.idtsuite
			LEFT JOIN tbuilding on tbuilding.idtbuilding = tsuite.idtbuilding
			 ";
			//echo $q;
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$eachRow["aos_document_id"] = $this->encryptParam($eachRow["aos_document_id"]);
					if(!isset($buildingFiles[$eachRow["idtbuilding"]]))
						$buildingFiles[$eachRow["idtbuilding"]] = array();
					if(!isset($buildingFiles[$eachRow["idtbuilding"]][$eachRow["floor_number"]]))
						$buildingFiles[$eachRow["idtbuilding"]][$eachRow["floor_number"]] = array();
					$buildingFiles[$eachRow["idtbuilding"]][$eachRow["floor_number"]][] = $eachRow;
				}
				mysqli_free_result($result);
			}
			
			return array($buildingDetails, $proposedBuildings, $devBuildingFloors, $buildingFiles);
		}
		
		function encryptParam($data) {
			$encryption_key = base64_decode("4587854");
			$iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('AES-256-CBC'));
			$encrypted = openssl_encrypt($data, 'AES-256-CBC', $encryption_key, 0, $iv);
			return base64_encode($encrypted . '::' . $iv);
		}
		
		function getBuildingHotelSummary()
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
			
			$q = "SELECT 
					thotelclass.star_rating, COUNT(thotelclass.idtbuilding) AS totalBuildings, SUM(tbuilding.hoteldoors) AS totalUnits
					,ROUND(
						AVG(
							CASE 
								WHEN yearbuilt IS NOT NULL AND yearbuilt > 0 
								THEN YEAR(CURDATE()) - yearbuilt
								ELSE NULL
							END
						), 0
					) AS year_difference
				FROM 
				tbuilding 
				JOIN thotelclass ON thotelclass.idtbuilding = tbuilding.idtbuilding
				WHERE 
					tbuilding.idtsubmarket IN (SELECT idtsubmarket FROM tsubmarket WHERE idtmarket = ".$idtmarket." )
					AND tbuilding.class IN ('HOTEL')
					AND UPPER(tbuilding.tstatus) = 'COMPLETED' 
					GROUP BY thotelclass.star_rating  ";
			//echo $q;
			$hotelDetails = array();
			$hotelDetails[5] = array("star_rating" => 5, "totalBuildings" => 0, "totalUnits" => 0);
			$hotelDetails[4] = array("star_rating" => 4, "totalBuildings" => 0, "totalUnits" => 0);
			$hotelDetails[3] = array("star_rating" => 3, "totalBuildings" => 0, "totalUnits" => 0);
			$hotelDetails[2] = array("star_rating" => 2, "totalBuildings" => 0, "totalUnits" => 0);
			$hotelDetails[1] = array("star_rating" => 1, "totalBuildings" => 0, "totalUnits" => 0);
			
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$hotelDetails[$eachRow["star_rating"]] = $eachRow;
				}
				mysqli_free_result($result);
				unset($row);
			}
			
			return $hotelDetails;
		}
		
		function getDevelopmentBuildingSummary()
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
			
			$q = "SELECT 
					tbuilding.tstatus, COUNT(tbuilding.idtbuilding) AS totalBuildings, sum(units) as resiUnits, sum(tbuilding.hoteldoors) as hoteldoors, sum(CAST(REPLACE(tbuilding.grossofficearea, ',', '') AS UNSIGNED)) as officeArea
				FROM 
				tbuilding 
				WHERE 
					tbuilding.idtsubmarket IN (SELECT idtsubmarket FROM tsubmarket WHERE idtmarket = ".$idtmarket." )
					AND UPPER(tbuilding.tstatus) IN ( ".$this->DevelopmentClasses.")
					GROUP BY tbuilding.tstatus  ";
			//echo $q;
			$developmentDetails = array();
			$developmentDetails["PROPOSED"] = array("totalBuildings" => 0);
			$developmentDetails["UNDER CONSTRUCTION"] = array("totalBuildings" => 0);
			
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$developmentDetails[$eachRow["tstatus"]] = $eachRow;
				}
				mysqli_free_result($result);
				unset($row);
			}
			
			return $developmentDetails;
		}
		
		function getAllVisualizationBuildingSummary()
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
			
			//YEAR(CURDATE()) - yearbuilt AS year_difference
			$q = "SELECT 
					tbuilding.class, COUNT(tbuilding.idtbuilding) AS totalBuildings,
					ROUND(
						AVG(
							CASE 
								WHEN yearbuilt IS NOT NULL AND yearbuilt > 0 
								THEN YEAR(CURDATE()) - yearbuilt
								ELSE NULL
							END
						), 2
					) AS year_difference
				FROM 
				tbuilding 
				WHERE 
					tbuilding.idtsubmarket IN (SELECT idtsubmarket FROM tsubmarket WHERE idtmarket = ".$idtmarket." )
					AND tbuilding.class IN ( ".$this->BuildingClasses.")
					AND UPPER(tbuilding.tstatus) = 'COMPLETED' 
					GROUP BY tbuilding.class  ";
			//echo $q;
			$classDetails = array();
			$classAACnt = 0;
			$classAAAvg = 0;
			$totalCnt = 0;
			$totalAvg = 0;
			$cntr = 0;
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					if($eachRow["class"] == "AA" ||$eachRow["class"] == "AAA")
					{
						$classAACnt = $classAACnt + $eachRow["totalBuildings"];
						if($classAAAvg == 0)
						{
							$classAAAvg = (int)$eachRow["year_difference"];
						}
						else
						{
							$classAAAvg = ceil(((int)$classAAAvg + (int)$eachRow["year_difference"]) / 2);
						}
					}
					else
					{
						$classDetails[$eachRow["class"]] = array($eachRow["totalBuildings"], (int)$eachRow["year_difference"]);
						$totalAvg += (int)$eachRow["year_difference"];
						$cntr++;
					}
					$totalCnt += $eachRow["totalBuildings"];
				}
				$classDetails["AA"] = array($classAACnt, (int)$classAAAvg);
				$cntr++;
				$totalAvg += $classAAAvg;
				
				$classDetails["TOTAL"] = array($totalCnt, ceil($totalAvg / $cntr));
				if(!isset($classDetails["A"]))
					$classDetails["A"] = array(0, 0);
				if(!isset($classDetails["AA"]))
					$classDetails["AA"] = array(0, 0);
				if(!isset($classDetails["B"]))
					$classDetails["B"] = array(0, 0);
				if(!isset($classDetails["C"]))
					$classDetails["C"] = array(0, 0);
				if(!isset($classDetails["APT"]))
					$classDetails["APT"] = array(0, 0);
				if(!isset($classDetails["Retail"]))
					$classDetails["Retail"] = array(0, 0);
				if(!isset($classDetails["GOV"]))
					$classDetails["GOV"] = array(0, 0);
				if(!isset($classDetails["MED"]))
					$classDetails["MED"] = array(0, 0);
				if(!isset($classDetails["PRKS"]))
					$classDetails["PRKS"] = array(0, 0);
				if(!isset($classDetails["EDU"]))
					$classDetails["EDU"] = array(0, 0);
				if(!isset($classDetails["SENIOR"]))
					$classDetails["SENIOR"] = array(0, 0);
				if(!isset($classDetails["HOTEL"]))
					$classDetails["HOTEL"] = array(0, 0);
				if(!isset($classDetails["MDU"]))
					$classDetails["MDU"] = array(0, 0);
				mysqli_free_result($result);
				unset($row);
			}
			
			//SqFt
			
			
			return $classDetails;
		}
		
		function getAClassBuildingCount()
		{
			$idtmarketString = "";
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
			
			if(is_array($idtmarket))
			{
				//print_r($idtmarket[0]);
				if(is_array($idtmarket[0]))
				{
					$idtmarketString = implode(", ", $idtmarket[0]);
				}
				else
				{
					$idtmarketString = implode(", ", $idtmarket);
				}
				//echo "##".$idtmarketString;
			}
			else
			{
				$idtmarketString = $idtmarket;
			}
			$q = "SELECT count(tbuilding.idtbuilding) as cnt FROM 
				tbuilding 
				LEFT JOIN tsubmarket ON tsubmarket.idtsubmarket = tbuilding.idtsubmarket
				JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
				JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto
				WHERE 
					tbuilding.idtsubmarket IN (SELECT idtsubmarket FROM tsubmarket WHERE idtmarket IN ( ".$idtmarketString.") )
					AND tbuilding.class IN (".$this->BuildingClasses.")
					AND (upper(tbuilding.tstatus) IN ( 'PROPOSED', 'UNDER CONSTRUCTION', 'COMPLETED', 'PRE-LEASING' ) ) AND LENGTH(tcoords.coords) > 40
					AND tfloors.number = 1  ";
				//AND (upper(tbuilding.tstatus) = 'COMPLETED'  OR upper(tbuilding.tstatus) IN ('PROPOSED', 'UNDER CONSTRUCTION')) AND LENGTH(tcoords.coords) > 40
			//echo $q;
			$rowCnt = 0;
			if($result = mysqli_query($mysqliObj, $q))
			{
				$row = mysqli_fetch_assoc($result);
				$rowCnt = $row["cnt"];
				mysqli_free_result($result);
			}
			return $rowCnt;
		}
		
		function getBuildingFloorDetails($idtbuilding)
		{
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$q = "SELECT idtfloors, number, idtcoords_auto, floor_height FROM tfloors WHERE idtbuilding = '".$idtbuilding."' order by number ";
			//echo $q;
			$floorDetails = array();
			if($r2 = mysqli_query($mysqliObj, $q))
			{
				while($floorRow = mysqli_fetch_assoc($r2))
				{
					$floorDetails[] = $floorRow;
				}
			}
			$q = "SELECT sum(floor_height) as totalHeight FROM tfloors WHERE idtbuilding = '".$idtbuilding."'  ";
			$calculatedHeight = 0;
			$r2 = mysqli_query($mysqliObj, $q);
			$floorRow = mysqli_fetch_assoc($r2);
			if($floorRow != null)
				$calculatedHeight = $floorRow["totalHeight"];
			return array($floorDetails, $calculatedHeight);
		}
		
		function getBuildingSummaryDetails()
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
			
			$q = "
			SELECT 
				tbuilding.class , SUM(CAST(REPLACE(tsuite.suite_area, ',', '') AS SIGNED)) as suite_area
			FROM 
			tbuilding 
			JOIN tsuite ON tsuite.idtbuilding = tbuilding.idtbuilding
			WHERE 
				idtsubmarket IN (SELECT idtsubmarket FROM tsubmarket WHERE idtmarket = $idtmarket )
				AND tbuilding.class IN ('A', 'AA', 'AAA', 'B', 'C')
				AND UPPER(tbuilding.tstatus) = 'COMPLETED'  GROUP BY tbuilding.class
			";
			$suiteAreaDetails = array();
			if($result = mysqli_query($mysqliObj, $q))
			{
				$avg = 0;
				while($eachRow = mysqli_fetch_assoc($result))
				{
					if($eachRow["class"] == "AA" || $eachRow["class"] == "AAA")
					{
						$suiteAreaDetails["AA"] = $eachRow["suite_area"];
					}
					else
					{
						if(!isset($suiteAreaDetails[trim($eachRow["class"])]))
							$suiteAreaDetails[trim($eachRow["class"])] = 0;
						$suiteAreaDetails[trim($eachRow["class"])] += (int)$eachRow["suite_area"];
					}
				}
			}
			
			$q = "SELECT 
					tbuilding.class, COUNT(tbuilding.idtbuilding) as totalBuildings, SUM(CAST(REPLACE(tbuilding.grossofficearea, ',', '') AS SIGNED)) as officeArea
					, ROUND(
						AVG(
							CASE 
								WHEN yearbuilt IS NOT NULL AND yearbuilt > 0 
								THEN YEAR(CURDATE()) - yearbuilt
								ELSE NULL
							END
						), 2
					) AS year_difference
				FROM 
				tbuilding 
				JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
				JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto
				WHERE 
					idtsubmarket IN (SELECT idtsubmarket FROM tsubmarket WHERE idtmarket = $idtmarket )
					AND tbuilding.class IN ('A', 'AA', 'AAA', 'B', 'C')
					AND UPPER(tbuilding.tstatus) = 'COMPLETED' 
					AND tfloors.number = 1 GROUP BY tbuilding.class ";
			//echo $q;
			$buildingDetails = array(
				"A" => array("totalBuildings" => 0, "officeArea" => 0, "year_difference" => 0, "stalls" => 0),
				"AA" => array("totalBuildings" => 0, "officeArea" => 0, "year_difference" => 0, "stalls" => 0),
				"B" => array("totalBuildings" => 0, "officeArea" => 0, "year_difference" => 0, "stalls" => 0),
				"C" => array("totalBuildings" => 0, "officeArea" => 0, "year_difference" => 0, "stalls" => 0),
				
				"Apartments" => array("totalBuildings" => 0, "officeArea" => 0, "year_difference" => 0, "stalls" => 0),
				"Condominiums" => array("totalBuildings" => 0, "officeArea" => 0, "year_difference" => 0, "stalls" => 0),
				"Hotel" => array("totalBuildings" => 0, "officeArea" => 0, "year_difference" => 0, "stalls" => 0),
				"Retail" => array("totalBuildings" => 0, "officeArea" => 0, "year_difference" => 0, "stalls" => 0),
				"GOV" => array("totalBuildings" => 0, "officeArea" => 0, "year_difference" => 0, "stalls" => 0),
				"MED" => array("totalBuildings" => 0, "officeArea" => 0, "year_difference" => 0, "stalls" => 0),
				"EDU" => array("totalBuildings" => 0, "officeArea" => 0, "year_difference" => 0, "stalls" => 0),
				"SENIOR" => array("totalBuildings" => 0, "officeArea" => 0, "year_difference" => 0, "stalls" => 0),
				"PRKS" => array("totalBuildings" => 0, "officeArea" => 0, "year_difference" => 0, "stalls" => 0),
			);
			
			$buildingDetails["officeSuite"] = $suiteAreaDetails;
			//echo "<pre>";print_r($buildingDetails["A"]);
			if($result = mysqli_query($mysqliObj, $q))
			{
				$avg = 0;
				while($eachRow = mysqli_fetch_assoc($result))
				{
					//print_r($eachRow);
					if($eachRow["class"] == "AA" || $eachRow["class"] == "AAA")
					{
						$buildingDetails["AA"]["totalBuildings"] += (int)$eachRow["totalBuildings"];
						$buildingDetails["AA"]["officeArea"] += (int)$eachRow["officeArea"];
						if($buildingDetails["AA"]["year_difference"] == 0)
							$buildingDetails["AA"]["year_difference"] = (int)$eachRow["year_difference"];
						else
							$buildingDetails["AA"]["year_difference"] = Round(((int)$eachRow["year_difference"] + $buildingDetails["AA"]["year_difference"])/ 2, 0);
							
					}
					else
					{
						$buildingDetails[trim($eachRow["class"])]["totalBuildings"] += (int)$eachRow["totalBuildings"];
						$buildingDetails[trim($eachRow["class"])]["officeArea"] += (int)$eachRow["officeArea"];
						$buildingDetails[trim($eachRow["class"])]["year_difference"] = (int)$eachRow["year_difference"];
					}
				}
				mysqli_free_result($result);
				unset($row);
			}
			else
			{
				$this->status = "INVALID_QUERY";
			}
			
			$q = "SELECT 
					tbuilding.class, COUNT(tbuilding.idtbuilding) as totalBuildings, SUM(units) as officeArea
					, ROUND(
						AVG(
							CASE 
								WHEN yearbuilt IS NOT NULL AND yearbuilt > 0 
								THEN YEAR(CURDATE()) - yearbuilt
								ELSE NULL
							END
						), 2
					) AS year_difference
				FROM 
				tbuilding 
				JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
				JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto
				WHERE 
					idtsubmarket IN (SELECT idtsubmarket FROM tsubmarket WHERE idtmarket = $idtmarket )
					AND tbuilding.class IN ('APT', 'MDU', 'SENIOR')
					AND UPPER(tbuilding.tstatus) = 'COMPLETED' 
					AND tfloors.number = 1 GROUP BY tbuilding.class ";
			//echo $q;
			
			//echo "<pre>";print_r($buildingDetails["A"]);
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$class = "Condominiums";
					if(trim($eachRow["class"]) == "APT")
					{
						$class = "Apartments";
					}
					else if(trim($eachRow["class"]) == "SENIOR")
					{
						$class = "SENIOR";
					}
					$buildingDetails[$class]["year_difference"] += (int)$eachRow["year_difference"];
					$buildingDetails[$class]["totalBuildings"] += (int)$eachRow["totalBuildings"];
					$buildingDetails[$class]["officeArea"] += (int)$eachRow["officeArea"];
				}
				mysqli_free_result($result);
				unset($row);
			}
			else
			{
				$this->status = "INVALID_QUERY";
			}
			$q = "SELECT 
					tbuilding.class, COUNT(tbuilding.idtbuilding) as totalBuildings, SUM(hoteldoors) as officeArea
					, ROUND(
						AVG(
							CASE 
								WHEN yearbuilt IS NOT NULL AND yearbuilt > 0 
								THEN YEAR(CURDATE()) - yearbuilt
								ELSE NULL
							END
						), 2
					) AS year_difference
				FROM 
				tbuilding 
				JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
				JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto
				WHERE 
					idtsubmarket IN (SELECT idtsubmarket FROM tsubmarket WHERE idtmarket = $idtmarket )
					AND tbuilding.class IN ('HOTEL')
					AND UPPER(tbuilding.tstatus) = 'COMPLETED' 
					AND tfloors.number = 1 GROUP BY tbuilding.class ";
			//echo $q;
			
			//echo "<pre>";print_r($buildingDetails["A"]);
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$buildingDetails["Hotel"]["totalBuildings"] += (int)$eachRow["totalBuildings"];
					$buildingDetails["Hotel"]["officeArea"] += (int)$eachRow["officeArea"];
					$buildingDetails["Hotel"]["year_difference"] += (int)$eachRow["year_difference"];
				}
				mysqli_free_result($result);
				unset($row);
			}
			else
			{
				$this->status = "INVALID_QUERY";
			}
			$q = "SELECT 
					tbuilding.class, COUNT(tbuilding.idtbuilding) as totalBuildings, SUM(CAST(REPLACE(tbuilding.grossretailarea, ',', '') AS SIGNED)) as officeArea
				FROM 
				tbuilding 
				JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
				JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto
				WHERE 
					idtsubmarket IN (SELECT idtsubmarket FROM tsubmarket WHERE idtmarket = $idtmarket )
					AND lower(tbuilding.class) IN ('retail')
					AND UPPER(tbuilding.tstatus) = 'COMPLETED' 
					AND tfloors.number = 1 GROUP BY tbuilding.class ";
			//echo $q;
			
			//echo "<pre>";print_r($buildingDetails["A"]);
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$buildingDetails["Retail"]["totalBuildings"] += (int)$eachRow["totalBuildings"];
					$buildingDetails["Retail"]["officeArea"] += (int)$eachRow["officeArea"];
				}
				mysqli_free_result($result);
				unset($row);
			}
			else
			{
				$this->status = "INVALID_QUERY";
			}
			
			$q = "SELECT 
					tbuilding.class, COUNT(tbuilding.idtbuilding) as totalBuildings, SUM(CAST(REPLACE(tbuilding.grossofficearea, ',', '') AS SIGNED)) as officeArea
				FROM 
				tbuilding 
				JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
				JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto
				WHERE 
					idtsubmarket IN (SELECT idtsubmarket FROM tsubmarket WHERE idtmarket = $idtmarket )
					AND lower(tbuilding.class) IN ('gov')
					AND UPPER(tbuilding.tstatus) = 'COMPLETED' 
					AND tfloors.number = 1 GROUP BY tbuilding.class ";
			//echo $q;
			
			//echo "<pre>";print_r($buildingDetails["A"]);
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$buildingDetails["GOV"]["totalBuildings"] += (int)$eachRow["totalBuildings"];
					$buildingDetails["GOV"]["officeArea"] += (int)$eachRow["officeArea"];
				}
				mysqli_free_result($result);
				unset($row);
			}
			else
			{
				$this->status = "INVALID_QUERY";
			}
			
			$q = "SELECT 
					tbuilding.class, COUNT(tbuilding.idtbuilding) as totalBuildings, SUM(CAST(REPLACE(tbuilding.grossofficearea, ',', '') AS SIGNED)) as officeArea
				FROM 
				tbuilding 
				JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
				JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto
				WHERE 
					idtsubmarket IN (SELECT idtsubmarket FROM tsubmarket WHERE idtmarket = $idtmarket )
					AND lower(tbuilding.class) IN ('edu', 'med')
					AND UPPER(tbuilding.tstatus) = 'COMPLETED' 
					AND tfloors.number = 1 GROUP BY tbuilding.class ";
			//echo $q;
			
			//echo "<pre>";print_r($buildingDetails["A"]);
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$buildingDetails[$eachRow["class"]]["totalBuildings"] += (int)$eachRow["totalBuildings"];
					$buildingDetails[$eachRow["class"]]["officeArea"] += (int)$eachRow["officeArea"];
				}
				mysqli_free_result($result);
				unset($row);
			}
			else
			{
				$this->status = "INVALID_QUERY";
			}
			
			
			$q = "SELECT 
					tbuilding.class, COUNT(tbuilding.idtbuilding) as totalBuildings, SUM(CAST(REPLACE(tbuilding.parkingstalls, ',', '') AS SIGNED)) as stalls
				FROM 
				tbuilding 
				JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
				JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto
				WHERE 
					idtsubmarket IN (SELECT idtsubmarket FROM tsubmarket WHERE idtmarket = $idtmarket )
					AND lower(tbuilding.class) IN ('prks')
					AND UPPER(tbuilding.tstatus) = 'COMPLETED' 
					AND tfloors.number = 1 GROUP BY tbuilding.class ";
			//echo $q;
			
			//echo "<pre>";print_r($buildingDetails["A"]);
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$buildingDetails[$eachRow["class"]]["totalBuildings"] += (int)$eachRow["totalBuildings"];
					$buildingDetails[$eachRow["class"]]["stalls"] += (int)$eachRow["stalls"];
				}
				mysqli_free_result($result);
				unset($row);
			}
			else
			{
				$this->status = "INVALID_QUERY";
			}
			
			return $buildingDetails;
		}
		
		function getSubmarketDetails()
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
			
			$q = "SELECT idtsubmarket, ssubname, idtcamera, idtmarket FROM tsubmarket WHERE idtmarket = $idtmarket ORDER BY ssubname ";
			
			$submarketDetails = array();
			
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$eachRow["ssubname"] = $this->skipUTFEncode($eachRow["ssubname"]);
					$submarketDetails[] = $eachRow;
				}
				mysqli_free_result($result);
				unset($row);
			}
			return $submarketDetails;
		}
		
		function getRetailBuildingData($flag = 1)
		{
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$q = "SELECT * FROM tretailbuildings WHERE is_retail_entry = $flag ";//Skipping Market for now
			
			$retailBuildings = array();
			
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$retailBuildings[$eachRow["idtbuilding"]] = $eachRow;
				}
				mysqli_free_result($result);
				unset($row);
			}
			return $retailBuildings;
		}
		
		function getFullRetailBuildingMapping()
		{
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$q = "SELECT tretailbuildings.*, tbuilding.class FROM tretailbuildings LEFT JOIN tbuilding on tbuilding.idtbuilding = tretailbuildings.idtbuilding WHERE reference_row = 0 ";
			
			$buildingMap = array();
			
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$eachRow["buildings"] = array();
					$q = "SELECT tbuilding.idtbuilding, skip_fog, tbuilding.class FROM tretailbuildings LEFT JOIN tbuilding on tbuilding.idtbuilding = tretailbuildings.idtbuilding WHERE reference_row = '".$eachRow["idtretailbuildings"]."' ";
			
					$innerBuildings = array();
					
					if($res = mysqli_query($mysqliObj, $q))
					{
						while($r = mysqli_fetch_assoc($res))
						{
							$eachRow["buildings"][] = $r;
						}
					}
					$buildingMap[$eachRow["idtbuilding"]] = $eachRow;
				}
				mysqli_free_result($result);
				unset($row);
			}
			return $buildingMap;
		}
		
		function getActiveUnitDetails($idtmarket)
		{
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$q = "SELECT tpartialunit.*, tbuilding.basefloorheight, tbuilding.altitude, tbuilding.floors, tcoords.coords, tfloors.floor_height FROM tpartialunit
				LEFT JOIN tbuilding on tbuilding.idtbuilding = tpartialunit.idtbuilding
				LEFT JOIN tsubmarket on tsubmarket.idtsubmarket = tbuilding.idtsubmarket
				LEFT JOIN tcoords on tcoords.idtcoords = tpartialunit.idtcoords
				LEFT JOIN tfloors on tfloors.idtbuilding = tpartialunit.idtbuilding
				WHERE 1 and tsubmarket.idtmarket = '".$idtmarket."' AND tpartialunit.is_active = 1 AND tfloors.number = tpartialunit.floor_number
			";
			
			$activeUnits = array();
			
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$eachRow["coordsOriginal"] = trim($eachRow["coords"], " ");
					$eachRow["coords"] = trim($eachRow["coords"], " ");
					$eachRow["coords"] = trim($eachRow["coords"], "\t");
					$eachRow["coords"] = trim(trim($eachRow["coords"], ""), ",**");
					$eachRow["coords"] = str_replace("**", "", $eachRow["coords"]);
					
					$activeUnits[$eachRow["idtbuilding"]][] = $eachRow;
				}
				mysqli_free_result($result);
				unset($row);
			}
			return $activeUnits;
		}
		
		function getApp10CityBuildingCount()
		{
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$cityMarketArray = array();
			$q = "SELECT idtcity, idtmarket, display_order FROM tapp10market";
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					if(isset($cityMarketArray[$eachRow["idtcity"]]))
					{
						$temp = $cityMarketArray[$eachRow["idtcity"]];
						$cityMarketArray[$eachRow["idtcity"]] = array();
						array_push($cityMarketArray[$eachRow["idtcity"]], $temp);
						array_push($cityMarketArray[$eachRow["idtcity"]], $eachRow["idtmarket"]);
					}
					else
					{
						$cityMarketArray[$eachRow["idtcity"]] = $eachRow["idtmarket"];
					}
				}
			}
			/*
			$cityMarketArray = array(
				2 => 1,	1 => 3,	12 => 18,	15 => 26,	23 => 36,	31 => 45,	34 => 48,	53 => 70,	68 => 77,	69 => 78,	3 => 2,	6 => 12,	8 => 14,	4 => array(7, 8, 9),	25 => 38,	5 => 10,	19 => 31,	35 => 49,	45 => 62
			);
			*/
			//echo "<pre>";print_r($cityMarketArray);
			$citywiseCounts = array();
			$marketwiseCounts = array();
			//echo "<pre>";//print_r($cityMarketArray);
			foreach($cityMarketArray as $idtcity => $eachMarket)
			{
				//print_r($eachMarket);
				$citywiseCounts[$idtcity] = $this->getAClassBuildingCount($eachMarket);
				if(is_array($eachMarket))
				{
					/*
					foreach($eachMarket as $individualMarket)
					{
						if(is_array($individualMarket[0]))
						{
							foreach($individualMarket[0] as $mkt)
								$marketwiseCounts[$mkt] = $this->getAClassBuildingCount($mkt);
						}
						else
						{
							$marketwiseCounts[$individualMarket] = $this->getAClassBuildingCount($individualMarket);
						}
					}
					*/
				}
				else
				{
					$marketwiseCounts[$eachMarket] = $citywiseCounts[$idtcity];
				}
			}
			return array($citywiseCounts, $marketwiseCounts);
		}
		
		function getApp10CityCameraDetails()
		{
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$q = "SELECT tcity.idtcity, tcamera.*, tcity.altitudeadjustment FROM tcity
			JOIN tcamera ON tcity.skylineidtcamera = tcamera.idtcamera	";//Do it for all
			$citywiseCamera = array();
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$citywiseCamera[] = $eachRow;
				}
				mysqli_free_result($result);
			}
			return $citywiseCamera;
		}
		
		function getMarketSalesData($idtcity)
		{
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$q = "SELECT tinvestmentsales.*, tbuilding.class AS buildingclass, (CAST(REPLACE(tbuilding.grossofficearea, ',', '') AS SIGNED) + CAST(REPLACE(tbuilding.grossretailarea, ',', '') AS SIGNED) ) as grossofficearea, tbuilding.sbuildingname, tbuilding.address, tbuilding.altitude, tbuilding.floors, tbuilding.basefloorheight, tbuilding.idtsubmarket, tsubmarket.ssubname, 
			tfloors.idtfloors, tfloors.idtcoords_auto, tfloors.number, tfloors.floor_height, 
			tcoords.coords
			, vendor_company.companyname as vendor_company_name
			, purchaser_company.companyname as purchaser_company_name
			, (CASE 
								WHEN yearbuilt IS NOT NULL AND yearbuilt > 0 
								THEN YEAR(CURDATE()) - yearbuilt
								ELSE NULL
							END) year_difference
			FROM 
			`tinvestmentsales` 
				LEFT JOIN tbuilding ON tbuilding.idtbuilding = tinvestmentsales.idtbuilding
				LEFT JOIN tsubmarket ON tsubmarket.idtsubmarket = tbuilding.idtsubmarket
				LEFT JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
				LEFT JOIN tcompany as vendor_company on tinvestmentsales.vendor = vendor_company.idtcompany
				LEFT JOIN tcompany as purchaser_company on tinvestmentsales.purchaser = purchaser_company.idtcompany
				LEFT JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto
			WHERE tfloors.number = 1 AND tinvestmentsales.idtcity = $idtcity AND tinvestmentsales.is_active = 1	";//Do it for all
			$details = array();
			$detailsYearWise = array();
			//echo $q;
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					if($eachRow["office_conversion"] == "Yes")
						$eachRow["office_conversion"] = "Office Conversion";
					else
						$eachRow["office_conversion"] = "Office";
					
					$eachRow["address"] = $this->skipUTFEncode($eachRow["address"]);
					$eachRow["coordsOriginal"] = trim($eachRow["coords"], " ");
					$eachRow["coords"] = trim($eachRow["coords"], " ");
					$eachRow["coords"] = trim($eachRow["coords"], "\t");
					$eachRow["coords"] = trim(trim($eachRow["coords"], ""), ",**");
					$eachRow["coords"] = str_replace("**", "", $eachRow["coords"]);
					
					$details[] = $eachRow;
					$detailsYearWise[$eachRow["sale_year"]][] = $eachRow;
				}
				mysqli_free_result($result);
			}
			return array($details, $detailsYearWise);
		}
		
		function getMarketSalesDataSummary($idtcity)
		{
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$q = "SELECT office_conversion, tinvestmentsales.sale_year, COUNT(tinvestmentsales.idtbuilding) AS totalbuildings, SUM(CAST(REPLACE(tbuilding.grossofficearea, ',', '') AS SIGNED) + CAST(REPLACE(tbuilding.grossretailarea, ',', '') AS SIGNED)) AS grossofficearea, SUM(sold_price) AS soldprice
			FROM 
			`tinvestmentsales` 
				LEFT JOIN tbuilding ON tbuilding.idtbuilding = tinvestmentsales.idtbuilding
				LEFT JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
				LEFT JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto
			WHERE tfloors.number = 1 AND tinvestmentsales.is_active = 1 AND tinvestmentsales.idtcity = $idtcity GROUP BY office_conversion ";
			
			$allSuiteDetails = array();
			$q = "SELECT tbuilding.class, tinvestmentsales.sale_year, office_conversion, COUNT(tinvestmentsales.idtbuilding) AS totalbuildings, SUM(CAST(REPLACE(tbuilding.grossofficearea, ',', '') AS SIGNED) + CAST(REPLACE(tbuilding.grossretailarea, ',', '') AS SIGNED)) AS grossofficearea, SUM(sold_price) AS soldprice
			FROM 
			`tinvestmentsales` 
				LEFT JOIN tbuilding ON tbuilding.idtbuilding = tinvestmentsales.idtbuilding
				LEFT JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
				LEFT JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto
			WHERE tfloors.number = 1 AND tinvestmentsales.is_active = 1 AND tinvestmentsales.idtcity = $idtcity GROUP BY tbuilding.class ";
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$allSuiteDetails[$eachRow["class"]] = $eachRow;
				}
				mysqli_free_result($result);
			}
			
			$q = "SELECT tinvestmentsales.sale_year, tbuilding.class, office_conversion, COUNT(tinvestmentsales.idtbuilding) AS totalbuildings, SUM(CAST(REPLACE(tbuilding.grossofficearea, ',', '') AS SIGNED) + CAST(REPLACE(tbuilding.grossretailarea, ',', '') AS SIGNED)) AS grossofficearea, SUM(sold_price) AS soldprice
			FROM 
			`tinvestmentsales` 
				LEFT JOIN tbuilding ON tbuilding.idtbuilding = tinvestmentsales.idtbuilding
				LEFT JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
				LEFT JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto
			WHERE tfloors.number = 1 AND tinvestmentsales.is_active = 1 AND tinvestmentsales.idtcity = $idtcity GROUP BY tinvestmentsales.sale_year, tbuilding.class  order by sale_year DESC ";
			$suiteDetails = array();
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					/*
					$officeConversion = "Office";
					if($eachRow["office_conversion"] == "Yes")
						$eachRow["office_conversion"] = "Office Conversion";
					else
						$eachRow["office_conversion"] = "Office";
					*/
					$suiteDetails[$eachRow["sale_year"]][$eachRow["class"]] = $eachRow;
				}
				mysqli_free_result($result);
			}
			return array($suiteDetails, $allSuiteDetails);
		}
		
		function getGroupColorCodes($class_name)
		{
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$q = "SELECT class_name, range_start, range_end, range_text, hex_color, group_order FROM tclasscolor WHERE is_group = 1 AND class_name = '".$class_name."' ORDER BY group_order ";
			$data = array();
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$data[] = $eachRow;
				}
				mysqli_free_result($result);
			}
			return $data;
		}
		
		function getFloorPlansForCity($idtcity)
		{
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$q = "SELECT tinvestmentsales.*, tbuilding.class AS buildingclass, CAST(REPLACE(tbuilding.grossofficearea, ',', '') AS SIGNED) as grossofficearea, tbuilding.sbuildingname, tbuilding.address, tbuilding.altitude, tbuilding.floors, tbuilding.basefloorheight, tsubmarket.ssubname, 
			tfloors.idtfloors, tfloors.idtcoords_auto, tfloors.number, tfloors.floor_height, 
			tcoords.coords
			FROM 
			`tinvestmentsales` 
				LEFT JOIN tbuilding ON tbuilding.idtbuilding = tinvestmentsales.idtbuilding
				LEFT JOIN tsubmarket ON tsubmarket.idtsubmarket = tbuilding.idtsubmarket
				LEFT JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
				LEFT JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto
			WHERE tfloors.number = 1 AND tinvestmentsales.is_active = 1 AND tinvestmentsales.idtcity = $idtcity	";//Do it for all
			$details = array();
			//echo $q;
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					if($eachRow["office_conversion"] == "Yes")
						$eachRow["office_conversion"] = "Office Conversion";
					else
						$eachRow["office_conversion"] = "Office";
					
					$eachRow["address"] = $this->skipUTFEncode($eachRow["address"]);
					$eachRow["coordsOriginal"] = trim($eachRow["coords"], " ");
					$eachRow["coords"] = trim($eachRow["coords"], " ");
					$eachRow["coords"] = trim($eachRow["coords"], "\t");
					$eachRow["coords"] = trim(trim($eachRow["coords"], ""), ",**");
					$eachRow["coords"] = str_replace("**", "", $eachRow["coords"]);
					
					$details[] = $eachRow;
				}
				mysqli_free_result($result);
			}
			return $details;
		}
		
		function getFloorPlansSummaryForCity($idtcity)
		{
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$q = "SELECT office_conversion, COUNT(tinvestmentsales.idtbuilding) AS totalbuildings, SUM(CAST(REPLACE(tbuilding.grossofficearea, ',', '') AS SIGNED)) AS grossofficearea, SUM(sold_price) AS soldprice
			FROM 
			`tinvestmentsales` 
				LEFT JOIN tbuilding ON tbuilding.idtbuilding = tinvestmentsales.idtbuilding
				LEFT JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
				LEFT JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto
			WHERE tfloors.number = 1 AND tinvestmentsales.is_active = 1 AND tinvestmentsales.idtcity = $idtcity GROUP BY office_conversion ";
			$suiteDetails = array();
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$officeConversion = "Office";
					if($eachRow["office_conversion"] == "Yes")
						$eachRow["office_conversion"] = "Office Conversion";
					else
						$eachRow["office_conversion"] = "Office";
					$suiteDetails[] = $eachRow;
				}
				mysqli_free_result($result);
			}
			return $suiteDetails;
		}
		
		function getSydneyArealyticSuites()
		{
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$q = "SELECT tarealytics_suite.PropertyUse, tarealytics_suite.ListingTypeName AS LeaseType, tarealytics_suite.FloorNumber, tarealytics_suite.SuiteNumber, CAST(availableSM AS UNSIGNED) AS SuiteSize,
			CAST(TotalAvailableSM AS UNSIGNED) AS TotalSuiteSize, ListingStatusName, tarealytics_suite.PropertyId, tarealytics_suite.SuiteId, tarealytics_suite.ClassTypeName AS PropertyClass, 
			tbuilding.idtbuilding, tbuilding.class AS buildingclass, tbuilding.address, tbuilding.altitude, tbuilding.floors, tbuilding.basefloorheight, 

			tarealytics_suite.PropertyName, tarealytics_suite.IsVacant, tarealytics_suite.Askingratehigh, tarealytics_suite.Askingratelow, totalmonthlyrate, ListingCompanyName, ListingBroker1, 
			ListingCreateDate, SuiteStatusName, 
			((CAST(totalmonthlyrate AS UNSIGNED) / CAST(availableSM AS UNSIGNED)) * 12) AS PricePerSQM,
			tfloors.idtfloors, tfloors.idtcoords_auto, tfloors.number, tfloors.floor_height, 
			tcoords.coords
			FROM 
			`tarealytics_suite` 
				LEFT JOIN tarealytics_property ON tarealytics_property.PropertyID = tarealytics_suite.PropertyId
				LEFT JOIN tarealytics_map ON tarealytics_map.al_building_id = tarealytics_property.AlBuildingId
				LEFT JOIN tbuilding ON tbuilding.idtbuilding = tarealytics_map.idtbuilding
				LEFT JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
				LEFT JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto
			WHERE tfloors.number = 1 AND ListingStatusName = 'Active' 	";//Do it for all
			$suiteDetails = array();
			$summaryDetails = array(
				"Direct" => array(),
				"Sublease" => array(),
				"Co-Working" => array(),
			);
			
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$eachRow["PropertyName"] = $this->skipUTFEncode($eachRow["PropertyName"]);
					$eachRow["address"] = $this->skipUTFEncode($eachRow["address"]);
					$eachRow["ListingStatusName"] = $this->skipUTFEncode($eachRow["ListingStatusName"]);
					$eachRow["SuiteStatusName"] = $this->skipUTFEncode($eachRow["SuiteStatusName"]);
					$eachRow["ListingCompanyName"] = $this->skipUTFEncode($eachRow["ListingCompanyName"]);
					$eachRow["ListingBroker1"] = $this->skipUTFEncode($eachRow["ListingBroker1"]);
					$eachRow["coordsOriginal"] = trim($eachRow["coords"], " ");
					$eachRow["coords"] = trim($eachRow["coords"], " ");
					$eachRow["coords"] = trim($eachRow["coords"], "\t");
					$eachRow["coords"] = trim(trim($eachRow["coords"], ""), ",**");
					$eachRow["coords"] = str_replace("**", "", $eachRow["coords"]);
					if($eachRow["PricePerSQM"] != null)
						$eachRow["PricePerSQM"] = round($eachRow["PricePerSQM"], 0);
					else
						$eachRow["PricePerSQM"] = 0;
					$suiteDetails[] = $eachRow;
				}
				mysqli_free_result($result);
			}
			return $suiteDetails;
		}
		
		function getSydneyArealyticSummary()
		{
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$q = "SELECT tarealytics_suite.ListingTypeName AS LeaseType, COUNT(DISTINCT(tbuilding.idtbuilding)) AS buildings, COUNT(tarealytics_suite.SuiteId) AS units, 
				CAST(SUM(COALESCE(AvailableSM, TotalAvailableSM)) AS UNSIGNED) AS availablearea
			FROM 
			`tarealytics_suite` 
				LEFT JOIN tarealytics_property ON tarealytics_property.PropertyID = tarealytics_suite.PropertyId
				LEFT JOIN tarealytics_map ON tarealytics_map.al_building_id = tarealytics_property.AlBuildingId
				LEFT JOIN tbuilding ON tbuilding.idtbuilding = tarealytics_map.idtbuilding
				LEFT JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
				LEFT JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto
			WHERE tfloors.number = 1 AND ListingStatusName = 'Active' GROUP BY LeaseType";//Do it for all
			$suiteDetails = array();
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$suiteDetails[$eachRow["LeaseType"]] = $eachRow;
				}
				mysqli_free_result($result);
			}
			return $suiteDetails;
		}
		
		/*
			window.priceSQMRange.push({low: 1800, high: 10000, color: "#FF0000"});
			window.priceSQMRange.push({low: 1400, high: 1800, color: "#FF8000"});
			window.priceSQMRange.push({low: 1200, high: 1400, color: "#FFFF00"});
			window.priceSQMRange.push({low: 800, high: 1200, color: "#00CC00"});
			window.priceSQMRange.push({low: 500, high: 800, color: "#00FFFF"});
			window.priceSQMRange.push({low: 0, high: 500, color: "#0080FF"});
		*/
		function getSydneyArealyticPricePerSQMSummary()
		{
			$range = array();
			$range[] = array("low" => 1800, "high" => 120000, "data" => array());
			$range[] = array("low" => 1400, "high" => 1800, "data" => array());
			$range[] = array("low" => 1200, "high" => 1400, "data" => array());
			$range[] = array("low" => 800, "high" => 1200, "data" => array());
			$range[] = array("low" => 500, "high" => 800, "data" => array());
			$range[] = array("low" => 0, "high" => 500, "data" => array());
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			foreach($range as $key => $eachRow)
			{
				$q = "SELECT tbuilding.idtbuilding, tarealytics_suite.SuiteId, ((CAST(totalmonthlyrate AS UNSIGNED) / CAST(availableSM AS UNSIGNED)) * 12) AS PricePerSQM, 
					CAST(COALESCE(AvailableSM, TotalAvailableSM) AS UNSIGNED) AS availablearea
				FROM 
				`tarealytics_suite` 
					LEFT JOIN tarealytics_property ON tarealytics_property.PropertyID = tarealytics_suite.PropertyId
					LEFT JOIN tarealytics_map ON tarealytics_map.al_building_id = tarealytics_property.AlBuildingId
					LEFT JOIN tbuilding ON tbuilding.idtbuilding = tarealytics_map.idtbuilding
					
				WHERE ListingStatusName = 'Active' AND ((CAST(totalmonthlyrate AS UNSIGNED) / CAST(availableSM AS UNSIGNED)) * 12) BETWEEN ".$eachRow["low"]." AND ".$eachRow["high"]." ";
				$suiteDetails = array("buildings" => 0, "suites" => 0, "availablearea" => 0, "vacancy" => 0);
				if($result = mysqli_query($mysqliObj, $q))
				{
					$uniqueBuildings = array();
					$availableArea = 0;
					$availableSuites = 0;
					while($row = mysqli_fetch_assoc($result))
					{
						if(!in_array($row["idtbuilding"], $uniqueBuildings))
							$uniqueBuildings[] = $row["idtbuilding"];
						$availableArea += $row["availablearea"];
						$availableSuites++;
					}
					mysqli_free_result($result);
					$suiteDetails["buildings"] = count($uniqueBuildings);
					$suiteDetails["suites"] = $availableSuites;
					$suiteDetails["availablearea"] = $availableArea;
					$suiteDetails["vacancy"] = 0;
				}
				$range[$key]["data"] = $suiteDetails;
			}
			
			return $range;
		}
		
		function getSydneyArealyticJoins()
		{
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$q = "SELECT tbuilding.idtbuilding, tbuilding.address, tbuilding.altitude, tbuilding.floors, tbuilding.basefloorheight, 
			tfloors.idtfloors, tfloors.idtcoords_auto, tfloors.number, tfloors.floor_height, 
			tcoords.coords, tarealytics_map.al_building_id
			FROM 
				tarealytics_map 
				LEFT JOIN tbuilding ON tbuilding.idtbuilding = tarealytics_map.idtbuilding
				LEFT JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
				LEFT JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto
			WHERE tfloors.number = 1 AND tfloors.idtcoords_auto is not null AND tfloors.idtcoords_auto != 0 AND tcoords.coords != '' AND tbuilding.altitude is not null  ";
			$suiteDetails = array();
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$eachRow["PropertyName"] = $this->skipUTFEncode($eachRow["PropertyName"]);
					$eachRow["address"] = $this->skipUTFEncode($eachRow["address"]);
					$eachRow["ListingStatusName"] = $this->skipUTFEncode($eachRow["ListingStatusName"]);
					$eachRow["SuiteStatusName"] = $this->skipUTFEncode($eachRow["SuiteStatusName"]);
					$eachRow["ListingCompanyName"] = $this->skipUTFEncode($eachRow["ListingCompanyName"]);
					$eachRow["ListingBroker1"] = $this->skipUTFEncode($eachRow["ListingBroker1"]);
					$eachRow["coordsOriginal"] = trim($eachRow["coords"], " ");
					$eachRow["coords"] = trim($eachRow["coords"], " ");
					$eachRow["coords"] = trim($eachRow["coords"], "\t");
					$eachRow["coords"] = trim(trim($eachRow["coords"], ""), ",**");
					$eachRow["coords"] = str_replace("**", "", $eachRow["coords"]);
					$suiteDetails[] = $eachRow;
				}
				mysqli_free_result($result);
			}
			return $suiteDetails;
		}
		
		function getMarketBuildingsForAutosuggest($idtmarket)
		{
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$q = "SELECT tbuilding.idtbuilding as id, sbuildingname as name, address, 0 as `index`, 0 as entityIndex, tcoords.coords, tbuilding.basefloorheight
			FROM 
				tbuilding
				LEFT JOIN tfloors ON tfloors.idtbuilding = tbuilding.idtbuilding
				LEFT JOIN tcoords ON tcoords.idtcoords = tfloors.idtcoords_auto
				JOIN tsubmarket on tsubmarket.idtsubmarket = tbuilding.idtsubmarket
			WHERE tfloors.number = 1 and tcoords.coords IS NOT NULL AND tcoords.coords != '' AND tsubmarket.idtmarket = '".$idtmarket."' AND lower(tbuilding.tstatus) != 'deleted' AND lower(tbuilding.tstatus) != 'delete' ";
			$buildings = array();
			if($result = mysqli_query($mysqliObj, $q))
			{
				$cnt = 0;
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$eachRow["coords"] = trim($eachRow["coords"], " ");
					$eachRow["coords"] = trim($eachRow["coords"], "\t");
					$eachRow["coords"] = trim(trim($eachRow["coords"], ""), ",**");
					$eachRow["coords"] = str_replace("**", "", $eachRow["coords"]);
					$eachRow["index"] = $cnt;
					
					$eachRow["name"] = $this->skipUTFEncode($eachRow["name"]);
					$eachRow["address"] = $this->skipUTFEncode($eachRow["address"]);
					$buildings[] = $eachRow;
					$cnt++;
				}
				mysqli_free_result($result);
			}
			return $buildings;
		}
		
		function getApp10MarketDetails($userId = "")
		{
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$sortOrder = array();
			$q = "SELECT idtmarket, display_order FROM tapp10market";
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$sortOrder[$eachRow["idtmarket"]] = $eachRow["display_order"];
				}
			}
			
			/*
			$sortOrder = array(
				36 => 0,	49 => 1,	62 => 2,	1 => 3,	26 => 4,	18 => 5,	3 => 6,	70 => 7,	23 => 8,	48 => 9,	45 => 10,	31 => 11,	77 => 12,	78 => 13,	2 => 14,	12 => 15,	10 => 16,	14 => 17,	7 => 18,	8 => 19,	9 => 20,	38 => 21,
			);
			*/
			$disabledMarkets = array();
			$buildingDetails = array();
			$buildingDetails["data"] = array();
			$buildingDetails["camera"] = array();
			$buildingDetails["allCitiesWithCountry"] = array();
			$buildingDetails["citiesAccessible"] = array();
			$buildingDetails["cityBoundaries"] = array();
			$buildingDetails["cityCameras"] = array();
			$buildingDetails["cameraRotation"] = array();
			$buildingDetails["cityAltitudeAdjustment"] = array();
			$buildingDetails["disabledMarkets"] = array();
			
			$markets = " null ";
			if($userId != "")
			{
				$q = "SELECT tuser_app10_access.idtapp10visualization, tuser_app10_access.idtuser, tcity.country, tmarket.idtmarket, tmarket.marketname, tapp10market.default_enabled, tapp10market.display_order, tapp10visualization.visualization_name, visualization_value, tapp10visualization.display_order 
					FROM 
					tuser_app10_access
					JOIN tapp10visualization ON tapp10visualization.idtapp10visualization = tuser_app10_access.idtapp10visualization
					JOIN tapp10market ON tapp10market.idtapp10market = tapp10visualization.idtapp10market
					JOIN tmarket ON tmarket.idtmarket = tapp10market.idtmarket
					JOIN tcity ON tcity.idtcity = tmarket.idtcity
				WHERE idtuser = ".$userId." 
				ORDER BY tapp10market.display_order, tapp10visualization.display_order ";
				$mktArray = array();
				if($result = mysqli_query($mysqliObj, $q))
				{
					while($eachRow = mysqli_fetch_assoc($result))
					{
						if(!in_array($eachRow["idtmarket"], $mktArray))
						{
							array_push($mktArray, $eachRow["idtmarket"]);
						}
						if($eachRow["default_enabled"] == 0 && in_array((int)$eachRow["idtmarket"], $disabledMarkets))
						{
							array_push($disabledMarkets, (int)$eachRow["idtmarket"]);
						}
					}
				}
				if(count($mktArray) > 0)
				{
					$markets = implode(", ", $mktArray);
				}
				else
				{
					$markets = " null ";
				}
			}
			//echo "##".$markets;
			if($markets != " null ")
			{
			
				$q = "SELECT idtmarket, smarketname, tmarket.idtcamera AS marketcamera, tcity.idtcity, tcity.scityname, tcity.country, tcity.idtcamera as citycamera, tcity.skylineidtcamera, tcity.skylineidtcamera2, tcity.areaunits, tcity.altitudeadjustment, tcity.class_aa_rename, tcity.city_boundary, tcamera.altitude AS skylinealtitude
					 FROM tmarket 
					JOIN tcity ON tcity.idtcity = tmarket.idtcity
					LEFT JOIN tcamera ON tcity.skylineidtcamera = tcamera.idtcamera
					WHERE idtmarket IN ( ".$markets." );";
					//WHERE idtmarket IN (1, 3, 18, 26, 45, 48, 70, 70, 77, 78, 36, 12, 14, 7, 8, 9, 2, 10, 38, 31, 49, 62);";
					
					//45 - Frankfurt
					//48 - Hong Kong
					//23 - Montreal
					//12 - Downtown Boston
					//14 - Downtown Seattle
					//10 - Downtown San Francisco
				//echo $q;
				$allCameras = array();
				
				
				if($result = mysqli_query($mysqliObj, $q))
				{
					while($eachRow = mysqli_fetch_assoc($result))
					{
						$eachRow["scityname"] = $this->skipUTFEncode($eachRow["scityname"]);
						
						$buildingDetails["cityBoundaries"][$eachRow["idtcity"]] = "[".$eachRow["city_boundary"]."]";
						$buildingDetails["cityCameras"][$eachRow["idtcity"]] = array( "skylineidtcamera" => $eachRow["skylineidtcamera"], "skylineidtcamera2" => $eachRow["skylineidtcamera2"], "altitudeadjustment" => $eachRow["altitudeadjustment"] );
						$buildingDetails["data"][$sortOrder[$eachRow["idtmarket"]]] = $eachRow;
						if($eachRow["marketcamera"] != null)
							$allCameras[] = $eachRow["marketcamera"];
						if($eachRow["citycamera"] != null)
							$allCameras[] = $eachRow["citycamera"];
						if($eachRow["skylineidtcamera"] != null)
							$allCameras[] = $eachRow["skylineidtcamera"];
						if($eachRow["skylineidtcamera2"] != null)
							$allCameras[] = $eachRow["skylineidtcamera2"];
					}
					mysqli_free_result($result);
					unset($row);
				}
				
				$q = "SELECT * FROM tcamera WHERE idtcamera IN (".implode(",", $allCameras).");";
				//echo $q;
				$buildingDetails["camera"] = array();
				if($result = mysqli_query($mysqliObj, $q))
				{
					while($eachRow = mysqli_fetch_assoc($result))
					{
						$buildingDetails["camera"][$eachRow["idtcamera"]] = $eachRow;
					}
					mysqli_free_result($result);
					unset($row);
				}
				
				$q = "SELECT scityname, tcity.idtcity, COUNT(tbuilding.idtbuilding) as cnt
					 FROM tmarket 
					JOIN tcity ON tcity.idtcity = tmarket.idtcity
					JOIN tsubmarket ON tsubmarket.idtmarket = tmarket.idtmarket
					JOIN tbuilding ON tbuilding.idtsubmarket = tsubmarket.idtsubmarket
					
					WHERE tmarket.idtmarket IN ( ".$markets." )  
					AND tbuilding.class IN (".$this->BuildingClasses.")
					AND (upper(tbuilding.tstatus) = 'COMPLETED' OR upper(tbuilding.tstatus) IN ( 'PROPOSED', 'UNDER CONSTRUCTION' ) ) 
					GROUP BY scityname;";
				//echo $q;
				$buildingDetails["citiesAccessible"] = array();
				if($result = mysqli_query($mysqliObj, $q))
				{
					while($eachRow = mysqli_fetch_assoc($result))
					{
						$eachRow["scityname"] = $this->skipUTFEncode($eachRow["scityname"]);
						$buildingDetails["citiesAccessible"][] = $eachRow;
					}
					mysqli_free_result($result);
					unset($row);
				}
			}

			$q = "SELECT tcity.scityname, tcity.country, COUNT(tsuite.idtsuite) AS cnt
					FROM tsuite
					JOIN tbuilding ON tbuilding.idtbuilding = tsuite.idtbuilding
					JOIN tsubmarket ON tsubmarket.idtsubmarket = tbuilding.idtsubmarket
					JOIN tmarket ON tsubmarket.idtmarket = tmarket.idtmarket
					
					JOIN tcity ON tcity.idtcity = tmarket.idtcity
					WHERE 1
					GROUP BY scityname ORDER BY tcity.country, cnt DESC ;";
			//echo $q;
			$TEMP = array();
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$eachRow["scityname"] = $this->skipUTFEncode($eachRow["scityname"]);
					$TEMP[$eachRow["scityname"]] = $eachRow["cnt"];
				}
				mysqli_free_result($result);
				unset($row);
			}
			
			$q = "SELECT tmarket.*, tcity.scityname, tcity.country, COUNT(tbuilding.idtbuilding) as cnt
					FROM `tapp10market`
					JOIN tmarket ON tmarket.idtmarket = tapp10market.idtmarket
					JOIN tsubmarket ON tsubmarket.idtmarket = tmarket.idtmarket
					JOIN tbuilding ON tbuilding.idtsubmarket = tsubmarket.idtsubmarket
					JOIN tcity ON tcity.idtcity = tmarket.idtcity
					WHERE tmarket.idtmarket IN ( SELECT idtmarket FROM tapp10market )
					AND tbuilding.class IN (".$this->BuildingClasses.")
					AND (upper(tbuilding.tstatus) IN ( 'PROPOSED', 'UNDER CONSTRUCTION', 'COMPLETED', 'PRE-LEASING' ) )
					GROUP BY scityname order by tcity.country, cnt desc ;";
			//echo $q;
			$buildingDetails["allCitiesWithCountry"] = array();
			$buildingDetails["countryWithProperties"] = array();
			$cities = array();
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$eachRow["scityname"] = $this->skipUTFEncode($eachRow["scityname"]);
					if(isset($TEMP[$eachRow["scityname"]]))
						$eachRow["floorplans"] = $TEMP[$eachRow["scityname"]];
					else
						$eachRow["floorplans"] = 0;
					$buildingDetails["allCitiesWithCountry"][$eachRow["country"]][] = $eachRow;
					array_push($cities, $eachRow["idtcity"]);
				}
				$buildingDetails["countryWithProperties"] = array();
				foreach($buildingDetails["allCitiesWithCountry"] as $country => $rows)
				{
					$arr = 0;
					foreach($rows as $eachCity)
					{
						//print_r($eachCity);
						$arr += $eachCity["cnt"];
					}
					$buildingDetails["countryWithProperties"][] = array("name" => $country, "total" => $arr);
				}
				mysqli_free_result($result);
				unset($row);
			}
			
			$q = "SELECT scityname, country FROm tcity 
				, (SELECT count(*) FROM tbuilding where tbuilding.idtsubmarket = (SELECT idtsubmarket FROM tsubmarket WHERE tsubmarket.idtcity = tcity.idtcity))
			WHERE idtcity NOT IN (".implode(",", $cities).") ORDER BY country, scityname ;";
			$q = "SELECT scityname, country , COUNT(tbuilding.idtbuilding)
				FROM tcity 
				LEFT JOIN tsubmarket ON tsubmarket.idtcity = tcity.idtcity
				LEFT JOIN tbuilding ON tbuilding.idtsubmarket = tsubmarket.idtsubmarket

				WHERE 1 AND tcity.idtcity NOT IN (".implode(",", $cities).") GROUP BY tcity.idtcity ORDER BY country, scityname ";
			//echo $q;
			$buildingDetails["allRemainingCitiesWithCountry"] = array();
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$buildingDetails["allRemainingCitiesWithCountry"][$eachRow["country"]][] = $eachRow;
				}
				mysqli_free_result($result);
				unset($row);
			}
			$q = "SELECT tmarket.idtcity, CASE
					WHEN tbuilding.class IN ('A', 'AA', 'AAA', 'B', 'C') THEN 'Office'
					WHEN tbuilding.class IN ('MDU', 'APT', 'SENIOR') THEN 'Residential'
					WHEN tbuilding.class = 'HOTEL' THEN 'Hotel'
					WHEN tbuilding.class = 'Retail' THEN 'Retail'
					ELSE 'Other'
				END AS class_group,
				COUNT(tbuilding.idtbuilding) AS cnt
					FROM tbuilding
					JOIN tsubmarket ON tsubmarket.idtsubmarket = tbuilding.idtsubmarket
					JOIN tmarket ON tmarket.idtmarket = tsubmarket.idtmarket
					WHERE 1
					AND tbuilding.class IN ( ".$this->BuildingClasses." )
					AND (UPPER(tbuilding.tstatus) IN ( 'PROPOSED', 'UNDER CONSTRUCTION', 'COMPLETED', 'PRE-LEASING' ) )
					GROUP BY tmarket.idtcity, class_group ORDER BY tmarket.idtcity, tbuilding.class, cnt DESC ;";
			//echo $q;
			$buildingDetails["citiesCounts"] = array();
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$buildingDetails["citiesCounts"][$eachRow["idtcity"]][$eachRow["class_group"]] = $eachRow["cnt"];
				}
				mysqli_free_result($result);
				unset($row);
			}
			
			$q = "SELECT * FROM tcamerarotation ";//WHERE idtcamera IN (".implode(",", $allCameras).");";
			//echo $q;
			$buildingDetails["cameraRotation"] = array();
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$buildingDetails["cameraRotation"][$eachRow["idtcamera"]] = $eachRow;
				}
				mysqli_free_result($result);
				unset($row);
			}
			
			//City Altitude Adjustments
			$q = "SELECT idtcity, altitudeadjustment FROM tcity WHERE altitudeadjustment is not null ";
			//echo $q;
			$buildingDetails["cityAltitudeAdjustment"] = array();
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$buildingDetails["cityAltitudeAdjustment"][$eachRow["idtcity"]] = (int)$eachRow["altitudeadjustment"];
				}
				mysqli_free_result($result);
				unset($row);
			}
			
			$buildingDetails["disabledMarkets"] = $disabledMarkets;
			//print_r($buildingDetails);
			return $buildingDetails;
		}
		
		function getCameraDetails()
		{
			$idtcity = 0;
			$type = "";
			$args = func_get_args();
			switch(count($args))
			{
				case 0:
					break;
				case 2:
					$idtcity = $args[0];
					$type = $args[1];
					break;
				default:
					return $this->status = 'INVALID_ACTION';
			}
			
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			//Camera Details
			$camera = array();
			$columnName = "";
			if($type == "camera")
			{
				$columnName = "idtcamera ";
			}
			else if($type == "skyline1")
			{
				$columnName = "skylineidtcamera ";
			}
			else if($type == "skyline2")
			{
				$columnName = "skylineidtcamera2 ";
			}
				
			$q = "SELECT tcamera.*, tcity.altitudeadjustment FROM tcity 
					JOIN tcamera ON tcamera.idtcamera = tcity.".$columnName."
				  WHERE idtcity = ".$idtcity;
			//echo $q;
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$camera = $eachRow;
				}
				mysqli_free_result($result);
				unset($row);
			}
			else
			{
				$this->status = "INVALID_QUERY";
			}
			
			return $camera;
		}
		
		function getBuildingCameraDetails()
		{
			$idtbuilding = 0;
			$args = func_get_args();
			switch(count($args))
			{
				case 0:
					break;
				case 1:
					$idtbuilding = $args[0];
					break;
				default:
					return $this->status = 'INVALID_ACTION';
			}
			
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			//Camera Details
			$camera = array();
			$columnName = "";
			$columnName = "idtcamera ";
				
			$q = "SELECT tcamera.* FROM tbuilding 
					JOIN tcamera ON tcamera.idtcamera = tbuilding.".$columnName."
				  WHERE idtbuilding = ".$idtbuilding;
			//echo $q;
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$camera = $eachRow;
				}
				mysqli_free_result($result);
				unset($row);
			}
			
			return $camera;
		}
		
		function getSubmarketCameraDetails()
		{
			$id = 0;
			$args = func_get_args();
			switch(count($args))
			{
				case 0:
					break;
				case 1:
					$id = $args[0];
					break;
				default:
					return $this->status = 'INVALID_ACTION';
			}
			
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			//Camera Details
			$camera = array();
			$columnName = "";
			$columnName = "idtcamera ";
				
			$q = "SELECT tcamera.* FROM tsubmarket 
					JOIN tcamera ON tcamera.idtcamera = tsubmarket.".$columnName."
				  WHERE idtsubmarket = ".$id;
			//echo $q;
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$camera = $eachRow;
				}
				mysqli_free_result($result);
				unset($row);
			}
			else
			{
				$this->status = "INVALID_QUERY";
			}
			
			return $camera;
		}
		
		function getCameraFromIdtcamera()
		{
			$id = 0;
			$args = func_get_args();
			switch(count($args))
			{
				case 0:
					break;
				case 1:
					$id = $args[0];
					break;
				default:
					return $this->status = 'INVALID_ACTION';
			}
			
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			//Camera Details
			$camera = array();
				
			$q = "SELECT tcamera.* FROM tcamera 
				  WHERE idtcamera = ".$id;
			//echo $q;
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($eachRow = mysqli_fetch_assoc($result))
				{
					$camera = $eachRow;
				}
				mysqli_free_result($result);
				unset($row);
			}
			else
			{
				$this->status = "INVALID_QUERY";
			}
			
			return $camera;
		}
		
		function buildingFloorUpdates($idtbuilding, $baseHeight, $floorHeight)
		{
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$q = "UPDATE tbuilding SET basefloorheight='".$baseHeight."' WHERE idtbuilding = '".$idtbuilding."'";
			mysqli_query($mysqliObj, $q);
			
			$q = "UPDATE tfloors SET floor_height='".$floorHeight."' WHERE idtbuilding = '".$idtbuilding."'";
			mysqli_query($mysqliObj, $q);
			return "success";
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