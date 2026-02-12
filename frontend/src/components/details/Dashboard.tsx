import React, { useEffect, useState } from 'react';
import { details as detailsApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface DetailSummary {
  id: string;
  name: string;
  category: string;
  description: string;
  layerCount: number;
  creatorName: string;
  updatedAt: string;
}

interface DashboardProps {
  onOpenDetail: (id: string) => void;
}

export function Dashboard({ onOpenDetail }: DashboardProps) {
  const { user } = useAuth();
  const [detailList, setDetailList] = useState<DetailSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    detailsApi.list()
      .then(res => setDetailList(res.details))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const categoryColors: Record<string, string> = {
    roofing: '#2563eb',
    waterproofing: '#059669',
    'air-barrier': '#7c3aed',
    foundation: '#dc2626',
    'expansion-joint': '#ea580c',
    penetration: '#0891b2',
    flashing: '#6b7280',
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Construction Details</h2>
          <p style={styles.subtitle}>Manage your 3D BIM construction details</p>
        </div>
        {user?.role !== 'viewer' && (
          <button style={styles.createBtn}>+ New Detail</button>
        )}
      </div>

      {loading && <div style={styles.loading}>Loading details...</div>}
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.grid}>
        {detailList.map(detail => (
          <div
            key={detail.id}
            style={styles.card}
            onClick={() => onOpenDetail(detail.id)}
          >
            <div style={styles.cardHeader}>
              <span style={{
                ...styles.categoryBadge,
                background: categoryColors[detail.category] || '#6b7280',
              }}>
                {detail.category}
              </span>
              <span style={styles.layerCount}>{detail.layerCount} layers</span>
            </div>
            <h3 style={styles.cardTitle}>{detail.name}</h3>
            <p style={styles.cardDesc}>{detail.description}</p>
            <div style={styles.cardFooter}>
              <span style={styles.creator}>{detail.creatorName}</span>
              <span style={styles.date}>
                {detail.updatedAt ? new Date(detail.updatedAt).toLocaleDateString() : ''}
              </span>
            </div>
          </div>
        ))}

        {!loading && detailList.length === 0 && (
          <div style={styles.empty}>
            <p>No details yet. Create your first construction detail to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: 24, maxWidth: 1200, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 700, color: '#1a365d', margin: '0 0 4px' },
  subtitle: { fontSize: 14, color: '#64748b', margin: 0 },
  createBtn: {
    padding: '10px 20px',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  loading: { textAlign: 'center' as const, padding: 40, color: '#64748b' },
  error: { background: '#fef2f2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  card: {
    background: '#fff',
    borderRadius: 10,
    padding: 20,
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'box-shadow 0.15s, transform 0.15s',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  categoryBadge: {
    fontSize: 11,
    color: '#fff',
    padding: '2px 10px',
    borderRadius: 12,
    fontWeight: 600,
    textTransform: 'capitalize' as const,
  },
  layerCount: { fontSize: 12, color: '#64748b' },
  cardTitle: { fontSize: 16, fontWeight: 600, color: '#1e293b', margin: '0 0 6px' },
  cardDesc: { fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: '0 0 12px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8' },
  creator: {},
  date: {},
  empty: { gridColumn: '1 / -1', textAlign: 'center' as const, padding: 60, color: '#94a3b8' },
};
