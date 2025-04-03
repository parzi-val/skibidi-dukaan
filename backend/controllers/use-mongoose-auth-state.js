const mongoose = require('mongoose');
const { proto } = require('baileys');
const { initAuthCreds, BufferJSON } = require('baileys');
const crypto = require('crypto');

// Define Mongoose Schema for authentication state
const authStateSchema = new mongoose.Schema({
    _id: String, // The key (e.g., 'creds', 'pre-key-1')
    value: String, // To store the encrypted serialized data
    iv: String // Initialization Vector for AES decryption
}, { 
    timestamps: true // Adds createdAt and updatedAt fields
});

// Create the model
const AuthState = mongoose.model('AuthState', authStateSchema);

/**
 * Stores the full authentication state in MongoDB using Mongoose with AES-256 encryption.
 *
 * @param {Object} options - Configuration options
 * @param {String} options.mongoURI - MongoDB connection string (optional if already connected)
 * @param {String} options.encryptionKey - AES-256 encryption key (32 bytes as hex or base64)
 * @returns {Promise<Object>} An object containing the authentication state and a function to save credentials.
 */
const useMongooseAuthState = async ({ mongoURI = null, encryptionKey = process.env.AUTH_ENCRYPTION_KEY } = {}) => {
    if (!encryptionKey) {
        throw new Error('Encryption key is required. Set AUTH_ENCRYPTION_KEY in environment variables or pass as an option.');
    }

    // Ensure the encryption key is the right length for AES-256 (32 bytes)
    let key = encryptionKey;
    if (key.length !== 32) {
        // If it's a hex string (64 characters for 32 bytes)
        if (key.length === 64 && /^[0-9a-f]+$/i.test(key)) {
            key = Buffer.from(key, 'hex');
        } 
        // If it's a base64 string
        else if (/^[A-Za-z0-9+/=]+$/.test(key)) {
            key = Buffer.from(key, 'base64');
        } 
        // Otherwise, hash the provided key to get a consistent length
        else {
            key = crypto.createHash('sha256').update(String(key)).digest();
        }
    } else if (typeof key === 'string') {
        // If it's a UTF-8 string of exactly 32 characters, convert to buffer
        key = Buffer.from(key, 'utf8');
    }

    // Connect to MongoDB if URI is provided and not already connected
    if (mongoURI && mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoURI).catch(err => {
            console.error('Failed to connect to MongoDB:', err);
            throw err;
        });
        console.log('Connected to MongoDB successfully');
    }

    /**
     * Encrypts data using AES-256-CBC.
     * 
     * @param {Object|String} data - Data to encrypt
     * @returns {Object} Object containing encrypted data and IV
     */
    const encryptData = (data) => {
        // Generate a random initialization vector
        const iv = crypto.randomBytes(16);
        // Create cipher with key and iv
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        
        // Convert data to string if it's an object
        const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
        
        // Encrypt the data
        let encrypted = cipher.update(dataString, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        
        return {
            encryptedData: encrypted,
            iv: iv.toString('base64')
        };
    };

    /**
     * Decrypts data using AES-256-CBC.
     * 
     * @param {String} encryptedData - The encrypted data as a base64 string
     * @param {String} ivString - The initialization vector as a base64 string
     * @returns {String} The decrypted data
     */
    const decryptData = (encryptedData, ivString) => {
        // Convert the IV from base64 to Buffer
        const iv = Buffer.from(ivString, 'base64');
        
        // Create decipher with key and iv
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        
        // Decrypt the data
        let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    };

    /**
     * Writes data to MongoDB using Mongoose.
     * Encrypts data using AES-256 before storing.
     *
     * @param {any} data The data to write.
     * @param {string} keyId The key (document ID) to use for storing the data.
     * @returns {Promise<void>}
     */
    const writeData = async (data, keyId) => {
        try {
            // Serialize data using BufferJSON.replacer
            const serializedData = JSON.stringify(data, BufferJSON.replacer);
            
            // Encrypt the serialized data
            const { encryptedData, iv } = encryptData(serializedData);
            
            // Use findOneAndUpdate with upsert: true to insert or update the document
            await AuthState.findOneAndUpdate(
                { _id: keyId }, // Filter by document ID (key)
                { 
                    value: encryptedData,
                    iv: iv
                }, // Set the encrypted value and IV
                { upsert: true, new: true } // Create the document if it doesn't exist
            );
        } catch (error) {
            console.error(`Error writing data for key ${keyId} to MongoDB:`, error);
            throw error; // Re-throw to allow handling by caller
        }
    };

    /**
     * Reads data from MongoDB using Mongoose.
     * Decrypts the data after retrieving.
     *
     * @param {string} keyId The key (document ID) of the data to read.
     * @returns {Promise<any|null>} The deserialized data or null if not found or an error occurs.
     */
    const readData = async (keyId) => {
        try {
            // Find the document by its ID (key)
            const document = await AuthState.findById(keyId).lean();
            
            if (document?.value && document?.iv) {
                // Decrypt the data using the stored IV
                const decryptedData = decryptData(document.value, document.iv);
                
                // Parse the decrypted JSON and apply BufferJSON.reviver
                return JSON.parse(decryptedData, BufferJSON.reviver);
            }
            return null; // Return null if document or value is not found
        } catch (error) {
            console.error(`Error reading data for key ${keyId} from MongoDB:`, error);
            return null; // Return null on error
        }
    };

    /**
     * Removes data from MongoDB using Mongoose.
     *
     * @param {string} keyId The key (document ID) of the data to remove.
     * @returns {Promise<void>}
     */
    const removeData = async (keyId) => {
        try {
            // Delete the document by its ID (key)
            await AuthState.findByIdAndDelete(keyId);
        } catch (error) {
            console.error(`Error removing data for key ${keyId} from MongoDB:`, error);
            throw error; // Re-throw to allow handling by caller
        }
    };

    // --- Main Logic ---

    // Read the initial credentials from the database
    // If not found, initialize with default credentials
    const creds = (await readData('creds')) || initAuthCreds();

    return {
        /**
         * The authentication state object.
         */
        state: {
            /**
             * The current authentication credentials.
             */
            creds,
            /**
             * Methods for managing signal keys (preKey, signedPreKey, etc.).
             */
            keys: {
                /**
                 * Retrieves signal data for the given type and IDs.
                 *
                 * @param {string} type The type of signal data (e.g., 'pre-key', 'session').
                 * @param {string[]} ids The IDs of the keys to retrieve.
                 * @returns {Promise<Object>} A dictionary mapping IDs to the corresponding signal data.
                 */
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(
                        ids.map(async (id) => {
                            // Construct the key used in the database (e.g., 'pre-key-1')
                            const key = `${type}-${id}`;
                            let value = await readData(key);

                            // Special handling for app-state-sync-key as in the original implementation
                            if (type === 'app-state-sync-key' && value) {
                                value = proto.Message.AppStateSyncKeyData.fromObject(value);
                            }

                            // Assign the retrieved value to the corresponding ID in the result object
                            data[id] = value;
                        })
                    );
                    return data;
                },
                /**
                 * Sets or updates signal data in the database.
                 *
                 * @param {Object} data A dictionary containing the signal data to set, categorized by type.
                 * @returns {Promise<void>}
                 */
                set: async (data) => {
                    const tasks = [];
                    // Iterate through each category (e.g., 'pre-key', 'session')
                    for (const category in data) {
                        // Iterate through each ID within the category
                        for (const id in data[category]) {
                            const value = data[category][id];
                            // Construct the key used in the database
                            const key = `${category}-${id}`;
                            // If value exists, write it; otherwise, remove it
                            if (value) {
                                tasks.push(writeData(value, key));
                            } else {
                                tasks.push(removeData(key));
                            }
                        }
                    }
                    // Execute all write/remove tasks concurrently
                    await Promise.all(tasks);
                },
            },
        },
        /**
         * Saves the current credentials to the database.
         * This should be called when the 'creds.update' event is emitted by the socket.
         * @returns {Promise<void>}
         */
        saveCreds: async () => {
            return writeData(creds, 'creds');
        },
    };
};



module.exports = { useMongooseAuthState };