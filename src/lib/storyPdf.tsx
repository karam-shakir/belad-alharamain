/* eslint-disable jsx-a11y/alt-text */
import {
  Document, Page, View, Text, Image, Font, StyleSheet, pdf,
} from '@react-pdf/renderer';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Style = any;
import {
  STORY_CHAPTERS, STORY_COVER, STORY_DEDICATION, STORY_BRAND,
  STORY_CLOSING, STORY_BACK_COVER, type ChapterKey, type Chapter,
} from './storyTemplate';

/* ─────────────────────────────────────────────────────────────
 *  PDF template for "قصّتي" — bilingual Hajj memory book.
 *  Built with @react-pdf/renderer (no headless browser).
 *
 *  Renders only the chapters whose photo was uploaded — the
 *  flow stays coherent regardless of how many chapters exist.
 * ───────────────────────────────────────────────────────────── */

/* ── Register Arabic + Latin fonts (Google Fonts CDN) ─── */
Font.register({
  family: 'Cairo',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOA-d1g.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOA-d1g.ttf', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOA-d1g.ttf', fontWeight: 700 },
    { src: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOA-d1g.ttf', fontWeight: 900 },
  ],
});
Font.register({
  family: 'Poppins',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/poppins/v22/pxiEyp8kv8JHgFVrJJfecnFHGPc.ttf', fontWeight: 400, fontStyle: 'italic' },
    { src: 'https://fonts.gstatic.com/s/poppins/v22/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.ttf', fontWeight: 600 },
  ],
});

/* ── Palette (matches site design system) ─── */
const C = {
  gold:      '#A88B4A',
  goldLight: '#C4A55E',
  goldDark:  '#7D6530',
  teal:      '#1F7A8C',
  tealDark:  '#155E6B',
  cream:     '#FFFCF5',
  paper:     '#FAFAF7',
  ink:       '#1a1a1a',
  muted:     '#4a4a4a',
} as const;

