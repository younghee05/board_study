--DROP TABLE IF EXISTS USER;
--DROP TABLE IF EXISTS ROLE;
--DROP TABLE IF EXISTS USER_ROLES;
--
--
--CREATE TABLE USER (
--    id BIGINT Not NULL AUTO_INCREMENT PRIMARY KEY,
--    username VARCHAR(255) not null UNIQUE,
--    password VARCHAR(255) not null,
--    name VARCHAR(255) not null,
--    email VARCHAR(255) not null,
--    img TEXT not null DEFAULT 'https://firebasestorage.googleapis.com/v0/b/userprofile-66675.appspot.com/o/user%2Fdefalut.png?alt=media&token=21c67386-8ad9-4855-973d-8e68adcc4958'
--
--);
--
--CREATE TABLE ROLE (
--    id BIGINT AUTO_INCREMENT PRIMARY KEY,
--    name VARCHAR(255) UNIQUE not null
--);
--
--INSERT INTO ROLE
--VALUES  (DEFAULT, 'ROLE_USER'),
--        (DEFAULT, 'ROLE_MANAGER'),
--        (DEFAULT, 'ROLE_ADMIN');
--
--CREATE TABLE USER_ROLES (
--    id BIGINT AUTO_INCREMENT PRIMARY KEY,
--    user_id BIGINT NOT NULL,
--    role_id BIGINT NOT NULL
--);

--CREATE TABLE OAUTH2_USER (
--    id BIGINT AUTO_INCREMENT PRIMARY KEY,
--    user_id BIGINT NOT NULL,
--    oauth2_name VARCHAR(255) UNIQUE not null,
--    provider VARCHAR(255) not null
--);

--CREATE TABLE BOARD (
--    id BIGINT AUTO_INCREMENT PRIMARY KEY,
--    title VARCHAR(255) not null,
--    content LONGTEXT not null,
--    user_id BIGINT not null
--);

--ALTER TABLE BOARD ADD COLUMN view_count INT NOT NULL DEFAULT 0;
--ALTER TABLE 'USER' ADD COLUMN email VARCHAR(255) NOT NULL;

CREATE TABLE board_like(
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    board_id BIGINT not null,
    user_id BIGINT not null
);