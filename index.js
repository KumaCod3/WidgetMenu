'use strict' 

const express = require('express'); 
const morgan = require('morgan'); 
const bodyParser = require("body-parser");
const DBandroidMenu = require('./noDBandroidMenu');
const db = new DBandroidMenu();
const app = express(); 
const PORT = process.env.PORT;

app.use(express.json());
app.use(morgan('dev')); 
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 

app.get('/activeConfig', async (req, res) => {
    try {
        const [menuOggi, spazzaturaOggi, memoOggi] = await Promise.all([
            db.getActiveConfig(),
            db.getGiorno(),
            db.getMemoGiorno()
        ]);
        
		const pranzo ="Niente in programma";
		const cena ="Niente in programma";
		
		if (menuOggi != null){
			console.log(JSON.stringify(menuOggi));
			const pranzo = menuOggi.Pranzo ? menuOggi.Pranzo.Name : "Niente in programma";
			const cena = menuOggi.Cena ? menuOggi.Cena.Name : "Niente in programma";
		}
		
		const spazzatura = (spazzaturaOggi?.elementi?.length > 0)
			? spazzaturaOggi.elementi.map(e => `${e.icona} ${e.name}`).join(", ")
			: "Niente in programma";
		const memo = memoOggi && memoOggi.promemoria.length > 0 
			? memoOggi.promemoria.join(", ") 
			: "Niente in programma";

        const risposta = {
            pranzo: pranzo,
            cena: cena,
            spazzatura: spazzatura,
			memo: memo
        };

        res.json(risposta);
    } catch (err) {
        console.error("Errore /activeConfig:", err);
        res.status(500).json({ message: "Errore interno del server" });
    }
});

app.use((req, res) => { 
    res.status(404).send(`<h2>Uh Oh!</h2><p>Sorry ${req.url} cannot be found here</p>`); 
}); 
 
db.init()
    .then(() => { 
        app.listen(//53140, () => console.log('The server is up and running on port 53140...')); 
				PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
    }) 
    .catch(err => { 
        console.log('Problem setting up the database'); 
        console.log(err); 
    });

process.on('SIGINT', async () => {
    console.log('Chiusura del server...');
    await db.close();
    process.exit(0);
});