export const TASK_LABELS = [
  // Development
  { value: 'bug', label: 'Bug', color: 'bg-red-500' },
  { value: 'feature', label: 'Feature', color: 'bg-blue-500' },
  { value: 'enhancement', label: 'Enhancement', color: 'bg-green-500' },
  { value: 'refactor', label: 'Refactor', color: 'bg-purple-500' },
  { value: 'documentation', label: 'Documentation', color: 'bg-yellow-500' },
  { value: 'testing', label: 'Testing', color: 'bg-indigo-500' },
  
  // Design & UI/UX
  { value: 'ui-ux', label: 'UI/UX', color: 'bg-pink-500' },
  { value: 'design', label: 'Design', color: 'bg-orange-500' },
  { value: 'responsive', label: 'Responsive', color: 'bg-teal-500' },
  { value: 'accessibility', label: 'Accessibility', color: 'bg-cyan-500' },
  
  // Priority & Status
  { value: 'high-priority', label: 'High Priority', color: 'bg-red-600' },
  { value: 'low-priority', label: 'Low Priority', color: 'bg-gray-500' },
  { value: 'blocked', label: 'Blocked', color: 'bg-red-700' },
  { value: 'in-review', label: 'In Review', color: 'bg-yellow-600' },
  
  // Project Management
  { value: 'planning', label: 'Planning', color: 'bg-blue-600' },
  { value: 'research', label: 'Research', color: 'bg-purple-600' },
  { value: 'deployment', label: 'Deployment', color: 'bg-green-600' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-gray-600' },
] as const;

export const getLabelColor = (labelValue: string) => {
  const label = TASK_LABELS.find(l => l.value === labelValue);
  return label?.color || 'bg-gray-500';
};

export const getLabelName = (labelValue: string) => {
  const label = TASK_LABELS.find(l => l.value === labelValue);
  return label?.label || labelValue;
}; 