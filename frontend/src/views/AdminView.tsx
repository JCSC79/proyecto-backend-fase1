import React, { useEffect, useState } from 'react';
// Se añade NonIdealState a los imports
import { Card, Elevation, H3, H5, Icon, Intent, Tag, HTMLTable, Button, NonIdealState, Spinner } from "@blueprintjs/core";
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth'; // IMPORTANTE: Importamos el hook de auth

/**
 * AdminView Component - Phase 6 Hardened Version (SECURITY PATCH)
 * Global dashboard for system administrators.
 * SECURITY: Verifies user role with server before rendering any sensitive data.
 * This prevents privilege escalation attacks via localStorage manipulation.
 */
export const AdminView: React.FC = () => {
  const { t } = useTranslation();
  const { user, verifyUserFromServer } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);

  /**
   * 🔐 SECURITY CHECK: Verify the user's role is actually ADMIN with the server.
   * This fires when component mounts and validates that the JWT matches the claimed role.
   * If a user manipulated localStorage to change role to ADMIN, this will detect it.
   */
  useEffect(() => {
    const verifyAccess = async () => {
      setIsVerifying(true);
      await verifyUserFromServer();
      setIsVerifying(false);
    };

    verifyAccess();
  }, []);

  if (isVerifying) {
    return (
      <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spinner />
      </div>
    );
  }

  // --- EL CANDADO INTERNO (AHORA VERIFICADO CON EL SERVIDOR) ---
  // Si el rol no es ADMIN, abortamos el renderizado de métricas y mostramos error.
  if (user?.role !== 'ADMIN') {
    return (
      <div style={{ padding: '40px' }}>
        <NonIdealState
          icon={<Icon icon="ban-circle" intent={Intent.DANGER} size={60} />}
          title={t('accessDenied', 'Acceso No Autorizado')}
          description={t('accessDeniedDescription', 'No tienes permisos para visualizar las métricas globales del sistema.')}
        />
      </div>
    );
  }

  const isDark = document.body.classList.contains('bp4-dark');

  // Dashboard mock metrics
  const stats = [
    { label: t('totalUsers', 'Total Users'), value: '12', icon: 'people', color: '#106BA3' },
    { label: t('totalTasks', 'Total Tasks'), value: '542', icon: 'database', color: '#D9822B' },
    { label: t('systemUptime', 'System Uptime'), value: '99.9%', icon: 'pulse', color: '#0F9960' },
    { label: t('rabbitMQStatus', 'RabbitMQ Status'), value: t('connected', 'Connected'), icon: 'fork', color: '#7239B3' }
  ];

  return (
    <div style={{ padding: '10px', color: isDark ? '#f0f8ff' : '#182026' }}>
      {/* Header section with Shield Icon */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
        <Icon icon="shield" size={30} intent={Intent.WARNING} />
        <H3 style={{ margin: 0 }}>{t('adminPanel', 'System Administration')}</H3>
      </div>

      {/* Statistics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {stats.map((stat, idx) => (
          <Card
            key={idx}
            elevation={Elevation.ONE}
            style={{
              borderTop: `4px solid ${stat.color}`,
              backgroundColor: isDark ? '#233540' : '#ffffff',
              color: isDark ? '#e8f0ff' : '#182026'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <H5 style={{ color: isDark ? '#d0e0f5' : '#5c7080' }}>{stat.label}</H5>
              <Icon icon={stat.icon as any} color={stat.color} />
            </div>
            <h2 style={{ margin: 0 }}>{stat.value}</h2>
          </Card>
        ))}
      </div>

      {/* User Management Mock Table */}
      <Card elevation={Elevation.ONE} style={{ marginBottom: '30px', backgroundColor: isDark ? '#1b2b35' : '#ffffff' }}>
        <H5>{t('userManagement', 'User Management')}</H5>
        <HTMLTable interactive striped style={{ width: '100%', marginTop: '10px' }}>
          <thead>
            <tr>
              <th>{t('user', 'User')}</th>
              <th>{t('email', 'Email')}</th>
              <th>{t('role', 'Role')}</th>
              <th>{t('actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Juan Coding</td>
              <td>jcsc.code@gmail.com</td>
              <td><Tag intent={Intent.WARNING} round icon="crown">{t('admin', 'ADMIN')}</Tag></td>
              <td><Button icon="edit" minimal disabled text={t('edit', 'Edit')} /></td>
            </tr>
            <tr>
              <td>Ann Doe Smith</td>
              <td>ann@doe.com</td>
              <td><Tag intent={Intent.PRIMARY} round icon="user">{t('userRole', 'USER')}</Tag></td>
              <td>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <Button icon="shield" intent={Intent.WARNING} minimal />
                  <Button icon="ban-circle" intent={Intent.DANGER} minimal />
                </div>
              </td>
            </tr>
          </tbody>
        </HTMLTable>
      </Card>

      {/* Activity Logs Section */}
      <Card elevation={Elevation.ZERO} style={{ backgroundColor: 'transparent', padding: 0 }}>
        <H5>{t('recentActivity', 'Recent System Activities')}</H5>
        <HTMLTable bordered interactive striped style={{ width: '100%', marginTop: '15px' }}>
          <thead>
            <tr>
              <th>{t('timestamp', 'Timestamp')}</th>
              <th>{t('user', 'User')}</th>
              <th>{t('action', 'Action')}</th>
              <th>{t('status', 'Status')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{new Date().toLocaleString()}</td>
              <td>admin@system.com</td>
              <td><Tag minimal intent={Intent.DANGER}>{t('globalPurge', 'GLOBAL_PURGE')}</Tag></td>
              <td><Icon icon="tick" intent={Intent.SUCCESS} /> {t('success', 'Success')}</td>
            </tr>
          </tbody>
        </HTMLTable>
      </Card>
    </div>
  );
};