const formAuth = document.getElementById('inscription');
const inputIdentifiant = document.getElementById('email');
const inputMotPasse = document.getElementById('password');
const formErreur = document.getElementById('form-erreur');

async function inscription(event) {
    event.preventDefault();
    let data = {
        courriel: inputIdentifiant.value,
        motPasse: inputMotPasse.value,
        prenom: inputIdentifiant.value,
        nom: inputMotPasse.value
    };

    let response = await fetch('/api/inscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    console.log(data)

    if(response.ok) {
        location.replace('/connexion');
    }
    else if(response.status === 409) {
        formErreur.innerText = 'L\'utilisateur est déjà existant'
    }
}


formAuth.addEventListener('submit', inscription);