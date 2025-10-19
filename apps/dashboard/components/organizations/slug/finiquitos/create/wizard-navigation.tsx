'use client';

import { Button } from '@workspace/ui/components/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useWizard } from './wizard-context';

type WizardNavigationProps = {
  onNext?: () => void | Promise<void>;
  onPrevious?: () => void;
  nextLabel?: string;
  previousLabel?: string;
  nextDisabled?: boolean;
  isLoading?: boolean;
  hideNext?: boolean;
  hidePrevious?: boolean;
};

export function WizardNavigation({
  onNext,
  onPrevious,
  nextLabel = 'Siguiente',
  previousLabel = 'Anterior',
  nextDisabled = false,
  isLoading = false,
  hideNext = false,
  hidePrevious = false,
}: WizardNavigationProps) {
  const { currentStep, goNext, goPrevious } = useWizard();

  const handleNext = async () => {
    if (onNext) {
      await onNext();
    } else {
      goNext();
    }
  };

  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious();
    } else {
      goPrevious();
    }
  };

  return (
    <div className="flex justify-between gap-4 pt-6 border-t">
      {!hidePrevious && currentStep > 1 ? (
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={isLoading}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {previousLabel}
        </Button>
      ) : (
        <div />
      )}

      {!hideNext && (
        <Button
          type="button"
          onClick={handleNext}
          disabled={nextDisabled || isLoading}
          className="ml-auto"
        >
          {isLoading ? 'Procesando...' : nextLabel}
          {!isLoading && currentStep < 4 && <ChevronRight className="w-4 h-4 ml-2" />}
        </Button>
      )}
    </div>
  );
}
