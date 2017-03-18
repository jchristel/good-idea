<?php
    $username = "dummyuser"; 
    $password = "dummy";   
    $host = "localhost";
    $database="eventmanager";
    
    $server = mysql_connect($host, $username, $password);
    $connection = mysql_select_db($database, $server);

    $myquery = "SELECT  `EventID`, `EventName`, `EventDescription`, `ParentID`,`Size`,`OtherLinks`,`StartDateTime` FROM  `designevents`";
    $query = mysql_query($myquery);
    
	$json = NULL;
    
	if ( ! $query ) {
        $json = utf8_encode(json_encode(array("MySQLError", mysql_error())));
		echo $json;
		die;
    } else {
		$data = array();
    
		for ($x = 0; $x < mysql_num_rows($query); $x++) {
			$data[] = mysql_fetch_assoc($query);
		}
		
		//build nested array function
		function buildtree($src_arr, $parent_id = 0, $tree = array())
		{	
			foreach($src_arr as $idx => $row)
			{
				if($row['parent'] == $parent_id)
				{
					foreach($row as $k => $v){
						$tree[$row['id']][$k] = $v;
						
					}
					unset($src_arr[$idx]);
					$tree[$row['id']]['children'] = buildtree($src_arr, $row['id']);
				}
			}
			ksort($tree);
			return $tree;
		}
	
		//build arrays functions
		function insertIntoNestedArray(&$array, $searchItem)
		{
		if($searchItem['ParentID'] == 0){
			array_push($array, $searchItem);
			return;
		}
		
		if(empty($array)){ return; }
	
		array_walk($array, function(&$item, $key, $searchItem)
		{
			if($item['id'] == $searchItem['ParentID']){
				array_push($item['children'], $searchItem);
				return;
			}
			insertIntoNestedArray($item['children'], $searchItem);
		}, $searchItem);
		}
	
		$nestedArray = array();
	
		foreach($data as $itemData){
			$nestedArrayItem['id'] = $itemData['EventID'];
			$nestedArrayItem['name'] = $itemData['EventName'];
			$nestedArrayItem['description'] = $itemData['EventDescription'];
			$nestedArrayItem['parent'] = $itemData['ParentID'];
			$nestedArrayItem['Date'] = $itemData['StartDateTime'];
			$nestedArrayItem['OtherLinks'] = $itemData['OtherLinks'];
			$nestedArrayItem['size'] = $itemData['Size'];
			$nestedArrayItem['children'] = array();
			insertIntoNestedArray($nestedArray, $nestedArrayItem);
		}
		
		//build nested array structure
		$nestedArray = buildtree($nestedArray);
		
		//to ensure encoding is done correctly
		header ("Content-Type: application/json");
		//wrap into utf-8 encoder just in case
		$json = utf8_encode(json_encode($nestedArray));     
		//do some error checking...need to implement that on js side as well
		if ($json === false) {
			switch (json_last_error()) {
				case JSON_ERROR_NONE:
					//echo ' - No errors';
				break;
				case JSON_ERROR_DEPTH:
					$json = json_encode(array("jsonError", json_last_error_msg()));
				break;
				case JSON_ERROR_STATE_MISMATCH:
					$json = json_encode(array("jsonError", json_last_error_msg()));
				break;
				case JSON_ERROR_CTRL_CHAR:
					$json = json_encode(array("jsonError", json_last_error_msg()));
				break;
				case JSON_ERROR_SYNTAX:
					$json = json_encode(array("jsonError", json_last_error_msg()));
				break;
				case JSON_ERROR_UTF8:
					$json = json_encode(array("jsonError", json_last_error_msg()));
				break;
				default:
					$json = json_encode(array("jsonError", "unknown"));
				break;
			}
			// Set HTTP response status code to: 500 - Internal Server Error
			http_response_code(500);
		}
		echo $json;
	}
    mysql_close($server);
?>