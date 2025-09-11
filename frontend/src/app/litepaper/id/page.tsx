import LitepaperLayout from '@/components/LitepaperLayout';

const litepaperContent = {
  title: 'EverRise - Litepaper',
  subtitle: 'Bitcoin memelopori uang yang tidak dapat dicetak. EverRise meningkat dengan harga yang tidak dapat ditawar.',
  sections: [
    {
      id: 'introduction',
      title: 'Pengantar',
      content: `Pernahkah Anda menjadi korban skema pump and dump? Membeli aset di puncak, hanya untuk menderita crash besar tak lama setelahnya? Anda ingin memperhatikan EverRise, aset inovatif yang dirancang secara programatik untuk tidak pernah menurun harganya. Sementara Bitcoin memelopori uang yang tidak dapat dicetak, EverRise meningkat dengan harga yang tidak dapat ditawar.

Dalam era di mana pasar keuangan semakin dilanda volatilitas jangka pendek, dunia membutuhkan jenis baru penyimpan nilai—yang melindungi investor dari fluktuasi tidak teratur aset tradisional sambil memberikan pertumbuhan yang konsisten dan jangka panjang. Penyimpanan tradisional seperti emas atau obligasi pemerintah menawarkan stabilitas tetapi sering tertinggal dalam apresiasi, sementara kripto seperti Bitcoin menjanjikan potensi revolusioner tetapi mengekspos pemegang pada penurunan dramatis yang didorong oleh spekulasi dan tekanan makroekonomi.

EverRise ($EVER) muncul sebagai alternatif inovatif—kripto yang dirancang untuk momentum naik yang abadi, menawarkan paradigma yang berbeda dari pendekatan tradisional. Dengan menghilangkan pool likuiditas tradisional dan menggabungkan sistem transaksi atomik, EverRise bertujuan untuk memberikan stabilitas dan akumulasi nilai jangka panjang untuk pemegang.`
    },
    {
      id: 'need-for-new-store',
      title: 'Kebutuhan Penyimpan Nilai Baru',
      content: `Lanskap keuangan global berkembang dengan cepat, dengan inflasi menggerogoti mata uang fiat dan ketidakpastian geopolitik memperkuat turbulensi pasar. Investor mencari aset yang tidak hanya melestarikan kekayaan tetapi secara aktif mengembangkannya tanpa volatilitas yang menghentikan jantung yang menjadi ciri banyak kripto.

Sejak awal waktu, setiap aset yang dikenal manusia telah tunduk pada ekspansi dan negosiasi. Harga emas naik? Gali lebih dalam, banjiri pasar dengan lebih banyak pasokan, dan lihat nilai menawar ke bawah. Minyak, tanah, bahkan barang barter kuno—permintaan yang meningkat selalu mengundang lebih banyak penciptaan, mengencerkan kue, sementara harga dibicarakan naik atau turun berdasarkan keinginan.

Bitcoin memecahkan siklus itu sebagai uang pertama yang benar-benar tidak dapat dicetak: batas tetap 21 juta, kelangkaan yang dipaksakan oleh kode yang tidak ada yang bisa menggelembungkan. Itu adalah big bang untuk mata uang yang dapat diprogram, membuktikan bahwa uang dapat menahan pengenceran tak terbatas.

Tetapi bagaimana jika kita membawanya lebih jauh? EverRise mengkonseptualisasikan aset harga pertama yang tidak dapat ditawar, di mana algoritma mencegah debat menurun—harga tidak dapat dinegosiasikan ke bawah, dirancang untuk hanya naik dengan tingkat yang dapat dikelola.`
    },
    {
      id: 'core-mechanics',
      title: 'Mekanika Inti',
      content: `EverRise beroperasi pada fondasi yang memprioritaskan momentum harga naik. Fitur-fitur kunci meliputi:

• Peningkatan Harga Abadi: Menggunakan model kurva ikatan yang dirancang sedemikian rupa sehingga harga tidak pernah turun dan hanya naik dengan setiap transaksi pembelian, menciptakan pertumbuhan yang konsisten.

• Perdagangan Atomik: Transaksi diproses segera melalui operasi atomik, memastikan eksekusi instan tanpa periode tunggu.

• Integrasi Pasokan Cadangan: Untuk pembelian, token ditarik dari pasokan cadangan (jika tersedia), dengan hasil diarahkan ke perbendaharaan eksternal. Pasokan maksimum dibatasi pada 100M token, memastikan kelangkaan.

• Penggunaan Perbendaharaan: Dana yang terkumpul di perbendaharaan dipegang untuk tujuan strategis masa depan, dengan potensi untuk menghasilkan hasil dan pembelian kembali.

Elemen-elemen ini bergabung untuk memupuk lingkungan di mana apresiasi harga adalah inheren dan dapat diprediksi.`
    },
    {
      id: 'pricing-formula',
      title: 'Rumus Harga',
      content: `Harga $EVER dihitung menggunakan model kurva ikatan yang terinspirasi dari mekanisme produk konstan, ditingkatkan dengan jaminan pertumbuhan minimum harian.

Definisi Variabel:
• X: Jumlah USDC dalam pool cadangan virtual. Nilai awal: 10,000 USDC. Meningkat dengan pembelian cadangan.
• Y: Token $EVER dalam cadangan. Pasokan awal/maksimum: 100,000,000. Menurun pada pembelian cadangan.
• K: Produk konstan (K = X * Y), diperbarui setelah transaksi cadangan.
• SC: Pasokan beredar $EVER, dimulai dari 0 dan meningkat dengan pembelian.
• P(Y): Harga saat ini dalam USDC.

Perhitungan Harga Organik:
Harga dasar dihitung menggunakan rumus berikut:

<img src="/images/organic-price-formula.png" alt="Rumus Harga Organik" className="mx-auto my-4 max-w-full h-auto" />

Di mana:
- Suku pertama **(X / Y)** memberikan garis dasar yang naik seiring berkurangnya cadangan
- Penjumlahan menambahkan bonus permanen dari pembelian berbasis antrian
- Setiap pembelian antrian historis i berkontribusi bonus yang diskalakan berdasarkan volume dan dinormalisasi berdasarkan harga dan pasokan beredar

Boost Minimum Harian:
Untuk menjamin setidaknya 0.02% pertumbuhan per periode 24 jam, sistem menerapkan boost harian jika pertumbuhan organik jatuh di bawah ambang ini:

<img src="/images/daily-boost-formula.png" alt="Rumus Boost Harian" className="mx-auto my-4 max-w-full h-auto" />

Boost ini bersifat sementara dan non-majemuk, direset setiap hari.`
    },
    {
      id: 'affiliate-program',
      title: 'Program Pemasaran Afiliasi',
      content: `EverRise mencakup program pemasaran afiliasi yang dirancang untuk mendorong ekspansi ekosistem dan menghargai pertumbuhan yang dipimpin komunitas.

Fitur Utama:
• Komisi 5%: Afiliasi menerima 5% USDC dari pembelian cadangan sebagai komisi langsung
• Tautan Referral: Siapa pun dapat menghasilkan tautan referral unik untuk dibagikan dengan pengguna potensial
• Pembayaran Langsung: Komisi dibayarkan langsung ke akun USDC afiliasi sebagai bagian dari transaksi atomik
• Fallback Perbendaharaan: Jika tidak ada referrer yang disediakan, komisi 5% masuk ke dompet perbendaharaan

Program ini menekankan komitmen EverRise terhadap pemasaran terdesentralisasi dan selaras insentif, mendorong adopsi luas sambil mengkompensasi promotor untuk peran mereka dalam membangun jaringan.`
    },
    {
      id: 'roadmap',
      title: 'Roadmap',
      content: `Perusahaan Bendahara Aset Digital

Akan ada rilis Vault Staking di mana pengguna dapat mengunci token EVER mereka dengan niat untuk dikonversi menjadi saham perusahaan yang terdaftar di Nasdaq. Perusahaan yang terdaftar di Nasdaq akan menjadi Perusahaan Bendahara Aset Digital (DAT) yang mirip dengan MicroStrategy.

Vault Staking akan memungkinkan pengguna untuk mengunci token EVER mereka dan sebagai gantinya menerima saham perusahaan. Ini adalah proposisi unik yang menciptakan jembatan antara kripto dan pasar keuangan tradisional.

Rencana Masa Depan:
• Pembentukan Perusahaan Bendahara Aset Digital
• Proses pencatatan di Nasdaq
• Pengembangan Vault Staking
• Utilitas tambahan untuk komunitas`
    }
  ]
};

export default function IndonesianLitepaperPage() {
  return (
    <LitepaperLayout
      title={litepaperContent.title}
      sections={litepaperContent.sections}
      languageCode="id"
    />
  );
}
