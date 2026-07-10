export interface User {
  id: string;
  username: string;
  role: string;
  avatar: string;
  solved_count: string;
  attempted_count: string;
  comments_count: string;
  code_count: string;
  reviews_count: string;
  points: string;
  email?: string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  tags: string;
  created_by: string;
  created_date: string;
  status: 'Not Started' | 'In Discussion' | 'Solved' | 'Need Review' | 'Archived';
  expected_time: string;
  reference_links: string;
  bookmarked: string;
}

export interface Comment {
  id: string;
  parent_id: string;
  question_id: string;
  user: string;
  message: string;
  timestamp: string;
  likes: string;
  edited: string;
  pinned: string;
  important: string;
  liked_users?: string;
}

export interface Solution {
  id: string;
  question_id: string;
  author: string;
  approach_name: string;
  explanation: string;
  time_complexity: string;
  space_complexity: string;
  advantages: string;
  disadvantages: string;
  code: string;
  notes: string;
  votes_best: string;
  votes_readable: string;
  votes_optimized: string;
}

export interface CodeSnippet {
  id: string;
  question_id: string;
  author: string;
  language: string;
  code: string;
  timestamp: string;
  version: string;
  commit_message: string;
}

export interface Review {
  id: string;
  question_id: string;
  author: string;
  reviewer: string;
  rating: string;
  suggestions: string;
  bugs: string;
  improvements: string;
  optimization_ideas: string;
  timestamp: string;
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  user: string;
  message: string;
  type: string;
  read: string;
  timestamp: string;
}

export interface Attachment {
  id: string;
  question_id: string;
  filename: string;
  file_path: string;
  file_type: string;
  uploaded_by: string;
  timestamp: string;
}

export interface Tag {
  id: string;
  name: string;
  category: string;
}
