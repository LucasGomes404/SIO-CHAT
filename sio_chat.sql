DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
	`mail` VARCHAR(100) NOT NULL DEFAULT '',
	`pseudo` VARCHAR(50) DEFAULT NULL,
	`password` VARCHAR(50) DEFAULT NULL,
	PRIMARY KEY (`mail`)
) ENGINE=InnoDB DEFAULT CHARSET=UTF8;

LOCK TABLES `user` WRITE;

INSERT INTO `user` (`mail`, `pseudo`, `password`)
VALUES
	('lucas.go15@gmail.com', 'LucasGo', 'Azerty'),
	('night404@outlook.com', 'Night', 'Error');
UNLOCK TABLES;