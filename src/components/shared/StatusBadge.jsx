const statusStyles = {
  active: {
    background: 'rgba(27, 67, 50, 0.08)',
    color: '#1B4332',
    border: 'rgba(27, 67, 50, 0.2)',
  },
  upcoming: {
    background: 'rgba(27, 67, 50, 0.08)',
    color: '#1B4332',
    border: 'rgba(27, 67, 50, 0.2)',
  },
  inactive: {
    background: 'rgba(140, 123, 107, 0.08)',
    color: '#8C7B6B',
    border: 'rgba(140, 123, 107, 0.2)',
  },
  pending: {
    background: 'rgba(211, 149, 66, 0.08)',
    color: '#D39542',
    border: 'rgba(211, 149, 66, 0.2)',
  },
  ongoing: {
    background: 'rgba(211, 149, 66, 0.08)',
    color: '#D39542',
    border: 'rgba(211, 149, 66, 0.2)',
  },
  completed: {
    background: 'rgba(61, 50, 39, 0.05)',
    color: '#6B5A4E',
    border: 'rgba(61, 50, 39, 0.1)',
  },
}

export default function StatusBadge({ status }) {
  const styles = statusStyles[status] || statusStyles.inactive
  
  const displayText = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'
  
  return (
    <span 
      className="inline-flex items-center px-2 py-0.5 text-sm font-medium rounded"
      style={{
        backgroundColor: styles.background,
        color: styles.color,
        border: `1px solid ${styles.border}`,
      }}
    >
      {displayText}
    </span>
  )
}
