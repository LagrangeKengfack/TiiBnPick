CREATE TABLE client (
    id_client UUID PRIMARY KEY,
    statut_fidelite VARCHAR(50),
    note_moyenne FLOAT,
    CONSTRAINT fk_client_personne
    FOREIGN KEY (id_client) REFERENCES personne(id_personne)
);