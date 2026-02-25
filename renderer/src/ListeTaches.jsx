import "./App.css";

export default function ListeTaches({
  todos,
  toggle,
  supprimer,
  filtreTermine,
  texteBoutons,
  setEditingId,
  editingId,
  setTexteBoutons,
  modifieTache,
  handleChange,
  afficheTache,
  etoile,
  formatDateFr,
  choixAffichage,
  planifie,
}) {
  //console.log("Affichage de la liste des tâches", {
  //  choixAffichage,
  //});

  return (
    <div className="liste">
      {todos
        //.filter((todo) => (choixAffichage ? todo.important : !todo.important))
        // .filter((todo) => (filtreTermine ? todo.done : !todo.done))

        .filter((todo) => !choixAffichage || todo.important)
        .filter((todo) => (filtreTermine ? todo.done : !todo.done))
        .filter((todo) => !planifie || (todo.date_echeance && !todo.done))
        .map((todo) => {
          //console.log("DATE =", todo.date_echeance);
          const isEditing = editingId === todo.id;
          return (
            <div className="ligne" key={todo.id}>
              {!isEditing ? (
                <div className="cellule contenu">
                  <input
                    type="checkbox"
                    checked={!!todo.done}
                    onChange={(e) => toggle(todo, e)}
                  />
                  <div className="cellule">
                    <div className="spanTexte">
                      <span
                        className="texte"
                        onClick={() => afficheTache(todo)}
                        style={
                          todo.done ? { textDecoration: "line-through" } : {}
                        }
                      >
                        {texteBoutons[todo.id] || todo.texte}
                      </span>
                      <span>
                        📆{" "}
                        <span style={todo.done ? { color: "red" } : {}}>
                          {formatDateFr(todo.date_echeance)}
                        </span>
                        {"  "}
                        {todo.description ? ". ・📝 Note" : ""}
                      </span>
                    </div>
                  </div>
                  <button
                    className="edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(todo.id);
                      console.log("Edition de la tâche", todo.id);
                    }}
                  >
                    ✏️
                  </button>
                  <button className="important" onClick={() => etoile(todo)}>
                    <span className={todo.important ? "active" : ""}>
                      {todo.important ? "⭐️" : "☆"}
                    </span>
                  </button>
                  {/*<span className={todo.done ? "done" : ""}>{todo.texte}</span>*/}
                </div>
              ) : (
                <div className="cellule edition">
                  <input
                    className="inputEdit"
                    value={texteBoutons[todo.id] || todo.texte}
                    onChange={(e) => handleChange(todo.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") modifieTache(todo);
                      else if (e.key === "Escape") {
                        setEditingId(null);
                        setTexteBoutons((prev) => ({
                          ...prev,
                          [todo.id]: todo.texte,
                        }));
                      }
                    }}
                    autoFocus
                  />

                  <button className="ok" onClick={() => modifieTache(todo)}>
                    ✔
                  </button>
                  <button className="cancel" onClick={() => supprimer(todo.id)}>
                    ✖
                  </button>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
