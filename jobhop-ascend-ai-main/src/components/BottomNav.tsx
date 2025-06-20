
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Search, Calendar, FileText, User } from "lucide-react";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/jobs", icon: Search, label: "Jobs" },
    { path: "/hop-tracker", icon: Calendar, label: "Tracker" },
    { path: "/resume", icon: FileText, label: "Resume" },
    { path: "/coach", icon: User, label: "Coach" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-t border-slate-600">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center space-y-1 p-2 h-auto ${
                  isActive 
                    ? "text-teal-400" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-teal-400" : ""}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
