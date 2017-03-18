<?php

if(isset($_GET['input']))
{
	$con=mysqli_connect("localhost","root","admin321","php");       

	if (mysqli_connect_errno()){
		echo "Failed to connect to MySQL: " . mysqli_connect_error();
	}
	$name=$_GET['input'];
	$sql="SELECT * FROM tab where value LIKE '%".$name."%'";
	$r = mysqli_query($con,$sql);
    $data = array();
	
    while($row = mysqli_fetch_assoc($r)) {
		$data[] = $row;
    }  

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

	function insertIntoNestedArray(&$array, $searchItem)
	{
		if($searchItem['parent'] == 0){
			array_push($array, $searchItem);
			return;
		}
		
		if(empty($array)){ return; }
	
		array_walk($array, function(&$item, $key, $searchItem)
		{
			if($item['id'] == $searchItem['parent']){
				array_push($item['children'], $searchItem);
				return;
			}
			insertIntoNestedArray($item['children'], $searchItem);
		}, $searchItem);
	}
	
	$nestedArray = array();
	
	foreach($data as $itemData){
		$nestedArrayItem['id'] = $itemData['id'];
		$nestedArrayItem['name'] = $itemData['name'];
		$nestedArrayItem['parent'] = $itemData['parent'];
		$nestedArrayItem['children'] = array();
		insertIntoNestedArray($nestedArray, $nestedArrayItem);
	}
	
	
	header('Content-Type: application/json');
	$json= json_encode($nestedArray);
	echo $json ;

}
?>