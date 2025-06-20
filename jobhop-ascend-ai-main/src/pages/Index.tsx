
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, Briefcase, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleGetStarted = () => {
    setIsAnimating(true);
    setTimeout(() => navigate("/onboarding"), 300);
  };

  return (
    <div className="min-h-screen dark-gradient-bg">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Briefcase className="h-8 w-8 text-jobhop-teal" />
              <ArrowUp className="h-4 w-4 text-jobhop-green absolute -top-1 -right-1" />
            </div>
            <h1 className="text-xl font-bold text-jobhop-teal">JobHop AI</h1>
          </div>
          <Badge variant="secondary" className="bg-slate-700 text-slate-200 border-slate-600">
            Beta
          </Badge>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-4 py-8">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-slate-100 leading-tight">
              Escape Your Dead-End Job
            </h2>
            <p className="text-lg text-slate-300">
              Strategic career transitions made simple. Discover better opportunities, boost your salary, and find work you actually love.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="space-y-4 my-8">
            <Card className="p-4 text-left glass-card hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-jobhop-teal/20 rounded-lg">
                  <User className="h-5 w-5 text-jobhop-teal" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">Personalized Career Path</h3>
                  <p className="text-sm text-slate-400">Get a custom roadmap based on your skills and goals</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 text-left glass-card hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-jobhop-green/20 rounded-lg">
                  <Briefcase className="h-5 w-5 text-jobhop-green" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">Smart Job Matching</h3>
                  <p className="text-sm text-slate-400">Find opportunities you qualify for but never knew existed</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 text-left glass-card hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-teal-500/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">Strategic Timing</h3>
                  <p className="text-sm text-slate-400">Know exactly when to make your next career move</p>
                </div>
              </div>
            </Card>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Button 
              onClick={handleGetStarted}
              className={`w-full bg-jobhop-teal hover:bg-jobhop-teal/90 text-white font-semibold py-6 text-lg transition-all duration-300 ${
                isAnimating ? 'scale-95 opacity-75' : 'hover:scale-105'
              }`}
            >
              Start Your Career Transformation
            </Button>
            <p className="text-xs text-slate-400">
              Free to start • No credit card required
            </p>
          </div>

          {/* Social Proof */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <p className="text-sm text-slate-400 mb-3">Trusted by ambitious professionals</p>
            <div className="flex justify-center space-x-4">
              <Badge variant="outline" className="text-xs border-jobhop-teal/40 text-jobhop-teal bg-jobhop-teal/10">+$15K avg salary boost</Badge>
              <Badge variant="outline" className="text-xs border-jobhop-green/40 text-jobhop-green bg-jobhop-green/10">2.3x faster career growth</Badge>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
