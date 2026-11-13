// Per-locale phrasebook.
//
// The bulk of every page's `sections` object is identical across pages apart from
// the number being addressed: matrix column headers, calculator labels, the stage
// buffer paragraph, the CTA, the footnote. Translating those once per locale and
// composing per page keeps terminology consistent across all 15 pages and avoids
// 60 hand-typed copies drifting apart.
//
// Page-unique prose (heroAnswer, answer paragraphs, tips items, FAQs) lives in
// content-i18n.mjs instead.

export const PHRASES = {
  en: {
    crumbsMiddle: 'Speech Length Guides',
    crumbMinutes: '{n}-Minute Speech Word Count',
    crumbWords: '{n} Words to Minutes',
    answerHeading: 'The short answer',
    calcHeadingMinutes: '{n}-Minute Word Budget Calculator',
    calcHeadingWords: 'Speaking Time Calculator for {n} Words',
    privateTagMinutes: 'Locked to {n} minutes',
    privateTagWords: 'Locked to {n} words',
    scenarioLabel: 'Scenario',
    customOption: 'Custom pace…',
    paceLabel: 'Your pace:',
    budgetLabelMinutes: 'Word budget for {n}:00',
    budgetLabelWords: 'Speaking time for {n} words',
    readoutBeforeMinutes: '85% stage buffer (with pauses, applause & slide changes):',
    readoutAfterMinutes: '· This leaves your {n}-minute slot ~15 seconds of breathing room instead of a timed overrun.',
    readoutBeforeWords: 'Real stage time (+15% for pauses, laughter & slide changes):',
    readoutAfterWords: '· Rehearsed reading runs ~15% faster than performed delivery, so plan for the longer figure.',
    scenarios: [
      { wpm: 100, label: 'Wedding Toast · 100 WPM' },
      { wpm: 115, label: 'Academic Lecture · 115 WPM' },
      { wpm: 130, label: 'Business Presentation · 130 WPM' },
      { wpm: 145, label: 'Podcast / Storytelling · 145 WPM' },
      { wpm: 160, label: 'Fast Pitch / Debate · 160 WPM' }
    ],
    matrixHeadingMinutes: '{n}-minute pacing & page-count matrix',
    matrixHeadingWords: 'Speaking time for {n} words at each pace',
    matrixFootnote:
      'Page counts use standard manuscript formatting: 12 pt Arial or Times New Roman, 1-inch margins, 500 words per single-spaced page and 250 words per double-spaced page.',
    columns: [
      { label: 'Speaking Speed' },
      { label: 'Words in {n} Minutes', wordsLabel: 'Time to Speak {n} Words' },
      { label: '85% Stage Buffer', sub: 'with pauses', wordsLabel: 'Real Stage Time', wordsSub: '+15% pauses' },
      { label: 'Single-Spaced Pages', sub: '500 w/p' },
      { label: 'Double-Spaced Pages', sub: '250 w/p' },
      { label: 'Best Scenario' }
    ],
    paceNames: ['Slow', 'Deliberate', 'Average', 'Conversational', 'Fast'],
    faqHeadingMinutes: '{n}-minute speech FAQs',
    faqHeadingWords: '{n}-word speech FAQs',
    relatedHeading: 'Related speech length guides',
    ctaHeadingMinutes: 'Time your own {n}-minute script',
    ctaHeadingWords: 'Time your own {n}-word script',
    ctaBody:
      'Paste your draft into the [speech time calculator](/) to convert words to minutes, set a target duration and get your exact word budget, then rehearse in the [live teleprompter and practice timer](/). Everything runs in your browser and nothing is uploaded.',
    sampleScriptHeading: 'A timed {n}-minute sample script',
    sampleScriptHeadingWords: 'A timed sample script for {n} words',
    outlineHeading: 'Minute-by-minute outline for a {n}-minute talk',
    outlineHeadingWords: 'Minute-by-minute outline for {n} words',
    calibrationHeading: '60-second pacing calibration',
    calibrationIntro:
      'Before you build the full {label}, read this 260-word calibration passage aloud at your natural pace and let the timer tell you your real WPM. Every number on this page assumes 130 WPM; your own pace is the only one that matters.',
    rehearseButton: 'Rehearse This Script in Live Teleprompter & Speech Timer →',
    rehearseNote: 'Loads the script into the calculator on this device. Nothing is uploaded.',
    hubHeading: 'Complete Speech Time & Word Count Reference Guides',
    hubMinutes: 'Speech Duration Guides',
    hubWords: 'Word Count to Time Guides',
    pagesHeading: 'How Many Pages & Paragraphs is a {n}-Minute Speech?',
    pagesHeadingWords: 'How Many Pages & Paragraphs are {n} Words?',
    slidesHeading: 'How Many Slides Should You Use?',
    bufferHeading: 'The 85% Stage Pacing Rule'
  },

  hi: {
    crumbsMiddle: 'भाषण-लंबाई गाइड',
    crumbMinutes: '{n}-मिनट के भाषण की शब्द-संख्या',
    crumbWords: '{n} शब्द कितने मिनट में',
    answerHeading: 'संक्षेप में उत्तर',
    calcHeadingMinutes: '{n}-मिनट शब्द-बजट कैलकुलेटर',
    calcHeadingWords: '{n} शब्दों के लिए समय कैलकुलेटर',
    privateTagMinutes: '{n} मिनट पर सेट',
    privateTagWords: '{n} शब्दों पर सेट',
    scenarioLabel: 'परिदृश्य',
    customOption: 'अपनी गति…',
    paceLabel: 'आपकी गति:',
    budgetLabelMinutes: '{n}:00 के लिए शब्द-बजट',
    budgetLabelWords: '{n} शब्दों का बोलने का समय',
    readoutBeforeMinutes: '85% स्टेज बफ़र (ठहराव, तालियाँ और स्लाइड बदलाव सहित):',
    readoutAfterMinutes: '· इससे आपके {n}-मिनट स्लॉट में समय से आगे निकलने के बजाय लगभग 15 सेकंड की साँस लेने की जगह बचती है।',
    readoutBeforeWords: 'असली स्टेज समय (ठहराव, हँसी और स्लाइड बदलाव के लिए +15%):',
    readoutAfterWords: '· रिहर्सल की गई रीडिंग मंच पर बोलने से लगभग 15% तेज़ होती है, इसलिए लंबे आँकड़े की योजना बनाएँ।',
    scenarios: [
      { wpm: 100, label: 'शादी का टोस्ट · 100 WPM' },
      { wpm: 115, label: 'अकादमिक व्याख्यान · 115 WPM' },
      { wpm: 130, label: 'बिज़नेस प्रेज़ेंटेशन · 130 WPM' },
      { wpm: 145, label: 'पॉडकास्ट / कहानी · 145 WPM' },
      { wpm: 160, label: 'तेज़ पिच / डिबेट · 160 WPM' }
    ],
    matrixHeadingMinutes: '{n}-मिनट की गति और पेज-संख्या सारणी',
    matrixHeadingWords: '{n} शब्दों का बोलने का समय, हर गति पर',
    matrixFootnote:
      'पेज की गणना मानक पांडुलिपि प्रारूप पर है: 12 pt Arial या Times New Roman, 1 इंच मार्जिन, सिंगल-स्पेस पेज पर 500 शब्द और डबल-स्पेस पेज पर 250 शब्द।',
    columns: [
      { label: 'बोलने की गति' },
      { label: '{n} मिनट में शब्द', wordsLabel: '{n} शब्द बोलने का समय' },
      { label: '85% स्टेज बफ़र', sub: 'ठहराव सहित', wordsLabel: 'असली स्टेज समय', wordsSub: '+15% ठहराव' },
      { label: 'सिंगल-स्पेस पेज', sub: '500 शब्द/पेज' },
      { label: 'डबल-स्पेस पेज', sub: '250 शब्द/पेज' },
      { label: 'सबसे उपयुक्त परिदृश्य' }
    ],
    paceNames: ['धीमी', 'सोच-समझकर', 'औसत', 'बातचीत जैसी', 'तेज़'],
    faqHeadingMinutes: '{n}-मिनट के भाषण के सवाल',
    faqHeadingWords: '{n} शब्दों के भाषण के सवाल',
    relatedHeading: 'संबंधित स्पीच लेंथ गाइड',
    ctaHeadingMinutes: 'अपनी {n}-मिनट की स्क्रिप्ट का समय नापें',
    ctaHeadingWords: 'अपनी {n} शब्दों की स्क्रिप्ट का समय नापें',
    ctaBody:
      'अपना ड्राफ़्ट [स्पीच टाइम कैलकुलेटर](/) में चिपकाएँ, शब्दों को मिनट में बदलें, लक्ष्य अवधि सेट करें और अपना सटीक शब्द-बजट पाएँ, फिर [लाइव टेलीप्रॉम्प्टर और प्रैक्टिस टाइमर](/) में रिहर्सल करें। सब कुछ आपके ब्राउज़र में चलता है और कुछ भी अपलोड नहीं होता।',
    sampleScriptHeading: '{n} मिनट का समयबद्ध नमूना भाषण',
    sampleScriptHeadingWords: '{n} शब्दों का समयबद्ध नमूना भाषण',
    outlineHeading: '{n} मिनट के भाषण की मिनट-दर-मिनट रूपरेखा',
    outlineHeadingWords: '{n} शब्दों की मिनट-दर-मिनट रूपरेखा',
    calibrationHeading: '60-सेकंड गति अंशांकन',
    calibrationIntro:
      'पूरा {label} बनाने से पहले यह 260 शब्दों का अंशांकन पाठ अपनी स्वाभाविक गति से ज़ोर से पढ़ें और टाइमर से अपनी असली WPM जानें। इस पेज के सभी आँकड़े 130 WPM मानते हैं; सिर्फ़ आपकी अपनी गति मायने रखती है।',
    rehearseButton: 'इस स्क्रिप्ट को लाइव टेलीप्रॉम्प्टर और स्पीच टाइमर में दोहराएँ →',
    rehearseNote: 'स्क्रिप्ट इस डिवाइस के कैलकुलेटर में लोड होती है। कुछ भी अपलोड नहीं होता।',
    hubHeading: 'संपूर्ण स्पीच टाइम और शब्द-संख्या संदर्भ गाइड',
    hubMinutes: 'भाषण अवधि गाइड',
    hubWords: 'शब्द-संख्या से समय गाइड',
    pagesHeading: '{n} मिनट का भाषण कितने पेज और पैराग्राफ़ का होता है?',
    pagesHeadingWords: '{n} शब्द कितने पेज और पैराग्राफ़ हैं?',
    slidesHeading: 'आपको कितनी स्लाइड्स इस्तेमाल करनी चाहिए?',
    bufferHeading: '85% स्टेज पेसिंग नियम'
  },

  de: {
    crumbsMiddle: 'Ratgeber zu Redelängen',
    crumbMinutes: 'Wortzahl für eine {n}-Minuten-Rede',
    crumbWords: '{n} Wörter in Minuten',
    answerHeading: 'Die kurze Antwort',
    calcHeadingMinutes: 'Wortbudget-Rechner für {n} Minuten',
    calcHeadingWords: 'Sprechzeit-Rechner für {n} Wörter',
    privateTagMinutes: 'Auf {n} Minuten festgelegt',
    privateTagWords: 'Auf {n} Wörter festgelegt',
    scenarioLabel: 'Szenario',
    customOption: 'Eigenes Tempo…',
    paceLabel: 'Ihr Tempo:',
    budgetLabelMinutes: 'Wortbudget für {n}:00',
    budgetLabelWords: 'Sprechzeit für {n} Wörter',
    readoutBeforeMinutes: '85 % Bühnen-Puffer (mit Pausen, Applaus & Folienwechsel):',
    readoutAfterMinutes: '· Das lässt Ihrem {n}-Minuten-Slot rund 15 Sekunden Luft statt eines zeitlichen Überziehers.',
    readoutBeforeWords: 'Echte Bühnenzeit (+15 % für Pausen, Lachen & Folienwechsel):',
    readoutAfterWords: '· Geprobtes Lesen ist rund 15 % schneller als der Vortrag, planen Sie also den längeren Wert.',
    scenarios: [
      { wpm: 100, label: 'Hochzeitsrede · 100 WPM' },
      { wpm: 115, label: 'Akademischer Vortrag · 115 WPM' },
      { wpm: 130, label: 'Business-Präsentation · 130 WPM' },
      { wpm: 145, label: 'Podcast / Storytelling · 145 WPM' },
      { wpm: 160, label: 'Kurzpitch / Debatte · 160 WPM' }
    ],
    matrixHeadingMinutes: 'Tempo- und Seitenmatrix für {n} Minuten',
    matrixHeadingWords: 'Sprechzeit für {n} Wörter je Tempo',
    matrixFootnote:
      'Seitenzahlen nach Standard-Manuskriptformat: 12 pt Arial oder Times New Roman, 1-Zoll-Ränder, 500 Wörter pro einzeilig und 250 Wörter pro zweizeilig beschriebener Seite.',
    columns: [
      { label: 'Sprechtempo' },
      { label: 'Wörter in {n} Minuten', wordsLabel: 'Zeit für {n} Wörter' },
      { label: '85 % Bühnen-Puffer', sub: 'mit Pausen', wordsLabel: 'Echte Bühnenzeit', wordsSub: '+15 % Pausen' },
      { label: 'Einzeilige Seiten', sub: '500 W/S' },
      { label: 'Zweizeilige Seiten', sub: '250 W/S' },
      { label: 'Bestes Szenario' }
    ],
    paceNames: ['Langsam', 'Bewusst', 'Durchschnitt', 'Gesprächig', 'Schnell'],
    faqHeadingMinutes: 'Häufige Fragen zur {n}-Minuten-Rede',
    faqHeadingWords: 'Häufige Fragen zu {n} Wörtern',
    relatedHeading: 'Weitere Ratgeber zu Redelängen',
    ctaHeadingMinutes: 'Messen Sie Ihr eigenes {n}-Minuten-Skript',
    ctaHeadingWords: 'Messen Sie Ihr eigenes Skript mit {n} Wörtern',
    ctaBody:
      'Fügen Sie Ihren Entwurf in den [Sprechzeit-Rechner](/) ein, rechnen Sie Wörter in Minuten um, setzen Sie eine Zieldauer und erhalten Sie Ihr genaues Wortbudget – und proben Sie dann im [Live-Teleprompter mit Übungstimer](/). Alles läuft im Browser, nichts wird hochgeladen.',
    sampleScriptHeading: 'Ein getimtes Beispielskript für {n} Minuten',
    sampleScriptHeadingWords: 'Ein getimtes Beispielskript für {n} Wörter',
    outlineHeading: 'Minute-für-Minute-Gliederung für einen {n}-Minuten-Vortrag',
    outlineHeadingWords: 'Minute-für-Minute-Gliederung für {n} Wörter',
    calibrationHeading: '60-Sekunden-Tempo-Kalibrierung',
    calibrationIntro:
      'Bevor Sie die vollständige {label} aufbauen, lesen Sie diesen 260-Wörter-Kalibrierungstext laut in Ihrem natürlichen Tempo und lassen Sie sich vom Timer Ihre echte WPM zeigen. Alle Zahlen auf dieser Seite gehen von 130 WPM aus; nur Ihr eigenes Tempo zählt.',
    rehearseButton: 'Dieses Skript im Live-Teleprompter & Sprechtimer proben →',
    rehearseNote: 'Lädt das Skript in den Rechner auf diesem Gerät. Nichts wird hochgeladen.',
    hubHeading: 'Vollständige Referenz zu Sprechzeit und Wortzahl',
    hubMinutes: 'Ratgeber zur Rededauer',
    hubWords: 'Ratgeber Wortzahl zu Zeit',
    pagesHeading: 'Wie viele Seiten und Absätze hat eine {n}-Minuten-Rede?',
    pagesHeadingWords: 'Wie viele Seiten und Absätze sind {n} Wörter?',
    slidesHeading: 'Wie viele Folien sollten Sie verwenden?',
    bufferHeading: 'Die 85-%-Bühnenregel'
  },

  es: {
    crumbsMiddle: 'Guías de duración de discursos',
    crumbMinutes: 'Palabras de un discurso de {n} minutos',
    crumbWords: '{n} palabras en minutos',
    answerHeading: 'La respuesta corta',
    calcHeadingMinutes: 'Calculadora de palabras para {n} minutos',
    calcHeadingWords: 'Calculadora de tiempo para {n} palabras',
    privateTagMinutes: 'Fijado en {n} minutos',
    privateTagWords: 'Fijado en {n} palabras',
    scenarioLabel: 'Escenario',
    customOption: 'Ritmo propio…',
    paceLabel: 'Tu ritmo:',
    budgetLabelMinutes: 'Presupuesto de palabras para {n}:00',
    budgetLabelWords: 'Tiempo de habla para {n} palabras',
    readoutBeforeMinutes: 'Margen de escenario del 85% (con pausas, aplausos y cambios de diapositiva):',
    readoutAfterMinutes: '· Esto deja unos 15 segundos de aire en tu espacio de {n} minutos en lugar de pasarte del tiempo.',
    readoutBeforeWords: 'Tiempo real en escenario (+15% por pausas, risas y cambios de diapositiva):',
    readoutAfterWords: '· La lectura ensayada va un 15% más rápida que la entrega en vivo, así que planifica la cifra mayor.',
    scenarios: [
      { wpm: 100, label: 'Brindis de boda · 100 WPM' },
      { wpm: 115, label: 'Conferencia académica · 115 WPM' },
      { wpm: 130, label: 'Presentación de negocios · 130 WPM' },
      { wpm: 145, label: 'Pódcast / narración · 145 WPM' },
      { wpm: 160, label: 'Pitch rápido / debate · 160 WPM' }
    ],
    matrixHeadingMinutes: 'Matriz de ritmo y páginas para {n} minutos',
    matrixHeadingWords: 'Tiempo de habla para {n} palabras en cada ritmo',
    matrixFootnote:
      'El recuento de páginas usa el formato de manuscrito estándar: 12 pt Arial o Times New Roman, márgenes de 1 pulgada, 500 palabras por página de interlineado sencillo y 250 por página de interlineado doble.',
    columns: [
      { label: 'Ritmo al hablar' },
      { label: 'Palabras en {n} minutos', wordsLabel: 'Tiempo para {n} palabras' },
      { label: 'Margen de escenario 85%', sub: 'con pausas', wordsLabel: 'Tiempo real en escenario', wordsSub: '+15% pausas' },
      { label: 'Páginas a un espacio', sub: '500 p/pág' },
      { label: 'Páginas a doble espacio', sub: '250 p/pág' },
      { label: 'Mejor escenario' }
    ],
    paceNames: ['Lento', 'Deliberado', 'Promedio', 'Conversacional', 'Rápido'],
    faqHeadingMinutes: 'Preguntas sobre el discurso de {n} minutos',
    faqHeadingWords: 'Preguntas sobre {n} palabras',
    relatedHeading: 'Guías relacionadas de duración de discursos',
    ctaHeadingMinutes: 'Mide tu propio guion de {n} minutos',
    ctaHeadingWords: 'Mide tu propio guion de {n} palabras',
    ctaBody:
      'Pega tu borrador en la [calculadora de tiempo de habla](/) para convertir palabras en minutos, fija una duración objetivo y obtén tu presupuesto exacto de palabras; después ensaya en el [teleprompter en vivo con temporizador](/). Todo funciona en tu navegador y no se sube nada.',
    sampleScriptHeading: 'Un guion de ejemplo cronometrado para {n} minutos',
    sampleScriptHeadingWords: 'Un guion de ejemplo cronometrado para {n} palabras',
    outlineHeading: 'Esquema minuto a minuto para una charla de {n} minutos',
    outlineHeadingWords: 'Esquema minuto a minuto para {n} palabras',
    calibrationHeading: 'Calibración de ritmo de 60 segundos',
    calibrationIntro:
      'Antes de construir la {label} completa, lee este pasaje de calibración de 260 palabras en voz alta a tu ritmo natural y deja que el temporizador te diga tu WPM real. Todas las cifras de esta página suponen 130 WPM; solo tu propio ritmo importa.',
    rehearseButton: 'Ensaya este guion en el teleprompter y temporizador en vivo →',
    rehearseNote: 'Carga el guion en la calculadora de este dispositivo. No se sube nada.',
    hubHeading: 'Guías completas de tiempo de habla y recuento de palabras',
    hubMinutes: 'Guías de duración del discurso',
    hubWords: 'Guías de palabras a tiempo',
    pagesHeading: '¿Cuántas páginas y párrafos tiene un discurso de {n} minutos?',
    pagesHeadingWords: '¿Cuántas páginas y párrafos son {n} palabras?',
    slidesHeading: '¿Cuántas diapositivas deberías usar?',
    bufferHeading: 'La regla de escenario del 85%'
  },

  pt: {
    crumbsMiddle: 'Guias de duração de fala',
    crumbMinutes: 'Palavras de um discurso de {n} minutos',
    crumbWords: '{n} palavras em minutos',
    answerHeading: 'A resposta curta',
    calcHeadingMinutes: 'Calculadora de palavras para {n} minutos',
    calcHeadingWords: 'Calculadora de tempo para {n} palavras',
    privateTagMinutes: 'Fixado em {n} minutos',
    privateTagWords: 'Fixado em {n} palavras',
    scenarioLabel: 'Cenário',
    customOption: 'Ritmo próprio…',
    paceLabel: 'Seu ritmo:',
    budgetLabelMinutes: 'Orçamento de palavras para {n}:00',
    budgetLabelWords: 'Tempo de fala para {n} palavras',
    readoutBeforeMinutes: 'Margem de palco de 85% (com pausas, aplausos e trocas de slide):',
    readoutAfterMinutes: '· Isso deixa cerca de 15 segundos de folga no seu espaço de {n} minutos em vez de estourar o tempo.',
    readoutBeforeWords: 'Tempo real de palco (+15% para pausas, risadas e trocas de slide):',
    readoutAfterWords: '· A leitura ensaiada é cerca de 15% mais rápida que a apresentação ao vivo, então planeje o número maior.',
    scenarios: [
      { wpm: 100, label: 'Brinde de casamento · 100 WPM' },
      { wpm: 115, label: 'Aula acadêmica · 115 WPM' },
      { wpm: 130, label: 'Apresentação de negócios · 130 WPM' },
      { wpm: 145, label: 'Podcast / narração · 145 WPM' },
      { wpm: 160, label: 'Pitch rápido / debate · 160 WPM' }
    ],
    matrixHeadingMinutes: 'Matriz de ritmo e páginas para {n} minutos',
    matrixHeadingWords: 'Tempo de fala para {n} palavras em cada ritmo',
    matrixFootnote:
      'A contagem de páginas usa o formato padrão de manuscrito: 12 pt Arial ou Times New Roman, margens de 1 polegada, 500 palavras por página de espaço simples e 250 por página de espaço duplo.',
    columns: [
      { label: 'Ritmo de fala' },
      { label: 'Palavras em {n} minutos', wordsLabel: 'Tempo para {n} palavras' },
      { label: 'Margem de palco 85%', sub: 'com pausas', wordsLabel: 'Tempo real de palco', wordsSub: '+15% pausas' },
      { label: 'Páginas espaço simples', sub: '500 p/pág' },
      { label: 'Páginas espaço duplo', sub: '250 p/pág' },
      { label: 'Melhor cenário' }
    ],
    paceNames: ['Lento', 'Deliberado', 'Médio', 'Conversacional', 'Rápido'],
    faqHeadingMinutes: 'Perguntas sobre o discurso de {n} minutos',
    faqHeadingWords: 'Perguntas sobre {n} palavras',
    relatedHeading: 'Guias relacionados de duração de fala',
    ctaHeadingMinutes: 'Meça seu próprio roteiro de {n} minutos',
    ctaHeadingWords: 'Meça seu próprio roteiro de {n} palavras',
    ctaBody:
      'Cole o seu rascunho na [calculadora de tempo de fala](/) para converter palavras em minutos, defina uma duração alvo e obtenha o seu orçamento exato de palavras; depois ensaie no [teleprompter ao vivo com cronômetro](/). Tudo roda no seu navegador e nada é enviado.',
    sampleScriptHeading: 'Um roteiro de exemplo cronometrado para {n} minutos',
    sampleScriptHeadingWords: 'Um roteiro de exemplo cronometrado para {n} palavras',
    outlineHeading: 'Esboço minuto a minuto para uma palestra de {n} minutos',
    outlineHeadingWords: 'Esboço minuto a minuto para {n} palavras',
    calibrationHeading: 'Calibração de ritmo de 60 segundos',
    calibrationIntro:
      'Antes de construir o {label} completo, leia esta passagem de calibração de 260 palavras em voz alta no seu ritmo natural e deixe o cronômetro mostrar o seu WPM real. Todos os números desta página assumem 130 WPM; só o seu ritmo importa.',
    rehearseButton: 'Ensaiar este roteiro no teleprompter e cronômetro ao vivo →',
    rehearseNote: 'Carrega o roteiro na calculadora deste dispositivo. Nada é enviado.',
    hubHeading: 'Guias completos de tempo de fala e contagem de palavras',
    hubMinutes: 'Guias de duração da fala',
    hubWords: 'Guias de palavras para tempo',
    pagesHeading: 'Quantas páginas e parágrafos tem um discurso de {n} minutos?',
    pagesHeadingWords: 'Quantas páginas e parágrafos são {n} palavras?',
    slidesHeading: 'Quantos slides você deve usar?',
    bufferHeading: 'A regra de palco de 85%'
  }
};

/** Fill {placeholders} in a phrasebook string. */
export function fill(template, values = {}) {
  return String(template).replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match
  );
}
