/**
 * Risk Dashboard Page Component
 * Displays portfolio risk metrics and analysis
 */
import React from 'react';
import { Shield, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Activity, BarChart3, PieChart, Clock, Target } from 'lucide-react';

const T = {
  bg0: '#0C0E12', bg1: '#131722', bg2: '#1E222D', bg3: '#2A2E39',
  border0: 'rgba(255,255,255,0.06)', border1: 'rgba(255,255,255,0.08)',
  brand: '#2962FF', brandLt: '#5B8DEF',
  text0: '#FFFFFF', text1: '#D1D4DC', text2: '#787B86', text3: '#50535E',
  up: '#26A69A', upBg: 'rgba(38,166,154,0.10)',
  dn: '#EF5350', dnBg: 'rgba(239,83,80,0.10)',
  warn: '#FF9800', warnBg: 'rgba(255,152,0,0.10)',
  danger: '#EF5350', dangerBg: 'rgba(239,83,80,0.10)',
  success: '#26A69A', successBg: 'rgba(38,166,154,0.10)',
};

interface RiskMetric {
  name: string;
  value: number;
  unit: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface RiskAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  asset: string;
  timestamp: string;
}

const RISK_METRICS: RiskMetric[] = [
  {
    name: 'VaR (95%)',
    value: 5.2,
    unit: '%',
    level: 'medium',
    description: 'Perte maximale estimée sur 1 jour avec 95% de confiance',
  },
  {
    name: 'Volatilité',
    value: 18.5,
    unit: '%',
    level: 'low',
    description: 'Volatilité annualisée du portefeuille',
  },
  {
    name: 'Beta',
    value: 1.15,
    unit: '',
    level: 'low',
    description: 'Sensibilité du portefeuille par rapport au marché',
  },
  {
    name: 'Sharpe Ratio',
    value: 1.42,
    unit: '',
    level: 'low',
    description: 'Rendement ajusté au risque',
  },
  {
    name: 'Max Drawdown',
    value: 12.8,
    unit: '%',
    level: 'medium',
    description: 'Perte maximale depuis le pic historique',
  },
  {
    name: 'Concentration',
    value: 35.0,
    unit: '%',
    level: 'high',
    description: 'Pourcentage du portefeuille dans le plus grand actif',
  },
];

const RISK_ALERTS: RiskAlert[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Concentration élevée',
    description: 'NVIDIA représente 35% de votre portefeuille. Envisagez une diversification.',
    asset: 'NVDA',
    timestamp: 'Il y a 1h',
  },
  {
    id: '2',
    type: 'danger',
    title: 'Volatilité crypto élevée',
    description: 'Bitcoin présente une volatilité 3x supérieure à la moyenne du portefeuille.',
    asset: 'BTC-USD',
    timestamp: 'Il y a 3h',
  },
  {
    id: '3',
    type: 'info',
    title: 'Rééquilibrage recommandé',
    description: 'Votre allocation Tech dépasse la cible de 10%. Envisagez de vendre une partie.',
    asset: 'Tech',
    timestamp: 'Il y a 5h',
  },
];

