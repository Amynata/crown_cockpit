import { useState, useEffect, useRef } from "react";

/* ============================================================
   Crown On Me — Cockpit fondatrice + Journal
   Structure inspirée de Cuttles, adaptée B2B-first.
   Signature : la couronne se complète à mesure que
   les sections passent en "Validé".
   ============================================================ */

const KEY = "crownonme:cockpit:v1";

const SECTIONS = [
  {
    key: "canvas",
    tag: "00",
    label: "Canvas",
    sub: "Valider l’idée d’un coup d’œil",
    fields: [
      { key: "probleme", label: "Problème", hint: "Les 1–3 problèmes majeurs des cheveux texturés que tu adresses" },
      { key: "segments", label: "Segments clients", hint: "Coiffeur·se·s spécialisé·e·s, personnes à cheveux crépus / bouclés…" },
      { key: "uvp", label: "Proposition de valeur unique", hint: "Le message clair, en une phrase, qui te distingue" },
      { key: "solution", label: "Solution", hint: "Comment Crown On Me résout concrètement le problème" },
      { key: "canaux", label: "Canaux", hint: "Comment tu atteins tes clients (salons, réseaux, bouche-à-oreille…)" },
      { key: "revenus", label: "Sources de revenus", hint: "Licence salon, abonnement, paiement à l’acte…" },
      { key: "couts", label: "Structure de coûts", hint: "Fal.ai, Firebase, temps, acquisition…" },
      { key: "metriques", label: "Indicateurs clés", hint: "Les métriques qui comptent vraiment" },
      { key: "avantage", label: "Avantage déloyal", hint: "Ce qui est difficile à copier" },
    ],
  },
  {
    key: "pitch",
    tag: "01",
    label: "Pitch",
    sub: "Convaincre en une page",
    fields: [
      { key: "probleme", label: "Problème", hint: "Le problème, rendu vivant" },
      { key: "solution", label: "Solution", hint: "Ta réponse, en clair" },
      { key: "uvp", label: "Proposition de valeur", hint: "Pourquoi c’est mieux / différent" },
      { key: "marche", label: "Marché", hint: "Taille et dynamique du marché" },
      { key: "bizmodel", label: "Business model", hint: "Comment tu gagnes de l’argent" },
      { key: "timing", label: "Pourquoi maintenant", hint: "Ce qui rend le moment opportun" },
      { key: "equipe", label: "Pourquoi toi", hint: "Ce qui fait de toi la bonne personne" },
      { key: "ask", label: "L’ask", hint: "Ce que tu demandes (montant, partenariat, pilote…)" },
    ],
  },
  {
    key: "produit",
    tag: "02",
    label: "Produit & Build",
    sub: "L’offre et son état d’avancement",
    fields: [
      { key: "offre", label: "Description de l’offre", hint: "Ce que fait le produit, en concret" },
      { key: "roadmap", label: "Roadmap", hint: "Les grands jalons produit à venir" },
      { key: "stack", label: "Stack technique", hint: "FlutterFlow · Fal.ai LoRA · Firebase…" },
      { key: "poc", label: "État des POC", hint: "Coiffeur·se·s pilotes, retours, ce qui reste à livrer" },
      { key: "next", label: "Prochaines features", hint: "Ce qui vient juste après" },
    ],
  },
  {
    key: "marche",
    tag: "03",
    label: "Marché & GTM",
    sub: "Cibles, concurrence, acquisition",
    fields: [
      { key: "personas", label: "Cibles / personas", hint: "Qui, précisément" },
      { key: "taille", label: "Taille de marché", hint: "TAM / SAM / SOM ou une estimation honnête" },
      { key: "concurrence", label: "Concurrence", hint: "Qui d’autre, et où tu te places" },
      { key: "canaux", label: "Canaux d’acquisition", hint: "Comment tu vas chercher les premiers clients" },
      { key: "gtm", label: "Stratégie B2B / B2C", hint: "L’ordre dans lequel tu attaques les marchés" },
      { key: "pricing", label: "Pricing", hint: "Combien, sous quelle forme" },
    ],
  },
  {
    key: "finances",
    tag: "04",
    label: "Finances",
    sub: "Budget, runway, point mort",
    fields: [
      { key: "budget", label: "Budget & dépenses", hint: "Les postes de dépense, mensuels si possible" },
      { key: "revenus", label: "Revenus prévisionnels", hint: "Hypothèses de chiffre d’affaires" },
      { key: "runway", label: "Runway", hint: "Combien de mois d’autonomie", short: true },
      { key: "breakeven", label: "Point mort", hint: "Le seuil de rentabilité" },
      { key: "capital", label: "Besoin en capital", hint: "Combien il te faut, pour faire quoi" },
    ],
  },
  {
    key: "equipe",
    tag: "05",
    label: "Équipe & Cap Table",
    sub: "Rôles, recrutements, répartition",
    hasCapTable: true,
    fields: [
      { key: "fondateurs", label: "Fondateur·rice·s & rôles", hint: "Qui fait quoi" },
      { key: "recruter", label: "Compétences à recruter", hint: "Les trous dans la raquette" },
      { key: "conseillers", label: "Conseiller·e·s / mentors", hint: "Les personnes ressources autour de toi" },
    ],
  },
  {
    key: "levee",
    tag: "06",
    label: "Levée & CRM",
    sub: "Programmes, investisseurs, data room",
    hasCrm: true,
    fields: [
      { key: "objectif", label: "Objectif de levée", hint: "Montant visé et usage des fonds" },
      { key: "programmes", label: "Programmes / accélérateurs", hint: "Startup Banlieue, La Ligue, autres…" },
      { key: "dataroom", label: "Data room / documents", hint: "Où en est le pitch deck, le BP, les chiffres" },
    ],
  },
];

