// Sample scripts, timed outlines, and the 60-second calibration passage.
//
// Spec §5 splits the 15 pages in two:
//   * short pages  → a complete, word-accurate script with [m:ss] markers
//   * long pages   → a minute-by-minute outline PLUS a 260-word calibration
//                    passage the speaker reads aloud to measure their real WPM
//
// The calibration passage is deliberately identical in structure across
// languages: the same 260-word target, so a speaker in any locale measures the
// same thing. It is not a literal translation of the English — each version is
// written natively to hit 260 words in that language's natural rhythm.

export const LONG_MINUTES = new Set([10, 15, 20]);
export const LONG_WORDS = new Set([750, 1000, 1500, 2000]);

/** True when the spec calls for a full script rather than an outline. */
export const wantsFullScript = (kind, value) =>
  kind === 'minutes' ? !LONG_MINUTES.has(value) : !LONG_WORDS.has(value);

/* ─────────────────────────────────────────────────────── calibration passages */

export const CALIBRATION = {
  en: `Let me tell you about the first time I tried to measure my own speaking pace, because I got it wrong in a way almost everyone gets it wrong. I recorded a three-minute talk, listened back, and discovered I had spoken for four minutes and eleven seconds. I had rehearsed it three times. I had timed it three times. And every time I ran long, because I was reading the script in my head instead of out loud, and my eyes move much faster than my mouth ever will.

That mistake taught me something worth more than any advice about confidence or posture. The only pace that matters is the one you actually perform at, not the one you assume you have. Averages help you plan, and every number on this page starts from one hundred and thirty words per minute, but a plan built on somebody else's average is a guess wearing a suit.

So here is what I want you to do. Read this aloud, at the speed you would use if a room of people were listening. Not your fastest reading voice, and not the careful voice you use for a phone number. Your real one. Then check the timer. Whatever number comes back is your pace, and it is the only figure you should use when you budget words for a script.

Most people land between one hundred and fifteen and one hundred and fifty. Some are slower, and that is fine. Some are much faster, which usually means nerves rather than habit. Either way, now you know. Everything else here is arithmetic, and arithmetic is the easy part.`,

  hi: `मैं आपको पहली बार अपनी बोलने की गति नापने की कहानी सुनाता हूँ, क्योंकि मैंने वही गलती की जो लगभग हर कोई करता है। मैंने तीन मिनट का भाषण रिकॉर्ड किया, वापस सुना, और पता चला कि मैंने चार मिनट ग्यारह सेकंड बोल दिया था। मैंने तीन बार रिहर्सल की थी और तीन बार समय नापा था। हर बार समय से आगे निकल गया, क्योंकि मैं स्क्रिप्ट मन में पढ़ रहा था, ज़ोर से नहीं — और आँखें मुँह से कहीं तेज़ चलती हैं।

उस गलती ने मुझे आत्मविश्वास या मुद्रा पर किसी भी सलाह से ज़्यादा काम की बात सिखाई। सिर्फ़ वही गति मायने रखती है जिस पर आप वास्तव में बोलते हैं, वह नहीं जिसका अनुमान लगाते हैं। औसत योजना बनाने के लिए उपयोगी है, और इस पेज का हर आँकड़ा एक सौ तीस शब्द प्रति मिनट से शुरू होता है, लेकिन किसी और के औसत पर बनी योजना सूट पहने हुए अंदाज़ा भर है।

तो मैं चाहता हूँ कि आप यह करें। इसे ज़ोर से पढ़ें, उसी गति से जिससे बोलेंगे जब एक कमरा सुन रहा हो। अपनी सबसे तेज़ पढ़ने की आवाज़ नहीं, और फ़ोन नंबर बताते समय वाली सतर्क आवाज़ नहीं। अपनी असली आवाज़। फिर टाइमर देखें। जो भी अंक आए, वही आपकी गति है, और स्क्रिप्ट के लिए शब्द तय करते समय सिर्फ़ वही इस्तेमाल करें।

ज़्यादातर लोग एक सौ पंद्रह से एक सौ पचास के बीच पहुँचते हैं। कुछ धीमे होते हैं, यह ठीक है। कुछ बहुत तेज़ होते हैं, जो आमतौर पर आदत नहीं घबराहट होती है। जो भी हो, अब आप जानते हैं। बाकी सब गणित है, और गणित आसान हिस्सा है।`,

  de: `Ich erzähle Ihnen von dem ersten Mal, als ich mein eigenes Sprechtempo messen wollte, weil ich es auf eine Weise falsch gemacht habe, die fast alle falsch machen. Ich nahm einen dreiminütigen Vortrag auf, hörte ihn mir an und stellte fest, dass ich vier Minuten und elf Sekunden gesprochen hatte. Ich hatte dreimal geprobt und dreimal die Zeit gemessen. Und jedes Mal war ich überzogen, weil ich das Skript im Kopf las statt laut, und meine Augen bewegen sich viel schneller als mein Mund es je tun wird.

Dieser Fehler hat mir etwas beigebracht, das mehr wert ist als jeder Ratschlag zu Selbstvertrauen oder Haltung. Nur das Tempo zählt, in dem Sie tatsächlich sprechen, nicht das, von dem Sie annehmen, dass Sie es haben. Durchschnittswerte helfen beim Planen, und jede Zahl auf dieser Seite beginnt bei einhundertdreißig Wörtern pro Minute, aber ein Plan auf dem Durchschnitt eines anderen ist eine Vermutung im Anzug.

Deshalb möchte ich, dass Sie Folgendes tun. Lesen Sie diesen Text laut, in dem Tempo, das Sie verwenden würden, wenn ein Raum voller Menschen zuhört. Nicht Ihre schnellste Lesestimme und nicht die vorsichtige Stimme für eine Telefonnummer. Ihre echte. Schauen Sie dann auf den Timer. Welche Zahl auch kommt, es ist Ihr Tempo, und es ist die einzige Zahl, mit der Sie Wörter für ein Skript einteilen sollten.

Die meisten landen zwischen einhundertfünfzehn und einhundertfünfzig. Manche sind langsamer, und das ist in Ordnung. Manche sind viel schneller, was meist Nervosität statt Gewohnheit bedeutet. Wie auch immer: Jetzt wissen Sie es. Alles Weitere ist Rechnen, und das Rechnen ist der leichte Teil.`,

  es: `Déjame contarte la primera vez que intenté medir mi propio ritmo al hablar, porque lo hice mal de una forma en la que casi todo el mundo lo hace mal. Grabé una charla de tres minutos, la escuché y descubrí que había hablado durante cuatro minutos y once segundos. La había ensayado tres veces y la había cronometrado tres veces. Y todas las veces me pasé, porque estaba leyendo el guion en mi cabeza en lugar de en voz alta, y mis ojos se mueven mucho más rápido de lo que mi boca lo hará jamás.

Ese error me enseñó algo que vale más que cualquier consejo sobre confianza o postura. Solo importa el ritmo al que realmente hablas, no el que supones que tienes. Los promedios sirven para planificar, y cada número de esta página parte de ciento treinta palabras por minuto, pero un plan construido sobre el promedio de otra persona es una suposición vestida con traje.

Así que esto es lo que quiero que hagas. Léelo en voz alta, a la velocidad que usarías si una sala llena de gente estuviera escuchando. No tu voz de lectura más rápida, ni la voz cuidadosa que usas para dictar un teléfono. La tuya de verdad. Luego mira el cronómetro. El número que aparezca es tu ritmo, y es la única cifra que deberías usar al calcular palabras para un guion.

La mayoría se queda entre ciento quince y ciento cincuenta. Algunos van más despacio, y está bien. Algunos van mucho más rápido, y eso suele significar nervios más que costumbre. En cualquier caso, ahora lo sabes. Todo lo demás es aritmética, y la aritmética es la parte fácil.`,

  pt: `Deixa eu contar a primeira vez que tentei medir o meu próprio ritmo de fala, porque errei de um jeito que quase todo mundo erra. Gravei uma fala de três minutos, ouvi de volta e descobri que havia falado quatro minutos e onze segundos. Tinha ensaiado três vezes e cronometrado três vezes. E todas as vezes passei do tempo, porque estava lendo o roteiro na cabeça em vez de em voz alta, e os meus olhos se movem muito mais rápido do que a minha boca jamais vai.

Esse erro me ensinou algo que vale mais do que qualquer conselho sobre confiança ou postura. Só importa o ritmo em que você realmente fala, não o que você supõe ter. Médias servem para planejar, e cada número desta página parte de cento e trinta palavras por minuto, mas um plano construído sobre a média de outra pessoa é um palpite vestido de terno.

Então é isto que quero que você faça. Leia em voz alta, na velocidade que usaria se uma sala cheia de gente estivesse ouvindo. Não a sua voz de leitura mais rápida, nem a voz cuidadosa que usa para ditar um telefone. A sua de verdade. Depois olhe o cronômetro. O número que aparecer é o seu ritmo, e é a única referência que você deveria usar ao calcular palavras para um roteiro.

A maioria fica entre cento e quinze e cento e cinquenta. Alguns vão mais devagar, e está tudo bem. Alguns vão bem mais rápido, e isso costuma significar nervosismo em vez de hábito. De todo modo, agora você sabe. Todo o resto é aritmética, e a aritmética é a parte fácil.`
};

