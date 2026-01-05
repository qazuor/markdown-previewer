import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'markview:onboarding';

interface OnboardingState {
    hasSeenOnboarding: boolean;
    hasSeenTour: boolean;
    pausedTourStep: number | null;
}

/**
 * Hook for managing onboarding state
 */
export function useOnboarding() {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showTour, setShowTour] = useState(false);
    const [currentTourStep, setCurrentTourStep] = useState(0);
    const [hasPausedTour, setHasPausedTour] = useState(false);

    // Load onboarding state from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const state: OnboardingState = JSON.parse(stored);
                // Only show onboarding if user hasn't seen it
                if (!state.hasSeenOnboarding) {
                    setShowOnboarding(true);
                }
                // Check if there's a paused tour
                if (state.pausedTourStep !== null && state.pausedTourStep !== undefined) {
                    setHasPausedTour(true);
                }
            } else {
                // First time user
                setShowOnboarding(true);
            }
        } catch (error) {
            console.error('Failed to load onboarding state:', error);
            // Show onboarding on error to be safe
            setShowOnboarding(true);
        }
    }, []);

    /**
     * Mark onboarding as completed
     */
    const completeOnboarding = useCallback((startTour = false) => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            const state: OnboardingState = stored ? JSON.parse(stored) : { hasSeenOnboarding: false, hasSeenTour: false };

            state.hasSeenOnboarding = true;

            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            setShowOnboarding(false);

            if (startTour) {
                setShowTour(true);
                setCurrentTourStep(0);
            }
        } catch (error) {
            console.error('Failed to save onboarding state:', error);
        }
    }, []);

    /**
     * Complete the tour
     */
    const completeTour = useCallback(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            const state: OnboardingState = stored ? JSON.parse(stored) : { hasSeenOnboarding: true, hasSeenTour: false };

            state.hasSeenTour = true;

            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            setShowTour(false);
            setCurrentTourStep(0);
        } catch (error) {
            console.error('Failed to save tour state:', error);
        }
    }, []);

    /**
     * Reset onboarding state (useful for testing)
     */
    const resetOnboarding = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            setShowOnboarding(true);
            setShowTour(false);
            setCurrentTourStep(0);
        } catch (error) {
            console.error('Failed to reset onboarding state:', error);
        }
    }, []);

    /**
     * Start the tour manually
     */
    const startTour = useCallback(() => {
        setShowTour(true);
        setCurrentTourStep(0);
    }, []);

    /**
     * Skip the tour
     */
    const skipTour = useCallback(() => {
        completeTour();
    }, [completeTour]);

    /**
     * Pause the tour for later
     */
    const pauseTour = useCallback(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            const state: OnboardingState = stored
                ? JSON.parse(stored)
                : { hasSeenOnboarding: true, hasSeenTour: false, pausedTourStep: null };

            state.pausedTourStep = currentTourStep;

            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            setShowTour(false);
            setHasPausedTour(true);
        } catch (error) {
            console.error('Failed to pause tour:', error);
        }
    }, [currentTourStep]);

    /**
     * Resume a paused tour
     */
    const resumeTour = useCallback(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const state: OnboardingState = JSON.parse(stored);
                if (state.pausedTourStep !== null && state.pausedTourStep !== undefined) {
                    setCurrentTourStep(state.pausedTourStep);
                    setShowTour(true);

                    // Clear the paused step
                    state.pausedTourStep = null;
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
                    setHasPausedTour(false);
                }
            }
        } catch (error) {
            console.error('Failed to resume tour:', error);
        }
    }, []);

    /**
     * Move to next tour step
     */
    const nextTourStep = useCallback(() => {
        setCurrentTourStep((prev) => prev + 1);
    }, []);

    /**
     * Move to previous tour step
     */
    const previousTourStep = useCallback(() => {
        setCurrentTourStep((prev) => Math.max(0, prev - 1));
    }, []);

    return {
        showOnboarding,
        showTour,
        currentTourStep,
        hasPausedTour,
        completeOnboarding,
        completeTour,
        resetOnboarding,
        startTour,
        skipTour,
        pauseTour,
        resumeTour,
        nextTourStep,
        previousTourStep
    };
}
