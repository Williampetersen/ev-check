export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "callout"; title: string; text: string };

export type BlogFaq = { question: string; answer: string };

export type BlogPost = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  image: { src: string; alt: string };
  datePublished: string;
  dateModified: string;
  keywords: string[];
  readingTime: string;
  blocks: BlogBlock[];
  faqs: BlogFaq[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "test-batteriet-foer-du-koeber-brugt-elbil",
    title: "Skal du købe en brugt elbil? Test batteriet først",
    metaTitle: "Brugt elbil: Test batteriet før du køber",
    metaDescription:
      "Batteriet er den dyreste komponent i en brugt elbil. Læs hvorfor SoH betyder mere end kilometerstand, hvad et batteriskift koster, og hvordan du undgår de dyreste fejl.",
    excerpt:
      "Batteriet er bilens dyreste og vigtigste komponent. Her får du overblikket over SoH, rækkevidde, priser og de fejl, købere oftest laver.",
    image: {
      src: "/billide1.jpeg",
      alt: "Brugt elbil klar til batteritest før køb",
    },
    datePublished: "2026-01-12",
    dateModified: "2026-07-02",
    keywords: [
      "brugt elbil batteritest",
      "batteritest elbil",
      "SoH test elbil",
      "State of Health elbil",
      "elbil batteri pris",
      "tjekliste brugt elbil",
    ],
    readingTime: "8 min. læsning",
    blocks: [
      {
        type: "p",
        text: "Når du køber en brugt elbil, er batteriet ikke bare en almindelig reservedel. Det er bilens dyreste og vigtigste komponent. En elbil kan se flot ud, køre godt og have en pæn servicehistorik, men batteriets reelle tilstand kan stadig være svær at vurdere uden en professionel batteritest.",
      },
      {
        type: "p",
        text: "Hos EV-Check hjælper vi købere og sælgere med at få et mere klart billede af batteriets sundhed, før bilen skifter ejer. Vi bruger AVILOO-batteritest, som giver en uafhængig vurdering af batteriets State of Health, også kaldet SoH.",
      },
      {
        type: "p",
        text: "En batteritest kan ikke garantere, at en bil aldrig får problemer i fremtiden. Men den kan give dig vigtig dokumentation, bedre forhandlingsgrundlag og større tryghed, før du bruger mange penge på en brugt elbil.",
      },
      { type: "h2", text: "Hvorfor er batteriet så vigtigt i en brugt elbil?" },
      {
        type: "p",
        text: "I en benzin- eller dieselbil kigger man ofte på motor, gearkasse, kobling, turbo og servicehistorik. I en elbil er batteriet en af de vigtigste ting at kontrollere. Batteriet påvirker blandt andet:",
      },
      {
        type: "list",
        items: [
          "bilens rækkevidde",
          "bilens værdi",
          "opladningshastighed",
          "købsrisiko",
          "gensalgsværdi",
          "eventuelle fremtidige reparationsomkostninger",
        ],
      },
      {
        type: "p",
        text: "To elbiler kan have samme model, samme årgang og næsten samme kilometerstand, men stadig have forskellig batteritilstand. Det afhænger blandt andet af opladningsvaner, temperatur, kørselsmønster, software, batteritype og tidligere brug. Derfor er kilometerstand alene ikke nok.",
      },
      { type: "h2", text: "Hvad betyder SoH?" },
      {
        type: "p",
        text: "SoH betyder State of Health. På dansk kan man kalde det batteriets sundhedstilstand. Hvis et batteri havde 100 procent kapacitet som nyt, viser SoH hvor meget af batteriets oprindelige kapacitet der stadig er tilbage.",
      },
      {
        type: "table",
        headers: ["SoH", "Hvad det betyder"],
        rows: [
          ["100%", "Batteriet er tæt på ny tilstand"],
          ["95%", "Meget god batteritilstand"],
          ["90%", "Stadig normalt for mange brugte elbiler"],
          ["85%", "Kapacitetstab begynder at kunne mærkes"],
          ["80% eller lavere", "Bør undersøges nærmere før køb"],
        ],
      },
      {
        type: "p",
        text: "SoH er ikke det eneste tal, man skal se på, men det er et af de vigtigste.",
      },
      { type: "h2", text: "Sådan påvirker SoH rækkevidden" },
      {
        type: "p",
        text: "Hvis en elbil havde 400 km rækkevidde som ny, kan lavere batterikapacitet betyde lavere praktisk rækkevidde.",
      },
      {
        type: "table",
        headers: ["Batteriets SoH", "Teoretisk rækkevidde (bil med 400 km som ny)"],
        rows: [
          ["100%", "ca. 400 km"],
          ["95%", "ca. 380 km"],
          ["90%", "ca. 360 km"],
          ["85%", "ca. 340 km"],
          ["80%", "ca. 320 km"],
        ],
      },
      {
        type: "p",
        text: "Dette er kun et forenklet eksempel. Den reelle rækkevidde afhænger også af temperatur, dæk, hastighed, vind, kørestil, varmepumpe, kabinevarme og bilens software. Pointen er enkel: Selv et mindre kapacitetstab kan betyde mange kilometer mindre rækkevidde i hverdagen.",
      },
      { type: "h2", text: "Hvad kan et elbilbatteri koste?" },
      {
        type: "p",
        text: "Prisen på et elbilbatteri afhænger meget af bilmærke, model, batteristørrelse, reservedelspris, garanti, arbejdsløn og om hele batteriet eller kun enkelte moduler skal skiftes. Som grov tommelfingerregel kan et komplet batteriskift i Europa ofte ligge i et meget højt prisniveau.",
      },
      {
        type: "table",
        headers: ["Biltype", "Muligt prisniveau ved større batterireparation eller udskiftning"],
        rows: [
          ["Lille elbil", "ca. 50.000–90.000 kr."],
          ["Mellemklasse elbil", "ca. 80.000–140.000 kr."],
          ["Stor/premium elbil", "ca. 120.000–200.000+ kr."],
        ],
      },
      {
        type: "p",
        text: "Vigtigt: Det betyder ikke, at alle elbiler får brug for et nyt batteri. Mange batterier holder længe. Men fordi batteriet kan være meget dyrt, giver det mening at kontrollere tilstanden, før man køber bilen.",
      },
      { type: "h2", text: "De største fejl folk laver ved køb af brugt elbil" },
      {
        type: "list",
        ordered: true,
        items: [
          "De kigger kun på kilometerstand — kilometerstand er vigtig, men fortæller ikke hele historien.",
          "De stoler kun på bilens viste rækkevidde — displayet viser ikke nødvendigvis batteriets reelle sundhed.",
          "De glemmer batterigarantiens betingelser — garanti er ikke altid det samme som fuld sikkerhed.",
          "De tester først efter køb — så er det ofte for sent at bruge resultatet i forhandlingen.",
          "De sammenligner kun pris — den billigste bil kan være dyrere på lang sigt, hvis batteriet er i dårligere stand.",
        ],
      },
      { type: "h2", text: "Tjekliste før køb af brugt elbil" },
      {
        type: "list",
        items: [
          "Tjek bilens servicehistorik",
          "Tjek om bilen har haft skader",
          "Tjek batterigaranti",
          "Tjek opladningshistorik hvis muligt",
          "Spørg om tidligere brug",
          "Prøvekør bilen",
          "Tjek om rækkevidden virker realistisk",
          "Få lavet en batteritest",
          "Gennemgå rapporten",
          "Brug resultatet i din beslutning",
        ],
      },
      {
        type: "callout",
        title: "Test batteriet, før du skriver under",
        text: "Hos EV-Check kommer vi ud til dig på Sjælland og tester batteriet med AVILOO, så du får en uafhængig SoH-vurdering og PDF-rapport, du kan bruge i forhandlingen.",
      },
    ],
    faqs: [
      {
        question: "Hvad er en batteritest af en elbil?",
        answer:
          "En batteritest undersøger elbilens højvoltsbatteri og giver information om batteriets sundhed (SoH), kapacitet og tilstand, uafhængigt af bilens eget display.",
      },
      {
        question: "Hvad betyder SoH på en elbil?",
        answer:
          "SoH betyder State of Health og viser, hvor meget af batteriets oprindelige kapacitet der stadig er tilbage sammenlignet med, da det var nyt. 90-100% er normalt godt, mens 80% eller lavere bør undersøges nærmere.",
      },
      {
        question: "Kan jeg stole på bilens viste rækkevidde?",
        answer:
          "Ikke alene. Bilens viste rækkevidde afhænger af tidligere kørsel, temperatur og forbrug, og kan derfor snyde. Den viser ikke nødvendigvis batteriets reelle sundhed.",
      },
      {
        question: "Hvad kan det koste at skifte et elbilbatteri?",
        answer:
          "Et komplet batteriskift kan koste alt fra ca. 50.000 kr. for en lille elbil til over 200.000 kr. for en stor eller dyr premium-elbil, afhængigt af model, batteristørrelse og reparationstype.",
      },
    ],
  },
  {
    slug: "aviloo-batteritest-flash-og-premium-test",
    title: "Hvad er en AVILOO-batteritest? Flash Test vs. Premium Test",
    metaTitle: "AVILOO batteritest: Flash Test og Premium Test forklaret",
    metaDescription:
      "Se hvordan AVILOO-batteritesten fungerer, hvad den kontrollerer, og om du skal vælge Flash Test eller Premium Test til din elbil. Uafhængig SoH-vurdering fra EV-Check.dk.",
    excerpt:
      "AVILOO er den uafhængige testløsning, EV-Check bruger til at vurdere elbilbatterier. Her er forskellen på Flash Test og Premium Test, og hvad testen faktisk kontrollerer.",
    image: {
      src: "/billide2.jpeg",
      alt: "AVILOO batteritest tilsluttet elbil",
    },
    datePublished: "2026-02-04",
    dateModified: "2026-07-02",
    keywords: [
      "AVILOO batteritest",
      "AVILOO Flash Test",
      "AVILOO Premium Test",
      "elbil batteridiagnose",
      "hurtigopladning elbil batteri",
      "batteritest udstyr elbil",
    ],
    readingTime: "7 min. læsning",
    blocks: [
      {
        type: "p",
        text: "AVILOO er en uafhængig løsning til test og analyse af elbilbatterier. AVILOO arbejder med batteridiagnose og kan levere rapporter, der giver indsigt i batteriets tilstand. AVILOO-test bruges blandt andet til at vurdere batteriets State of Health, sammenligne med lignende køretøjer og give en mere objektiv dokumentation end en almindelig vurdering baseret på bilens display.",
      },
      {
        type: "p",
        text: "Hos EV-Check bruger vi AVILOO som en del af vores batteritest, så du kan få en mere professionel og uafhængig vurdering, uden at bilens batteripakke åbnes.",
      },
      { type: "h2", text: "Hvorfor er bilens egen rækkevidde ikke nok?" },
      {
        type: "p",
        text: "Mange kigger kun på bilens display og spørger: \"Hvor mange kilometer viser bilen ved 100% opladning?\" Det er en fejl. Bilens viste rækkevidde er ofte baseret på tidligere kørsel, temperatur, forbrug og software, og den kan ændre sig meget fra dag til dag.",
      },
      {
        type: "table",
        headers: ["Situation", "Hvorfor rækkevidden kan snyde"],
        rows: [
          ["Bilen har kørt langsomt i byen", "Displayet kan vise højere rækkevidde"],
          ["Bilen har kørt motorvej", "Displayet kan vise lavere rækkevidde"],
          ["Det er vinter", "Rækkevidden falder naturligt"],
          ["Bilen er nyopladet", "Tallet kan se bedre ud end den reelle kapacitet"],
          ["Sælger har nulstillet forbrug", "Rækkeviddetallet kan være misvisende"],
        ],
      },
      {
        type: "p",
        text: "Derfor er det bedre at få batteriet testet professionelt med udstyr, der kobler sig direkte på bilens diagnoseport i stedet for kun at aflæse displayet.",
      },
      { type: "h2", text: "Hvad kontrollerer en batteritest?" },
      {
        type: "list",
        items: [
          "batteriets State of Health",
          "batteriets kapacitet",
          "batteriets ydeevne",
          "mulige afvigelser",
          "sammenligning med lignende biler",
          "dokumentation til køber eller sælger",
        ],
      },
      {
        type: "p",
        text: "Den præcise rapport afhænger af bilmodel, testtype og datatilgængelighed.",
      },
      { type: "h2", text: "AVILOO Flash Test" },
      {
        type: "p",
        text: "Flash Test er en hurtig test, som kan give en vurdering af batteriets tilstand på kort tid. Den er især relevant, når man ønsker en hurtig, praktisk og uafhængig vurdering. Typiske situationer:",
      },
      {
        type: "list",
        items: [
          "før køb af brugt elbil",
          "før salg af elbil",
          "ved behov for hurtig dokumentation",
          "ved sammenligning af flere biler",
        ],
      },
      { type: "h2", text: "AVILOO Premium Test" },
      {
        type: "p",
        text: "Premium Test er mere omfattende og analyserer batteriet over en længere kørecyklus. Den kan give en dybere vurdering og er relevant, hvis man ønsker en mere detaljeret analyse. Typiske situationer:",
      },
      {
        type: "list",
        items: [
          "hvis bilen er dyr",
          "hvis der er mistanke om stort kapacitetstab",
          "hvis man ønsker mere detaljeret dokumentation",
          "hvis bilen skal sælges med stærkere dokumentation",
        ],
      },
      { type: "h2", text: "Hvilken test skal du vælge?" },
      {
        type: "table",
        headers: ["Situation", "Anbefalet løsning"],
        rows: [
          ["Du skal hurtigt vurdere en brugt elbil", "Flash Test"],
          ["Du sammenligner flere brugte elbiler", "Flash Test"],
          ["Du skal sælge din elbil med dokumentation", "Flash Test eller Premium"],
          ["Du har mistanke om alvorligt kapacitetstab", "Premium Test"],
          ["Du køber en dyr elbil", "Premium Test kan være relevant"],
          ["Du vil have mest mulig dokumentation", "Premium Test"],
        ],
      },
      {
        type: "p",
        text: "EV-Check kan hjælpe dig med at vælge den rigtige løsning afhængigt af bilen og situationen.",
      },
      { type: "h2", text: "Hvad kan skade eller slide på et elbilbatteri?" },
      {
        type: "p",
        text: "Alle batterier ældes over tid. Det er normalt. Men nogle forhold kan påvirke batteriet mere end andre.",
      },
      {
        type: "list",
        items: [
          "mange år med brug",
          "høj kilometerstand",
          "hyppig hurtigopladning",
          "meget høj eller lav temperatur",
          "ofte opladning til 100%",
          "ofte kørsel helt ned til meget lav batteriprocent",
          "lang tid med bilen parkeret ved 100% eller næsten 0%",
          "tung belastning",
          "software og batteristyring",
          "tidligere skader eller fejl",
        ],
      },
      {
        type: "p",
        text: "Det betyder ikke, at man aldrig må hurtiglade eller oplade til 100%. Men vaner over lang tid kan have betydning.",
      },
      { type: "h2", text: "Er hurtigopladning farligt for batteriet?" },
      {
        type: "p",
        text: "Hurtigopladning er ikke automatisk farligt. Moderne elbiler har batteristyring, som forsøger at beskytte batteriet. Men hvis en bil ofte hurtiglades, især ved høj temperatur eller fra meget lav til meget høj batteriprocent, kan det over tid påvirke batteriet mere end almindelig AC-opladning.",
      },
      {
        type: "list",
        items: [
          "hurtigopladning er fint på lange ture",
          "daglig opladning hjemme eller ved arbejde er ofte mere skånsom",
          "undgå at lade bilen stå længe på 100%, hvis det ikke er nødvendigt",
          "undgå at lade bilen stå længe næsten tom",
        ],
      },
      { type: "h2", text: "Er det dårligt at lade til 100%?" },
      {
        type: "p",
        text: "Det afhænger af batteritype og bilmodel. Nogle biler med LFP-batterier kan anbefale regelmæssig opladning til 100% for kalibrering. Andre batterityper trives ofte bedst ved daglig brug mellem cirka 20% og 80%. Derfor skal man følge bilproducentens anbefalinger. Men ved køb af brugt elbil er pointen denne: Du ved ikke altid, hvordan tidligere ejer har opladet bilen. Derfor er en batteritest relevant.",
      },
      {
        type: "callout",
        title: "Vælg den rigtige AVILOO-test til din bil",
        text: "EV-Check hjælper dig med at vælge mellem Flash Test og Premium Test, kommer ud til dig på Sjælland og forklarer resultatet, så du forstår hvad tallene betyder.",
      },
    ],
    faqs: [
      {
        question: "Hvad er AVILOO?",
        answer:
          "AVILOO er en uafhængig testløsning til diagnose af elbilbatterier. Den bruges til at vurdere State of Health, sammenligne med lignende køretøjer og give objektiv dokumentation af batteriets tilstand.",
      },
      {
        question: "Er AVILOO uafhængig?",
        answer:
          "Ja. AVILOO er en uafhængig batteritestløsning, som bruges til at analysere og dokumentere elbilbatteriers tilstand uden at være knyttet til en bestemt bilproducent eller sælger.",
      },
      {
        question: "Hvad er forskellen på Flash Test og Premium Test?",
        answer:
          "Flash Test er en hurtig og praktisk test, der egner sig til køb, salg og sammenligning af biler. Premium Test er mere omfattende, analyserer batteriet over en længere kørecyklus og passer bedst til dyre biler eller mistanke om stort kapacitetstab.",
      },
      {
        question: "Hvor lang tid tager en AVILOO-batteritest?",
        answer:
          "Det afhænger af testtype og bilmodel. En Flash Test kan udføres på kort tid, mens en Premium Test kræver længere kørsel og analyse.",
      },
    ],
  },
  {
    slug: "laes-batterirapporten-foer-du-koeber-elbil",
    title: "Sådan læser du batterirapporten, før du køber en brugt elbil",
    metaTitle: "Læs batterirapporten rigtigt før køb af brugt elbil",
    metaDescription:
      "Lær hvad du skal spørge sælger om, hvordan batterigaranti fungerer, og hvordan en batterirapport kan bruges til at forhandle prisen på en brugt elbil.",
    excerpt:
      "En batterirapport er kun værdifuld, hvis du ved, hvad du kigger efter. Se hvad du bør spørge sælger om, og hvordan SoH kan påvirke prisen.",
    image: {
      src: "/billide3.jpeg",
      alt: "Gennemgang af batterirapport før køb af brugt elbil",
    },
    datePublished: "2026-03-09",
    dateModified: "2026-07-02",
    keywords: [
      "batterirapport elbil",
      "batterigaranti elbil",
      "prisforhandling brugt elbil",
      "privat handel elbil batteri",
      "spørgsmål til sælger elbil",
      "SoH prisforhandling",
    ],
    readingTime: "7 min. læsning",
    blocks: [
      {
        type: "p",
        text: "En batterirapport er ikke kun et tal. Den er et forhandlingsværktøj og en tryghed, hvis du ved, hvordan du skal bruge den. Før du køber en brugt elbil, er der en række spørgsmål, du bør stille sælger, og punkter i rapporten, der er værd at forstå.",
      },
      { type: "h2", text: "Hvad skal man spørge sælger om?" },
      {
        type: "p",
        text: "Før du køber en brugt elbil, bør du spørge:",
      },
      {
        type: "list",
        items: [
          "Hvordan er bilen typisk blevet opladet?",
          "Har bilen mest kørt motorvej eller bykørsel?",
          "Har bilen været brugt som taxi, firmabil eller udlejningsbil?",
          "Har bilen haft batterifejl?",
          "Har bilen stadig batterigaranti?",
          "Er der lavet softwareopdateringer?",
          "Har bilen været skadet?",
          "Kan sælger dokumentere batteriets tilstand?",
        ],
      },
      {
        type: "p",
        text: "Hvis sælger ikke kan dokumentere batteriets tilstand, kan en batteritest være en god idé.",
      },
      { type: "h2", text: "Hvad med batterigaranti?" },
      {
        type: "p",
        text: "Mange elbiler har batterigaranti, ofte i flere år eller op til et bestemt kilometertal. Men garantiens betingelser varierer fra mærke til mærke. Nogle garantier dækker kun, hvis batterikapaciteten falder under en bestemt grænse. Andre dækker fejl, men ikke nødvendigvis almindelig degradering. Derfor bør du ikke kun spørge \"Er der garanti?\" — du bør også spørge:",
      },
      {
        type: "list",
        items: [
          "Hvor længe gælder garantien?",
          "Hvad dækker den?",
          "Hvad er kapacitetsgrænsen?",
          "Er bilen stadig inden for kilometergrænsen?",
          "Er service og betingelser overholdt?",
        ],
      },
      {
        type: "p",
        text: "En batteritest kan give ekstra information, selv når der stadig er garanti.",
      },
      { type: "h2", text: "Hvorfor er batteritest vigtig ved privat handel?" },
      {
        type: "p",
        text: "Ved privat handel har køber ofte mindre beskyttelse end hos en professionel forhandler. Derfor er dokumentation vigtig. Hvis du køber privat, kan en batteritest hjælpe dig med at undgå at købe en bil, hvor batteriet er dårligere end forventet. Hvis du sælger privat, kan en rapport hjælpe dig med at vise, at du er transparent og seriøs. Det kan skabe en bedre handel for begge parter.",
      },
      { type: "h2", text: "Kan en batteritest bruges til prisforhandling?" },
      {
        type: "p",
        text: "Ja, ofte. Hvis batteriets tilstand er god, kan sælger bruge rapporten til at forsvare prisen. Hvis batteriets tilstand er dårligere end forventet, kan køber bruge rapporten til at forhandle prisen eller vælge en anden bil.",
      },
      {
        type: "table",
        headers: ["Resultat", "Mulig betydning"],
        rows: [
          ["God SoH", "Større tryghed og stærkere salgsargument"],
          ["Middel SoH", "Pris bør vurderes i forhold til bilens alder og km"],
          ["Lav SoH", "Køber bør undersøge bilen nærmere eller forhandle"],
          ["Uklare data", "Yderligere kontrol kan være nødvendig"],
        ],
      },
      { type: "h2", text: "Eksempel: Hvad kan lavere SoH betyde økonomisk?" },
      {
        type: "p",
        text: "Lad os sige, at du kigger på to ens brugte elbiler:",
      },
      {
        type: "table",
        headers: ["Bil", "Pris", "SoH", "Kommentar"],
        rows: [
          ["Bil A", "180.000 kr.", "94%", "Stærkere dokumentation"],
          ["Bil B", "175.000 kr.", "82%", "Billigere, men større risiko"],
        ],
      },
      {
        type: "p",
        text: "Bil B er 5.000 kr. billigere, men hvis batteriet er markant svagere, er den måske ikke det bedste køb. En lavere pris er ikke altid en bedre handel.",
      },
      { type: "h2", text: "Hvornår er det bedst at teste bilen?" },
      {
        type: "p",
        text: "Det bedste tidspunkt er før du skriver under eller betaler depositum. Hvis du først tester bilen efter købet, kan det være sværere at bruge resultatet i forhandlingen.",
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Find bilen",
          "Prøvekør bilen",
          "Tjek servicehistorik og garanti",
          "Book batteritest",
          "Vurder rapporten",
          "Forhandl pris eller beslut om køb",
        ],
      },
      {
        type: "callout",
        title: "Brug rapporten til at stå stærkere i handlen",
        text: "EV-Check leverer en klar PDF-rapport med SoH, konklusion og forklaring, som du kan bruge direkte i forhandlingen med sælger — før du skriver under.",
      },
    ],
    faqs: [
      {
        question: "Kan testen garantere, at batteriet ikke får fejl senere?",
        answer:
          "Nej. Ingen test kan garantere fremtiden. Men testen kan give værdifuld information om batteriets aktuelle tilstand, som du kan bruge i din beslutning.",
      },
      {
        question: "Hvad skal jeg spørge sælgeren om, før jeg køber en brugt elbil?",
        answer:
          "Spørg blandt andet til opladningsvaner, tidligere brug (taxi, firmabil), eventuelle batterifejl, om batterigarantien stadig gælder, og om sælger kan dokumentere batteriets tilstand.",
      },
      {
        question: "Kan en batterirapport bruges til at forhandle prisen?",
        answer:
          "Ja. Er batteriets SoH god, kan sælger bruge rapporten som salgsargument. Er SoH lavere end forventet, kan køber bruge den til at forhandle prisen eller vælge en anden bil.",
      },
      {
        question: "Dækker batterigarantien altid kapacitetstab?",
        answer:
          "Ikke nødvendigvis. Nogle garantier dækker kun, hvis kapaciteten falder under en bestemt grænse, mens andre kun dækker fejl. Tjek altid varighed, kapacitetsgrænse og om kilometer- og servicebetingelser er overholdt.",
      },
    ],
  },
  {
    slug: "ev-check-mobil-batteritest-sjaelland",
    title: "EV-Check: Mobil batteritest af elbil på Sjælland",
    metaTitle: "Mobil batteritest af elbil på Sjælland",
    metaDescription:
      "EV-Check kommer ud til dig på Sjælland med AVILOO-baseret batteritest. Se hvem der bør få testet batteriet, hvilke mærker vi tester, og hvad du får i rapporten.",
    excerpt:
      "EV-Check tilbyder mobil batteritest på Sjælland, så du kan få en uafhængig batterivurdering uden at køre til et værksted. Se hvad vi tester, og hvem det er relevant for.",
    image: {
      src: "/billide4.jpeg",
      alt: "EV-Check mobil batteritest på Sjælland",
    },
    datePublished: "2026-04-15",
    dateModified: "2026-07-02",
    keywords: [
      "EV-Check batteritest",
      "mobil batteritest Sjælland",
      "batteritest København",
      "elbil batteritest pris",
      "elbil mærker batteritest",
      "batteritest firmabil taxi",
    ],
    readingTime: "6 min. læsning",
    blocks: [
      {
        type: "p",
        text: "EV-Check er ikke en bilforhandler. Vi sælger ikke bilen. Vores rolle er at hjælpe med en mere objektiv vurdering af batteriets tilstand, så køb og salg af brugt elbil bliver mere gennemsigtigt.",
      },
      {
        type: "list",
        items: [
          "mobil batteritest på Sjælland",
          "AVILOO-baseret batterirapport",
          "dokumentation før køb eller salg",
          "forklaring af resultatet",
          "bedre tryghed i bilhandlen",
        ],
      },
      { type: "h2", text: "Hvorfor vælge EV-Check?" },
      {
        type: "p",
        text: "Du bør vælge EV-Check, hvis du ønsker en praktisk og professionel batteritest uden at skulle køre til et værksted.",
      },
      {
        type: "list",
        items: [
          "Vi kommer til dig",
          "Mobil service på Sjælland",
          "AVILOO-baseret test",
          "Velegnet før køb eller salg",
          "Rapport og forklaring",
          "Fokus på elbilbatteriets sundhed",
          "Uafhængig vurdering",
        ],
      },
      { type: "h2", text: "Hvem bør få lavet en batteritest?" },
      {
        type: "p",
        text: "En batteritest er relevant for flere typer kunder.",
      },
      {
        type: "list",
        items: [
          "Købere af brugt elbil — kontroller batteriet før handlen for bedre tryghed og forhandlingsgrundlag.",
          "Sælgere af elbil — en batterirapport gør bilen mere troværdig og kan give køber mere tillid.",
          "Forhandlere — brug batteritest som dokumentation over for kunder og skab mere gennemsigtighed.",
          "Ejere der oplever lavere rækkevidde — en test kan afklare, om problemet er relateret til batteriets tilstand.",
        ],
      },
      { type: "h2", text: "Kan alle elbiler testes?" },
      {
        type: "p",
        text: "Mange elbiler kan testes, men ikke alle modeller understøtter samme testtype. Kompatibilitet afhænger af mærke, model, årgang og adgang til relevante batteridata. EV-Check kan hjælpe dig med at kontrollere, om bilen kan testes. Typiske mærker kan blandt andet være:",
      },
      {
        type: "list",
        items: [
          "Tesla",
          "Volkswagen",
          "Skoda",
          "Audi",
          "BMW",
          "Mercedes-Benz",
          "Hyundai",
          "Kia",
          "Volvo",
          "Polestar",
          "Renault",
          "Peugeot",
          "Citroën",
          "Nissan",
        ],
      },
      {
        type: "p",
        text: "Kontakt EV-Check, hvis du er i tvivl om en konkret bilmodel.",
      },
      { type: "h2", text: "Er batteritest kun relevant for gamle elbiler?" },
      {
        type: "p",
        text: "Nej. Batteritest kan også være relevant for nyere elbiler, især hvis bilen har kørt mange kilometer, har været brugt intensivt, har været firmabil eller taxi, har været hurtigladet ofte, eller hvis du vil have dokumentation før køb eller sælge bilen professionelt. Alder er kun én faktor. Brugsmønster kan være lige så vigtigt.",
      },
      { type: "h2", text: "Hvorfor bliver batteritest vigtigere i Danmark?" },
      {
        type: "p",
        text: "Flere danskere køber elbil, og markedet for brugte elbiler vokser. Når flere brugte elbiler handles, bliver batteriets tilstand en vigtig del af bilens værdi. For købere handler det om tryghed. For sælgere handler det om dokumentation. For forhandlere handler det om gennemsigtighed. Derfor bliver batteritest en naturlig del af fremtidens brugtbilhandel.",
      },
      { type: "h2", text: "Hvad får du hos EV-Check?" },
      {
        type: "p",
        text: "Når du booker en batteritest hos EV-Check, får du en mobil løsning, hvor vi kommer til dig på Sjælland. Du får:",
      },
      {
        type: "list",
        items: [
          "professionel batteritest",
          "AVILOO-baseret rapport",
          "vurdering af batteriets sundhed",
          "forklaring af resultatet",
          "dokumentation til køb eller salg",
          "bedre beslutningsgrundlag",
        ],
      },
      { type: "h2", text: "Hvad koster det at ignorere batteriet?" },
      {
        type: "p",
        text: "Det kan være dyrt at købe en brugt elbil uden at kende batteriets tilstand. Mulige konsekvenser:",
      },
      {
        type: "list",
        items: [
          "du betaler for meget",
          "du får kortere rækkevidde end forventet",
          "bilen bliver sværere at sælge",
          "du mister værdi ved videresalg",
          "du risikerer dyre reparationer",
          "du får mindre tryghed i hverdagen",
        ],
      },
      {
        type: "p",
        text: "En batteritest er ikke en udgift. Den er en form for risikokontrol.",
      },
      { type: "h2", text: "Test batteriet, før du køber" },
      {
        type: "p",
        text: "Lak, fælge, udstyr og infotainment er synlige. Batteriets reelle tilstand er ikke. Hos EV-Check hjælper vi dig med mobil batteritest på Sjælland, så du kan købe eller sælge brugt elbil med større tryghed.",
      },
      {
        type: "callout",
        title: "Book en batteritest hos EV-Check",
        text: "Vi kører ud til dig på Sjælland, København og omegn. Fast pris, hurtig booking online og PDF-rapport samme dag.",
      },
    ],
    faqs: [
      {
        question: "Kommer EV-Check til kunden?",
        answer:
          "Ja. EV-Check tilbyder mobil batteritest og kører ud til dig på Sjælland, herunder København og omegn, så du slipper for et værkstedsbesøg.",
      },
      {
        question: "Hvilke bilmærker kan EV-Check teste?",
        answer:
          "EV-Check tester de fleste populære elbilmærker, blandt andet Tesla, Volkswagen, Skoda, Audi, BMW, Mercedes-Benz, Hyundai, Kia, Volvo, Polestar, Renault, Peugeot, Citroën og Nissan. Kontakt os, hvis du er i tvivl om din model.",
      },
      {
        question: "Er batteritest kun relevant for gamle elbiler?",
        answer:
          "Nej. Batteritest kan også være relevant for nyere elbiler, især ved høj kilometerstand, intensiv brug, tidligere brug som firmabil eller taxi, eller hyppig hurtigopladning.",
      },
      {
        question: "Er batteritest relevant, når jeg skal sælge min elbil?",
        answer:
          "Ja. En batterirapport kan gøre bilen mere troværdig over for potentielle købere og give dem større tillid til handlen.",
      },
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
