<?php
date_default_timezone_set('America/New_York');
if(!defined("_DB_CONNECTION"))
{
	define("_DB_CONNECTION",1);

	class dbConnection
	{
		public $status = 1;
		public $connection;
		
		function __CONSTRUCT()
		{
			
		}
		
		function Connect()
		{
			// Get variables from config file
			require(dirname(__FILE__).'/dbconfig.php');
			
			$dbserver   = $_DB_HOST_;
			$dbport  	= $_DB_PORT_;
			$dbname     = $_DB_NAME_;
			$dbuser     = $_DB_USER_;
			$dbpassword = $_DB_PWRD_;
			$this->connection = mysqli_connect($_DB_HOST_, $dbuser, $dbpassword, $dbname);
			if (!mysqli_set_charset($this->connection, "utf8mb4")) {
				printf("Error loading character set utf8mb4: %s\n", mysqli_error($this->connection));
				exit();
			}
			if($this->connection)
			{
				//echo "<br />Success Connected!";
				$c = $this->connection;
				return $this->connection;
			}
			else
			{
				echo "<pre>###";print_r(mysqli_error());exit;
				return $this->status=0;
			}
		}
		
		function destroy()
		{
			/* if(isset($this->connection) && gettype($this->connection) == "resource")
			{
				mysql_close($this->connection);
			}
			//unset($this); */
		}
		
	} //end of class definition

	/************************************************************************************************************************/

}	//end of ifndef
