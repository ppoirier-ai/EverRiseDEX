import LitepaperLayout from '@/components/LitepaperLayout';

const litepaperContent = {
  title: 'EverRise - الورقة البيضاء',
  subtitle: 'البيتكوين قاد المال اللي مش ممكن يتطبع. EverRise حسنت بالأسعار اللي مش ممكن تتفاوض عليها.',
  sections: [
    {
      id: 'introduction',
      title: 'المقدمة',
      content: `إنت كنت ضحية مخططات المضخ والتفريغ؟ تشتري أصل في القمة، بس عشان تعاني من كراش كبير مش كتير بعد كده؟ إنت هتحتاج تنتبه لـ EverRise، الأصل المبتكر اللي مصمم برمجياً عشان مينزلش في السعر أبداً.`
    },
    {
      id: 'pricing-formula',
      title: 'صيغة التسعير',
      content: `سعر $EVER بيتحسب باستخدام نموذج منحنى الربط المستوحى من آليات المنتج الثابت.

<img src="/images/organic-price-formula.png" alt="صيغة السعر العضوي" className="mx-auto my-4 max-w-full h-auto" />

<img src="/images/daily-boost-formula.png" alt="صيغة الدفع اليومي" className="mx-auto my-4 max-w-full h-auto" />`
    }
  ]
};

export default function MasriLitepaperPage() {
  return (
    <LitepaperLayout
      title={litepaperContent.title}
      sections={litepaperContent.sections}
      languageCode="ms"
    />
  );
}