const s = StyleSheet.create({
  /* Page base */
  page: {
    backgroundColor: C.cream,
    paddingTop:    50,
    paddingBottom: 50,
    paddingLeft:   42,
    paddingRight:  42,
    fontFamily:    'Cairo',
  },
  /* Outer gold border (decorative frame) */
  borderOuter: {
    position: 'absolute',
    top: 18, bottom: 18, left: 18, right: 18,
    borderWidth: 2,
    borderColor: C.gold,
    borderRadius: 4,
  },
  borderInner: {
    position: 'absolute',
    top: 26, bottom: 26, left: 26, right: 26,
    borderWidth: 0.8,
    borderColor: C.goldLight,
    borderRadius: 2,
  },

  /* COVER */
  coverWrap:   { flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center' },
  coverBrand:  { fontSize: 11, color: C.goldDark, letterSpacing: 2, textAlign: 'center', marginBottom: 28, fontWeight: 600 },
  coverTitleAr:{ fontSize: 64, fontWeight: 900, color: C.tealDark, letterSpacing: 2, marginBottom: 4, textAlign: 'center' },
  coverTitleEn:{ fontFamily: 'Poppins', fontSize: 14, color: C.goldDark, letterSpacing: 6, fontWeight: 600, marginBottom: 32, textAlign: 'center' },
  coverDivider:{ width: 80, height: 1.5, backgroundColor: C.gold, marginBottom: 28, alignSelf: 'center' },
  coverName:   { fontSize: 30, fontWeight: 900, color: C.goldDark, textAlign: 'center', marginBottom: 24, letterSpacing: 1 },
  coverSubAr:  { fontSize: 14, color: C.muted, textAlign: 'center', marginBottom: 2 },
  coverSubEn:  { fontFamily: 'Poppins', fontSize: 10, color: C.goldDark, textAlign: 'center', fontStyle: 'italic', marginBottom: 30, letterSpacing: 1 },
  coverYear:   { fontSize: 18, color: C.tealDark, fontWeight: 700, textAlign: 'center', letterSpacing: 1 },
  coverFooter: { position: 'absolute', bottom: 56, left: 42, right: 42, textAlign: 'center' },
  coverFooterAr:{ fontSize: 11, color: C.goldDark, textAlign: 'center', fontWeight: 700 },
  coverFooterEn:{ fontFamily: 'Poppins', fontSize: 9, color: C.muted, textAlign: 'center', marginTop: 2, letterSpacing: 1 },

  /* DEDICATION */
  dedicWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  dedicGreetAr: { fontSize: 18, fontWeight: 700, color: C.tealDark, textAlign: 'center', marginBottom: 4 },
  dedicGreetEn: { fontFamily: 'Poppins', fontSize: 10, color: C.goldDark, textAlign: 'center', fontStyle: 'italic', letterSpacing: 1, marginBottom: 26 },
  dedicBodyAr:  { fontSize: 13, color: C.ink, textAlign: 'center', lineHeight: 1.9, marginBottom: 20 },
  dedicBodyEn:  { fontFamily: 'Poppins', fontSize: 9.5, color: C.muted, textAlign: 'center', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 28 },
  citationBox:  { borderTopWidth: 0.6, borderBottomWidth: 0.6, borderColor: C.gold, paddingVertical: 12, marginVertical: 14, marginHorizontal: 28 },
  citationAr:   { fontSize: 13, color: C.tealDark, textAlign: 'center', fontWeight: 700, lineHeight: 1.8 },
  citationRef:  { fontSize: 9, color: C.goldDark, textAlign: 'center', marginTop: 6 },
  citationEn:   { fontFamily: 'Poppins', fontSize: 8.5, color: C.muted, textAlign: 'center', fontStyle: 'italic', marginTop: 6, lineHeight: 1.5 },
  dedicSigAr:   { fontSize: 11, color: C.goldDark, textAlign: 'center', marginTop: 22, fontWeight: 700 },
  dedicSigEn:   { fontFamily: 'Poppins', fontSize: 8.5, color: C.muted, textAlign: 'center', fontStyle: 'italic', marginTop: 2 },

  /* CHAPTER PAGE */
  chHeader:   { alignItems: 'center', marginBottom: 12 },
  chBadge:    { fontFamily: 'Poppins', fontSize: 9, color: C.goldDark, letterSpacing: 4, marginBottom: 4 },
  chTitleAr:  { fontSize: 22, fontWeight: 900, color: C.tealDark, textAlign: 'center', marginBottom: 2 },
  chTitleEn:  { fontFamily: 'Poppins', fontSize: 10, color: C.goldDark, fontStyle: 'italic', textAlign: 'center', letterSpacing: 1.5, marginBottom: 10 },
  chDivider:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  chDivLine:  { width: 50, height: 0.8, backgroundColor: C.gold },
  chDivMark:  { fontSize: 10, color: C.gold, marginHorizontal: 8 },
  chImage:    { width: '92%', height: 240, alignSelf: 'center', borderWidth: 2, borderColor: C.gold, borderRadius: 3, marginBottom: 14, objectFit: 'cover' },
  chProseAr:  { fontSize: 12, color: C.ink, textAlign: 'center', lineHeight: 1.95, marginBottom: 10, paddingHorizontal: 14 },
  chProseEn:  { fontFamily: 'Poppins', fontSize: 9, color: C.muted, textAlign: 'center', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 10, paddingHorizontal: 18 },

  /* CLOSING */
  closeWrap:  { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  closeDuaAr: { fontSize: 18, color: C.tealDark, fontWeight: 700, textAlign: 'center', lineHeight: 2.2, marginBottom: 10 },
  closeDuaEn: { fontFamily: 'Poppins', fontSize: 10, color: C.goldDark, fontStyle: 'italic', textAlign: 'center', lineHeight: 1.8, marginBottom: 30 },
  closeThanksAr: { fontSize: 12, color: C.muted, textAlign: 'center', lineHeight: 1.9, marginBottom: 8 },
  closeThanksEn: { fontFamily: 'Poppins', fontSize: 9, color: C.muted, textAlign: 'center', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 28 },
  closeSigAr: { fontSize: 12, color: C.goldDark, textAlign: 'center', fontWeight: 700, marginTop: 12 },
  closeSigEn: { fontFamily: 'Poppins', fontSize: 9, color: C.muted, textAlign: 'center', fontStyle: 'italic', marginTop: 2 },

  /* BACK COVER */
  backWrap:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backInvAr:   { fontSize: 22, color: C.tealDark, fontWeight: 900, marginBottom: 4 },
  backInvEn:   { fontFamily: 'Poppins', fontSize: 11, color: C.goldDark, fontStyle: 'italic', letterSpacing: 3, marginBottom: 28 },
  backQrBox:   { borderWidth: 1.5, borderColor: C.gold, padding: 10, backgroundColor: '#fff', borderRadius: 4 },
  backScanAr:  { fontSize: 9.5, color: C.goldDark, textAlign: 'center', marginTop: 12, fontWeight: 700 },
  backScanEn:  { fontFamily: 'Poppins', fontSize: 8, color: C.muted, textAlign: 'center', marginTop: 2, fontStyle: 'italic' },
  backDomain:  { fontFamily: 'Poppins', fontSize: 10, color: C.tealDark, textAlign: 'center', marginTop: 24, letterSpacing: 1, fontWeight: 600 },
  backCompAr:  { fontSize: 10, color: C.muted, textAlign: 'center', marginTop: 14 },
  backCompEn:  { fontFamily: 'Poppins', fontSize: 8.5, color: C.muted, textAlign: 'center', fontStyle: 'italic', marginTop: 2 },
});

/* ── Multi-line text helper (preserves \n) ─── */
function Para({ text, style }: { text: string; style: Style }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <Text key={i} style={style}>{line || ' '}</Text>
      ))}
    </>
  );
}

