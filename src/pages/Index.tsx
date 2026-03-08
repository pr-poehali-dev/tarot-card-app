import { useState } from "react";
import Icon from "@/components/ui/icon";
import { MAJOR_ARCANA, SPREADS, MEDITATIONS, TarotCard } from "@/data/tarot";

type Tab = "divination" | "catalog" | "history" | "profile";

interface HistoryEntry {
  id: string;
  date: string;
  spread: string;
  cards: TarotCard[];
  question?: string;
}

const CARD_BACK = "https://cdn.poehali.dev/projects/7e0ec43f-97fd-4ffc-ad58-8ff0c6dd0b13/files/144b0e70-7583-49d3-abb0-883d63157acf.jpg";

function StarField() {
  const stars = Array.from({ length: 55 }, (_, i) => ({
    id: i,
    size: Math.random() > 0.8 ? 2 : 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    opacity: 0.2 + Math.random() * 0.6,
    duration: 2 + Math.random() * 4,
    delay: Math.random() * 3
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full"
          style={{
            width: s.size,
            height: s.size,
            backgroundColor: `hsl(43 74% 75%)`,
            left: `${s.left}%`,
            top: `${s.top}%`,
            opacity: s.opacity,
            animation: `shimmer ${s.duration}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`
          }}
        />
      ))}
    </div>
  );
}

function OrnamentDivider({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, hsl(43 74% 66% / 0.3))" }} />
      <span className="text-xs font-sc tracking-widest text-gold opacity-60">{text || "✦ ✦ ✦"}</span>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, hsl(43 74% 66% / 0.3))" }} />
    </div>
  );
}

function TarotCardComponent({ card, revealed, reversed, onClick, small }: {
  card: TarotCard;
  revealed: boolean;
  reversed?: boolean;
  onClick?: () => void;
  small?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`tarot-card cursor-pointer rounded-xl overflow-hidden border relative ${small ? "w-20 h-32" : "w-36 h-56"}`}
      style={{
        background: revealed ? "linear-gradient(135deg, hsl(270 40% 10%), hsl(240 30% 8%))" : undefined,
        transform: revealed && reversed ? "rotate(180deg)" : undefined,
        borderColor: "hsl(43 74% 66% / 0.35)",
        boxShadow: revealed ? "0 8px 32px hsl(270 50% 20% / 0.5)" : "0 4px 16px hsl(0 0% 0% / 0.5)"
      }}
    >
      {revealed ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
          <div className={`${small ? "text-2xl" : "text-4xl"} mb-2`}>{card.symbol}</div>
          <div className={`font-sc text-gold ${small ? "text-xs" : "text-sm"} leading-tight`}>{card.nameRu}</div>
          {!small && <div className="text-xs text-muted-foreground mt-1 font-sc tracking-wider">{card.name}</div>}
          {!small && reversed && (
            <div className="absolute top-2 right-2">
              <span className="text-xs bg-red-900/50 text-red-300 px-1 rounded font-sc">↕</span>
            </div>
          )}
        </div>
      ) : (
        <img src={CARD_BACK} alt="Карта таро" className="w-full h-full object-cover opacity-80" />
      )}
    </div>
  );
}

