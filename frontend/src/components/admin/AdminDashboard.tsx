import React, { useState } from 'react';
import { StatusDonutChart } from './charts/StatusDonutChart';
import { UserTasksBarChart } from './charts/UserTasksBarChart';
import {
  Card, Elevation, H2, H3, H4, Icon, InputGroup,
  Button, Alert, Intent, Tag, Spinner
} from '@blueprintjs/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { fetchAdminUsers, updateUserRole } from '../../api/admin.api';
import type { IUserWithStats } from '../../types/admin';
import { useTheme } from '../../contexts/ThemeContext';
import { AppToaster } from '../../utils/toaster';
import styles from './AdminDashboard.module.css';

// Constants for bar and donut colors
const COLOR_PENDING = '#D9822B';
const COLOR_IN_PROGRESS = '#2B95D9';
const COLOR_COMPLETED = '#0F9960';

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');
  const [pendingChange, setPendingChange] = useState<{ user: IUserWithStats; targetRole: 'ADMIN' | 'USER' } | null>(null);

  const { data: users = [], isLoading, isError } = useQuery<IUserWithStats[]>({
    queryKey: ['admin-users'],
    queryFn: fetchAdminUsers,
    retry: 1,
    staleTime: 30_000,
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'ADMIN' | 'USER' }) =>
      updateUserRole(userId, role),
    onSuccess: (_, { role }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      AppToaster.show({
        message: role === 'ADMIN' ? t('adminPromoted') : t('adminDemoted'),
        intent: Intent.SUCCESS,
        icon: 'people',
      });
      setPendingChange(null);
    },
    onError: (err: Error) => {
      AppToaster.show({ message: err.message, intent: Intent.DANGER, icon: 'warning-sign' });
      setPendingChange(null);
    },
  });

  // Global calculations
  const globalTotal = users.reduce((s, u) => s + u.stats.total, 0);
  const globalPending = users.reduce((s, u) => s + u.stats.pending, 0);
  const globalInProgress = users.reduce((s, u) => s + u.stats.inProgress, 0);
  const globalCompleted = users.reduce((s, u) => s + u.stats.completed, 0);
  const globalRate = globalTotal === 0 ? 0 : Math.round((globalCompleted / globalTotal) * 100);

  // Data for the Donut (now managed by the child component)
  const pieData = [
    { name: t('pending'), value: globalPending, color: COLOR_PENDING },
    { name: t('inProgress'), value: globalInProgress, color: COLOR_IN_PROGRESS },
    { name: t('completed'), value: globalCompleted, color: COLOR_COMPLETED },
  ].filter(d => d.value > 0);

  // Data for the Bars (now managed by the child component)
  const barData = [...users]
    .sort((a, b) => b.stats.total - a.stats.total)
    .slice(0, 10)
    .map(u => ({
      name: u.name ?? u.email.split('@')[0],
      [t('pending')]: u.stats.pending,
      [t('inProgress')]: u.stats.inProgress,
      [t('completed')]: u.stats.completed,
    }));

  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch = search === '' ||
      (u.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  if (isLoading) { 
    return <Spinner size={50} intent={Intent.PRIMARY} />;
  }
  if (isError) {
    return <p style={{ color: 'var(--text-main)' }}>{t('errorMessage')}</p>;
  }

  return (
    <div className={styles.wrapper}>
      <H2 className={styles.pageTitle}>
        <Icon icon="shield" size={25} intent="warning" /> {t('adminPanel')}
      </H2>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        <Card elevation={Elevation.TWO} className={styles.kpiCard}>
          <H4 className={styles.kpiLabel}>{t('adminTotalUsers')}</H4>
          <div className={styles.kpiValue}>{users.length}</div>
        </Card>
        <Card elevation={Elevation.TWO} className={styles.kpiCard}>
          <H4 className={styles.kpiLabel}>{t('adminTotalTasks')}</H4>
          <div className={styles.kpiValue}>{globalTotal}</div>
        </Card>
        <Card elevation={Elevation.TWO} className={styles.kpiCard}>
          <H4 className={styles.kpiLabel}>{t('completionRate')}</H4>
          <div className={`${styles.kpiValue} ${styles.kpiValueGreen}`}>{globalRate}%</div>
        </Card>
        <Card elevation={Elevation.TWO} className={styles.kpiCard}>
          <H4 className={styles.kpiLabel}>{t('adminInProgress')}</H4>
          <div className={`${styles.kpiValue} ${styles.kpiValueBlue}`}>{globalInProgress}</div>
        </Card>
      </div>

      {/* Extracted Charts */}
      <div className={styles.chartsGrid}>
        <Card elevation={Elevation.ONE} className={styles.chartCard}>
          <H3 className={styles.chartTitle}>{t('statusDistribution')}</H3>
          <StatusDonutChart data={pieData} />
        </Card>

        <Card elevation={Elevation.ONE} className={styles.chartCard}>
          <H3 className={styles.chartTitle}>{t('adminTasksPerUser')}</H3>
          <UserTasksBarChart 
            data={barData}
            isDark={isDark}
            colors={{ pending: COLOR_PENDING, inProgress: COLOR_IN_PROGRESS, completed: COLOR_COMPLETED }}
            labels={{ pending: t('pending'), inProgress: t('inProgress'), completed: t('completed') }}
          />
        </Card>
      </div>

      {/* User Table */}
      <Card elevation={Elevation.ONE} className={styles.tableCard}>
        <H3 className={styles.tableTitle}><Icon icon="people" /> {t('adminUserList')}</H3>
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <InputGroup leftIcon="search" placeholder={t('adminSearchUsers')} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button text={t('all')} active={roleFilter === 'ALL'} onClick={() => setRoleFilter('ALL')} minimal />
          <Button text="Admin" active={roleFilter === 'ADMIN'} intent="primary" onClick={() => setRoleFilter('ADMIN')} minimal />
          <Button text="User" active={roleFilter === 'USER'} onClick={() => setRoleFilter('USER')} minimal />
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('adminColName')}</th>
              <th>{t('adminColEmail')}</th>
              <th>{t('adminColRole')}</th>
              <th>{t('adminColTotal')}</th>
              <th>{t('pending')}</th>
              <th>{t('inProgress')}</th>
              <th>{t('completed')}</th>
              <th>{t('completionRate')}</th>
              <th>{t('adminColActions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr className={styles.emptyRow}><td colSpan={9}>{t('noResults')}</td></tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.name ?? '—'}</td>
                  <td>{user.email}</td>
                  <td><span className={user.role === 'ADMIN' ? styles.roleAdmin : styles.roleUser}>{user.role}</span></td>
                  <td>{user.stats.total}</td>
                  <td><Tag intent="warning" minimal>{user.stats.pending}</Tag></td>
                  <td><Tag intent="primary" minimal>{user.stats.inProgress}</Tag></td>
                  <td><Tag intent="success" minimal>{user.stats.completed}</Tag></td>
                  <td>
                    {user.stats.completionRate}%
                    <span className={styles.miniBarTrack}><span className={styles.miniBarFill} style={{ width: `${user.stats.completionRate}%` }} /></span>
                  </td>
                  <td>
                    {user.role === 'USER' ? (
                      <Button small icon="arrow-up" intent="warning" text={t('adminPromote')} onClick={() => setPendingChange({ user, targetRole: 'ADMIN' })} />
                    ) : (
                      <Button small icon="arrow-down" intent="danger" text={t('adminDemote')} onClick={() => setPendingChange({ user, targetRole: 'USER' })} />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <Alert
        isOpen={pendingChange !== null}
        icon={pendingChange?.targetRole === 'ADMIN' ? 'arrow-up' : 'arrow-down'}
        intent={pendingChange?.targetRole === 'ADMIN' ? Intent.WARNING : Intent.DANGER}
        confirmButtonText={pendingChange?.targetRole === 'ADMIN' ? t('adminPromote') : t('adminDemote')}
        cancelButtonText={t('cancel')}
        onCancel={() => setPendingChange(null)}
        onConfirm={() => {
          if (pendingChange) {
            roleMutation.mutate({ userId: pendingChange.user.id, role: pendingChange.targetRole });
          }
        }}
        loading={roleMutation.isPending}
      >
        <p>{pendingChange?.targetRole === 'ADMIN' ? t('adminPromoteConfirm', { name: pendingChange.user.name ?? pendingChange.user.email }) : t('adminDemoteConfirm', { name: pendingChange?.user.name ?? pendingChange?.user.email })}</p>
      </Alert>
    </div>
  );
};