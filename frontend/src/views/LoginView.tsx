import React, { useState } from 'react';
import { Card, Elevation, FormGroup, InputGroup, Button, Intent, H3, Icon } from "@blueprintjs/core";
import api from '../api/axiosInstance';
import { useTranslation } from 'react-i18next';
import { AppToaster } from '../utils/toaster';

interface LoginViewProps {
  onLoginSuccess: (token: string) => void;
}

/**
 * LoginView Component
 * Handles user authentication and persists session data.
 * Updated for Phase 4: Persists user email for UI personalization.
 */
export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token } = response.data;
      
      // Persist both token and email for session management
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', email); 
      
      onLoginSuccess(token);
      
      AppToaster.show({ message: "Welcome back!", intent: Intent.SUCCESS, icon: "log-in" });
    } catch {
      AppToaster.show({ 
        message: t('authError'), 
        intent: Intent.DANGER, 
        icon: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card elevation={Elevation.FOUR} style={{ width: '400px', padding: '30px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Icon icon="shield" size={40} intent={Intent.PRIMARY} />
        <H3 style={{ marginTop: '10px' }}>{t('appName')}</H3>
      </div>
      <form onSubmit={handleLogin}>
        <FormGroup label={t('email')} labelFor="email">
          <InputGroup id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required large />
        </FormGroup>
        <FormGroup label={t('password')} labelFor="password">
          <InputGroup id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required large />
        </FormGroup>
        <Button intent={Intent.PRIMARY} fill large type="submit" loading={loading} text={t('login')} />
      </form>
    </Card>
  );
};