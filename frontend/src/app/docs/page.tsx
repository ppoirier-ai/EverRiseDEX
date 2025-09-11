'use client';

import { useState } from 'react';

export default function DocsPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const translations = {
    en: {
      title: 'EverRise Documentation',
      subtitle: 'Learn about the revolutionary unhaggleable price asset',
      litepaper: {
        title: 'EverRise Litepaper',
        description: 'Read our comprehensive litepaper to understand the core mechanics, pricing formula, and vision of EverRise.',
        downloadText: 'Download PDF',
        downloadLink: '/specs/EverRise - Litepaper (1).pdf'
      },
      videos: {
        title: 'Educational Videos',
        description: 'Watch our video series explaining EverRise concepts and mechanics',
        items: [
          {
            title: 'Introduction to EverRise',
            description: 'Learn the basics of EverRise and why it represents a new paradigm in digital assets',
            videoId: 'PLACEHOLDER_VIDEO_ID_1',
            duration: '5:30'
          },
          {
            title: 'Understanding the Bonding Curve',
            description: 'Deep dive into how the bonding curve ensures perpetual price appreciation',
            videoId: 'PLACEHOLDER_VIDEO_ID_2',
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
          es: 'Español',
          fr: 'Français',
          de: 'Deutsch',
          zh: '中文',
          ja: '日本語',
          ko: '한국어',
          pt: 'Português',
          ru: 'Русский',
          ar: 'العربية'
        }
      }
    },
    es: {
      title: 'Documentación de EverRise',
      subtitle: 'Aprende sobre el activo revolucionario con precios no negociables',
      litepaper: {
        title: 'Litepaper de EverRise',
        description: 'Lee nuestro litepaper completo para entender la mecánica central, fórmula de precios y visión de EverRise.',
        downloadText: 'Descargar PDF',
        downloadLink: '/specs/EverRise - Litepaper - Spanish.pdf'
      },
      videos: {
        title: 'Videos Educativos',
        description: 'Mira nuestra serie de videos explicando los conceptos y mecánicas de EverRise',
        items: [
          {
            title: 'Introducción a EverRise',
            description: 'Aprende los conceptos básicos de EverRise y por qué representa un nuevo paradigma en activos digitales',
            videoId: 'PLACEHOLDER_VIDEO_ID_1_ES',
            duration: '5:30'
          },
          {
            title: 'Entendiendo la Curva de Enlace',
            description: 'Análisis profundo de cómo la curva de enlace asegura la apreciación perpetua del precio',
            videoId: 'PLACEHOLDER_VIDEO_ID_2_ES',
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
          es: 'Español',
          fr: 'Français',
          de: 'Deutsch',
          zh: '中文',
          ja: '日本語',
          ko: '한국어',
          pt: 'Português',
          ru: 'Русский',
          ar: 'العربية'
        }
      }
    }
  };

  const currentLang = translations[selectedLanguage as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{currentLang.title}</h1>
              <p className="text-gray-600 mt-2">{currentLang.subtitle}</p>
            </div>
            
            {/* Language Dropdown */}
            <div className="flex items-center space-x-2">
              <label htmlFor="language-select" className="text-sm font-medium text-gray-700">
                {currentLang.language.label}:
              </label>
              <select
                id="language-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(currentLang.language.options).map(([code, name]) => (
                  <option key={code} value={code}>
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
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">YouTube Video</p>
                    <p className="text-xs text-gray-500">{video.duration}</p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{video.title}</h3>
                <p className="text-gray-600 text-sm">{video.description}</p>
                <div className="mt-4">
                  <a
                    href={`https://www.youtube.com/watch?v=${video.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Watch on YouTube
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="#trading"
              className="flex items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Live Trading</h4>
                <p className="text-sm text-gray-600">Start trading EVER tokens</p>
              </div>
            </a>
            
            <a
              href="https://github.com/everrise-dex"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">GitHub</h4>
                <p className="text-sm text-gray-600">View source code</p>
              </div>
            </a>
            
            <a
              href="mailto:support@everrise.com"
              className="flex items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Support</h4>
                <p className="text-sm text-gray-600">Get help & support</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
