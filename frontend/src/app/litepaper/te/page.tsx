import LitepaperLayout from '@/components/LitepaperLayout';

const litepaperContent = {
  title: 'EverRise - లైట్ పేపర్',
  subtitle: 'బిట్ కాయిన్ ముద్రించలేని డబ్బుకు నాయకత్వం వహించింది. EverRise చర్చించలేని ధరలతో మెరుగుపరిచింది.',
  sections: [
    {
      id: 'introduction',
      title: 'పరిచయం',
      content: `మీరు ఎప్పుడైనా పంప్ మరియు డంప్ స్కీమ్ల బాధితులయ్యారా? శిఖరంలో ఒక ఆస్తిని కొన్నారు, కొద్దిసేపటికే పెద్ద క్రాష్ ఎదుర్కోవలసి వచ్చిందా? మీరు EverRise పై దృష్టి పెట్టాలి, ధర ఎప్పుడూ తగ్గకుండా ప్రోగ్రామేటిక్‌గా రూపొందించబడిన వినూత్న ఆస్తి.`
    },
    {
      id: 'pricing-formula',
      title: 'ధర సూత్రం',
      content: `$EVER యొక్క ధర స్థిర ఉత్పాదక యంత్రాంగాల నుండి ప్రేరణ పొందిన బాండింగ్ కర్వ్ మోడల్ ఉపయోగించి లెక్కించబడుతుంది.

<img src="/images/organic-price-formula.png" alt="సేంద్రీయ ధర సూత్రం" className="mx-auto my-4 max-w-full h-auto" />

<img src="/images/daily-boost-formula.png" alt="దైనిక బూస్ట్ సూత్రం" className="mx-auto my-4 max-w-full h-auto" />`
    }
  ]
};

export default function TeluguLitepaperPage() {
  return (
    <LitepaperLayout
      title={litepaperContent.title}
      sections={litepaperContent.sections}
      languageCode="te"
    />
  );
}
