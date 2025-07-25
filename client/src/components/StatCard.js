// src/components/StatCard.js
import React from 'react';
import { ArrowUpRight, Package } from 'lucide-react'; // Assuming Lucide React is available

const StatCard = ({ title, value, color, icon: IconComponent }) => {
  
  const valueTextColorClass = color === 'black' ? 'text-dark' :
                              color === 'orange' ? 'text-warning' :
                              color === 'red' ? 'text-danger' :
                              'text-primary'; 
  const valueInlineStyle = {
    color: color === 'black' ? '#333' : 
           color === 'orange' ? '#ff9800' :
           color === 'red' ? '#ef5350' :
           color
  };

  return (
    <div className="card p-2 shadow-sm rounded-3 h-100 d-flex flex-column justify-content-between">
      <div className="d-flex align-items-center justify-content-between mb-1">
        <div className="rounded-circle bg-success-subtle p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
          {IconComponent && <IconComponent size={20} className="text-success" />} {/* Smaller icon */}
        </div>
        <ArrowUpRight size={18} className="text-secondary" /> {/* Smaller arrow, muted color */}
      </div>
      <div className="mt-auto"> {/* Pushes content to bottom */}
        <h6 className="mb-0 text-muted small">{title}</h6> {/* Smaller, muted title */}
        <h4 className={`fw-bold mb-0 ${valueTextColorClass}`} style={valueInlineStyle}>{value}</h4> {/* Bold value */}
      </div>
    </div>
  );
};

export default StatCard;