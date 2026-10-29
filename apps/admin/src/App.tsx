import { useEffect, useState } from 'react';
import { API_BASE_URL } from './config';

interface PlatformStats {
  totalUsers: number;
  totalDrivers: number;
  totalHosts: number;
  totalChargers: number;
  pendingReviews: number;
  totalBookings: number;
  completedBookings: number;
  totalRevenuePaise: number;
}

interface ChargerItem {
  id: string;
  name: string;
  host_name: string;
  host_email: string;
  listing_type: string;
  status: string;
  charging_type: string;
  price_per_unit: number;
  connectors: Array<{ connectorType: string; powerKw: number; quantity: number }>;
}

export default function App() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [chargers, setChargers] = useState<ChargerItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, chargersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/stats`).then((r) => r.json()),
        fetch(`${API_BASE_URL}/admin/chargers`).then((r) => r.json()),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (chargersRes.success) setChargers(chargersRes.data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, color: '#00B86B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚡</span> EVNuvora Admin Console
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b' }}>Operations, PostGIS Listings, Verification & Moderation</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={fetchData}
            style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh Metrics'}
          </button>
          <span style={{ backgroundColor: '#e6f8f0', color: '#00B86B', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: '600', fontSize: '0.875rem' }}>
            Live API Active
          </span>
        </div>
      </header>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Total Active Stations</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a', margin: '0.5rem 0' }}>
            {stats ? stats.totalChargers : '--'}
          </div>
          <span style={{ color: '#00B86B', fontSize: '0.875rem' }}>PostGIS Spatial Index Ready</span>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Registered Users</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a', margin: '0.5rem 0' }}>
            {stats ? stats.totalUsers : '--'}
          </div>
          <span style={{ color: '#3b82f6', fontSize: '0.875rem' }}>
            {stats ? `${stats.totalDrivers} Drivers • ${stats.totalHosts} Hosts` : 'Loading...'}
          </span>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Platform GMV</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a', margin: '0.5rem 0' }}>
            {stats ? `₹${(stats.totalRevenuePaise / 100).toFixed(2)}` : '--'}
          </div>
          <span style={{ color: '#f59e0b', fontSize: '0.875rem' }}>Razorpay & UPI Captured</span>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Total Charging Bookings</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a', margin: '0.5rem 0' }}>
            {stats ? stats.totalBookings : '--'}
          </div>
          <span style={{ color: '#10b981', fontSize: '0.875rem' }}>
            {stats ? `${stats.completedBookings} Completed Sessions` : 'Loading...'}
          </span>
        </div>
      </div>

      {/* Moderation Queue */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Station Listing Queue & Status</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.875rem' }}>
              <th style={{ padding: '0.75rem 0' }}>Station Name</th>
              <th>Host</th>
              <th>Type</th>
              <th>Connectors</th>
              <th>Rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {chargers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  No stations found in the database.
                </td>
              </tr>
            ) : (
              chargers.map((ch) => (
                <tr key={ch.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem' }}>
                  <td style={{ padding: '0.75rem 0', fontWeight: '500', color: '#0f172a' }}>{ch.name}</td>
                  <td>{ch.host_name || ch.host_email}</td>
                  <td style={{ textTransform: 'capitalize' }}>{ch.listing_type}</td>
                  <td>
                    {ch.connectors.map((c, i) => (
                      <span key={i} style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', marginRight: '0.25rem', fontSize: '0.75rem' }}>
                        {c.connectorType.toUpperCase()} ({c.powerKw}kW)
                      </span>
                    ))}
                  </td>
                  <td style={{ fontWeight: '600', color: '#00B86B' }}>₹{(ch.price_per_unit / 100).toFixed(2)}/kWh</td>
                  <td>
                    <span style={{
                      backgroundColor: ch.status === 'approved' ? '#e6f8f0' : '#fef3c7',
                      color: ch.status === 'approved' ? '#00B86B' : '#d97706',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase'
                    }}>
                      {ch.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
