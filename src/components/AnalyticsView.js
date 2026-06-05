import React, { useMemo, useEffect, useRef } from 'react';
import { 
  Utensils, 
  Plane, 
  ShoppingBag, 
  Receipt, 
  Banknote, 
  HelpCircle 
} from 'lucide-react';
import Chart from 'chart.js/auto';
import { formatCurrency, getCategoryColorHex, getLastSixMonths } from '../utils/helpers';

const CATEGORY_ICONS = {
  Food: Utensils,
  Travel: Plane,
  Shopping: ShoppingBag,
  Bills: Receipt,
  Salary: Banknote,
  Other: HelpCircle
};

export default function AnalyticsView({ transactions, theme }) {
  const lineChartRef = useRef(null);
  const lineChartInstance = useRef(null);

  // Calculate Insights
  const categoryInsights = useMemo(() => {
    const expensesOnly = transactions.filter(tx => tx.type === 'expense');
    const totalExpensesSum = expensesOnly.reduce((sum, tx) => sum + tx.amount, 0);

    const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Other'];
    const summary = {};
    categories.forEach(cat => summary[cat] = 0);

    expensesOnly.forEach(tx => {
      if (summary[tx.category] !== undefined) {
        summary[tx.category] += tx.amount;
      } else {
        summary['Other'] += tx.amount;
      }
    });

    let maxSpent = 0;
    categories.forEach(cat => {
      if (summary[cat] > maxSpent) maxSpent = summary[cat];
    });

    return categories.map(cat => {
      const spent = summary[cat];
      const percentOfTotal = totalExpensesSum > 0 ? (spent / totalExpensesSum) * 100 : 0;
      const percentOfMax = maxSpent > 0 ? (spent / maxSpent) * 100 : 0;
      return {
        category: cat,
        spent,
        percentOfTotal,
        percentOfMax
      };
    });
  }, [transactions]);

  // Load Compare line chart
  useEffect(() => {
    if (lineChartRef.current) {
      if (lineChartInstance.current) {
        lineChartInstance.current.destroy();
      }

      const themeConfig = {
        textColor: theme === 'dark' ? '#94a3b8' : '#64748b',
        gridColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
      };

      const last6 = getLastSixMonths();
      const monthsKeys = last6.map(m => m.key);
      const monthsLabels = last6.map(m => m.label);

      const incomes = Array(6).fill(0);
      const expenses = Array(6).fill(0);

      transactions.forEach(tx => {
        const txMonth = tx.date.substring(0, 7);
        const idx = monthsKeys.indexOf(txMonth);
        if (idx !== -1) {
          if (tx.type === 'income') {
            incomes[idx] += tx.amount;
          } else {
            expenses[idx] += tx.amount;
          }
        }
      });

      lineChartInstance.current = new Chart(lineChartRef.current, {
        type: 'line',
        data: {
          labels: monthsLabels,
          datasets: [
            {
              label: 'Inflow (Income)',
              data: incomes,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              borderWidth: 3,
              tension: 0.35,
              fill: true
            },
            {
              label: 'Outflow (Expenses)',
              data: expenses,
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              borderWidth: 3,
              tension: 0.35,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: themeConfig.textColor,
                font: { family: 'Outfit' }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: themeConfig.textColor, font: { family: 'Outfit' } }
            },
            y: {
              grid: { color: themeConfig.gridColor },
              ticks: { color: themeConfig.textColor, font: { family: 'Outfit' } }
            }
          }
        }
      });
    }

    return () => {
      if (lineChartInstance.current) {
        lineChartInstance.current.destroy();
      }
    };
  }, [transactions, theme]);

  return (
    <section id="view-analytics" className="content-section active">
      <div className="analytics-layout-grid">
        
        {/* Category insights & stats list */}
        <div className="analytics-sidebar-panel glass-card">
          <div className="card-header">
            <h3 className="card-title">Category Insights</h3>
            <span className="card-subtitle">Detailed breakdown of expense categories</span>
          </div>
          
          <ul className="insights-list" id="category-insights-list">
            {categoryInsights.map(item => {
              const Icon = CATEGORY_ICONS[item.category] || HelpCircle;
              const color = getCategoryColorHex(item.category);

              return (
                <li className="insight-item" key={item.category}>
                  <div className="insight-item-header">
                    <span className="insight-item-label">
                      <Icon size={16} style={{ color: color }} />
                      <span>{item.category}</span>
                    </span>
                    <span className="insight-item-val">
                      {formatCurrency(item.spent)} ({item.percentOfTotal.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="insight-bar-wrapper">
                    <div 
                      className="insight-bar-fill" 
                      style={{ width: `${item.percentOfMax}%`, background: color }}
                    ></div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        
        {/* Interactive Analytics Chart Card */}
        <div className="analytics-main-panel glass-card">
          <div className="card-header space-between">
            <div>
              <h3 className="card-title">Full Summary Performance</h3>
              <span className="card-subtitle">Income vs Expenses distribution comparison</span>
            </div>
          </div>
          
          <div className="analytics-charts-wrapper">
            <div className="analytics-chart-container">
              <canvas ref={lineChartRef}></canvas>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
