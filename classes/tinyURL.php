<?php
if(!defined("tinyURL"))
{
	define("tinyURL",1);
	/************************************************************************************************************************/
	/*		Included files																									*/
	/************************************************************************************************************************/
	include_once(__DIR__."/connection.php");
	/************************************************************************************************************************/	
	
	class tinyURL
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
		
		function createTinyURL()
		{
			$args = func_get_args();
			$userId = "";
			$name = "";
			$bigURL = "";
			switch(count($args))
			{
				case 3:
					$userId = $args[0];
					$name = $args[1];
					$bigURL = $args[2];
					break;
				default:
					return $this->status = 'INVALID_ACTION';
			}
			
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$q = "INSERT INTO ttinyurls (url_name, original_url, created_by ) values ('".$name."', '".$bigURL."', '".$userId."')";
			$shortCode = "";
			if($result = mysqli_query($mysqliObj, $q))
			{
				$last_id = mysqli_insert_id($mysqliObj);
				$shortCode = $this->generateShortCode($last_id);
				if($last_id > 0)
				{
					$q = "update ttinyurls set short_code = '".$shortCode."' WHERE idttinyurls = ".$last_id;
					$result = mysqli_query($mysqliObj, $q);
				}
			}
			return $shortCode;
		}
		
		function getOriginalURL()
		{
			$args = func_get_args();
			$shortCode = "";
			switch(count($args))
			{
				case 1:
					$shortCode = $args[0];
					break;
				default:
					return $this->status = 'INVALID_ACTION';
			}
			
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$q = "SELECT * FROM ttinyurls WHERE short_code = '".$shortCode."' ";
			
			$fullURL = "";
			if($result = mysqli_query($mysqliObj, $q))
			{
				$i=0;
				while($row = mysqli_fetch_assoc($result))
				{								
					$fullURL = $row["original_url"];
					$i++;
				}
			}
			return $fullURL;
		}
		
		function generateShortCode($id) {
			// Combine the ID with the current timestamp
			$input = $id . time();

			// Create a hash of the input
			$hash = md5($input);

			// Use base62 encoding to make it URL-safe and alphanumeric
			$base62 = $this->base62Encode(hexdec(substr($hash, 0, 10))); // First 10 hex digits for uniqueness

			// Ensure it is exactly 10 characters long
			return str_pad($base62, 10, '0', STR_PAD_RIGHT); // Pad with '0' if less than 10 chars
		}

		function base62Encode($number) {
			$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
			$base = strlen($characters);
			$encoded = '';

			while ($number > 0) {
				$encoded = $characters[$number % $base] . $encoded;
				$number = floor($number / $base);
			}

			return $encoded;
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