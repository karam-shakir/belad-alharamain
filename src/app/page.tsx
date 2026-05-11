import Navbar          from '@/components/Navbar';
import Hero            from '@/components/Hero';
import About           from '@/components/About';
import Services        from '@/components/Services';
import Journey         from '@/components/Journey';
import VideoGallery    from '@/components/VideoGallery';
import Testimonials    from '@/components/Testimonials';
import Awards          from '@/components/Awards';
import Agencies        from '@/components/Agencies';
import Contact         from '@/components/Contact';
import Footer          from '@/components/Footer';
import FloatingElements from '@/components/FloatingElements';
import ScrollInit      from '@/components/ScrollInit';

export default function Home() {
  return (
    <>
      <ScrollInit />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Journey />
        <VideoGallery />
        <Testimonials />
        <Awards />
        <Agencies />
        <Contact />
      </main>
      <Footer />
      <FloatingElements />
    </>
  );
}
