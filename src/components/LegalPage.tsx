import Navbar           from '@/components/Navbar';
import Footer           from '@/components/Footer';
import FloatingElements from '@/components/FloatingElements';
import ScrollInit       from '@/components/ScrollInit';

interface Props {
  title: string;
  subtitle?: string;
  updatedAt?: string;
  children: React.ReactNode;
}

export default function LegalPage({ title, subtitle, updatedAt, children }: Props) {
  return (
    <>
      <ScrollInit />
      <Navbar />
      <main className="pt-24 pb-16 bg-pattern-white min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          <header className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-black text-teal-dark mb-3">{title}</h1>
            {subtitle && <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>}
            <div className="gold-divider mt-4"><span><i className="fas fa-scroll" /></span></div>
            {updatedAt && (
              <p className="text-xs text-gray-400 mt-2">آخر تحديث: {updatedAt}</p>
            )}
          </header>

          <article className="bg-white rounded-3xl border border-gold/15 shadow-card
                              p-6 sm:p-10 leading-loose text-gray-700
                              [&_h2]:text-xl [&_h2]:font-black [&_h2]:text-teal-dark
                              [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:flex [&_h2]:items-center [&_h2]:gap-2
                              [&_h2:first-child]:mt-0
                              [&_h3]:font-bold [&_h3]:text-teal-dark [&_h3]:mt-5 [&_h3]:mb-2
                              [&_p]:mb-4
                              [&_ul]:list-disc [&_ul]:ps-6 [&_ul]:mb-4 [&_ul]:space-y-1
                              [&_li]:leading-relaxed
                              [&_a]:text-gold [&_a]:font-semibold hover:[&_a]:text-gold-dark
                              [&_strong]:text-teal-dark [&_strong]:font-bold">
            {children}
          </article>

        </div>
      </main>
      <Footer />
      <FloatingElements />
    </>
  );
}
