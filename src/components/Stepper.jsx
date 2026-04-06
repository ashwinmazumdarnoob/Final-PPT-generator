import React from 'react';

const STEPS = [
  { key: 'strategy', label: 'Strategy' },
  { key: 'upload', label: 'Files' },
  { key: 'preview', label: 'Preview' },
  { key: 'generate', label: 'Export' },
];

export default function Stepper({ currentStep, completedSteps, onStepClick }) {
  return (
    <div className="stepper">
      {STEPS.map((step) => {
        const isActive = step.key === currentStep;
        const isDone = completedSteps.includes(step.key);
        return (
          <div
            key={step.key}
            className="stepper-step"
            onClick={() => onStepClick(step.key)}
          >
            <div className={`stepper-bar ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`} />
            <span className={`stepper-label ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export { STEPS };
