/**
 * ModalRoundsSection — Interview rounds timeline within the job detail modal.
 */
import React from 'react';
import { ClockIcon, UserPlusIcon, VideoIcon, MapPinIcon } from '../../common/Icons';
import type { InterviewRound } from '../../../types/job';

interface ModalRoundsSectionProps {
  rounds: InterviewRound[];
}

/** Renders a single interview round card. */
const RoundCard: React.FC<{ round: InterviewRound }> = ({ round: r }) => (
  <div className="modal-round-card">
    <div className="modal-round-header">
      <h4 className="modal-round-title">
        <ClockIcon size={14} /> Round #{r.roundNumber}
      </h4>
      <span className="modal-round-subtitle">
        {r.date
          ? new Date(r.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
          : 'TBD'}
      </span>
    </div>
    {(r.interviewerName || r.interviewerContact) && (
      <div className="modal-round-detail" style={{ marginTop: '4px' }}>
        <UserPlusIcon size={14} />
        <span>
          {r.interviewerName || 'Unknown Contact'}{' '}
          {r.interviewerContact && `(${r.interviewerContact})`}
        </span>
      </div>
    )}
    {(r.meetingLink || r.location) && (
      <div className="modal-round-detail" style={{ gap: '12px' }}>
        {r.meetingLink && (
          <a href={r.meetingLink} target="_blank" rel="noreferrer" className="modal-round-link">
            <VideoIcon size={14} style={{ color: '#AF52DE' }} /> Join Meeting
          </a>
        )}
        {r.location && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <MapPinIcon size={14} style={{ color: '#FF3B30' }} /> {r.location}
          </span>
        )}
      </div>
    )}
  </div>
);

export const ModalRoundsSection: React.FC<ModalRoundsSectionProps> = ({ rounds }) => {
  if (!rounds || rounds.length === 0) return null;

  const sortedRounds = [...rounds].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <section className="modal-section">
      <h3 className="section-title">Interview Rounds</h3>
      <div className="modal-rounds-container">
        {sortedRounds.map((r) => (
          <RoundCard key={r.id} round={r} />
        ))}
      </div>
    </section>
  );
};
