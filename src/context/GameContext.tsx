import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { GameState, Question, SubmissionResponse } from '../types';
import { useAuth } from './AuthContext';

interface GameContextType {
  gameState: GameState | null;
  currentQuestion: Question | null;
  remainingSeconds: number;
  isSubmitted: boolean;
  submissionResponse: SubmissionResponse | null;
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
      if (res.submitted && res.response) {
        setIsSubmitted(true);
        setSubmissionResponse(res.response);
      } else {
        setIsSubmitted(false);
        setSubmissionResponse(null);
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
  }, [team, currentQuestion?._id]);

  return (
    <GameContext.Provider
      value={{
        gameState,
        currentQuestion,
        remainingSeconds,
        isSubmitted,
        submissionResponse,
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
