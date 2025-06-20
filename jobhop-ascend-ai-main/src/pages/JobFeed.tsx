import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Briefcase, ArrowUp, Clock, MapPin, DollarSign, Heart } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useUserData } from "@/hooks/useUserData";

const REMOTIVE_API = "https://remotive.com/api/remote-jobs";
const MUSE_API = "https://www.themuse.com/api/public/jobs?page=1";
const REMOTEOK_API = "https://remoteok.com/api";

const JobFeed = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [likedJobs, setLikedJobs] = useState<number[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentOnly, setRecentOnly] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const userData = useUserData();

  const toggleLike = (jobId: number) => {
    setLikedJobs(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  // Fetch jobs from Remotive API
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(REMOTIVE_API).then(res => res.json()).catch(() => ({ jobs: [] })),
      fetch(MUSE_API).then(res => res.json()).catch(() => ({ results: [] })),
      fetch(REMOTEOK_API).then(res => res.json()).catch(() => ([])),
    ])
      .then(([remotiveData, museData, remoteOkData]) => {
        // Normalize Remotive
        const remotiveJobs = (remotiveData.jobs || []).map(job => ({
          id: `remotive-${job.id}`,
          title: job.title,
          company: job.company_name,
          location: job.candidate_required_location,
          salary: job.salary,
          url: job.url,
          description: job.description,
          tags: job.tags,
          source: "Remotive"
        }));
        // Normalize The Muse
        const museJobs = (museData.results || []).map(job => ({
          id: `muse-${job.id}`,
          title: job.name,
          company: job.company?.name,
          location: job.locations?.map(l => l.name).join(", ") || "",
          salary: job.salary || "N/A",
          url: job.refs?.landing_page,
          description: job.contents,
          tags: job.categories?.map(c => c.name) || [],
          source: "The Muse"
        }));
        // Normalize Remote OK
        const remoteOkJobs = (Array.isArray(remoteOkData) ? remoteOkData : []).filter(j => j.position).map(job => ({
          id: `remoteok-${job.id}`,
          title: job.position,
          company: job.company,
          location: job.location || "Remote",
          salary: job.salary || "N/A",
          url: job.url,
          description: job.description,
          tags: job.tags || [],
          source: "Remote OK"
        }));
        // Merge all jobs
        const allJobs = [
          ...remotiveJobs,
          ...museJobs,
          ...remoteOkJobs
        ];
        setJobs(allJobs);
        // Extract unique categories, locations, and types
        setCategories([
          ...Array.from(new Set(allJobs.flatMap((job: any) => job.tags || []).filter(Boolean) as string[])),
        ]);
        setLocations([
          ...Array.from(new Set(allJobs.map((job: any) => job.location).filter(Boolean) as string[])),
        ]);
        setTypes([
          ...Array.from(new Set(allJobs.map((job: any) => job.type).filter(Boolean) as string[])),
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter jobs when filters/search change
  useEffect(() => {
    let filtered = jobs;
    if (selectedCategory) {
      filtered = filtered.filter(job => job.tags && job.tags.includes(selectedCategory));
    }
    if (selectedLocation) {
      filtered = filtered.filter(job => job.location === selectedLocation);
    }
    if (selectedType) {
      filtered = filtered.filter(job => job.type === selectedType);
    }
    if (recentOnly) {
      const now = new Date();
      filtered = filtered.filter(job => {
        const posted = new Date(job.publication_date);
        return (now.getTime() - posted.getTime()) < 24 * 60 * 60 * 1000;
      });
    }
    if (searchQuery) {
      filtered = filtered.filter(
        job =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredJobs(filtered);
  }, [jobs, selectedCategory, selectedLocation, selectedType, searchQuery, recentOnly]);

  // Helper to strip HTML tags from job descriptions
  function stripHtml(html) {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  return (
    <div className="min-h-screen dark-gradient-bg pb-20">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative">
              <Briefcase className="h-6 w-6 text-teal-400" />
              <ArrowUp className="h-3 w-3 text-green-400 absolute -top-1 -right-1" />
            </div>
            <h1 className="text-xl font-bold text-teal-400">Job Feed</h1>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search jobs or companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
            />
          </div>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-2">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-slate-100 rounded px-2 py-1 min-w-[150px]"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-slate-100 rounded px-2 py-1 min-w-[150px]"
            >
              <option value="">All Locations</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-slate-100 rounded px-2 py-1 min-w-[150px]"
            >
              <option value="">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <label className="flex items-center gap-1 text-slate-300 text-xs bg-slate-700/50 border-slate-600 rounded px-2 py-1 cursor-pointer">
              <input
                type="checkbox"
                checked={recentOnly}
                onChange={e => setRecentOnly(e.target.checked)}
                className="accent-teal-500"
              />
              Last 24h
            </label>
            {(selectedCategory || selectedLocation || selectedType || recentOnly) && (
              <Button size="sm" variant="outline" className="border-slate-600 text-slate-300" onClick={() => { setSelectedCategory(""); setSelectedLocation(""); setSelectedType(""); setRecentOnly(false); }}>Clear Filters</Button>
            )}
          </div>
          <p className="mb-4 text-slate-400">
            {userData?.name ? `Hi, ${userData.name}! ` : ''}
            {userData?.currentJob ? `Looking to move on from ${userData.currentJob}. ` : ''}
            {userData?.goals ? `Goal: ${userData.goals}` : 'Find your next opportunity.'}
            {userData?.location ? `Preferred location: ${userData.location}.` : ''}
          </p>
        </div>
      </header>
      {/* Job List */}
      <main className="px-4 py-6">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">{filteredJobs.length} jobs matched to your profile</p>
            <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">Best matches first</Badge>
          </div>
          {loading && <p className="text-slate-400">Loading jobs...</p>}
          {!loading && filteredJobs.length === 0 && <p className="text-slate-400">No jobs found.</p>}
          {filteredJobs.map((job) => (
            <Card key={job.id} className="p-4 glass-card hover:shadow-lg transition-all duration-300 flex flex-col">
              <div className="flex flex-col gap-2 flex-1">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-100 text-lg mb-1 line-clamp-1">{job.title}</h3>
                    <p className="text-sm text-slate-300 mb-1 line-clamp-1">{job.company}</p>
                  </div>
                  {job.type && (
                    <Badge className="bg-green-500 text-white text-xs">{job.type}</Badge>
                  )}
                </div>
                {/* Meta Info */}
                <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-1">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {job.salary}
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">{job.source}</span>
                  </div>
                </div>
                {/* Cleaned & Truncated Description */}
                <p className="text-xs text-slate-300 line-clamp-3 mb-2">
                  {stripHtml(job.description).slice(0, 180)}{stripHtml(job.description).length > 180 ? "..." : ""}
                </p>
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {job.tags && job.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-slate-600 text-slate-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <Button
                    className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
                    size="sm"
                    asChild
                  >
                    <a href={job.url} target="_blank" rel="noopener noreferrer">Apply Now</a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={() => setSelectedJob(job)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {/* Job Details Modal */}
          {selectedJob && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="bg-slate-800 rounded-lg shadow-lg max-w-lg w-full p-6 relative">
                <button className="absolute top-3 right-3 text-slate-400 hover:text-white" onClick={() => setSelectedJob(null)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-xl font-bold text-teal-400 mb-2">{selectedJob.title}</h2>
                <p className="text-slate-300 mb-1">{selectedJob.company}</p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-2">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedJob.location}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {selectedJob.salary}
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">{selectedJob.source}</span>
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-200 mb-1">Description</h3>
                  <div className="text-slate-100 text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {stripHtml(selectedJob.description)}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedJob.tags && selectedJob.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-slate-600 text-slate-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                  asChild
                >
                  <a href={selectedJob.url} target="_blank" rel="noopener noreferrer">Apply Now</a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default JobFeed;