const STATUS = {
  todo: { label: "À faire", short: "À faire" },
  doing: { label: "En cours", short: "En cours" },
  done: { label: "Validé", short: "Validé" },
};

function buildDefault() {
  const fields = {};
  SECTIONS.forEach((s) => {
    fields[s.key] = {};
    s.fields.forEach((f) => (fields[s.key][f.key] = ""));
  });
  const status = {};
  SECTIONS.forEach((s) => (status[s.key] = "todo"));
  return {
    fields,
    status,
    captable: [{ holder: "", share: "" }],
    crm: [{ name: "", type: "", status: "À contacter", next: "" }],
    journal: [],
  };
}

const hasStorage =
  typeof window !== "undefined" &&
  window.storage &&
  typeof window.storage.get === "function";

/* ---------- Crown signature ---------- */
function Crown({ statusMap, onPick, activeKey }) {
  const n = SECTIONS.length; // 7
  const W = 260;
  const baseY = 58;
  const cxOf = (i) => 24 + i * ((W - 48) / (n - 1));
  const toothTop = (i) => baseY - (24 + 12 * Math.sin((Math.PI * i) / (n - 1)));
  const fillFor = (st) =>
    st === "done" ? "var(--gold)" : st === "doing" ? "transparent" : "var(--band-faint)";
  const strokeFor = (st) =>
    st === "done" ? "var(--gold-deep)" : st === "doing" ? "var(--gold)" : "var(--band-line)";

  return (
    <svg viewBox={`0 0 ${W} 84`} className="crown" role="img" aria-label="Couronne d’avancement">
      {/* band */}
      <path
        d={`M14 ${baseY} L${W - 14} ${baseY} L${W - 20} 78 L20 78 Z`}
        fill="var(--plum)"
        stroke="var(--plum-deep)"
        strokeWidth="1.5"
      />
      {/* teeth */}
      {SECTIONS.map((s, i) => {
        const cx = cxOf(i);
        const st = statusMap[s.key];
        const isActive = s.key === activeKey;
        return (
          <g key={s.key} className="tooth" onClick={() => onPick(s.key)} style={{ cursor: "pointer" }}>
            <polygon
              points={`${cx - 15},${baseY} ${cx + 15},${baseY} ${cx},${toothTop(i)}`}
              fill={fillFor(st)}
              stroke={strokeFor(st)}
              strokeWidth={isActive ? 2.4 : 1.5}
            />
            <circle cx={cx} cy={toothTop(i) + 5} r="3.1" fill={st === "done" ? "var(--gold-deep)" : "var(--band-line)"} />
            <title>{`${s.label} — ${STATUS[st === "done" ? "done" : st === "doing" ? "doing" : "todo"].label}`}</title>
          </g>
        );
      })}
      {/* jewels on band */}
      {[0.5, 0.5].map((_, k) => (
        <circle key={k} cx={W / 2} cy={68} r="3.4" fill="var(--gold)" opacity="0.9" />
      ))}
    </svg>
  );
}

