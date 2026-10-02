import { Component, type ErrorInfo, type ReactNode } from "react";
import { Suspense } from "react";
import { ErrorState } from "@build-me/ui";
import { logger } from "@build-me/utils";

import LoadingState from "../components/LoadingState";

type LazyLoadBoundaryProps = {
  children: ReactNode;
};

type LazyLoadBoundaryState = {
  hasError: boolean;
};

export class LazyLoadBoundary extends Component<
  LazyLoadBoundaryProps,
  LazyLoadBoundaryState
> {
  state: LazyLoadBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): LazyLoadBoundaryState {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error("Web component failed to load.", {
      service: "web",
      error,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorState message="Unable to load this feature." />;
    }

    return (
      <Suspense fallback={<LoadingState />}>{this.props.children}</Suspense>
    );
  }
}