/* ───────────────────────────────────────────── full scripts (short pages) */

// Each entry: { at: "m:ss", text: "…" }. publish.mjs computes word counts from
// the text, so these must read naturally rather than hit an exact tally.

export const SCRIPTS = {
  '1-minute-speech': {
    en: [
      { at: '0:00', text: 'Good morning. In the next sixty seconds I am going to ask you to do one thing that will feel small and turn out to be the most useful habit you build this year. Before you start any task you have been avoiding, say out loud what the first two minutes look like.' },
      { at: '0:20', text: 'I started doing this after a year of abandoned plans. What changed was not my discipline. It was the size of the ask. Cleaning the kitchen is overwhelming; wiping one counter is not. Writing a report is a wall; opening the document and typing the title is a step.' },
      { at: '0:42', text: 'So today, when you feel that familiar resistance, do not negotiate with the whole task. Name the two minutes, do them, and stop. If you want to keep going, keep going. If you stop, you still won. Thank you.' }
    ],
    hi: [
      { at: '0:00', text: 'सुप्रभात। अगले साठ सेकंड में मैं आपसे एक काम करने को कहूँगा जो छोटा लगेगा और इस साल आपकी सबसे उपयोगी आदत बन जाएगा। जो काम आप टाल रहे हैं, उसे शुरू करने से पहले ज़ोर से कहें कि पहले दो मिनट कैसे दिखेंगे।' },
      { at: '0:20', text: 'मैंने यह एक साल तक अधूरी योजनाओं के बाद शुरू किया। जो बदला वह मेरा अनुशासन नहीं था, माँग का आकार था। पूरी रसोई साफ़ करना भारी है; एक काउंटर पोंछना नहीं। रिपोर्ट लिखना दीवार है; दस्तावेज़ खोलकर शीर्षक टाइप करना एक कदम है।' },
      { at: '0:42', text: 'तो आज, जब वही रुकावट महसूस करें, पूरे काम से मोल-भाव न करें। दो मिनट बताएँ, करें, और रुक जाएँ। आगे बढ़ना चाहें तो बढ़ें। रुकें तो भी आप जीते। धन्यवाद।' }
    ],
    de: [
      { at: '0:00', text: 'Guten Morgen. In den nächsten sechzig Sekunden bitte ich Sie um eine Sache, die klein wirken wird und sich als die nützlichste Gewohnheit dieses Jahres erweisen wird. Bevor Sie eine Aufgabe beginnen, die Sie aufschieben, sagen Sie laut, wie die ersten zwei Minuten aussehen.' },
      { at: '0:20', text: 'Ich habe damit nach einem Jahr voller aufgegebener Pläne begonnen. Was sich änderte, war nicht meine Disziplin. Es war die Größe der Anforderung. Die Küche putzen ist überwältigend; eine Arbeitsfläche abwischen nicht. Einen Bericht schreiben ist eine Wand; das Dokument öffnen und den Titel tippen ist ein Schritt.' },
      { at: '0:42', text: 'Wenn Sie also heute diesen vertrauten Widerstand spüren, verhandeln Sie nicht mit der ganzen Aufgabe. Nennen Sie die zwei Minuten, tun Sie sie und hören Sie auf. Wenn Sie weitermachen wollen, machen Sie weiter. Wenn Sie aufhören, haben Sie gewonnen. Danke.' }
    ],
    es: [
      { at: '0:00', text: 'Buenos días. En los próximos sesenta segundos les voy a pedir una cosa que parecerá pequeña y resultará ser el hábito más útil que construyan este año. Antes de empezar cualquier tarea que estén evitando, digan en voz alta cómo son los primeros dos minutos.' },
      { at: '0:20', text: 'Empecé a hacerlo después de un año de planes abandonados. Lo que cambió no fue mi disciplina. Fue el tamaño de la petición. Limpiar la cocina es abrumador; pasar un trapo por una encimera no lo es. Escribir un informe es un muro; abrir el documento y escribir el título es un paso.' },
      { at: '0:42', text: 'Así que hoy, cuando sientan esa resistencia conocida, no negocien con la tarea entera. Nombren los dos minutos, háganlos y paren. Si quieren seguir, sigan. Si paran, aun así ganaron. Gracias.' }
    ],
    pt: [
      { at: '0:00', text: 'Bom dia. Nos próximos sessenta segundos vou pedir uma coisa que vai parecer pequena e vai acabar sendo o hábito mais útil que vocês constroem este ano. Antes de começar qualquer tarefa que estejam evitando, digam em voz alta como são os primeiros dois minutos.' },
      { at: '0:20', text: 'Comecei a fazer isso depois de um ano de planos abandonados. O que mudou não foi a minha disciplina. Foi o tamanho do pedido. Limpar a cozinha é esmagador; passar um pano numa bancada não é. Escrever um relatório é um muro; abrir o documento e digitar o título é um passo.' },
      { at: '0:42', text: 'Então hoje, quando sentirem aquela resistência conhecida, não negociem com a tarefa inteira. Nomeiem os dois minutos, façam-nos e parem. Se quiserem continuar, continuem. Se pararem, ainda assim ganharam. Obrigado.' }
    ]
  }
};

