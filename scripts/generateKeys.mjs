import { generateKeyPairSync } from 'node:crypto';
import fs from 'node:fs';

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki', // Recommended to use 'spki' for public keys
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8', // Recommended to use 'pkcs8' for private keys
        format: 'pem',
    }
});

// Save the keys to files
fs.writeFileSync('../certs/private_key.pem', privateKey);
fs.writeFileSync('../certs/public_key.pem', publicKey);


