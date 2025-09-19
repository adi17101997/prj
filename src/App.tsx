import React, { useState } from 'react';
import { CandidateSetup } from './components/CandidateSetup';
import { InterviewInterface } from './components/InterviewInterface';
import { CandidateInfo } from './types';

function App() {
  const [currentCandidate, setCurrentCandidate] = useState<CandidateInfo | null>(null);

  const handleStartInterview = (candidate: CandidateInfo) => {
    setCurrentCandidate(candidate);
  };

  const handleBackToSetup = () => {
    setCurrentCandidate(null);
  };

  return (
    <div className="App">
      {!currentCandidate ? (
        <CandidateSetup onStart={handleStartInterview} />
      ) : (
        <InterviewInterface
          candidate={currentCandidate}
          onBack={handleBackToSetup}
        />
      )}
    </div>
  );
}

export default App;