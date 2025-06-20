import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Edit, Wand2, Briefcase, ArrowUp } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import * as pdfjsLib from 'pdfjs-dist';
import { useUserData } from "@/hooks/useUserData";

const ResumeBuilder = () => {
  const [resumeData, setResumeData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "(555) 123-4567",
    summary: "Customer service professional with 3+ years of experience in fast-paced environments. Proven track record of problem-solving and building positive customer relationships. Seeking to transition into a customer success role in the tech industry.",
    experience: [
      {
        title: "Customer Service Representative",
        company: "QuickServe Restaurant",
        duration: "2021 - Present",
        bullets: [
          "Handled 50+ customer interactions daily with 95% satisfaction rating",
          "Resolved complex complaints and turned dissatisfied customers into loyal ones",
          "Trained 5 new team members on customer service best practices"
        ]
      }
    ],
    skills: ["Customer Service", "Problem Solving", "Communication", "Microsoft Office", "Team Collaboration"]
  });

  const aiSuggestions = [
    "Add quantifiable metrics to your achievements",
    "Include keywords from target job descriptions",
    "Highlight transferable skills for tech roles",
    "Strengthen your professional summary"
  ];

  const [aiForm, setAiForm] = useState({
    fullName: "",
    jobTitle: "",
    skills: "",
    workHistory: "",
    careerGoal: ""
  });
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const aiResultRef = useRef<HTMLDivElement>(null);
  const [importMessage, setImportMessage] = useState("");

  const userData = useUserData();

  useEffect(() => {
    if (userData) {
      setAiForm((prev: any) => ({
        ...prev,
        fullName: userData.name || prev.fullName,
        jobTitle: userData.currentJob || prev.jobTitle,
        skills: userData.skills?.join(", ") || prev.skills,
        workHistory: userData.experience?.map(exp => exp.description).join("\n") || prev.workHistory,
        careerGoal: userData.goals || prev.careerGoal
      }));
    }
  }, [userData]);

  const handleAiFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAiForm(prev => ({ ...prev, [name]: value }));
  };

  const generateResumePrompt = () => {
    return `Create a professional, ATS-optimized resume for the following user:\n\nFull Name: ${aiForm.fullName}\nTarget Role: ${aiForm.jobTitle}\nTop Skills: ${aiForm.skills}\nWork History:\n${aiForm.workHistory}\n\nCareer Goal:\n${aiForm.careerGoal}\n\nPlease return a clean resume format with:\n- A powerful summary (2–3 sentences)\n- 3–5 bullet points under experience (use action verbs)\n- Highlight transferable skills for their desired role\n- Keep tone confident, results-oriented, and human`;
  };

  const handleAiSubmit = async (regen = false) => {
    setAiLoading(true);
    setAiError("");
    setAiResult("");
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    if (!apiKey) {
      setAiError("DeepSeek API key not set. Please check your .env file.");
      setAiLoading(false);
      return;
    }
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "JobHop AI ResumeBuilder"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat-v3-0324",
          messages: [
            { role: "system", content: "You are a world-class resume writer and career coach. Return only the resume content, no extra commentary." },
            { role: "user", content: generateResumePrompt() },
          ],
          max_tokens: 600,
          temperature: 0.7,
        }),
      });
      if (!response.ok) throw new Error("AI API error");
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim() || "Sorry, no resume generated.";
      setAiResult(content);
      setTimeout(() => aiResultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setAiError("Sorry, there was a problem connecting to the AI. Please try again later.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopy = () => {
    if (aiResult) {
      navigator.clipboard.writeText(aiResult);
    }
  };

  // Helper to parse TXT
  const handleTxtImport = (text: string) => {
    setAiForm(prev => ({ ...prev, workHistory: text }));
    setImportMessage("Imported work history from TXT file. Please review and edit as needed.");
  };

  // Helper to parse PDF (basic MVP: extract all text to workHistory)
  const handlePdfImport = async (file: File) => {
    setImportMessage("Reading PDF...");
    try {
      const arrayBuffer = await file.arrayBuffer();
      // @ts-ignore
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(" ") + "\n";
      }
      setAiForm(prev => ({ ...prev, workHistory: text.trim() }));
      setImportMessage("Imported work history from PDF. Please review and edit as needed.");
    } catch (err) {
      setImportMessage("Failed to read PDF. Please try a different file or use TXT.");
    }
  };

  // File input handler
  const handleImportResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportMessage("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type === "text/plain") {
      const text = await file.text();
      handleTxtImport(text);
    } else if (file.type === "application/pdf") {
      await handlePdfImport(file);
    } else {
      setImportMessage("Unsupported file type. Please upload a TXT or PDF file.");
    }
  };

  pdfjsLib.GlobalWorkerOptions.workerSrc = '';

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
              <h1 className="text-xl font-bold text-teal-400">Resume Builder</h1>
            </div>
            <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 pb-6">
        <div className="max-w-md mx-auto space-y-6">
          <div className="mb-4 p-4 bg-slate-700/40 rounded-lg text-slate-200 text-sm">
            <strong>Welcome to the AI Resume Builder!</strong><br/>
            {userData?.name ? `Welcome, ${userData.name}! ` : ''}
            {userData?.currentJob ? `Current role: ${userData.currentJob}. ` : ''}
            {userData?.goals ? `Goal: ${userData.goals}` : 'Build a resume that stands out.'}
          </div>
          {/* Import Resume Section */}
          <div className="mb-2">
            <label className="block text-slate-200 text-sm font-medium mb-1">Import your resume (TXT or PDF):</label>
            <input
              type="file"
              accept=".txt,application/pdf"
              onChange={handleImportResume}
              className="block w-full text-sm text-slate-200 file:bg-teal-500 file:text-white file:rounded file:px-3 file:py-1 file:border-0 file:mr-2"
            />
            {importMessage && <div className="text-xs text-teal-400 mt-1">{importMessage}</div>}
          </div>
          <Card className="p-6 glass-card">
            <div className="flex items-center space-x-2 mb-4">
              <Wand2 className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold text-slate-100">Your Resume</h3>
            </div>
            <form
              className="space-y-4"
              onSubmit={e => { e.preventDefault(); handleAiSubmit(); }}
            >
              <div>
                <Label htmlFor="fullName" className="text-slate-200">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={aiForm.fullName}
                  onChange={handleAiFormChange}
                  className="bg-slate-700/50 border-slate-600 text-slate-100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="jobTitle" className="text-slate-200">Desired Job Title</Label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  value={aiForm.jobTitle}
                  onChange={handleAiFormChange}
                  className="bg-slate-700/50 border-slate-600 text-slate-100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="skills" className="text-slate-200">Top 3 Skills</Label>
                <Input
                  id="skills"
                  name="skills"
                  value={aiForm.skills}
                  onChange={handleAiFormChange}
                  className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-white"
                  placeholder="e.g. Communication, Excel, Leadership"
                  required
                />
              </div>
              <div>
                <Label htmlFor="workHistory" className="text-slate-200">Work History</Label>
                <Textarea
                  id="workHistory"
                  name="workHistory"
                  value={aiForm.workHistory}
                  onChange={handleAiFormChange}
                  className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-white"
                  rows={3}
                  placeholder="List your recent jobs, companies, and main duties or achievements."
                  required
                />
              </div>
              <div>
                <Label htmlFor="careerGoal" className="text-slate-200">Career Goal (1 sentence)</Label>
                <Input
                  id="careerGoal"
                  name="careerGoal"
                  value={aiForm.careerGoal}
                  onChange={handleAiFormChange}
                  className="bg-slate-700/50 border-slate-600 text-slate-100"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-teal-500 hover:bg-teal-600 text-white mt-2"
                disabled={aiLoading}
              >
                {aiLoading ? "Generating..." : <><Wand2 className="h-4 w-4 mr-2" />Generate Resume</>}
              </Button>
            </form>
            {aiError && <p className="text-red-400 mt-2 text-sm">{aiError}</p>}
          </Card>
          {/* AI Resume Output */}
          {aiResult && (
            <Card ref={aiResultRef} className="p-6 glass-card mt-4 max-h-96 overflow-y-auto relative">
              <Button
                size="sm"
                variant="outline"
                className="absolute top-4 right-4 border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={handleCopy}
              >
                Copy
              </Button>
              <Button
                size="sm"
                className="absolute top-4 right-20 bg-teal-500 hover:bg-teal-600 text-white"
                onClick={() => handleAiSubmit(true)}
              >
                Regenerate
              </Button>
              <pre className="whitespace-pre-wrap text-slate-100 text-sm mt-8">{aiResult}</pre>
            </Card>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default ResumeBuilder;
