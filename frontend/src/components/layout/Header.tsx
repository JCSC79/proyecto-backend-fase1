import React from 'react';
import { Navbar, Icon, ProgressBar, Button } from "@blueprintjs/core";
import { useTranslation } from 'react-i18next';

/**
 * Header Component
 * Updated: Explicitly sets dark class and text colors for better contrast.
 */
interface HeaderProps {
  progress: number;
  isDark: boolean;
  toggleDark: () => void;
}

export const Header: React.FC<HeaderProps> = ({ progress, isDark, toggleDark }) => {
  const { t, i18n } = useTranslation();
  const percentage = Math.round(progress * 100);

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('es') ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  return (
    <Navbar 
      className={isDark ? "bp4-dark" : ""} // Ensures internal elements adapt
      style={{ 
        height: '60px', 
        padding: '10px 20px',
        backgroundColor: isDark ? '#293742' : '#ffffff',
        transition: 'background-color 0.3s ease'
      }}
    >
      <Navbar.Group align="left">
        <Navbar.Heading style={{ fontSize: '20px', display: 'flex', alignItems: 'center' }}>
          <Icon icon="layers" intent="primary" size={25} style={{ marginRight: '12px' }} />
          {/* Force text color to white in dark mode for maximum contrast */}
          <strong style={{ color: isDark ? '#ffffff' : '#182026' }}>{t('appName')}</strong>
        </Navbar.Heading>
        <Navbar.Divider />
        <Button className="bp4-minimal" icon="home" text={t('home')} large />
        <Button className="bp4-minimal" icon="dashboard" text={t('dashboard')} active large />
      </Navbar.Group>

      <Navbar.Group align="right">
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '25px' }}>
          <span style={{ fontSize: '14px', fontWeight: 500, marginRight: '12px', color: isDark ? '#a7b6c2' : '#5c7080' }}>
            {t('progress')}: {percentage}%
          </span>
          <ProgressBar intent={percentage === 100 ? "success" : "primary"} value={progress} style={{ width: '150px', height: '10px' }} stripes={percentage < 100} />
        </div>
        <Navbar.Divider />
        
        <Button 
          className="bp4-minimal" 
          icon={isDark ? "flash" : "moon"} 
          onClick={toggleDark}             
          large 
          style={{ marginRight: '10px' }}
        />
        
        <Button className="bp4-minimal" icon="translate" text={i18n.language.startsWith('es') ? 'EN' : 'ES'} onClick={toggleLanguage} large />
      </Navbar.Group>
    </Navbar>
  );
};