// Page-unique prose in all five locales.
//
// Each builder returns the fields publish.mjs consumes for one (page, locale):
//   title, metaDescription, h1, heroAnswer, anchorForms[], faqs[]
// plus `sections.answer.paragraphs` and `sections.tips.items`, which are the
// parts of `sections` that genuinely differ per page. Everything else in
// `sections` is composed from phrases.mjs.
//
// Titles and H1s follow the spec §3 formulas:
//   minutes: How Many Words is a [X]-Minute Speech? ([AvgWords] Words + Sample Script)
//   words:   How Long Does It Take to Speak [X] Words? ([AvgTime] + Calculator)

import { clock, n, dec1, BUFFER_PERCENT } from './core.mjs';

// LOCALES is injected rather than imported so this module has no path dependency
// on the repo layout; build-all-silo-pages.mjs owns the import.
let LOCALES = {};
let ui = () => ({});
let loc = () => ({});

export function setLocales(locales) {
  LOCALES = locales;
  ui = (code) => LOCALES[code].ui;
  loc = (code) => LOCALES[code];
}

/** Time string as the site formats it, e.g. "1 min 55 sec". */
const sayTime = (code, seconds) => clock(seconds, ui(code));
/** Compact form for prose where a leading "0 min" would read badly, e.g. "46 sec". */
const sayTimeShort = (code, seconds) =>
  clock(seconds, ui(code), { compact: true });

/* ────────────────────────────────────────────────────────────── minutes group */

