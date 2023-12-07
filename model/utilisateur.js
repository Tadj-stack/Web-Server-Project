import connectionPromise from '../connexion.js';
import bcrypt from 'bcrypt'


export async function addUtilisateur(courriel, mot_de_passe, prenom, nom) {
    const connection = await connectionPromise;

    let hash = await bcrypt.hash(mot_de_passe, 10);

    await connection.run(
        `INSERT INTO utilisateur(courriel, mot_de_passe, prenom, nom,id_type_utilisateur)
        VALUES(?, ?, ?, ?,?)`,
        [courriel, hash, prenom, nom,1]
    );
}

export async function getUtilisateurParId(idUtilisateur) {
    const connection = await connectionPromise;

    let utilisateur = await connection.get(
        `SELECT *
        FROM utilisateur
        WHERE id_utilisateur = ?`,
        [idUtilisateur]
    );

    return utilisateur;
}

export async function getUtilisateurParCourriel(courriel) {
    const connection = await connectionPromise;

    let utilisateur = await connection.get(
        `SELECT *
        FROM utilisateur
        WHERE courriel = ?`,
        [courriel]
    );

    return utilisateur;
}