import React, { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import StatsModal from '../components/analytics/StatsModal'; // Import the new modal
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import styles from './AnalyticsDashboard.module.css';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // NEW: State for Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStat, setSelectedStat] = useState({ type: '', title: '' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await analyticsService.getDashboardStats();
        setData(response.data);
      } catch (error) {
        console.error("Error fetching stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleDownloadReport = () => {
    analyticsService.downloadFinancialsCSV();
  };

  // NEW: Click Handler
  const handleCardClick = (type, title) => {
    setSelectedStat({ type, title });
    setModalOpen(true);
  };

  const tooltipStyle = {
    contentStyle: { 
      backgroundColor: 'rgba(20, 20, 30, 0.95)', 
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      padding: '10px'
    },
    itemStyle: { color: '#fff', fontSize: '0.9rem', fontWeight: '500' },
    labelStyle: { color: '#ccc', marginBottom: '5px' }
  };

  if (loading) return (
    <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <span>Loading analytics data...</span>
    </div>
  );
  
  if (!data) return <div className={styles.error}>Failed to load data stream.</div>;

  return (
    <div className={styles.container}>
      
      <div className={styles.headerRow}>
        <div>
           <h1 className={styles.title}>System Analytics</h1>
           <p className={styles.subtitle}>Real-time oversight of city operations.</p>
        </div>
        <button className={styles.downloadBtn} onClick={handleDownloadReport}>
          Export Report
        </button>
      </div>

      {/* --- 1. HEADLINE STATS (Now Clickable) --- */}
      <div className={styles.cardGrid}>
        
        {/* USERS CARD */}
        <div 
          className={`${styles.card} ${styles.clickable}`}
          onClick={() => handleCardClick('users', 'Registered Citizens Registry')}
        >
          <div className={styles.cardIcon} style={{background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa'}}>👥</div>
          <div>
            <h3 className={styles.cardLabel}>Registered Citizens</h3>
            <p className={styles.number}>{data.counts.users}</p>
          </div>
        </div>

        {/* REVENUE CARD */}
        <div 
          className={`${styles.card} ${styles.clickable}`}
          onClick={() => handleCardClick('revenue', 'Financial Transaction Log')}
        >
          <div className={styles.cardIcon} style={{background: 'rgba(16, 185, 129, 0.2)', color: '#34d399'}}>₹</div>
          <div>
             <h3 className={styles.cardLabel}>Total Revenue</h3>
             <p className={`${styles.number} ${styles.money}`}>₹{data.counts.revenue.toLocaleString()}</p>
          </div>
        </div>

        {/* ACTIVITY CARD */}
        <div 
          className={`${styles.card} ${styles.clickable}`}
          onClick={() => handleCardClick('activity', 'System Activity Logs')}
        >
           <div className={styles.cardIcon} style={{background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24'}}>⚡</div>
           <div>
             <h3 className={styles.cardLabel}>Peak Activity</h3>
             <p className={styles.number}>{data.counts.busiest_hour}</p>
             <span className={styles.subtext}>View Activity Log</span>
           </div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        {/* ... (Charts remain exactly the same) ... */}
        {/* 1. BAR CHART */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
             <h2>Facility Usage Trends</h2>
             <span className={styles.chartBadge}>Last 7 Days</span>
          </div>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.facilities}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" tick={{fontSize: 12}} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={tooltipStyle.contentStyle} itemStyle={tooltipStyle.itemStyle} labelStyle={tooltipStyle.labelStyle} />
                <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. PIE CHART */}
        <div className={styles.chartCard}>
           <div className={styles.chartHeader}>
             <h2>Event Distribution</h2>
          </div>
          <div className={styles.chartWrapper} style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.charts.events} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                  {data.charts.events.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle.contentStyle} itemStyle={tooltipStyle.itemStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.customLegend}>
              {data.charts.events.slice(0, 4).map((entry, index) => (
                  <div key={index} className={styles.legendItem}>
                      <div className={styles.legendLeft}>
                          <span className={styles.legendDot} style={{background: COLORS[index % COLORS.length]}}></span>
                          <span className={styles.legendText} title={entry.name}>{entry.name}</span>
                      </div>
                      <span className={styles.legendVal}>{entry.value}</span>
                  </div>
              ))}
          </div>
        </div>

        {/* 3. PARKING CHART */}
        <div className={`${styles.chartCard} ${styles.fullWidth}`}>
           <div className={styles.chartHeader}>
             <h2>Parking Occupancy</h2>
          </div>
          <div className={styles.chartWrapper} style={{height: '250px'}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={data.charts.parking} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={150} stroke="rgba(255,255,255,0.7)" tick={{fontSize: 13}} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={tooltipStyle.contentStyle} itemStyle={tooltipStyle.itemStyle} />
                <Bar dataKey="usage" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} name="Reservations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- RENDER MODAL --- */}
      {modalOpen && (
        <StatsModal 
          type={selectedStat.type} 
          title={selectedStat.title} 
          onClose={() => setModalOpen(false)} 
        />
      )}

    </div>
  );
};

export default AnalyticsDashboard;