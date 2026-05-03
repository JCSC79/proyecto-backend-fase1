import { useTranslation } from 'react-i18next';

/**
 * Toggles the app language between Spanish and English.
 * Returns the toggle function and the current language code.
 *
 * Used by: LoginPage, RegisterPage, Header
 */
export const useLanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = (): void => {
    i18n.changeLanguage(i18n.language.startsWith('es') ? 'en' : 'es');
  };

  const isSpanish = i18n.language.startsWith('es');

  return { toggleLanguage, isSpanish };
};
