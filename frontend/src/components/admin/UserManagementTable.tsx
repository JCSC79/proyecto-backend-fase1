import React from 'react';
import { Button, ButtonGroup, Tag, Icon } from '@blueprintjs/core';
import { useTranslation } from 'react-i18next';
import type { IUserWithStats } from '../../types/admin';
import type { SortColumn } from '../../hooks/useAdminDashboard';
import styles from './AdminDashboard.module.css';

interface Props {
  users: IUserWithStats[];
  sort: { column: SortColumn; direction: 'asc' | 'desc' };
  onSort: (col: SortColumn) => void;
  onOpenModal: (user: IUserWithStats) => void;
  onPromote: (user: IUserWithStats) => void;
  onDemote: (user: IUserWithStats) => void;
}

export const UserManagementTable: React.FC<Props> = ({
  users, sort, onSort, onOpenModal, onPromote, onDemote
}) => {
  const { t } = useTranslation();

  const renderHeader = (label: string, col: SortColumn) => (
    <th onClick={() => onSort(col)} style={{ cursor: 'pointer', userSelect: 'none' }}>
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

  return (
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
        {users.length === 0 ? (
          <tr className={styles.emptyRow}><td colSpan={10}>{t('noResults')}</td></tr>
        ) : (
          users.map(user => (
            <tr key={user.id} className={styles.clickableRow} onClick={() => onOpenModal(user)}>
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
                <span className={styles.miniBarTrack}>
                  <span className={styles.miniBarFill} style={{ width: `${user.stats.completionRate}%` }} />
                </span>
              </td>
              <td>
                <ButtonGroup minimal> {/* 👈 Usamos ButtonGroup para limpiar el error */}
                  {user.role === 'USER' ? (
                    <Button small icon="arrow-up" intent="warning" text={t('adminPromote')} 
                      onClick={(e) => { e.stopPropagation(); onPromote(user); }} />
                  ) : (
                    <Button small icon="arrow-down" intent="danger" text={t('adminDemote')} 
                      onClick={(e) => { e.stopPropagation(); onDemote(user); }} />
                  )}
                </ButtonGroup>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};