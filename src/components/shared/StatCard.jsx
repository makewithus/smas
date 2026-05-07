import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ 
  title, 
  value, 
  subtitle,
  icon: Icon, 
  iconBgColor = 'rgba(27,67,50,0.08)', 
  iconColor = '#1B4332',
  trend 
}) {
  return (
    <div className="bg-white border border-[#E8DFD4] rounded-md p-5">
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div 
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: iconBgColor }}
        >
          {Icon && <Icon size={18} style={{ color: iconColor }} />}
        </div>
        
        {/* Trend Badge */}
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${
            trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.direction === 'up' ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
      
      {/* Value */}
      <p className="font-serif text-3xl text-brand mt-3">
        {value}
      </p>
      
      {/* Title */}
      <p className="text-sm text-neutral-600 mt-1">
        {title}
      </p>
      
      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs text-neutral-500 mt-0.5">
          {subtitle}
        </p>
      )}
    </div>
  )
}
