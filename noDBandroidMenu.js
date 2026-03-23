const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// --- SCHEMI DB MENU ---
const ingredientiSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    Price: { type: Number, required: true },
});

const ricettaSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    Ingredienti: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ingrediente' }],
    Temperatura: { type: Number, required: true },
    Orario: { type: Number, required: true },
    Note: { type: String, required: true },
    Menus: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Menu' }],
    Prova: { type: Boolean, required: true, default: false }
});

const settimanaSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    Temperatura: { type: Number, required: true },
    Giorni: [{
        Nome: { type: String },
        Pranzo: { type: mongoose.Schema.Types.ObjectId, ref: 'Ricetta' },
        Cena: { type: mongoose.Schema.Types.ObjectId, ref: 'Ricetta' }
    }],
    Menu: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' }
});

const menuSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    Temperatura: { type: Number, required: true },
    Settimane: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Settimana' }]
});

const programma = new mongoose.Schema({
	Data: { type: Date, required: true },
	Pranzo: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Ricetta'
		},
	Cena: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Ricetta'
		},
	Settimana: { type: mongoose.Schema.Types.ObjectId, ref: 'Settimana' }
})

// --- SCHEMI DB SPAZZATURA ---
const elementDefinitionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    icona: String,
    colore: String
});

const dailyPlanSchema = new mongoose.Schema({
    giorno: { type: Number, required: true },
    elementi: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Elementi' }]
});

// --- SCHEMI DB PROMEMORIA ---
const DailyPromemoriaSchema = new mongoose.Schema({
  giorno: {
    type: Number,
    required: true
  },
  promemoria: [{
    type: String
  }]
});

// --- CLASSE UNIFICATA ---
class DBandroidMenu {
    constructor() {
		this.urlMenu =  process.env.MONGODBmenu_URI;
        this.urlSpazzatura = process.env.MONGODBspazzatura_URI;
        this.urlPromemoria = process.env.MONGODBpromemoria_URI;
    //    this.urlMenu =   'mongodb://172.17.0.1:27017/menu';
    //   this.urlSpazzatura = 'mongodb://172.17.0.1:27017/spazzatura';
    //   this.urlPromemoria = 'mongodb://172.17.0.1:27017/promemoria';
    //    this.urlMenu =   'mongodb://192.168.1.15:27017/menu';
    //    this.urlSpazzatura = 'mongodb://192.168.1.15:27017/spazzatura';
    //    this.urlPromemoria = 'mongodb://192.168.1.15:27017/promemoria';
        
        this.connMenu = null;
        this.connSpazzatura = null;
        this.connPromemoria = null;
        this.models = {};
    }

    async init() {
        try {
            // Creazione connessioni indipendenti
            this.connMenu = await mongoose.createConnection(this.urlMenu).asPromise();
            this.connSpazzatura = await mongoose.createConnection(this.urlSpazzatura).asPromise();
            this.connPromemoria = await mongoose.createConnection(this.urlPromemoria).asPromise();

            // Inizializzazione Modelli su Connessione MENU
            this.models.Ingrediente = this.connMenu.model('Ingrediente', ingredientiSchema);
            this.models.Ricetta = this.connMenu.model('Ricetta', ricettaSchema);
            this.models.Settimana = this.connMenu.model('Settimana', settimanaSchema);
            this.models.Menu = this.connMenu.model('Menu', menuSchema);
            this.models.Programma = this.connMenu.model('Programma', programma);

            // Inizializzazione Modelli su Connessione SPAZZATURA
            this.models.Elementi = this.connSpazzatura.model('Elementi', elementDefinitionSchema);
            this.models.Giorni = this.connSpazzatura.model('Giorni', dailyPlanSchema);
			
			this.models.Promemoria = this.connPromemoria.model('Promemoria', DailyPromemoriaSchema);

            console.log('Sistemi Database pronti: Menu & Spazzatura connessi.');
        } catch (err) {
            console.error('Errore fatale durante l’inizializzazione dei DB:', err);
            throw err;
        }
    }

    // --- METODI DB MENU ---
    async getActiveConfig() {
		var oggi = new Date();
		var inizioGiorno = new Date(oggi);
		inizioGiorno.setDate(oggi.getDate() );
		inizioGiorno.setHours(0, 0, 0, 0);
		var fineGiorno = new Date(oggi);
		fineGiorno.setDate(oggi.getDate() );
		fineGiorno.setHours(23, 59, 59, 999);

		return await this.models.Programma.findOne({
			Data: {
				$gte: inizioGiorno,
				$lte: fineGiorno
			}
		})
			.populate('Pranzo')
			.populate('Cena');
	}
    // --- METODI DB SPAZZATURA ---
    async getGiorno() {
		const data=null;
        const oggi = data ? new Date(data) : new Date();
        const mese = oggi.getMonth() + 1;
        const numeroGiorno = oggi.getDate();
        const identificatore = (mese * 100) + numeroGiorno;

        try {
            return await this.models.Giorni.findOne({ 'giorno': identificatore })
                .populate('elementi')
                .lean();
        } catch (e) {
            console.error("Errore nella ricerca del giorno spazzatura: " + e);
            return null;
        }
    }
	
	   // --- METODI DB PROMEMORIA ---
    async getMemoGiorno() {
		const data=null;
        const oggi = data ? new Date(data) : new Date();
        const mese = oggi.getMonth() + 1;
        const numeroGiorno = oggi.getDate();
        const identificatore = (mese * 100) + numeroGiorno;

        try {
            return await this.models.Promemoria.findOne({ 'giorno': identificatore })
                .lean();
        } catch (e) {
            console.error("Errore nella ricerca del MEMO giorno: " + e);
            return null;
        }
    }

    // --- CHIUSURA ---
    async close() {
        try {
            await Promise.all([
                this.connMenu.close(),
                this.connSpazzatura.close()
            ]);
            console.log('Tutte le connessioni MongoDB sono state chiuse.');
        } catch (err) {
            console.error('Errore durante la disconnessione:', err);
        }
    }
}

module.exports = DBandroidMenu;