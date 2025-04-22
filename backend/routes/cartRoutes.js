const express = require('express');
const Snack = require('../models/Snack');
const User = require('../models/User');
const Order = require('../models/Order');
const { useMongooseAuthState } = require('../controllers/use-mongoose-auth-state');
const { default: makeWASocket } = require('baileys');
const P = require('pino');
const NodeCache = require('node-cache');

const router = express.Router();

router.post('/validate', async (req, res) => {
    try {
        const { id, quantity } = req.body;
        if (!id || !quantity || isNaN(quantity) || quantity < 1) {
            return res.status(400).json({ message: 'Invalid snack ID or quantity' });
        }

        const snack = await Snack.findById(id);
        if (!snack) {
            return res.status(404).json({ message: 'Snack not found' });
        }

        if (quantity > snack.quantity) {
            return res.status(200).json({ valid:false });
        }

        res.status(200).json({ valid:true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/checkout', async (req, res) => {
    try {
        const { customerInfo, items } = req.body;
        const buyerName = customerInfo.name;
        const buyerRoom = customerInfo.roomNumber || 'Not Available';
        const buyerPhone = customerInfo.phoneNumber || 'Not Available';

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order must have at least one item' });
        }

        let sellerOrders = new Map(); // Grouping orders by seller

        for (const item of items) {
            const { id, quantity } = item;
            if (!id || quantity < 1) {
                return res.status(400).json({ message: 'Invalid snack or quantity' });
            }

            const snack = await Snack.findById(id).populate('enlistedBy');
            if (!snack) {
                return res.status(404).json({ message: `Snack not found: ${id}` });
            }
            
            if (quantity > snack.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${snack.name}` });
            }

            snack.quantity -= quantity;
            await snack.save();

            const sellerId = snack.enlistedBy._id.toString();
            if (!sellerOrders.has(sellerId)) {
                sellerOrders.set(sellerId, {
                    seller: sellerId,
                    buyer: buyerName,
                    buyerRoom: buyerRoom,
                    items: [],
                    totalAmount: 0,
                    status: 'Pending',
                    createdAt: new Date(),
                    hasDeliverable: false
                });
            }

            sellerOrders.get(sellerId).items.push({
                snack: snack._id,
                quantity,
                price: snack.price * quantity
            });
            sellerOrders.get(sellerId).totalAmount += snack.price * quantity;
            if (snack.deliverable) {
                sellerOrders.get(sellerId).hasDeliverable = true;
            }
        }

        let deliverable = [];
        let nonDeliverable = [];
        
        // Create array of notification promises
        const notificationPromises = [];
        
        // Create buyer message components
        let buyerOrderSummary = [];
        let buyerPickupDetails = [];
        let totalAmount = 0;

        for (let [sellerId, orderData] of sellerOrders) {
            console.log(sellerId)
            const order = new Order(orderData);
            await order.save();
            
            const seller = await User.findById(sellerId);
            const phoneNo = seller.phoneNo || 'Not Available';
            console.log(phoneNo)

            let orderSummary = [];
            for (let item of order.items) {
                const snack = await Snack.findById(item.snack);
                if (snack.deliverable) {
                    deliverable.push({ snack: snack.name, quantity: item.quantity, enlistedBy: seller.name });
                } else {
                    nonDeliverable.push({
                        snack: snack.name,
                        quantity: item.quantity,
                        enlistedBy: seller.name,
                        roomNo: seller.roomNo || 'Not Available',
                        phoneNo: seller.phoneNo || 'Not Available'
                    });
                    
                    // Add pickup details for buyer message
                    buyerPickupDetails.push({
                        item: snack.name,
                        quantity: item.quantity,
                        seller: seller.name,
                        roomNo: seller.roomNo || 'Not Available'
                    });
                }
                orderSummary.push(`${snack.name} x ${item.quantity}`);
                buyerOrderSummary.push(`${snack.name} x ${item.quantity} - ₹${snack.price * item.quantity}`);
                totalAmount += snack.price * item.quantity;
            }

            // Construct seller message
            let message = `📦 New Order Received!\nItems: ${orderSummary.join(', ')}\n`;
            if (orderData.hasDeliverable) {
                message += `Buyer: ${buyerName}, Room No: ${buyerRoom}, Phone No: ${buyerPhone}\n`;
            } else {
                message += `Buyer: ${buyerName}`;
            }
            console.log(message);

            // Send WhatsApp Notification to seller
            if (phoneNo !== 'Not Available') {
                notificationPromises.push({ phoneNo, message });
            }
        }
        
        // Construct buyer message with order confirmation
        if (buyerPhone !== 'Not Available') {
            let buyerMessage = `🛒 Order Confirmation!\n\nThank you for your order!\n\nItems:\n${buyerOrderSummary.join('\n')}\n\nTotal Amount: ₹${totalAmount}\n`;
            
            // Add pickup instructions if needed
            if (buyerPickupDetails.length > 0) {
                buyerMessage += '\n📍 Pickup Instructions:\n';
                buyerPickupDetails.forEach(item => {
                    buyerMessage += `${item.item} x ${item.quantity} - Collect from ${item.seller} (Room ${item.roomNo})\n`;
                });
            }
            
            // Add delivery confirmation for deliverable items
            if (deliverable.length > 0) {
                buyerMessage += '\nDeliverable items will be delivered to your room shortly.';
            }
            
            // Add buyer notification to the promises array
            notificationPromises.push({ phoneNo: buyerPhone, message: buyerMessage });
        }

        // Send all notifications (if any) and close socket when done
        if (notificationPromises.length > 0) {
            // Define a function to handle sending messages sequentially
            const sendAllNotifications = async () => {
                try {
                    // Use the Mongoose auth state function with connection URI and encryption key
                    const { state, saveCreds } = await useMongooseAuthState({
                        mongoURI: process.env.MONGO_URI,
                        encryptionKey: process.env.AUTH_ENCRYPTION_KEY
                    });
                    
                    const sock = makeWASocket({
                        printQRInTerminal: true,
                        logger: P({ level: 'warn' }).child({}),
                        msgRetryCounterCache: new NodeCache(),
                        auth: state, // Pass the encrypted auth state
                    });
                    
                    // Set up connection handler
                    return new Promise((resolve, reject) => {
                        // Track sent messages
                        let messagesSent = 0;
                        let connectionOpen = false;
                        
                        sock.ev.on('connection.update', async (update) => {
                            const { connection, lastDisconnect, qr } = update;
                            
                            if (qr) {
                                console.log('QR code received, scan please:', qr);
                            }
                            
                            if (connection === 'close') {
                                const disconnectError = lastDisconnect?.error;
                                console.log('Connection closed due to', disconnectError);
                                reject(new Error('Connection closed: ' + JSON.stringify(disconnectError)));
                            } else if (connection === 'open') {
                                console.log('Connection successful 🟢');
                                connectionOpen = true;
                                
                                try {
                                    // Send messages sequentially
                                    for (const { phoneNo, message } of notificationPromises) {
                                        const WA_ID = `91${phoneNo}@s.whatsapp.net`;
                                        const [result] = await sock.onWhatsApp(WA_ID);
                                        
                                        if (result?.exists) {
                                            console.log(`${WA_ID} exists on WhatsApp.`);
                                            const msg = await sock.sendMessage(WA_ID, { text: message });
                                            console.log('Message sent successfully:', msg?.key.id, 'to', WA_ID);
                                            messagesSent++;
                                        } else {
                                            console.log(`${WA_ID} does not exist on WhatsApp.`);
                                        }
                                    }
                                    
                                    // All messages sent successfully
                                    console.log(`All ${messagesSent} messages sent successfully`);
                                    
                                    // Clean up and close the socket
                                    try{
                                        sock.ev.removeAllListeners();
                                        sock.end();
                                        console.log('Socket connection closed after all messages sent.');
                                        resolve();
                                    }catch(e){
                                        console.log(e)
                                    }
                                } catch (error) {
                                    console.error('Error sending WhatsApp messages:', error);
                                    // Clean up and close the socket on error
                                    try{
                                        sock.ev.removeAllListeners();
                                        sock.end();
                                        reject(error);
                                    }catch(e){
                                        console.log(e)
                                    }
                                }
                            }
                        });
                        
                        // Listen for credential updates and save them to MongoDB
                        sock.ev.on('creds.update', saveCreds);
                        
                        // Set a timeout in case connection never opens
                        setTimeout(() => {
                            if (!connectionOpen) {
                                sock.ev.removeAllListeners();
                                sock.end();
                                reject(new Error('Connection timeout after 30 seconds'));
                            }
                        }, 30000);
                    });
                } catch (error) {
                    console.error('Error in sendAllNotifications:', error);
                    throw error;
                }
            };
            
            try {
                await sendAllNotifications();
                console.log('All notifications sent successfully');
            } catch (error) {
                console.error('Failed to send some notifications:', error);
                // Continue with response even if notifications fail
            }
        }

        res.json({ message: 'Checkout complete', deliverable, nonDeliverable });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;