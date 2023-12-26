-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 26 Des 2023 pada 05.47
-- Versi server: 10.4.28-MariaDB
-- Versi PHP: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ternakami`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `animal_history`
--

CREATE TABLE `animal_history` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `animalName` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `animalType` varchar(255) DEFAULT NULL,
  `classificationResult` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `animal_history`
--

INSERT INTO `animal_history` (`id`, `userId`, `animalName`, `created_at`, `animalType`, `classificationResult`) VALUES
(1, 1, 'bambang', '2023-12-26 02:16:23', 'sapi', 'Mata Sapi Sehat!'),
(2, 1, 'golang', '2023-12-26 02:17:44', 'kambing', 'Mata Kambing Terjangkit Penyakit Pinkeye'),
(3, 1, 'golang', '2023-12-26 02:18:59', 'kambing', 'Mata Kambing Terjangkit Penyakit Pinkeye'),
(4, 1, 'golang', '2023-12-26 04:16:01', 'kambing', 'Mata Kambing Terjangkit Penyakit Pinkeye'),
(5, 1, 'golang', '2023-12-26 04:16:02', 'kambing', 'Mata Kambing Terjangkit Penyakit Pinkeye'),
(6, 1, 'golang', '2023-12-26 04:16:03', 'kambing', 'Mata Kambing Terjangkit Penyakit Pinkeye'),
(7, 1, 'Golang', '2023-12-26 04:31:33', 'sapi', 'Mata Sapi Sehat!'),
(8, 1, '', '2023-12-26 04:33:01', 'sapi', 'Mata Sapi Terjangkit Penyakit Pinkeye');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fullname` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `fullname`) VALUES
(1, 'daffatgi02@gmail.com', '$2a$08$fbWjIJaJRob8CsmHD15mnuZzhn3N7LO4jsWP8.ab8qRZTSA3VxGxe', 'Daffa Fakhuddin Arrozy');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `animal_history`
--
ALTER TABLE `animal_history`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `animal_history`
--
ALTER TABLE `animal_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
