import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { api, getFullImageUrl } from '../../services/api';
import { Question, CompetitionSettings } from '../../types';

export const QuestionBank: React.FC = () => {
  const [activeRound, setActiveRound] = useState<number>(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<CompetitionSettings | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form State for manual creation/editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formRound, setFormRound] = useState<number>(1);
  const [formQuestionNum, setFormQuestionNum] = useState<number>(1);
  const [formPrompt, setFormPrompt] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formTimer, setFormTimer] = useState<number>(30);

  // Round 1 State (4 activities & correct sequence)
  const [r1ActivityA, setR1ActivityA] = useState<string>('');
  const [r1ActivityB, setR1ActivityB] = useState<string>('');
  const [r1ActivityC, setR1ActivityC] = useState<string>('');
  const [r1ActivityD, setR1ActivityD] = useState<string>('');
  const [r1Seq1, setR1Seq1] = useState<string>('A');
  const [r1Seq2, setR1Seq2] = useState<string>('B');
  const [r1Seq3, setR1Seq3] = useState<string>('C');
  const [r1Seq4, setR1Seq4] = useState<string>('D');

  // Round 2 State (4 zones & 4 images)
  const [r2ImageUrl, setR2ImageUrl] = useState<string>('');
  const [r2Zone1Term, setR2Zone1Term] = useState<string>('');
  const [r2Zone2Term, setR2Zone2Term] = useState<string>('');
  const [r2Zone3Term, setR2Zone3Term] = useState<string>('');
  const [r2Zone4Term, setR2Zone4Term] = useState<string>('');
  const [r2Zone1Image, setR2Zone1Image] = useState<string>('');
  const [r2Zone2Image, setR2Zone2Image] = useState<string>('');
  const [r2Zone3Image, setR2Zone3Image] = useState<string>('');
  const [r2Zone4Image, setR2Zone4Image] = useState<string>('');
  const [r2Zone1Match, setR2Zone1Match] = useState<string>('A');
  const [r2Zone2Match, setR2Zone2Match] = useState<string>('B');
  const [r2Zone3Match, setR2Zone3Match] = useState<string>('C');
  const [r2Zone4Match, setR2Zone4Match] = useState<string>('D');
  const [uploadingZoneId, setUploadingZoneId] = useState<string | null>(null);
  const [r2ExtraTerms, setR2ExtraTerms] = useState<string>('');

  // Round 3 State (4 options & correct checkboxes)
  const [r3OptA, setR3OptA] = useState<string>('');
  const [r3OptB, setR3OptB] = useState<string>('');
  const [r3OptC, setR3OptC] = useState<string>('');
  const [r3OptD, setR3OptD] = useState<string>('');
  const [r3Correct, setR3Correct] = useState<string[]>(['A']);

  const loadQuestions = async (round: number) => {
    try {
      loadSettings();
      const res = await api.getQuestions(round);
      if (res.success && res.questions) {
        setQuestions(res.questions);
      }
    } catch {
      // ignore
    }
  };

  const loadSettings = async () => {
    try {
      const res = await api.getSettings();
      if (res.success && res.settings) {
        setSettings(res.settings);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    loadQuestions(activeRound);
  }, [activeRound]);

  const getRoundDefaultTimer = (r: number) => {
    if (r === 1) return settings?.round1Timer ?? 30;
    if (r === 2) return settings?.round2Timer ?? 15;
    return settings?.round3Timer ?? 30;
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormRound(activeRound);
    // Suggest next question number
    const existingNums = questions.map(q => q.questionNumber);
    const nextNum = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].find(n => !existingNums.includes(n)) || (existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1);
    setFormQuestionNum(nextNum);
    setFormPrompt('');
    setFormDescription('');
    setFormTimer(getRoundDefaultTimer(activeRound));

    // Reset R1
    setR1ActivityA('');
    setR1ActivityB('');
    setR1ActivityC('');
    setR1ActivityD('');
    setR1Seq1('A');
    setR1Seq2('B');
    setR1Seq3('C');
    setR1Seq4('D');

    // Reset R2
    setR2ImageUrl('');
    setR2Zone1Term('');
    setR2Zone2Term('');
    setR2Zone3Term('');
    setR2Zone4Term('');
    setR2Zone1Image('');
    setR2Zone2Image('');
    setR2Zone3Image('');
    setR2Zone4Image('');
    setR2Zone1Match('A');
    setR2Zone2Match('B');
    setR2Zone3Match('C');
    setR2Zone4Match('D');
    setR2ExtraTerms('');

    // Reset R3
    setR3OptA('');
    setR3OptB('');
    setR3OptC('');
    setR3OptD('');
    setR3Correct(['A']);

    setErrorMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (q: Question) => {
    setEditingId(q._id);
    setFormRound(q.round);
    setFormQuestionNum(q.questionNumber);
    setFormPrompt(q.prompt);
    setFormDescription(q.description || '');
    setFormTimer(getRoundDefaultTimer(q.round));

    // R1
    if (q.round === 1) {
      setR1ActivityA(q.round1Activities?.find(a => a.id === 'A')?.text || '');
      setR1ActivityB(q.round1Activities?.find(a => a.id === 'B')?.text || '');
      setR1ActivityC(q.round1Activities?.find(a => a.id === 'C')?.text || '');
      setR1ActivityD(q.round1Activities?.find(a => a.id === 'D')?.text || '');
      if (q.round1CorrectOrder && q.round1CorrectOrder.length === 4) {
        setR1Seq1(q.round1CorrectOrder[0]);
        setR1Seq2(q.round1CorrectOrder[1]);
        setR1Seq3(q.round1CorrectOrder[2]);
        setR1Seq4(q.round1CorrectOrder[3]);
      }
    }

    // R2
    if (q.round === 2) {
      setR2ImageUrl(q.round2ImageUrl || '');
      const z1 = q.round2Defects?.find(d => d.id === '1');
      const z2 = q.round2Defects?.find(d => d.id === '2');
      const z3 = q.round2Defects?.find(d => d.id === '3');
      const z4 = q.round2Defects?.find(d => d.id === '4');

      setR2Zone1Term(z1?.correctTerm || '');
      setR2Zone2Term(z2?.correctTerm || '');
      setR2Zone3Term(z3?.correctTerm || '');
      setR2Zone4Term(z4?.correctTerm || '');

      const imgA = q.round2Images?.find(i => i.id === 'A')?.imageUrl || z1?.imageUrl || q.round2ImageUrl || '';
      const imgB = q.round2Images?.find(i => i.id === 'B')?.imageUrl || z2?.imageUrl || '';
      const imgC = q.round2Images?.find(i => i.id === 'C')?.imageUrl || z3?.imageUrl || '';
      const imgD = q.round2Images?.find(i => i.id === 'D')?.imageUrl || z4?.imageUrl || '';

      setR2Zone1Image(imgA);
      setR2Zone2Image(imgB);
      setR2Zone3Image(imgC);
      setR2Zone4Image(imgD);

      setR2Zone1Match(z1?.correctImageId || 'A');
      setR2Zone2Match(z2?.correctImageId || 'B');
      setR2Zone3Match(z3?.correctImageId || 'C');
      setR2Zone4Match(z4?.correctImageId || 'D');

      const terms = q.round2TermOptions || [];
      setR2ExtraTerms(terms.join(', '));
    }

    // R3
    if (q.round === 3) {
      setR3OptA(q.round3Options?.find(o => o.id === 'A')?.text || '');
      setR3OptB(q.round3Options?.find(o => o.id === 'B')?.text || '');
      setR3OptC(q.round3Options?.find(o => o.id === 'C')?.text || '');
      setR3OptD(q.round3Options?.find(o => o.id === 'D')?.text || '');
      setR3Correct(q.round3CorrectOptions || ['A']);
    }

    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.uploadImage(formData);
      if (res.success && res.imageUrl) {
        setR2ImageUrl(res.imageUrl);
        setFeedback('Defect image uploaded successfully!');
      } else {
        setErrorMessage('Failed to upload image.');
      }
    } catch (err: any) {
      setErrorMessage(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleZoneImageUpload = async (zoneId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingZoneId(zoneId);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.uploadImage(formData);
      if (res.success && res.imageUrl) {
        if (zoneId === '1') setR2Zone1Image(res.imageUrl);
        else if (zoneId === '2') setR2Zone2Image(res.imageUrl);
        else if (zoneId === '3') setR2Zone3Image(res.imageUrl);
        else if (zoneId === '4') setR2Zone4Image(res.imageUrl);
        if (!r2ImageUrl) setR2ImageUrl(res.imageUrl);
        setFeedback(`Zone #${zoneId} image uploaded successfully!`);
      } else {
        setErrorMessage(`Failed to upload image for Zone #${zoneId}.`);
      }
    } catch (err: any) {
      setErrorMessage(`Upload error: ${err.message}`);
    } finally {
      setUploadingZoneId(null);
    }
  };

  const toggleR3Correct = (optId: string) => {
    setR3Correct(prev =>
      prev.includes(optId) ? prev.filter(x => x !== optId) : [...prev, optId]
    );
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formPrompt.trim()) {
      setErrorMessage('Please enter the question prompt.');
      return;
    }

    const payload: any = {
      round: formRound,
      questionNumber: formQuestionNum,
      prompt: formPrompt.trim(),
      description: formDescription.trim(),
      timerSeconds: Number(formTimer) || (formRound === 2 ? 15 : 30)
    };

    // Round 1 Validation & Payload
    if (formRound === 1) {
      if (!r1ActivityA.trim() || !r1ActivityB.trim() || !r1ActivityC.trim() || !r1ActivityD.trim()) {
        setErrorMessage('Please provide text for all 4 activities (A, B, C, D).');
        return;
      }
      const seq = [r1Seq1, r1Seq2, r1Seq3, r1Seq4];
      const uniqueSeq = new Set(seq);
      if (uniqueSeq.size !== 4) {
        setErrorMessage('Correct sequence must contain all 4 distinct activities (A, B, C, D).');
        return;
      }

      payload.round1Activities = [
        { id: 'A', text: r1ActivityA.trim() },
        { id: 'B', text: r1ActivityB.trim() },
        { id: 'C', text: r1ActivityC.trim() },
        { id: 'D', text: r1ActivityD.trim() }
      ];
      payload.round1CorrectOrder = seq;
    }

    // Round 2 Validation & Payload
    if (formRound === 2) {
      if (!r2Zone1Term.trim() || !r2Zone2Term.trim() || !r2Zone3Term.trim() || !r2Zone4Term.trim()) {
        setErrorMessage('Please enter defect terms for all 4 zones (#1, #2, #3, #4).');
        return;
      }

      // Collect term options (the 4 correct terms + any extras entered)
      const extraList = r2ExtraTerms
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const allTerms = Array.from(
        new Set([
          r2Zone1Term.trim(),
          r2Zone2Term.trim(),
          r2Zone3Term.trim(),
          r2Zone4Term.trim(),
          ...extraList
        ])
      );

      const imgMap: Record<string, string> = {
        'A': r2Zone1Image.trim(),
        'B': r2Zone2Image.trim(),
        'C': r2Zone3Image.trim(),
        'D': r2Zone4Image.trim()
      };

      payload.round2Images = [
        { id: 'A', imageUrl: r2Zone1Image.trim() },
        { id: 'B', imageUrl: r2Zone2Image.trim() },
        { id: 'C', imageUrl: r2Zone3Image.trim() },
        { id: 'D', imageUrl: r2Zone4Image.trim() }
      ];

      payload.round2Defects = [
        {
          id: '1',
          label: 'Zone #1',
          correctTerm: r2Zone1Term.trim(),
          correctImageId: r2Zone1Match,
          imageUrl: imgMap[r2Zone1Match] || r2Zone1Image.trim()
        },
        {
          id: '2',
          label: 'Zone #2',
          correctTerm: r2Zone2Term.trim(),
          correctImageId: r2Zone2Match,
          imageUrl: imgMap[r2Zone2Match] || r2Zone2Image.trim()
        },
        {
          id: '3',
          label: 'Zone #3',
          correctTerm: r2Zone3Term.trim(),
          correctImageId: r2Zone3Match,
          imageUrl: imgMap[r2Zone3Match] || r2Zone3Image.trim()
        },
        {
          id: '4',
          label: 'Zone #4',
          correctTerm: r2Zone4Term.trim(),
          correctImageId: r2Zone4Match,
          imageUrl: imgMap[r2Zone4Match] || r2Zone4Image.trim()
        }
      ];

      // Scrambled initial order for question presentation (consistent across Live Control and Participant Lobby)
      let scrambled = ['A', 'B', 'C', 'D'].sort(() => 0.5 - Math.random());
      const correctKey = [r2Zone1Match, r2Zone2Match, r2Zone3Match, r2Zone4Match];
      if (scrambled.every((v, i) => v === correctKey[i])) {
        scrambled = [scrambled[1], scrambled[0], scrambled[3], scrambled[2]];
      }
      payload.round2InitialOrder = scrambled;
      payload.round2ImageUrl = imgMap[r2Zone1Match] || r2Zone1Image.trim();
      payload.round2TermOptions = allTerms;
    }

    // Round 3 Validation & Payload
    if (formRound === 3) {
      if (!r3OptA.trim() || !r3OptB.trim() || !r3OptC.trim() || !r3OptD.trim()) {
        setErrorMessage('Please provide text for all 4 options (A, B, C, D).');
        return;
      }
      if (r3Correct.length === 0) {
        setErrorMessage('Please select at least one correct option for MSQ combination.');
        return;
      }

      payload.round3Options = [
        { id: 'A', text: r3OptA.trim() },
        { id: 'B', text: r3OptB.trim() },
        { id: 'C', text: r3OptC.trim() },
        { id: 'D', text: r3OptD.trim() }
      ];
      payload.round3CorrectOptions = r3Correct;
    }

    try {
      const newTimer = Number(formTimer);
      if (editingId) {
        const res = await api.updateQuestion(editingId, payload);
        if (res.success) {
          if (newTimer > 0) {
            const settingKey = formRound === 1 ? 'round1Timer' : formRound === 2 ? 'round2Timer' : 'round3Timer';
            try {
              await api.updateSettings({ [settingKey]: newTimer });
              setSettings(prev => prev ? { ...prev, [settingKey]: newTimer } : prev);
            } catch {
              // ignore
            }
          }
          setFeedback(`Question ${formQuestionNum} updated successfully.`);
          setIsModalOpen(false);
          loadQuestions(activeRound);
        } else {
          setErrorMessage(res.message || 'Failed to update question.');
        }
      } else {
        const res = await api.createQuestion(payload);
        if (res.success) {
          if (newTimer > 0) {
            const settingKey = formRound === 1 ? 'round1Timer' : formRound === 2 ? 'round2Timer' : 'round3Timer';
            try {
              await api.updateSettings({ [settingKey]: newTimer });
              setSettings(prev => prev ? { ...prev, [settingKey]: newTimer } : prev);
            } catch {
              // ignore
            }
          }
          setFeedback(`Question ${formQuestionNum} created successfully.`);
          setIsModalOpen(false);
          loadQuestions(activeRound);
        } else {
          setErrorMessage(res.message || 'Failed to create question.');
        }
      }
    } catch (err: any) {
      setErrorMessage(`Save error: ${err.message}`);
    }
  };

  const handleDeleteQuestion = async (id: string, qNum: number) => {
    if (!window.confirm(`Delete Round ${activeRound} Question ${qNum}?`)) return;
    try {
      const res = await api.deleteQuestion(id);
      if (res.success) {
        setFeedback(`Question ${qNum} deleted.`);
        loadQuestions(activeRound);
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Module 5: Manual Question Bank
            </span>
            <span className="text-xs text-slate-400">
              {questions.length} / 5 Questions in Round {activeRound}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Manual Question Bank &amp; Media</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Round Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800">
            {[1, 2, 3].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setActiveRound(r)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeRound === r
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Round {r}
              </button>
            ))}
          </div>

          {/* Add New Question Button */}
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Question to Round {activeRound}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} className="text-indigo-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <HelpCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No Questions in Round {activeRound} Yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                No demo data is loaded. Use the button below to manually create your Round {activeRound} competition questions.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Create Round {activeRound} Question Now</span>
            </button>
          </div>
        ) : (
          questions.map(q => (
            <div
              key={q._id}
              className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition-colors space-y-4"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-extrabold text-xs flex items-center justify-center border border-indigo-500/30">
                    Q{q.questionNumber}
                  </span>
                  <span className="text-xs uppercase font-bold text-slate-400">
                    {q.round === 1 ? 'Fastest Finger Sequence' : q.round === 2 ? 'Defect Image Match' : 'Quality MSQ'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                    ⏱️ {getRoundDefaultTimer(q.round)}s
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(q)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-800"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q._id, q.questionNumber)}
                    className="p-1.5 rounded-xl bg-slate-900 hover:bg-red-600 text-slate-400 hover:text-white border border-slate-800"
                    title="Delete Question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-white">{q.prompt}</h3>
              {q.description && <p className="text-xs text-slate-400">{q.description}</p>}

              {/* R1 Key preview */}
              {q.round === 1 && q.round1CorrectOrder && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-850 text-xs text-emerald-400 font-mono">
                  Correct Sequence Key: {q.round1CorrectOrder.join(' ➔ ')}
                </div>
              )}

              {/* R2 Image & Defects Preview */}
              {q.round === 2 && (
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-850 space-y-3">
                  <span className="text-xs font-bold uppercase text-slate-400 block">
                    4 Zones &amp; Correct Images:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {q.round2Defects?.map(d => (
                      <div key={d.id} className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-cyan-400 font-bold">{d.label}</span>
                          <span className="font-extrabold text-white bg-slate-850 px-1.5 py-0.5 rounded border border-slate-700">
                            {d.correctTerm}
                          </span>
                        </div>
                        {d.imageUrl ? (
                          <div className="h-20 rounded-lg overflow-hidden border border-slate-800 bg-black/40 flex items-center justify-center">
                            <img
                              src={getFullImageUrl(d.imageUrl)}
                              alt={d.label}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : q.round2ImageUrl ? (
                          <div className="h-20 rounded-lg overflow-hidden border border-slate-800 bg-black/40 flex items-center justify-center">
                            <img
                              src={getFullImageUrl(q.round2ImageUrl)}
                              alt="Defect"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="h-16 rounded-lg bg-slate-900 text-slate-500 text-[10px] flex items-center justify-center">
                            No image
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* R3 Options & Key preview */}
              {q.round === 3 && q.round3Options && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-850 space-y-1 text-xs">
                  {q.round3Options.map(opt => {
                    const isCorrect = q.round3CorrectOptions?.includes(opt.id);
                    return (
                      <div key={opt.id} className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                            isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span className={isCorrect ? 'text-emerald-300 font-semibold' : 'text-slate-400'}>
                          {opt.text} {isCorrect && '✓ (Correct Key)'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Manual Question Creator / Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-white">
                  {editingId ? 'Edit Challenge' : 'Add Manual Question'}
                </h3>
                <p className="text-xs text-slate-400">
                  Configure question content, options, timer, and authoritative server answer key
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-5">
              {/* Common Fields */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Round</label>
                  <select
                    value={formRound}
                    onChange={e => {
                      const r = Number(e.target.value);
                      setFormRound(r);
                      setFormTimer(getRoundDefaultTimer(r));
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value={1}>Round 1 (Sequence)</option>
                    <option value={2}>Round 2 (Defect Image)</option>
                    <option value={3}>Round 3 (Quality MSQ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Question #</label>
                  <select
                    value={formQuestionNum}
                    onChange={e => setFormQuestionNum(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none font-mono"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <option key={n} value={n}>Q{n}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Timer (Sec)</label>
                  <input
                    type="number"
                    required
                    value={formTimer}
                    onChange={e => setFormTimer(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  Question Prompt <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={formPrompt}
                  onChange={e => setFormPrompt(e.target.value)}
                  placeholder="Enter the main question challenge..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  Instructions / Description <span className="text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="e.g. Order from initial containment to validated preventive closure"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* ROUND 1 SPECIFIC INPUTS */}
              {formRound === 1 && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <span className="text-xs font-extrabold uppercase text-amber-400 block">
                    Round 1: 4 Quality Activities &amp; Exact Correct Sequence
                  </span>

                  <div className="space-y-2">
                    {['A', 'B', 'C', 'D'].map(id => {
                      const val = id === 'A' ? r1ActivityA : id === 'B' ? r1ActivityB : id === 'C' ? r1ActivityC : r1ActivityD;
                      const setVal = id === 'A' ? setR1ActivityA : id === 'B' ? setR1ActivityB : id === 'C' ? setR1ActivityC : setR1ActivityD;
                      return (
                        <div key={id} className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-slate-800 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                            [{id}]
                          </span>
                          <input
                            type="text"
                            required
                            value={val}
                            onChange={e => setVal(e.target.value)}
                            placeholder={`Activity ${id} statement`}
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <label className="block text-xs font-bold uppercase text-slate-300 mb-2">
                      Correct Sequence Order (Step 1 to Step 4):
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'Step 1 (1st)', val: r1Seq1, set: setR1Seq1 },
                        { label: 'Step 2 (2nd)', val: r1Seq2, set: setR1Seq2 },
                        { label: 'Step 3 (3rd)', val: r1Seq3, set: setR1Seq3 },
                        { label: 'Step 4 (4th)', val: r1Seq4, set: setR1Seq4 }
                      ].map((step, idx) => (
                        <div key={idx}>
                          <span className="text-[10px] text-slate-400 block mb-1">{step.label}</span>
                          <select
                            value={step.val}
                            onChange={e => step.set(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs font-bold text-emerald-400 focus:outline-none font-mono"
                          >
                            <option value="A">Activity [A]</option>
                            <option value="B">Activity [B]</option>
                            <option value="C">Activity [C]</option>
                            <option value="D">Activity [D]</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ROUND 2 SPECIFIC INPUTS: 4 Zones & 4 Images */}
              {formRound === 2 && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div>
                    <span className="text-xs font-extrabold uppercase text-cyan-400 block">
                      Round 2: 4 Zones &amp; 4 Images (Image Arrangement Challenge)
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Provide 4 target names (e.g. Cat, Car, Ball, Dog) and upload an image for each. Participants will see the images scrambled and must arrange them into the correct order.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {[
                      { id: '1', label: 'Zone #1', name: r2Zone1Term, setName: setR2Zone1Term, img: r2Zone1Image, setImg: setR2Zone1Image, placeholder: 'e.g. Cat' },
                      { id: '2', label: 'Zone #2', name: r2Zone2Term, setName: setR2Zone2Term, img: r2Zone2Image, setImg: setR2Zone2Image, placeholder: 'e.g. Car' },
                      { id: '3', label: 'Zone #3', name: r2Zone3Term, setName: setR2Zone3Term, img: r2Zone3Image, setImg: setR2Zone3Image, placeholder: 'e.g. Ball' },
                      { id: '4', label: 'Zone #4', name: r2Zone4Term, setName: setR2Zone4Term, img: r2Zone4Image, setImg: setR2Zone4Image, placeholder: 'e.g. Dog' }
                    ].map(zone => (
                      <div key={zone.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-cyan-400 uppercase">{zone.label}</span>
                          {zone.img && (
                            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                              ✓ Image ready
                            </span>
                          )}
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                            Target Name / Answer:
                          </label>
                          <input
                            type="text"
                            required
                            value={zone.name}
                            onChange={e => zone.setName(e.target.value)}
                            placeholder={zone.placeholder}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                            Upload Image for {zone.label}:
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => handleZoneImageUpload(zone.id, e)}
                              className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-cyan-600 file:text-white"
                            />
                            {uploadingZoneId === zone.id && (
                              <span className="text-[11px] text-amber-400 animate-pulse">Uploading...</span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={zone.img}
                            onChange={e => zone.setImg(e.target.value)}
                            placeholder="Or image URL e.g. /uploads/image.png"
                            className="w-full mt-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 placeholder-slate-500 focus:outline-none font-mono"
                          />
                        </div>

                        {zone.img && (
                          <div className="mt-2 h-24 rounded-lg overflow-hidden border border-slate-700 bg-black/40 flex items-center justify-center">
                            <img
                              src={getFullImageUrl(zone.img)}
                              alt={`${zone.label} preview`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Correct Answer Key: Match each zone to its correct image */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <label className="block text-xs font-bold uppercase text-slate-300">
                      Set Correct Answer Key (Which image belongs to each target zone):
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Specify the correct image for each zone. The question will automatically be scrambled for participants to arrange.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {[
                        { label: 'Zone #1', name: r2Zone1Term, val: r2Zone1Match, set: setR2Zone1Match },
                        { label: 'Zone #2', name: r2Zone2Term, val: r2Zone2Match, set: setR2Zone2Match },
                        { label: 'Zone #3', name: r2Zone3Term, val: r2Zone3Match, set: setR2Zone3Match },
                        { label: 'Zone #4', name: r2Zone4Term, val: r2Zone4Match, set: setR2Zone4Match }
                      ].map((slot, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                          <span className="text-[11px] font-bold text-cyan-400 block truncate">
                            {slot.label}: <strong className="text-white">{slot.name || `Target #${idx + 1}`}</strong>
                          </span>
                          <select
                            value={slot.val}
                            onChange={e => slot.set(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-bold text-emerald-400 focus:outline-none"
                          >
                            <option value="A">Image [A] (Zone #1 Image)</option>
                            <option value="B">Image [B] (Zone #2 Image)</option>
                            <option value="C">Image [C] (Zone #3 Image)</option>
                            <option value="D">Image [D] (Zone #4 Image)</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ROUND 3 SPECIFIC INPUTS */}
              {formRound === 3 && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <span className="text-xs font-extrabold uppercase text-purple-400 block">
                    Round 3: 4 MSQ Options &amp; Exact Correct Combination
                  </span>

                  <div className="space-y-2">
                    {[
                      { id: 'A', val: r3OptA, set: setR3OptA },
                      { id: 'B', val: r3OptB, set: setR3OptB },
                      { id: 'C', val: r3OptC, set: setR3OptC },
                      { id: 'D', val: r3OptD, set: setR3OptD }
                    ].map(opt => {
                      const isChecked = r3Correct.includes(opt.id);
                      return (
                        <div key={opt.id} className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleR3Correct(opt.id)}
                              className="accent-emerald-500 w-4 h-4"
                            />
                            <span
                              className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                                isChecked ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              [{opt.id}]
                            </span>
                          </label>
                          <input
                            type="text"
                            required
                            value={opt.val}
                            onChange={e => opt.set(e.target.value)}
                            placeholder={`Option [${opt.id}] statement`}
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-amber-400">
                    💡 Check the boxes next to the options that form the correct combination.
                  </p>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  {editingId ? 'Update Question' : 'Save Question to Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
