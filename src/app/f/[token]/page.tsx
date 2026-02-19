"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

// ── i18n ────────────────────────────────────────────────────────────────────

const t = {
  en: {
    eyebrow: "Post-Interview Feedback",
    heroTitle: "Two minutes to help someone grow.",
    heroSub:
      "Your honest feedback helps this candidate understand where to focus. There are no wrong answers.",
    q: [
      {
        num: "Question 1 of 7",
        text: "How well did the candidate's experience match what you were looking for?",
        opts: [
          ["strong", "✦ Strong match"],
          ["partial", "◈ Partial match"],
          ["notfit", "○ Not quite the right fit"],
        ],
        cond: "Could you tell us what was missing? This will really help the candidate focus.",
      },
      {
        num: "Question 2 of 7",
        text: "How would you describe the candidate's communication during the interview?",
        opts: [
          ["excellent", "✦ Excellent"],
          ["good", "◈ Good"],
          ["develop", "○ Has room to grow"],
        ],
        condTrigger: "develop",
        condLabel: "Where specifically? Pick all that apply.",
        checkboxes: [
          ["clarity", "Clarity of answers"],
          ["structure", "Structuring thoughts"],
          ["listening", "Active listening"],
          ["confidence", "Confidence"],
          ["conciseness", "Conciseness"],
        ],
      },
      {
        num: "Question 3 of 7",
        text: "What was the main reason the candidate wasn't selected this time?",
        opts: [
          ["stronger", "Another candidate was a stronger overall fit"],
          ["skill", "Missing a specific skill or experience"],
          ["culture", "Culture or team fit"],
          ["over", "Overqualified for the role"],
          ["internal", "Role was filled internally"],
          ["other", "Other"],
        ],
        condTriggers: ["skill", "other"],
        cond: "Which skill or experience would have made the difference?",
      },
      {
        num: "Question 4 of 7",
        text: "Would you consider this candidate for future roles at your company?",
        opts: [
          ["yes", "✦ Yes, definitely"],
          ["maybe", "◈ Possibly, for the right role"],
          ["unlikely", "○ Unlikely"],
        ],
        condTrigger: "unlikely",
        cond: "No pressure — but if there's a reason you're comfortable sharing, it could really help them.",
      },
      {
        num: "Question 5 of 7",
        text: "Overall, how would you rate the interview experience with this candidate?",
        stars: true,
        starLabels: [
          "Needs significant work",
          "Below expectations",
          "Met expectations",
          "Strong candidate",
          "Outstanding",
        ],
      },
      {
        num: "Question 6 of 7",
        text: "What's one thing this candidate could do to strengthen their profile for this type of role?",
        optional: true,
        sub: "Think certification, experience, portfolio, or anything that would have made you more confident.",
        freeText: true,
        placeholder:
          "e.g. Getting hands-on experience with enterprise CRMs would go a long way…",
      },
      {
        num: "Question 7 of 7 — Last one!",
        text: "Was there anything about how the candidate interviewed that they could work on for next time?",
        sub: "e.g. More concrete examples, deeper company research. Both fields are optional.",
        dualText: true,
        placeholder: "Anything about their interview performance…",
        placeholder2: "Any other thoughts, encouragement, or context…",
        label2: "Anything else you'd like to add?",
      },
    ],
    next: "Continue",
    back: "Back",
    submit: "Send feedback ✓",
    successTitle: "Thank you so much.",
    successBody:
      "Your feedback will make a real difference. Honest, specific input like this is genuinely rare — and it helps people grow in ways that a rejection alone never could.",
    notFound: "This feedback link is invalid or has already been completed.",
    alreadyDone: "This form has already been completed. Thank you!",
  },
  sv: {
    eyebrow: "Feedback efter intervju",
    heroTitle: "Två minuter som kan förändra något.",
    heroSub:
      "Din ärliga feedback hjälper kandidaten att förstå vad de ska fokusera på. Det finns inga fel svar.",
    q: [
      {
        num: "Fråga 1 av 7",
        text: "Hur väl matchade kandidatens erfarenhet det ni sökte?",
        opts: [
          ["strong", "✦ Stämde väl"],
          ["partial", "◈ Delvis matchande"],
          ["notfit", "○ Passade inte riktigt"],
        ],
        cond: "Kan du berätta vad som saknades? Det hjälper kandidaten att fokusera rätt.",
      },
      {
        num: "Fråga 2 av 7",
        text: "Hur skulle du beskriva kandidatens kommunikation under intervjun?",
        opts: [
          ["excellent", "✦ Utmärkt"],
          ["good", "◈ Bra"],
          ["develop", "○ Har utrymme att växa"],
        ],
        condTrigger: "develop",
        condLabel: "Var specifikt? Välj allt som stämmer.",
        checkboxes: [
          ["clarity", "Tydlighet i svar"],
          ["structure", "Strukturerat tänkande"],
          ["listening", "Aktivt lyssnande"],
          ["confidence", "Självförtroende"],
          ["conciseness", "Koncishet"],
        ],
      },
      {
        num: "Fråga 3 av 7",
        text: "Vad var den främsta anledningen till att kandidaten inte valdes denna gång?",
        opts: [
          ["stronger", "En annan kandidat passade bättre totalt sett"],
          ["skill", "Saknade en specifik kompetens eller erfarenhet"],
          ["culture", "Kultur- eller teampassning"],
          ["over", "Överkvalificerad för rollen"],
          ["internal", "Rollen tillsattes internt"],
          ["other", "Annat"],
        ],
        condTriggers: ["skill", "other"],
        cond: "Vilken kompetens eller erfarenhet hade gjort skillnad?",
      },
      {
        num: "Fråga 4 av 7",
        text: "Skulle du överväga den här kandidaten för framtida roller på ditt företag?",
        opts: [
          ["yes", "✦ Ja, absolut"],
          ["maybe", "◈ Möjligen, för rätt roll"],
          ["unlikely", "○ Troligen inte"],
        ],
        condTrigger: "unlikely",
        cond: "Inget krav — men om det finns en anledning du är bekväm att dela, kan det verkligen hjälpa dem.",
      },
      {
        num: "Fråga 5 av 7",
        text: "Hur skulle du totalt sett bedöma intervjuupplevelsen med den här kandidaten?",
        stars: true,
        starLabels: [
          "Behöver mycket arbete",
          "Under förväntningarna",
          "Uppfyllde förväntningarna",
          "Stark kandidat",
          "Enastående",
        ],
      },
      {
        num: "Fråga 6 av 7",
        text: "Vad är en sak den här kandidaten kan göra för att stärka sin profil för den här typen av roll?",
        optional: true,
        sub: "Tänk certifiering, erfarenhet, portfolio eller något som hade gjort dig mer övertygad.",
        freeText: true,
        placeholder:
          "t.ex. Att skaffa praktisk erfarenhet av enterprise-CRM-system skulle göra stor skillnad…",
      },
      {
        num: "Fråga 7 av 7 — Sista frågan!",
        text: "Finns det något i hur kandidaten intervjuade som de kan jobba på till nästa gång?",
        sub: "T.ex. mer konkreta exempel, djupare företagsresearch. Båda fälten är valfria.",
        dualText: true,
        placeholder: "Något om deras intervjuprestanda…",
        placeholder2: "Något annat du vill tillägga…",
        label2: "Något annat du vill tillägga?",
      },
    ],
    next: "Fortsätt",
    back: "Tillbaka",
    submit: "Skicka feedback ✓",
    successTitle: "Tack så hjärtligt.",
    successBody:
      "Din feedback gör verklig skillnad. Ärlig, specifik input som denna är genuint sällsynt — och den hjälper människor att växa på sätt som ett avslag ensamt aldrig kan.",
    notFound: "Den här länken är ogiltig eller har redan besvarats.",
    alreadyDone: "Det här formuläret har redan besvarats. Tack!",
  },
};