function minutesContent(code, page) {
  const u = ui(code);
  const L = loc(code);
  const m = page.minutes;
  const words = page.wordCount;
  const slow = 100 * m;
  const fast = 160 * m;
  const buf = page.stageBuffer.usableWords;
  const single = dec1(words / 500, L);
  const double = dec1(words / 250, L);
  const verbal = page.verbal; // "two", "three", …
  const label = `${m}-minute speech`;

  const blocks = {
    en: {
      title: `How Many Words is a ${m}-Minute Speech? (${n(words, L)} Words + Sample Script)`,
      metaDescription: `A ${m}-minute speech is about ${n(words, L)} words at 130 WPM. See the word budget at six speaking paces, the 85% stage buffer, ${single} single-spaced pages, and a timed sample script you can rehearse free in the browser.`,
      h1: `How Many Words is a ${m}-Minute Speech?`,
      heroAnswer: `A **${m}-minute speech is about ${n(words, L)} words** at the average presentation pace of 130 words per minute. Speak slowly and deliberately at 100 WPM and ${n(slow, L)} words fills the slot; push to a brisk 160 WPM and you can carry ${n(fast, L)}. That is ${single} single-spaced pages or ${double} double-spaced. Write to ${n(buf, L)} words — 85% of the budget — so pauses and audience reaction do not push you over. Check your own pace with the [speech time calculator](/) before you lock the script.`,
      anchorForms: [
        `${m} minute speech word count`,
        `how many words in a ${m} minute speech`,
        `${m} minute speech script`
      ],
      faqSubject: `${m}-minute speech`,
      faqs: [
        {
          q: `How many words is a ${m}-minute speech?`,
          a: `About ${n(words, L)} words at 130 words per minute, the pace most presenters settle into when speaking clearly to an audience. Plan ${n(slow, L)} words if you speak slowly or expect applause, and up to ${n(fast, L)} if you talk quickly.`
        },
        {
          q: `How many pages is a ${m}-minute speech?`,
          a: `${single} single-spaced pages or ${double} double-spaced pages in 12 pt Arial or Times New Roman with 1-inch margins. That assumes 500 words per single-spaced page and 250 per double-spaced page — the standard manuscript convention.`
        },
        {
          q: `How long should I rehearse a ${m}-minute speech?`,
          a: `Read it aloud at least three times, and time every run. Reading silently runs about 230 words per minute, which is roughly 75% faster than speaking, so a silent read-through tells you nothing about your real duration. Aim to land at ${sayTime(code, (buf / 130) * 60)} rather than a full ${m} minutes, so you have room for a pause that lands well.`
        },
        {
          q: `Is a ${m}-minute speech enough for ${page.useCase}?`,
          a: `Yes. ${capitalise(page.scenario)} is the standard use for this length, and ${m} minutes comfortably fits one central claim, one piece of supporting evidence, and a clear close. The failure mode is never too little time; it is trying to make two competing points and landing neither.`
        }
      ],
      answer: [
        `The arithmetic is simple and worth memorising: **words ÷ 130 = minutes**. A ${m}-minute slot therefore holds ${n(words, L)} words at the average business pace. The same ${m} minutes stretches from ${n(slow, L)} words at a measured 100 WPM toast pace to ${n(fast, L)} words at a fast 160 WPM pitch — a ${n(fast - slow, L)}-word swing that is entirely about delivery, not content.`,
        `In manuscript terms that is ${single} single-spaced pages, or ${double} double-spaced, which is the practical way to judge a draft you have already written. Aim for ${n(buf, L)} words instead of the full ${n(words, L)}, and the ${BUFFER_PERCENT}% you leave on the table absorbs the pause after your opening line, the laugh you did not script, and the slide that loads a beat late.`
      ],
      tips: [
        {
          h3: `Structure for ${page.useCase}`,
          body: `Open with the claim in one sentence, spend the middle on a single piece of evidence, and close on the action you want. For ${page.useCase}, that shape is about ${n(Math.round(words * 0.12), L)} words of opening, ${n(Math.round(words * 0.7), L)} of body, and ${n(Math.round(words * 0.18), L)} of close. Mark a deliberate pause after the opening line — it is the cheapest way to stop the adrenaline rush that makes speakers hit 150+ WPM and run out of slot before their last point.`
        },
        {
          h3: `Pages, paragraphs and slides for ${m} minutes`,
          body: `At ${single} single-spaced pages you want roughly ${page.paragraphs} paragraphs and ${page.slides} slides. The one-slide-per-45-to-60-seconds rule means a ${m}-minute talk supports no more than ${page.slides} slides; beyond that, average dwell time drops under 45 seconds, attention fragments, and the deck ends up pacing you instead of the other way round.`
        },
        {
          h3: `Why trim to ${n(buf, L)} words (the ${BUFFER_PERCENT}% rule)`,
          body: `Rehearsed reading is consistently faster than performed delivery. The gap is not nerves alone: it is breathing, a slide change, a laugh, a sip of water, a question called out from the third row. Writing to ${BUFFER_PERCENT}% of your budget — ${n(buf, L)} words instead of ${n(words, L)} — buys back about ${sayTime(code, (words - buf) / 130 * 60)} of slack, which is the difference between finishing to applause and finishing to a red timer on the lectern.`
        }
      ]
    },

    hi: {
      title: `${m} मिनट के भाषण में कितने शब्द? (${n(words, L)} शब्द + नमूना स्क्रिप्ट)`,
      metaDescription: `130 WPM पर ${m} मिनट का भाषण लगभग ${n(words, L)} शब्द होता है। छह गतियों पर शब्द-बजट, 85% स्टेज बफ़र, ${single} सिंगल-स्पेस पेज और समयबद्ध नमूना स्क्रिप्ट देखें, फिर ब्राउज़र में मुफ़्त रिहर्सल करें।`,
      h1: `${m} मिनट के भाषण में कितने शब्द होते हैं?`,
      heroAnswer: `औसत प्रेज़ेंटेशन गति 130 शब्द प्रति मिनट पर **${m} मिनट का भाषण लगभग ${n(words, L)} शब्द** होता है। धीमे, सोच-समझकर बोलें (100 WPM) तो ${n(slow, L)} शब्द काफ़ी हैं; तेज़ 160 WPM पर ${n(fast, L)} शब्द तक बोल सकते हैं। यह ${single} सिंगल-स्पेस पेज या ${double} डबल-स्पेस पेज है। ${n(buf, L)} शब्द लिखें — बजट का 85% — ताकि ठहराव और दर्शकों की प्रतिक्रिया आपको समय से आगे न ले जाए। स्क्रिप्ट फाइनल करने से पहले [स्पीच टाइम कैलकुलेटर](/) से अपनी गति नापें।`,
      anchorForms: [
        `${m} मिनट भाषण शब्द संख्या`,
        `${m} मिनट के भाषण में कितने शब्द`,
        `${m} मिनट के भाषण का उदाहरण`
      ],
      faqSubject: `${m} मिनट का भाषण`,
      faqs: [
        {
          q: `${m} मिनट के भाषण में कितने शब्द होते हैं?`,
          a: `130 शब्द प्रति मिनट पर लगभग ${n(words, L)} शब्द — यही गति ज़्यादातर वक्ता दर्शकों से स्पष्ट बोलते हुए अपनाते हैं। अगर धीरे बोलते हैं या तालियाँ मिलेंगी तो ${n(slow, L)} शब्द रखें, और तेज़ बोलते हैं तो ${n(fast, L)} शब्द तक लिख सकते हैं।`
        },
        {
          q: `${m} मिनट का भाषण कितने पेज का होता है?`,
          a: `12 pt Arial या Times New Roman और 1 इंच मार्जिन में ${single} सिंगल-स्पेस पेज या ${double} डबल-स्पेस पेज। यह मानक पांडुलिपि नियम पर है — सिंगल-स्पेस पेज पर 500 शब्द और डबल-स्पेस पेज पर 250 शब्द।`
        },
        {
          q: `${m} मिनट के भाषण की कितनी रिहर्सल करें?`,
          a: `कम से कम तीन बार ज़ोर से पढ़ें और हर बार समय नापें। चुपचाप पढ़ना लगभग 230 शब्द प्रति मिनट चलता है, जो बोलने से करीब 75% तेज़ है — इसलिए मन में पढ़कर समय का अंदाज़ा नहीं लगाया जा सकता। ${sayTime(code, (buf / 130) * 60)} पर पहुँचने का लक्ष्य रखें, पूरे ${m} मिनट का नहीं, ताकि एक सार्थक ठहराव के लिए जगह बचे।`
        },
        {
          q: `${m} मिनट का भाषण किसके लिए काफ़ी है?`,
          a: `हाँ। ${page.scenario} इस अवधि का मानक उपयोग है, और ${m} मिनट में एक मुख्य दावा, एक सहायक प्रमाण और स्पष्ट समापन आराम से आ जाता है। समस्या समय की कमी नहीं होती; समस्या दो बातें कहने की कोशिश में कुछ भी याद न रहना है।`
        }
      ],
      answer: [
        `गणित सरल है और याद रखने लायक: **शब्द ÷ 130 = मिनट**। इसलिए ${m} मिनट के स्लॉट में औसत बिज़नेस गति पर ${n(words, L)} शब्द आते हैं। वही ${m} मिनट धीमी 100 WPM टोस्ट गति पर ${n(slow, L)} शब्द से लेकर तेज़ 160 WPM पिच पर ${n(fast, L)} शब्द तक फैलता है — ${n(fast - slow, L)} शब्दों का यह अंतर पूरी तरह डिलीवरी का है, सामग्री का नहीं।`,
        `पांडुलिपि के हिसाब से यह ${single} सिंगल-स्पेस पेज या ${double} डबल-स्पेस पेज है — लिखे हुए ड्राफ़्ट को आँकने का यही व्यावहारिक तरीका है। पूरे ${n(words, L)} के बजाय ${n(buf, L)} शब्द लिखें; जो ${BUFFER_PERCENT}% आप छोड़ते हैं वह शुरुआती पंक्ति के बाद के ठहराव, बिना योजना वाली हँसी और एक ताल बाद में खुलने वाली स्लाइड को सँभाल लेता है।`
      ],
      tips: [
        {
          h3: `${page.scenario} के लिए ढाँचा`,
          body: `एक वाक्य में दावे से शुरू करें, बीच का हिस्सा एक ही प्रमाण पर लगाएँ, और अंत में वह काम बताएँ जो आप चाहते हैं। इस अवधि के लिए यह ढाँचा लगभग ${n(Math.round(words * 0.12), L)} शब्द शुरुआत, ${n(Math.round(words * 0.7), L)} शब्द मुख्य भाग और ${n(Math.round(words * 0.18), L)} शब्द समापन है। पहली पंक्ति के बाद जानबूझकर ठहराव रखें — यह उस एड्रेनालाइन को रोकने का सबसे सस्ता तरीका है जो वक्ताओं को 150+ WPM पर पहुँचा देती है।`
        },
        {
          h3: `${m} मिनट के लिए पेज, पैराग्राफ़ और स्लाइड`,
          body: `${single} सिंगल-स्पेस पेज पर लगभग ${page.paragraphs} पैराग्राफ़ और ${page.slides} स्लाइड उपयुक्त हैं। हर 45–60 सेकंड पर एक स्लाइड का नियम कहता है कि ${m} मिनट में ${page.slides} से ज़्यादा स्लाइड न रखें; उससे आगे हर स्लाइड पर रुकने का औसत समय 45 सेकंड से नीचे चला जाता है और ध्यान बिखरता है।`
        },
        {
          h3: `${n(buf, L)} शब्दों तक क्यों काटें (${BUFFER_PERCENT}% नियम)`,
          body: `रिहर्सल की गई रीडिंग मंच पर बोलने से लगातार तेज़ होती है। यह सिर्फ़ घबराहट नहीं — साँस, स्लाइड बदलाव, हँसी, पानी का घूँट, तीसरी पंक्ति से आया सवाल। बजट का ${BUFFER_PERCENT}% लिखने से — ${n(words, L)} के बजाय ${n(buf, L)} शब्द — करीब ${sayTime(code, (words - buf) / 130 * 60)} की छूट मिलती है, और यही तालियों पर खत्म होने और लेक्चन पर लाल टाइमर देखने के बीच का अंतर है।`
        }
      ]
    },

    de: {
      title: `Wie viele Wörter hat eine ${m}-Minuten-Rede? (${n(words, L)} Wörter + Beispielskript)`,
      metaDescription: `Eine ${m}-Minuten-Rede umfasst bei 130 WPM etwa ${n(words, L)} Wörter. Wortbudget für sechs Sprechtempi, 85 % Bühnen-Puffer, ${single} einzeilige Seiten und ein getimtes Beispielskript zum kostenlosen Üben im Browser.`,
      h1: `Wie viele Wörter hat eine ${m}-Minuten-Rede?`,
      heroAnswer: `Eine **${m}-Minuten-Rede umfasst bei einem durchschnittlichen Vortragstempo von 130 Wörtern pro Minute etwa ${n(words, L)} Wörter**. Sprechen Sie langsam und bewusst mit 100 WPM, reichen ${n(slow, L)} Wörter; bei zügigen 160 WPM tragen Sie ${n(fast, L)}. Das sind ${single} einzeilig oder ${double} zweizeilig beschriebene Seiten. Schreiben Sie ${n(buf, L)} Wörter — 85 % des Budgets —, damit Pausen und Publikumsreaktionen Sie nicht überziehen lassen. Prüfen Sie Ihr eigenes Tempo mit dem [Sprechzeit-Rechner](/), bevor Sie das Skript festlegen.`,
      anchorForms: [
        `${m} minuten rede wortzahl`,
        `wie viele wörter ${m} minuten rede`,
        `${m} minuten rede beispiel`
      ],
      faqSubject: `${m}-Minuten-Rede`,
      faqs: [
        {
          q: `Wie viele Wörter hat eine ${m}-Minuten-Rede?`,
          a: `Etwa ${n(words, L)} Wörter bei 130 Wörtern pro Minute — das Tempo, in das die meisten Redner verfallen, wenn sie klar zum Publikum sprechen. Planen Sie ${n(slow, L)} Wörter, wenn Sie langsam sprechen oder Applaus erwarten, und bis zu ${n(fast, L)}, wenn Sie schnell sprechen.`
        },
        {
          q: `Wie viele Seiten sind eine ${m}-Minuten-Rede?`,
          a: `${single} einzeilig oder ${double} zweizeilig beschriebene Seiten in 12 pt Arial oder Times New Roman mit 1-Zoll-Rändern. Das entspricht 500 Wörtern pro einzeiliger und 250 Wörtern pro zweizeiliger Seite — die übliche Manuskriptnorm.`
        },
        {
          q: `Wie oft sollte ich eine ${m}-Minuten-Rede proben?`,
          a: `Lesen Sie sie mindestens dreimal laut und messen Sie jeden Durchlauf. Stilles Lesen läuft mit rund 230 Wörtern pro Minute und damit etwa 75 % schneller als Sprechen — ein stiller Durchlauf sagt Ihnen also nichts über die echte Dauer. Zielen Sie auf ${sayTime(code, (buf / 130) * 60)} statt auf volle ${m} Minuten, damit eine wirkungsvolle Pause Platz hat.`
        },
        {
          q: `Reichen ${m} Minuten für ${page.useCase}?`,
          a: `Ja. ${capitalise(page.scenario)} ist der übliche Einsatz für diese Länge, und ${m} Minuten fassen bequem eine Kernaussage, einen Beleg und einen klaren Schluss. Das Problem ist nie zu wenig Zeit, sondern der Versuch, zwei konkurrierende Punkte zu machen und keinen davon zu landen.`
        }
      ],
      answer: [
        `Die Rechnung ist einfach und lohnt das Auswendiglernen: **Wörter ÷ 130 = Minuten**. Ein ${m}-Minuten-Slot fasst bei durchschnittlichem Business-Tempo also ${n(words, L)} Wörter. Dieselben ${m} Minuten reichen von ${n(slow, L)} Wörtern bei gemessenen 100 WPM Rede-Tempo bis ${n(fast, L)} Wörtern bei zügigen 160 WPM — eine Spanne von ${n(fast - slow, L)} Wörtern, die vollständig vom Vortrag und nicht vom Inhalt abhängt.`,
        `Im Manuskript sind das ${single} einzeilig oder ${double} zweizeilig beschriebene Seiten — die praktische Methode, einen bereits geschriebenen Entwurf einzuschätzen. Zielen Sie auf ${n(buf, L)} statt ${n(words, L)} Wörter; die ${BUFFER_PERCENT} %, die Sie freilassen, absorbieren die Pause nach dem Einstiegssatz, das Lachen, das Sie nicht eingeplant haben, und die Folie, die einen Schlag zu spät lädt.`
      ],
      tips: [
        {
          h3: `Struktur für ${page.useCase}`,
          body: `Beginnen Sie mit der Kernaussage in einem Satz, verwenden Sie die Mitte für einen einzigen Beleg und schließen Sie mit der gewünschten Handlung. Für diese Länge sind das etwa ${n(Math.round(words * 0.12), L)} Wörter Einstieg, ${n(Math.round(words * 0.7), L)} Wörter Mittelteil und ${n(Math.round(words * 0.18), L)} Wörter Schluss. Setzen Sie nach dem Einstiegssatz eine bewusste Pause — sie ist der billigste Weg, den Adrenalinschub zu bremsen, der Redner auf 150+ WPM treibt.`
        },
        {
          h3: `Seiten, Absätze und Folien für ${m} Minuten`,
          body: `Bei ${single} einzeiligen Seiten passen etwa ${page.paragraphs} Absätze und ${page.slides} Folien. Die Regel von einer Folie pro 45 bis 60 Sekunden bedeutet, dass ein ${m}-Minuten-Vortrag höchstens ${page.slides} Folien trägt; darüber sinkt die durchschnittliche Verweildauer unter 45 Sekunden, die Aufmerksamkeit splittert und die Präsentation taktet Sie statt umgekehrt.`
        },
        {
          h3: `Warum auf ${n(buf, L)} Wörter kürzen (die ${BUFFER_PERCENT}-%-Regel)`,
          body: `Geprobtes Lesen ist durchgehend schneller als der Vortrag. Die Lücke ist nicht nur Nervosität: Atmen, ein Folienwechsel, ein Lachen, ein Schluck Wasser, eine Zwischenfrage aus der dritten Reihe. Wer ${BUFFER_PERCENT} % des Budgets schreibt — ${n(buf, L)} statt ${n(words, L)} Wörter —, gewinnt rund ${sayTime(code, (words - buf) / 130 * 60)} Luft, und genau das ist der Unterschied zwischen Schlussapplaus und einem roten Timer auf dem Rednerpult.`
        }
      ]
    },

    es: {
      title: `¿Cuántas palabras tiene un discurso de ${m} minutos? (${n(words, L)} palabras + guion de ejemplo)`,
      metaDescription: `Un discurso de ${m} minutos tiene unas ${n(words, L)} palabras a 130 WPM. Consulta el presupuesto de palabras para seis ritmos, el margen de escenario del 85 %, ${single} páginas a un espacio y un guion cronometrado para ensayar gratis en el navegador.`,
      h1: `¿Cuántas palabras tiene un discurso de ${m} minutos?`,
      heroAnswer: `Un **discurso de ${m} minutos tiene unas ${n(words, L)} palabras** a un ritmo medio de presentación de 130 palabras por minuto. Si hablas despacio y con intención a 100 WPM, ${n(slow, L)} palabras llenan el espacio; si aceleras a 160 WPM puedes llevar ${n(fast, L)}. Son ${single} páginas a un espacio o ${double} a doble espacio. Escribe ${n(buf, L)} palabras — el 85 % del presupuesto — para que las pausas y las reacciones del público no te hagan pasarte. Comprueba tu propio ritmo con la [calculadora de tiempo de habla](/) antes de cerrar el guion.`,
      anchorForms: [
        `cuantas palabras discurso ${m} minutos`,
        `palabras por minuto discurso ${m} minutos`,
        `ejemplo discurso ${m} minutos`
      ],
      faqSubject: `discurso de ${m} minutos`,
      faqs: [
        {
          q: `¿Cuántas palabras tiene un discurso de ${m} minutos?`,
          a: `Unas ${n(words, L)} palabras a 130 palabras por minuto, el ritmo en el que suelen quedarse quienes hablan con claridad ante un público. Calcula ${n(slow, L)} palabras si hablas despacio o esperas aplausos, y hasta ${n(fast, L)} si hablas rápido.`
        },
        {
          q: `¿Cuántas páginas son un discurso de ${m} minutos?`,
          a: `${single} páginas a un espacio o ${double} a doble espacio en 12 pt Arial o Times New Roman con márgenes de 1 pulgada. Eso supone 500 palabras por página a un espacio y 250 por página a doble espacio, la convención estándar de manuscrito.`
        },
        {
          q: `¿Cuántas veces debería ensayar un discurso de ${m} minutos?`,
          a: `Léelo en voz alta al menos tres veces y cronometra cada pasada. La lectura silenciosa va a unas 230 palabras por minuto, cerca de un 75 % más rápida que hablar, así que una lectura mental no te dice nada sobre la duración real. Apunta a ${sayTime(code, (buf / 130) * 60)} en lugar de los ${m} minutos completos, para que quepa una pausa que funcione.`
        },
        {
          q: `¿Bastan ${m} minutos para ${page.useCase}?`,
          a: `Sí. ${capitalise(page.scenario)} es el uso habitual de esta duración, y ${m} minutos admiten con holgura una idea central, una prueba y un cierre claro. El problema nunca es la falta de tiempo, sino intentar sostener dos ideas a la vez y no aterrizar ninguna.`
        }
      ],
      answer: [
        `La aritmética es sencilla y merece memorizarse: **palabras ÷ 130 = minutos**. Un espacio de ${m} minutos admite, por tanto, ${n(words, L)} palabras a un ritmo medio de negocios. Esos mismos ${m} minutos van de ${n(slow, L)} palabras a un ritmo medido de 100 WPM hasta ${n(fast, L)} palabras a un pitch rápido de 160 WPM: una diferencia de ${n(fast - slow, L)} palabras que depende por completo de la entrega, no del contenido.`,
        `En términos de manuscrito son ${single} páginas a un espacio o ${double} a doble espacio, la forma práctica de juzgar un borrador ya escrito. Apunta a ${n(buf, L)} palabras en vez de ${n(words, L)}: el ${BUFFER_PERCENT} % que dejas libre absorbe la pausa tras la primera frase, la risa que no habías previsto y la diapositiva que carga un instante tarde.`
      ],
      tips: [
        {
          h3: `Estructura para ${page.useCase}`,
          body: `Abre con la idea en una frase, dedica el centro a una sola prueba y cierra con la acción que quieres. Para esta duración esa forma son unas ${n(Math.round(words * 0.12), L)} palabras de apertura, ${n(Math.round(words * 0.7), L)} de cuerpo y ${n(Math.round(words * 0.18), L)} de cierre. Marca una pausa deliberada tras la primera frase: es la forma más barata de frenar el subidón de adrenalina que lleva a los ponentes a 150+ WPM.`
        },
        {
          h3: `Páginas, párrafos y diapositivas para ${m} minutos`,
          body: `Con ${single} páginas a un espacio conviene usar unos ${page.paragraphs} párrafos y ${page.slides} diapositivas. La regla de una diapositiva cada 45–60 segundos significa que una charla de ${m} minutos admite como máximo ${page.slides}; más allá, el tiempo medio por diapositiva baja de 45 segundos, la atención se fragmenta y la presentación acaba marcando tu ritmo en lugar de al revés.`
        },
        {
          h3: `Por qué recortar a ${n(buf, L)} palabras (la regla del ${BUFFER_PERCENT} %)`,
          body: `La lectura ensayada es siempre más rápida que la entrega en vivo. La diferencia no es solo los nervios: respirar, cambiar de diapositiva, una risa, un sorbo de agua, una pregunta desde la tercera fila. Escribir el ${BUFFER_PERCENT} % del presupuesto — ${n(buf, L)} palabras en vez de ${n(words, L)} — recupera unos ${sayTime(code, (words - buf) / 130 * 60)} de holgura, y esa es la diferencia entre terminar con aplausos y terminar mirando un cronómetro en rojo.`
        }
      ]
    },

    pt: {
      title: `Quantas palavras tem um discurso de ${m} minutos? (${n(words, L)} palavras + roteiro de exemplo)`,
      metaDescription: `Um discurso de ${m} minutos tem cerca de ${n(words, L)} palavras a 130 WPM. Veja o orçamento de palavras para seis ritmos, a margem de palco de 85%, ${single} páginas de espaço simples e um roteiro cronometrado para ensaiar grátis no navegador.`,
      h1: `Quantas palavras tem um discurso de ${m} minutos?`,
      heroAnswer: `Um **discurso de ${m} minutos tem cerca de ${n(words, L)} palavras** a um ritmo médio de apresentação de 130 palavras por minuto. Falando devagar e com intenção a 100 WPM, ${n(slow, L)} palavras preenchem o espaço; acelerando para 160 WPM, você leva ${n(fast, L)}. Isso equivale a ${single} páginas de espaço simples ou ${double} de espaço duplo. Escreva ${n(buf, L)} palavras — 85% do orçamento — para que as pausas e as reações da plateia não estourem o tempo. Meça o seu próprio ritmo na [calculadora de tempo de fala](/) antes de fechar o roteiro.`,
      anchorForms: [
        `quantas palavras discurso ${m} minutos`,
        `palavras por minuto discurso ${m} minutos`,
        `exemplo de discurso ${m} minutos`
      ],
      faqSubject: `discurso de ${m} minutos`,
      faqs: [
        {
          q: `Quantas palavras tem um discurso de ${m} minutos?`,
          a: `Cerca de ${n(words, L)} palavras a 130 palavras por minuto, o ritmo em que a maioria dos palestrantes se acomoda quando fala com clareza para uma plateia. Planeje ${n(slow, L)} palavras se fala devagar ou espera aplausos, e até ${n(fast, L)} se fala rápido.`
        },
        {
          q: `Quantas páginas tem um discurso de ${m} minutos?`,
          a: `${single} páginas de espaço simples ou ${double} de espaço duplo em 12 pt Arial ou Times New Roman com margens de 1 polegada. Isso presume 500 palavras por página de espaço simples e 250 por página de espaço duplo, a convenção padrão de manuscrito.`
        },
        {
          q: `Quantas vezes devo ensaiar um discurso de ${m} minutos?`,
          a: `Leia em voz alta pelo menos três vezes e cronometre cada passagem. A leitura silenciosa corre a cerca de 230 palavras por minuto, aproximadamente 75% mais rápida do que falar, então uma leitura mental não diz nada sobre a duração real. Mire em ${sayTime(code, (buf / 130) * 60)} em vez dos ${m} minutos completos, para sobrar espaço para uma pausa que funcione.`
        },
        {
          q: `${m} minutos bastam para ${page.useCase}?`,
          a: `Sim. ${capitalise(page.scenario)} é o uso padrão desta duração, e ${m} minutos acomodam com folga uma ideia central, uma evidência e um fechamento claro. O problema nunca é falta de tempo, mas tentar sustentar duas ideias concorrentes e não aterrissar nenhuma.`
        }
      ],
      answer: [
        `A aritmética é simples e vale memorizar: **palavras ÷ 130 = minutos**. Um espaço de ${m} minutos comporta, portanto, ${n(words, L)} palavras num ritmo médio de negócios. Esses mesmos ${m} minutos vão de ${n(slow, L)} palavras a um ritmo medido de 100 WPM até ${n(fast, L)} palavras num pitch rápido de 160 WPM — uma diferença de ${n(fast - slow, L)} palavras que depende inteiramente da entrega, não do conteúdo.`,
        `Em termos de manuscrito, são ${single} páginas de espaço simples ou ${double} de espaço duplo, a forma prática de avaliar um rascunho já escrito. Mire em ${n(buf, L)} palavras em vez de ${n(words, L)}: os ${BUFFER_PERCENT}% que você deixa livres absorvem a pausa depois da primeira frase, a risada que não estava no plano e o slide que carrega um instante atrasado.`
      ],
      tips: [
        {
          h3: `Estrutura para ${page.useCase}`,
          body: `Abra com a ideia em uma frase, use o meio para uma única evidência e feche com a ação que você quer. Para esta duração, essa forma são cerca de ${n(Math.round(words * 0.12), L)} palavras de abertura, ${n(Math.round(words * 0.7), L)} de corpo e ${n(Math.round(words * 0.18), L)} de fechamento. Marque uma pausa deliberada depois da primeira frase: é a forma mais barata de frear a descarga de adrenalina que leva palestrantes a 150+ WPM.`
        },
        {
          h3: `Páginas, parágrafos e slides para ${m} minutos`,
          body: `Com ${single} páginas de espaço simples, convém usar cerca de ${page.paragraphs} parágrafos e ${page.slides} slides. A regra de um slide a cada 45–60 segundos significa que uma fala de ${m} minutos comporta no máximo ${page.slides}; além disso, o tempo médio por slide cai abaixo de 45 segundos, a atenção se fragmenta e a apresentação passa a marcar o seu ritmo em vez do contrário.`
        },
        {
          h3: `Por que cortar para ${n(buf, L)} palavras (a regra dos ${BUFFER_PERCENT}%)`,
          body: `A leitura ensaiada é sempre mais rápida do que a entrega ao vivo. A diferença não é só nervosismo: respirar, trocar de slide, uma risada, um gole de água, uma pergunta da terceira fila. Escrever ${BUFFER_PERCENT}% do orçamento — ${n(buf, L)} palavras em vez de ${n(words, L)} — recupera cerca de ${sayTime(code, (words - buf) / 130 * 60)} de folga, e essa é a diferença entre terminar em aplausos e terminar olhando um cronômetro vermelho.`
        }
      ]
    }
  };

  return blocks[code];
}

