import LitepaperLayout from '@/components/LitepaperLayout';

const litepaperContent = {
  title: 'EverRise - Litepaper',
  subtitle: 'Bitcoin don lead di money wey no fit print. EverRise improve with prices wey no fit negotiate.',
  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      content: `You don ever be victim of pump and dump schemes? Buy asset for top, just to suffer big crash no long after? You go want pay attention to EverRise, di innovative asset wey dey programmatically designed to never reduce price. While Bitcoin don lead di money wey no fit print, EverRise improve with prices wey no fit negotiate.`
    },
    {
      id: 'pricing-formula',
      title: 'Pricing Formula',
      content: `Di price of $EVER dey calculated using bonding curve model wey inspired by constant product mechanisms, enhanced by daily minimum growth assurance.

<img src="/images/organic-price-formula.png" alt="Organic Price Formula" className="mx-auto my-4 max-w-full h-auto" />

<img src="/images/daily-boost-formula.png" alt="Daily Boost Formula" className="mx-auto my-4 max-w-full h-auto" />`
    }
  ]
};

export default function NaijaLitepaperPage() {
  return (
    <LitepaperLayout
      title={litepaperContent.title}
      sections={litepaperContent.sections}
      languageCode="na"
    />
  );
}
