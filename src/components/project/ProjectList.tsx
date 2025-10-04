import * as React from 'react';
import { AppData } from '../../types';
import { ProjectIcon } from '../ui/Icons';
import { formatDistanceToNow } from 'date-fns';

interface ProjectListProps {
    appData: AppData;
    onSelectProject: (projectId: string) => void;
    onBackToDashboard: () => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ appData, onSelectProject, onBackToDashboard }) => {
    // Sort projects by most recently modified
    const sortedProjects = [...appData.projects].sort((a, b) => b.lastModified - a.lastModified);

    const getCategoryName = (categoryId: string | null): string => {
        if (!categoryId) return 'Uncategorized';
        return appData.categories.find(c => c.id === categoryId)?.name || 'Uncategorized';
    };

    return (
        <div className="space-y-6">
            <div>
                <button onClick={onBackToDashboard} className="transition-colors text-on-surface-variant hover:text-primary label-large">
                    &larr; Back to Dashboard
                </button>
            </div>
            <div className="bg-surface-container rounded-lg">
                <ul className="divide-y divide-outline">
                    {sortedProjects.map(project => (
                        <li key={project.id}>
                            <button onClick={() => onSelectProject(project.id)} className="w-full flex items-center justify-between p-4 hover:bg-outline/10 text-left">
                                <div className="flex items-center gap-3">
                                    <ProjectIcon type={project.type} className="w-6 h-6 text-on-surface-variant" />
                                    <div>
                                        <p className="text-on-surface title-medium">{project.name}</p>
                                        <p className="text-on-surface-variant body-medium">
                                            {getCategoryName(project.categoryId)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-on-surface-variant body-small">
                                        Modified {formatDistanceToNow(new Date(project.lastModified), { addSuffix: true })}
                                    </p>
                                </div>
                            </button>
                        </li>
                    ))}
                     {sortedProjects.length === 0 && (
                        <p className="text-center text-on-surface-variant p-12 body-large">You don't have any projects yet.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default ProjectList;