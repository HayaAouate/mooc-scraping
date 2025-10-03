import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [data, setData] = useState<string[]>([]); 

  useEffect(() => {
    fetch("http://localhost:3000/scrape")
      .then((res) => res.json())
      .then((json) => setData(json.titles))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1>Résultats du scraping :</h1>
      <ul>
        {data.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  );
}


export default App
