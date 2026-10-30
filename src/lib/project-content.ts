import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import { orderProjects } from './projects';

export async function getOrderedProjects(): Promise<
  CollectionEntry<'projects'>[]
> {
  const projects = await getCollection('projects');
  return orderProjects(
    projects.map((project) => ({
      ...project,
      order: project.data.order,
      slug: project.id,
    })),
  );
}