export default function RiskDashboardPage() {
  return (
    <div style={{
      height: '100%',
      background: T.bg0,
      color: T.text1,
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        background: T.bg1,
        borderBottom: `1px solid ${T.border0}`,
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: '9px', fontWeight: 700, color: T.text3, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            ANALYTICS
          </div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: T.text0, fontFamily: 'JetBrains Mono, monospace', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={14} color={T.brand} />
            RISK DASHBOARD
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: T.successBg, borderRadius: '4px' }}>
            <CheckCircle size={12} color={T.success} />
            <span style={{ fontSize: '10px', color: T.success, fontWeight: 600 }}>RISQUE MODÉRÉ</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {RISK_METRICS.slice(0, 6).map((metric, index) => (
              <RiskMetricCard key={index} metric={metric} />
            ))}
          </div>

          <div style={{
            background: T.bg1,
            border: `1px solid ${T.border0}`,
            borderRadius: '8px',
            overflow: 'hidden',
            flex: 1,
          }}>
            <div style={{
              padding: '9px 12px',
              borderBottom: `1px solid ${T.border0}`,
              background: T.bg2,
            }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: T.text0, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BarChart3 size={10} />
                DÉTAIL DES RISQUES PAR ACTIF
              </span>
            </div>
            <div style={{ padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '250px', color: T.text3, fontSize: '11px' }}>
              <Activity size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <span>Tableau de détail des risques</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            background: T.bg1,
            border: `1px solid ${T.border0}`,
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '9px 12px',
              borderBottom: `1px solid ${T.border0}`,
              background: T.bg2,
            }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: T.text0, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={10} />
                ALERTES
              </span>
            </div>
            <div style={{ padding: '8px' }}>
              {RISK_ALERTS.map((alert) => (
                <RiskAlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </div>

          <div style={{
            background: T.bg1,
            border: `1px solid ${T.border0}`,
            borderRadius: '8px',
            overflow: 'hidden',
            flex: 1,
          }}>
            <div style={{
              padding: '9px 12px',
              borderBottom: `1px solid ${T.border0}`,
              background: T.bg2,
            }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: T.text0, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Target size={10} />
                ALLOCATION CIBLE
              </span>
            </div>
            <div style={{ padding: '12px' }}>
              {[
                { name: 'Tech', current: 45, target: 35 },
                { name: 'Crypto', current: 25, target: 20 },
                { name: 'ETF', current: 20, target: 25 },
                { name: 'Commodities', current: 10, target: 20 },
              ].map((item, i) => (
                <AllocationItem key={i} {...item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskMetricCard({ metric }: { metric: RiskMetric }) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'low': return { color: T.success, bg: T.successBg };
      case 'medium': return { color: T.warn, bg: T.warnBg };
      case 'high': return { color: T.danger, bg: T.dangerBg };
      case 'critical': return { color: T.danger, bg: T.dangerBg };
      default: return { color: T.text2, bg: T.bg2 };
    }
  };

  const colors = getLevelColor(metric.level);

  return (
    <div style={{
      background: T.bg1,
      border: `1px solid ${T.border0}`,
      borderRadius: '8px',
      padding: '14px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <span style={{ fontSize: '10px', color: T.text3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {metric.name}
        </span>
        <span style={{
          fontSize: '9px',
          padding: '3px 6px',
          borderRadius: '3px',
          background: colors.bg,
          color: colors.color,
          fontWeight: 600,
          textTransform: 'uppercase',
        }}>
          {metric.level}
        </span>
      </div>
      <div style={{
        fontSize: '24px',
        fontWeight: 800,
        color: colors.color,
        fontFamily: 'JetBrains Mono, monospace',
        lineHeight: 1,
        marginBottom: '6px',
      }}>
        {metric.value.toFixed(metric.unit === '%' ? 1 : 2)}{metric.unit}
      </div>
      <div style={{ fontSize: '10px', color: T.text3, lineHeight: 1.4 }}>
        {metric.description}
      </div>
    </div>
  );
}

function RiskAlertCard({ alert }: { alert: RiskAlert }) {
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'warning': return { color: T.warn, bg: T.warnBg, icon: <AlertTriangle size={12} /> };
      case 'danger': return { color: T.danger, bg: T.dangerBg, icon: <AlertTriangle size={12} /> };
      case 'info': return { color: T.brand, bg: 'rgba(41,98,255,0.10)', icon: <Activity size={12} /> };
      default: return { color: T.text2, bg: T.bg2, icon: <Activity size={12} /> };
    }
  };

  const styles = getTypeStyles(alert.type);

  return (
    <div style={{
      background: T.bg2,
      borderRadius: '6px',
      padding: '10px',
      marginBottom: '8px',
      borderLeft: `3px solid ${styles.color}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ color: styles.color, marginTop: '1px' }}>
          {styles.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: T.text0 }}>
              {alert.title}
            </span>
            <span style={{ fontSize: '9px', color: T.text3, fontFamily: 'JetBrains Mono, monospace' }}>
              {alert.asset}
            </span>
          </div>
          <p style={{ fontSize: '10px', color: T.text2, margin: 0, marginBottom: '4px', lineHeight: 1.4 }}>
            {alert.description}
          </p>
          <span style={{ fontSize: '9px', color: T.text3, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={9} />
            {alert.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
}

function AllocationItem({ name, current, target }: { name: string; current: number; target: number }) {
  const diff = current - target;
  const needsAdjustment = Math.abs(diff) > 5;

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '10px' }}>
        <span style={{ color: T.text2 }}>{name}</span>
        <span style={{ color: needsAdjustment ? (diff > 0 ? T.danger : T.warn) : T.text0, fontFamily: 'JetBrains Mono, monospace' }}>
          {current}% / {target}%
        </span>
      </div>
      <div style={{
        height: '6px',
        background: T.bg2,
        borderRadius: '3px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          height: '100%',
          width: `${target}%`,
          background: 'rgba(41,98,255,0.2)',
          borderRadius: '3px',
          position: 'absolute',
          left: 0,
        }} />
        <div style={{
          height: '100%',
          width: `${current}%`,
          background: needsAdjustment ? (diff > 0 ? T.danger : T.warn) : T.brand,
          borderRadius: '3px',
          position: 'relative',
          zIndex: 1,
        }} />
      </div>
      {needsAdjustment && (
        <div style={{ fontSize: '9px', color: diff > 0 ? T.danger : T.warn, marginTop: '2px' }}>
          {diff > 0 ? `+${diff}% surcroit` : `${diff}% manquant`}
        </div>
      )}
    </div>
  );
}
