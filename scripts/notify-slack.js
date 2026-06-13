import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getVersion() {
    try {
        const packageJsonPath = path.join(__dirname, '../package.json');
        const packageData = fs.readFileSync(packageJsonPath, 'utf8');
        const pkg = JSON.parse(packageData);
        return pkg.version || '1.0.0';
    } catch (e) {
        return 'Neznámá verze';
    }
}

function getReleaseNotes() {
    try {
        const notesPath = path.join(__dirname, '../release_notes_v1.0.1.md');
        return fs.readFileSync(notesPath, 'utf8');
    } catch (e) {
        return 'Žádné nové poznámky k vydání nebyly nalezeny.';
    }
}

async function sendToSlack() {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    
    if (!webhookUrl) {
        console.error("❌ Chybí proměnná SLACK_WEBHOOK_URL. Nastavte ji jako proměnnou prostředí.");
        process.exit(1);
    }

    const version = getVersion();
    const rawNotes = getReleaseNotes();
    
    const payload = {
        text: `🚀 *Nová verze ${version} právě byla úspěšně nasazena!* 🚀\n\nZde jsou poznámky k vydání:`,
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: `🚀 Nasazena verze: ${version}`,
                    emoji: true
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*Kód byl úspěšně nasazen na produkci.* Níže jsou uvedeny Release Notes."
                }
            },
            {
                type: "divider"
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: rawNotes.substring(0, 2900) + (rawNotes.length > 2900 ? "\n\n_(Zbytek textu byl zkrácen)_" : "")
                }
            }
        ]
    };

    console.log(`Odesílám notifikaci do Slacku pro verzi ${version}...`);

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log("✅ Úspěšně odesláno do Slack kanálu.");
        } else {
            console.error(`❌ Chyba při odesílání do Slacku: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error("❌ Síťová chyba při spojení se Slackem:", error);
    }
}

sendToSlack();
