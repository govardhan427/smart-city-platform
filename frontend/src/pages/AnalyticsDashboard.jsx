import React, { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import styles from './AnalyticsDashboard.module.css';

// Colors for the Pie Chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className={styles.loading}>Loading detailed analytics...</div>;
  if (!data) return <div className={styles.error}>Failed to load data.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Command Center</h1>
        
        <button className={styles.downloadBtn} onClick={handleDownloadReport}>
          {/* SVG Icon for Download */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Financial Report
        </button>
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
      </div>
      {/* --- 1. HEADLINE STATS --- */}
      <div className={styles.cardGrid}>
        <div className={styles.card}>
          <h3>Total Citizens</h3>
          <p className={styles.number}>{data.counts.users}</p>
        </div>
        <div className={styles.card}>
          <h3>Platform Revenue</h3>
          <p className={`${styles.number} ${styles.money}`}>₹{data.counts.revenue}</p>
        </div>
        <div className={styles.card}>
          <h3>Busiest Time Slot</h3>
          <p className={styles.number} style={{fontSize: '1.5rem'}}>
            {data.counts.busiest_hour}
          </p>
          <span className={styles.subtext}>across all facilities</span>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        
        {/* --- 2. FACILITY USAGE BY DAY (Bar Chart) --- */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Facility Usage by Day</h2>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.facilities}>
                <XAxis dataKey="day" stroke="#A0A0B0" /> 
<YAxis allowDecimals={false} stroke="#A0A0B0" />
<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
<Tooltip 
  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} 
  itemStyle={{ color: '#fff' }}
/>
                <Bar dataKey="bookings" fill="#8884d8" name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- 3. POPULAR EVENTS (Pie Chart) --- */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Most Popular Events</h2>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.charts.events}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.charts.events.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- 4. PARKING HOTSPOTS (Horizontal Bar) --- */}
        <div className={`${styles.chartCard} ${styles.fullWidth}`}>
          <h2 className={styles.chartTitle}>Busiest Parking Lots</h2>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                layout="vertical" 
                data={data.charts.parking}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="usage" fill="#82ca9d" name="Total Reservations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsDashboard;