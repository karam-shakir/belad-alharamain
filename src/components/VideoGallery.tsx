import { videos } from '@/content/site';

export default function VideoGallery() {
  return (
    <section id="videos" className="py-24 bg-pattern relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-14 reveal">
          <span className="inline-block bg-gold text-white text-xs font-bold tracking-widest
                           uppercase px-4 py-1.5 rounded-full mb-4"
                data-ar="معرض الفيديو" data-en="Video Gallery">معرض الفيديو</span>
          <h2 className="text-3xl sm:text-4xl font-black text-teal-dark mb-4"
              data-ar="تجارب المواسم السابقة" data-en="Previous Season Experiences">
            تجارب المواسم السابقة
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto"
             data-ar="شاهد لقطات حصرية من مواسم الحج والعمرة السابقة وتجارب حجاجنا الكرام"
             data-en="Watch exclusive footage from previous Hajj and Umrah seasons and testimonials from our valued pilgrims">
            شاهد لقطات حصرية من مواسم الحج والعمرة السابقة وتجارب حجاجنا الكرام
          </p>
          <div className="gold-divider"><span><i className="fas fa-play-circle" /></span></div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" data-stagger>
          {videos.map((v, i) => (
            <div key={i}
                 className="group bg-white rounded-3xl overflow-hidden shadow-card
                            border border-gold/10 card-premium reveal-scale"
                 style={{ transitionDelay: `${i * 80}ms` }}>
              {/* Embed */}
              <div className="relative w-full aspect-video bg-teal-dark overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${v.youtubeId}?rel=0&modestbranding=1`}
                  title={v.title.ar}
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
                {/* Placeholder overlay (hides until iframe loads) */}
                <div className="absolute inset-0 flex items-center justify-center
                                bg-teal-dark pointer-events-none
                                group-hover:opacity-0 transition-opacity duration-300
                                [&_*]:pointer-events-none iframe-loaded:hidden">
                  <div className="w-14 h-14 rounded-full bg-gold/90 flex items-center
                                  justify-center shadow-gold animate-[float_3s_ease-in-out_infinite]">
                    <i className="fas fa-play text-white text-xl ms-1" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h4 className="font-black text-teal-dark mb-1"
                    data-ar={v.title.ar} data-en={v.title.en}>{v.title.ar}</h4>
                <p className="text-sm text-gray-500"
                   data-ar={v.subtitle.ar} data-en={v.subtitle.en}>{v.subtitle.ar}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Replace note */}
        <p className="text-center mt-8 text-xs text-gray-400 bg-white/60 backdrop-blur-sm
                      border border-gold/15 rounded-full px-6 py-2 w-fit mx-auto reveal"
           data-ar="* استبدل VIDEO_ID_1 … VIDEO_ID_6 بمعرّفات فيديوهاتك على يوتيوب"
           data-en="* Replace VIDEO_ID_1 … VIDEO_ID_6 with your YouTube video IDs">
          * استبدل VIDEO_ID_1 … VIDEO_ID_6 بمعرّفات فيديوهاتك على يوتيوب
        </p>

      </div>
    </section>
  );
}
