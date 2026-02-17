
export type AppView = 'garden' | 'path' | 'brainbreak' | 'reflection' | 'you' | 'pomodoro';

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  duration: string;
  icon: string;
  completed: boolean;
}

export interface PathItem {
  id: string;
  subjectId: string;
  title: string;
  status: 'mastered' | 'current' | 'locked';
  subtopics: { id: string; title: string; completed: boolean }[];
}

export interface UserProfile {
  name: string;
  bio: string;
  avatar: string;
  focusTime: number; // in minutes
  streak: number;
  chaptersCompleted: number;
}

export interface PomodoroSession {
  taskId: string;
  subjectId: string;
  startTime: number;
  endTime: number;
  type: 'work' | 'break';
  isActive: boolean;
  totalWorkMinutes: number;
}