export default function App() {
  const [state, setState] = useState(null);
  const [active, setActive] = useState("canvas"); // section key or "journal"
  const [saved, setSaved] = useState(true);
  const [copied, setCopied] = useState(false);
  const saveTimer = useRef(null);
  const loaded = useRef(false);

  // load
  useEffect(() => {
    let alive = true;
    (async () => {
      if (hasStorage) {
        try {
          const res = await window.storage.get(KEY);
          if (res && res.value && alive) {
            setState({ ...buildDefault(), ...JSON.parse(res.value) });
            loaded.current = true;
            return;
          }
        } catch (e) {
          /* première ouverture : pas encore de données */
        }
      }
      if (alive) {
        setState(buildDefault());
        loaded.current = true;
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // debounced save
  useEffect(() => {
    if (!state || !loaded.current) return;
    setSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (hasStorage) {
        try {
          await window.storage.set(KEY, JSON.stringify(state));
          setSaved(true);
        } catch (e) {
          setSaved(false);
        }
      } else {
        setSaved(true);
      }
    }, 600);
    return () => saveTimer.current && clearTimeout(saveTimer.current);
  }, [state]);

  if (!state) {
    return (
      <div className="com-root loading">
        <StyleTag />
        <div className="spinner" />
        <p>Chargement de ton cockpit…</p>
      </div>
    );
  }

  const doneCount = SECTIONS.filter((s) => state.status[s.key] === "done").length;

  const setField = (sec, fk, val) =>
    setState((p) => ({ ...p, fields: { ...p.fields, [sec]: { ...p.fields[sec], [fk]: val } } }));
  const setStatus = (sec, val) => setState((p) => ({ ...p, status: { ...p.status, [sec]: val } }));

  const addJournal = (entry) =>
    setState((p) => ({ ...p, journal: [{ id: Date.now(), ts: Date.now(), ...entry }, ...p.journal] }));
  const delJournal = (id) =>
    setState((p) => ({ ...p, journal: p.journal.filter((e) => e.id !== id) }));

  const setCap = (rows) => setState((p) => ({ ...p, captable: rows }));
  const setCrm = (rows) => setState((p) => ({ ...p, crm: rows }));

  const copyMarkdown = async () => {
    const md = buildMarkdown(state, doneCount);
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      setCopied(false);
    }
  };

  return (
    <div className="com-root">
      <StyleTag />

      <header className="topbar">
        <div className="brandline">
          <div className="crownWrap">
            <Crown statusMap={state.status} onPick={setActive} activeKey={active} />
          </div>
          <div className="brandtext">
            <span className="eyebrow">Cockpit fondatrice</span>
            <h1 className="wordmark">Crown&nbsp;On&nbsp;Me</h1>
            <p className="tagline">
              {doneCount} / {SECTIONS.length} couronné · {saved ? "Enregistré" : "…"}
            </p>
          </div>
          <button className="mdbtn" onClick={copyMarkdown} title="Copier un résumé Markdown">
            {copied ? "Copié ✓" : "Exporter"}
          </button>
        </div>

        <nav className="tabbar" aria-label="Sections">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              className={"tab " + (active === s.key ? "on " : "") + "st-" + state.status[s.key]}
              onClick={() => setActive(s.key)}
            >
              <span className="tabtag">{s.tag}</span>
              <span className="tablabel">{s.label}</span>
              <span className="dot" />
            </button>
          ))}
          <button
            className={"tab journaltab " + (active === "journal" ? "on" : "")}
            onClick={() => setActive("journal")}
          >
            <span className="tabtag">✦</span>
            <span className="tablabel">Journal</span>
          </button>
        </nav>
      </header>

      <main className="stage">
        {active === "journal" ? (
          <JournalView state={state} addJournal={addJournal} delJournal={delJournal} />
        ) : (
          <SectionView
            section={SECTIONS.find((s) => s.key === active)}
            state={state}
            setField={setField}
            setStatus={setStatus}
            setCap={setCap}
            setCrm={setCrm}
            addJournal={addJournal}
            delJournal={delJournal}
          />
        )}
      </main>

      <footer className="foot">
        {hasStorage
          ? "Tes données sont enregistrées automatiquement sur cet appareil."
          : "Sauvegarde indisponible ici : tes saisies ne persisteront pas hors de cette session."}
      </footer>
    </div>
  );
}

