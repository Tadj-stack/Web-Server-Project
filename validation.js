import { getPanierUtilisateur } from "./model/panier.js";

/**
 * Valide un identifiant (ID) reçu par le serveur.
 * @param {*} id L'identifiant à valider.
 * @param {*} id_utilisateur L'identifiant à valider.
 * @returns Une valeur booléenne indiquant si l'identifiant est valide ou non.
 */
export const validateId = (id) => {
    return !!id &&
        typeof id === 'number' &&
        Number.isInteger(id) &&
        id > 0;
}

/**
 * Valide le panier dans la base de données du serveur.
 * @returns Une valeur booléenne indiquant si le panier est valide ou non.
 */
export const validatePanier = async (id_utilisateur) => {
    let panier = await getPanierUtilisateur(id_utilisateur);
    return panier.length > 0;
}

export const isCourrielValid = (courriel) => {
    // Expression régulière pour vérifier le format d'une adresse e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return typeof courriel === 'string' && emailRegex.test(courriel);
};


export const isMotPasseValid = (motPasse) => 
    typeof motPasse === 'string' && 
    motPasse.length >= 8;
