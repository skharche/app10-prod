<?php
if(!defined("classes"))
{
	define("classes",1);
	/************************************************************************************************************************/
	/*		Included files																									*/
	/************************************************************************************************************************/
	include_once(__DIR__."/connection.php");
	/************************************************************************************************************************/	
	
	/**@ignore***************************************************************************************************************
	*		@name 			classes
	*		@abstract		Data structure and methods associated with a classes
	*		@author			Swapnil Kharche <swapnil.k00@gmail.com>
	*		@copyright		03.03.2018 
	*		@signatures		<ul>
	*							<li> classes() </li>
	*							<li> classes() </li>
	*						</ul>
	*		@since			System Version
	*		@auditTrail
	*			<ul> 		
	*				<li>03.03.2018	SK	date created</li> 		
	*			</ul>
	@ignore*******************************************************************************************************************/
	class classes
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
		@ignore***************************************************************************************************************/
		var $class_name = '';
		
		
		/**@ignore************************************************************************************************************
		*	@access 	private
		@ignore***************************************************************************************************************/
		var $display_order = '';
		
		
		/**@ignore************************************************************************************************************
		*	@access 	private
		@ignore***************************************************************************************************************/
		var $school_id = '';
		
		
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
		*		@name			classes
		*		@abstract		constructor for object
		*		@copyright		03.03.2018 
		*		@signatures		<ul>
		*							<li> classes() </li>
		*							<li> classes() </li>
		*						</ul>
		*		@throws			<ul>
		*							<li>INVALID_ACTION</li>
		*						</ul>
		*		@return 		void
		*		@author 		Swapnil Kharche <swapnil.k00@gmail.com>
		*		@since 			System	Version
		*		@auditTrail
		*			<ul>
 		*				<li>03.03.2018	SK	date created</li> 		
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
		
		/********************************************************************************************************************/
		/*		Name:			add
		/*		Purpose:		adds the object to the database
		/*		Signatures:		add()
		/*		Return Type:	String (status)
		/*		Success Result:	status=1, adds object to the database
		/*		Error Result:	status=<ERROR_CODE>
		/*		Throws:			INVALID_QUERY
		/*						NO_DB_CONNECTION
		/*                      MISSING_REQUIRED_FIELD
		/*		Author:			Swapnil Kharche
		/*		Date:			03.03.2018
		/*		Version Added:	1.00.10	
		/*		Audit Trail:
		/*			03.03.2018	SK	date created
		/********************************************************************************************************************/
		function add()
		{
			//Args is used to overload the method.  Unused cases should be removed. 
			$args = func_get_args();
			
			switch(count($args))
			{
				case 0:
					break;
				case 3:	
					$this->class_name = trim($args[0]);
					$this->school_id = trim($args[1]);
					$this->display_order = trim($args[2]);

					break;
				default:
					return $this->status = 'INVALID_ACTION';
			}
			
			//put set of required fields for add here
			//Note: Because isset() is a language construct and not a function, it cannot be called using variable functions or object
			//		method calls.
			//Use == "" for strings
			//Use  strlen($active) > 0 for active and other fields that could be 0.  PHP sees 0==""
			//Use !is_object for objects...then add else and check the member var of that object.
			
			
			$dbconn = new dbConnection($conn);

			$this->runSQLFlag = 1;
			$this->active = 1;
			if($dbconn->status==1)
			{
				$q  = "INSERT INTO classes (";
				$q .= "class_name,";
				$q .= "school_id,";
				$q .= "display_order,";
				$q .= "active";
				$q .= ") VALUES (";
				$q .= "'" .$this->class_name ."', ";
				$q .= "'" .$this->school_id ."', ";
				$q .= "'" .$this->display_order ."', ";
				$q .= "'". $this->active ."'";
				$q .= ") ";
				
				$this->sql = $q;
				//echo "<br />".$q;
				if($this->runSQLFlag == 1)
				{
					if(pg_query($conn, $q))
					{
						$this->id = mysqli_insert_id($conn);	//set the ID field for auto_increment PK tables
						$this->status = 1;
					}
					else
					{
						$this->status = "INVALID_QUERY";
					}
				}
			}
			else
			{
				$this->status = "NO_DB_CONNECTION";
			}
			
			$dbconn->destroy();
			return $this->status;
		}
		
		/********************************************************************************************************************/
		/*		Name:			update
		/*		Purpose:		updates the object to the database
		/*		Signatures:		update()
		/*		Return Type:	String (status)
		/*		Success Result:	status=1, updates the object in the database
		/*		Error Result:	status=<ERROR_CODE>
		/*		Throws:			INVALID_QUERY
		/*						NO_DB_CONNECTION
		/*                      MISSING_ID
		/*		Author:			Swapnil Kharche
		/*		Date:			03.03.2018
		/*		Version Added:	1.00.00	
		/*		Audit Trail:
		/*			03.03.2018	rd	date created
		/********************************************************************************************************************/
		function update()
		{
			//Args is used to overload the method.  Unused cases should be removed. 
			$args = func_get_args();
			
			switch(count($args))
			{
				case 0:
					break;
				case 5:	
					$this->class_name = trim($args[0]);
					$this->school_id = trim($args[1]);
					$this->display_order = trim($args[2]);

					$this->active= $args[3];
					$this->id= $args[4];
					break;
				default:
					return $this->status = 'INVALID_ACTION';
			}

			
			$dbconn = new dbConnection($conn);

			$this->runSQLFlag = 1;
			$dbconn->status = 1;//NP
			if($dbconn->status==1)
			{
				$q  = "UPDATE classes SET ";
				
				
				if (strlen($this->class_name) == 0)
					$q  .= " 	class_name = '', ";
				else
					$q  .= " 	class_name = '". $this->class_name ."', ";
							
				if (strlen($this->school_id) == 0)
					$q  .= " 	school_id = '', ";
				else
					$q  .= " 	school_id = '". $this->school_id ."', ";
							
				if (strlen($this->display_order) == 0)
					$q  .= " 	display_order = '', ";
				else
					$q  .= " 	display_order = '". $this->display_order ."', ";
					
				
				if(strlen($this->active)>0)
				{
					if ($this->active == "NULL")
					{
						$q  .= " 	active = NULL ";
					}
					else
					{
						$q  .= " 	active = '". $this->active ."' ";
					}
				}
				else
				{
					$q .= "			active = active  ";
				}
				
				$q .= " WHERE 1 AND ";
				$q .= " id= '".$this->id."'";
				//print "<br/> $q <br/>";
				$this->sql = $q;
				
				if($this->runSQLFlag == 1)
				{
					if(pg_query($conn, $q))
					{
						$this->status = 1;
					}
					else
					{
						$this->status = "INVALID_QUERY";
					}
				}
			}
			else
			{
				$this->status = "NO_DB_CONNECTION";
			}
			
			$dbconn->destroy();
			return $this->status;
		}
		/********************************************************************************************************************/
		/*		Name:			delete
		/*		Purpose:		delete the object from the database
		/*		Signatures:		delete()
		/*		Return Type:	String (status)
		/*		Success Result:	status=1, updates the object in the database
		/*		Error Result:	status=<ERROR_CODE>
		/*		Throws:			INVALID_QUERY
		/*						NO_DB_CONNECTION
		/*                      MISSING_ID
		/*		Author:			Swapnil Kharche
		/*		Date:			03.03.2018
		/*		Version Added:	1.00.00	
		/*		Audit Trail:
		/*			03.03.2018	rd	date created
		/********************************************************************************************************************/

		function delete()
		{
			$args = func_get_args();
			switch(count($args))
			{
				case 0:
					break;
				case 1:
					$this->id = $args[0];
					break;
				default:
					return $this->status = 'INVALID_ACTION';
			}
			//put set of required fields for add here
			if(
				$this->id == '' 
			)
			{
				return $this->status = "MISSING_ID";
			}

			$dbconn = new dbConnection($conn);
			if($dbconn->status==1)
			{
				$q  = "UPDATE classes SET active = 0 ";
				$q .= " 	 WHERE	   	id = '". $this->id ."' ";

				//print "<BR><BR>".$q;

				if(pg_query($conn, $q))
				{
					$this->status = 1;
				}
				else
				{
					$this->status = "INVALID_QUERY";
				}
			}
			else
			{
				$this->status = "NO_DB_CONNECTION";
			}
			$dbconn->destroy();
			return $this->status;
		}
		
		/********************************************************************************************************************/
		/*		Name:			find
		/*		Purpose:		returns an array of classes Objects which match the search criteria
		/*		Signatures:		find()
		/*		Return Type:	classes[]		
		/*		Success Output:	collection of classes objects
		/*		Error Output:	status
		/*		Throws:			INVALID_OPTION
		/*						NO_DB_CONNECTION
		/*						INVALID_QUERY
		/*		Author:			Swapnil Kharche
		/*		Version Added:	1.00.00
		/*		Date:			03.03.2018
		/*		Audit Trail:
		/*			03.03.2018	Swapnil Kharche	date created
		/********************************************************************************************************************/
		function find()
		{
			$args = func_get_args();
			switch(count($args))
			{
				case 0:
					break;
				case 2:	
					$this->school_id = trim($args[0]);
					$this->id = trim($args[1]);
					break;
				case 3:	
					$this->class_name = trim($args[0]);
					$this->school_id = trim($args[1]);
					$this->display_order = trim($args[2]);

					break;
				default:
					return $this->status = 'INVALID_ACTION';
			}
			
			$dbconn = new dbConnection($conn);
			
			$q = "SELECT * FROM classes WHERE 1 ";
			
				strlen($this->class_name) > 0 ? $q .= " AND class_name = '".	$this->class_name	."' "	: $q .= " ";
				strlen($this->school_id) > 0 ? $q .= " AND school_id = '".	$this->school_id	."' "	: $q .= " ";
				strlen($this->display_order) > 0 ? $q .= " AND display_order = '".	$this->display_order	."' "	: $q .= " ";
			$q .= " AND active = 1 ";
			if($this->id > 0)
			{
				$q .= " AND id = '".$this->id."' ";
			}
			
			$q .= " ORDER BY display_order";
			//echo "<br />".$q;
			if($result = pg_query($conn, $q))
			{
				unset($this->collection);
				$this->collection = array();
				$i=0;
				while($row = mysqli_fetch_object($result))
				{								
					$this->collection[$i] = array("id" => $row->id,
						"class_name" => $row->class_name,
						"display_order" => $row->display_order
													);
					$i++;
				}
				mysqli_free_result($result);
				unset($row);
			}
			else
			{
				$this->status = "INVALID_QUERY";
			}
			return $this->collection;
		}
		
		
		/********************************************************************************************************************/
		/*		Name:			exportTable
		/*		Purpose:		returns an array of classes Objects which match the search criteria
		/*		Signatures:		exportTable()
		/*		Return Type:	classes[]		
		/*		Success Output:	collection of classes objects
		/*		Error Output:	status
		/*		Throws:			INVALID_OPTION
		/*						NO_DB_CONNECTION
		/*						INVALID_QUERY
		/*		Author:			Swapnil Kharche
		/*		Version Added:	1.00.00
		/*		Date:			03.03.2018
		/*		Audit Trail:
		/*			03.03.2018	Swapnil Kharche	date created
		/********************************************************************************************************************/
		function exportTable()
		{
			$args = func_get_args();
			switch(count($args))
			{
				case 0:
					break;
				case 3:	
					$this->class_name = trim($args[0]);
					$this->class_name_alias = trim($args[1]);
					$this->school_id = trim($args[2]);

					break;
				default:
					return $this->status = 'INVALID_ACTION';
			}
			
			$dbconn = new dbConnection($conn);
			
			$q = "SELECT * FROM classes WHERE 1 ";
			
				strlen($this->class_name) > 0 ? $q .= " AND class_name = '".	$this->class_name	."' "	: $q .= " ";
				strlen($this->class_name_alias) > 0 ? $q .= " AND class_name_alias = '".	$this->class_name_alias	."' "	: $q .= " ";
				strlen($this->school_id) > 0 ? $q .= " AND school_id = '".	$this->school_id	."' "	: $q .= " ";
			$q .= " AND active = 1";
			//echo "<br />".$q;
			if($result = pg_query($conn, $q))
			{
				unset($this->collection);
				
				$i=0;
				while($row = mysqli_fetch_object($result))
				{								
					$this->collection[$i] = $row;
					$i++;
				}
				mysqli_free_result($result);
				unset($row);
			}
			else
			{
				$this->status = "INVALID_QUERY";
			}
			return $this->collection;
		}
		
		/********************************************************************************************************************/
		/*		Name:			populate
		/*		Purpose:		returns an array of classes Objects which match the search criteria
		/*		Signatures:		populate()
		/*		Return Type:	classes[]		
		/*		Success Output:	collection of classes objects
		/*		Error Output:	status
		/*		Throws:			INVALID_OPTION
		/*						NO_DB_CONNECTION
		/*						INVALID_QUERY
		/*		Author:			Swapnil Kharche
		/*		Version Added:	1.00.00
		/*		Date:			03.03.2018
		/*		Audit Trail:
		/*			03.03.2018	Swapnil Kharche	date created
		/********************************************************************************************************************/
		function populate()
		{
			$args = func_get_args();
			switch(count($args))
			{
				case 0:
					break;
				case 1:
					$this->id= $args[0];
					break;
				default:
					return $this->status = 'INVALID_ACTION';
			}
			//put set of required fields for add here
			if(
				$this->id == ''
			)
			{										//set in that object
			return $this->status = "MISSING_ID";
			}

			$dbconn = new dbConnection($conn);
			if($dbconn->status==1)
			{
				$q  = "SELECT *	";
				$q .= "  FROM	   classes ";
				$q .= " WHERE	    id 			= '". $this->id ."' ";

				//print "<BR><BR>".$q;

				if($result = pg_query($conn, $q))
				{
					$this->status = 1;
					if(count($result)>1)
					{
						$this->status = "INVALID_QUERY";	//May need to add new error code for this.
					}
					else
					{
						$row = mysqli_fetch_object($result);
								$this->class_name = $row->class_name;
		$this->class_name_alias = $row->class_name_alias;
		$this->school_id = $row->school_id;

						$this->active = $row->active;
						
					}
					mysqli_free_result($result);
					unset($row);
				}
				else
				{
					$this->status = "INVALID_QUERY";
				}
			}
			else
			{
				$this->status = "NO_DB_CONNECTION";
			}
			$dbconn->destroy();
			return $this->status;
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