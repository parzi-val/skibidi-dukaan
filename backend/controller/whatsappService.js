const {
    default:
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
} = require("baileys");
const {
    Boom
} = require('@hapi/boom');
const P = require('pino');
const NodeCache = require('node-cache');


const log = P({
    timestamp: () => `,"time":"${new Date().toJSON()}"`,
});

const logger = log.child({});
logger.level = 'warn';

const msgRetryCounterCache = new NodeCache()

async function sendNotif(phoneNo, message) {
    const { state, saveCreds } = await useMultiFileAuthState('auth_state')
    const WA_ID = `91${phoneNo}@s.whatsapp.net`
    const sock = makeWASocket({
        printQRInTerminal: true,
        logger: logger,
        msgRetryCounterCache,
        auth: state,
    });
    sock.ev.on('connection.update', async(update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            if (shouldReconnect) {
                sendNotif(phoneNo, message);
            }
        }else if (connection === 'open') {
            const [result] = await sock.onWhatsApp(WA_ID)
            if (!result) {
                console.log('Not on whatsapp!')
            }
            console.log('Connection successful 🟢');
            const msg = await sock.sendMessage(WA_ID, {
                text: message
            });
        }
    });
    sock.ev.on('creds.update', saveCreds);
}

const notif = sendNotif('<phone>', 'Hello, this is a test message')