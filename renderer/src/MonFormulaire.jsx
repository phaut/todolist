export default function MonFormulaire({ prioriteInitiale, onValider }) {
  function handleChangePriorite(e) {
    const nouvelleValeur = e.target.value;
    onValider?.(nouvelleValeur);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <label style={{ fontSize: "14px" }}>Priorité :</label>

      <select
        value={prioriteInitiale || ""}
        onChange={handleChangePriorite}
        style={{ width: "120px", padding: "4px", fontSize: "14px" }}
      >
        <option value="Haute">Haute</option>
        <option value="Moyenne">Moyenne</option>
        <option value="Basse">Basse</option>
      </select>
    </div>
  );
}
