CREATE TABLE livreur (
    id_livreur UUID PRIMARY KEY,
    statut VARCHAR(50),
    reputation FLOAT,
    localisation VARCHAR(255),
    registre_commerce VARCHAR(100),
    nom_commercial VARCHAR(120),
    nui VARCHAR(120),
    CONSTRAINT fk_livreur_personne
    FOREIGN KEY (id_livreur) REFERENCES personne(id_personne)
);