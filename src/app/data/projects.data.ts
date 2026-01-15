export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  gif?: string;
  links: {
    github?: string;
    demo?: string;
  };
  tags?: string[];
  featured?: boolean;
  command?: string;
}

export const projectsData: Project[] = [
  {
    id: 'project-1',
    title: 'Project One',
    description: 'A placeholder project description. Replace this with your real work when ready.',
    image: 'images/placeholder.svg',
    links: {},
    tags: ['Web', 'Frontend'],
    featured: true,
    command: 'glow project-1.md',
  },
  {
    id: 'project-2',
    title: 'Project Two',
    description: 'Another placeholder project with a short summary of goals and impact.',
    image: 'images/placeholder.svg',
    links: {},
    tags: ['API', 'Backend'],
    featured: true,
    command: 'glow project-2.md',
  },
  {
    id: 'project-3',
    title: 'Project Three',
    description: 'Placeholder project showcasing tooling, automation, or a fun experiment.',
    image: 'images/placeholder.svg',
    links: {},
    tags: ['Tooling'],
    featured: false,
    command: 'glow project-3.md',
  },
  {
    id: 'project-4',
    title: 'Project Four',
    description:
      'Placeholder project focused on performance, reliability, and observability. Replace with a real case study when ready.',
    image: 'images/placeholder.svg',
    links: {},
    tags: ['Backend', 'Observability'],
    featured: true,
    command: 'glow project-4.md',
  },
  {
    id: 'project-5',
    title: 'Project Five',
    description:
      'Placeholder project highlighting UI polish and component architecture. Swap in screenshots and real outcomes later.',
    image: 'images/placeholder.svg',
    links: {},
    tags: ['Frontend', 'UI/UX'],
    featured: true,
    command: 'glow project-5.md',
  },
  {
    id: 'project-6',
    title: 'Project Six',
    description:
      'Placeholder project centered on infrastructure and automation (CI/CD, IaC, deployments). Update with real details when available.',
    image: 'images/placeholder.svg',
    links: {},
    tags: ['DevOps', 'Infrastructure'],
    featured: true,
    command: 'glow project-6.md',
  },
];
