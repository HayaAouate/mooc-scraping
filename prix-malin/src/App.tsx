import { useEffect, useState } from 'react'
import './App.css'

type Product = {
  brand?: string
  title?: string
  price?: string
}

function App() {
  const [data, setData] = useState<Product[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/scrape")
      .then((res) => res.json())
      .then((result) => {
        // result should be { message, products }
        setData(result?.products ?? []);
      })
      .catch((error) => console.error("Erreur lors du scraping :", error));
  }, []);

  return (
    <div>
      <h1>Résultats du scraping :</h1>
      <ul>
        {data.map((p, i) => (
          <li key={i}>
            <strong>{p.brand || 'Marque inconnue'}</strong>
            {p.title ? ` — ${p.title}` : ''}
            {p.price ? ` (${p.price})` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App
