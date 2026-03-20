export interface Project {
  id: string;
  name: string;
  code: string;
}

export const MOCK_PROJECTS: Project[] = [
  { id: 'p1', name: '龙湖璟宸府(示例项目)', code: 'PRJT_R-049-T4-LHJCF' },
  { id: 'p2', name: '晓月澄庐102', code: 'PRJT_R-056-T-XYCL102' },
  { id: 'p3', name: '季景铭郡', code: 'PRJT_R-058-A-JJMJ' },
];

export function getProjectById(projectId: string): Project | null {
  return MOCK_PROJECTS.find((p) => p.id === projectId) || null;
}
