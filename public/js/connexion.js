const formAuth = document.getElementById('form-auth');
const inputCourriel = document.getElementById('email');
const inputMotPasse = document.getElementById('password');
const formErreur = document.getElementById('form-erreur');

async function connexion(event) {
    event.preventDefault();

    let data = {
        courriel: inputCourriel.value,
        mot_de_passe: inputMotPasse.value
    };

    let response = await fetch('/connexion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    

    if(response.ok) {
        location.replace('/')
    }
    else if(response.status === 401) {
        let info = await response.json();
        if(info.erreur === 'mauvais_courriel') {
            formErreur.innerText = 'Ce compte n\'existe pas';
        }
        else if(info.erreur === 'mauvais_mot_de_passe') {
            formErreur.innerText = 'Mauvais mot de passe';
        }
    }
}

formAuth.addEventListener('submit', connexion)