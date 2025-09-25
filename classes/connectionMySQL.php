<?php
if(!isset($_SESSION))
{
	session_start();
}
if(!defined("_DB_CONNECTION"))
{
	define("_DB_CONNECTION",1);

	include_once(__DIR__."/../modules/configParams.php");
	class dbConnection
	{
		var $status;
		var $connection;
		
		function __construct(&$c)
		{
			// Get variables from config file
			require(dirname(__FILE__).'/dbconfig.php');
			
			$dbserver   = $_DB_HOST_;
			$dbport  	= $_DB_PORT_;
			$dbname     = $_DB_NAME_;
			$dbuser     = $_DB_USER_;
			$dbpassword = $_DB_PWRD_;

            if( ($this->connection = mysqli_connect($dbserver.($dbport!='3306'?':'.$dbport:''), $dbuser, $dbpassword, $dbname)))
			{
				$c = $this->connection;
				return $this->status=1;
			}
			else
			{
				return $this->status=0;
			}
		}
	
		function destroy()
		{
			if(isset($this->connection) && gettype($this->connection) == "resource")
			{
				mysql_close($this->connection);
			}
			unset($this);
		}
		
	} //end of class definition

	/************************************************************************************************************************/

}	//end of ifndef
