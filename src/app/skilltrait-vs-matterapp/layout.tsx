import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SkillTrait vs Matter App - Feature Comparison',
  description: 'Compare SkillTrait and Matter App features. See why SkillTrait offers a more comprehensive solution for digital awards and skill verification.',
  keywords: 'skilltrait vs matter app, digital awards comparison, skill verification tools, team collaboration, slack integration',
  openGraph: {
    title: 'SkillTrait vs Matter App - Feature Comparison',
    description: 'Compare SkillTrait and Matter App features. See why SkillTrait offers a more comprehensive solution for digital awards and skill verification.',
    type: 'website',
    url: 'https://skilltrait.com/skilltrait-vs-matterapp',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ComparisonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
