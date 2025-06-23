import React from 'react';
import { Stepper, Step, StepLabel, Button } from '@mui/material';

const steps = ['Select Activity', 'Add Details', 'Review & Submit'];

const ReportActivityStepper = () => {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <div>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div>
        {activeStep === steps.length ? (
          <div>
            <h2>All steps completed</h2>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        ) : (
          <div>
            <h2>{steps[activeStep]}</h2>
            {/* Removed distance and description fields */}
            <div>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                style={{ marginRight: '8px' }}
              >
                Back
              </Button>
              <Button variant="contained" onClick={handleNext}>
                {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportActivityStepper;