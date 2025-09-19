import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/_next/',
        '/unauthorized',
        '/test',
        '/button-overlay-demo',
        '/linkedin-resume-analysis',
        '/onboarding',
        '/profileEdit',
        '/teamEdit',
        '/send-props',
        '/detail-achievements',
        '/company-verification',
        '/email-verification',
        '/employees',
        '/verifications',
        '/home',
        '/home-simple',
        '/app',
        '/props/',
        '/templates/',
        '/share/',
        '/skills',
        '/team',
        '/profile',
      ],
    },
    sitemap: 'https://skilltrait.com/sitemap.xml',
  }
}