type Lang = "en" | "sv";

// ── Component ───────────────────────────────────────────────────────────────

export default function FeedbackPage() {
  const params = useParams();
  const token = (params as any)?.token as string;
  const [lang, setLang] = useState<Lang>("en");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<
    "loading" | "ready" | "notfound" | "done" | "submitted"
  >("loading");

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checkboxes, setCheckboxes] = useState<string[]>([]);
  const [textFields, setTextFields] = useState<Record<string, string>>({});
  const [starRating, setStarRating] = useState(0);
  const [starHover, setStarHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const strings = t[lang];
  const totalSteps = strings.q.length;

  useEffect(() => {
    if (!token) return;
    fetch(`/api/form/${token}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) {
          setStatus(json.error.includes("already") ? "done" : "notfound");
          return;
        }
        setCompany(json.data.company);
        setRole(json.data.role);
        setLang((json.data.language as Lang) ?? "en");
        setStatus("ready");
      })
      .catch(() => setStatus("notfound"));
  }, [token]);

  function selectOpt(key: string, val: string) {
    setAnswers((prev) => ({ ...prev, [key]: val }));
  }

  function toggleCheckbox(val: string) {
    setCheckboxes((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    );
  }

  function canAdvance(): boolean {
    const q = strings.q[step];
    if ((q as any).stars) return starRating > 0;
    if ((q as any).freeText || (q as any).dualText) return true;
    return !!answers[`q${step}`];
  }

  async function handleSubmit() {
    setSubmitting(true);
    const body = {
      q1_match: answers["q0"],
      q1_detail: textFields["q0_detail"] || undefined,
      q2_communication: answers["q1"],
      q2_checkboxes: checkboxes.length ? checkboxes : undefined,
      q3_reason: answers["q2"],
      q3_detail: textFields["q2_detail"] || undefined,
      q4_future: answers["q3"],
      q4_detail: textFields["q3_detail"] || undefined,
      q5_rating: starRating,
      q6_profile: textFields["q5_text"] || undefined,
      q7_interview: textFields["q6_text"] || undefined,
      q7_other: textFields["q6_text2"] || undefined,
    };

    const res = await fetch(`/api/form/${token}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSubmitting(false);
    if (res.ok || res.status === 409) {
      setStatus("submitted");
    }
  }

  // ── Render states ──────────────────────────────────────────────────────

  if (status === "loading") {
    return (
      <div style={f.bg}>
        <div style={f.loading}>Loading…</div>
      </div>
    );
  }

  if (status === "notfound") {
    return (
      <div style={f.bg}>
        <div style={f.msgCard}>
          <div style={f.msgIcon}>◎</div>
          <div style={f.msgText}>{strings.notFound}</div>
        </div>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div style={f.bg}>
        <div style={f.msgCard}>
          <div style={f.msgIcon}>✓</div>
          <div style={f.msgText}>{strings.alreadyDone}</div>
        </div>
      </div>
    );
  }

  if (status === "submitted") {
    return (
      <div style={f.bg}>
        <div style={f.successWrap}>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>🎉</div>
          <h2 style={f.successTitle}>{strings.successTitle}</h2>
          <p style={f.successBody}>{strings.successBody}</p>
          <div style={f.successPill}>
            {company} · {role}
          </div>
        </div>
      </div>
    );
  }

  const pct = (step / totalSteps) * 100;
  const q = strings.q[step] as any;

  // ── Main form ──────────────────────────────────────────────────────────

  return (
    <div style={f.bg}>
      {/* HERO */}
      <div style={f.hero}>
        <div style={f.heroInner}>
          <div style={f.eyebrow}>{strings.eyebrow}</div>
          <h1 style={f.heroTitle}>{strings.heroTitle}</h1>
          <p style={f.heroSub}>{strings.heroSub}</p>
          <div style={f.contextPill}>
            <span style={f.dot} />
            {company} · {role}
          </div>
        </div>
      </div>

      {/* PROGRESS */}
      <div style={f.progressWrap}>
        <div style={f.progressMeta}>
          <span style={f.progressLabel}>{q.num}</span>
        </div>
        <div style={f.progressTrack}>
          <div style={{ ...f.progressFill, width: `${pct}%` }} />
        </div>
      </div>

      {/* QUESTION */}
      <div style={f.formWrap}>
        <div style={f.card}>
          <div style={f.qText}>{q.text}</div>
          {q.sub && <div style={f.qSub}>{q.sub}</div>}

          {/* Radio options */}
          {q.opts && (
            <div style={f.opts}>
              {q.opts.map(([val, label]: string[]) => {
                const selected = answers[`q${step}`] === val;
                const showCond =
                  selected &&
                  ((q.condTrigger && q.condTrigger === val) ||
                    (q.condTriggers && q.condTriggers.includes(val)) ||
                    (!q.condTrigger &&
                      !q.condTriggers &&
                      val === "notfit" &&
                      q.cond));
                return (
                  <div key={val}>
                    <div
                      style={{ ...f.opt, ...(selected ? f.optSelected : {}) }}
                      onClick={() => selectOpt(`q${step}`, val)}
                    >
                      <div
                        style={{
                          ...f.radio,
                          ...(selected ? f.radioSelected : {}),
                        }}
                      >
                        {selected && <div style={f.radioDot} />}
                      </div>
                      <span style={{ fontSize: "15px" }}>{label}</span>
                    </div>

                    {/* Conditional follow-up */}
                    {selected && q.cond && !q.checkboxes && (
                      <div style={f.conditional}>
                        <div style={f.condLabel}>↳ {q.cond}</div>
                        <textarea
                          style={f.textarea}
                          rows={3}
                          placeholder="Optional but really helpful…"
                          value={textFields[`q${step}_detail`] ?? ""}
                          onChange={(e) =>
                            setTextFields((p) => ({
                              ...p,
                              [`q${step}_detail`]: e.target.value,
                            }))
                          }
                        />
                      </div>
                    )}

                    {/* Checkboxes (Q2 communication) */}
                    {selected && q.checkboxes && showCond && (
                      <div style={f.conditional}>
                        <div style={f.condLabel}>↳ {q.condLabel}</div>
                        {q.checkboxes.map(([cbVal, cbLabel]: string[]) => (
                          <div
                            key={cbVal}
                            style={{
                              ...f.checkbox,
                              ...(checkboxes.includes(cbVal)
                                ? f.checkboxChecked
                                : {}),
                            }}
                            onClick={() => toggleCheckbox(cbVal)}
                          >
                            <div
                              style={{
                                ...f.checkboxBox,
                                ...(checkboxes.includes(cbVal)
                                  ? f.checkboxBoxChecked
                                  : {}),
                              }}
                            >
                              {checkboxes.includes(cbVal) && "✓"}
                            </div>
                            <span style={{ fontSize: "13px" }}>{cbLabel}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Star rating (Q5) */}
          {q.stars && (
            <div>
              <div style={f.stars}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    style={{
                      ...f.star,
                      color:
                        n <= (starHover || starRating) ? "#e8b86d" : "#252936",
                    }}
                    onClick={() => setStarRating(n)}
                    onMouseEnter={() => setStarHover(n)}
                    onMouseLeave={() => setStarHover(0)}
                  >
                    ★
                  </span>
                ))}
              </div>
              {(starHover || starRating) > 0 && (
                <div style={f.starLabel}>
                  {q.starLabels[(starHover || starRating) - 1]}
                </div>
              )}
            </div>
          )}

          {/* Free text (Q6) */}
          {q.freeText && (
            <textarea
              style={f.textarea}
              rows={4}
              placeholder={q.placeholder}
              value={textFields[`q${step}_text`] ?? ""}
              onChange={(e) =>
                setTextFields((p) => ({
                  ...p,
                  [`q${step}_text`]: e.target.value,
                }))
              }
            />
          )}

          {/* Dual text (Q7) */}
          {q.dualText && (
            <div>
              <textarea
                style={{ ...f.textarea, marginBottom: "16px" }}
                rows={3}
                placeholder={q.placeholder}
                value={textFields[`q${step}_text`] ?? ""}
                onChange={(e) =>
                  setTextFields((p) => ({
                    ...p,
                    [`q${step}_text`]: e.target.value,
                  }))
                }
              />
              <div
                style={{
                  fontSize: "13px",
                  color: "#5a6080",
                  marginBottom: "8px",
                }}
              >
                {q.label2}
              </div>
              <textarea
                style={f.textarea}
                rows={3}
                placeholder={q.placeholder2}
                value={textFields[`q${step}_text2`] ?? ""}
                onChange={(e) =>
                  setTextFields((p) => ({
                    ...p,
                    [`q${step}_text2`]: e.target.value,
                  }))
                }
              />
            </div>
          )}
        </div>

        {/* NAV */}
        <div style={f.nav}>
          {step > 0 ? (
            <button style={f.btnBack} onClick={() => setStep((s) => s - 1)}>
              ← {strings.back}
            </button>
          ) : (
            <span />
          )}

          {step < totalSteps - 1 ? (
            <button
              style={{ ...f.btnNext, ...(canAdvance() ? {} : f.btnDisabled) }}
              disabled={!canAdvance()}
              onClick={() => setStep((s) => s + 1)}
            >
              {strings.next} →
            </button>
          ) : (
            <button
              style={{ ...f.btnNext, background: "#5ec483" }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "…" : strings.submit}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const f: Record<string, React.CSSProperties> = {
  bg: {
    minHeight: "100vh",
    background: "#f5f0e8",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  loading: {
    padding: "80px",
    textAlign: "center",
    color: "#8a8070",
    fontSize: "14px",
  },
  msgCard: {
    maxWidth: "420px",
    margin: "120px auto",
    textAlign: "center",
    padding: "24px",
  },
  msgIcon: { fontSize: "40px", marginBottom: "16px", color: "#c17d3c" },
  msgText: { fontSize: "16px", color: "#5a4e3a", lineHeight: 1.6 },
  hero: { background: "#1a1a2e", padding: "48px 24px 56px" },
  heroInner: { maxWidth: "560px", margin: "0 auto", textAlign: "center" },
  eyebrow: {
    fontSize: "11px",
    letterSpacing: "3px",
    textTransform: "uppercase",
    color: "#e8a96a",
    marginBottom: "12px",
    fontWeight: 500,
  },
  heroTitle: {
    fontFamily: "Georgia, serif",
    fontSize: "32px",
    color: "#f5f0e8",
    lineHeight: 1.2,
    marginBottom: "14px",
    fontWeight: 400,
  },
  heroSub: {
    color: "rgba(245,240,232,0.6)",
    fontSize: "15px",
    lineHeight: 1.6,
    fontWeight: 300,
    marginBottom: 0,
  },
  contextPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "40px",
    padding: "8px 18px",
    marginTop: "22px",
    fontSize: "13px",
    color: "rgba(245,240,232,0.7)",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#e8a96a",
    flexShrink: 0,
  },
  progressWrap: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "18px 24px 12px",
    borderBottom: "1px solid #d4c8b8",
    background: "#f5f0e8",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  progressMeta: { marginBottom: "8px" },
  progressLabel: {
    fontSize: "11px",
    color: "#8a8070",
    letterSpacing: "1px",
    textTransform: "uppercase",
    fontWeight: 500,
  },
  progressTrack: {
    height: "3px",
    background: "#d4c8b8",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #c17d3c, #e8a96a)",
    borderRadius: "4px",
    transition: "width 0.4s ease",
  },
  formWrap: { maxWidth: "600px", margin: "0 auto", padding: "28px 24px 60px" },
  card: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "28px",
    border: "1px solid #d4c8b8",
    boxShadow: "0 2px 16px rgba(26,26,46,0.06)",
    marginBottom: "20px",
  },
  qText: {
    fontFamily: "Georgia, serif",
    fontSize: "20px",
    color: "#1a1a2e",
    lineHeight: 1.4,
    marginBottom: "6px",
  },
  qSub: {
    fontSize: "13px",
    color: "#8a8070",
    marginBottom: "20px",
    lineHeight: 1.5,
  },
  opts: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "16px",
  },
  opt: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "13px 16px",
    border: "1.5px solid #d4c8b8",
    borderRadius: "10px",
    cursor: "pointer",
    background: "#f5f0e8",
    transition: "all 0.15s",
  },
  optSelected: { borderColor: "#c17d3c", background: "rgba(193,125,60,0.07)" },
  radio: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    border: "2px solid #d4c8b8",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: "#c17d3c", background: "#c17d3c" },
  radioDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "white",
  },
  conditional: {
    marginTop: "10px",
    marginLeft: "8px",
    background: "rgba(193,125,60,0.05)",
    border: "1px dashed #c17d3c",
    borderRadius: "10px",
    padding: "14px",
  },
  condLabel: {
    fontSize: "12px",
    color: "#c17d3c",
    fontWeight: 500,
    marginBottom: "10px",
  },
  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "9px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    border: "1px solid #d4c8b8",
    marginBottom: "6px",
    background: "#f5f0e8",
    fontSize: "13px",
  },
  checkboxChecked: {
    borderColor: "#c17d3c",
    background: "rgba(193,125,60,0.08)",
  },
  checkboxBox: {
    width: "18px",
    height: "18px",
    borderRadius: "4px",
    border: "2px solid #d4c8b8",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
  },
  checkboxBoxChecked: {
    background: "#c17d3c",
    borderColor: "#c17d3c",
    color: "white",
  },
  stars: { display: "flex", gap: "8px", marginTop: "16px" },
  star: {
    fontSize: "40px",
    cursor: "pointer",
    transition: "color 0.1s, transform 0.1s",
    userSelect: "none",
    lineHeight: 1,
  },
  starLabel: {
    fontSize: "13px",
    color: "#8a8070",
    marginTop: "10px",
    fontStyle: "italic",
  },
  textarea: {
    width: "100%",
    border: "1.5px solid #d4c8b8",
    borderRadius: "8px",
    padding: "11px 13px",
    fontFamily: "inherit",
    fontSize: "14px",
    color: "#1a1a2e",
    background: "#f5f0e8",
    resize: "vertical",
    outline: "none",
    lineHeight: 1.5,
    boxSizing: "border-box",
    marginTop: "8px",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  btnBack: {
    background: "none",
    border: "none",
    color: "#8a8070",
    fontFamily: "inherit",
    fontSize: "14px",
    cursor: "pointer",
    padding: "10px 0",
  },
  btnNext: {
    background: "#1a1a2e",
    color: "#f5f0e8",
    border: "none",
    borderRadius: "10px",
    padding: "13px 26px",
    fontFamily: "inherit",
    fontSize: "15px",
    fontWeight: 500,
    cursor: "pointer",
  },
  btnDisabled: { opacity: 0.35, cursor: "not-allowed" },
  successWrap: {
    maxWidth: "480px",
    margin: "0 auto",
    padding: "80px 24px",
    textAlign: "center",
  },
  successTitle: {
    fontFamily: "Georgia, serif",
    fontSize: "30px",
    color: "#1a1a2e",
    marginBottom: "12px",
    fontWeight: 400,
  },
  successBody: {
    color: "#8a8070",
    fontSize: "16px",
    lineHeight: 1.6,
    fontWeight: 300,
    marginBottom: "28px",
  },
  successPill: {
    display: "inline-block",
    background: "rgba(193,125,60,0.1)",
    border: "1px solid rgba(193,125,60,0.3)",
    borderRadius: "40px",
    padding: "8px 20px",
    fontSize: "13px",
    color: "#c17d3c",
  },
};
