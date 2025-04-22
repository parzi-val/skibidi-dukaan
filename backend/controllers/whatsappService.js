// Make sure to install required packages:
// npm install mongoose @whiskeysockets/baileys @hapi/boom pino node-cache crypto

const { useMongooseAuthState } = require('./use-mongoose-auth-state');
const { default: makeWASocket, DisconnectReason } = require('baileys');
const { Boom } = require('@hapi/boom');
const P = require('pino');
const NodeCache = require('node-cache');
require('dotenv').config();

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/whatsapp_auth';

async function sendNotif(phoneNo, message) {
    return new Promise(async (resolve, reject) => {
        try {
            // Use the Mongoose auth state function with connection URI and encryption key
            const { state, saveCreds } = await useMongooseAuthState({
                mongoURI: MONGO_URI,
                encryptionKey: process.env.AUTH_ENCRYPTION_KEY // Read from environment variable
            });
            
            const WA_ID = `91${phoneNo}@s.whatsapp.net`; // Ensure country code is correct

            const sock = makeWASocket({
                printQRInTerminal: true,
                logger: P({ level: 'warn' }).child({}),
                msgRetryCounterCache: new NodeCache(),
                auth: state, // Pass the encrypted auth state
            });

            // Set a timeout for the entire operation
            const connectionTimeout = setTimeout(() => {
                console.log('WhatsApp connection timeout after 30 seconds');
                cleanupAndReject(new Error('Connection timeout'));
            }, 30000);

            // Function to clean up resources
            const cleanupAndResolve = (result) => {
                try{
                    clearTimeout(connectionTimeout);
                    sock.ev.removeAllListeners();
                    sock.end();
                    console.log('Socket closed successfully after message sent');
                    resolve(result);
                }catch(e){
                    console.log(e)
                }
            };

            const cleanupAndReject = (error) => {
                clearTimeout(connectionTimeout);
                sock.ev.removeAllListeners();
                sock.end();
                console.log('Socket closed after error');
                reject(error);
            };

            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    console.log('QR code received, scan please:', qr);
                    // Handle QR code display
                }

                if (connection === 'close') {
                    const shouldReconnect = (lastDisconnect?.error instanceof Boom) 
                        ? lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut
                        : true;
                    
                    console.log('Connection closed due to', lastDisconnect?.error, ', reconnecting:', shouldReconnect);
                    
                    // Always clean up the current socket
                    cleanupAndReject(new Error('Connection closed: ' + JSON.stringify(lastDisconnect?.error)));
                } else if (connection === 'open') {
                    console.log('Connection successful 🟢');
                    try {
                        const [result] = await sock.onWhatsApp(WA_ID);
                        if (result?.exists) {
                            console.log(`${WA_ID} exists on WhatsApp.`);
                            const msg = await sock.sendMessage(WA_ID, { text: message });
                            console.log('Message sent successfully:', msg?.key.id, 'to', WA_ID);
                            
                            // Clean up and resolve with success
                            cleanupAndResolve(msg);
                        } else {
                            console.log(`${WA_ID} does not exist on WhatsApp.`);
                            cleanupAndReject(new Error(`${WA_ID} does not exist on WhatsApp`));
                        }
                    } catch (error) {
                        console.error('Error during WhatsApp operations:', error);
                        cleanupAndReject(error);
                    }
                }
            });

            // Listen for credential updates and save them to MongoDB
            sock.ev.on('creds.update', saveCreds);

        } catch (error) {
            console.error('Error in sendNotif:', error);
            reject(error);
        }
    });
}

// sendNotif('7994806345', 'Hello from WhatsApp!') // Example usage// 

module.exports = { sendNotif };