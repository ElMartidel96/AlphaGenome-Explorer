import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

export const locales = ['en', 'es'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

/**
 * I18N Configuration - Cookie-based locale detection
 *
 * This config reads the NEXT_LOCALE cookie to determine the active language.
 * The cookie is set by /api/locale when user clicks the language toggle.
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;

  const locale: Locale = (localeCookie && locales.includes(localeCookie as Locale))
    ? (localeCookie as Locale)
    : defaultLocale;

  return {
    locale,
    messages: (await import(`../locales/${locale}.json`)).default,
    timeZone: 'America/Mexico_City'
  };
});
