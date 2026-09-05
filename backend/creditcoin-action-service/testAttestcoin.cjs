require('dotenv').config();
const { verifySourceChainEvent } = require('./attestcoinVerification.cjs');

const sepoliaTxHash = '0x70f2a7b8cc81b247b5b79f055fe1bed525fb9609f352d9fa2dfebbcb7a71d6da'; // your full tx hash

verifySourceChainEvent(sepoliaTxHash, process.env.PRIVATE_KEY)
  .then((result) => {
    console.log('SUCCESS:', result);
  })
  .catch((err) => {
    console.error('FAILED:', err.message);
  });