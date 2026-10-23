<?php
/**
 * Solak Wohndesign – Versand des Beratungsformulars
 * Benötigt PHP mit funktionierender mail()-Funktion beim Hosting-Anbieter.
 */
declare(strict_types=1);

$EMPFAENGER = 'office@solakwohndesign.at';
$ABSENDER   = 'website@solakwohndesign.at'; // Adresse der eigenen Domain verwenden

header('Content-Type: application/json; charset=utf-8');

function antwort(bool $ok, string $msg = '', int $code = 200): void {
    http_response_code($code);
    echo json_encode(['ok' => $ok, 'message' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    antwort(false, 'Methode nicht erlaubt', 405);
}

// Spam-Schutz (verstecktes Feld)
if (!empty($_POST['website'])) {
    antwort(true);
}

function feld(string $name, int $max = 200): string {
    $v = trim((string)($_POST[$name] ?? ''));
    $v = str_replace(["\r", "\n", "%0a", "%0d"], ' ', $v);
    return mb_substr($v, 0, $max);
}

$vorname   = feld('vorname', 80);
$nachname  = feld('nachname', 80);
$email     = feld('email', 160);
$vorwahl   = feld('vorwahl', 6);
$telefon   = feld('telefon', 40);
$kategorie = feld('kategorie', 80);
$nachricht = mb_substr(trim((string)($_POST['nachricht'] ?? '')), 0, 4000);
$consent   = ($_POST['datenschutz'] ?? '') === 'ja';

$erlaubt = ['Küchen & Esszimmer', 'Schlaf- & Wohnzimmer', 'Büro & Spezialanfertigungen', 'Alle Kategorien'];

if ($vorname === '' || $nachname === '' || $telefon === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)
    || !in_array($kategorie, $erlaubt, true) || !$consent) {
    antwort(false, 'Bitte alle Pflichtfelder ausfüllen.', 422);
}

$betreff = 'Neue Beratungsanfrage: ' . $kategorie . ' – ' . $vorname . ' ' . $nachname;
$text  = "Neue Anfrage über solakwohndesign.at\n\n";
$text .= "Name:       $vorname $nachname\n";
$text .= "E-Mail:     $email\n";
$text .= "Telefon:    $vorwahl $telefon\n";
$text .= "Interesse:  $kategorie\n\n";
$text .= "Nachricht:\n" . ($nachricht !== '' ? $nachricht : '-') . "\n\n";
$text .= "Datenschutz-Einwilligung: ja\n";
$text .= 'Gesendet: ' . date('d.m.Y H:i') . "\n";

$headers  = 'From: Solak Wohndesign Website <' . $ABSENDER . ">\r\n";
$headers .= 'Reply-To: ' . $email . "\r\n";
$headers .= "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n";

$ok = mail($EMPFAENGER, '=?UTF-8?B?' . base64_encode($betreff) . '?=', $text, $headers);

$ok ? antwort(true, 'Gesendet') : antwort(false, 'Versand fehlgeschlagen', 500);
