import { useRef, useEffect, useState } from "react";

import champ from "./assets/nature.jpg";
import foret from "./assets/dolomites.jpg";
import bgImage from "./assets/champ.jpg";
import ballons from "./assets/ballons.jpg";
import cote from "./assets/cote.jpg";
import fond1 from "./assets/fond-bleu.jpg";
import fond2 from "./assets/fond-multi.jpg";
import fond3 from "./assets/fond-plus.jpg";
import fond4 from "./assets/fond-uni.jpg";
import fond5 from "./assets/fond-3.jpg";
import ListeTaches from "./ListeTaches";
import AjoutTache from "./AjoutTache";
import MonFormulaire from "./MonFormulaire";
import mixSound from "./assets/message.mp3";
import "./App.css";
import Recherche from "./recherche";
import DateDuJour from "./DateDuJour";
function App() {
  const [todos, setTodos] = useState([]);
  const [texte, setTexte] = useState("");
  const [images, setImages] = useState([
    champ,
    foret,
    bgImage,
    ballons,
    cote,
    fond1,
    fond2,
    fond3,
    fond4,
    fond5,
  ]);
  const [imageChoisie, setImageChoisie] = useState(ballons);
  const [choixTache, setChoixTache] = useState(null);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [themeModifie, setThemeModifie] = useState(false);
  const [ordreCroissant, setOrdreCroissant] = useState(true);
  const [texteBoutons, setTexteBoutons] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [taches, setTaches] = useState([]);
  const panneauRef = useRef(null);
  const sidebarref = useRef(null);
  const menuRef = useRef(null);
  const listeRef = useRef(null);
  const [choixAffichage, setChoixAffichage] = useState(false);
  const [toutes, setToutes] = useState(false);
  const [planifie, setPlanifie] = useState(false);
  // const [nbImportantes, setNbImportantes] = useState(0);
  // const [nbPlanifiees, setNbPlanifiees] = useState(0);
  // const [nbImportantes, setNbImportantes] = useState(0);
  const nbImportantes = todos.filter((t) => !t.done && t.important).length;
  const nbPlanifiees = todos.filter((t) => !t.done && t.date_echeance).length;
  const nbTaches = todos.filter((t) => !t.done).length;
  const [fade, setFade] = useState(false);
  const [saisie, setSaisie] = useState("");
  const [texteRecherche, setTexteRecherche] = useState("");
  const [filtrage, setFiltrage] = useState(false);

  /* useEffect(() => {
    setFade(true);
    const timeout = setTimeout(() => setFade(false), 500); // durée fade
    return () => clearTimeout(timeout);
  }, [imageChoisie]);*/
  const today = new Date();
  const date =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");
  console.log("date du jour ", date);

  useEffect(() => {
    console.log("TODOS ACTUELS :", todos);
    //setNbImportantes(todos.filter((t) => !t.done && t.important).length);
    //setNbPlanifiees(todos.filter((t) => !t.done && t.date_echeance).length);
  }, [todos]);

  useEffect(() => {
    const body = document.body;
    body.style.transition = "none"; // pas d'animation
    body.style.backgroundImage = `url(${imageChoisie})`;
  }, [imageChoisie]);

  useEffect(() => {
    trierParDate();
  }, [ordreCroissant]);

  /* useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);*/
  function handleTri() {
    setOrdreCroissant((prev) => !prev);
  }
  // Fermeture panneau + édition si clic extérieur
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        panneauRef.current &&
        !panneauRef.current.contains(e.target) &&
        listeRef.current &&
        !listeRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        sidebarref.current &&
        !sidebarref.current.contains(e.target)
      ) {
        console.log("Clic en dehors du panneau et de la liste");
        setChoixTache(null);
        setEditingId(null);
        setMenuOuvert(false);
        setThemeModifie(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const refresh = () => {
    window.dbAPI.getAll("SELECT * FROM todos").then(setTodos);
    const initialTextes = {};
    window.dbAPI.getAll("SELECT id, texte FROM todos").then((rows) => {
      const newTextes = {};
      rows.forEach((row) => {
        newTextes[row.id] = row.texte;
      });
      setTexteBoutons(newTextes);
    });
  };

  useEffect(() => {
    refresh();
  }, []);

  const ajouter = async () => {
    if (!texte.trim()) return;

    await window.dbAPI.run("INSERT INTO todos (texte, done) VALUES (?, 0)", [
      texte,
    ]);

    setTexte("");
    refresh();
  };

  const toggle = async (todo, e) => {
    e.stopPropagation();

    // 1️⃣ On crée la tâche mise à jour à partir de todo
    const updatedTask = { ...todo, done: !todo.done };

    // 2️⃣ Mise à jour immédiate du state (optimistic update)
    setTaches((prev) =>
      prev.map((task) => (task.id === todo.id ? updatedTask : task)),
    );

    setChoixTache(updatedTask);

    try {
      // 3️⃣ Mise à jour base de données
      await window.dbAPI.run("UPDATE todos SET done = ? WHERE id = ?", [
        updatedTask.done ? 1 : 0,
        todo.id,
      ]);

      // 4️⃣ Son seulement si on vient de cocher
      if (!todo.done) {
        playSound();
      }

      refresh();
      setOrdreCroissant(true);
      trierParDate("DESC");
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);

      // 🔁 Rollback en cas d’erreur
      setTaches((prev) =>
        prev.map((task) => (task.id === todo.id ? todo : task)),
      );
      setChoixTache(todo);
    }
  };

  const playSound = () => {
    const audio = new Audio(mixSound);
    audio.play();
  };

  const etoile = async (todo) => {
    {
      todo.important ? 0 : 1;
    }
    const nouvellePriorite = todo.important ? 0 : 1;
    await window.dbAPI.run("UPDATE todos SET important = ? WHERE id = ?", [
      nouvellePriorite,
      todo.id,
    ]);
    setChoixTache({ ...todo, important: !todo.important });
    refresh();
    setOrdreCroissant(true);
    trierParDate("DESC");
    /*  const nouvellePriorite = todo.priorite === "Haute" ? "Basse" : "Haute";
    await window.dbAPI.run("UPDATE todos SET priorite = ? WHERE id = ?", [
      nouvellePriorite,
      todo.id,
    ]);

    refresh();
    }*/
  };

  const supprimer = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette tâche ?")) {
      await window.dbAPI.run("DELETE FROM todos WHERE id = ?", [id]);
      refresh();
      setOrdreCroissant(true);
      trierParDate("DESC");
      setChoixTache(null);
    }
  };

  function handlePriorite(valeur, t) {
    const updatedTask = { ...t, priorite: valeur };

    setTaches((prev) =>
      prev.map((task) => (task.id === t.id ? updatedTask : task)),
    );

    if (choixTache && choixTache.id === t.id) {
      setChoixTache(updatedTask);
    }
    window.dbAPI
      .run("UPDATE todos SET priorite = ? WHERE id = ?", [valeur, t.id])
      .then(() => {
        refresh();
      });
  }

  function handleChangeDate(e) {
    const nouvelleDate = e.target.value;
    const updatedTask = { ...choixTache, date_echeance: nouvelleDate };

    setTaches((prev) =>
      prev.map((task) => (task.id === choixTache.id ? updatedTask : task)),
    );

    setChoixTache(updatedTask);
    window.dbAPI
      .run("UPDATE todos SET date_echeance = ? WHERE id = ?", [
        nouvelleDate,
        choixTache.id,
      ])
      .then(() => {
        refresh();
        setOrdreCroissant(true);
        trierParDate("DESC");
      });

    //trierParDate();
  }
  function planification() {
    console.log("Affichage des tâches planifiées");
    const randomNumber = Math.floor(Math.random() * 5) + 5;

    setImageChoisie(images[randomNumber]);

    setPlanifie(true);
    setChoixAffichage(false);
    setPlanifie(true);
    setOrdreCroissant(true);
    trierParDate("DESC");
    setTexteRecherche("");
  }
  function handleClick() {
    // alert("Menu cliqué !");
    setMenuOuvert(!menuOuvert);
    //setThemeModifie(false);
  }
  function modifie(src) {
    console.log("Modification du thème", src);
    // setMenuOuvert(false);
    // setThemeModifie(false);
    setImageChoisie(src);
  }
  function modifieTheme() {
    // alert("Modifier le thème");
    setThemeModifie(!themeModifie);
    //setMenuOuvert(false);
    // setPlanifie(false);
  }

  function trierParDate() {
    const ordre = ordreCroissant ? "ASC" : "DESC";

    window.dbAPI
      .getAll(
        `SELECT * FROM todos
       ORDER BY date_echeance ${ordre} NULLS LAST`,
      )
      .then((rows) => {
        setTodos(rows);
      });
  }

  function finEdition(e, t) {
    const nouveauTexte = e.currentTarget.innerText.trim();
    console.log("Fin d'édition, nouveau texte:", nouveauTexte);

    const updatedTask = { ...t, description: nouveauTexte };

    if (choixTache && choixTache.id === t.id) {
      setChoixTache(updatedTask);
    }

    window.dbAPI
      .run("UPDATE todos SET description = ? WHERE id = ?", [
        nouveauTexte, // peut être ""
        t.id,
      ])
      .then(() => {
        refresh();
        setChoixAffichage(false);
        trierParDate();
      });
  }

  function handleChange(id, value) {
    setTexteBoutons((prev) => ({ ...prev, [id]: value }));
  }
  {
    /**  function supprime(tache) {
    if (window.confirm("Voulez-vous vraiment supprimer cette tâche ?")) {
      window.dbAPI
        .run("DELETE FROM todos WHERE id = ?", [tache.id])
        .then(() => {
          refresh();
          setChoixTache(null);
        });
    }
  }*/
  }
  function toutesTaches() {
    console.log("Affichage de toutes les tâches");
    setChoixAffichage(false);
    //setToutes(true);
    setPlanifie(false);
    setOrdreCroissant(true);
    trierParDate("DESC");
    setTexteRecherche(""); // force l'input à ""
  }
  function afficheImportant() {
    console.log("Affichage des tâches importantes");
    const randomNumber = Math.floor(Math.random() * 5);
    setImageChoisie(images[randomNumber]);
    setChoixAffichage(true);
    setPlanifie(false);
    setOrdreCroissant(true);
    trierParDate("DESC");
    setTexteRecherche("");
  }
  /* function formatDateFr(dateStr) {
    if (!dateStr) return "";

    const mois = [
      "Janv.",
      "Févr.",
      "Mars",
      "Avr.",
      "Mai",
      "Juin",
      "Juil.",
      "Août",
      "Sept.",
      "Oct.",
      "Nov.",
      "Déc.",
    ];

    const [annee, moisIndex, jour] = dateStr.split("-");
    return `${jour} ${mois[parseInt(moisIndex, 10) - 1]} ${annee}`;
  }*/

  function formatDateFr(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);

    return date.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "long",
      // year: "2-digit",
    });
  }
  function afficheTache(tache) {
    setChoixTache(tache);
  }
  function nouvTache(texte, priorite = "Basse", date) {
    // console.log("Nouvelle tâche:", texte, priorite, date);
    const nouvelleTache = {
      texte: texte,
      done: "",
      date_creation: date,
    };
    window.dbAPI
      .run(
        "INSERT INTO todos (texte, done, priorite , date_creation) VALUES (?, 0, ?,?)",
        [texte, priorite, date],
      )
      .then(() => {
        refresh();
        setChoixTache(null);
      });
    console.log("Nouvelle tâche:", choixTache);
  }
  function modifieTache(tache) {
    const nouveauTitre = texteBoutons[tache.id] || tache.titre;
    // Éviter les mises à jour si le titre n'a pas changé
    if (nouveauTitre === tache.texte) {
      setEditingId(null);
      return;
    }
    const updatedTask = {
      ...tache,
      texte: nouveauTitre,
    };
    if (choixTache && choixTache.id === tache.id) {
      setChoixTache(updatedTask);
    }
    window.dbAPI
      .run("UPDATE todos SET texte = ? WHERE id = ?", [nouveauTitre, tache.id])
      .then(() => {
        setEditingId(null);
        refresh();
        trierParDate("DESC");
        setTexteRecherche("");
      });
  }
  function afficheTermines() {
    setFiltrage(!filtrage);
    setMenuOuvert(!menuOuvert);
  }
  async function rechercher(texte) {
    setTexteRecherche(texte);

    // 🔴 on désactive les filtres visuels
    setChoixAffichage(false);
    setPlanifie(false);

    const rows = await window.dbAPI.getAll(
      "SELECT * FROM todos WHERE texte LIKE ?",
      [`%${texte}%`],
    );

    setTodos(rows);
  }

  async function resetTodos() {
    const toutesLesTaches = await window.dbAPI.getAll("SELECT * FROM todos");
    setTodos(toutesLesTaches);
    setEditingId(null);
  }

  return (
    <div
      className={`app-bg ${choixTache ? "panneau-ouvert" : ""}`}
      style={{ backgroundImage: `url(${imageChoisie})` }}
    >
      {/* SIDEBAR */}
      <aside ref={sidebarref} className="sidebar">
        <div className="recherche-container">
          <Recherche
            texte={texteRecherche} // valeur contrôlée depuis le parent
            setTexte={setTexteRecherche} // permet au composant enfant de modifier le parent
            rechercher={rechercher} // fonction de recherche
          />
        </div>
        <div className="logo" onClick={() => afficheImportant()}>
          <span>⭐️</span>
          <span> Importantes</span>
          <span className="badge">{nbImportantes}</span>
        </div>
        <div className="logo" onClick={() => toutesTaches()}>
          <span>📋</span>
          <span> Tâches</span>
          <span className="badge">{nbTaches}</span>
        </div>
        <div className="logo" onClick={() => planification()}>
          <span>📆</span>
          <span> Planifiées</span>
          <span className="badge">{nbPlanifiees}</span>
        </div>
      </aside>
      {/* CONTENU PRINCIPAL */}

      <div className="main-content">
        <div className="menu">
          <h2 style={{ marginTop: "20px", color: "white" }}>Tâches</h2>
          <DateDuJour
            date={formatDateFr(date)}
            style={{ marginTop: "20px", color: "white" }}
          />
          <div className="menu-wrapper" ref={menuRef}>
            <button className="menu-btn" onClick={handleClick}>
              ⋯
            </button>

            {menuOuvert && (
              <div className="menu-popup">
                <div className="menu-item" onClick={() => afficheTermines()}>
                  🔎{" "}
                  {filtrage
                    ? "Afficher les tâches terminées"
                    : " Masquer les tâches terminées"}
                </div>
                <div className="menu-item" onClick={handleTri}>
                  🧭 Trier par date {ordreCroissant ? "↑" : "↓"}
                </div>
                <div className="menu-item" onClick={() => modifieTheme()}>
                  ⚙️ Modifier le theme...
                </div>
              </div>
            )}
            {themeModifie && (
              <>
                <div className="menu-popup">
                  <div className="menu-item">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        className="btnImage"
                        onClick={() => modifie(img)}
                      >
                        <img src={img} alt="thème" />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        {/*******************************************************************************/}
        <div ref={panneauRef} className={`panneau ${choixTache ? "open" : ""}`}>
          {choixTache && (
            <>
              <div className="cellulePanneau">
                <input
                  type="checkbox"
                  checked={choixTache.done}
                  onChange={(e) => toggle(choixTache, e)}
                />
                <h3> {choixTache.texte}</h3>
                <button
                  className="important"
                  onClick={() => etoile(choixTache)}
                >
                  <span className={choixTache.important ? "active" : ""}>
                    {choixTache.important ? "⭐️" : "☆"}
                  </span>
                </button>
              </div>

              <div
                className="descriptionNote"
                contentEditable
                suppressContentEditableWarning
                data-placeholder="📎 Ajouter une note."
                onBlur={(e) => finEdition(e, choixTache)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
              >
                {choixTache.description}
              </div>

              <MonFormulaire
                prioriteInitiale={choixTache.priorite}
                onValider={(valeur) => handlePriorite(valeur, choixTache)}
              />
              <div style={{ display: "flex" }}>
                <label
                  style={{ fontSize: "14px", lineHeight: "1.5", margin: 0 }}
                >
                  Échéance :
                </label>
                <input
                  type="date"
                  style={{ width: "110px", marginLeft: "10px" }}
                  value={choixTache.date_echeance || ""}
                  onChange={(e) => handleChangeDate(e)}
                />
              </div>
              <div class="separateur"></div>
              <p>{choixTache.done ? "Terminée ✅" : "En cours ⏳"}</p>

              <div class="separateur"></div>
              <div className="zoneBas">
                <button className="close" onClick={() => setChoixTache(null)}>
                  &gt;
                </button>

                <span className="centreBas">
                  Créée {formatDateFr(choixTache.date_creation)}
                </span>

                <button
                  className="button-right"
                  onClick={() => supprimer(choixTache.id)}
                >
                  🗑️
                </button>
              </div>
            </>
          )}
        </div>
        {/********************************************************************************/}
        <div ref={listeRef}>
          <ListeTaches
            todos={todos}
            filtreTermine={false}
            supprimer={supprimer}
            toggle={toggle}
            etoile={etoile}
            texteBoutons={texteBoutons}
            setEditingId={setEditingId}
            editingId={editingId}
            setTexteBoutons={setTexteBoutons}
            modifieTache={modifieTache}
            handleChange={handleChange}
            afficheTache={afficheTache}
            formatDateFr={formatDateFr}
            choixAffichage={choixAffichage}
            planifie={planifie}
          />
          {/* <div className="todo-input">
            <input
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              placeholder="Nouvelle tâche"
            />
              <button onClick={ajouter}>Ajouter</button>
          </div>*/}
          <AjoutTache
            nouvTache={nouvTache}
            style={{
              width: "98%",
              margin: "10px auto",
              height: "40px",
              background: "rgba(255, 255, 255, 0.6)",
            }}
          />
          {!choixAffichage && !planifie && !filtrage && (
            <>
              <h3 style={{ marginTop: "20px", color: "white" }}>
                Tâches terminées
              </h3>

              <ListeTaches
                todos={todos}
                filtreTermine={true}
                supprimer={supprimer}
                toggle={toggle}
                etoile={etoile}
                texteBoutons={texteBoutons}
                setEditingId={setEditingId}
                editingId={editingId}
                setTexteBoutons={setTexteBoutons}
                modifieTache={modifieTache}
                handleChange={handleChange}
                afficheTache={afficheTache}
                formatDateFr={formatDateFr}
                choixAffichage={choixAffichage}
                planifie={planifie}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
