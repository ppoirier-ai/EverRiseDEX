import LitepaperLayout from '@/components/LitepaperLayout';

const litepaperContent = {
  title: 'EverRise - Litepaper',
  subtitle: 'Bitcoin basılamayan paranın öncüsü oldu. EverRise pazarlık edilemeyen fiyatlarla geliştirdi.',
  sections: [
    {
      id: 'introduction',
      title: 'Giriş',
      content: `Hiç pump and dump şemalarının kurbanı oldunuz mu? Zirvede bir varlık satın alıp, kısa süre sonra büyük bir çöküş yaşadınız mı? EverRise'e dikkat etmek isteyeceksiniz, fiyatın asla düşmemesi için programatik olarak tasarlanmış yenilikçi varlık. Bitcoin basılamayan paranın öncüsü olurken, EverRise pazarlık edilemeyen fiyatlarla geliştirdi.

Finansal pazarların giderek kısa vadeli volatilite ile boğuştuğu bir çağda, dünya yeni bir değer deposu türü istiyor—geleneksel varlıkların düzensiz dalgalanmalarından yatırımcıları korurken tutarlı, uzun vadeli büyüme sağlayan bir tür. Altın veya devlet tahvilleri gibi geleneksel depolar istikrar sunar ama genellikle değer artışında geri kalır, Bitcoin gibi kripto para birimleri ise devrimci potansiyel vaat eder ama sahipleri spekülasyon ve makroekonomik baskıların neden olduğu dramatik düşüşlere maruz bırakır.

EverRise ($EVER) yenilikçi bir alternatif olarak ortaya çıkıyor—sürekli yukarı momentum için tasarlanmış bir kripto para birimi, geleneksel yaklaşımlardan farklı bir paradigma sunuyor. Geleneksel likidite havuzlarını ortadan kaldırarak ve atomik işlem sistemi dahil ederek, EverRise sahipleri için istikrar ve uzun vadeli değer birikimi sağlamayı hedefliyor.`
    },
    {
      id: 'need-for-new-store',
      title: 'Yeni Değer Deposuna İhtiyaç',
      content: `Küresel finansal manzara hızla gelişiyor, enflasyon fiat para birimlerini aşındırıyor ve jeopolitik belirsizlikler pazar türbülansını artırıyor. Yatırımcılar sadece serveti korumayan değil, aynı zamanda birçok kripto para birimini karakterize eden kalp durduran volatilite olmadan aktif olarak artıran varlıklar arıyor.

Zamanın başlangıcından beri, insanlığın bildiği her varlık genişleme ve pazarlığın önünde eğildi. Altın fiyatı yükseliyor mu? Daha derin kazın, pazara daha fazla arz dökün ve değerin aşağı pazarlık etmesini izleyin. Petrol, toprak, hatta eski takas malları—artan talep her zaman daha fazla yaratımı davet eder, pastayı seyreltir, fiyatlar kaprislere dayalı olarak yukarı veya aşağı konuşulur.

Bitcoin bu döngüyü gerçekten basılamayan ilk para olarak kırdı: 21 milyonluk sabit limit, kimsenin şişiremeyeceği kod zorlamalı kıtlık. Programlanabilir para için büyük patlamaydı, paranın sonsuz seyreltmeye direnebileceğini kanıtladı.

Peki ya daha ileriye götürürsek? EverRise ilk pazarlık edilemeyen fiyat varlığını kavramsallaştırıyor, algoritma herhangi bir aşağı tartışmayı engelliyor—fiyatlar aşağı pazarlık edilemez, sadece yönetilebilir bir oranda yükselmek için tasarlanmış.`
    },
    {
      id: 'core-mechanics',
      title: 'Temel Mekanikler',
      content: `EverRise yukarı fiyat momentumunu önceleyen bir temel üzerinde çalışır. Temel özellikler şunları içerir:

• Sürekli Fiyat Artışı: Fiyatın asla düşmemesi ve her satın alma işlemiyle sadece artması için tasarlanmış bağlama eğrisi modeli kullanır, tutarlı büyüme yaratır.

• Atomik Ticaret: İşlemler atomik operasyonlar aracılığıyla anında işlenir, bekleme süreleri olmadan anında yürütme sağlar.

• Rezerv Arz Entegrasyonu: Satın almalar için, tokenler rezerv arzından çekilir (mevcutsa), gelirler harici hazineye yönlendirilir. Maksimum arz 100M token ile sınırlıdır, kıtlık sağlar.

• Hazine Kullanımı: Hazinede biriken fonlar gelecekteki stratejik amaçlar için tutulur, getiri üretimi ve geri satın alma potansiyeli ile.

Bu unsurlar fiyat takdirinin doğal ve öngörülebilir olduğu bir ortamı beslemek için birleşir.`
    },
    {
      id: 'pricing-formula',
      title: 'Fiyat Formülü',
      content: `$EVER'in fiyatı, sabit ürün mekanizmalarından ilham alan bağlama eğrisi modeli kullanılarak hesaplanır, günlük minimum büyüme garantisi ile güçlendirilir.

Değişken Tanımları:
• X: Sanal rezerv havuzundaki USDC miktarı. Başlangıç değeri: 10,000 USDC. Rezerv satın almalarıyla artar.
• Y: Rezervlerdeki $EVER tokenleri. Başlangıç/maksimum arz: 100,000,000. Rezerv satın almalarında azalır.
• K: Sabit ürün (K = X * Y), rezerv işlemlerinden sonra güncellenir.
• SC: $EVER'in dolaşımdaki arzı, 0'dan başlayarak satın almalarla artar.
• P(Y): USDC cinsinden mevcut fiyat.

Organik Fiyat Hesaplaması:
Temel fiyat aşağıdaki formül kullanılarak hesaplanır:

<img src="/images/organic-price-formula.png" alt="Organik Fiyat Formülü" className="mx-auto my-4 max-w-full h-auto" />

Nerede:
- İlk terim **(X / Y)** rezervler azaldıkça yükselen bir taban çizgisi sağlar
- Toplam, kuyruk tabanlı satın almalardan kalıcı bonuslar ekler
- Her tarihsel kuyruk satın alma i, hacimle ölçeklenen ve fiyat ve dolaşımdaki arzla normalize edilen bonusa katkıda bulunur

Günlük Minimum Artış:
24 saatlik dönemde en az %0.02 büyüme garantilemek için, sistem organik büyüme bu eşiğin altına düştüğünde günlük artış uygular:

<img src="/images/daily-boost-formula.png" alt="Günlük Artış Formülü" className="mx-auto my-4 max-w-full h-auto" />

Bu artış geçici ve bileşik değildir, her gün sıfırlanır.`
    },
    {
      id: 'affiliate-program',
      title: 'Bağlı Pazarlama Programı',
      content: `EverRise, ekosistem genişlemesini teşvik etmek ve topluluk yönlendirmeli büyümeyi ödüllendirmek için tasarlanmış bir bağlı pazarlama programı içerir.

Temel Özellikler:
• %5 Komisyon: Bağlılar rezerv satın almalarından %5 USDC doğrudan komisyon olarak alır
• Referans Bağlantıları: Herkes potansiyel kullanıcılarla paylaşmak için benzersiz referans bağlantısı oluşturabilir
• Doğrudan Ödeme: Komisyonlar atomik işlemin parçası olarak bağlının USDC hesabına doğrudan ödenir
• Hazine Yedeklemesi: Referans sağlanmazsa, %5 komisyon hazine cüzdanına gider

Program, EverRise'in merkezi olmayan, teşvik hizalı pazarlamaya bağlılığını vurgular, yaygın benimsemeyi teşvik ederken ağ kurmadaki rolleri için tanıtımcıları tazmin eder.`
    },
    {
      id: 'roadmap',
      title: 'Yol Haritası',
      content: `Dijital Varlık Hazinesi Şirketi

Kullanıcıların EVER tokenlerini Nasdaq listeli şirketin hisselerine dönüştürülme niyetiyle kilitleyebilecekleri Staking Kasası'nın çıkışı olacak. Nasdaq listeli şirket MicroStrategy'ye benzer bir Dijital Varlık Hazinesi (DAT) şirketi olacak.

Staking Kasası kullanıcıların EVER tokenlerini kilitlemesine ve karşılığında şirketin hisselerini almasına olanak tanıyacak. Bu, kripto para birimleri ile geleneksel finansal pazarlar arasında köprü kuran benzersiz bir öneridir.

Gelecek Planları:
• Dijital Varlık Hazinesi Şirketi'nin oluşturulması
• Nasdaq listeleme süreci
• Staking Kasası'nın geliştirilmesi
• Topluluk için ek fayda`
    }
  ]
};

export default function TurkishLitepaperPage() {
  return (
    <LitepaperLayout
      title={litepaperContent.title}
      sections={litepaperContent.sections}
      languageCode="tr"
    />
  );
}
