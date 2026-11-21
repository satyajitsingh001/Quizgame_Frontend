import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { GameState, Question, SubmissionResponse } from '../types';
import { useAuth } from './AuthContext';

export interface TeamScores {
  totalScore: number;
  round1Score: number;
  round2Score: number;
  round3Score: number;
}

interface GameContextType {
  gameState: GameState | null;
  currentQuestion: Question | null;
  remainingSeconds: number;
  isSubmitted: boolean;
  submissionResponse: SubmissionResponse | null;
  teamScores: TeamScores | null;
  revealedQuestion: Question | null;
  evaluatedResults: any[] | null;
  isFetchingState: boolean;
  fetchGameState: () => Promise<void>;
  checkMySubmissionStatus: () => Promise<void>;
  setIsSubmitted: (submitted: boolean) => void;
  setSubmissionResponse: (response: SubmissionResponse | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { team } = useAuth();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submissionResponse, setSubmissionResponse] = useState<SubmissionResponse | null>(null);
  const [teamScores, setTeamScores] = useState<TeamScores | null>(null);
  const [revealedQuestion, setRevealedQuestion] = useState<Question | null>(null);
  const [evaluatedResults, setEvaluatedResults] = useState<any[] | null>(null);
  const [isFetchingState, setIsFetchingState] = useState<boolean>(false);

  const timerIntervalRef = useRef<any>(null);

  // Sync remaining seconds with server endTime
  const updateCountdown = (endTimeStr: string | null) => {
    if (!endTimeStr) {
      setRemainingSeconds(0);
      return;
    }
    const end = new Date(endTimeStr).getTime();
    const now = Date.now();
    const diff = Math.max(0, Math.ceil((end - now) / 1000));
    setRemainingSeconds(diff);
  };

  const fetchGameState = async () => {
    setIsFetchingState(true);
    try {
      const res = await api.getGameState();
      if (res.success && res.state) {
        setGameState(res.state);
        if (res.question) {
          setCurrentQuestion(res.question);
          if (res.state.questionStatus === 'REVEALED') {
            setRevealedQuestion(res.question);
          } else {
            setRevealedQuestion(null);
          }
        } else {
          setCurrentQuestion(null);
          setRevealedQuestion(null);
        }

        if (res.state.questionStatus === 'ACTIVE' && res.state.endTime) {
          updateCountdown(res.state.endTime);
        } else if (res.state.questionStatus === 'PAUSED') {
          setRemainingSeconds(res.state.remainingSeconds || 0);
        } else {
          setRemainingSeconds(0);
        }

        // When state updates (especially on REVEALED), sync team submission & score ledger
        if (team) {
          checkMySubmissionStatus();
        }
      }
    } catch {
      // offline or loading
    } finally {
      setIsFetchingState(false);
    }
  };

  const checkMySubmissionStatus = async () => {
    if (!team) return;
    try {
      const res = await api.getMySubmissionStatus();
      if (res && (res.teamDeleted || res.message === 'Team not found' || res.message === 'Invalid or expired team session')) {
        localStorage.removeItem('pp_team_token');
        localStorage.removeItem('pp_team_data');
        sessionStorage.setItem('pp_deleted_notice', 'true');
        window.location.href = '/register?reason=deleted';
        return;
      }
      if (res.submitted && res.response) {
        setIsSubmitted(true);
        setSubmissionResponse(res.response);
      } else {
        setIsSubmitted(false);
        setSubmissionResponse(null);
      }
      if (res.teamScores) {
        setTeamScores(res.teamScores);
      }
    } catch {
      // ignore
    }

    // Dual-sync with global leaderboard to guarantee 100% score consistency
    try {
      const lbRes = await api.getLeaderboard();
      if (lbRes && Array.isArray(lbRes.leaderboard)) {
        const teamCode = (team.teamId || '').toUpperCase();
        const myTeam = lbRes.leaderboard.find(
          (t: any) =>
            (teamCode && t.teamId?.toUpperCase() === teamCode) ||
            (team._id && (t.teamMongoId === team._id || t._id === team._id))
        );
        if (myTeam) {
          setTeamScores({
            totalScore: myTeam.totalScore ?? 0,
            round1Score: myTeam.round1Score ?? 0,
            round2Score: myTeam.round2Score ?? 0,
            round3Score: myTeam.round3Score ?? 0
          });
        }
      }
    } catch {
      // ignore
    }
  };

  // Timer interval for local visual countdown when active
  useEffect(() => {
    if (gameState?.questionStatus === 'ACTIVE' && gameState.endTime) {
      updateCountdown(gameState.endTime);

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      timerIntervalRef.current = setInterval(() => {
        const end = new Date(gameState.endTime!).getTime();
        const now = Date.now();
        const diff = Math.max(0, Math.ceil((end - now) / 1000));
        setRemainingSeconds(diff);
        if (diff <= 0) {
          clearInterval(timerIntervalRef.current);
        }
      }, 500);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gameState?.questionStatus, gameState?.endTime]);

  // Initial fetch
  useEffect(() => {
    fetchGameState();
  }, []);

  useEffect(() => {
    if (team) {
      checkMySubmissionStatus();
    }
  }, [team, currentQuestion?._id, gameState?.questionStatus]);

  return (
    <GameContext.Provider
      value={{
        gameState,
        currentQuestion,
        remainingSeconds,
        isSubmitted,
        submissionResponse,
        teamScores,
        revealedQuestion,
        evaluatedResults,
        isFetchingState,
        fetchGameState,
        checkMySubmissionStatus,
        setIsSubmitted,
        setSubmissionResponse
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