function DivinationPage({ onSaveHistory }: { onSaveHistory: (entry: HistoryEntry) => void }) {
  const [selectedSpread, setSelectedSpread] = useState<typeof SPREADS[0] | null>(null);
  const [question, setQuestion] = useState("");
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [reversed, setReversed] = useState<boolean[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [selectedCard, setSelectedCard] = useState<{ card: TarotCard; rev: boolean } | null>(null);
  const [phase, setPhase] = useState<"select" | "ask" | "deal">("select");
  const [activeTab, setActiveTab] = useState<"meaning" | "meditation" | "exercise">("meaning");
  const [saving, setSaving] = useState(false);

  const startReading = () => {
    if (!selectedSpread) return;
    const shuffled = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, selectedSpread.cards);
    const revs = picked.map(() => Math.random() > 0.75);
    setCards(picked);
    setReversed(revs);
    setRevealed(new Array(selectedSpread.cards).fill(false));
    setPhase("deal");
    setSelectedCard(null);
  };

  const revealCard = (index: number) => {
    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);
    setSelectedCard({ card: cards[index], rev: reversed[index] });
    setActiveTab("meaning");
  };

  const saveAndReset = () => {
    setSaving(true);
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }),
      spread: selectedSpread!.name,
      cards,
      question
    };
    onSaveHistory(entry);
    setTimeout(() => {
      setSaving(false);
      setPhase("select");
      setSelectedSpread(null);
      setQuestion("");
      setCards([]);
      setRevealed([]);
      setSelectedCard(null);
    }, 800);
  };

  if (phase === "select") {
    return (
      <div className="px-4 py-6 animate-fade-up">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3 animate-float">🔮</div>
          <h1 className="font-display text-4xl text-gold text-glow mb-2">Гадание</h1>
          <p className="text-muted-foreground font-body text-sm">Выберите расклад для своего вопроса</p>
        </div>
        <OrnamentDivider />
        <div className="grid gap-3 mt-6">
          {SPREADS.map(spread => (
            <button
              key={spread.id}
              onClick={() => { setSelectedSpread(spread); setPhase("ask"); }}
              className="flex items-center gap-4 p-4 rounded-xl border text-left transition-all"
              style={{ background: "hsl(270 30% 8% / 0.8)", borderColor: "hsl(43 74% 66% / 0.2)" }}
            >
              <span className="text-3xl">{spread.icon}</span>
              <div className="flex-1">
                <div className="font-sc text-gold text-sm tracking-wide">{spread.name}</div>
                <div className="text-muted-foreground text-xs mt-0.5">
                  {spread.description} · {spread.cards} {spread.cards === 1 ? "карта" : "карты"}
                </div>
              </div>
              <Icon name="ChevronRight" size={16} className="text-gold opacity-50" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "ask") {
    return (
      <div className="px-4 py-6 animate-fade-up">
        <button onClick={() => setPhase("select")} className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
          <Icon name="ChevronLeft" size={16} /> Назад
        </button>
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">{selectedSpread?.icon}</div>
          <h2 className="font-display text-3xl text-gold">{selectedSpread?.name}</h2>
        </div>
        <OrnamentDivider text="✦ Ваш вопрос ✦" />
        <div className="mt-6 mb-8">
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Задайте вопрос картам или оставьте пустым для общего расклада..."
            className="w-full h-28 rounded-xl p-4 text-sm font-body resize-none outline-none transition-colors"
            style={{
              background: "hsl(270 30% 8% / 0.8)",
              border: "1px solid hsl(43 74% 66% / 0.2)",
              color: "hsl(45 30% 88%)"
            }}
          />
        </div>
        <div className="text-center text-muted-foreground text-xs mb-6 font-sc tracking-widest">
          СОСРЕДОТОЧЬТЕСЬ НА ВОПРОСЕ
        </div>
        <button
          onClick={startReading}
          className="w-full py-4 rounded-xl font-sc tracking-widest text-sm transition-all animate-pulse-gold"
          style={{ background: "linear-gradient(135deg, hsl(43 60% 30%), hsl(43 74% 45%))", color: "hsl(240 20% 5%)" }}
        >
          ОТКРЫТЬ РАСКЛАД
        </button>
      </div>
    );
  }

  if (phase === "deal") {
    const allRevealed = revealed.every(r => r);
    return (
      <div className="px-4 py-6 animate-fade-up">
        <div className="text-center mb-6">
          <h2 className="font-display text-3xl text-gold">{selectedSpread?.name}</h2>
          {question && <p className="text-muted-foreground text-sm mt-1 italic font-display">«{question}»</p>}
          <p className="text-muted-foreground text-xs mt-2">
            {revealed.filter(Boolean).length === 0 ? "Нажмите на карту, чтобы открыть её" : "Открывайте карты по одной"}
          </p>
        </div>
        <OrnamentDivider />
        <div className="flex flex-wrap gap-4 justify-center my-6">
          {cards.map((card, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <TarotCardComponent
                card={card}
                revealed={revealed[i]}
                reversed={reversed[i]}
                onClick={() => !revealed[i] ? revealCard(i) : setSelectedCard({ card, rev: reversed[i] })}
              />
              <span className="text-xs text-muted-foreground font-sc tracking-wide">
                {selectedSpread?.positions[i]}
              </span>
            </div>
          ))}
        </div>

        {selectedCard && (
          <div className="mt-2 rounded-xl p-5 border animate-fade-up"
            style={{ background: "hsl(270 30% 7% / 0.9)", borderColor: "hsl(43 74% 66% / 0.25)" }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{selectedCard.card.symbol}</span>
              <div>
                <div className="font-sc text-gold text-lg">{selectedCard.card.nameRu}</div>
                <div className="flex gap-2 flex-wrap mt-1">
                  {selectedCard.card.keywords.map(k => (
                    <span key={k} className="text-xs px-2 py-0.5 rounded-full font-sc"
                      style={{ background: "hsl(270 40% 18%)", color: "hsl(43 74% 66%)" }}>{k}</span>
                  ))}
                  {selectedCard.rev && (
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "hsl(0 30% 20%)", color: "hsl(0 60% 70%)" }}>перевёрнутая</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-1 mb-4">
              {(["meaning", "meditation", "exercise"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-sc tracking-wide transition-all"
                  style={{
                    background: activeTab === tab ? "hsl(43 74% 66%)" : "hsl(270 30% 12%)",
                    color: activeTab === tab ? "hsl(240 20% 5%)" : "hsl(45 15% 55%)"
                  }}>
                  {tab === "meaning" ? "Значение" : tab === "meditation" ? "Медитация" : "Упражнение"}
                </button>
              ))}
            </div>

            <p className="text-sm font-body leading-relaxed" style={{ color: "hsl(45 20% 75%)" }}>
              {activeTab === "meaning" && (selectedCard.rev ? selectedCard.card.reversed : selectedCard.card.meaning)}
              {activeTab === "meditation" && selectedCard.card.meditation}
              {activeTab === "exercise" && selectedCard.card.exercise}
            </p>
          </div>
        )}

        {allRevealed && (
          <div className="mt-6 flex gap-3">
            <button onClick={saveAndReset} disabled={saving}
              className="flex-1 py-3 rounded-xl font-sc tracking-wide text-sm transition-all"
              style={{ background: "linear-gradient(135deg, hsl(43 60% 25%), hsl(43 74% 40%))", color: "hsl(240 20% 5%)" }}>
              {saving ? "Сохраняется..." : "Сохранить в историю"}
            </button>
            <button onClick={() => setPhase("select")}
              className="px-4 py-3 rounded-xl text-sm border transition-all"
              style={{ borderColor: "hsl(43 74% 66% / 0.3)", color: "hsl(43 74% 66%)" }}>
              Новый
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}

function CatalogPage() {
  const [selected, setSelected] = useState<TarotCard | null>(null);
  const [activeTab, setActiveTab] = useState<"meaning" | "meditation" | "exercise">("meaning");

  return (
    <div className="px-4 py-6 animate-fade-up">
      <div className="text-center mb-6">
        <h1 className="font-display text-4xl text-gold text-glow">Каталог карт</h1>
        <p className="text-muted-foreground text-sm mt-1">22 Старших Аркана</p>
      </div>
      <OrnamentDivider />

      {!selected ? (
        <div className="grid grid-cols-3 gap-3 mt-4">
          {MAJOR_ARCANA.map(card => (
            <button key={card.id} onClick={() => { setSelected(card); setActiveTab("meaning"); }}
              className="rounded-xl border p-3 text-center transition-all"
              style={{ background: "hsl(270 30% 8% / 0.8)", borderColor: "hsl(43 74% 66% / 0.15)" }}>
              <div className="text-3xl mb-1">{card.symbol}</div>
              <div className="text-xs font-sc text-gold leading-tight">{card.nameRu}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{card.id === 0 ? "0" : card.id}</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="animate-fade-up">
          <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
            <Icon name="ChevronLeft" size={16} /> Все карты
          </button>
          <div className="flex gap-6 items-center mb-6">
            <div className="rounded-xl border w-28 h-44 flex flex-col items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(270 40% 10%), hsl(240 30% 8%))", borderColor: "hsl(43 74% 66% / 0.35)" }}>
              <span className="text-5xl">{selected.symbol}</span>
              <span className="font-sc text-gold text-sm mt-2">{selected.nameRu}</span>
            </div>
            <div className="flex-1">
              <div className="font-display text-2xl text-gold">{selected.nameRu}</div>
              <div className="text-muted-foreground text-sm">{selected.name}</div>
              <div className="text-muted-foreground text-xs mt-1 font-sc">Аркан {selected.id}</div>
              <div className="flex gap-2 flex-wrap mt-3">
                {selected.keywords.map(k => (
                  <span key={k} className="text-xs px-2 py-0.5 rounded-full font-sc"
                    style={{ background: "hsl(270 40% 18%)", color: "hsl(43 74% 66%)" }}>{k}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-1 mb-4">
            {(["meaning", "meditation", "exercise"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="flex-1 py-2 rounded-lg text-xs font-sc tracking-wide transition-all"
                style={{
                  background: activeTab === tab ? "hsl(43 74% 66%)" : "hsl(270 30% 12%)",
                  color: activeTab === tab ? "hsl(240 20% 5%)" : "hsl(45 15% 55%)"
                }}>
                {tab === "meaning" ? "Значение" : tab === "meditation" ? "Медитация" : "Упражнение"}
              </button>
            ))}
          </div>

          <div className="rounded-xl p-4" style={{ background: "hsl(270 30% 7%)" }}>
            {activeTab === "meaning" && (
              <>
                <div className="mb-3">
                  <div className="text-xs font-sc text-gold mb-1 tracking-wide">ПРЯМОЕ</div>
                  <p className="text-sm font-body leading-relaxed" style={{ color: "hsl(45 20% 75%)" }}>{selected.meaning}</p>
                </div>
                <OrnamentDivider />
                <div>
                  <div className="text-xs font-sc text-red-400 mb-1 tracking-wide">ПЕРЕВЁРНУТОЕ</div>
                  <p className="text-sm font-body leading-relaxed" style={{ color: "hsl(45 20% 65%)" }}>{selected.reversed}</p>
                </div>
              </>
            )}
            {activeTab === "meditation" && (
              <p className="text-sm font-body leading-relaxed" style={{ color: "hsl(45 20% 75%)" }}>{selected.meditation}</p>
            )}
            {activeTab === "exercise" && (
              <p className="text-sm font-body leading-relaxed" style={{ color: "hsl(45 20% 75%)" }}>{selected.exercise}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryPage({ history }: { history: HistoryEntry[] }) {
  const [selected, setSelected] = useState<HistoryEntry | null>(null);

  if (selected) {
    return (
      <div className="px-4 py-6 animate-fade-up">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
          <Icon name="ChevronLeft" size={16} /> История
        </button>
        <div className="mb-4">
          <div className="font-sc text-gold text-lg">{selected.spread}</div>
          <div className="text-muted-foreground text-sm">{selected.date}</div>
          {selected.question && <p className="italic text-sm mt-2 font-display" style={{ color: "hsl(45 20% 70%)" }}>«{selected.question}»</p>}
        </div>
        <OrnamentDivider />
        <div className="flex flex-wrap gap-3 mt-4">
          {selected.cards.map((card, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <TarotCardComponent card={card} revealed={true} small />
              <span className="text-xs text-muted-foreground">{card.nameRu}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 animate-fade-up">
      <div className="text-center mb-6">
        <h1 className="font-display text-4xl text-gold text-glow">История</h1>
        <p className="text-muted-foreground text-sm mt-1">Ваши прошлые расклады</p>
      </div>
      <OrnamentDivider />

      {history.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4 opacity-40">📜</div>
          <p className="text-muted-foreground font-sc tracking-wide">ИСТОРИЯ ПУСТА</p>
          <p className="text-muted-foreground text-sm mt-2">Проведите первый расклад</p>
        </div>
      ) : (
        <div className="grid gap-3 mt-4">
          {history.map(entry => (
            <button key={entry.id} onClick={() => setSelected(entry)}
              className="flex items-center gap-4 p-4 rounded-xl border text-left transition-all"
              style={{ background: "hsl(270 30% 8% / 0.8)", borderColor: "hsl(43 74% 66% / 0.15)" }}>
              <div className="flex -space-x-2">
                {entry.cards.slice(0, 3).map((card, i) => (
                  <div key={i} className="w-8 h-12 rounded flex items-center justify-center text-lg border"
                    style={{ background: "hsl(270 40% 12%)", borderColor: "hsl(43 74% 66% / 0.3)", zIndex: i }}>
                    {card.symbol}
                  </div>
                ))}
              </div>
              <div className="flex-1">
                <div className="font-sc text-gold text-sm">{entry.spread}</div>
                <div className="text-muted-foreground text-xs mt-0.5">{entry.date}</div>
                {entry.question && <div className="text-xs mt-1 italic truncate" style={{ color: "hsl(45 20% 60%)" }}>«{entry.question}»</div>}
              </div>
              <Icon name="ChevronRight" size={14} className="text-gold opacity-40" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfilePage() {
  const [activeMed, setActiveMed] = useState<typeof MEDITATIONS[0] | null>(null);

  return (
    <div className="px-4 py-6 animate-fade-up">
      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-4xl border-2 animate-pulse-gold"
          style={{ borderColor: "hsl(43 74% 66% / 0.5)", background: "linear-gradient(135deg, hsl(270 40% 15%), hsl(240 30% 10%))" }}>
          🌙
        </div>
        <h2 className="font-display text-2xl text-gold">Искатель Истины</h2>
        <p className="text-muted-foreground text-sm mt-1">Начало пути · 2026</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Расклады", value: "0", icon: "🔮" },
          { label: "Карты", value: "0", icon: "✨" },
          { label: "Медитации", value: "0", icon: "🌟" }
        ].map(stat => (
          <div key={stat.label} className="rounded-xl p-3 text-center border"
            style={{ background: "hsl(270 30% 8%)", borderColor: "hsl(43 74% 66% / 0.15)" }}>
            <div className="text-xl mb-1">{stat.icon}</div>
            <div className="font-sc text-gold text-lg">{stat.value}</div>
            <div className="text-muted-foreground text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

      <OrnamentDivider text="✦ Практики ✦" />

      <div className="grid gap-3 mt-4">
        {MEDITATIONS.map(med => (
          <button key={med.id} onClick={() => setActiveMed(activeMed?.id === med.id ? null : med)}
            className="rounded-xl border p-4 text-left transition-all w-full"
            style={{
              background: activeMed?.id === med.id ? "hsl(270 40% 12%)" : "hsl(270 30% 8% / 0.8)",
              borderColor: activeMed?.id === med.id ? "hsl(43 74% 66% / 0.5)" : "hsl(43 74% 66% / 0.15)"
            }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{med.icon}</span>
              <div className="flex-1 text-left">
                <div className="font-sc text-gold text-sm">{med.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{med.category} · {med.duration}</div>
              </div>
              <Icon name={activeMed?.id === med.id ? "ChevronUp" : "ChevronDown"} size={14} className="text-gold opacity-40" />
            </div>
            {activeMed?.id === med.id && (
              <div className="mt-3 border-t pt-3" style={{ borderColor: "hsl(43 74% 66% / 0.15)" }}>
                <p className="text-sm font-body mb-3 text-left" style={{ color: "hsl(45 20% 70%)" }}>{med.description}</p>
                <div className="space-y-2">
                  {med.steps.map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="font-sc text-gold text-xs mt-0.5 opacity-60 flex-shrink-0">{i + 1}.</span>
                      <span className="text-sm text-left" style={{ color: "hsl(45 20% 75%)" }}>{step}</span>
                    </div>
                  ))}
                </div>
                <div className="w-full mt-4 py-2.5 rounded-lg font-sc tracking-widest text-xs text-center"
                  style={{ background: "linear-gradient(135deg, hsl(43 60% 25%), hsl(43 74% 40%))", color: "hsl(240 20% 5%)" }}>
                  НАЧАТЬ МЕДИТАЦИЮ
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Index() {
  const [tab, setTab] = useState<Tab>("divination");
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const addHistory = (entry: HistoryEntry) => {
    setHistory(prev => [entry, ...prev]);
  };

  const navItems = [
    { id: "divination" as Tab, label: "Гадание", emoji: "🔮" },
    { id: "catalog" as Tab, label: "Каталог", emoji: "📖" },
    { id: "history" as Tab, label: "История", emoji: "📜" },
    { id: "profile" as Tab, label: "Профиль", emoji: "🌙" }
  ];

  return (
    <div className="min-h-screen relative" style={{ background: "hsl(240 20% 4%)" }}>
      <StarField />

      <div className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(ellipse at 30% 0%, hsl(270 40% 12% / 0.4) 0%, transparent 60%), radial-gradient(ellipse at 70% 100%, hsl(240 30% 8% / 0.5) 0%, transparent 60%)"
        }} />

      <main className="relative z-10 max-w-md mx-auto pb-24 min-h-screen">
        {tab === "divination" && <DivinationPage onSaveHistory={addHistory} />}
        {tab === "catalog" && <CatalogPage />}
        {tab === "history" && <HistoryPage history={history} />}
        {tab === "profile" && <ProfilePage />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20"
        style={{
          background: "hsl(240 20% 5% / 0.95)",
          borderTop: "1px solid hsl(43 74% 66% / 0.15)",
          backdropFilter: "blur(20px)"
        }}>
        <div className="max-w-md mx-auto flex">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className="flex-1 flex flex-col items-center py-3 gap-1 transition-all relative"
              style={{ color: tab === item.id ? "hsl(43 74% 66%)" : "hsl(45 15% 40%)" }}
            >
              {tab === item.id && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ background: "hsl(43 74% 66%)" }} />
              )}
              <span className="text-lg">{item.emoji}</span>
              <span className="font-sc tracking-wide" style={{ fontSize: "9px" }}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
