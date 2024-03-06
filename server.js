// Aller chercher les configurations de l'application
import 'dotenv/config';

// Importer les fichiers et librairies
import https from 'https';
import { readFile } from 'fs/promises';
import express, { json, response, urlencoded } from 'express';
import { engine } from 'express-handlebars';
import session from 'express-session';
import memorystore from 'memorystore';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import cspOption from './csp-options.js'
import passport from 'passport';
import { getProduit } from './model/produit.js';
import { getPanierUtilisateur, addToPanier, removeFromPanier, emptyPanier } from './model/panier.js';
import { getCommande,getCommande_panier, soumettreCommande, modifyEtatCommande, getEtatCommande } from './model/commande.js';
import { validateId, validatePanier,isMotPasseValid,isCourrielValid } from './validation.js';
import { addUtilisateur } from './model/utilisateur.js'
import './authentification.js'
import middlewareSse from './middleware-sse.js'

// Créer un serveur
const app = express();


// Création de la base de données de session
const MemoryStore = memorystore(session);

// Configuration de l'engin de rendu
// Configuration de l'engin de rendu
app.engine('handlebars', engine({
    helpers: {
        equals: (valeur1, valeur2) => valeur1 === valeur2
    }
}))
app.set('view engine', 'handlebars');
app.set('views', './views');

