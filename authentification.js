import bcrypt from 'bcrypt'
import passport from 'passport'
import { Strategy } from 'passport-local'
import { getUtilisateurParId, getUtilisateurParCourriel } from './model/utilisateur.js'


const config = {
    usernameField: 'courriel',
    passwordField: 'mot_de_passe'
};



passport.use(new Strategy(config, async (courriel, mot_de_passe, done) => {
    console.log("hello")
    try {
        // On va chercher l'utilisateur dans la base
        // de données avec son identifiant, le
        // courriel ici
        const utilisateur = await getUtilisateurParCourriel(courriel);
        console.log(utilisateur)
        console.log('utilisateur')


        // Si on ne trouve pas l'utilisateur, on
        // retourne que l'authentification a échoué
        // avec un message
        if (!utilisateur) {
            console.log('utilisateur')

            return done(null, false, { erreur: 'mauvais_courriel' });
        }

        // Si on a trouvé l'utilisateur, on compare
        // son mot de passe dans la base de données
        // avec celui envoyé au serveur. On utilise
        // une fonction de bcrypt pour le faire
        console.log(mot_de_passe)
        console.log(utilisateur.mot_de_passe)
        const valide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);

        // Si les mot de passe ne concorde pas, on
        // retourne que l'authentification a échoué
        // avec un message
        if (!valide) {
            return done(null, false, { erreur: 'mauvais_mot_de_passe' });
        }

        // Si les mot de passe concorde, on retourne
        // l'information de l'utilisateur au serveur
        return done(null, utilisateur);
    }
    catch (error) {
        return done(error);
    }
}));

passport.serializeUser((utilisateur, done) => {
    // On mets uniquement le courriel dans la session
    done(null, utilisateur.id_utilisateur);

});

passport.deserializeUser(async (idUtilisateur, done) => {

    try {
        const user = await getUtilisateurParId(idUtilisateur);
        done(null, user); // Corrected from `utilisateur` to `user`
    } catch (erreur) {
        done(erreur);
    }
});