/* ---------------- Section view ---------------- */
function SectionView({ section, state, setField, setStatus, setCap, setCrm, addJournal, delJournal }) {
  const vals = state.fields[section.key];
  const st = state.status[section.key];
  const entries = state.journal.filter((e) => e.section === section.key);

  return (
    <div className="section">
      <div className="sechead">
        <div>
          <span className="sectag">{section.tag}</span>
          <h2>{section.label}</h2>
          <p className="secsub">{section.sub}</p>
        </div>
        <div className="statusseg" role="group" aria-label="Avancement">
          {["todo", "doing", "done"].map((k) => (
            <button
              key={k}
              className={"segbtn seg-" + k + (st === k ? " on" : "")}
              onClick={() => setStatus(section.key, k)}
            >
              {STATUS[k].short}
            </button>
          ))}
        </div>
      </div>

      <div className="fieldgrid">
        {section.fields.map((f) => (
          <div className={"field" + (f.short ? " short" : "")} key={f.key}>
            <label htmlFor={section.key + "-" + f.key}>{f.label}</label>
            {f.short ? (
              <input
                id={section.key + "-" + f.key}
                value={vals[f.key]}
                placeholder={f.hint}
                onChange={(e) => setField(section.key, f.key, e.target.value)}
              />
            ) : (
              <textarea
                id={section.key + "-" + f.key}
                value={vals[f.key]}
                placeholder={f.hint}
                onChange={(e) => setField(section.key, f.key, e.target.value)}
                rows={3}
              />
            )}
          </div>
        ))}
      </div>

      {section.hasCapTable && <CapTable rows={state.captable} setRows={setCap} />}
      {section.hasCrm && <CrmTable rows={state.crm} setRows={setCrm} />}

      <MiniJournal
        sectionKey={section.key}
        entries={entries}
        addJournal={addJournal}
        delJournal={delJournal}
      />
    </div>
  );
}

