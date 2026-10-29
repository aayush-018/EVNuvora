import React from 'react';

export default function App() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, color: '#00B86B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚡</span> EVNuvora Admin Console
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b' }}>Operations, Listing Moderation, Disputes & Audit</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ backgroundColor: '#e6f8f0', color: '#00B86B', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: '600', fontSize: '0.875rem' }}>
            Live System
          </span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Pending Charger Approvals</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a', margin: '0.5rem 0' }}>4</div>
          <span style={{ color: '#f59e0b', fontSize: '0.875rem' }}>Needs verification review</span>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Active Network Stations</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a', margin: '0.5rem 0' }}>142</div>
          <span style={{ color: '#00B86B', fontSize: '0.875rem' }}>+12 this week across India</span>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Platform GMV (Monthly)</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a', margin: '0.5rem 0' }}>₹3,84,200</div>
          <span style={{ color: '#3b82f6', fontSize: '0.875rem' }}>Razorpay Sandbox Verified</span>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>Pending Verification Queue</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.875rem' }}>
              <th style={{ padding: '0.75rem 0' }}>Station Name</th>
              <th>Host</th>
              <th>Type</th>
              <th>Connectors</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '0.75rem 0', fontWeight: '500' }}>Koramangala Community Charger</td>
              <td>Vikram Roy</td>
              <td>Residential Shared</td>
              <td>Type 2 (7.4 kW)</td>
              <td>
                <button style={{ backgroundColor: '#00B86B', color: '#fff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}>Review</button>
                <button style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
