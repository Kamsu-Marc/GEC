import React from 'react';

export const StatCard = ({ label, value, type = 'default' }) => {
  let cardClass = 'kpi-card';
  if (type === 'danger') cardClass += ' kpi-danger';
  if (type === 'warning') cardClass += ' kpi-warning';
  if (type === 'success') cardClass += ' kpi-success';

  return (
    <div className={cardClass}>
      <div className="kpi-card-label">{label}</div>
      <div className="kpi-card-value">{value}</div>
    </div>
  );
};