function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.borderOuter} />
      <View style={s.borderInner} />
      <View style={{ flex: 1 }}>{children}</View>
    </Page>
  );
}

/* ── The full Document ─── */
export function StoryDocument({
  pilgrimName, hajjYear, photos, qrDataUrl, shareUrl,
}: {
  pilgrimName: string;
  hajjYear:    string;
  photos:      Partial<Record<ChapterKey, string>>;
  qrDataUrl?:  string;
  shareUrl:    string;
}) {
  const availableChapters: Chapter[] = STORY_CHAPTERS.filter(c => photos[c.key]);

  return (
    <Document
      title={`قصّتي - ${pilgrimName} - ${hajjYear}هـ`}
      author={STORY_BRAND.companyAr}
      subject="My Hajj Story"
      language="ar"
    >
      {/* COVER */}
      <PageFrame>
        <View style={s.coverWrap}>
          <Text style={s.coverBrand}>{STORY_BRAND.companyAr}</Text>
          <Text style={s.coverTitleAr}>{STORY_COVER.titleAr}</Text>
          <Text style={s.coverTitleEn}>{STORY_COVER.titleEn.toUpperCase()}</Text>
          <View style={s.coverDivider} />
          <Text style={s.coverName}>{pilgrimName}</Text>
          <Text style={s.coverSubAr}>{STORY_COVER.subtitleAr}</Text>
          <Text style={s.coverSubEn}>{STORY_COVER.subtitleEn}</Text>
          <Text style={s.coverYear}>{hajjYear} هـ — Hajj {hajjYear} AH</Text>
        </View>
        <View style={s.coverFooter}>
          <Text style={s.coverFooterAr}>{STORY_BRAND.companyAr}</Text>
          <Text style={s.coverFooterEn}>{STORY_BRAND.companyEn}</Text>
        </View>
      </PageFrame>

      {/* DEDICATION */}
      <PageFrame>
        <View style={s.dedicWrap}>
          <Text style={s.dedicGreetAr}>{STORY_DEDICATION.greetingAr}: {pilgrimName}</Text>
          <Text style={s.dedicGreetEn}>{STORY_DEDICATION.greetingEn}</Text>
          <Para text={STORY_DEDICATION.bodyAr} style={s.dedicBodyAr} />
          <Para text={STORY_DEDICATION.bodyEn} style={s.dedicBodyEn} />
          <View style={s.citationBox}>
            <Text style={s.citationAr}>{STORY_DEDICATION.citation.textAr}</Text>
            <Text style={s.citationRef}>{STORY_DEDICATION.citation.refAr}</Text>
            {STORY_DEDICATION.citation.textEn && (
              <Text style={s.citationEn}>{STORY_DEDICATION.citation.textEn}</Text>
            )}
          </View>
          <Text style={s.dedicSigAr}>{STORY_DEDICATION.signatureAr}</Text>
          <Text style={s.dedicSigEn}>{STORY_DEDICATION.signatureEn}</Text>
        </View>
      </PageFrame>

      {/* CHAPTERS */}
      {availableChapters.map(ch => (
        <PageFrame key={ch.key}>
          <View style={s.chHeader}>
            <Text style={s.chBadge}>CHAPTER {ch.numberEn.toUpperCase()}  ·  الفصل {ch.numberAr}</Text>
            <Text style={s.chTitleAr}>{ch.titleAr}</Text>
            <Text style={s.chTitleEn}>{ch.titleEn}</Text>
            <View style={s.chDivider}>
              <View style={s.chDivLine} />
              <Text style={s.chDivMark}>✦</Text>
              <View style={s.chDivLine} />
            </View>
          </View>

          {photos[ch.key] && <Image src={photos[ch.key]!} style={s.chImage} />}

          <Para text={ch.proseAr} style={s.chProseAr} />
          <Para text={ch.proseEn} style={s.chProseEn} />

          {ch.citation && (
            <View style={s.citationBox}>
              <Text style={s.citationAr}>{ch.citation.textAr}</Text>
              <Text style={s.citationRef}>{ch.citation.refAr}</Text>
              {ch.citation.textEn && <Text style={s.citationEn}>{ch.citation.textEn}</Text>}
            </View>
          )}
        </PageFrame>
      ))}

      {/* CLOSING */}
      <PageFrame>
        <View style={s.closeWrap}>
          <Para text={STORY_CLOSING.duaAr} style={s.closeDuaAr} />
          <Para text={STORY_CLOSING.duaEn} style={s.closeDuaEn} />
          <Para text={STORY_CLOSING.thanksAr} style={s.closeThanksAr} />
          <Para text={STORY_CLOSING.thanksEn} style={s.closeThanksEn} />
          <Text style={s.closeSigAr}>🤍 — {STORY_CLOSING.signatureAr}</Text>
          <Text style={s.closeSigEn}>{STORY_CLOSING.signatureEn}</Text>
        </View>
      </PageFrame>

      {/* BACK COVER */}
      <PageFrame>
        <View style={s.backWrap}>
          <Text style={s.backInvAr}>{STORY_BACK_COVER.inviteAr}</Text>
          <Text style={s.backInvEn}>{STORY_BACK_COVER.inviteEn.toUpperCase()}</Text>
          {qrDataUrl && (
            <View style={s.backQrBox}>
              <Image src={qrDataUrl} style={{ width: 130, height: 130 }} />
            </View>
          )}
          <Text style={s.backScanAr}>{STORY_BACK_COVER.scanLabelAr}</Text>
          <Text style={s.backScanEn}>{STORY_BACK_COVER.scanLabelEn}</Text>
          <Text style={s.backDomain}>{shareUrl.replace(/^https?:\/\//, '')}</Text>
          <Text style={s.backCompAr}>{STORY_BRAND.companyAr}</Text>
          <Text style={s.backCompEn}>{STORY_BRAND.companyEn}</Text>
        </View>
      </PageFrame>
    </Document>
  );
}

/* ── Generate PDF as ArrayBuffer (server-side) ─── */
export async function renderStoryPdf(input: {
  pilgrimName: string;
  hajjYear:    string;
  photos:      Partial<Record<ChapterKey, string>>;
  qrDataUrl?:  string;
  shareUrl:    string;
}): Promise<ArrayBuffer> {
  const blob = await pdf(<StoryDocument {...input} />).toBlob();
  return await blob.arrayBuffer();
}
