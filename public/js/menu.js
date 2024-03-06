// Liste de tous les boutons d'ajout au panier
let boutons = document.querySelectorAll('.menu input[type=button]');

/**
 * Ajoute un produit dans le panier sur le serveur.
 * @param {MouseEvent} event Objet d'information sur l'événement.
 */
const addToPanier = async (event) => {

    const idProduit = parseInt(event.target.parentNode.dataset.idProduit);
    const data = { idProduit };

    const response = await fetch('/panier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

};
// Ajoute l'exécution de la fonction "addToPanier" pour chaque bouton d'ajout 
// au panier lorsque l'on clique dessus.
for (let bouton of boutons) {
    bouton.addEventListener('click', addToPanier)
}

