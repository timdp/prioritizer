<?php

// Caution: this is just a sample implementation. See README.md for details.

// Set this to whatever string you can uniquely identify the current user by.
// By default, his/her IP is used, which is obviously not a great choice.
// You could, for instance, get this value from the user's session, or, if
// you are using HTTP authentication, $_SERVER['PHP_AUTH_USER'].
$user_id = $_SERVER['REMOTE_ADDR'];

// Get this list from a file, a database, or whatever source you like.
$options = array('Giraffe', 'Tapir', 'Pangolin', 'Unicorn');

$choice_file = "data/$user_id.txt";

$result = array();
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
	$choices = array_map('intval', explode(',', $_POST['order']));
	if (valid_choices($choices, count($options))) {
		save_choices($choices, $choice_file);
		$result['success'] = true;
	}
} else {
	$choices = get_choices($choice_file);
	if (is_array($choices)) {
		$result['order'] = $choices;
	}
	$result['options'] = $options;
}

header('Content-Type: application/json');
echo json_encode($result);

function save_choices(&$choices, $choice_file) {
	$fp = fopen($choice_file, 'w');
	for ($i = 0; $i < count($choices); ++$i) {
		fwrite($fp, $choices[$i] . PHP_EOL);
	}
	fclose($fp);
	chmod($choice_file, 0644);
}

function get_choices($choice_file) {
	if (file_exists($choice_file)) {
		$choices = array_map('rtrim', file($choice_file));
		return array_map('intval', $choices);
	}
	return null;
}

function valid_choices($choices, $num_options) {
	if (count($choices) != $num_options) {
		return false;
	}
	sort($choices, SORT_NUMERIC);
	$i = 0;
	while ($i < $num_options && $choices[$i] == $i + 1) {
		++$i;
	}
	return ($i == $num_options);
}
