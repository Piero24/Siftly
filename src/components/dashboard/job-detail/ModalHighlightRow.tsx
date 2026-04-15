/**
 * ModalHighlightRow — Salary, applied date, work type, and employment type detail strip.
 */
import React from 'react';
import { DollarIcon, CalendarIcon, ClockIcon, BookOpenIcon } from '../../common/Icons';
import { WorkTypeBadge } from '../WorkTypeBadge';
import type { JobApplication } from '../../../types/job';

interface ModalHighlightRowProps {
  job: JobApplication;
  formattedSalary: string;
}

export const ModalHighlightRow: React.FC<ModalHighlightRowProps> = ({ job, formattedSalary }) => (
  <div className="modal-highlight-row">
    <div className="detail-item">
      <div className="detail-label">
        <DollarIcon size={14} /> Salary
      </div>
      <div className="detail-value">{formattedSalary}</div>
    </div>
    <div className="detail-item">
      <div className="detail-label">
        <CalendarIcon size={14} /> Applied
      </div>
      <div className="detail-value">{job.date}</div>
    </div>
    <div className="detail-item">
      <div className="detail-label">
        <ClockIcon size={14} /> Work Type
      </div>
      <div className="detail-value">
        <WorkTypeBadge type={job.workType} />
      </div>
    </div>
    <div className="detail-item">
      <div className="detail-label">
        <BookOpenIcon size={14} /> Employment
      </div>
      <div className="detail-value employment-type-value">
        {job.employmentType ? job.employmentType.replace('-', ' ') : 'permanent'}
      </div>
    </div>
  </div>
);
