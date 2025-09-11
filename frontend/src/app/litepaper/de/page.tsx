import LitepaperLayout from '@/components/LitepaperLayout';

const litepaperContent = {
  title: 'EverRise - Litepaper',
  subtitle: 'Bitcoin war Pionier des Geldes, das nicht gedruckt werden kann. EverRise verbesserte mit Preisen, die nicht verhandelbar sind.',
  sections: [
    {
      id: 'introduction',
      title: 'Einführung',
      content: `Waren Sie schon einmal Opfer von Pump-and-Dump-Schemata? Ein Asset auf dem Höhepunkt kaufen, nur um kurz darauf einen massiven Crash zu erleiden? Sie sollten EverRise beachten, das innovative Asset, das programmatisch so konzipiert ist, dass der Preis niemals sinkt. Während Bitcoin Pionier des Geldes war, das nicht gedruckt werden kann, verbesserte EverRise mit Preisen, die nicht verhandelbar sind.

In einer Ära, in der Finanzmärkte zunehmend von kurzfristiger Volatilität geplagt sind, verlangt die Welt nach einer neuen Art von Wertaufbewahrungsmittel—eines, das Investoren vor den unregelmäßigen Schwankungen traditioneller Assets schützt und dabei konsistentes, langfristiges Wachstum bietet. Traditionelle Speicher wie Gold oder Staatsanleihen bieten Stabilität, hinken aber oft bei der Wertsteigerung hinterher, während Kryptowährungen wie Bitcoin revolutionäres Potenzial versprechen, aber Inhaber dramatischen Verlusten aussetzen, die von Spekulation und makroökonomischen Druck verursacht werden.

EverRise ($EVER) tritt als innovative Alternative auf—eine Kryptowährung, die für ewigen Aufwärtsimpuls entwickelt wurde und ein anderes Paradigma als traditionelle Ansätze bietet. Durch die Eliminierung traditioneller Liquiditätspools und die Einbeziehung eines atomaren Transaktionssystems zielt EverRise darauf ab, Stabilität und langfristige Wertakkumulation für Inhaber zu bieten.`
    },
    {
      id: 'need-for-new-store',
      title: 'Die Notwendigkeit eines Neuen Wertaufbewahrungsmittels',
      content: `Die globale Finanzlandschaft entwickelt sich schnell, mit Inflation, die Fiat-Währungen aushöhlt, und geopolitischen Unsicherheiten, die Marktturbulenzen verstärken. Investoren suchen Assets, die nicht nur Reichtum bewahren, sondern ihn aktiv vermehren, ohne die herzstillende Volatilität, die viele Kryptowährungen kennzeichnet.

Seit Anbeginn der Zeit hat sich jedes Asset, das die Menschheit kannte, vor Expansion und Verhandlung gebeugt. Steigt der Goldpreis? Graben Sie tiefer, überschwemmen Sie den Markt mit mehr Angebot, und sehen Sie zu, wie der Wert nach unten verhandelt wird. Öl, Land, sogar alte Tauschgüter—steigende Nachfrage lädt immer zu mehr Schöpfung ein, verdünnt den Kuchen, während Preise basierend auf Launen nach oben oder unten gesprochen werden.

Bitcoin brach diesen Zyklus als die erste wirklich nicht-druckbare Währung: eine feste Obergrenze von 21 Millionen, durch Code auferlegte Knappheit, die niemand aufblähen konnte. Es war ein Urknall für programmierbare Währung, der bewies, dass Geld unendlicher Verdünnung widerstehen kann.

Aber was, wenn wir das weiterführen? EverRise konzipiert das erste nicht-verhandelbare Preis-Asset, bei dem der Algorithmus jeden abwärts gerichteten Diskurs verhindert—Preise können nicht nach unten verhandelt werden, nur darauf ausgelegt, mit einer handhabbaren Rate zu steigen.`
    },
    {
      id: 'core-mechanics',
      title: 'Kernmechaniken',
      content: `EverRise operiert auf einer Grundlage, die Aufwärts-Preismomentum priorisiert. Schlüsselfunktionen umfassen:

• Ewige Preissteigerung: Verwendet ein Bonding-Curve-Modell, das so konzipiert ist, dass der Preis niemals sinkt und nur mit jeder Kauf-Transaktion steigt, was konsistentes Wachstum schafft.

• Atomare Handelsabwicklung: Transaktionen werden sofort durch atomare Operationen verarbeitet, was sofortige Ausführung ohne Wartezeiten gewährleistet.

• Reserve-Angebot-Integration: Für Käufe werden Token aus dem Reserve-Angebot gezogen (falls verfügbar), mit Erlösen, die an ein externes Schatzamt geleitet werden. Das maximale Angebot ist auf 100M Token begrenzt, was Knappheit gewährleistet.

• Schatzamt-Nutzung: Angesammelte Mittel im Schatzamt werden für zukünftige strategische Zwecke gehalten, mit Potenzial für Renditegenerierung und Rückkäufe.

Diese Elemente verbinden sich, um eine Umgebung zu fördern, in der Preisbewertung inhärent und vorhersagbar ist.`
    },
    {
      id: 'pricing-formula',
      title: 'Preisformel',
      content: `Der Preis von $EVER wird mit einem Bonding-Curve-Modell berechnet, das von konstanten Produktmechanismen inspiriert ist, verstärkt durch eine tägliche Mindestwachstumsgarantie.

Variablendefinitionen:
• X: USDC-Menge im virtuellen Reserve-Pool. Anfangswert: 10,000 USDC. Steigt mit Reserve-Käufen.
• Y: $EVER-Token in Reserven. Anfangs-/Maximalangebot: 100,000,000. Sinkt bei Reserve-Käufen.
• K: Konstantprodukt (K = X * Y), aktualisiert nach Reserve-Transaktionen.
• SC: Umlaufendes Angebot von $EVER, beginnend bei 0 und steigend mit Käufen.
• P(Y): Aktueller Preis in USDC.

Organische Preisberechnung:
Der Grundpreis wird mit der folgenden Formel berechnet:

<img src="/images/organic-price-formula.png" alt="Organische Preisformel" className="mx-auto my-4 max-w-full h-auto" />

Wo:
- Der erste Term **(X / Y)** eine Grundlinie bietet, die steigt, wenn die Reserven abnehmen
- Die Summierung fügt permanente Boni von warteschlangenbasierten Käufen hinzu
- Jeder historische Warteschlangen-Kauf i trägt einen Bonus bei, der nach Volumen skaliert und nach Preis und umlaufendem Angebot normalisiert ist

Täglicher Mindest-Boost:
Um mindestens 0.02% Wachstum pro 24-Stunden-Periode zu gewährleisten, wendet das System einen täglichen Boost an, wenn das organische Wachstum unter diese Schwelle fällt:

<img src="/images/daily-boost-formula.png" alt="Tägliche Boost-Formel" className="mx-auto my-4 max-w-full h-auto" />

Dieser Boost ist temporär und nicht-zusammengesetzt, wird jeden Tag zurückgesetzt.`
    },
    {
      id: 'affiliate-program',
      title: 'Affiliate-Marketing-Programm',
      content: `EverRise beinhaltet ein Affiliate-Marketing-Programm, das darauf ausgelegt ist, Ökosystem-Expansion zu fördern und community-gesteuertes Wachstum zu belohnen.

Hauptfunktionen:
• 5% Provision: Affiliates erhalten 5% USDC von Reserve-Käufen als direkte Provision
• Empfehlungslinks: Jeder kann einen einzigartigen Empfehlungslink generieren, um mit potenziellen Nutzern zu teilen
• Direkte Zahlung: Provisionen werden direkt auf das USDC-Konto des Affiliates als Teil der atomaren Transaktion gezahlt
• Schatzamt-Fallback: Wenn kein Empfehler bereitgestellt wird, geht die 5%-Provision an die Schatzamt-Wallet

Das Programm unterstreicht EverRises Engagement für dezentralisierten, anreizausgerichteten Marketing, fördert breite Adoption und entschädigt gleichzeitig Promotoren für ihre Rolle beim Netzwerkaufbau.`
    },
    {
      id: 'roadmap',
      title: 'Roadmap',
      content: `Digitale Asset-Schatzamt-Unternehmen

Es wird die Veröffentlichung eines Staking-Tresors geben, wo Nutzer ihre EVER-Token mit der Absicht sperren können, dass sie in Aktien eines an der Nasdaq gelisteten Unternehmens umgewandelt werden. Das an der Nasdaq gelistete Unternehmen wird ein Digitales Asset-Schatzamt-Unternehmen (DAT) sein, ähnlich MicroStrategy.

Der Staking-Tresor wird es Nutzern ermöglichen, ihre EVER-Token zu sperren und im Gegenzug Aktien des Unternehmens zu erhalten. Dies ist ein einzigartiges Angebot, das eine Brücke zwischen Kryptowährungen und traditionellen Finanzmärkten schafft.

Zukünftige Pläne:
• Bildung des Digitalen Asset-Schatzamt-Unternehmens
• Nasdaq-Listing-Prozess
• Entwicklung des Staking-Tresors
• Zusätzliche Nützlichkeit für die Community`
    }
  ]
};

export default function GermanLitepaperPage() {
  return (
    <LitepaperLayout
      title={litepaperContent.title}
      sections={litepaperContent.sections}
      languageCode="de"
    />
  );
}
