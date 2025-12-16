CREATE TABLE personne (
    id_personne UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(120) NOT NULL,
    telephone VARCHAR(20),
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    cni VARCHAR(50),
    photo VARCHAR(255),
    extrait_casier VARCHAR(255)
    );