/* ─────────────────────────────────── timed outlines (long pages) */

// Structural beats as fractions of total runtime. Timestamps are computed from
// the page's actual duration at build time, so a 10-minute page and a 20-minute
// page get correct, evenly-scaled markers instead of the same fixed labels.
export const OUTLINES = {
  en: [
    { pct: 0, beat: 'Hook and promise', detail: 'One sentence that names the problem, plus a single sentence stating what the audience will be able to do by the end. No throat-clearing, no agenda slide.' },
    { pct: 0.08, beat: 'Why it matters now', detail: 'The stakes in concrete terms — a number, a cost, or a consequence the audience already recognises.' },
    { pct: 0.18, beat: 'The core claim', detail: 'State the one idea the whole talk rests on, plainly, before any evidence. If the audience remembers one thing, it should be this sentence.' },
    { pct: 0.32, beat: 'Evidence one', detail: 'A single piece of proof: a measured result, a case, a demonstration. One is enough; three compete for memory.' },
    { pct: 0.48, beat: 'Objection and answer', detail: 'Name the strongest counter-argument in the audience’s mind and answer it directly. Skipping this is why good talks fail to persuade.' },
    { pct: 0.66, beat: 'What changes for them', detail: 'Translate the claim into the audience’s own situation. Concrete, specific, and short.' },
    { pct: 0.84, beat: 'Second proof, if you have one', detail: 'Only now, after the objection is handled, add a second piece of evidence. Placed earlier it competes; placed here it confirms.' },
    { pct: 0.94, beat: 'The ask, then stop', detail: 'One action, stated once. Do not add a second request and do not summarise what you already said.' }
  ],
  hi: [
    { pct: 0, beat: 'हुक और वादा', detail: 'एक वाक्य जो समस्या बताए, और एक वाक्य जो कहे कि अंत तक दर्शक क्या कर पाएँगे। भूमिका या एजेंडा स्लाइड नहीं।' },
    { pct: 0.08, beat: 'अभी क्यों ज़रूरी है', detail: 'जोखिम ठोस रूप में — कोई आँकड़ा, लागत या ऐसा परिणाम जिसे दर्शक पहले से पहचानते हैं।' },
    { pct: 0.18, beat: 'मुख्य दावा', detail: 'पूरा भाषण जिस एक विचार पर टिका है, उसे प्रमाण से पहले सीधे कहें। अगर दर्शक एक बात याद रखें, तो यही वाक्य।' },
    { pct: 0.32, beat: 'पहला प्रमाण', detail: 'एक ही सबूत: मापा हुआ परिणाम, कोई उदाहरण या प्रदर्शन। एक काफ़ी है; तीन याददाश्त के लिए मुकाबला करते हैं।' },
    { pct: 0.48, beat: 'आपत्ति और उत्तर', detail: 'दर्शकों के मन की सबसे मज़बूत आपत्ति कहें और सीधे उत्तर दें। इसे छोड़ना ही अच्छे भाषणों के असफल होने की वजह है।' },
    { pct: 0.66, beat: 'उनके लिए क्या बदलता है', detail: 'दावे को दर्शकों की अपनी स्थिति में बदलकर बताएँ। ठोस, विशिष्ट और छोटा।' },
    { pct: 0.84, beat: 'दूसरा प्रमाण, अगर हो', detail: 'आपत्ति सँभालने के बाद ही दूसरा सबूत जोड़ें। पहले रखा गया सबूत मुकाबला करता है; यहाँ रखा गया पुष्टि करता है।' },
    { pct: 0.94, beat: 'आग्रह, फिर रुकें', detail: 'एक काम, एक बार। दूसरी माँग न जोड़ें और जो कह चुके हैं उसे दोहराएँ नहीं।' }
  ],
  de: [
    { pct: 0, beat: 'Einstieg und Versprechen', detail: 'Ein Satz, der das Problem benennt, plus ein Satz, der sagt, was das Publikum am Ende tun kann. Kein Vorgeplänkel, keine Agenda-Folie.' },
    { pct: 0.08, beat: 'Warum es jetzt zählt', detail: 'Der Einsatz in konkreten Zahlen — eine Zahl, ein Kostenpunkt oder eine Folge, die das Publikum bereits kennt.' },
    { pct: 0.18, beat: 'Die Kernaussage', detail: 'Nennen Sie die eine Idee, auf der der ganze Vortrag ruht, klar und vor jedem Beleg. Wenn das Publikum eines behält, dann diesen Satz.' },
    { pct: 0.32, beat: 'Erster Beleg', detail: 'Ein einziger Nachweis: ein Messergebnis, ein Fall, eine Demonstration. Eines genügt; drei konkurrieren ums Gedächtnis.' },
    { pct: 0.48, beat: 'Einwand und Antwort', detail: 'Benennen Sie den stärksten Gegeneinwand im Kopf des Publikums und beantworten Sie ihn direkt. Wer das überspringt, überzeugt nicht.' },
    { pct: 0.66, beat: 'Was sich für sie ändert', detail: 'Übersetzen Sie die Aussage in die Lage des Publikums. Konkret, spezifisch, kurz.' },
    { pct: 0.84, beat: 'Zweiter Beleg, falls vorhanden', detail: 'Erst jetzt, nach dem Einwand, einen zweiten Nachweis ergänzen. Früher platziert konkurriert er; hier bestätigt er.' },
    { pct: 0.94, beat: 'Die Bitte, dann Schluss', detail: 'Eine Handlung, einmal genannt. Keine zweite Bitte anhängen und nicht zusammenfassen, was Sie schon gesagt haben.' }
  ],
  es: [
    { pct: 0, beat: 'Gancho y promesa', detail: 'Una frase que nombre el problema y otra que diga qué podrá hacer el público al final. Sin preámbulos ni diapositiva de agenda.' },
    { pct: 0.08, beat: 'Por qué importa ahora', detail: 'Lo que está en juego en términos concretos: una cifra, un coste o una consecuencia que el público ya reconoce.' },
    { pct: 0.18, beat: 'La idea central', detail: 'Enuncia la única idea sobre la que descansa toda la charla, con claridad, antes de cualquier prueba. Si recuerdan una frase, debe ser esta.' },
    { pct: 0.32, beat: 'Primera prueba', detail: 'Una sola evidencia: un resultado medido, un caso, una demostración. Una basta; tres compiten por la memoria.' },
    { pct: 0.48, beat: 'Objeción y respuesta', detail: 'Nombra la objeción más fuerte que tiene el público en la cabeza y respóndela de frente. Omitirla es la razón por la que buenas charlas no convencen.' },
    { pct: 0.66, beat: 'Qué cambia para ellos', detail: 'Traduce la idea a la situación del público. Concreta, específica y breve.' },
    { pct: 0.84, beat: 'Segunda prueba, si la hay', detail: 'Solo ahora, tras responder la objeción, añade una segunda evidencia. Antes compite; aquí confirma.' },
    { pct: 0.94, beat: 'La petición, y parar', detail: 'Una acción, dicha una vez. No añadas una segunda petición ni resumas lo que ya dijiste.' }
  ],
  pt: [
    { pct: 0, beat: 'Gancho e promessa', detail: 'Uma frase que nomeia o problema e outra que diga o que a plateia poderá fazer ao final. Sem preâmbulo nem slide de agenda.' },
    { pct: 0.08, beat: 'Por que importa agora', detail: 'O que está em jogo em termos concretos: um número, um custo ou uma consequência que a plateia já reconhece.' },
    { pct: 0.18, beat: 'A ideia central', detail: 'Enuncie a única ideia sobre a qual toda a fala se apoia, com clareza, antes de qualquer prova. Se lembrarem de uma frase, deve ser esta.' },
    { pct: 0.32, beat: 'Primeira prova', detail: 'Uma única evidência: um resultado medido, um caso, uma demonstração. Uma basta; três competem pela memória.' },
    { pct: 0.48, beat: 'Objeção e resposta', detail: 'Nomeie a objeção mais forte na cabeça da plateia e responda diretamente. Ignorar isso é o motivo pelo qual boas falas não convencem.' },
    { pct: 0.66, beat: 'O que muda para eles', detail: 'Traduza a afirmação para a situação da plateia. Concreta, específica e curta.' },
    { pct: 0.84, beat: 'Segunda prova, se houver', detail: 'Só agora, depois de tratar a objeção, acrescente uma segunda evidência. Antes ela compete; aqui ela confirma.' },
    { pct: 0.94, beat: 'O pedido, e parar', detail: 'Uma ação, dita uma vez. Não acrescente um segundo pedido nem resuma o que já disse.' }
  ]
};

/** Convert an outline fraction to a "m:ss" marker for a given total duration. */
export function outlineTime(pct, minutes) {
  const total = Math.round(pct * minutes * 60);
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return `${mm}:${String(ss).padStart(2, '0')}`;
}
