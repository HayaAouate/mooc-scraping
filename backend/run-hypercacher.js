import { runScraping } from './stores/Hypercacher.js';

// Small CLI script to run the Hypercacher scraper manually and save JSON.
// Usage: `node run-hypercacher.js` (inside backend container or with MONGO_URL set if you adapt it to persist)

async function main(){
  try{
    await runScraping();
    console.log('Run finished');
    process.exit(0);
  }catch(err){
    console.error('Error running Hypercacher scraper:', err);
    process.exit(1);
  }
}

main();
