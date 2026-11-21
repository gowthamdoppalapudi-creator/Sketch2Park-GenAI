import React, { useState } from 'react';
import { AuthProvider, useAuth } from './store/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectWorkspacePage from './pages/ProjectWorkspacePage';
import GenerationStudioPage from './pages/GenerationStudioPage';
import ReviewerWorkspacePage from './pages/ReviewerWorkspacePage';
import SketchUploader from './components/SketchUploader';
import type { Sketch } from './types';
import { Mountain, Sparkles, LogOut, User as UserIcon } from 'lucide-react';

type ViewMode =
  | 'dashboard'
  | 'project'
  | 'upload_sketch'
  | 'studio'
  | 'review';

function MainApp() {
  const { isAuthenticated, user, logout } = useAuth();

  const [view, setView] = useState<ViewMode>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedSketch, setSelectedSketch] = useState<Sketch | null>(null);
  const [selectedRenderId, setSelectedRenderId] = useState<number | null>(null);
  const [revisionSourceRenderId, setRevisionSourceRenderId] = useState<number | undefined>(undefined);
  const [revisionPromptText, setRevisionPromptText] = useState<string | undefined>(undefined);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleSelectProject = (id: number) => {
    setSelectedProjectId(id);
    setView('project');
  };

  const handleUploadSketch = () => {
    setView('upload_sketch');
  };

  const handleSketchReady = (sketch: Sketch) => {
    setSelectedSketch(sketch);
    setRevisionSourceRenderId(undefined);
    setRevisionPromptText(undefined);
    setView('studio');
  };

  const handleGoToGenerationStudio = (sketch: Sketch) => {
    setSelectedSketch(sketch);
    setRevisionSourceRenderId(undefined);
    setRevisionPromptText(undefined);
    setView('studio');
  };

  const handleGoToStudioWithSketch = (sketch: Sketch, suggestedPrompt?: string) => {
    setSelectedSketch(sketch);
    setRevisionSourceRenderId(undefined);
    setRevisionPromptText(suggestedPrompt);
    setView('studio');
  };

  const handleGoToReview = (renderId: number) => {
    setSelectedRenderId(renderId);
    setView('review');
  };

  const handleStartRevision = (sourceRenderId: number, previousPrompt: string) => {
    setRevisionSourceRenderId(sourceRenderId);
    setRevisionPromptText(previousPrompt);
    setView('studio');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Universal Top Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="bg-purple-600 p-2 rounded-xl group-hover:bg-purple-500 transition">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight leading-none block">
                Sketch2Park
              </span>
              <span className="text-[10px] text-purple-400 font-medium">
                AI Theme Park Concept Renderer
              </span>
            </div>
          </div>

          {/* Quick Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setView('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition ${
                view === 'dashboard'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dashboard
            </button>
            {selectedProjectId && (
              <button
                onClick={() => setView('project')}
                className={`px-3.5 py-1.5 rounded-lg font-medium transition ${
                  view === 'project'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Park Workspace
              </button>
            )}
          </nav>
        </div>

        {/* User Identity & Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <UserIcon className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-200 font-medium">
              {user?.full_name || user?.username}
            </span>
            <span
              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                user?.role === 'designer'
                  ? 'bg-blue-950 text-blue-300 border border-blue-800'
                  : user?.role === 'reviewer'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-purple-950 text-purple-300 border border-purple-800'
              }`}
            >
              {user?.role}
            </span>
          </div>

          <button
            onClick={logout}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main View Router */}
      <main className="flex-1">
        {view === 'dashboard' && (
          <DashboardPage onSelectProject={handleSelectProject} />
        )}

        {view === 'project' && selectedProjectId && (
          <ProjectWorkspacePage
            projectId={selectedProjectId}
            onBack={() => setView('dashboard')}
            onUploadSketch={handleUploadSketch}
            onGoToGenerationStudio={handleGoToGenerationStudio}
            onGoToReview={handleGoToReview}
            onGoToGenerationStudioWithSketch={handleGoToStudioWithSketch}
          />
        )}

        {view === 'upload_sketch' && selectedProjectId && (
          <div className="max-w-4xl mx-auto p-6">
            <SketchUploader
              projectId={selectedProjectId}
              onSketchReady={handleSketchReady}
              onBack={() => setView('project')}
            />
          </div>
        )}

        {view === 'studio' && selectedSketch && (
          <GenerationStudioPage
            sketch={selectedSketch}
            onBack={() => setView('project')}
            onGoToReview={handleGoToReview}
            revisionSourceRenderId={revisionSourceRenderId}
            initialPromptText={revisionPromptText}
          />
        )}

        {view === 'review' && selectedRenderId && (
          <ReviewerWorkspacePage
            renderId={selectedRenderId}
            onBack={() => setView('project')}
            onStartRevision={handleStartRevision}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
