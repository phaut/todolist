/*export default function Recherche({ texte, setTexte, rechercher }) {
  const handleChange = (e) => {
    setTexte(e.target.value);
    rechercher(e.target.value);
  };

  return (
    <div className="search-wrapper">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        value={texte} // valeur contrôlée depuis le parent
        onChange={handleChange}
      />
      <span className={`placeholder-text ${texte ? "hidden" : ""}`}>
        Ajouter une note...
      </span>
    </div>
  );
}*/
import { useState, useEffect } from "react";

export default function Recherche({ texte, setTexte, rechercher }) {
  const [valeur, setValeur] = useState(texte || "");

  // Synchronise le champ local avec le parent si le parent change
  useEffect(() => {
    setValeur(texte);
  }, [texte]);

  // Debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      rechercher(valeur);
      setTexte(valeur);
    }, 300);

    return () => clearTimeout(timeout);
  }, [valeur]);

  return (
    <div className="search-wrapper">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        value={valeur}
        onChange={(e) => setValeur(e.target.value)}
        placeholder="Rechercher..."
      />
      <span className={`placeholder-text ${valeur ? "hidden" : ""}`}></span>
    </div>
  );
}
