import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowUp, Briefcase, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    currentJob: "",
    industry: "",
    experience: "",
    salary: "",
    education: "",
    skills: "",
    goals: "",
    frustrations: ""
  });
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [planError, setPlanError] = useState("");

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleSkip = () => {
    localStorage.setItem('jobhop-onboarding-skipped', 'true');
    localStorage.removeItem('jobhop-user-data');
    localStorage.removeItem('jobhop-action-plan');
    navigate('/dashboard');
  };

  const isFormComplete = Object.values(formData).every(val => val && val.trim() !== "");

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Save data to localStorage for demo
      localStorage.setItem('jobhop-user-data', JSON.stringify(formData));
      localStorage.setItem('jobhop-onboarding-skipped', 'false');
      if (!isFormComplete) {
        // Incomplete onboarding, do not generate plan
        navigate('/dashboard');
        return;
      }
      setLoadingPlan(true);
      setPlanError("");
      // Generate AI plan
      const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
      if (!apiKey) {
        setPlanError("DeepSeek API key not set. Please check your .env file.");
        setLoadingPlan(false);
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
            "X-Title": "JobHop AI Onboarding"
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
        localStorage.setItem('jobhop-action-plan', plan);
        setLoadingPlan(false);
        navigate("/dashboard");
      } catch (err) {
        setPlanError("Sorry, there was a problem connecting to the AI. Please try again later.");
        setLoadingPlan(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate("/");
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen dark-gradient-bg">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button variant="ghost" size="sm" onClick={handleBack} className="text-slate-300 hover:text-slate-100 hover:bg-slate-700/40">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Briefcase className="h-6 w-6 text-teal-400" />
              <ArrowUp className="h-3 w-3 text-green-400 absolute -top-1 -right-1" />
            </div>
            <span className="font-bold text-teal-400">JobHop AI</span>
          </div>
          <div className="text-sm text-slate-400">{step}/{totalSteps}</div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-4 mb-6">
        <div className="max-w-md mx-auto">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <main className="px-4 pb-8">
        <div className="max-w-md mx-auto">
          <Card className="p-6 glass-card">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-slate-100">Let's get to know you</h2>
                  <p className="text-slate-300">Tell us about your current work situation</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentJob" className="text-slate-200">What's your current job title?</Label>
                    <Input
                      id="currentJob"
                      placeholder="e.g., Barista, Customer Service Rep, Nurse"
                      value={formData.currentJob}
                      onChange={(e) => updateFormData("currentJob", e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="industry" className="text-slate-200">What industry are you in?</Label>
                    <Select onValueChange={(value) => updateFormData("industry", value)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-100">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food-service">Food Service</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="customer-service">Customer Service</SelectItem>
                        <SelectItem value="tech">Technology</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="experience" className="text-slate-200">How many years of work experience do you have?</Label>
                    <Select onValueChange={(value) => updateFormData("experience", value)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-100">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">0-1 years</SelectItem>
                        <SelectItem value="1-3">1-3 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="5+">5+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-slate-100">Financial goals</h2>
                  <p className="text-slate-300">Help us understand your salary situation</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="salary" className="text-slate-200">What's your current annual salary?</Label>
                    <Select onValueChange={(value) => updateFormData("salary", value)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-100">
                        <SelectValue placeholder="Select salary range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-25k">Under $25,000</SelectItem>
                        <SelectItem value="25k-35k">$25,000 - $35,000</SelectItem>
                        <SelectItem value="35k-50k">$35,000 - $50,000</SelectItem>
                        <SelectItem value="50k-75k">$50,000 - $75,000</SelectItem>
                        <SelectItem value="75k+">$75,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="education" className="text-slate-200">What's your education level?</Label>
                    <Select onValueChange={(value) => updateFormData("education", value)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-100">
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high-school">High School</SelectItem>
                        <SelectItem value="some-college">Some College</SelectItem>
                        <SelectItem value="associate">Associate Degree</SelectItem>
                        <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                        <SelectItem value="master">Master's Degree</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-slate-100">Your skills & strengths</h2>
                  <p className="text-slate-300">What are you good at? (Don't be modest!)</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="skills" className="text-slate-200">List your top skills</Label>
                    <Textarea
                      id="skills"
                      placeholder="e.g., Customer service, problem-solving, Microsoft Excel, team leadership, multitasking..."
                      value={formData.skills}
                      onChange={(e) => updateFormData("skills", e.target.value)}
                      rows={4}
                      className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-slate-100">Your career goals</h2>
                  <p className="text-slate-300">What would make you excited to go to work?</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="goals" className="text-slate-200">What kind of work interests you?</Label>
                    <Textarea
                      id="goals"
                      placeholder="e.g., Remote work, creative projects, helping people, working with data, managing teams..."
                      value={formData.goals}
                      onChange={(e) => updateFormData("goals", e.target.value)}
                      rows={3}
                      className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="frustrations" className="text-slate-200">What frustrates you about your current job?</Label>
                    <Textarea
                      id="frustrations"
                      placeholder="e.g., Low pay, no growth opportunities, toxic environment, boring work..."
                      value={formData.frustrations}
                      onChange={(e) => updateFormData("frustrations", e.target.value)}
                      rows={3}
                      className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={handleNext}
              className="w-full mt-8 bg-teal-500 hover:bg-teal-600 text-slate-900 py-6 text-lg font-semibold"
            >
              {step === totalSteps ? "Create My Career Plan" : "Continue"}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-slate-400 hover:text-slate-100 hover:bg-slate-700/40"
              onClick={handleSkip}
            >
              Skip Onboarding
            </Button>
          </Card>
        </div>
      </main>

      {loadingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-800 rounded-lg shadow-lg p-8 text-center max-w-sm w-full">
            <div className="mb-4 animate-pulse">
              <span className="text-teal-400 text-2xl font-bold">Generating your personalized plan...</span>
            </div>
            <div className="text-slate-300">Our AI is creating a step-by-step action plan just for you. This usually takes a few seconds.</div>
            {planError && <div className="text-red-400 mt-4">{planError}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
