import { Megaphone, MessageSquare, Search, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { WorkflowType } from '@/hooks/use-creative';

interface WorkflowTypeConfig {
  type: WorkflowType;
  label: string;
  description: string;
  Icon: LucideIcon;
}

const WORKFLOW_TYPES: WorkflowTypeConfig[] = [
  {
    type: 'persona',
    label: 'Audience Persona',
    description: 'Generate a detailed persona snapshot of your audience',
    Icon: Users,
  },
  {
    type: 'campaign',
    label: 'Campaign Concepts',
    description: 'Create campaign ideas tailored to your audience',
    Icon: Megaphone,
  },
  {
    type: 'messaging',
    label: 'Messaging Angles',
    description: 'Develop messaging strategies that resonate',
    Icon: MessageSquare,
  },
  {
    type: 'opportunity',
    label: 'Content Opportunity Finder',
    description: 'Discover content opportunities for your audience',
    Icon: Search,
  },
];

interface Props {
  selectedType: WorkflowType;
  onSelectType: (type: WorkflowType) => void;
}

export function WorkflowTypeSelector({ selectedType, onSelectType }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {WORKFLOW_TYPES.map(({ type, label, description, Icon }) => (
        <button
          key={type}
          onClick={() => onSelectType(type)}
          className="text-left"
          type="button"
        >
          <Card
            className={`h-full cursor-pointer transition-colors ${
              selectedType === type
                ? 'bg-sidebar text-sidebar-foreground'
                : 'hover:border-foreground/30'
            }`}
          >
            <CardHeader className="gap-2">
              <Icon className={`h-5 w-5 ${selectedType === type ? 'text-sidebar-foreground/70' : 'text-muted-foreground'}`} />
              <CardTitle className={`text-sm ${selectedType === type ? 'text-sidebar-foreground' : ''}`}>{label}</CardTitle>
              <CardDescription className={`text-xs ${selectedType === type ? 'text-sidebar-foreground/70' : ''}`}>{description}</CardDescription>
            </CardHeader>
          </Card>
        </button>
      ))}
    </div>
  );
}
