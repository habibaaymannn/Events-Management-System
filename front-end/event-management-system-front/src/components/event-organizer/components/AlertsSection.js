import React from "react";

const AlertsSection = ({ alerts, onDismissAlert }) => {
  if (alerts.length === 0) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      {alerts.slice(-3).map(alert => (
        <div 
          key={alert.id} 
          className={`notification notification-${alert.type}`} 
          style={{
            position: 'relative',
            top: 'auto',
            right: 'auto',
            marginBottom: 10,
            cursor: 'pointer'
          }}
          onClick={() => onDismissAlert(alert.id)}
        >
          {alert.message}
          <span style={{ float: 'right', marginLeft: 10 }}>×</span>
        </div>
      ))}
    </div>
  );
};

export default AlertsSection;
