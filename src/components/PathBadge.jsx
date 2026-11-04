import React from 'react';
import { RotateCcw, Target, TrendingUp, HelpCircle } from 'lucide-react';
import { LEARNING_PATHS } from '../engine/adaptiveEngine';

export default function PathBadge({ path }) {
  if (path === LEARNING_PATHS.RELEARN.id) {
    return (
      <span className="badge badge-amber" title={LEARNING_PATHS.RELEARN.description}>
        <RotateCcw size={13} />
        Relearn Fundamentals
      </span>
    );
  }
  if (path === LEARNING_PATHS.PRACTISE.id) {
    return (
      <span className="badge badge-blue" title={LEARNING_PATHS.PRACTISE.description}>
        <Target size={13} />
        Practise
      </span>
    );
  }
  if (path === LEARNING_PATHS.ADVANCE.id) {
    return (
      <span className="badge badge-teal" title={LEARNING_PATHS.ADVANCE.description}>
        <TrendingUp size={13} />
        Advance
      </span>
    );
  }
  return (
    <span className="badge badge-slate" title={LEARNING_PATHS.NEEDS_CONFIRMATION.description}>
      <HelpCircle size={13} />
      Needs Confirmation
    </span>
  );
}
