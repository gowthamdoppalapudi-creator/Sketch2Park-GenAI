// Core domain types matching backend SQLAlchemy models + Pydantic schemas

export type UserRole = 'designer' | 'reviewer' | 'admin';
export type JobStatus = 'queued' | 'running' | 'completed' | 'failed';
export type RenderStatus = 'draft' | 'submitted_for_review' | 'approved' | 'changes_requested' | 'rejected';
export type ReviewDecision = 'approved' | 'changes_requested' | 'rejected';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface ProjectReviewerItem {
  id: number;
  reviewer: User;
  assigned_at: string;
}

export interface AttractionProject {
  id: number;
  owner_id: number;
  title: string;
  attraction_type: string;
  description: string | null;
  scene_data?: string | null;
  created_at: string;
  updated_at: string;
  owner: User;
  reviewers: ProjectReviewerItem[];
  sketches_count: number;
  renders_count: number;
  approved_render_id: number | null;
}

export interface Sketch {
  id: number;
  project_id: number;
  original_filename: string;
  file_path: string;
  conditioning_file_path: string;
  canny_low_threshold: number;
  canny_high_threshold: number;
  width: number;
  height: number;
  uploaded_at: string;
}

export interface Review {
  id: number;
  render_id: number;
  reviewer_id: number;
  comment: string;
  decision: ReviewDecision;
  created_at: string;
  reviewer: User;
}

export interface Render {
  id: number;
  generation_request_id: number;
  image_filename: string;
  file_path: string;
  seed: number;
  status: RenderStatus;
  created_at: string;
  reviews: Review[];
}

export interface GenerationRequest {
  id: number;
  sketch_id: number;
  source_render_id: number | null;
  prompt: string;
  negative_prompt: string | null;
  theme: string | null;
  materials: string | null;
  time_of_day: string | null;
  weather: string | null;
  surroundings: string | null;
  controlnet_scale: number;
  guidance_scale: number;
  num_inference_steps: number;
  num_variations: number;
  base_seed: number;
  status: JobStatus;
  error_message: string | null;
  elapsed_time_seconds: number | null;
  model_name: string;
  is_sample_demo: boolean;
  created_at: string;
  completed_at: string | null;
  renders: Render[];
}

export interface ProjectDetail extends AttractionProject {
  sketches: Sketch[];
  generation_requests: GenerationRequest[];
}

export interface ConceptSheet {
  project_title: string;
  attraction_type: string;
  description: string | null;
  owner_name: string;
  original_sketch_url: string;
  conditioning_image_url: string;
  selected_render_url: string;
  render_id: number;
  final_prompt: string;
  negative_prompt: string | null;
  version_tag: string;
  source_render_id: number | null;
  review_status: string;
  reviews: Review[];
  controlnet_scale: number;
  seed: number;
  model_name: string;
  created_at: string;
}

export interface ModelStatusInfo {
  device: string;
  cuda_available: boolean;
  device_name: string;
  model_sd: string;
  model_controlnet: string;
  pipeline_loaded: boolean;
  last_error: string | null;
  supported_modes: string[];
}

// Generation form state
export interface GenerationFormData {
  sketch_id: number;
  prompt: string;
  negative_prompt: string;
  theme: string;
  materials: string;
  time_of_day: string;
  weather: string;
  surroundings: string;
  controlnet_scale: number;
  guidance_scale: number;
  num_inference_steps: number;
  num_variations: number;
  base_seed: number;
  source_render_id?: number;
  is_sample_demo: boolean;
}

export * from './parkScene';
