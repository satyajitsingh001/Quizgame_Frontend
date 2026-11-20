export interface Team {
  _id: string;
  teamId: string;
  teamName: string;
  contactNumber?: string;
  pin?: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

export interface Round1Activity {
  id: string; // 'A', 'B', 'C', 'D'
  text: string;
}

export interface Round2Defect {
  id: string; // '1', '2', '3', '4'
  label: string; // 'Zone #1'
  correctTerm?: string;
  imageUrl?: string;
}

export interface Round3Option {
  id: string; // 'A', 'B', 'C', 'D'
  text: string;
}

export interface Question {
  _id: string;
  round: number; // 1 | 2 | 3
  questionNumber: number; // 1..5
  prompt: string;
  description?: string;
  timerSeconds: number;
  // Round 1
  round1Activities?: Round1Activity[];
  round1CorrectOrder?: string[];
  // Round 2
  round2ImageUrl?: string;
  round2Defects?: Round2Defect[];
  round2TermOptions?: string[];
  // Round 3
  round3Options?: Round3Option[];
  round3CorrectOptions?: string[];
  isReady: boolean;
}

export interface GameState {
  competitionTitle: string;
  status: 'NOT_STARTED' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  currentRound: number | null;
  currentQuestionNumber: number | null;
  questionStatus: 'IDLE' | 'ACTIVE' | 'PAUSED' | 'ENDED' | 'REVEALED';
  timerDuration: number;
  startTime: string | null;
  endTime: string | null;
  remainingSeconds: number;
  isLeaderboardVisibleToTeams: boolean;
  completedQuestions?: Array<{
    round: number;
    questionNumber: number;
    questionId?: string;
    completedAt?: string;
  }>;
}

export interface SubmissionResponse {
  _id?: string;
  teamId: any;
  questionId: string;
  round: number;
  questionNumber: number;
  answerData: any;
  submittedAt: string;
  submissionTimeSeconds: number;
  isTimeout: boolean;
  isLocked: boolean;
  isEvaluated?: boolean;
  scoreResult?: {
    isCorrect: boolean;
    correctMatchesCount?: number;
    basePoints: number;
    bonusPoints: number;
    penaltyPoints: number;
    totalScore: number;
    explanation: string;
  };
}

export interface LeaderboardEntry {
  rank?: number;
  teamId: string;
  teamMongoId: string;
  teamName: string;
  captainName?: string;
  members?: string[];
  round1Score: number;
  round2Score: number;
  round3Score: number;
  totalScore: number;
  totalTimeSeconds: number;
}

export interface CompetitionSettings {
  competitionTitle: string;
  subTitle: string;
  maxTeams?: number;
  teamSize?: number;
  isRegistrationOpen: boolean;
  requireApproval: boolean;
  round1Timer: number;
  round1Points: number;
  round1Bonus: number;
  round1BonusThresholdSeconds: number;
  round2Timer: number;
  round2AllCorrectPoints: number;
  round2PartialPoints: number;
  round2PenaltyPoints: number;
  round3Timer: number;
  round3CorrectPoints: number;
  round3WrongPenalty: number;
  round3UnansweredPenalty: number;
  isLeaderboardVisibleToTeams: boolean;
}

export interface AuditLogItem {
  _id: string;
  admin: string;
  action: string;
  module: string;
  reference: string;
  previousValue?: any;
  newValue?: any;
  ipAddress?: string;
  createdAt: string;
}