// Ajouter les middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(json());
app.use(session({
    cookie: { maxAge: 3600000 },
    name: process.env.npm_package_name,
    store: new MemoryStore({ checkPeriod: 3600000 }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));
app.use(middlewareSse());

// Routes
// Route de la page du menu
app.get('/', async (request, response) => {
    let status = 200;
    response.render('menu', {
        title: 'Menu',
        produit: await getProduit(),
        erreur: status !== 200,
        user: request.user,
        admin: request.user && request.user.id_type_utilisateur === 2
    });
});

app.get('/connexion', (request, response) => {
    response.render('connexion', {
        titre: 'Connexion',
        user: request.user,
        admin: request.user && request.user.id_type_utilisateur === 2,
    })

    
});

app.post('/connexion', (request, response, next) => {

    if (isCourrielValid(request.body.courriel) && isMotPasseValid(request.body.mot_de_passe)) {

        passport.authenticate('local', (erreur, utilisateur, info) => {
            if (erreur) {
                next(erreur);
                
            }
            else if (!utilisateur) {
                response.status(401).json(info);
            }
            else {
                request.logIn(utilisateur, (erreur) => {
                    if (erreur) {
                        next(erreur);
                    }
                    let data= {
                        user : request.user
                    }
                    response.status(200).end();
                });
            }
        })(request, response, next);
    }
    else {
        response.sendStatus(400);
    }
});

app.get('/inscription', async (request, response) => {
    response.render('inscription', {
        title: 'Inscription',
        
    });
});

app.post('/inscription', async (request, response, next) => {
    
    if(isCourrielValid(request.body.courriel) &&
    isMotPasseValid(request.body.motPasse)) {
        try {
            await addUtilisateur(
                request.body.courriel,
                request.body.motPasse,
                request.body.prenom,
                request.body.nom
            );

            response.status(201).end();
        }
        catch(erreur) {
            if(erreur.code === 'SQLITE_CONSTRAINT') {
                response.status(409).end();
            }
            else {
                next(erreur)
            }
        }
    }
    else {
        response.status(400).end();
    }
});


// Route de la page du panier
app.get('/panier', async (request, response) => {
    let panier = [];
    let status = 200;
    if(!request.user) {
        return response.status(401).end();
    }

    try {
        
        const panierUtilisateur = await getPanierUtilisateur(request.user.id_utilisateur);
        panier = panierUtilisateur || [];
    } catch (erreur) {
        status = 500;
    }

    response.render('panier', {
        title: 'Panier',
        produit: panier,
        estVide: panier.length <= 0,
        user: request.user,
        admin: request.user && request.user.id_type_utilisateur === 2
    });

});


// Route pour ajouter un élément au panier
app.post('/panier', async (request, response) => {
    if(!request.user) {
        return response.status(401).end();
    }
    if (validateId(request.body.idProduit)) {
        try {
            addToPanier(request.user.id_utilisateur,request.body.idProduit, 1);
            response.sendStatus(201);
        }catch(erreur) {
            response.status(500).end();
        }}
    else {
        response.sendStatus(400);
    }
});

// Route pour supprimer un élément du panier
app.patch('/panier', async (request, response) => {
    if(!request.user) {
        return response.status(401).end();
    }
    if (validateId(request.body.idProduit)) {
        removeFromPanier(request.user.id_utilisateur,request.body.idProduit);
        response.sendStatus(200);
    }
    else {
        response.sendStatus(400);
    }
});

// Route pour vider le panier
app.delete('/panier', async (request, response) => {
    if(!request.user) {
        return response.status(401).end();
    }

    emptyPanier(request.user.id_utilisateur);
    response.sendStatus(200);
});

// Route de la page des commandes
app.get('/commande', async (request, response) => {
    

    if (!request.user) {
        
        return response.status(401).end();
    }

    if (request.user.id_type_utilisateur !== 2) {
        
        return response.status(403).end();
    }

    try {
        const commandes = await getCommande();
        const etatCommande = await getEtatCommande();

        response.render('commande', {
            title: 'Commandes',
            commande: commandes,
            etatCommande: etatCommande,
            user: request.user,
            admin: request.user && request.user.id_type_utilisateur === 2
        });

    } catch (error) {
        response.status(500).end();
    }
    
});

// Route pour soumettre le panier
app.post('/commande', async (request, response) => {
    if (await validatePanier(request.user.id_utilisateur)) {
        if (!request.user) {
            return response.status(401).end();
        }
        
        soumettreCommande(request.user.id_utilisateur);
        const donnée_commande = await getCommande_panier(request.user.id_utilisateur);

        response.pushJson({
            data : donnée_commande
        }, 'ajout-commande');
        response.sendStatus(201);
    } else {
        response.sendStatus(400);
    }
});

// Route pour modifier l'état d'une commande
app.patch('/commande', async (request, response) => {
    if (!request.user) {
        return response.status(401).end();
    }

    if (request.user.id_type_utilisateur !== 2) {
        return response.status(403).end();
    }

    if (validateId(request.body.idCommande) &&
        validateId(request.body.idEtatCommande)) {
        let id = request.body.idCommande;
        let etat = request.body.idEtatCommande;
        modifyEtatCommande(id, etat);

        response.pushJson({
            id: id,
            etat: etat
        }, 'etat-commande');

        response.sendStatus(200);
    } else {
        response.sendStatus(400);
    }
});





app.post('/deconnexion', (request, response, next) => {
    // Déconnecter l'utilisateur
    request.logOut((erreur) => {
        if(erreur) {
            next(erreur);
        }

        // Rediriger l'utilisateur vers une autre page
        response.redirect('/');
    });
});

app.get('/api/notifs', (request, response) => {
    if (!request.user) {
        
        return response.status(401).end();
    }

    if (request.user.id_type_utilisateur !== 2) {
        
        return response.status(403).end();
    }
    response.initStream();
});


// Renvoyer une erreur 404 pour les routes non définies
app.use(function (request, response) {
    // Renvoyer simplement une chaîne de caractère indiquant que la page n'existe pas
    response.status(404).send(request.originalUrl + ' not found.');
});



if(process.env.NODE_ENV === 'development'){
    let credentials = {
        key : await readFile('./security/localhost.key'),
        cert : await readFile('./security/localhost.cert')

    };

    https.createServer(credentials, app).listen(process.env.PORT);
    console.log('Serveur démarré : https://localhost:'+process.env.PORT)
}else{
    // Démarrage du serveur
    app.listen(process.env.PORT);
    console.info(`Serveurs démarré:`);
    console.info(`http://localhost:${ process.env.PORT }`);
}