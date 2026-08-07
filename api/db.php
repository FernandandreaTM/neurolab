<?php
error_reporting(0);

function get_db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $path = __DIR__ . '/../data/neurolab.db';
        $pdo  = new PDO('sqlite:' . $path);
        $pdo->setAttribute(PDO::ATTR_ERRMODE,            PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $pdo->exec("PRAGMA journal_mode=WAL");
    }
    return $pdo;
}
