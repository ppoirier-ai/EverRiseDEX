'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DEX_DISPLAY_NAME, TOKEN_DISPLAY_NAME, TOKEN_TICKER } from '@/constants/tokenBrand';

export default function DocsPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Language change handler (currently unused but kept for future functionality)
  // const handleLanguageChange = (languageCode: string) => {
  //   setSelectedLanguage(languageCode);
  // };

  const getTranslations = (lang: string) => ({
    en: {
      title: 'EverRise DEX Documentation',
      subtitle: 'Learn about SnapCinema (SNAP), the revolutionary unhaggleable price asset on EverRise DEX',
      litepaper: {
        title: 'SnapCinema Litepaper',
        description: 'Read our comprehensive litepaper to understand SnapCinema token mechanics, the pricing formula, and the EverRise DEX vision.',
        downloadText: 'Read Online',
        downloadLink: `/litepaper/${lang}`
      },
      videos: {
        title: 'Educational Videos',
        description: 'Watch our video series explaining SnapCinema and EverRise DEX mechanics',
        items: [
          {
            title: 'Introduction to SnapCinema',
            description: 'Learn the basics of the SnapCinema token and why it represents a new paradigm in digital assets',
            videoId: 'js4fexx_Lec',
            duration: '5:30'
          },
          {
            title: 'How to Install Phantom Wallet',
            description: 'Step-by-step guide to installing and setting up Phantom wallet for Solana transactions',
            videoId: 'bStvWbUdsMw',
            duration: '8:15'
          },
          {
            title: 'Affiliate System Explained',
            description: 'How the affiliate marketing program works and how to earn commissions',
            videoId: 'PLACEHOLDER_VIDEO_ID_3',
            duration: '6:45'
          },
          {
            title: 'Treasury and Future Roadmap',
            description: 'Learn about our plans for the Digital Asset Treasury company and staking vault',
            videoId: 'PLACEHOLDER_VIDEO_ID_4',
            duration: '10:20'
          }
        ]
      },
      language: {
        label: 'Language',
        options: {
          en: 'English',
          zh: '普通话',
          hi: 'हिंदी',
          es: 'Español',
          ar: 'العربية',
          fr: 'Français',
          bn: 'বাংলা',
          pt: 'Português',
          ru: 'Русский',
          id: 'Bahasa Indonesia',
          ur: 'اردو',
          de: 'Deutsch',
          ja: '日本語',
          na: 'Naijá',
          ms: 'مصري',
          mr: 'मराठी',
          vi: 'Tiếng Việt',
          te: 'తెలుగు',
          ha: 'Hausa',
          tr: 'Türkçe'
        }
      }
    },
    zh: {
      title: 'EverRise 文档',
      subtitle: '了解革命性的不可议价价格资产',
      litepaper: {
        title: 'EverRise 白皮书',
        description: '阅读我们的综合白皮书，了解 EverRise 的核心机制、定价公式和愿景。',
        downloadText: '在线阅读',
        downloadLink: `/litepaper/${lang}`
      },
      videos: {
        title: '教育视频',
        description: '观看我们的视频系列，解释 EverRise 概念和机制',
        items: [
          {
            title: 'EverRise 介绍',
            description: '学习 EverRise 的基础知识以及它为什么代表数字资产的新范式',
            videoId: 'js4fexx_Lec',
            duration: '5:30'
          },
          {
            title: '如何安装 Phantom 钱包',
            description: '安装和设置 Phantom 钱包进行 Solana 交易的逐步指南',
            videoId: 'bStvWbUdsMw',
            duration: '8:15'
          },
          {
            title: '联盟系统解释',
            description: '联盟营销计划如何运作以及如何赚取佣金',
            videoId: 'PLACEHOLDER_VIDEO_ID_3_ZH',
            duration: '6:45'
          },
          {
            title: '国库和未来路线图',
            description: '了解我们对数字资产国库公司和质押金库的计划',
            videoId: 'PLACEHOLDER_VIDEO_ID_4_ZH',
            duration: '10:20'
          }
        ]
      },
      language: {
        label: '语言',
        options: {
          en: 'English',
          zh: '普通话',
          hi: 'हिंदी',
          es: 'Español',
          ar: 'العربية',
          fr: 'Français',
          bn: 'বাংলা',
          pt: 'Português',
          ru: 'Русский',
          id: 'Bahasa Indonesia',
          ur: 'اردو',
          de: 'Deutsch',
          ja: '日本語',
          na: 'Naijá',
          ms: 'مصري',
          mr: 'मराठी',
          vi: 'Tiếng Việt',
          te: 'తెలుగు',
          ha: 'Hausa',
          tr: 'Türkçe'
        }
      }
    },
    hi: {
      title: 'EverRise दस्तावेज़',
      subtitle: 'क्रांतिकारी गैर-बातचीत योग्य मूल्य संपत्ति के बारे में जानें',
      litepaper: {
        title: 'EverRise लाइटपेपर',
        description: 'EverRise के मूल यांत्रिकी, मूल्य निर्धारण सूत्र और दृष्टि को समझने के लिए हमारा व्यापक लाइटपेपर पढ़ें।',
        downloadText: 'ऑनलाइन पढ़ें',
        downloadLink: `/litepaper/${lang}`
      },
      videos: {
        title: 'शैक्षिक वीडियो',
        description: 'EverRise अवधारणाओं और यांत्रिकी की व्याख्या करने वाले हमारे वीडियो श्रृंखला देखें',
        items: [
          {
            title: 'EverRise का परिचय',
            description: 'EverRise की मूल बातें सीखें और यह डिजिटल संपत्ति में एक नया प्रतिमान क्यों है',
            videoId: 'js4fexx_Lec',
            duration: '5:30'
          },
          {
            title: 'बॉन्डिंग कर्व को समझना',
            description: 'गहराई से जानें कि बॉन्डिंग कर्व कैसे सतत मूल्य वृद्धि सुनिश्चित करता है',
            videoId: 'bStvWbUdsMw',
            duration: '8:15'
          },
          {
            title: 'एफिलिएट सिस्टम की व्याख्या',
            description: 'एफिलिएट मार्केटिंग प्रोग्राम कैसे काम करता है और कमीशन कैसे कमाएं',
            videoId: 'PLACEHOLDER_VIDEO_ID_3_HI',
            duration: '6:45'
          },
          {
            title: 'ट्रेजरी और भविष्य का रोडमैप',
            description: 'डिजिटल एसेट ट्रेजरी कंपनी और स्टेकिंग वॉल्ट के लिए हमारी योजनाओं के बारे में जानें',
            videoId: 'PLACEHOLDER_VIDEO_ID_4_HI',
            duration: '10:20'
          }
        ]
      },
      language: {
        label: 'भाषा',
        options: {
          en: 'English',
          zh: '普通话',
          hi: 'हिंदी',
          es: 'Español',
          ar: 'العربية',
          fr: 'Français',
          bn: 'বাংলা',
          pt: 'Português',
          ru: 'Русский',
          id: 'Bahasa Indonesia',
          ur: 'اردو',
          de: 'Deutsch',
          ja: '日本語',
          na: 'Naijá',
          ms: 'مصري',
          mr: 'मराठी',
          vi: 'Tiếng Việt',
          te: 'తెలుగు',
          ha: 'Hausa',
          tr: 'Türkçe'
        }
      }
    },
    es: {
      title: 'Documentación de EverRise',
      subtitle: 'Aprende sobre el activo revolucionario con precios no negociables',
      litepaper: {
        title: 'Litepaper de EverRise',
        description: 'Lee nuestro litepaper completo para entender la mecánica central, fórmula de precios y visión de EverRise.',
        downloadText: 'Leer en línea',
        downloadLink: `/litepaper/${lang}`
      },
      videos: {
        title: 'Videos Educativos',
        description: 'Mira nuestra serie de videos explicando los conceptos y mecánicas de EverRise',
        items: [
          {
            title: 'Introducción a EverRise',
            description: 'Aprende los conceptos básicos de EverRise y por qué representa un nuevo paradigma en activos digitales',
            videoId: 'js4fexx_Lec',
            duration: '5:30'
          },
          {
            title: 'Entendiendo la Curva de Enlace',
            description: 'Análisis profundo de cómo la curva de enlace asegura la apreciación perpetua del precio',
            videoId: 'bStvWbUdsMw',
            duration: '8:15'
          },
          {
            title: 'Sistema de Afiliados Explicado',
            description: 'Cómo funciona el programa de marketing de afiliados y cómo ganar comisiones',
            videoId: 'PLACEHOLDER_VIDEO_ID_3_ES',
            duration: '6:45'
          },
          {
            title: 'Tesorería y Hoja de Ruta Futura',
            description: 'Aprende sobre nuestros planes para la empresa de Tesorería de Activos Digitales y bóveda de staking',
            videoId: 'PLACEHOLDER_VIDEO_ID_4_ES',
            duration: '10:20'
          }
        ]
      },
      language: {
        label: 'Idioma',
        options: {
          en: 'English',
          zh: '普通话',
          hi: 'हिंदी',
          es: 'Español',
          ar: 'العربية',
          fr: 'Français',
          bn: 'বাংলা',
          pt: 'Português',
          ru: 'Русский',
          id: 'Bahasa Indonesia',
          ur: 'اردو',
          de: 'Deutsch',
          ja: '日本語',
          na: 'Naijá',
          ms: 'مصري',
          mr: 'मराठी',
          vi: 'Tiếng Việt',
          te: 'తెలుగు',
          ha: 'Hausa',
          tr: 'Türkçe'
        }
      }
    },
    ar: {
      title: 'وثائق EverRise',
      subtitle: 'تعرف على الأصول الثورية ذات الأسعار غير القابلة للمساومة',
      litepaper: {
        title: 'ورقة EverRise البيضاء',
        description: 'اقرأ ورقتنا البيضاء الشاملة لفهم الآليات الأساسية وصيغة التسعير ورؤية EverRise.',
        downloadText: 'اقرأ عبر الإنترنت',
        downloadLink: `/litepaper/${lang}`
      },
      videos: {
        title: 'الفيديوهات التعليمية',
        description: 'شاهد سلسلة الفيديوهات التي تشرح مفاهيم وآليات EverRise',
        items: [
          {
            title: 'مقدمة في EverRise',
            description: 'تعلم أساسيات EverRise ولماذا يمثل نموذجًا جديدًا في الأصول الرقمية',
            videoId: 'js4fexx_Lec',
            duration: '5:30'
          },
          {
            title: 'فهم منحنى الترابط',
            description: 'غوص عميق في كيفية ضمان منحنى الترابط للارتفاع المستمر في الأسعار',
            videoId: 'bStvWbUdsMw',
            duration: '8:15'
          },
          {
            title: 'شرح نظام الشراكة',
            description: 'كيف يعمل برنامج التسويق بالشراكة وكيفية كسب العمولات',
            videoId: 'PLACEHOLDER_VIDEO_ID_3_AR',
            duration: '6:45'
          },
          {
            title: 'الخزينة والخطة المستقبلية',
            description: 'تعرف على خططنا لشركة خزينة الأصول الرقمية وخزينة الرهان',
            videoId: 'PLACEHOLDER_VIDEO_ID_4_AR',
            duration: '10:20'
          }
        ]
      },
      language: {
        label: 'اللغة',
        options: {
          en: 'English',
          zh: '普通话',
          hi: 'हिंदी',
          es: 'Español',
          ar: 'العربية',
          fr: 'Français',
          bn: 'বাংলা',
          pt: 'Português',
          ru: 'Русский',
          id: 'Bahasa Indonesia',
          ur: 'اردو',
          de: 'Deutsch',
          ja: '日本語',
          na: 'Naijá',
          ms: 'مصري',
          mr: 'मराठी',
          vi: 'Tiếng Việt',
          te: 'తెలుగు',
          ha: 'Hausa',
          tr: 'Türkçe'
        }
      }
    },
    fr: {
      title: 'Documentation EverRise',
      subtitle: 'Découvrez l\'actif révolutionnaire aux prix non négociables',
      litepaper: {
        title: 'Livre blanc EverRise',
        description: 'Lisez notre livre blanc complet pour comprendre les mécanismes centraux, la formule de prix et la vision d\'EverRise.',
        downloadText: 'Lire en ligne',
        downloadLink: `/litepaper/${lang}`
      },
      videos: {
        title: 'Vidéos éducatives',
        description: 'Regardez notre série de vidéos expliquant les concepts et mécanismes d\'EverRise',
        items: [
          {
            title: 'Introduction à EverRise',
            description: 'Apprenez les bases d\'EverRise et pourquoi il représente un nouveau paradigme dans les actifs numériques',
            videoId: 'js4fexx_Lec',
            duration: '5:30'
          },
          {
            title: 'Comprendre la courbe de liaison',
            description: 'Plongée profonde dans la façon dont la courbe de liaison assure l\'appréciation perpétuelle des prix',
            videoId: 'bStvWbUdsMw',
            duration: '8:15'
          },
          {
            title: 'Système d\'affiliation expliqué',
            description: 'Comment fonctionne le programme de marketing d\'affiliation et comment gagner des commissions',
            videoId: 'PLACEHOLDER_VIDEO_ID_3_FR',
            duration: '6:45'
          },
          {
            title: 'Trésorerie et feuille de route future',
            description: 'Découvrez nos plans pour l\'entreprise de trésorerie d\'actifs numériques et le coffre-fort de staking',
            videoId: 'PLACEHOLDER_VIDEO_ID_4_FR',
            duration: '10:20'
          }
        ]
      },
      language: {
        label: 'Langue',
        options: {
          en: 'English',
          zh: '普通话',
          hi: 'हिंदी',
          es: 'Español',
          ar: 'العربية',
          fr: 'Français',
          bn: 'বাংলা',
          pt: 'Português',
          ru: 'Русский',
          id: 'Bahasa Indonesia',
          ur: 'اردو',
          de: 'Deutsch',
          ja: '日本語',
          na: 'Naijá',
          ms: 'مصري',
          mr: 'मराठी',
          vi: 'Tiếng Việt',
          te: 'తెలుగు',
          ha: 'Hausa',
          tr: 'Türkçe'
        }
      }
    },
    bn: {
      title: 'EverRise ডকুমেন্টেশন',
      subtitle: 'বিপ্লবী অ-দরকষাকষি মূল্য সম্পদ সম্পর্কে জানুন',
      litepaper: {
        title: 'EverRise লাইটপেপার',
        description: 'EverRise-এর মূল যান্ত্রিকতা, মূল্য নির্ধারণ সূত্র এবং দৃষ্টিভঙ্গি বুঝতে আমাদের বিস্তৃত লাইটপেপার পড়ুন।',
        downloadText: 'অনলাইনে পড়ুন',
        downloadLink: `/litepaper/${lang}`
      },
      videos: {
        title: 'শিক্ষামূলক ভিডিও',
        description: 'EverRise ধারণা এবং যান্ত্রিকতা ব্যাখ্যা করে আমাদের ভিডিও সিরিজ দেখুন',
        items: [
          { title: 'EverRise পরিচিতি', videoId: 'js4fexx_Lec', duration: '5:30' },
          { title: 'Phantom ওয়ালেট ইনস্টল করার方法', videoId: 'bStvWbUdsMw', duration: '8:15' },
          { title: 'অনুমোদিত বিপণন প্রোগ্রাম', videoId: 'PLACEHOLDER_VIDEO_ID_3', duration: '6:20' },
          { title: 'ভবিষ্যতের পরিকল্পনা', videoId: 'PLACEHOLDER_VIDEO_ID_4', duration: '10:20' }
        ]
      },
      language: {
        label: 'ভাষা',
        options: {
          en: 'English',
          zh: '普通话',
          hi: 'हिंदी',
          es: 'Español',
          ar: 'العربية',
          fr: 'Français',
          bn: 'বাংলা',
          pt: 'Português',
          ru: 'Русский',
          id: 'Bahasa Indonesia',
          ur: 'اردو',
          de: 'Deutsch',
          ja: '日本語',
          na: 'Naijá',
          ms: 'مصري',
          mr: 'मराठी',
          vi: 'Tiếng Việt',
          te: 'తెలుగు',
          ha: 'Hausa',
          tr: 'Türkçe'
        }
      }
    },
    pt: {
      title: 'Documentação EverRise',
      subtitle: 'Aprenda sobre o ativo de preço não-negociável revolucionário',
      litepaper: {
        title: 'Litepaper EverRise',
        description: 'Leia nosso litepaper abrangente para entender as mecânicas centrais, fórmula de preço e visão do EverRise.',
        downloadText: 'Ler Online',
        downloadLink: `/litepaper/${lang}`
      },
      videos: {
        title: 'Vídeos Educacionais',
        description: 'Assista nossa série de vídeos explicando conceitos e mecânicas do EverRise',
        items: [
          { title: 'Introdução ao EverRise', videoId: 'js4fexx_Lec', duration: '5:30' },
          { title: 'Como Instalar Phantom Wallet', videoId: 'bStvWbUdsMw', duration: '8:15' },
          { title: 'Programa de Afiliados', videoId: 'PLACEHOLDER_VIDEO_ID_3', duration: '6:20' },
          { title: 'Planos Futuros', videoId: 'PLACEHOLDER_VIDEO_ID_4', duration: '10:20' }
        ]
      },
      language: {
        label: 'Idioma',
        options: {
          en: 'English',
          zh: '普通话',
          hi: 'हिंदी',
          es: 'Español',
          ar: 'العربية',
          fr: 'Français',
          bn: 'বাংলা',
          pt: 'Português',
          ru: 'Русский',
          id: 'Bahasa Indonesia',
          ur: 'اردو',
          de: 'Deutsch',
          ja: '日本語',
          na: 'Naijá',
          ms: 'مصري',
          mr: 'मराठी',
          vi: 'Tiếng Việt',
          te: 'తెలుగు',
          ha: 'Hausa',
          tr: 'Türkçe'
        }
      }
    },
    ru: {
      title: 'Документация EverRise',
      subtitle: 'Узнайте о революционном активе с необсуждаемой ценой',
      litepaper: {
        title: 'Лайтпейпер EverRise',
        description: 'Прочитайте наш подробный лайтпейпер, чтобы понять основные механики, формулу ценообразования и видение EverRise.',
        downloadText: 'Читать Онлайн',
        downloadLink: `/litepaper/${lang}`
      },
      videos: {
        title: 'Обучающие Видео',
        description: 'Посмотрите нашу серию видео, объясняющих концепции и механики EverRise',
        items: [
          { title: 'Введение в EverRise', videoId: 'js4fexx_Lec', duration: '5:30' },
          { title: 'Как Установить Phantom Кошелек', videoId: 'bStvWbUdsMw', duration: '8:15' },
          { title: 'Партнерская Программа', videoId: 'PLACEHOLDER_VIDEO_ID_3', duration: '6:20' },
          { title: 'Будущие Планы', videoId: 'PLACEHOLDER_VIDEO_ID_4', duration: '10:20' }
        ]
      },
      language: {
        label: 'Язык',
        options: {
          en: 'English',
          zh: '普通话',
          hi: 'हिंदी',
          es: 'Español',
          ar: 'العربية',
          fr: 'Français',
          bn: 'বাংলা',
          pt: 'Português',
          ru: 'Русский',
          id: 'Bahasa Indonesia',
          ur: 'اردو',
          de: 'Deutsch',
          ja: '日本語',
          na: 'Naijá',
          ms: 'مصري',
          mr: 'मराठी',
          vi: 'Tiếng Việt',
          te: 'తెలుగు',
          ha: 'Hausa',
          tr: 'Türkçe'
        }
      }
    },
    id: {
      title: 'Dokumentasi EverRise',
      subtitle: 'Pelajari tentang aset harga yang tidak dapat dinegosiasikan yang revolusioner',
      litepaper: {
        title: 'Litepaper EverRise',
        description: 'Baca litepaper komprehensif kami untuk memahami mekanika inti, rumus harga, dan visi EverRise.',
        downloadText: 'Baca Online',
        downloadLink: `/litepaper/${lang}`
      },
      videos: {
        title: 'Video Edukasi',
        description: 'Tonton seri video kami yang menjelaskan konsep dan mekanika EverRise',
        items: [
          { title: 'Pengenalan EverRise', videoId: 'js4fexx_Lec', duration: '5:30' },
          { title: 'Rumus Harga', videoId: 'bStvWbUdsMw', duration: '8:45' },
          { title: 'Program Afiliasi', videoId: 'PLACEHOLDER_VIDEO_ID_3', duration: '6:20' },
          { title: 'Rencana Masa Depan', videoId: 'PLACEHOLDER_VIDEO_ID_4', duration: '10:20' }
        ]
      },
      language: {
        label: 'Bahasa',
        options: {
          en: 'English',
          zh: '普通话',
          hi: 'हिंदी',
          es: 'Español',
          ar: 'العربية',
          fr: 'Français',
          bn: 'বাংলা',
          pt: 'Português',
          ru: 'Русский',
          id: 'Bahasa Indonesia',
          ur: 'اردو',
          de: 'Deutsch',
          ja: '日本語',
          na: 'Naijá',
          ms: 'مصري',
          mr: 'मराठी',
          vi: 'Tiếng Việt',
          te: 'తెలుగు',
          ha: 'Hausa',
          tr: 'Türkçe'
        }
      }
    },
    ur: {
      title: 'EverRise دستاویزات',
      subtitle: 'انقلابی غیر قابل مذاکرات قیمت کے اثاثے کے بارے میں جانیں',
      litepaper: {
        title: 'EverRise لائٹ پیپر',
        description: 'EverRise کے مرکزی میکانیات، قیمت کے فارمولے اور وژن کو سمجھنے کے لیے ہمارا جامع لائٹ پیپر پڑھیں۔',
        downloadText: 'آن لائن پڑھیں',
        downloadLink: `/litepaper/${lang}`
      },
      videos: {
        title: 'تعلیمی ویڈیوز',
        description: 'EverRise تصورات اور میکانیات کی وضاحت کرنے والی ہماری ویڈیو سیریز دیکھیں',
        items: [
          { title: 'EverRise کا تعارف', videoId: 'js4fexx_Lec', duration: '5:30' },
          { title: 'قیمت کا فارمولا', videoId: 'bStvWbUdsMw', duration: '8:45' },
          { title: 'ایفیلی ایٹ پروگرام', videoId: 'PLACEHOLDER_VIDEO_ID_3', duration: '6:20' },
          { title: 'مستقبل کے منصوبے', videoId: 'PLACEHOLDER_VIDEO_ID_4', duration: '10:20' }
        ]
      },
      language: {
        label: 'زبان',
        options: {
          en: 'English',
          zh: '普通话',
          hi: 'हिंदी',
          es: 'Español',
          ar: 'العربية',
          fr: 'Français',
          bn: 'বাংলা',
          pt: 'Português',
          ru: 'Русский',
          id: 'Bahasa Indonesia',
          ur: 'اردو',
          de: 'Deutsch',
          ja: '日本語',
          na: 'Naijá',
          ms: 'مصري',
          mr: 'मराठी',
          vi: 'Tiếng Việt',
          te: 'తెలుగు',
          ha: 'Hausa',
          tr: 'Türkçe'
        }
      }
    },
    de: {
      title: 'EverRise Dokumentation',
      subtitle: 'Erfahren Sie mehr über das revolutionäre nicht verhandelbare Preis-Asset',
      litepaper: {
        title: 'EverRise Litepaper',
        description: 'Lesen Sie unser umfassendes Litepaper, um die Kernmechaniken, Preisformel und Vision von EverRise zu verstehen.',
        downloadText: 'Online Lesen',
        downloadLink: `/litepaper/${lang}`
      },
      videos: {
        title: 'Bildungsvideos',
        description: 'Schauen Sie sich unsere Videoserie an, die EverRise-Konzepte und -Mechaniken erklärt',
        items: [
          { title: 'EverRise Einführung', videoId: 'js4fexx_Lec', duration: '5:30' },
          { title: 'Phantom Wallet Installieren', videoId: 'bStvWbUdsMw', duration: '8:15' },
          { title: 'Affiliate-Programm', videoId: 'PLACEHOLDER_VIDEO_ID_3', duration: '6:20' },
          { title: 'Zukunftspläne', videoId: 'PLACEHOLDER_VIDEO_ID_4', duration: '10:20' }
        ]
      },
      language: {
        label: 'Sprache',
        options: {
          en: 'English',
          zh: '普通话',
          hi: 'हिंदी',
          es: 'Español',
          ar: 'العربية',
          fr: 'Français',
          bn: 'বাংলা',
          pt: 'Português',
          ru: 'Русский',
          id: 'Bahasa Indonesia',
          ur: 'اردو',
          de: 'Deutsch',
          ja: '日本語',
          na: 'Naijá',
          ms: 'مصري',
          mr: 'मराठी',
          vi: 'Tiếng Việt',
          te: 'తెలుగు',
          ha: 'Hausa',
          tr: 'Türkçe'
        }
      }
    },
    ja: {
      title: 'EverRise ドキュメント',
      subtitle: '革命的な交渉不可能な価格アセットについて学ぶ',
      litepaper: {
        title: 'EverRise ライトペーパー',
        description: 'EverRiseのコアメカニクス、価格公式、ビジョンを理解するために、包括的なライトペーパーをお読みください。',
        downloadText: 'オンラインで読む',
        downloadLink: `/litepaper/${lang}`
      },
      videos: {
        title: '教育ビデオ',
        description: 'EverRiseの概念とメカニクスを説明するビデオシリーズをご覧ください',
        items: [
          { title: 'EverRise紹介', videoId: 'js4fexx_Lec', duration: '5:30' },
          { title: 'Phantomウォレットのインストール方法', videoId: 'bStvWbUdsMw', duration: '8:15' },
          { title: 'アフィリエイトプログラム', videoId: 'PLACEHOLDER_VIDEO_ID_3', duration: '6:20' },
          { title: '将来の計画', videoId: 'PLACEHOLDER_VIDEO_ID_4', duration: '10:20' }
        ]
      },
      language: {
        label: '言語',
        options: {
          en: 'English',
          zh: '普通话',
          hi: 'हिंदी',
          es: 'Español',
          ar: 'العربية',
          fr: 'Français',
          bn: 'বাংলা',
          pt: 'Português',
          ru: 'Русский',
          id: 'Bahasa Indonesia',
          ur: 'اردو',
          de: 'Deutsch',
          ja: '日本語',
          na: 'Naijá',
          ms: 'مصري',
          mr: 'मराठी',
          vi: 'Tiếng Việt',
          te: 'తెలుగు',
          ha: 'Hausa',
          tr: 'Türkçe'
        }
      }
    },
    na: {
      title: 'EverRise Documentation',
      subtitle: 'Learn about di revolutionary unhaggleable price asset',
      litepaper: {
        title: 'EverRise Litepaper',
        description: 'Read our comprehensive litepaper to understand di core mechanics, pricing formula, and vision of EverRise.',
        downloadText: 'Read Online',
        downloadLink: `/litepaper/${lang}`
      },
      videos: {
        title: 'Educational Videos',
        description: 'Watch our video series explaining EverRise concepts and mechanics',
        items: [
          { title: 'EverRise Introduction', videoId: 'js4fexx_Lec', duration: '5:30' },
          { title: 'How to Install Phantom Wallet', videoId: 'bStvWbUdsMw', duration: '8:15' },
          { title: 'Affiliate Program', videoId: 'PLACEHOLDER_VIDEO_ID_3', duration: '6:20' },
          { title: 'Future Plans', videoId: 'PLACEHOLDER_VIDEO_ID_4', duration: '10:20' }
        ]
      },
      language: {
        label: 'Language',
        options: {
          en: 'English',
          zh: '普通话',
          hi: 'हिंदी',
          es: 'Español',
          ar: 'العربية',
          fr: 'Français',
          bn: 'বাংলা',
          pt: 'Português',
          ru: 'Русский',
          id: 'Bahasa Indonesia',
          ur: 'اردو',
          de: 'Deutsch',
          ja: '日本語',
          na: 'Naijá',
          ms: 'مصري',
          mr: 'मराठी',
          vi: 'Tiếng Việt',
          te: 'తెలుగు',
          ha: 'Hausa',
          tr: 'Türkçe'
        }
      }
    },
    ms: {
      title: 'وثائق EverRise',
      subtitle: 'تعلم عن الأصل الثوري ذو السعر غير القابل للتفاوض',
      litepaper: {
        title: 'الورقة البيضاء EverRise',
        description: 'اقرأ ورقتنا البيضاء الشاملة لفهم الآليات الأساسية وصيغة التسعير ورؤية EverRise.',
        downloadText: 'اقرأ عبر الإنترنت',
        downloadLink: `/litepaper/${lang}`
      },
      videos: {
        title: 'فيديوهات تعليمية',
        description: 'شاهد سلسلة الفيديوهات الخاصة بنا التي تشرح مفاهيم وآليات EverRise',
        items: [
          { title: 'مقدمة EverRise', videoId: 'js4fexx_Lec', duration: '5:30' },
          { title: 'صيغة التسعير', videoId: 'bStvWbUdsMw', duration: '8:45' },
          { title: 'برنامج الشراكة', videoId: 'PLACEHOLDER_VIDEO_ID_3', duration: '6:20' },
          { title: 'الخطط المستقبلية', videoId: 'PLACEHOLDER_VIDEO_ID_4', duration: '10:20' }
        ]
      },
      language: {
        label: 'اللغة',
        options: {
          en: 'English',
          zh: '普通话',
          hi: 'हिंदी',
          es: 'Español',
          ar: 'العربية',
          fr: 'Français',
          bn: 'বাংলা',
          pt: 'Português',
          ru: 'Русский',
          id: 'Bahasa Indonesia',
          ur: 'اردو',
          de: 'Deutsch',
          ja: '日本語',
          na: 'Naijá',
          ms: 'مصري',
          mr: 'मराठी',
          vi: 'Tiếng Việt',
          te: 'తెలుగు',
          ha: 'Hausa',
          tr: 'Türkçe'
        }
      }
    },
    mr: {
      title: 'EverRise दस्तावेज',
      subtitle: 'क्रांतिकारी न-वाटाघाटीय किंमत मालमत्तेबद्दल जाणून घ्या',
      litepaper: {
        title: 'EverRise लाइटपेपर',
        description: 'EverRise च्या मुख्य यंत्रणा, किंमत सूत्र आणि दृष्टिकोन समजून घेण्यासाठी आमचे व्यापक लाइटपेपर वाचा.',
        downloadText: 'ऑनलाइन वाचा',
        downloadLink: `/litepaper/${lang}`
      },
      videos: {
        title: 'शैक्षणिक व्हिडिओ',
        description: 'EverRise संकल्पना आणि यंत्रणा स्पष्ट करणारी आमची व्हिडिओ मालिका पहा',
        items: [
          { title: 'EverRise परिचय', videoId: 'js4fexx_Lec', duration: '5:30' },
          { title: 'किंमत सूत्र', videoId: 'bStvWbUdsMw', duration: '8:45' },
          { title: 'संलग्न कार्यक्रम', videoId: 'PLACEHOLDER_VIDEO_ID_3', duration: '6:20' },
          { title: 'भविष्यातील योजना', videoId: 'PLACEHOLDER_VIDEO_ID_4', duration: '10:20' }
        ]
      },
      language: {
        label: 'भाषा',
        options: {
          en: 'English',
          zh: '普通话',
          hi: 'हिंदी',
          es: 'Español',
          ar: 'العربية',
          fr: 'Français',
          bn: 'বাংলা',
          pt: 'Português',
          ru: 'Русский',
          id: 'Bahasa Indonesia',
          ur: 'اردو',
          de: 'Deutsch',
          ja: '日本語',
          na: 'Naijá',
          ms: 'مصري',
          mr: 'मराठी',
          vi: 'Tiếng Việt',
          te: 'తెలుగు',
          ha: 'Hausa',
          tr: 'Türkçe'
        }
      }
    },
    vi: {
      title: 'Tài liệu EverRise',
      subtitle: 'Tìm hiểu về tài sản giá cả không thể thương lượng cách mạng',
      litepaper: {
        title: 'Sách Trắng EverRise',
        description: 'Đọc sách trắng toàn diện của chúng tôi để hiểu các cơ chế cốt lõi, công thức giá và tầm nhìn của EverRise.',
        downloadText: 'Đọc Trực tuyến',
        downloadLink: `/litepaper/${lang}`
      },
      videos: {
        title: 'Video Giáo dục',
        description: 'Xem loạt video của chúng tôi giải thích các khái niệm và cơ chế EverRise',
        items: [
          { title: 'Giới thiệu EverRise', videoId: 'js4fexx_Lec', duration: '5:30' },
          { title: 'Công thức Giá', videoId: 'bStvWbUdsMw', duration: '8:45' },
          { title: 'Chương trình Tiếp thị Liên kết', videoId: 'PLACEHOLDER_VIDEO_ID_3', duration: '6:20' },
          { title: 'Kế hoạch Tương lai', videoId: 'PLACEHOLDER_VIDEO_ID_4', duration: '10:20' }
        ]
      },
      language: {
        label: 'Ngôn ngữ',
        options: {
          en: 'English',
          zh: '普通话',
          hi: 'हिंदी',
          es: 'Español',
          ar: 'العربية',
          fr: 'Français',
          bn: 'বাংলা',
          pt: 'Português',
          ru: 'Русский',
          id: 'Bahasa Indonesia',
          ur: 'اردو',
          de: 'Deutsch',
          ja: '日本語',
          na: 'Naijá',
          ms: 'مصري',
          mr: 'मराठी',
          vi: 'Tiếng Việt',
          te: 'తెలుగు',
          ha: 'Hausa',
          tr: 'Türkçe'
        }
      }
    },
    te: {
      title: 'EverRise డాక్యుమెంటేషన్',
      subtitle: 'విప్లవాత్మక చర్చించలేని ధర ఆస్తి గురించి తెలుసుకోండి',
      litepaper: {
        title: 'EverRise లైట్ పేపర్',
        description: 'EverRise యొక్క కోర్ మెకానిక్స్, ధర సూత్రం మరియు దృష్టిని అర్థం చేసుకోవడానికి మా సమగ్ర లైట్ పేపర్ చదవండి.',
        downloadText: 'ఆన్‌లైన్ చదవండి',
        downloadLink: `/litepaper/${lang}`
      },
      videos: {
        title: 'విద్యాపరమైన వీడియోలు',
        description: 'EverRise భావనలు మరియు మెకానిక్స్‌ను వివరించే మా వీడియో సిరీస్ చూడండి',
        items: [
          { title: 'EverRise పరిచయం', videoId: 'js4fexx_Lec', duration: '5:30' },
          { title: 'ధర సూత్రం', videoId: 'bStvWbUdsMw', duration: '8:45' },
          { title: 'అనుబంధ కార్యక్రమం', videoId: 'PLACEHOLDER_VIDEO_ID_3', duration: '6:20' },
          { title: 'భవిష్యత్ ప్రణాళికలు', videoId: 'PLACEHOLDER_VIDEO_ID_4', duration: '10:20' }
        ]
      },
      language: {
        label: 'భాష',
        options: {
          en: 'English',
          zh: '普通话',
          hi: 'हिंदी',
          es: 'Español',
          ar: 'العربية',
          fr: 'Français',
          bn: 'বাংলা',
          pt: 'Português',
          ru: 'Русский',
          id: 'Bahasa Indonesia',
          ur: 'اردو',
          de: 'Deutsch',
          ja: '日本語',
          na: 'Naijá',
          ms: 'مصري',
          mr: 'मराठी',
          vi: 'Tiếng Việt',
          te: 'తెలుగు',
          ha: 'Hausa',
          tr: 'Türkçe'
        }
      }
    },
    ha: {
      title: 'Takardun EverRise',
      subtitle: 'Koyi game da sabon kadari na farashin da ba za a iya tattaunawa ba',
      litepaper: {
        title: 'Litepaper na EverRise',
        description: 'Karanta litepaper ɗin mu na cikakke don fahimtar ainihin hanyoyin aiki, tsarin farashi, da hangen nesa na EverRise.',
        downloadText: 'Karanta A Kan Layi',
        downloadLink: `/litepaper/${lang}`
      },
      videos: {
        title: 'Bidiyoyin Ilimi',
        description: 'Kalli jerin bidiyon mu wanda ke bayyana ra\'ayoyin da hanyoyin aiki na EverRise',
        items: [
          { title: 'Gabatarwar EverRise', videoId: 'js4fexx_Lec', duration: '5:30' },
          { title: 'Tsarin Farashi', videoId: 'bStvWbUdsMw', duration: '8:45' },
          { title: 'Shirin Hadin Kai', videoId: 'PLACEHOLDER_VIDEO_ID_3', duration: '6:20' },
          { title: 'Shirye-shiryen Gaba', videoId: 'PLACEHOLDER_VIDEO_ID_4', duration: '10:20' }
        ]
      },
      language: {
        label: 'Harshe',
        options: {
          en: 'English',
          zh: '普通话',
          hi: 'हिंदी',
          es: 'Español',
          ar: 'العربية',
          fr: 'Français',
          bn: 'বাংলা',
          pt: 'Português',
          ru: 'Русский',
          id: 'Bahasa Indonesia',
          ur: 'اردو',
          de: 'Deutsch',
          ja: '日本語',
          na: 'Naijá',
          ms: 'مصري',
          mr: 'मराठी',
          vi: 'Tiếng Việt',
          te: 'తెలుగు',
          ha: 'Hausa',
          tr: 'Türkçe'
        }
      }
    },
    tr: {
      title: 'EverRise Dokümantasyonu',
      subtitle: 'Devrimci pazarlık edilemeyen fiyat varlığı hakkında bilgi edinin',
      litepaper: {
        title: 'EverRise Litepaper',
        description: 'EverRise\'in temel mekaniklerini, fiyat formülünü ve vizyonunu anlamak için kapsamlı litepaper\'ımızı okuyun.',
        downloadText: 'Çevrimiçi Oku',
        downloadLink: `/litepaper/${lang}`
      },
      videos: {
        title: 'Eğitim Videoları',
        description: 'EverRise kavramlarını ve mekaniklerini açıklayan video serimizi izleyin',
        items: [
          { title: 'EverRise Giriş', videoId: 'js4fexx_Lec', duration: '5:30' },
          { title: 'Fiyat Formülü', videoId: 'bStvWbUdsMw', duration: '8:45' },
          { title: 'Bağlı Pazarlama Programı', videoId: 'PLACEHOLDER_VIDEO_ID_3', duration: '6:20' },
          { title: 'Gelecek Planları', videoId: 'PLACEHOLDER_VIDEO_ID_4', duration: '10:20' }
        ]
      },
      language: {
        label: 'Dil',
        options: {
          en: 'English',
          zh: '普通话',
          hi: 'हिंदी',
          es: 'Español',
          ar: 'العربية',
          fr: 'Français',
          bn: 'বাংলা',
          pt: 'Português',
          ru: 'Русский',
          id: 'Bahasa Indonesia',
          ur: 'اردو',
          de: 'Deutsch',
          ja: '日本語',
          na: 'Naijá',
          ms: 'مصري',
          mr: 'मराठी',
          vi: 'Tiếng Việt',
          te: 'తెలుగు',
          ha: 'Hausa',
          tr: 'Türkçe'
        }
      }
    }
  });

  const translations = getTranslations(selectedLanguage);
  const currentLang = translations[selectedLanguage as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{currentLang.title}</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">{currentLang.subtitle}</p>
            </div>
            
            {/* Language Dropdown */}
            <div className="flex items-center space-x-2">
              <label htmlFor="language-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {currentLang.language.label}:
              </label>
              <select
                id="language-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
              >
                {Object.entries(currentLang.language.options).map(([code, name]) => (
                  <option key={code} value={code} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Litepaper Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentLang.litepaper.title}</h2>
            <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
              {currentLang.litepaper.description}
            </p>
            <a
              href={currentLang.litepaper.downloadLink}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {currentLang.litepaper.downloadText}
            </a>
          </div>
        </div>

        {/* Videos Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentLang.videos.title}</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              {currentLang.videos.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {currentLang.videos.items.map((video, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{video.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{(video as { description?: string }).description || ''}</p>
                
                {/* Show Coming Soon for last 2 videos */}
                {index >= 2 ? (
                  <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🚧</div>
                      <p className="text-lg font-semibold text-gray-600">Coming Soon</p>
                      <p className="text-sm text-gray-500">This video will be available soon</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Embedded YouTube Video */}
                    <div className="aspect-video rounded-lg overflow-hidden mb-4">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${video.videoId}`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    </div>
                    
                    {/* Special note for Phantom wallet video */}
                    {video.videoId === 'bStvWbUdsMw' && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800">
                          <strong>💡 Important:</strong> After installing Phantom wallet, you&apos;ll need to purchase a few dollars worth of Solana (SOL) for transaction fees and the rest in USDC (USD Coin) which will be used to purchase {TOKEN_DISPLAY_NAME} ({TOKEN_TICKER}) tokens. You can buy these cryptocurrencies on exchanges like Coinbase, Binance, or directly through Phantom&apos;s built-in swap feature.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/"
              className="flex items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Live Trading</h4>
                <p className="text-sm text-gray-600">Start trading {TOKEN_TICKER} tokens</p>
              </div>
            </Link>
            
            <a
              href="https://t.me/+bUWN0_nj2Do4MDRl"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Telegram</h4>
                <p className="text-sm text-gray-600">Join our community</p>
              </div>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>© 2024 {DEX_DISPLAY_NAME}. All rights reserved.</p>
           <div className="mt-4 flex justify-center space-x-6">
             <a href="/docs" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
               Documentation
             </a>
             <a href="/litepaper/en" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
               Litepaper
             </a>
             <a href="https://t.me/+bUWN0_nj2Do4MDRl" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
               Telegram
             </a>
           </div>
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
            Built on Solana • Powered by {DEX_DISPLAY_NAME}
          </p>
        </div>
      </div>
    </div>
  );
}
