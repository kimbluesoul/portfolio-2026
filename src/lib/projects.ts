export interface OrderedProject {
  order: number;
  slug: string;
}

export function orderProjects<T extends OrderedProject>(
  projects: readonly T[],
): T[] {
  const ordered = [...projects].sort((left, right) => left.order - right.order);
  const orders = ordered.map(({ order }) => order);
  const uniqueOrders = new Set(orders);

  if (uniqueOrders.size !== ordered.length) {
    throw new Error('Project order values must be unique.');
  }

  const hasGap = orders.some((order, index) => order !== index + 1);
  if (hasGap) {
    throw new Error('Project order values must be contiguous and start at 1.');
  }

  return ordered;
}

export function getNextProject<T extends OrderedProject>(
  projects: readonly T[],
  currentSlug: string,
): T {
  const ordered = orderProjects(projects);
  const currentIndex = ordered.findIndex(({ slug }) => slug === currentSlug);

  if (currentIndex === -1) {
    throw new Error(`Unknown project slug: ${currentSlug}`);
  }

  const nextProject = ordered[(currentIndex + 1) % ordered.length];
  if (!nextProject) {
    throw new Error('At least one project is required.');
  }

  return nextProject;
}
