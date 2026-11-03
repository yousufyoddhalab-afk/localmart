<?php
// Public "Apply to join" form for shops and riders. Needs PHP 8+. Saves to data/applications.jsonl for admin review.
declare(strict_types=1);
session_start();
if (empty($_SESSION['csrf'])) { $_SESSION['csrf'] = bin2hex(random_bytes(16)); }
function e(string $s): string { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }
$errors = []; $done = false;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!hash_equals($_SESSION['csrf'], (string)($_POST['csrf'] ?? ''))) { $errors[] = 'Session expired. Reload and try again.'; }
    $type  = in_array($_POST['type'] ?? '', ['shop', 'rider'], true) ? $_POST['type'] : '';
    $name  = trim((string)($_POST['name'] ?? ''));
    $phone = trim((string)($_POST['phone'] ?? ''));
    $area  = trim((string)($_POST['area'] ?? ''));
    if ($type === '') { $errors[] = 'Choose shop or rider.'; }
    if (mb_strlen($name) < 2 || mb_strlen($name) > 80) { $errors[] = 'Enter a name (2 to 80 characters).'; }
    if (!preg_match('/^9[78]\d{8}$/', $phone)) { $errors[] = 'Enter a 10-digit Nepal mobile number starting 97 or 98.'; }
    if (mb_strlen($area) < 2) { $errors[] = 'Enter your service area.'; }
    if (!$errors) {
        $dir = __DIR__ . '/data'; if (!is_dir($dir)) { mkdir($dir, 0750, true); }
        file_put_contents($dir . '/applications.jsonl', json_encode(['type' => $type, 'name' => $name, 'phone' => $phone, 'area' => $area, 'at' => date('c')], JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
        $done = true;
    }
}
?><!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Join LocalMart Nepal</title>
<body style="font:16px system-ui;max-width:420px;margin:2rem auto;padding:0 1rem">
<h1>Join LocalMart Nepal</h1>
<?php if ($done): ?><p>Thanks. We will review your application and call you.</p>
<?php else: foreach ($errors as $er): ?><p style="color:#b00"><?= e($er) ?></p><?php endforeach; ?>
<form method="post"><input type="hidden" name="csrf" value="<?= e($_SESSION['csrf']) ?>">
<p><label>I am a <select name="type"><option value="shop">Shop owner</option><option value="rider">Delivery rider</option></select></label></p>
<p><label>Name<br><input name="name" required style="width:100%" value="<?= e((string)($_POST['name'] ?? '')) ?>"></label></p>
<p><label>Mobile<br><input name="phone" required inputmode="numeric" style="width:100%" value="<?= e((string)($_POST['phone'] ?? '')) ?>"></label></p>
<p><label>Area<br><input name="area" required style="width:100%" value="<?= e((string)($_POST['area'] ?? '')) ?>"></label></p>
<button>Send application</button></form><?php endif; ?></body></html>
