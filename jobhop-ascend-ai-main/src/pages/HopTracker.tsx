import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Briefcase, ArrowUp, Calendar, TrendingUp, Target, ChevronRight, X } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useUserData } from "@/hooks/useUserData";

const HopTracker = () => {
  const [activeTab, setActiveTab] = useState("timeline");
  const [careerPath, setCareerPath] = useState(() => {
    const saved = localStorage.getItem("jobhop-careerPath");
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        title: "Customer Service Rep",
        company: "Current Job",
        duration: "Present",
        salary: "$28,000",
        status: "current",
        skills: ["Customer Service", "Problem Solving", "Communication"]
      },
      {
        id: 2,
        title: "Customer Success Coordinator",
        company: "Target Role",
        duration: "Next 3-6 months",
        salary: "$42,000 - $52,000",
        status: "target",
        skills: ["Account Management", "SaaS Tools", "Data Analysis"]
      },
      {
        id: 3,
        title: "Customer Success Manager",
        company: "Future Goal",
        duration: "12-18 months",
        salary: "$60,000 - $75,000",
        status: "future",
        skills: ["Team Leadership", "Strategic Planning", "Client Relations"]
      }
    ];
  });
  const [milestones, setMilestones] = useState(() => {
    const saved = localStorage.getItem("jobhop-milestones");
    return saved ? JSON.parse(saved) : [
      { id: 1, title: "Complete profile", completed: true, date: "Today" },
      { id: 2, title: "Apply to 5 target jobs", completed: false, date: "Next 2 weeks" },
      { id: 3, title: "Complete online course", completed: false, date: "Next month" },
      { id: 4, title: "Network with 3 professionals", completed: false, date: "Ongoing" },
      { id: 5, title: "Update LinkedIn profile", completed: false, date: "This week" },
    ];
  });
  const [showActionPlan, setShowActionPlan] = useState(false);
  const [actionPlan, setActionPlan] = useState("");
  const [actionPlanLoading, setActionPlanLoading] = useState(false);
  const [actionPlanError, setActionPlanError] = useState("");
  const userData = useUserData();
  // Persist changes
  useEffect(() => {
    localStorage.setItem("jobhop-careerPath", JSON.stringify(careerPath));
  }, [careerPath]);
  useEffect(() => {
    localStorage.setItem("jobhop-milestones", JSON.stringify(milestones));
  }, [milestones]);

  // Edit career path
  const handleCareerEdit = (id, field, value) => {
    setCareerPath(prev => prev.map(job => job.id === id ? { ...job, [field]: value } : job));
  };
  // Edit skills (comma separated)
  const handleSkillsEdit = (id, value) => {
    setCareerPath(prev => prev.map(job => job.id === id ? { ...job, skills: value.split(",").map(s => s.trim()).filter(Boolean) } : job));
  };
  // Milestone complete toggle
  const toggleMilestone = (id) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, completed: !m.completed } : m));
  };
  // Add new milestone
  const [newMilestone, setNewMilestone] = useState("");
  const [newMilestoneDate, setNewMilestoneDate] = useState("");
  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    setMilestones(prev => [
      ...prev,
      { id: Date.now(), title: newMilestone, completed: false, date: newMilestoneDate || "" }
    ]);
    setNewMilestone("");
    setNewMilestoneDate("");
  };

  const completedMilestones = milestones.filter(m => m.completed).length;
  const progressPercentage = (completedMilestones / milestones.length) * 100;

  // DeepSeek Action Plan
  const handleViewActionPlan = async () => {
    setShowActionPlan(true);
    setActionPlan("");
    setActionPlanError("");
    setActionPlanLoading(true);
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    if (!apiKey) {
      setActionPlanError("DeepSeek API key not set. Please check your .env file.");
      setActionPlanLoading(false);
      return;
    }
    // Find current and target jobs
    const current = careerPath.find(j => j.status === "current");
    const target = careerPath.find(j => j.status === "target");
    const skills = current?.skills?.join(", ") || "";
    const prompt = `Create a step-by-step, actionable roadmap for someone currently working as a ${current?.title || "[current job]"} who wants to become a ${target?.title || "[target role]"}. Their current skills are: ${skills}. The plan should include learning goals, networking, job applications, and any certifications or experience needed. Format as a clear, motivating action plan.`;
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "JobHop AI HopTracker"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat-v3-0324",
          messages: [
            { role: "system", content: "You are a world-class career coach. Return only the action plan, no extra commentary." },
            { role: "user", content: prompt },
          ],
          max_tokens: 600,
          temperature: 0.7,
        }),
      });
      if (!response.ok) throw new Error("AI API error");
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim() || "Sorry, no action plan generated.";
      setActionPlan(content);
    } catch (err) {
      setActionPlanError("Sorry, there was a problem connecting to the AI. Please try again later.");
    } finally {
      setActionPlanLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark-gradient-bg pb-20">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="mb-4 p-4 bg-slate-700/40 rounded-lg text-slate-200 text-sm">
            <strong>Welcome to your Hop Tracker!</strong><br/>
            {userData?.name ? `Welcome, ${userData.name}! ` : ''}
            {userData?.currentJob ? `Tracking your journey from ${userData.currentJob}. ` : ''}
            {userData?.goals ? `Goal: ${userData.goals}` : 'Track your career journey, milestones, and next steps here.'}
          </div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative">
              <Briefcase className="h-6 w-6 text-teal-400" />
              <ArrowUp className="h-3 w-3 text-green-400 absolute -top-1 -right-1" />
            </div>
            <h1 className="text-xl font-bold text-teal-400">Hop Tracker</h1>
          </div>
          
          {/* Progress Overview */}
          <Card className="p-4 glass-card">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-100">Your Career Journey</h2>
                <Badge className="bg-green-500 text-white">
                  {completedMilestones}/{milestones.length} complete
                </Badge>
              </div>
              <div className="space-y-2">
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-xs text-slate-400">
                  {progressPercentage.toFixed(0)}% towards your next career hop
                </p>
              </div>
            </div>
          </Card>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex space-x-1 bg-slate-700/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("timeline")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "timeline"
                  ? "bg-teal-500 text-white shadow-sm"
                  : "text-slate-300 hover:text-slate-100"
              }`}
            >
              Career Path
            </button>
            <button
              onClick={() => setActiveTab("milestones")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "milestones"
                  ? "bg-teal-500 text-white shadow-sm"
                  : "text-slate-300 hover:text-slate-100"
              }`}
            >
              Milestones
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="px-4 pb-6">
        <div className="max-w-md mx-auto">
          {activeTab === "timeline" && (
            <div className="space-y-4">
              {careerPath.map((job, index) => (
                <Card key={job.id} className="p-4 glass-card relative">
                  {index < careerPath.length - 1 && (
                    <div className="absolute left-8 top-16 w-px h-12 bg-gradient-to-b from-teal-400 to-green-400"></div>
                  )}
                  
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full ${
                      job.status === "current" 
                        ? "bg-teal-500 text-white"
                        : job.status === "target"
                        ? "bg-green-500 text-white"
                        : "bg-slate-600 text-slate-300"
                    }`}>
                      {job.status === "current" && <Briefcase className="h-4 w-4" />}
                      {job.status === "target" && <Target className="h-4 w-4" />}
                      {job.status === "future" && <TrendingUp className="h-4 w-4" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <input
                          className="font-semibold text-slate-100 bg-transparent border-b border-slate-600 focus:outline-none focus:border-teal-400 w-1/2"
                          value={job.title}
                          onChange={e => handleCareerEdit(job.id, "title", e.target.value)}
                        />
                        <Badge 
                          variant={job.status === "current" ? "default" : "outline"}
                          className={job.status === "current" ? "bg-teal-500 text-white" : "border-slate-600 text-slate-300"}
                        >
                          {job.status === "current" ? "Current" : 
                           job.status === "target" ? "Target" : "Future"}
                        </Badge>
                      </div>
                      
                      <input
                        className="text-sm text-slate-300 mb-2 bg-transparent border-b border-slate-600 focus:outline-none focus:border-teal-400 w-full"
                        value={job.company}
                        onChange={e => handleCareerEdit(job.id, "company", e.target.value)}
                      />
                      
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <input
                            className="bg-transparent border-b border-slate-600 focus:outline-none focus:border-teal-400 w-24 text-xs text-slate-400"
                            value={job.duration}
                            onChange={e => handleCareerEdit(job.id, "duration", e.target.value)}
                          />
                        </span>
                        <input
                          className="font-semibold text-teal-400 bg-transparent border-b border-slate-600 focus:outline-none focus:border-teal-400 w-24 text-xs"
                          value={job.salary}
                          onChange={e => handleCareerEdit(job.id, "salary", e.target.value)}
                        />
                      </div>
                      
                      <input
                        className="text-xs text-slate-300 bg-transparent border-b border-slate-600 focus:outline-none focus:border-teal-400 w-full mb-2"
                        value={job.skills.join(", ")}
                        onChange={e => handleSkillsEdit(job.id, e.target.value)}
                        placeholder="Skills (comma separated)"
                      />
                      
                      {job.status === "target" && (
                        <Button 
                          size="sm" 
                          className="mt-3 bg-green-500 hover:bg-green-600 text-white"
                          onClick={handleViewActionPlan}
                        >
                          View Action Plan
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              {/* Action Plan Modal */}
              {showActionPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                  <div className="bg-slate-800 rounded-lg shadow-lg max-w-lg w-full p-6 relative">
                    <button className="absolute top-3 right-3 text-slate-400 hover:text-white" onClick={() => setShowActionPlan(false)}>
                      <X className="h-5 w-5" />
                    </button>
                    <h2 className="text-xl font-bold text-teal-400 mb-4">Your Action Plan</h2>
                    {actionPlanLoading && <p className="text-slate-300">Generating roadmap...</p>}
                    {actionPlanError && <p className="text-red-400">{actionPlanError}</p>}
                    {actionPlan && (
                      <pre className="whitespace-pre-wrap text-slate-100 text-sm mt-2 max-h-96 overflow-y-auto">{actionPlan}</pre>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "milestones" && (
            <div className="space-y-3">
              {milestones.map((milestone) => (
                <Card key={milestone.id} className="p-4 glass-card">
                  <div className="flex items-center space-x-3">
                    <button
                      className={`p-1 rounded-full focus:outline-none ${
                        milestone.completed 
                          ? "bg-green-500 text-white" 
                          : "bg-slate-600 text-slate-400"
                      }`}
                      onClick={() => toggleMilestone(milestone.id)}
                      aria-label="Toggle milestone"
                    >
                      <div className="h-2 w-2 rounded-full bg-current"></div>
                    </button>
                    
                    <div className="flex-1">
                      <input
                        className={`font-medium bg-transparent border-b border-slate-600 focus:outline-none focus:border-teal-400 w-full ${milestone.completed ? "text-slate-100" : "text-slate-300"}`}
                        value={milestone.title}
                        onChange={e => setMilestones(prev => prev.map(m => m.id === milestone.id ? { ...m, title: e.target.value } : m))}
                      />
                      <input
                        className="text-xs bg-transparent border-b border-slate-600 focus:outline-none focus:border-teal-400 w-32 text-slate-400"
                        value={milestone.date}
                        onChange={e => setMilestones(prev => prev.map(m => m.id === milestone.id ? { ...m, date: e.target.value } : m))}
                      />
                    </div>
                    
                    {milestone.completed && (
                      <Badge className="bg-green-500 text-white text-xs">
                        Complete
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
              {/* Add new milestone */}
              <Card className="p-4 glass-card mt-2">
                <div className="flex items-center gap-2">
                  <input
                    className="flex-1 bg-transparent border-b border-slate-600 focus:outline-none focus:border-teal-400 text-slate-100 text-sm"
                    placeholder="Add new milestone..."
                    value={newMilestone}
                    onChange={e => setNewMilestone(e.target.value)}
                  />
                  <input
                    className="w-32 bg-transparent border-b border-slate-600 focus:outline-none focus:border-teal-400 text-slate-400 text-xs"
                    placeholder="Date (optional)"
                    value={newMilestoneDate}
                    onChange={e => setNewMilestoneDate(e.target.value)}
                  />
                  <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white" onClick={addMilestone}>
                    Add
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default HopTracker;
