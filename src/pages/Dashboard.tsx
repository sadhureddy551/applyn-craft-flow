import { motion } from "framer-motion";
import { Boxes, GitBranch, LayoutDashboard, FileText, TrendingUp, DollarSign, Users, Zap, Plus, FileStack, Upload } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { dashboardStats, chartData, mockActivities } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useNavigate } from "react-router-dom";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Welcome back, John. Here's your CRM overview.</p>
        </div>
        <Button className="gradient-brand text-primary-foreground shadow-brand hover:opacity-90 transition-opacity" onClick={() => navigate("/modules")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Module
        </Button>
      </div>

      {/* Metrics */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Records" value={dashboardStats.totalRecords.toLocaleString()} change="+23% this month" changeType="positive" icon={FileText} />
        <MetricCard title="Active Leads" value={dashboardStats.activeLeads} change="+12 this week" changeType="positive" icon={Users} />
        <MetricCard title="Revenue" value={`$${(dashboardStats.revenue / 1000).toFixed(0)}K`} change="+18% vs last month" changeType="positive" icon={DollarSign} />
        <MetricCard title="Conversion Rate" value={`${dashboardStats.conversionRate}%`} change="+2.3% improvement" changeType="positive" icon={TrendingUp} />
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Records Growth</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData.recordsTrend}>
              <defs>
                <linearGradient id="colorRecords" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(263, 70%, 58%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(263, 70%, 58%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
              <Tooltip />
              <Area type="monotone" dataKey="records" stroke="hsl(263, 70%, 58%)" fill="url(#colorRecords)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Pipeline Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={chartData.pipelineDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {chartData.pipelineDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2">
            {chartData.pipelineDistribution.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {mockActivities.map((a) => (
              <div key={a.id} className="flex items-start gap-3 text-sm">
                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                  a.type === 'record_created' ? 'bg-accent' : a.type === 'stage_changed' ? 'bg-primary' : 'bg-brand-blue'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-card-foreground">{a.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Create Module', icon: Boxes, action: () => navigate('/modules') },
              { label: 'Install Template', icon: FileStack, action: () => navigate('/templates') },
              { label: 'View Pipeline', icon: GitBranch, action: () => navigate('/pipelines') },
              { label: 'Import Data', icon: Upload, action: () => {} },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-card-foreground hover:bg-muted/50 transition-colors text-left"
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                {item.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
