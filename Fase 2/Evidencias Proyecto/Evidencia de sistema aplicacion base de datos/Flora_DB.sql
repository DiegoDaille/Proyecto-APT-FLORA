-- ============================================================================
-- SCRIPT DE CREACIÓN Y POBLADO DE BASE DE DATOS: FLORA_DB
-- Motor: Microsoft SQL Server / Azure SQL (T-SQL)
-- Normativa: Tercera Forma Normal (3NF) - Integridad Referencial en Cascadas
-- ============================================================================

USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'FLORA_DB')
BEGIN
    ALTER DATABASE FLORA_DB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE FLORA_DB;
END
GO

CREATE DATABASE FLORA_DB;
GO

USE FLORA_DB;
GO

-- ----------------------------------------------------------------------------
-- 1. TABLA: CUENTAS (Gestión de Autenticación y Mascota Virtual)
-- ----------------------------------------------------------------------------
CREATE TABLE cuentas (
    id_usuario INT IDENTITY(1,1) NOT NULL,
    nombre_usuario VARCHAR(50) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre_mascota VARCHAR(50) NULL DEFAULT 'Espina',
    fecha_registro DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_cuentas PRIMARY KEY (id_usuario),
    CONSTRAINT UQ_cuentas_correo UNIQUE (correo)
);

-- ----------------------------------------------------------------------------
-- 2. TABLA: CATEGORIAS_PLANTA (Catálogo Biológico Desacoplado)
-- ----------------------------------------------------------------------------
CREATE TABLE categorias_planta (
    id_cat_planta INT IDENTITY(1,1) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    tipo_cuidado VARCHAR(100) NOT NULL,
    descripcion VARCHAR(MAX) NULL,
    CONSTRAINT PK_categorias_planta PRIMARY KEY (id_cat_planta),
    CONSTRAINT UQ_categorias_categoria UNIQUE (categoria)
);

-- ----------------------------------------------------------------------------
-- 3. TABLA: PLANTAS (Especímenes del Usuario)
-- ----------------------------------------------------------------------------
CREATE TABLE plantas (
    id_planta INT IDENTITY(1,1) NOT NULL,
    id_usuario INT NOT NULL,
    id_cat_planta INT NOT NULL,
    nombre_planta VARCHAR(100) NOT NULL,
    nombre_cientifico VARCHAR(100) NULL,
    intake_base DECIMAL(5,2) NOT NULL, -- Frecuencia/Consumo hídrico base en litros o días
    fecha_ingreso DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    CONSTRAINT PK_plantas PRIMARY KEY (id_planta),
    CONSTRAINT FK_plantas_cuentas FOREIGN KEY (id_usuario) 
        REFERENCES cuentas(id_usuario) ON DELETE CASCADE,
    CONSTRAINT FK_plantas_categorias FOREIGN KEY (id_cat_planta) 
        REFERENCES categorias_planta(id_cat_planta)
);

-- ----------------------------------------------------------------------------
-- 4. TABLA: RACHAS (Gamificación y Registro de Hábitos por Especimen)
-- ----------------------------------------------------------------------------
CREATE TABLE rachas (
    id_racha INT IDENTITY(1,1) NOT NULL,
    id_planta INT NOT NULL,
    dia_inicio DATE NOT NULL,
    dia_actual DATE NOT NULL,
    dias_consecutivos INT NOT NULL DEFAULT 1,
    CONSTRAINT PK_rachas PRIMARY KEY (id_racha),
    CONSTRAINT FK_rachas_plantas FOREIGN KEY (id_planta) 
        REFERENCES plantas(id_planta) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- 5. TABLA: FOTOS_PLANTA (Evidencia Visual de Riego y Bitácora)
-- ----------------------------------------------------------------------------
CREATE TABLE fotos_planta (
    id_foto INT IDENTITY(1,1) NOT NULL,
    id_racha INT NOT NULL,
    url_foto VARCHAR(255) NOT NULL,
    fecha_foto DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_fotos_planta PRIMARY KEY (id_foto),
    CONSTRAINT FK_fotos_rachas FOREIGN KEY (id_racha) 
        REFERENCES rachas(id_racha) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- CREACIÓN DE ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS (INDEXING)
-- ----------------------------------------------------------------------------
CREATE INDEX IX_plantas_usuario ON plantas(id_usuario);
CREATE INDEX IX_rachas_planta ON rachas(id_planta);
CREATE INDEX IX_fotos_racha ON fotos_planta(id_racha);
GO

-- ----------------------------------------------------------------------------
-- INSERCIÓN DE DATOS SEMILLA (SEED DATA FOR DEMO)
-- ----------------------------------------------------------------------------
INSERT INTO cuentas (nombre_usuario, correo, password_hash, nombre_mascota) 
VALUES ('Carlos_Dev', 'carlos@flora.cl', '$2b$10$e81...hash_demo', 'Espina');

INSERT INTO categorias_planta (categoria, tipo_cuidado, descripcion) 
VALUES 
('Suculentas', 'Riego Bajo / Luz Alta', 'Plantas de alta retención hídrica en hojas.'),
('Tropicales', 'Riego Frecuente / Sombra', 'Follaje ancho, requiere humedad relativa sobre 60%.');

INSERT INTO plantas (id_usuario, id_cat_planta, nombre_planta, nombre_cientifico, intake_base)
VALUES (1, 1, 'Mi Cactus San Pedro', 'Echinopsis pachanoi', 0.25);

INSERT INTO rachas (id_planta, dia_inicio, dia_actual, dias_consecutivos)
VALUES (1, CAST(GETDATE() AS DATE), CAST(GETDATE() AS DATE), 5);

GO