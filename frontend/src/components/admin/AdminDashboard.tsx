import React, { useState, useMemo } from 'react';
import { StatusDonutChart } from './charts/StatusDonutChart';
import { UserTasksBarChart } from './charts/UserTasksBarChart';
import {
  Card, Elevation, H2, H3, H4, Icon, InputGroup,
  Button, Alert, Intent, Tag, Spinner, ButtonGroup,
  Dialog, DialogBody, DialogFooter
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

// Type for sortable columns - Added 'email' for better utility
type SortColumn = 'name' | 'email' | 'total' | 'pending' | 'inProgress' | 'completed' | 'rate';

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const queryClient = useQueryClient();

  // State for search, filtering and pagination
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; 

  // State for Advanced Sorting
  const [sort, setSort] = useState<{ column: SortColumn; direction: 'asc' | 'desc' }>({
    column: 'name',
    direction: 'asc'
  });

  // State for modals and alerts
  const [pendingChange, setPendingChange] = useState<{ user: IUserWithStats; targetRole: 'ADMIN' | 'USER' } | null>(null);
  const [selectedUser, setSelectedUser] = useState<IUserWithStats | null>(null);

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

  // SMART SORTING HANDLER
  const handleSort = (column: SortColumn) => {
    const isSameColumn = sort.column === column;
    setSort({
      column,
      direction: isSameColumn && sort.direction === 'asc' ? 'desc' : 'asc'
    });
    setCurrentPage(1); // Reset to first page when order changes
  };

  // ADVANCED FILTERING AND SORTING LOGIC
  const sortedAndFilteredUsers = useMemo(() => {
    const filtered = users.filter(u => {
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesSearch = search === '' ||
        (u.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      return matchesRole && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      let valA: string | number;
      let valB: string | number;

      switch (sort.column) {
        case 'email': 
          valA = a.email.toLowerCase(); 
          valB = b.email.toLowerCase(); 
          break;
        case 'total': valA = a.stats.total; valB = b.stats.total; break;
        case 'pending': valA = a.stats.pending; valB = b.stats.pending; break;
        case 'inProgress': valA = a.stats.inProgress; valB = b.stats.inProgress; break;
        case 'completed': valA = a.stats.completed; valB = b.stats.completed; break;
        case 'rate': valA = a.stats.completionRate; valB = b.stats.completionRate; break;
        case 'name':
        default:
          valA = (a.name ?? a.email).toLowerCase();
          valB = (b.name ?? b.email).toLowerCase();
      }

      if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, roleFilter, search, sort]);

  // PAGINATION LOGIC
  const totalPages = Math.ceil(sortedAndFilteredUsers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = sortedAndFilteredUsers.slice(startIndex, startIndex + pageSize);

  // KPIs and chart data
  const globalTotal = users.reduce((s, u) => s + u.stats.total, 0);
  const globalPending = users.reduce((s, u) => s + u.stats.pending, 0);
  const globalInProgress = users.reduce((s, u) => s + u.stats.inProgress, 0);
  const globalCompleted = users.reduce((s, u) => s + u.stats.completed, 0);
  const globalRate = globalTotal === 0 ? 0 : Math.round((globalCompleted / globalTotal) * 100);

  const pieData = [
    { name: t('pending'), value: globalPending, color: COLOR_PENDING },
    { name: t('inProgress'), value: globalInProgress, color: COLOR_IN_PROGRESS },
    { name: t('completed'), value: globalCompleted, color: COLOR_COMPLETED },
  ].filter(d => d.value > 0);

  const barData = [...users]
    .sort((a, b) => b.stats.total - a.stats.total)
    .slice(0, 10)
    .map(u => ({
      name: u.name ?? u.email.split('@')[0],
      [t('pending')]: u.stats.pending,
      [t('inProgress')]: u.stats.inProgress,
      [t('completed')]: u.stats.completed,
    }));

  // Helper to render sortable table headers
  const renderHeader = (label: string, col: SortColumn) => (
    <th onClick={() => handleSort(col)} style={{ cursor: 'pointer', userSelect: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {label}
        <Icon 
          icon={sort.column === col ? (sort.direction === 'asc' ? 'chevron-up' : 'chevron-down') : 'double-caret-vertical'} 
          size={12} 
          style={{ opacity: sort.column === col ? 1 : 0.2 }}
        />
      </div>
    </th>
  );

  if (isLoading) return <Spinner size={50} intent={Intent.PRIMARY} />;
  if (isError) return <p style={{ color: 'var(--text-main)' }}>{t('errorMessage')}</p>;

  return (
    <div className={styles.wrapper}>
      <H2 className={styles.pageTitle}>
        <Icon icon="shield" size={25} intent="warning" /> {t('adminPanel')}
      </H2>

      {/* KPIs Grid */}
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

      {/* Charts Grid */}
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

      {/* Interactive User Table */}
      <Card elevation={Elevation.ONE} className={styles.tableCard}>
        <H3 className={styles.tableTitle}><Icon icon="people" /> {t('adminUserList')}</H3>
        
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <InputGroup 
              leftIcon="search" 
              placeholder={t('adminSearchUsers')} 
              value={search} 
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} 
            />
          </div>
          <ButtonGroup minimal>
            <Button text={t('all')} active={roleFilter === 'ALL'} onClick={() => { setRoleFilter('ALL'); setCurrentPage(1); }} />
            <Button text="Admin" active={roleFilter === 'ADMIN'} intent="primary" onClick={() => { setRoleFilter('ADMIN'); setCurrentPage(1); }} />
            <Button text="User" active={roleFilter === 'USER'} onClick={() => { setRoleFilter('USER'); setCurrentPage(1); }} />
          </ButtonGroup>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              {renderHeader(t('adminColName'), 'name')}
              {renderHeader(t('adminColEmail'), 'email')}
              <th>{t('adminColRole')}</th>
              {renderHeader(t('adminColTotal'), 'total')}
              {renderHeader(t('pending'), 'pending')}
              {renderHeader(t('inProgress'), 'inProgress')}
              {renderHeader(t('completed'), 'completed')}
              {renderHeader(t('completionRate'), 'rate')}
              <th>{t('adminColActions')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr className={styles.emptyRow}><td colSpan={10}>{t('noResults')}</td></tr>
            ) : (
              paginatedUsers.map(user => (
                <tr key={user.id} className={styles.clickableRow} onClick={() => setSelectedUser(user)}>
                  <td>{user.name ?? '—'}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={user.role === 'ADMIN' ? styles.roleAdmin : styles.roleUser}>
                      {user.role === 'ADMIN' ? t('adminRole') : t('userRole')}
                    </span>
                  </td>
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
                      <Button small icon="arrow-up" intent="warning" text={t('adminPromote')} onClick={(e) => { e.stopPropagation(); setPendingChange({ user, targetRole: 'ADMIN' }); }} />
                    ) : (
                      <Button small icon="arrow-down" intent="danger" text={t('adminDemote')} onClick={(e) => { e.stopPropagation(); setPendingChange({ user, targetRole: 'USER' }); }} />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
            <ButtonGroup>
              <Button icon="chevron-left" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} />
              <Button minimal disabled style={{ fontWeight: 'bold' }}>{t('page')} {currentPage} / {totalPages}</Button>
              <Button icon="chevron-right" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} />
            </ButtonGroup>
          </div>
        )}
      </Card>

      {/* User Detail Modal */}
      <Dialog
        isOpen={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
        title={t('userDetails')}
        icon="info-sign"
        style={{ width: '500px' }}
      >
        <DialogBody>
          {selectedUser && (
            <div className={styles.userDetailContent}>
              <H3>{selectedUser.name ?? selectedUser.email}</H3>
              <p className="bp6-text-muted">{selectedUser.email}</p>
              
              <div className={styles.statsHighlight}>
                <div style={{ textAlign: 'center' }}>
                  <div className="bp6-text-muted">{t('adminColTotal')}</div>
                  <H2 style={{ margin: 0 }}>{selectedUser.stats.total}</H2>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="bp6-text-muted">{t('completionRate')}</div>
                  <H2 style={{ margin: 0, color: 'var(--status-done)' }}>{selectedUser.stats.completionRate}%</H2>
                </div>
              </div>

              <H4>{t('statusDistribution')}</H4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                <Tag intent="warning" large fill minimal icon="time">{t('pending')}: {selectedUser.stats.pending}</Tag>
                <Tag intent="primary" large fill minimal icon="play">{t('inProgress')}: {selectedUser.stats.inProgress}</Tag>
                <Tag intent="success" large fill minimal icon="tick-circle">{t('completed')}: {selectedUser.stats.completed}</Tag>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter actions={<Button onClick={() => setSelectedUser(null)} large>{t('close')}</Button>} />
      </Dialog>

      {/* Alerts */}
      <Alert
        isOpen={pendingChange !== null}
        icon={pendingChange?.targetRole === 'ADMIN' ? 'arrow-up' : 'arrow-down'}
        intent={pendingChange?.targetRole === 'ADMIN' ? Intent.WARNING : Intent.DANGER}
        confirmButtonText={pendingChange?.targetRole === 'ADMIN' ? t('adminPromote') : t('adminDemote')}
        cancelButtonText={t('cancel')}
        onCancel={() => setPendingChange(null)}
        onConfirm={() => {
          if (pendingChange) roleMutation.mutate({ userId: pendingChange.user.id, role: pendingChange.targetRole });
        }}
        loading={roleMutation.isPending}
      >
        <p>{pendingChange?.targetRole === 'ADMIN' ? t('adminPromoteConfirm', { name: pendingChange.user.name ?? pendingChange.user.email }) : t('adminDemoteConfirm', { name: pendingChange?.user.name ?? pendingChange?.user.email })}</p>
      </Alert>
    </div>
  );
};