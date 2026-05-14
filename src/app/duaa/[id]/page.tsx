import type { Metadata } from 'next';
import { getDuaa } from '@/lib/duaa';
import DuaaWallClient from '../DuaaWallClient';

const SITE = 'https://belad-alharamain.com';

export async function generateMetadata(
  { params }: { params: { id: string } },
): Promise<Metadata> {
  const duaa = await getDuaa(params.id).catch(() => null);

  if (!duaa || duaa.hidden) {
    return {
      title: 'تذكروني في دعائكم — بلاد الحرمين',
      description: 'حائط مفتوح للأمّة: شاركوا دعواتكم، وادعوا لإخوانكم.',
      alternates: { canonical: `${SITE}/duaa/${params.id}` },
    };
  }

  const name = duaa.name?.trim() || 'زائر كريم';
  const title = `دعاء من ${name}${duaa.country ? ` · ${duaa.country}` : ''}`;
  // Trim message for OG description (around 200 chars max)
  const snippet = duaa.message.length > 180 ? duaa.message.slice(0, 180) + '…' : duaa.message;
  const description = `"${snippet}" — شاركوني الدعاء عبر حائط بلاد الحرمين.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE}/duaa/${params.id}` },
    openGraph: {
      title,
      description,
      url: `${SITE}/duaa/${params.id}`,
      type: 'article',
      locale: 'ar_SA',
      siteName: 'بلاد الحرمين',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function Page({ params }: { params: { id: string } }) {
  return <DuaaWallClient highlightId={params.id} />;
}
