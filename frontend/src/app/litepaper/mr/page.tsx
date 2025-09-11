import LitepaperLayout from '@/components/LitepaperLayout';

const litepaperContent = {
  title: 'EverRise - लाइटपेपर',
  subtitle: 'बिटकॉइनने अशा पैश्याचे नेतृत्व केले जे छापता येत नाही. EverRise ने अशा किमतींसह सुधार केला ज्यावर सौदेबाजी करता येत नाही.',
  sections: [
    {
      id: 'introduction',
      title: 'परिचय',
      content: `तुम्ही कधीही पंप आणि डंप योजनांचा बळी झाला आहात? शिखरावर एखादी मालमत्ता खरेदी केली, फक्त काही काळानंतर मोठ्या क्रॅशचा सामना करावा लागला? तुम्हाला EverRise वर लक्ष द्यावे लागेल, ही नाविन्यपूर्ण मालमत्ता जी प्रोग्रामॅटिकली डिझाइन केलेली आहे की कधीही किंमत कमी होणार नाही.`
    },
    {
      id: 'pricing-formula',
      title: 'किंमत सूत्र',
      content: `$EVER ची किंमत स्थिर उत्पादन यंत्रणांपासून प्रेरित बॉन्डिंग कर्व मॉडेल वापरून मोजली जाते.

<img src="/images/organic-price-formula.png" alt="सेंद्रिय किंमत सूत्र" className="mx-auto my-4 max-w-full h-auto" />

<img src="/images/daily-boost-formula.png" alt="दैनिक बूस्ट सूत्र" className="mx-auto my-4 max-w-full h-auto" />`
    }
  ]
};

export default function MarathiLitepaperPage() {
  return (
    <LitepaperLayout
      title={litepaperContent.title}
      sections={litepaperContent.sections}
      languageCode="mr"
    />
  );
}
