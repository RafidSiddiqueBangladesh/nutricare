import { motion } from "framer-motion";
import { BarChart3, Users, Activity, Brain, TrendingUp, Calendar, FileText, Heart } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const emotionData = [
  { time: "Mon", happy: 65, stressed: 20, neutral: 40, sad: 10 },
  { time: "Tue", happy: 72, stressed: 15, neutral: 35, sad: 8 },
  { time: "Wed", happy: 55, stressed: 35, neutral: 30, sad: 18 },
  { time: "Thu", happy: 80, stressed: 10, neutral: 25, sad: 5 },
  { time: "Fri", happy: 60, stressed: 28, neutral: 38, sad: 12 },
  { time: "Sat", happy: 85, stressed: 8, neutral: 20, sad: 3 },
  { time: "Sun", happy: 78, stressed: 12, neutral: 30, sad: 6 },
];

const therapyData = [
  { name: "Meditation", completed: 85, color: "#00ffff" },
  { name: "Exercise", completed: 62, color: "#9966ff" },
  { name: "Laughter", completed: 78, color: "#ff66aa" },
  { name: "Breathing", completed: 91, color: "#66ff99" },
];

const stressHistory = [
  { day: "1", level: 68 }, { day: "5", level: 55 }, { day: "10", level: 42 },
  { day: "15", level: 48 }, { day: "20", level: 35 }, { day: "25", level: 28 }, { day: "30", level: 22 },
];

const patients = [
  { name: "Sarah K.", emotion: "😊 Happy", stress: "Low", therapy: "Meditation", progress: 82 },
  { name: "James M.", emotion: "😰 Stressed", stress: "High", therapy: "Breathing", progress: 45 },
  { name: "Aisha R.", emotion: "😐 Neutral", stress: "Medium", therapy: "Exercise", progress: 68 },
  { name: "David L.", emotion: "😊 Happy", stress: "Low", therapy: "Laughter", progress: 91 },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background bg-grid pt-24 pb-12">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            HEALTH <span className="text-gradient-primary">DASHBOARD</span>
          </h1>
          <p className="text-muted-foreground mb-8">Doctor's analytics and patient monitoring</p>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Users, label: "Active Patients", value: "127", change: "+12%", color: "text-glow-cyan" },
            { icon: Brain, label: "AI Sessions", value: "3,845", change: "+28%", color: "text-glow-purple" },
            { icon: Heart, label: "Avg. Stress", value: "32%", change: "-15%", color: "text-glow-pink" },
            { icon: TrendingUp, label: "Recovery Rate", value: "87%", change: "+5%", color: "text-glow-green" },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <GlassCard hover={false} className="py-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <div className="text-2xl font-display font-bold text-foreground">{stat.value}</div>
                <span className={`text-xs font-mono ${stat.change.startsWith("+") ? "text-glow-green" : "text-glow-pink"}`}>{stat.change}</span>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Emotion Trends */}
          <GlassCard hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-primary" />
              <span className="font-display text-xs font-semibold tracking-wider">EMOTION TRENDS</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={emotionData}>
                <defs>
                  <linearGradient id="gHappy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00ffff" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00ffff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gStressed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff66aa" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ff66aa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(220,20%,20%,0.5)" />
                <XAxis dataKey="time" tick={{ fill: "#888", fontSize: 11 }} />
                <YAxis tick={{ fill: "#888", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(220,25%,10%)", border: "1px solid hsl(220,20%,18%)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="happy" stroke="#00ffff" fill="url(#gHappy)" strokeWidth={2} />
                <Area type="monotone" dataKey="stressed" stroke="#ff66aa" fill="url(#gStressed)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Stress Reduction */}
          <GlassCard hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-glow-green" />
              <span className="font-display text-xs font-semibold tracking-wider">STRESS REDUCTION (30 DAYS)</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stressHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(220,20%,20%,0.5)" />
                <XAxis dataKey="day" tick={{ fill: "#888", fontSize: 11 }} label={{ value: "Day", fill: "#666", fontSize: 10 }} />
                <YAxis tick={{ fill: "#888", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(220,25%,10%)", border: "1px solid hsl(220,20%,18%)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="level" stroke="#66ff99" strokeWidth={2} dot={{ fill: "#66ff99", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Therapy Completion */}
          <GlassCard hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-glow-purple" />
              <span className="font-display text-xs font-semibold tracking-wider">THERAPY COMPLETION</span>
            </div>
            <div className="space-y-4">
              {therapyData.map((t) => (
                <div key={t.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{t.name}</span>
                    <span className="font-mono text-foreground">{t.completed}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: t.color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${t.completed}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Patient Table */}
          <div className="lg:col-span-2">
            <GlassCard hover={false}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-glow-cyan" />
                  <span className="font-display text-xs font-semibold tracking-wider">RECENT PATIENTS</span>
                </div>
                <button className="flex items-center gap-1 text-xs text-primary font-mono hover:underline">
                  <FileText className="w-3 h-3" /> View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-muted-foreground border-b border-border">
                      <th className="text-left py-2 font-medium">Patient</th>
                      <th className="text-left py-2 font-medium">Emotion</th>
                      <th className="text-left py-2 font-medium">Stress</th>
                      <th className="text-left py-2 font-medium">Therapy</th>
                      <th className="text-right py-2 font-medium">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((p, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-3 font-medium text-foreground">{p.name}</td>
                        <td className="py-3">{p.emotion}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            p.stress === "Low" ? "bg-glow-green/10 text-glow-green" :
                            p.stress === "High" ? "bg-destructive/10 text-destructive" :
                            "bg-glow-amber/10 text-glow-amber"
                          }`}>{p.stress}</span>
                        </td>
                        <td className="py-3 text-muted-foreground">{p.therapy}</td>
                        <td className="py-3 text-right font-mono text-foreground">{p.progress}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
