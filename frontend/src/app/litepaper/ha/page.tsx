import LitepaperLayout from '@/components/LitepaperLayout';

const litepaperContent = {
  title: 'EverRise - Litepaper',
  subtitle: 'Bitcoin ya fara da kudin da ba za a iya buga ba. EverRise ya inganta da farashin da ba za a iya tattaunawa ba.',
  sections: [
    {
      id: 'introduction',
      title: 'Gabatarwa',
      content: `Shin ka taba zama wanda aka yi wa pump da dump schemes? Siyan wani kadari a saman, kawai don sha wahala da babban crash ba da daɗewa ba? Za ka so ka kula da EverRise, sabon kadari wanda aka tsara shi ta hanyar shirye-shirye don kada farashin ya ragu.`
    },
    {
      id: 'pricing-formula',
      title: 'Tsarin Farashi',
      content: `Farashin $EVER ana lissafinsa ta amfani da tsarin bonding curve wanda ya sami wahayi daga hanyoyin samar da kayayyaki na yau da kullun.

<img src="/images/organic-price-formula.png" alt="Tsarin Farashin Halitta" className="mx-auto my-4 max-w-full h-auto" />

<img src="/images/daily-boost-formula.png" alt="Tsarin Kwararar Yau da Kullun" className="mx-auto my-4 max-w-full h-auto" />`
    }
  ]
};

export default function HausaLitepaperPage() {
  return (
    <LitepaperLayout
      title={litepaperContent.title}
      sections={litepaperContent.sections}
      languageCode="ha"
    />
  );
}
