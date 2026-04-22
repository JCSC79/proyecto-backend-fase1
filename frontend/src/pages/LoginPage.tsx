import React, { useState } from 'react';
import { Button, InputGroup, FormGroup, Intent } from '@blueprintjs/core';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import styles from './LoginRegisterPage.module.css'; // Using the unified styles
import logoImg from '../assets/Logo.png';

const LoginPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLanguage = (): void => {
    i18n.changeLanguage(i18n.language.startsWith('es') ? 'en' : 'es');
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError(t('loginRequiredFields'));
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch {
      setError(t('loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  const lockButton = (
    <Button
      icon={showPassword ? 'eye-open' : 'eye-off'}
      variant="minimal"
      onClick={() => setShowPassword(p => !p)}
      aria-label={t('togglePassword')}
    />
  );

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <header className={styles.header}>
          <img src={logoImg} alt="logo" className={styles.logo} />
          <h1 className={styles.title}>{t('appName')}</h1>
          <p className={styles.subtitle}>{t('loginSubtitle')}</p>
        </header>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <FormGroup>
            <label className={styles.fieldLabel} htmlFor="email">
              {t('loginEmail')}
            </label>
            <InputGroup
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('loginEmailPlaceholder')}
              leftIcon="envelope"
              size="large"
              autoComplete="email"
              autoFocus
            />
          </FormGroup>

          <FormGroup>
            <label className={styles.fieldLabel} htmlFor="password">
              {t('loginPassword')}
            </label>
            <InputGroup
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t('loginPasswordPlaceholder')}
              leftIcon="lock"
              rightElement={lockButton}
              size="large"
              autoComplete="current-password"
            />
          </FormGroup>

          <Button
            type="submit"
            intent={Intent.PRIMARY}
            loading={isLoading}
            size="large"
            className={styles.submitButton}
            text={t('loginButton')}
          />
        </form>

        <footer className={styles.footer}>
          <Link to="/register" className={styles.switchLink}>
            {t('registerLink')}
          </Link>
          <Button variant="minimal" size="small" onClick={toggleLanguage}>
            {i18n.language.startsWith('es') ? (
              <>
                <span className={`fi fi-es ${styles.flagIcon}`} />
                Español
              </>
            ) : (
              <>
                <span className={`fi fi-gb ${styles.flagIcon}`} />
                English
              </>
            )}
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;
