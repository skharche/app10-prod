<?php
if(!defined("tclasscolor"))
{
	define("tclasscolor",1);
	/************************************************************************************************************************/
	/*		Included files																									*/
	/************************************************************************************************************************/
	include_once(__DIR__."/connection.php");
	/************************************************************************************************************************/	
	
	class tclasscolor
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
		var $timestamp = null;	//Most tables have an active field.  
		
		/**@ignore************************************************************************************************************
		*	@access 	private
		*	@var 		int
		@ignore***************************************************************************************************************/
		var $flags = array();	//Most tables have an active field.  
		
		/********************************************************************************************************************/
		
		/**@ignore************************************************************************************************************
		*		@name			tclasscolor
		*		@abstract		constructor for object
		*		@copyright		[TODAYS_DATE]
		*		@signatures		<ul>
		*							<li> tclasscolor() </li>
		*							<li> tclasscolor() </li>
		*						</ul>
		*		@throws			<ul>
		*							<li>INVALID_ACTION</li>
		*						</ul>
		*		@return 		void
		*		@author 		Swapnil Kharche
		*		@since 			System	Version
		*		@auditTrail
		*			<ul>
 		*				<li>[TODAYS_DATE]	SK	date created</li> 		
 		*			</ul>
		@ignore***************************************************************************************************************/
		function __CONSTRUCT()
		{
			$this->timestamp = date("Y-m-d h:i:s");
			//Args is used to overload the method. Unused cases should be removed. 
			$args = func_get_args();
			switch(count($args))
			{
				case 0:
					break;
			}
		}
		
		function getClassColorArray()
		{
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			$q = "SELECT tclasscolor.*
				FROM tclasscolor 
				WHERE is_active = 1 ";
			//echo $q;
			$tclasscolorDetails = array();
			if($result = mysqli_query($mysqliObj, $q))
			{
				while($row = mysqli_fetch_assoc($result))
				{
					$tclasscolorDetails[] = $row;
				}
			}
			
			return $tclasscolorDetails;
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