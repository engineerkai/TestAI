"use client"
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Users, Calendar, Search, Filter, Download } from "lucide-react";

// Example fetch function, replace with your actual API endpoint
async function fetchSignIns() {
  // Should return [{ eventId, eventName, signIns: [{...fields}] }]
  const res = await fetch("/api/signins");
  if (!res.ok) throw new Error("Failed to fetch sign-ins");
  return await res.json();
}

export default function AllSignInsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedEvents, setExpandedEvents] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("eventName");

  useEffect(() => {
    fetchSignIns()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const toggleEvent = (eventId) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const filteredData = data.filter(event => 
    event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === "eventName") return a.eventName.localeCompare(b.eventName);
    if (sortBy === "signInCount") return b.signIns.length - a.signIns.length;
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading sign-ins...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Data</h3>
              <p className="text-gray-600 dark:text-gray-300">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Sign-ins Found</h3>
              <p className="text-gray-600 dark:text-gray-300">There are no sign-ins to display at the moment.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Collect all unique columns across all events, excluding specific fields
  const allColumns = Array.from(
    new Set(
      data.flatMap(event => event.signIns.flatMap(signIn => Object.keys(signIn)))
    )
  ).filter(col => !['id', 'event_id', 'visitor_id', 'score', 'created_at'].includes(col));

  const totalSignIns = data.reduce((sum, event) => sum + event.signIns.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              Event Sign-ins Dashboard
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Manage and view all event registrations in one place
            </p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">{data.length}</div>
                <div className="text-blue-100">Events</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">{totalSignIns}</div>
                <div className="text-blue-100">Total Sign-ins</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-center mb-2">
                  <Filter className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">{filteredData.length}</div>
                <div className="text-blue-100">Filtered Results</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full sm:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="eventName">Sort by Name</option>
                <option value="signInCount">Sort by Sign-ins</option>
              </select>
              
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="space-y-6">
          {sortedData.map(event => {
            const isExpanded = expandedEvents.has(event.eventId);
            
            return (
              <div 
                key={event.eventId} 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-2xl"
              >
                {/* Event Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
                  onClick={() => toggleEvent(event.eventId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          {event.eventName}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                          {event.signIns.length} participant{event.signIns.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-medium">
                        <Users className="w-4 h-4" />
                        {event.signIns.length}
                      </div>
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 transition-transform duration-200">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Expandable Table */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                          <tr>
                            {allColumns.map(col => (
                              <th 
                                key={col} 
                                className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                              >
                                {col.replace(/_/g, ' ')}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {event.signIns.map((signIn, idx) => (
                            <tr 
                              key={idx} 
                              className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
                            >
                              {allColumns.map(col => (
                                <td 
                                  key={col} 
                                  className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100"
                                >
                                  {signIn[col] ?? (
                                    <span className="text-gray-400 dark:text-gray-600 italic">
                                      No data
                                    </span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}