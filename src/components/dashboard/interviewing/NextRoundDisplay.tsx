/**
 * NextRoundDisplay — Shows the next upcoming interview round for an application.
 *
 * Sorts rounds chronologically and finds the first future round.
 * If all rounds are in the past, shows a "Done" badge.
 * If no rounds exist, shows an empty placeholder.
 */
import React from 'react';
import { InterviewRound } from '../../../types/job';
import {
  PhoneIcon,
  UserIcon,
  MailIcon,
  VideoIcon,
  MapPinIcon,
} from '../../common/Icons';

/** Sorts rounds by date and returns the index of the next upcoming round, or -1. */
function findNextRoundIndex(sorted: InterviewRound[]): number {
  const now = Date.now();
  return sorted.findIndex((r) => r.date && new Date(r.date).getTime() > now);
}

/** Renders the interviewer contact info (name and email/phone) for a round. */
const RoundContactBlock: React.FC<{ round: InterviewRound }> = ({ round }) => {
  if (!round.interviewerName && !round.interviewerContact) return null;

  return (
    <div
      className="next-round-contact-block"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '4px',
        marginTop: '4px',
      }}
    >
      {round.interviewerName && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
          }}
        >
          <UserIcon size={10} style={{ flexShrink: 0 }} />
          <span
            className="table-ellipsis"
            style={{ maxWidth: '162px' }}
            title={round.interviewerName}
          >
            {round.interviewerName}
          </span>
        </div>
      )}
      {round.interviewerContact &&
        (round.interviewerContact.includes('@') ? (
          <a
            href={`mailto:${round.interviewerContact}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-secondary)',
              fontSize: '11px',
              textDecoration: 'none',
            }}
            onClick={(e) => e.stopPropagation()}
            title={round.interviewerContact}
          >
            <MailIcon size={10} style={{ flexShrink: 0 }} />
            <span className="table-ellipsis" style={{ maxWidth: '162px' }}>
              {round.interviewerContact}
            </span>
          </a>
        ) : (
          <a
            href={`tel:${round.interviewerContact}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-secondary)',
              fontSize: '11px',
              textDecoration: 'none',
            }}
            onClick={(e) => e.stopPropagation()}
            title={round.interviewerContact}
          >
            <PhoneIcon size={10} style={{ flexShrink: 0 }} />
            <span className="table-ellipsis" style={{ maxWidth: '162px' }}>
              {round.interviewerContact}
            </span>
          </a>
        ))}
    </div>
  );
};

export const NextRoundDisplay: React.FC<{ rounds: InterviewRound[] }> = ({ rounds }) => {
  const sorted = rounds
    ? [...rounds].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];
  const nextIndex = findNextRoundIndex(sorted);

  // No rounds at all
  if (!rounds || rounds.length === 0) {
    return (
      <span className="next-round-empty" style={{ color: 'var(--text-secondary)' }}>
        -
      </span>
    );
  }

  // All rounds are in the past
  if (nextIndex === -1) {
    return (
      <div
        className="next-round-display next-round-display-done"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '52px',
          color: 'var(--text-secondary)',
          padding: '6px 0',
        }}
      >
        <span
          style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-success, #34C759)' }}
        >
          Done 🎉
        </span>
        <span style={{ fontSize: '11px' }}>
          {sorted.length} round{sorted.length > 1 ? 's' : ''} finished
        </span>
      </div>
    );
  }

  // Show the next upcoming round
  const r = sorted[nextIndex];

  return (
    <div
      className="next-round-display"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '52px',
        color: 'var(--text-primary)',
        lineHeight: 1.3,
        padding: '6px 0',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          fontWeight: 600,
        }}
      >
        <span style={{ color: 'var(--text-secondary)', opacity: 0.8 }}>#{r.roundNumber}</span>
        <span style={{ whiteSpace: 'nowrap' }}>
          {new Date(r.date)
            .toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
            .replace(',', '')}
        </span>
        {r.meetingLink && <VideoIcon size={12} style={{ color: '#AF52DE', flexShrink: 0 }} />}
        {r.location && <MapPinIcon size={12} style={{ color: '#FF3B30', flexShrink: 0 }} />}
      </div>

      <RoundContactBlock round={r} />
    </div>
  );
};
