'use client';

interface LitepaperLayoutProps {
  title: string;
  sections: Array<{
    id: string;
    title: string;
    content: string;
    subsections?: Array<{
      title: string;
      content: string;
    }>;
  }>;
  languageCode: string;
}

export default function LitepaperLayout({ title, sections, languageCode }: LitepaperLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-xl text-gray-600">Bitcoin pioneered money that cannot be printed. EverRise improved with prices that cannot be haggled.</p>
            <div className="mt-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {languageCode}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Table of Contents</h2>
          <nav className="flex flex-wrap gap-4">
            {sections.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {index + 1}. {section.title}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2">
                {index + 1}. {section.title}
              </h2>
              
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>

              {section.subsections && (
                <div className="mt-6 space-y-6">
                  {section.subsections.map((subsection, subIndex) => (
                    <div key={subIndex}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {subsection.title}
                      </h3>
                      <div 
                        className="text-gray-700 leading-relaxed whitespace-pre-line"
                        dangerouslySetInnerHTML={{ __html: subsection.content }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2024 EverRise. All rights reserved.</p>
          <p className="mt-2">
            <a href="/docs" className="text-blue-600 hover:text-blue-800">
              ← Back to Documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
