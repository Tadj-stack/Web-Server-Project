// Liste de tous les <select> pour les commandes
let selects = document.querySelectorAll('.commande select');

function genererHtmlCommande(commande) {
    const commandeHtml = `
      <li data-id-commande="${commande.id_commande}">
          <div class="info">
              <div class="id">${commande.id_commande}</div>
              <div class="date">${commande.date}</div>
              <select>
                  <option value="2" ${commande.id_etat_commande === 2 ? 'selected' : ''}>cuisine</option>
                  <option value="3" ${commande.id_etat_commande === 3 ? 'selected' : ''}>livraison</option>
                  <option value="4" ${commande.id_etat_commande === 4 ? 'selected' : ''}>terminée</option>
              </select>
          </div>
          <table class="produit">
              <thead>
                  <tr>
                      <th></th>
                      <th class="nom">Produit</th>
                      <th class="quantite">Quantité</th>
                  </tr>
              </thead>
              <tbody>
                  ${commande.produit ? commande.produit.map(produit => `
                      <tr data-id-produit="${produit.id_produit}">
                          <td><img src="${produit.chemin_image}" alt="${produit.nom || ''}"></td>
                          <td class="nom">${produit.nom || ''}</td>
                          <td class="quantite">${produit.quantite || ''}</td>
                      </tr>
                  `).join('') : ''}
              </tbody>
          </table>
      </li>`;
  
    // Ajout de la nouvelle commande à la liste existante
    const commandesList = document.querySelector('.commande');
    commandesList.insertAdjacentHTML('beforeend', commandeHtml);
  }
  
  
  


/**
 * Modifie l'état d'une commande sur le serveur.
 * @param {InputEvent} event Objet d'information sur l'événement.
 */
const modifyEtatCommande = async (event) => {
    let data = {
        idCommande: parseInt(event.target.parentNode.parentNode.dataset.idCommande),
        idEtatCommande: parseInt(event.target.value)
    };

    await fetch('/commande', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

// Ajoute l'exécution de la fonction "modifyEtatCommande" pour chaque <select> 
// lorsque son état change.
for (let select of selects) {
    select.addEventListener('change', modifyEtatCommande)
}



let source = new EventSource ('/api/notifs');



// Écoute de l'événement "ajout-commande"
source.addEventListener('ajout-commande', (event) => {
    // Extraction des données de l'événement
    let eventData = JSON.parse(event.data);

    // Récupération des nouvelles données de la commande
    let nouvelleCommande = eventData.data;
  genererHtmlCommande(nouvelleCommande[0]);
});





source.addEventListener('etat-commande', (event) => {
    let data = JSON.parse(event.data);
    const selectElement = document.querySelector(`.commande li[data-id-commande="${data.id}"] select`);
    
    if (selectElement) {
      selectElement.value = data.etat;
    }
  });