/* ---------------- Cap table ---------------- */
function CapTable({ rows, setRows }) {
  const total = rows.reduce((a, r) => a + (parseFloat(r.share) || 0), 0);
  const update = (i, k, v) => setRows(rows.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  const add = () => setRows([...rows, { holder: "", share: "" }]);
  const del = (i) => setRows(rows.filter((_, idx) => idx !== i));
  return (
    <div className="block">
      <div className="blockhead">
        <h3>Cap table</h3>
        <span className={"total " + (total > 100 ? "over" : "")}>{total || 0}% réparti</span>
      </div>
      <div className="rows">
        {rows.map((r, i) => (
          <div className="row cap" key={i}>
            <input
              className="grow"
              placeholder="Détenteur·rice (ex. Aminata, pool ESOP…)"
              value={r.holder}
              onChange={(e) => update(i, "holder", e.target.value)}
            />
            <input
              className="pct"
              placeholder="%"
              inputMode="decimal"
              value={r.share}
              onChange={(e) => update(i, "share", e.target.value)}
            />
            <button className="del" onClick={() => del(i)} aria-label="Supprimer la ligne">
              ×
            </button>
          </div>
        ))}
      </div>
      <button className="addrow" onClick={add}>
        + Ajouter une ligne
      </button>
    </div>
  );
}

/* ---------------- Investor CRM ---------------- */
const CRM_STATUS = ["À contacter", "En discussion", "Relance", "Positif", "Négatif"];
function CrmTable({ rows, setRows }) {
  const update = (i, k, v) => setRows(rows.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  const add = () => setRows([...rows, { name: "", type: "", status: "À contacter", next: "" }]);
  const del = (i) => setRows(rows.filter((_, idx) => idx !== i));
  return (
    <div className="block">
      <div className="blockhead">
        <h3>Pipeline investisseurs & programmes</h3>
      </div>
      <div className="rows">
        {rows.map((r, i) => (
          <div className="row crm" key={i}>
            <input
              className="grow"
              placeholder="Nom (contact, fonds, programme…)"
              value={r.name}
              onChange={(e) => update(i, "name", e.target.value)}
            />
            <input
              className="type"
              placeholder="Type"
              value={r.type}
              onChange={(e) => update(i, "type", e.target.value)}
            />
            <select
              className={"crmstatus s-" + r.status.replace(/\s/g, "")}
              value={r.status}
              onChange={(e) => update(i, "status", e.target.value)}
            >
              {CRM_STATUS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              className="grow next"
              placeholder="Prochaine action"
              value={r.next}
              onChange={(e) => update(i, "next", e.target.value)}
            />
            <button className="del" onClick={() => del(i)} aria-label="Supprimer la ligne">
              ×
            </button>
          </div>
        ))}
      </div>
      <button className="addrow" onClick={add}>
        + Ajouter un contact
      </button>
    </div>
  );
}

/* ---------------- Mini journal (per section) ---------------- */
function MiniJournal({ sectionKey, entries, addJournal, delJournal }) {
  const [text, setText] = useState("");
  const [kind, setKind] = useState("note");
  const submit = () => {
    if (!text.trim()) return;
    addJournal({ section: sectionKey, kind, text: text.trim() });
    setText("");
  };
  return (
    <div className="block minijournal">
      <div className="blockhead">
        <h3>Journal de cette section</h3>
      </div>
      <div className="entryinput">
        <div className="kindtoggle">
          <button className={kind === "note" ? "on" : ""} onClick={() => setKind("note")}>
            Note
          </button>
          <button className={kind === "jalon" ? "on jalon" : "jalon"} onClick={() => setKind("jalon")}>
            Jalon
          </button>
        </div>
        <textarea
          rows={2}
          placeholder={kind === "jalon" ? "Un cap franchi ? Note-le comme jalon." : "Où en es-tu ? Une pensée, un blocage, une avancée…"}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="addbtn" onClick={submit}>
          Ajouter
        </button>
      </div>
      <EntryList entries={entries} delJournal={delJournal} showSection={false} />
    </div>
  );
}

/* ---------------- Global journal view ---------------- */
function JournalView({ state, addJournal, delJournal }) {
  const [text, setText] = useState("");
  const [kind, setKind] = useState("note");
  const [sec, setSec] = useState("general");
  const [filter, setFilter] = useState("all");
  const submit = () => {
    if (!text.trim()) return;
    addJournal({ section: sec, kind, text: text.trim() });
    setText("");
  };
  const entries =
    filter === "all" ? state.journal : state.journal.filter((e) => e.section === filter);

  return (
    <div className="section journalview">
      <div className="sechead">
        <div>
          <span className="sectag">✦</span>
          <h2>Journal de bord</h2>
          <p className="secsub">Toutes tes avancées, en une timeline</p>
        </div>
      </div>

      <div className="block">
        <div className="entryinput big">
          <div className="inputrow">
            <div className="kindtoggle">
              <button className={kind === "note" ? "on" : ""} onClick={() => setKind("note")}>
                Note
              </button>
              <button className={kind === "jalon" ? "on jalon" : "jalon"} onClick={() => setKind("jalon")}>
                Jalon
              </button>
            </div>
            <select value={sec} onChange={(e) => setSec(e.target.value)} className="secselect">
              <option value="general">Général</option>
              {SECTIONS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <textarea
            rows={3}
            placeholder="Qu’est-ce qui a bougé aujourd’hui ?"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="addbtn" onClick={submit}>
            Ajouter au journal
          </button>
        </div>
      </div>

      <div className="filterbar">
        <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>
          Tout
        </button>
        <button className={filter === "general" ? "on" : ""} onClick={() => setFilter("general")}>
          Général
        </button>
        {SECTIONS.map((s) => (
          <button key={s.key} className={filter === s.key ? "on" : ""} onClick={() => setFilter(s.key)}>
            {s.label}
          </button>
        ))}
      </div>

      <EntryList entries={entries} delJournal={delJournal} showSection={true} />
    </div>
  );
}

function EntryList({ entries, delJournal, showSection }) {
  if (!entries.length) {
    return <p className="empty">Rien encore ici. La première entrée est toujours la plus dure — puis ça coule.</p>;
  }
  const secLabel = (k) =>
    k === "general" ? "Général" : (SECTIONS.find((s) => s.key === k) || {}).label || k;
  return (
    <ul className="entries">
      {entries.map((e) => (
        <li className={"entry " + (e.kind === "jalon" ? "isjalon" : "")} key={e.id}>
          <div className="entrymeta">
            <time>{formatDate(e.ts)}</time>
            {e.kind === "jalon" && <span className="jalonbadge">Jalon</span>}
            {showSection && <span className="secbadge">{secLabel(e.section)}</span>}
          </div>
          <p className="entrytext">{e.text}</p>
          <button className="del entrydel" onClick={() => delJournal(e.id)} aria-label="Supprimer l’entrée">
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ---------------- helpers ---------------- */
function formatDate(ts) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(ts));
  } catch (e) {
    return new Date(ts).toLocaleString();
  }
}

function buildMarkdown(state, doneCount) {
  let md = `# Crown On Me — Cockpit\n\n_Avancement : ${doneCount}/${SECTIONS.length} sections validées_\n\n`;
  SECTIONS.forEach((s) => {
    md += `## ${s.label} — ${STATUS[state.status[s.key]].label}\n\n`;
    s.fields.forEach((f) => {
      const v = state.fields[s.key][f.key];
      if (v && v.trim()) md += `**${f.label}**\n${v.trim()}\n\n`;
    });
    if (s.hasCapTable) {
      const rows = state.captable.filter((r) => r.holder || r.share);
      if (rows.length) {
        md += `**Cap table**\n`;
        rows.forEach((r) => (md += `- ${r.holder || "?"} : ${r.share || "?"}%\n`));
        md += `\n`;
      }
    }
    if (s.hasCrm) {
      const rows = state.crm.filter((r) => r.name);
      if (rows.length) {
        md += `**Pipeline**\n`;
        rows.forEach((r) => (md += `- ${r.name} (${r.type || "—"}) · ${r.status} · ${r.next || "—"}\n`));
        md += `\n`;
      }
    }
  });
  if (state.journal.length) {
    md += `## Journal\n\n`;
    state.journal.forEach((e) => {
      const secL = e.section === "general" ? "Général" : (SECTIONS.find((s) => s.key === e.section) || {}).label || e.section;
      md += `- [${formatDate(e.ts)}]${e.kind === "jalon" ? " **JALON**" : ""} (${secL}) ${e.text}\n`;
    });
  }
  return md;
}

/* ---------------- styles ---------------- */
function StyleTag() {
  return (
    <style>{`
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Instrument+Sans:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');

.com-root{
  --ink:#2a1220;
  --ink-soft:#5c4351;
  --plum:#6c2b4d;
  --plum-deep:#47182f;
  --gold:#c79a3b;
  --gold-deep:#9a742a;
  --gold-soft:#e7cd86;
  --sand:#f6eee1;
  --sand-2:#efe2ce;
  --card:#fffaf1;
  --line:#e3d3bb;
  --rose:#d8a79a;
  --band-faint:#efe0c6;
  --band-line:#d9c39c;
  --emerald:#3e7a5e;
  --stone:#a99b8c;
  --danger:#b5493f;
  font-family:'Instrument Sans',system-ui,sans-serif;
  color:var(--ink);
  background:
    radial-gradient(1200px 500px at 50% -220px, rgba(108,43,77,.14), transparent 60%),
    var(--sand);
  min-height:100vh;
  line-height:1.5;
  -webkit-font-smoothing:antialiased;
}
.com-root *{box-sizing:border-box;}
.com-root.loading{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:var(--ink-soft);}
.com-root .spinner{width:26px;height:26px;border-radius:50%;border:3px solid var(--line);border-top-color:var(--plum);animation:spin .8s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}

.topbar{max-width:920px;margin:0 auto;padding:26px 20px 0;}
.brandline{display:flex;align-items:center;gap:18px;}
.crownWrap{width:150px;flex:none;}
.crown{width:100%;height:auto;display:block;}
.crown .tooth polygon{transition:fill .35s ease, stroke .2s ease;}
.brandtext{flex:1;min-width:0;}
.eyebrow{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--plum);}
.wordmark{font-family:'Fraunces',serif;font-weight:600;font-size:clamp(26px,6vw,40px);line-height:1;margin:2px 0 4px;letter-spacing:-.01em;color:var(--ink);}
.tagline{font-family:'Space Mono',monospace;font-size:12px;color:var(--ink-soft);margin:0;}
.mdbtn{flex:none;align-self:flex-start;font-family:'Space Mono',monospace;font-size:12px;letter-spacing:.04em;background:transparent;color:var(--plum);border:1px solid var(--line);border-radius:999px;padding:8px 14px;cursor:pointer;transition:.2s;}
.mdbtn:hover{background:var(--plum);color:#fff;border-color:var(--plum);}

.tabbar{display:flex;gap:6px;overflow-x:auto;padding:22px 0 0;scrollbar-width:thin;-webkit-overflow-scrolling:touch;}
.tabbar::-webkit-scrollbar{height:5px;}
.tabbar::-webkit-scrollbar-thumb{background:var(--line);border-radius:3px;}
.tab{flex:none;display:flex;align-items:center;gap:8px;background:transparent;border:none;border-bottom:2px solid transparent;padding:10px 8px 12px;cursor:pointer;color:var(--ink-soft);font-family:'Instrument Sans',sans-serif;font-size:14px;font-weight:500;white-space:nowrap;transition:.2s;}
.tab:hover{color:var(--ink);}
.tab.on{color:var(--ink);border-bottom-color:var(--plum);}
.tabtag{font-family:'Space Mono',monospace;font-size:11px;color:var(--gold-deep);}
.tab .dot{width:7px;height:7px;border-radius:50%;background:var(--stone);flex:none;}
.tab.st-doing .dot{background:var(--gold);}
.tab.st-done .dot{background:var(--emerald);}
.journaltab{border-left:1px solid var(--line);margin-left:4px;padding-left:14px;}
.journaltab .tabtag{color:var(--plum);}

.stage{max-width:920px;margin:0 auto;padding:22px 20px 8px;}

.section{animation:rise .3s ease;}
@keyframes rise{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
.sechead{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:20px;}
.sectag{font-family:'Space Mono',monospace;font-size:12px;color:var(--gold-deep);letter-spacing:.1em;}
.sechead h2{font-family:'Fraunces',serif;font-weight:600;font-size:clamp(22px,4.5vw,30px);margin:2px 0 3px;color:var(--ink);}
.secsub{margin:0;color:var(--ink-soft);font-size:14px;}

.statusseg{display:flex;background:var(--sand-2);border-radius:999px;padding:3px;border:1px solid var(--line);}
.segbtn{border:none;background:transparent;padding:7px 14px;border-radius:999px;font-family:'Instrument Sans',sans-serif;font-size:13px;font-weight:500;color:var(--ink-soft);cursor:pointer;transition:.18s;}
.segbtn.on.seg-todo{background:#fff;color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.08);}
.segbtn.on.seg-doing{background:var(--gold);color:#2a1a05;}
.segbtn.on.seg-done{background:var(--emerald);color:#fff;}

.fieldgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.field{display:flex;flex-direction:column;gap:6px;}
.field.short{max-width:280px;}
.field label{font-size:13px;font-weight:600;color:var(--ink);letter-spacing:.01em;}
.field textarea,.field input,.row input,.row select,.entryinput textarea,.secselect{
  font-family:'Instrument Sans',sans-serif;font-size:14px;color:var(--ink);
  background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 12px;
  width:100%;resize:vertical;transition:border-color .15s, box-shadow .15s;
}
.field textarea::placeholder,.field input::placeholder,.row input::placeholder,.entryinput textarea::placeholder{color:#b7a691;}
.field textarea:focus,.field input:focus,.row input:focus,.row select:focus,.entryinput textarea:focus,.secselect:focus{
  outline:none;border-color:var(--plum);box-shadow:0 0 0 3px rgba(108,43,77,.14);
}

.block{margin-top:26px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 16px 18px;}
.blockhead{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}
.blockhead h3{font-family:'Fraunces',serif;font-weight:600;font-size:17px;margin:0;color:var(--ink);}
.total{font-family:'Space Mono',monospace;font-size:12px;color:var(--emerald);}
.total.over{color:var(--danger);}

.rows{display:flex;flex-direction:column;gap:8px;}
.row{display:flex;gap:8px;align-items:center;}
.row .grow{flex:1;min-width:0;}
.row .pct{width:74px;flex:none;text-align:center;}
.row .type{width:120px;flex:none;}
.crmstatus{width:130px;flex:none;cursor:pointer;}
.row .next{flex:1;}
.del{flex:none;width:30px;height:30px;border-radius:8px;border:1px solid var(--line);background:transparent;color:var(--ink-soft);font-size:18px;line-height:1;cursor:pointer;transition:.15s;}
.del:hover{background:var(--danger);color:#fff;border-color:var(--danger);}
.addrow{margin-top:10px;background:transparent;border:1px dashed var(--line);color:var(--plum);border-radius:9px;padding:8px 12px;font-family:'Instrument Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:.15s;}
.addrow:hover{border-color:var(--plum);background:var(--sand-2);}

.minijournal .entryinput,.entryinput.big{display:flex;flex-direction:column;gap:10px;}
.inputrow{display:flex;gap:10px;flex-wrap:wrap;align-items:center;}
.kindtoggle{display:inline-flex;border:1px solid var(--line);border-radius:999px;overflow:hidden;flex:none;}
.kindtoggle button{border:none;background:transparent;padding:7px 14px;font-family:'Instrument Sans',sans-serif;font-size:13px;color:var(--ink-soft);cursor:pointer;transition:.15s;}
.kindtoggle button.on{background:var(--plum);color:#fff;}
.kindtoggle button.jalon.on{background:var(--gold);color:#2a1a05;}
.secselect{width:auto;min-width:150px;flex:none;cursor:pointer;}
.addbtn{align-self:flex-start;background:var(--ink);color:#fff;border:none;border-radius:9px;padding:9px 18px;font-family:'Instrument Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;transition:.15s;}
.addbtn:hover{background:var(--plum);}

.filterbar{display:flex;gap:6px;overflow-x:auto;margin:18px 0 14px;padding-bottom:4px;}
.filterbar button{flex:none;background:transparent;border:1px solid var(--line);border-radius:999px;padding:6px 13px;font-family:'Instrument Sans',sans-serif;font-size:13px;color:var(--ink-soft);cursor:pointer;white-space:nowrap;transition:.15s;}
.filterbar button.on{background:var(--ink);color:#fff;border-color:var(--ink);}

.entries{list-style:none;margin:12px 0 0;padding:0;display:flex;flex-direction:column;gap:10px;}
.entry{position:relative;background:var(--card);border:1px solid var(--line);border-left:3px solid var(--stone);border-radius:0 12px 12px 0;padding:12px 40px 12px 14px;}
.entry.isjalon{border-left-color:var(--gold);background:linear-gradient(180deg,#fffaf0,#fff6e6);}
.entrymeta{display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;}
.entrymeta time{font-family:'Space Mono',monospace;font-size:11px;color:var(--ink-soft);}
.jalonbadge{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;background:var(--gold);color:#2a1a05;padding:2px 7px;border-radius:999px;}
.secbadge{font-size:11px;color:var(--plum);background:var(--sand-2);padding:2px 8px;border-radius:999px;}
.entrytext{margin:0;font-size:14px;color:var(--ink);white-space:pre-wrap;}
.entrydel{position:absolute;top:10px;right:10px;width:26px;height:26px;font-size:16px;}
.empty{color:var(--ink-soft);font-style:italic;font-size:14px;padding:8px 0;}

.foot{max-width:920px;margin:10px auto 0;padding:14px 20px 30px;font-family:'Space Mono',monospace;font-size:11px;color:var(--ink-soft);}

@media (max-width:640px){
  .crownWrap{width:112px;}
  .brandline{gap:12px;}
  .fieldgrid{grid-template-columns:1fr;}
  .row.crm{flex-wrap:wrap;}
  .row.crm .type,.crmstatus{width:calc(50% - 4px);}
  .row.crm .next{flex-basis:100%;}
}
@media (prefers-reduced-motion:reduce){
  .section{animation:none;}
  .crown .tooth polygon{transition:none;}
  .com-root .spinner{animation:none;}
}
`}</style>
  );
}
