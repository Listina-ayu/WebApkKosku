-- Jalankan SEKALI di phpMyAdmin (database kosku -> tab SQL) jika database
-- sudah diimport sebelum fitur foto 2, 3, 4 ada.
-- Aman dijalankan berulang kali di XAMPP (MariaDB).
USE kosku;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS gallery_urls TEXT NULL;