/* ──────────────────────────────────────────────────────────────── words group */

function wordsContent(code, page) {
  const u = ui(code);
  const L = loc(code);
  const w = page.words;
  const base = page.baseSeconds;
  const stage = page.stageSeconds;
  const single = dec1(w / 500, L);
  const double = dec1(w / 250, L);
  const t = sayTime(code, base);
  const ts = sayTimeShort(code, base);

  const blocks = {
    en: {
      title: `How Long Does It Take to Speak ${n(w, L)} Words? (${t} + Calculator)`,
      metaDescription: `${n(w, L)} words takes about ${t} to speak at 130 WPM, or ${sayTime(code, stage)} on stage with pauses. See the timing at six paces, ${single} single-spaced pages, and rehearse the script free in your browser.`,
      h1: `How Long Does It Take to Speak ${n(w, L)} Words?`,
      heroAnswer: `**${n(w, L)} words takes about ${t} to speak** at a natural presentation pace of 130 words per minute — roughly ${ts}. Read it slowly at 100 WPM and it stretches to ${sayTime(code, w / 100 * 60)}; race through it at 160 WPM and you are done in ${sayTime(code, w / 160 * 60)}. On stage, allow ${sayTime(code, stage)} to cover pauses and reactions. That is ${single} single-spaced pages, or ${double} double-spaced. Convert any draft with the [words to minutes converter](/) before you rehearse.`,
      anchorForms: [
        `how long to speak ${n(w, L)} words`,
        `${n(w, L)} words to minutes`,
        `${n(w, L)} word speech length`
      ],
      faqSubject: `${n(w, L)}-word speech`,
      faqs: [
        {
          q: `How long does it take to speak ${n(w, L)} words?`,
          a: `About ${t} at 130 words per minute, the pace most people hold when presenting. At a slower 100 WPM it takes ${sayTime(code, w / 100 * 60)}, and at a quick 160 WPM ${sayTime(code, w / 160 * 60)}. Reading silently is much faster — around ${sayTime(code, w / 230 * 60)} at 230 WPM — so never judge duration from a silent read.`
        },
        {
          q: `How many pages is ${n(w, L)} words?`,
          a: `${single} single-spaced pages or ${double} double-spaced at 12 pt Arial or Times New Roman with 1-inch margins, assuming 500 words per single-spaced page and 250 per double-spaced. If your document uses a different font size or spacing, count the words rather than the pages.`
        },
        {
          q: `Should I allow extra time on stage?`,
          a: `Yes — add about 15%. ${n(w, L)} words rehearsed at 130 WPM becomes ${sayTime(code, stage)} once you account for breathing, a slide change, laughter, and the beat of silence after a point lands. That extra ${sayTime(code, stage - base)} is what stops a ${t} script from overrunning a tight slot.`
        },
        {
          q: `What is ${n(w, L)} words good for?`,
          a: `${capitalise(page.useCase)}. It is also a useful milestone when you are trimming a longer draft: if your slot allows ${n(w, L)} words and you have written ${n(Math.round(w * 1.4), L)}, you already know you need to cut roughly ${n(Math.round(w * 0.4), L)} words before you rehearse.`
        }
      ],
      answer: [
        `**Words ÷ 130 = minutes**, so ${n(w, L)} words runs ${t} at the average presentation pace. The span is wide: the same text takes ${sayTime(code, w / 100 * 60)} delivered slowly and ${sayTime(code, w / 160 * 60)} delivered fast. That ${n(Math.round(w / 100 * 60 - w / 160 * 60), L)}-second spread is why two speakers with the same script finish at very different times, and why timing your own read is more useful than any average.`,
        `Silent reading is a trap here. At 230 WPM your eyes cover ${n(w, L)} words in ${sayTime(code, w / 230 * 60)}, which feels comfortable and tells you nothing about speaking time. Always time a spoken run. In manuscript terms ${n(w, L)} words is ${single} single-spaced pages, a useful cross-check when a submission limit is expressed in pages rather than words.`
      ],
      tips: [
        {
          h3: `Pacing ${n(w, L)} words for ${page.useCase}`,
          body: `This length suits ${page.useCase}. At 130 WPM you have ${t} of speech, so budget about ${n(Math.round(w * 0.12), L)} words to open, ${n(Math.round(w * 0.7), L)} for the substance, and ${n(Math.round(w * 0.18), L)} to close. Mark where you intend to pause: a two-second beat after a key sentence costs almost nothing on the page and buys the audience the time to absorb it.`
        },
        {
          h3: `Pages, paragraphs and slides for ${n(w, L)} words`,
          body: `Expect ${single} single-spaced pages or ${double} double-spaced, which at normal paragraph length is roughly ${Math.max(2, Math.round(w / 110))} paragraphs. For slides, ${n(w, L)} words spans about ${t} of talking, so ${Math.max(2, Math.round(base / 55))} to ${Math.max(3, Math.round(base / 45))} slides keeps dwell time in the 45–60 second band where attention holds.`
        },
        {
          h3: `Why ${n(w, L)} words becomes ${sayTime(code, stage)} on stage`,
          body: `Studios and rehearsal rooms are quieter and faster than a stage. The 15% addition — ${sayTime(code, stage - base)} on top of ${t} — covers the laugh you did not write, the slide that loads late, the breath before a difficult sentence, and the moment of silence you deliberately leave after your strongest line. Without it, a script that times perfectly in private runs long in public.`
        }
      ]
    },

    hi: {
      title: `${n(w, L)} शब्द बोलने में कितना समय लगता है? (${t} + कैलकुलेटर)`,
      metaDescription: `130 WPM पर ${n(w, L)} शब्द बोलने में लगभग ${t} लगते हैं, और मंच पर ठहराव सहित ${sayTime(code, stage)}। छह गतियों पर समय, ${single} सिंगल-स्पेस पेज देखें और ब्राउज़र में मुफ़्त रिहर्सल करें।`,
      h1: `${n(w, L)} शब्द बोलने में कितना समय लगता है?`,
      heroAnswer: `स्वाभाविक प्रेज़ेंटेशन गति 130 शब्द प्रति मिनट पर **${n(w, L)} शब्द बोलने में लगभग ${t} लगते हैं** — करीब ${ts}। धीरे 100 WPM पर पढ़ें तो ${sayTime(code, w / 100 * 60)} तक खिंच जाता है; 160 WPM पर दौड़ाएँ तो ${sayTime(code, w / 160 * 60)} में खत्म। मंच पर ठहराव और प्रतिक्रियाओं के लिए ${sayTime(code, stage)} रखें। यह ${single} सिंगल-स्पेस पेज या ${double} डबल-स्पेस पेज है। रिहर्सल से पहले अपना ड्राफ़्ट [शब्द-से-मिनट कनवर्टर](/) में डालें।`,
      anchorForms: [
        `${n(w, L)} शब्द बोलने में कितना समय`,
        `${n(w, L)} शब्द कितने मिनट`,
        `${n(w, L)} शब्द का भाषण कितना लंबा`
      ],
      faqSubject: `${n(w, L)} शब्दों का भाषण`,
      faqs: [
        {
          q: `${n(w, L)} शब्द बोलने में कितना समय लगता है?`,
          a: `130 शब्द प्रति मिनट पर लगभग ${t} — यही गति ज़्यादातर लोग प्रेज़ेंटेशन देते समय बनाए रखते हैं। धीमी 100 WPM पर ${sayTime(code, w / 100 * 60)} और तेज़ 160 WPM पर ${sayTime(code, w / 160 * 60)}। चुपचाप पढ़ना बहुत तेज़ होता है — 230 WPM पर करीब ${sayTime(code, w / 230 * 60)} — इसलिए मन में पढ़कर समय का अंदाज़ा कभी न लगाएँ।`
        },
        {
          q: `${n(w, L)} शब्द कितने पेज होते हैं?`,
          a: `12 pt Arial या Times New Roman और 1 इंच मार्जिन में ${single} सिंगल-स्पेस पेज या ${double} डबल-स्पेस पेज, यानी सिंगल-स्पेस पेज पर 500 शब्द और डबल-स्पेस पेज पर 250 शब्द। अगर आपके दस्तावेज़ का फ़ॉन्ट या स्पेसिंग अलग है तो पेज नहीं, शब्द गिनें।`
        },
        {
          q: `मंच पर अतिरिक्त समय रखना चाहिए?`,
          a: `हाँ — करीब 15% जोड़ें। 130 WPM पर रिहर्स किए गए ${n(w, L)} शब्द मंच पर ${sayTime(code, stage)} बन जाते हैं, क्योंकि साँस, स्लाइड बदलाव, हँसी और एक बात पूरी होने के बाद का ठहराव जुड़ जाता है। यही अतिरिक्त ${sayTime(code, stage - base)} तंग स्लॉट में स्क्रिप्ट को समय से आगे जाने से रोकता है।`
        },
        {
          q: `${n(w, L)} शब्द किस काम आते हैं?`,
          a: `${capitalise(page.useCase)}। लंबा ड्राफ़्ट छोटा करते समय भी यह उपयोगी पैमाना है: अगर स्लॉट में ${n(w, L)} शब्द आते हैं और आपने ${n(Math.round(w * 1.4), L)} लिख दिए हैं, तो रिहर्सल से पहले करीब ${n(Math.round(w * 0.4), L)} शब्द घटाने होंगे।`
        }
      ],
      answer: [
        `**शब्द ÷ 130 = मिनट**, इसलिए औसत प्रेज़ेंटेशन गति पर ${n(w, L)} शब्द ${t} चलते हैं। यह दायरा बड़ा है: वही पाठ धीरे बोलने पर ${sayTime(code, w / 100 * 60)} और तेज़ बोलने पर ${sayTime(code, w / 160 * 60)} लेता है। ${n(Math.round(w / 100 * 60 - w / 160 * 60), L)} सेकंड का यह फ़र्क़ ही बताता है कि एक ही स्क्रिप्ट लेकर दो वक्ता अलग-अलग समय पर खत्म क्यों होते हैं — और अपनी गति नापना किसी औसत से ज़्यादा काम का क्यों है।`,
        `चुपचाप पढ़ना यहाँ धोखा देता है। 230 WPM पर आपकी आँखें ${n(w, L)} शब्द ${sayTime(code, w / 230 * 60)} में पार कर लेती हैं, जो आरामदायक लगता है पर बोलने के समय के बारे में कुछ नहीं बताता। हमेशा ज़ोर से पढ़कर समय नापें। पांडुलिपि के हिसाब से ${n(w, L)} शब्द ${single} सिंगल-स्पेस पेज हैं, जो तब काम आता है जब सीमा पेजों में तय हो।`
      ],
      tips: [
        {
          h3: `${page.useCase} के लिए ${n(w, L)} शब्द की गति`,
          body: `यह अवधि ${page.useCase} के लिए उपयुक्त है। 130 WPM पर आपके पास ${t} बोलने का समय है, इसलिए करीब ${n(Math.round(w * 0.12), L)} शब्द शुरुआत, ${n(Math.round(w * 0.7), L)} मुख्य बात और ${n(Math.round(w * 0.18), L)} समापन पर रखें। जहाँ ठहरना है वह चिह्नित करें: किसी अहम वाक्य के बाद दो सेकंड का ठहराव पेज पर लगभग मुफ़्त है और दर्शकों को उसे पचाने का समय देता है।`
        },
        {
          h3: `${n(w, L)} शब्दों के लिए पेज, पैराग्राफ़ और स्लाइड`,
          body: `${single} सिंगल-स्पेस पेज या ${double} डबल-स्पेस पेज अपेक्षित हैं, जो सामान्य पैराग्राफ़ लंबाई पर करीब ${Math.max(2, Math.round(w / 110))} पैराग्राफ़ बनते हैं। स्लाइड के लिए, ${n(w, L)} शब्द करीब ${t} की बातचीत है, इसलिए ${Math.max(2, Math.round(base / 55))} से ${Math.max(3, Math.round(base / 45))} स्लाइड रखने पर हर स्लाइड पर 45–60 सेकंड का समय बना रहता है।`
        },
        {
          h3: `मंच पर ${n(w, L)} शब्द ${sayTime(code, stage)} क्यों बन जाते हैं`,
          body: `रिहर्सल की जगह मंच से शांत और तेज़ होती है। यह 15% — ${t} के ऊपर ${sayTime(code, stage - base)} — उस हँसी को सँभालता है जो आपने नहीं लिखी, उस स्लाइड को जो देर से खुलती है, कठिन वाक्य से पहले की साँस को, और उस ठहराव को जो आप अपनी सबसे मज़बूत पंक्ति के बाद जानबूझकर छोड़ते हैं। इसके बिना अकेले में सही समय देने वाली स्क्रिप्ट सार्वजनिक रूप से लंबी पड़ जाती है।`
        }
      ]
    },

    de: {
      title: `Wie lange dauert es, ${n(w, L)} Wörter zu sprechen? (${t} + Rechner)`,
      metaDescription: `${n(w, L)} Wörter dauern bei 130 WPM etwa ${t}, auf der Bühne mit Pausen ${sayTime(code, stage)}. Sehen Sie die Zeit für sechs Tempi, ${single} einzeilige Seiten, und proben Sie das Skript kostenlos im Browser.`,
      h1: `Wie lange dauert es, ${n(w, L)} Wörter zu sprechen?`,
      heroAnswer: `**${n(w, L)} Wörter dauern bei einem natürlichen Vortragstempo von 130 Wörtern pro Minute etwa ${t}** — rund ${ts}. Langsam mit 100 WPM gelesen dehnt sich das auf ${sayTime(code, w / 100 * 60)}; bei flotten 160 WPM sind Sie in ${sayTime(code, w / 160 * 60)} fertig. Auf der Bühne rechnen Sie mit ${sayTime(code, stage)} für Pausen und Reaktionen. Das sind ${single} einzeilig oder ${double} zweizeilig beschriebene Seiten. Rechnen Sie jeden Entwurf im [Wörter-in-Minuten-Rechner](/) um, bevor Sie proben.`,
      anchorForms: [
        `wie lange ${n(w, L)} wörter sprechen`,
        `${n(w, L)} wörter in minuten`,
        `${n(w, L)} wörter rede länge`
      ],
      faqSubject: `Rede mit ${n(w, L)} Wörtern`,
      faqs: [
        {
          q: `Wie lange dauert es, ${n(w, L)} Wörter zu sprechen?`,
          a: `Etwa ${t} bei 130 Wörtern pro Minute — das Tempo, das die meisten beim Präsentieren halten. Bei langsameren 100 WPM dauert es ${sayTime(code, w / 100 * 60)}, bei zügigen 160 WPM ${sayTime(code, w / 160 * 60)}. Stilles Lesen ist viel schneller — rund ${sayTime(code, w / 230 * 60)} bei 230 WPM —, daher sollten Sie die Dauer nie nach einem stillen Durchlauf beurteilen.`
        },
        {
          q: `Wie viele Seiten sind ${n(w, L)} Wörter?`,
          a: `${single} einzeilig oder ${double} zweizeilig beschriebene Seiten in 12 pt Arial oder Times New Roman mit 1-Zoll-Rändern, bei 500 Wörtern pro einzeiliger und 250 Wörtern pro zweizeiliger Seite. Wenn Ihr Dokument andere Schriftgrößen oder Abstände nutzt, zählen Sie Wörter statt Seiten.`
        },
        {
          q: `Sollte ich auf der Bühne mehr Zeit einplanen?`,
          a: `Ja — etwa 15 % mehr. ${n(w, L)} Wörter, mit 130 WPM geprobt, werden auf der Bühne zu ${sayTime(code, stage)}, sobald Atem, Folienwechsel, Lachen und der Moment der Stille nach einem gelungenen Punkt dazukommen. Diese zusätzlichen ${sayTime(code, stage - base)} verhindern, dass ein ${t}-Skript einen engen Slot überzieht.`
        },
        {
          q: `Wofür sind ${n(w, L)} Wörter geeignet?`,
          a: `${capitalise(page.useCase)}. Es ist auch ein nützlicher Richtwert beim Kürzen eines längeren Entwurfs: Wenn Ihr Slot ${n(w, L)} Wörter zulässt und Sie ${n(Math.round(w * 1.4), L)} geschrieben haben, wissen Sie schon, dass vor der Probe rund ${n(Math.round(w * 0.4), L)} Wörter weg müssen.`
        }
      ],
      answer: [
        `**Wörter ÷ 130 = Minuten**, also laufen ${n(w, L)} Wörter bei durchschnittlichem Vortragstempo ${t}. Die Spanne ist breit: Derselbe Text braucht langsam vorgetragen ${sayTime(code, w / 100 * 60)} und schnell vorgetragen ${sayTime(code, w / 160 * 60)}. Diese ${n(Math.round(w / 100 * 60 - w / 160 * 60), L)} Sekunden Unterschied erklären, warum zwei Redner mit demselben Skript sehr unterschiedlich lange brauchen — und warum das Messen des eigenen Vortrags mehr bringt als jeder Durchschnitt.`,
        `Stilles Lesen ist hier eine Falle. Bei 230 WPM erfassen Ihre Augen ${n(w, L)} Wörter in ${sayTime(code, w / 230 * 60)}, was sich angenehm anfühlt und nichts über die Sprechzeit aussagt. Messen Sie immer einen gesprochenen Durchlauf. Im Manuskript sind ${n(w, L)} Wörter ${single} einzeilige Seiten — eine nützliche Gegenprobe, wenn ein Limit in Seiten statt Wörtern angegeben ist.`
      ],
      tips: [
        {
          h3: `Tempo für ${n(w, L)} Wörter bei ${page.useCase}`,
          body: `Diese Länge eignet sich für ${page.useCase}. Bei 130 WPM haben Sie ${t} Sprechzeit, planen Sie also rund ${n(Math.round(w * 0.12), L)} Wörter für den Einstieg, ${n(Math.round(w * 0.7), L)} für die Substanz und ${n(Math.round(w * 0.18), L)} für den Schluss. Markieren Sie, wo Sie pausieren wollen: Zwei Sekunden nach einem Kernsatz kosten auf dem Papier fast nichts und geben dem Publikum Zeit, ihn aufzunehmen.`
        },
        {
          h3: `Seiten, Absätze und Folien für ${n(w, L)} Wörter`,
          body: `Rechnen Sie mit ${single} einzeiligen oder ${double} zweizeiligen Seiten, was bei normaler Absatzlänge etwa ${Math.max(2, Math.round(w / 110))} Absätzen entspricht. Für Folien: ${n(w, L)} Wörter umfassen etwa ${t} Redezeit, daher halten ${Math.max(2, Math.round(base / 55))} bis ${Math.max(3, Math.round(base / 45))} Folien die Verweildauer im Bereich von 45–60 Sekunden, in dem Aufmerksamkeit trägt.`
        },
        {
          h3: `Warum aus ${n(w, L)} Wörtern auf der Bühne ${sayTime(code, stage)} werden`,
          body: `Proberäume sind ruhiger und schneller als eine Bühne. Die 15 % — ${sayTime(code, stage - base)} zusätzlich zu ${t} — decken das Lachen, das Sie nicht geschrieben haben, die Folie, die zu spät lädt, den Atemzug vor einem schwierigen Satz und die Stille, die Sie nach Ihrer stärksten Zeile bewusst setzen. Ohne sie läuft ein Skript, das privat perfekt passt, öffentlich über.`
        }
      ]
    },

    es: {
      title: `¿Cuánto se tarda en decir ${n(w, L)} palabras? (${t} + calculadora)`,
      metaDescription: `${n(w, L)} palabras se dicen en unos ${t} a 130 WPM, o ${sayTime(code, stage)} en escenario con pausas. Consulta el tiempo para seis ritmos, ${single} páginas a un espacio y ensaya el guion gratis en tu navegador.`,
      h1: `¿Cuánto se tarda en decir ${n(w, L)} palabras?`,
      heroAnswer: `**${n(w, L)} palabras se dicen en unos ${t}** a un ritmo natural de presentación de 130 palabras por minuto — aproximadamente ${ts}. Leído despacio a 100 WPM se estira hasta ${sayTime(code, w / 100 * 60)}; a 160 WPM terminas en ${sayTime(code, w / 160 * 60)}. En escenario, reserva ${sayTime(code, stage)} para pausas y reacciones. Son ${single} páginas a un espacio o ${double} a doble espacio. Convierte cualquier borrador en el [conversor de palabras a minutos](/) antes de ensayar.`,
      anchorForms: [
        `cuanto se tarda en decir ${n(w, L)} palabras`,
        `${n(w, L)} palabras en minutos`,
        `duracion discurso ${n(w, L)} palabras`
      ],
      faqSubject: `discurso de ${n(w, L)} palabras`,
      faqs: [
        {
          q: `¿Cuánto se tarda en decir ${n(w, L)} palabras?`,
          a: `Unos ${t} a 130 palabras por minuto, el ritmo que la mayoría mantiene al presentar. A un ritmo más lento de 100 WPM tarda ${sayTime(code, w / 100 * 60)}, y a 160 WPM ${sayTime(code, w / 160 * 60)}. La lectura silenciosa es mucho más rápida — unos ${sayTime(code, w / 230 * 60)} a 230 WPM —, así que nunca calcules la duración con una lectura mental.`
        },
        {
          q: `¿Cuántas páginas son ${n(w, L)} palabras?`,
          a: `${single} páginas a un espacio o ${double} a doble espacio en 12 pt Arial o Times New Roman con márgenes de 1 pulgada, suponiendo 500 palabras por página a un espacio y 250 a doble espacio. Si tu documento usa otro cuerpo o interlineado, cuenta palabras en vez de páginas.`
        },
        {
          q: `¿Debería reservar tiempo extra en escenario?`,
          a: `Sí: añade un 15 %. ${n(w, L)} palabras ensayadas a 130 WPM se convierten en ${sayTime(code, stage)} cuando cuentas la respiración, un cambio de diapositiva, las risas y el silencio tras una idea que aterriza. Esos ${sayTime(code, stage - base)} extra son lo que impide que un guion de ${t} desborde un espacio ajustado.`
        },
        {
          q: `¿Para qué sirven ${n(w, L)} palabras?`,
          a: `${capitalise(page.useCase)}. También es una referencia útil al recortar un borrador largo: si tu espacio admite ${n(w, L)} palabras y has escrito ${n(Math.round(w * 1.4), L)}, ya sabes que hay que quitar unas ${n(Math.round(w * 0.4), L)} antes de ensayar.`
        }
      ],
      answer: [
        `**Palabras ÷ 130 = minutos**, así que ${n(w, L)} palabras ocupan ${t} a un ritmo medio de presentación. El abanico es amplio: el mismo texto tarda ${sayTime(code, w / 100 * 60)} dicho despacio y ${sayTime(code, w / 160 * 60)} dicho rápido. Esa diferencia de ${n(Math.round(w / 100 * 60 - w / 160 * 60), L)} segundos explica por qué dos personas con el mismo guion acaban en momentos muy distintos, y por qué medir tu propia lectura sirve más que cualquier promedio.`,
        `La lectura silenciosa engaña. A 230 WPM tus ojos recorren ${n(w, L)} palabras en ${sayTime(code, w / 230 * 60)}, lo que resulta cómodo y no dice nada sobre el tiempo hablado. Cronometra siempre una pasada en voz alta. En términos de manuscrito, ${n(w, L)} palabras son ${single} páginas a un espacio, una comprobación útil cuando el límite está en páginas y no en palabras.`
      ],
      tips: [
        {
          h3: `Ritmo para ${n(w, L)} palabras en ${page.useCase}`,
          body: `Esta duración encaja con ${page.useCase}. A 130 WPM tienes ${t} de habla, así que reserva unas ${n(Math.round(w * 0.12), L)} palabras para abrir, ${n(Math.round(w * 0.7), L)} para el contenido y ${n(Math.round(w * 0.18), L)} para cerrar. Marca dónde piensas pausar: dos segundos tras una frase clave casi no cuestan en el papel y le dan al público tiempo para absorberla.`
        },
        {
          h3: `Páginas, párrafos y diapositivas para ${n(w, L)} palabras`,
          body: `Cuenta con ${single} páginas a un espacio o ${double} a doble espacio, que con párrafos de longitud normal son unos ${Math.max(2, Math.round(w / 110))} párrafos. En diapositivas, ${n(w, L)} palabras abarcan unos ${t} de charla, así que entre ${Math.max(2, Math.round(base / 55))} y ${Math.max(3, Math.round(base / 45))} mantienen el tiempo por diapositiva en la franja de 45–60 segundos donde la atención se sostiene.`
        },
        {
          h3: `Por qué ${n(w, L)} palabras se convierten en ${sayTime(code, stage)} en escenario`,
          body: `Las salas de ensayo son más silenciosas y rápidas que un escenario. El 15 % adicional — ${sayTime(code, stage - base)} sobre ${t} — cubre la risa que no escribiste, la diapositiva que carga tarde, la respiración antes de una frase difícil y el silencio que dejas a propósito tras tu mejor línea. Sin eso, un guion que en privado da el tiempo exacto se pasa en público.`
        }
      ]
    },

    pt: {
      title: `Quanto tempo leva para falar ${n(w, L)} palavras? (${t} + calculadora)`,
      metaDescription: `${n(w, L)} palavras levam cerca de ${t} para falar a 130 WPM, ou ${sayTime(code, stage)} no palco com pausas. Veja o tempo em seis ritmos, ${single} páginas de espaço simples e ensaie o roteiro grátis no navegador.`,
      h1: `Quanto tempo leva para falar ${n(w, L)} palavras?`,
      heroAnswer: `**${n(w, L)} palavras levam cerca de ${t} para falar** a um ritmo natural de apresentação de 130 palavras por minuto — aproximadamente ${ts}. Lido devagar a 100 WPM, estica para ${sayTime(code, w / 100 * 60)}; a 160 WPM você termina em ${sayTime(code, w / 160 * 60)}. No palco, reserve ${sayTime(code, stage)} para pausas e reações. São ${single} páginas de espaço simples ou ${double} de espaço duplo. Converta qualquer rascunho no [conversor de palavras para minutos](/) antes de ensaiar.`,
      anchorForms: [
        `quanto tempo para falar ${n(w, L)} palavras`,
        `${n(w, L)} palavras em minutos`,
        `duração discurso ${n(w, L)} palavras`
      ],
      faqSubject: `discurso de ${n(w, L)} palavras`,
      faqs: [
        {
          q: `Quanto tempo leva para falar ${n(w, L)} palavras?`,
          a: `Cerca de ${t} a 130 palavras por minuto, o ritmo que a maioria mantém ao apresentar. A 100 WPM leva ${sayTime(code, w / 100 * 60)}, e a 160 WPM ${sayTime(code, w / 160 * 60)}. A leitura silenciosa é bem mais rápida — cerca de ${sayTime(code, w / 230 * 60)} a 230 WPM —, então nunca avalie a duração por uma leitura mental.`
        },
        {
          q: `Quantas páginas são ${n(w, L)} palavras?`,
          a: `${single} páginas de espaço simples ou ${double} de espaço duplo em 12 pt Arial ou Times New Roman com margens de 1 polegada, presumindo 500 palavras por página de espaço simples e 250 por página de espaço duplo. Se o seu documento usa outro corpo ou espaçamento, conte palavras em vez de páginas.`
        },
        {
          q: `Devo reservar tempo extra no palco?`,
          a: `Sim — acrescente cerca de 15%. ${n(w, L)} palavras ensaiadas a 130 WPM viram ${sayTime(code, stage)} no palco quando você conta a respiração, a troca de slide, as risadas e o silêncio depois de uma ideia que aterrissa. Esses ${sayTime(code, stage - base)} extras são o que impede um roteiro de ${t} de estourar um espaço apertado.`
        },
        {
          q: `Para que servem ${n(w, L)} palavras?`,
          a: `${capitalise(page.useCase)}. Também é uma referência útil ao cortar um rascunho longo: se o seu espaço admite ${n(w, L)} palavras e você escreveu ${n(Math.round(w * 1.4), L)}, já sabe que precisa remover cerca de ${n(Math.round(w * 0.4), L)} antes de ensaiar.`
        }
      ],
      answer: [
        `**Palavras ÷ 130 = minutos**, então ${n(w, L)} palavras ocupam ${t} a um ritmo médio de apresentação. O intervalo é amplo: o mesmo texto leva ${sayTime(code, w / 100 * 60)} dito devagar e ${sayTime(code, w / 160 * 60)} dito rápido. Essa diferença de ${n(Math.round(w / 100 * 60 - w / 160 * 60), L)} segundos explica por que duas pessoas com o mesmo roteiro terminam em momentos bem distintos, e por que medir a sua própria leitura vale mais do que qualquer média.`,
        `A leitura silenciosa engana. A 230 WPM os seus olhos percorrem ${n(w, L)} palavras em ${sayTime(code, w / 230 * 60)}, o que parece confortável e não diz nada sobre o tempo falado. Cronometre sempre uma passagem em voz alta. Em termos de manuscrito, ${n(w, L)} palavras são ${single} páginas de espaço simples, uma conferência útil quando o limite está em páginas e não em palavras.`
      ],
      tips: [
        {
          h3: `Ritmo para ${n(w, L)} palavras em ${page.useCase}`,
          body: `Esta duração combina com ${page.useCase}. A 130 WPM você tem ${t} de fala, então reserve cerca de ${n(Math.round(w * 0.12), L)} palavras para abrir, ${n(Math.round(w * 0.7), L)} para o conteúdo e ${n(Math.round(w * 0.18), L)} para fechar. Marque onde pretende pausar: dois segundos depois de uma frase-chave quase não custam no papel e dão à plateia tempo para absorver.`
        },
        {
          h3: `Páginas, parágrafos e slides para ${n(w, L)} palavras`,
          body: `Conte com ${single} páginas de espaço simples ou ${double} de espaço duplo, o que com parágrafos de tamanho normal dá cerca de ${Math.max(2, Math.round(w / 110))} parágrafos. Em slides, ${n(w, L)} palavras cobrem cerca de ${t} de fala, então entre ${Math.max(2, Math.round(base / 55))} e ${Math.max(3, Math.round(base / 45))} mantêm o tempo por slide na faixa de 45–60 segundos em que a atenção se sustenta.`
        },
        {
          h3: `Por que ${n(w, L)} palavras viram ${sayTime(code, stage)} no palco`,
          body: `Salas de ensaio são mais silenciosas e rápidas que um palco. Os 15% adicionais — ${sayTime(code, stage - base)} sobre ${t} — cobrem a risada que você não escreveu, o slide que carrega atrasado, a respiração antes de uma frase difícil e o silêncio que você deixa de propósito depois da sua melhor linha. Sem isso, um roteiro que no privado dá o tempo exato passa do limite em público.`
        }
      ]
    }
  };

  return blocks[code];
}

function capitalise(text) {
  const s = String(text);
  if (!s) return s;
  // Avoid lower-casing the rest for languages where that would break proper nouns.
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Build the full locale payload for one page. */
export function buildContent(rawCode, rawPage, kind) {
  const code = rawCode;
  // Accept either naming convention for the paragraph/slide hints so a caller
  // cannot accidentally leak `undefined` into visible prose.
  const page = {
    ...rawPage,
    paragraphs: rawPage.paragraphs ?? rawPage.paragraphCount ?? '2–3',
    slides: rawPage.slides ?? rawPage.slideCount ?? '2–3'
  };
  return kind === 'minutes' ? minutesContent(code, page) : wordsContent(code, page);
}
