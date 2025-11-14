// server.js (partie connexion DB)
// ...
dotenv.config();

// Vérifie si nous sommes en environnement Docker, sinon utilise le local
const MONGODB_URI = process.env.DOCKER_MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/fallback_db'; 

mongoose.connect(MONGODB_URI)
// ...  backend:
    depends_on:
      - mongo_db