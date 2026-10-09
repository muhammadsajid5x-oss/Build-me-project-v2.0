import { lazy, type ComponentType, type LazyExoticComponent } from "react";

import { measureLazyLoad } from "./measurement";

export type LazyImport<T extends ComponentType<unknown>> = () => Promise<{
  default: T;
}>;

export function lazyLoad<T extends ComponentType<unknown>>(
  importer: LazyImport<T>,
  name = "lazy-component",
): LazyExoticComponent<T> {
  return lazy(measureLazyLoad(name, importer));
}
