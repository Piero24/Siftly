/**
 * InterviewRoundsSection — Dynamic list of interview round cards.
 */
import React from 'react';
import { ClockIcon, XIcon } from '../../common/Icons';
import { FormSectionHeader } from './FormSectionHeader';
import type { FormState } from '../../../constants/form';

interface InterviewRoundsSectionProps {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}

export const InterviewRoundsSection: React.FC<InterviewRoundsSectionProps> = ({ form, setForm }) => {
  const updateRound = (index: number, field: string, value: string | number) => {
    const newRounds = [...form.rounds];
    (newRounds[index] as any)[field] = value;
    setForm(p => ({ ...p, rounds: newRounds }));
  };

  const removeRound = (id: string) => {
    setForm(p => ({ ...p, rounds: p.rounds.filter(r => r.id !== id) }));
  };

  const addRound = () => {
    setForm(p => ({
      ...p,
      rounds: [
        ...p.rounds,
        {
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          roundNumber: p.rounds.length + 1,
          date: '',
        },
      ],
    }));
  };

  return (
    <section className="form-section" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
      <FormSectionHeader icon={<ClockIcon size={16} />} title="Interview Rounds" />

      {form.rounds.map((round, index) => (
        <div key={round.id} className="modal-round-card" style={{ marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => removeRound(round.id)}
            style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', boxShadow: 'var(--shadow-soft)' }}
          >
            <XIcon size={12} />
          </button>
          <div className="form-grid-2" style={{ gap: '16px' }}>
            <div className="form-field">
              <label>Round #</label>
              <input type="number" className="form-input" style={{ width: '80px' }} value={round.roundNumber} onChange={(e) => updateRound(index, 'roundNumber', Number(e.target.value))} />
            </div>
            <div className="form-field">
              <label>Date & Time</label>
              <input type="datetime-local" className="form-input" value={round.date} onChange={(e) => updateRound(index, 'date', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Interviewer Name</label>
              <input className="form-input" placeholder="e.g. Bob Engineer" value={round.interviewerName || ''} onChange={(e) => updateRound(index, 'interviewerName', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Contact (Email/Phone)</label>
              <input className="form-input" placeholder="e.g. bob@company.com" value={round.interviewerContact || ''} onChange={(e) => updateRound(index, 'interviewerContact', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Meeting Link</label>
              <input type="url" className="form-input" placeholder="https://meet.google.com/..." value={round.meetingLink || ''} onChange={(e) => updateRound(index, 'meetingLink', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Location (In-Person)</label>
              <input className="form-input" placeholder="Office Address" value={round.location || ''} onChange={(e) => updateRound(index, 'location', e.target.value)} />
            </div>
          </div>
        </div>
      ))}

      <button type="button" className="btn-apple btn-outline" style={{ width: '100%', marginTop: '4px' }} onClick={addRound}>
        + Add Interview Round
      </button>
    </section>
  );
};
