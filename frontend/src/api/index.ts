import type {
  User, AttractionProject, ProjectDetail, Sketch, GenerationRequest,
  Render, Review, ConceptSheet, ModelStatusInfo, GenerationFormData
} from '../types';

const BASE_URL = '/api';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  return localStorage.getItem('sketch2park_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    throw new ApiError(
      'Cannot connect to backend server. Please ensure the FastAPI server is running on http://localhost:8000.',
      0
    );
  }

  if (!res.ok) {
    let detail = `Server error (HTTP ${res.status})`;
    try {
      const err = await res.json();
      detail = err.detail || detail;
    } catch {
      if (res.status === 500 || res.status === 502 || res.status === 504) {
        detail = 'Backend connection failed (HTTP 500). Please ensure the FastAPI backend is running on port 8000 (run: python -m uvicorn app.main:app --app-dir backend --port 8000).';
      }
    }
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

async function upload<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });
  } catch (netErr: any) {
    throw new ApiError(
      'Cannot connect to backend server. Please ensure the FastAPI server is running on http://localhost:8000.',
      0
    );
  }

  if (!res.ok) {
    let detail = `Server error (HTTP ${res.status})`;
    try {
      const err = await res.json();
      detail = err.detail || detail;
    } catch {
      if (res.status === 500 || res.status === 502 || res.status === 504) {
        detail = 'Backend connection failed. Please ensure the FastAPI backend is running on port 8000.';
      }
    }
    throw new ApiError(detail, res.status);
  }
  return res.json();
}

// Auth
export const authApi = {
  login: (username: string, password: string) =>
    request<{ access_token: string; token_type: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  register: (data: { username: string; email: string; password: string; full_name?: string; role: string }) =>
    request<{ access_token: string; token_type: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  me: () => request<User>('/auth/me'),
  demoLogin: (role: 'designer' | 'reviewer') =>
    request<{ access_token: string; token_type: string; user: User }>(`/auth/demo-login/${role}`, {
      method: 'POST',
    }),
  getReviewers: () => request<User[]>('/auth/reviewers'),
};

// Projects
export const projectApi = {
  list: () => request<AttractionProject[]>('/projects'),
  get: (id: number) => request<ProjectDetail>(`/projects/${id}`),
  create: (data: { title: string; attraction_type: string; description?: string; scene_data?: string }) =>
    request<AttractionProject>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<{ title: string; attraction_type: string; description: string; scene_data?: string }>) =>
    request<AttractionProject>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/projects/${id}`, { method: 'DELETE' }),
  getScene: (id: number) => request<{ project_id: number; scene_data: string | null }>(`/projects/${id}/scene`),
  saveScene: (id: number, scene_data: string) =>
    request<{ status: string; project_id: number; scene_data: string }>(`/projects/${id}/scene`, {
      method: 'PUT',
      body: JSON.stringify({ scene_data }),
    }),
  assignReviewer: (projectId: number, reviewerId: number) =>
    request<{ message: string }>(`/projects/${projectId}/reviewers`, {
      method: 'POST', body: JSON.stringify({ reviewer_id: reviewerId }),
    }),
  removeReviewer: (projectId: number, reviewerId: number) =>
    request<void>(`/projects/${projectId}/reviewers/${reviewerId}`, { method: 'DELETE' }),
  aiGenerateLayout: (prompt: string, park_type = 'wonderla', size = 'grand') =>
    request<{ status: string; theme: string; layout_type: string; lighting_mode: string; message: string }>(
      '/projects/ai/generate-layout',
      { method: 'POST', body: JSON.stringify({ prompt, park_type, size }) }
    ),
  aiEditLayout: (instruction: string, current_scene_data?: string) =>
    request<{ status: string; instruction: string; applied: boolean; message: string }>(
      '/projects/ai/edit-layout',
      { method: 'POST', body: JSON.stringify({ instruction, current_scene_data }) }
    ),
};

// Sketches
export const sketchApi = {
  upload: (projectId: number, file: File, lowThreshold = 100, highThreshold = 200) => {
    const fd = new FormData();
    fd.append('project_id', String(projectId));
    fd.append('low_threshold', String(lowThreshold));
    fd.append('high_threshold', String(highThreshold));
    fd.append('file', file);
    return upload<Sketch>('/sketches/upload', fd);
  },
  previewCanny: (sketchId: number, lowThreshold: number, highThreshold: number) =>
    request<{ sketch_id: number; conditioning_url: string; canny_low_threshold: number; canny_high_threshold: number }>(
      '/sketches/preview-canny', {
        method: 'POST',
        body: JSON.stringify({ sketch_id: sketchId, canny_low_threshold: lowThreshold, canny_high_threshold: highThreshold }),
      }
    ),
  get: (id: number) => request<Sketch>(`/sketches/${id}`),
};

// Generation
export const generationApi = {
  getModelStatus: () => request<ModelStatusInfo>('/generation/model-status'),
  createRequest: (data: GenerationFormData) =>
    request<GenerationRequest>('/generation/request', { method: 'POST', body: JSON.stringify(data) }),
  getStatus: (id: number) => request<GenerationRequest>(`/generation/request/${id}`),
  retry: (id: number) =>
    request<GenerationRequest>(`/generation/request/${id}/retry`, { method: 'POST' }),
};

// Reviews
export const reviewApi = {
  submitForReview: (renderId: number) =>
    request<Render>(`/reviews/submit/${renderId}`, { method: 'POST' }),
  submitDecision: (renderId: number, decision: string, comment: string) =>
    request<Review>(`/reviews/decision/${renderId}`, {
      method: 'POST', body: JSON.stringify({ decision, comment }),
    }),
  getRender: (renderId: number) => request<Render>(`/reviews/render/${renderId}`),
  getConceptSheet: (renderId: number) => request<ConceptSheet>(`/reviews/concept-sheet/${renderId}`),
};



export function imageUrl(path: string): string {
  const token = getToken();
  if (token) return `${path}?token=${token}`;
  return path;
}

export { ApiError };
