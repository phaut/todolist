import { useState, useRef } from "react";
import "./AjoutTache.css";
export default function AjoutTache({ nouvTache, style }) {
  const [texte, setTexte] = useState("");
  const divRef = useRef(null);
  const today = new Date();
  const date =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");
  function reset() {
    setTexte("");
    if (divRef.current) {
      divRef.current.innerText = "";
    }
  }

  function handleInput(e) {
    setTexte(e.currentTarget.innerText);
  }

  function handleBlur() {
    if (texte.trim() === "") {
      reset();
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();

      const valeur = texte.trim();

      if (valeur === "") {
        reset();
        return;
      }

      nouvTache(valeur, "Basse", date);
      reset();
    }

    if (e.key === "Escape") {
      reset();
      divRef.current.blur();
    }
  }

  return (
    <div
      ref={divRef}
      className={`description editable ${texte === "" ? "vide" : ""}`}
      contentEditable
      suppressContentEditableWarning
      data-placeholder="Ajouter une tâche..."
      onInput={handleInput}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      style={style} // ← largeur et centré
    />
  );
}
