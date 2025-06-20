import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowUp, Briefcase, Calendar, User, Search, FileText, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useUserData } from "@/hooks/useUserData";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

const Dashboard = () => {
  const navigate = useNavigate();
  const userData = useUserData();
  const [userDataLocal, setUserData] = useState<any>(null);
  const [actionPlan, setActionPlan] = useState<string>("");
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState("");
  const [milestones, setMilestones] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [matchedJobs, setMatchedJobs] = useState(0);
  const [onboardingSkipped, setOnboardingSkipped] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('jobhop-user-data');
    if (data) {
      setUserData(JSON.parse(data));
    }
  }, []);

  useEffect(() => {
    const plan = localStorage.getItem("jobhop-action-plan");
    if (plan) setActionPlan(plan);
  }, []);

  useEffect(() => {
    const ms = localStorage.getItem("jobhop-milestones");
    if (ms) {
      const parsed = JSON.parse(ms);
      setMilestones(parsed);
      const completed = parsed.filter((m: any) => m.completed).length;
      setProgress(parsed.length > 0 ? Math.round((completed / parsed.length) * 100) : 0);
    }
  }, []);

  useEffect(() => {
    const jobs = localStorage.getItem("jobhop-matched-jobs");
    if (jobs) setMatchedJobs(Number(jobs));
  }, []);

  useEffect(() => {
    const skipped = localStorage.getItem('jobhop-onboarding-skipped');
    setOnboardingSkipped(skipped === 'true');
  }, []);

  const regeneratePlan = async () => {
    setPlanLoading(true);
    setPlanError("");
    const userData = localStorage.getItem("jobhop-user-data");
    if (!userData) {
      setPlanError("No user data found.");
      setPlanLoading(false);
      return;
    }
    const formData = JSON.parse(userData);
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    if (!apiKey) {
      setPlanError("DeepSeek API key not set. Please check your .env file.");
      setPlanLoading(false);
      return;
    }
    const prompt = `Create a personalized, step-by-step career action plan for a user with the following background and goals.\n\nCurrent Job: ${formData.currentJob}\nIndustry: ${formData.industry}\nExperience: ${formData.experience} years\nSalary: ${formData.salary}\nEducation: ${formData.education}\nSkills: ${formData.skills}\nCareer Goals: ${formData.goals}\nFrustrations: ${formData.frustrations}\n\nThe plan should be motivating, actionable, and tailored to their goals and frustrations. Format as a clear, numbered action plan with short explanations for each step.`;
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "JobHop AI Dashboard"
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
      const plan = data.choices?.[0]?.message?.content?.trim() || "Sorry, no action plan generated.";
      setActionPlan(plan);
      localStorage.setItem("jobhop-action-plan", plan);
    } catch (err) {
      setPlanError("Sorry, there was a problem connecting to the AI. Please try again later.");
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark-gradient-bg pb-20">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Briefcase className="h-6 w-6 text-teal-400" />
                <ArrowUp className="h-3 w-3 text-green-400 absolute -top-1 -right-1" />
              </div>
              <span className="font-bold text-teal-400">JobHop AI</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/coach")}>
              <User className="h-4 w-4" />
            </Button>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              {onboardingSkipped || !userData || !userData.currentJob ? 'Welcome to JobHop AI!' : `Hey ${userData.currentJob || userData.name || 'there'}! 👋`}
            </h1>
            <p className="text-slate-300">
              {onboardingSkipped || !userData || !userData.goals ? 'Discover better jobs, build your future, and take control of your career journey.' : userData.goals ? `Goal: ${userData.goals}` : 'Ready to make your next career move?'}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 space-y-6">
        <div className="max-w-md mx-auto space-y-6">
          {onboardingSkipped || !userData || !userData.currentJob ? (
            <Card className="p-6 glass-card text-center">
              <h2 className="text-lg font-semibold text-slate-100 mb-2">Welcome to JobHop AI</h2>
              <p className="text-slate-300 mb-4">Start your journey to a better career. Complete onboarding to unlock personalized features and your AI-powered roadmap.</p>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white" onClick={() => navigate('/onboarding')}>Start Onboarding</Button>
            </Card>
          ) : (
            <>
              {/* Progress Card */}
              <Card className="p-6 glass-card">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-100">Your Hop Progress</h2>
                    <Badge className={progress >= 70 ? "bg-green-500 text-white" : progress >= 30 ? "bg-yellow-500 text-white" : "bg-red-500 text-white"}>
                      {progress >= 70 ? "On Track" : progress >= 30 ? "Getting Started" : "Behind"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{userData?.currentJob ? `From: ${userData.currentJob}` : "Career transition"}</span>
                      <span className="font-medium text-slate-100">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>
                  <div className="flex justify-between pt-2">
                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-teal-400">{userData?.goals ? userData.goals : "Set a goal!"}</div>
                      <div className="text-xs text-slate-400">Goal</div>
                    </div>
                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-green-400">{matchedJobs}</div>
                      <div className="text-xs text-slate-400">Jobs matched</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className="p-4 glass-card cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 hover:bg-slate-700/40"
                  onClick={() => navigate("/jobs")}
                >
                  <div className="text-center space-y-2">
                    <div className="p-3 bg-teal-400/20 rounded-full w-fit mx-auto">
                      <Search className="h-6 w-6 text-teal-400" />
                    </div>
                    <h3 className="font-semibold text-slate-100">Browse Jobs</h3>
                    <p className="text-xs text-slate-400">Find your next opportunity</p>
                  </div>
                </Card>

                <Card 
                  className="p-4 glass-card cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 hover:bg-slate-700/40"
                  onClick={() => navigate("/resume")}
                >
                  <div className="text-center space-y-2">
                    <div className="p-3 bg-green-400/20 rounded-full w-fit mx-auto">
                      <FileText className="h-6 w-6 text-green-400" />
                    </div>
                    <h3 className="font-semibold text-slate-100">Build Resume</h3>
                    <p className="text-xs text-slate-400">AI-powered optimization</p>
                  </div>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="p-6 glass-card">
                <h2 className="text-lg font-semibold text-slate-100 mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-1.5 bg-teal-400/20 rounded-full">
                      <Calendar className="h-4 w-4 text-teal-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-100">Profile completed</p>
                      <p className="text-xs text-slate-400">Just now</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="p-1.5 bg-green-400/20 rounded-full">
                      <Search className="h-4 w-4 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-100">8 new job matches found</p>
                      <p className="text-xs text-slate-400">Based on your profile</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Next Steps */}
              <Card className="p-6 glass-card">
                <h2 className="text-lg font-semibold text-slate-100 mb-4">Recommended Next Steps</h2>
                <div className="space-y-3">
                  <button 
                    className="w-full justify-start h-auto p-4 border border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700 transition-colors rounded-md flex"
                    onClick={() => navigate("/hop-tracker")}
                  >
                    <div className="text-left">
                      <div className="font-medium text-slate-100">Set up your Hop Timeline</div>
                      <div className="text-xs text-slate-400">Plan your career moves strategically</div>
                    </div>
                  </button>
                  
                  <button 
                    className="w-full justify-start h-auto p-4 border border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700 transition-colors rounded-md flex"
                    onClick={() => navigate("/coach")}
                  >
                    <div className="text-left">
                      <div className="font-medium text-slate-100">Chat with Hop Coach</div>
                      <div className="text-xs text-slate-400">Get personalized career advice</div>
                    </div>
                  </button>
                </div>
              </Card>

              {/* Action Plan Section */}
              {actionPlan && (
                <Card className="mt-8 p-0 glass-card border-0 shadow-xl overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-teal-500/90 to-cyan-400/80 px-6 py-4 flex items-center gap-3">
                    <CheckCircle className="h-7 w-7 text-white drop-shadow" />
                    <h2 className="text-xl font-extrabold text-white tracking-tight">Your Personalized Action Plan</h2>
                    <div className="ml-auto">
                      <Button size="sm" variant="secondary" onClick={regeneratePlan} disabled={planLoading} className="bg-white/20 text-white hover:bg-white/30 border-0">
                        {planLoading ? "Regenerating..." : "Regenerate"}
                      </Button>
                    </div>
                  </div>
                  {/* Plan Content as Carousel */}
                  <div className="relative bg-slate-800/80 px-4 py-8">
                    {planError && <div className="text-red-400 mb-2 font-semibold px-2">{planError}</div>}
                    {/\d+\./.test(actionPlan) ? (
                      <div className="relative flex flex-col items-center">
                        <Carousel className="w-full max-w-md mx-auto">
                          <CarouselContent>
                            {actionPlan.split(/\n\d+\./).filter(Boolean).map((step, idx) => (
                              <CarouselItem key={idx} className="px-2">
                                <div className="bg-slate-700/70 rounded-2xl px-6 py-8 shadow-lg border border-slate-600/40 flex flex-col items-center justify-center min-h-[180px]">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl font-bold text-teal-300">Step {idx + 1}</span>
                                  </div>
                                  <span className="block text-lg leading-relaxed font-medium text-slate-100 text-center">{step.trim().replace(/^\d+\./, "")}</span>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <div className="flex justify-between items-center w-full mt-4 px-4">
                            <CarouselPrevious className="static relative left-0 bg-slate-700/80 text-white border-0 shadow" />
                            <CarouselNext className="static relative right-0 bg-slate-700/80 text-white border-0 shadow" />
                          </div>
                        </Carousel>
                      </div>
                    ) : (
                      <div className="px-2">
                        <div className="bg-slate-700/70 rounded-2xl px-6 py-8 shadow-lg border border-slate-600/40 flex flex-col items-center justify-center min-h-[180px]">
                          <span className="block text-lg leading-relaxed font-medium text-slate-100 text-center">{actionPlan}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
