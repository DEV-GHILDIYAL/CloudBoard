import React, { useState } from 'react';
import { Search, HelpCircle } from 'lucide-react';
import { getSymbolIconUrl } from '../../utils/symbolIcons';

export interface SymbolDefinition {
  type: string;
  icon: string;
  shape: 'rect' | 'circle' | 'diamond' | 'cylinder' | 'cloud' | 'user';
  label: string;
  defaultFill: string;
  textColor?: string;
  tags?: string[];
}

interface Category {
  id: string;
  name: string;
  items: SymbolDefinition[];
}

export const Sidebar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories: Category[] = [
    {
      id: 'aws',
      name: 'AWS Core Services',
      items: [
        { type: 'EC2', icon: '🖥️', shape: 'rect', label: 'EC2 Instance', defaultFill: '#EBF5FF', tags: ['compute', 'server', 'vm', 'aws', 'virtual', 'instance', 'amazon'] },
        { type: 'Lambda', icon: 'λ', shape: 'rect', label: 'Lambda Function', defaultFill: '#EBF5FF', tags: ['compute', 'function', 'serverless', 'aws', 'code', 'amazon'] },
        { type: 'ECS', icon: '🐳', shape: 'rect', label: 'ECS Container', defaultFill: '#EBF5FF', tags: ['compute', 'container', 'docker', 'aws', 'amazon'] },
        { type: 'EKS', icon: '⚓', shape: 'rect', label: 'EKS Cluster', defaultFill: '#EBF5FF', tags: ['compute', 'kubernetes', 'k8s', 'container', 'aws', 'amazon'] },
        { type: 'Fargate', icon: '🚀', shape: 'rect', label: 'Fargate', defaultFill: '#EBF5FF', tags: ['compute', 'serverless', 'container', 'docker', 'aws', 'amazon'] },
        { type: 'Batch', icon: '⚙️', shape: 'rect', label: 'Batch Job', defaultFill: '#EBF5FF', tags: ['compute', 'batch', 'job', 'aws', 'amazon'] },
        { type: 'S3', icon: '🪣', shape: 'cylinder', label: 'S3 Bucket', defaultFill: '#FFF8EB', tags: ['storage', 'bucket', 'object', 'aws', 'file', 'amazon'] },
        { type: 'EBS', icon: '💾', shape: 'cylinder', label: 'EBS Volume', defaultFill: '#FFF8EB', tags: ['storage', 'disk', 'volume', 'block', 'aws', 'amazon'] },
        { type: 'Glacier', icon: '🧊', shape: 'cylinder', label: 'S3 Glacier', defaultFill: '#FFF8EB', tags: ['storage', 'archive', 'glacier', 'aws', 'amazon'] },
        { type: 'VPC', icon: '🔷', shape: 'rect', label: 'VPC Network', defaultFill: '#EBFFF4', tags: ['network', 'subnet', 'security', 'aws', 'ip', 'amazon'] },
        { type: 'ALB', icon: '⚖️', shape: 'rect', label: 'Load Balancer (ALB)', defaultFill: '#EBFFF4', tags: ['network', 'loadbalancer', 'proxy', 'aws', 'amazon', 'balancer'] },
        { type: 'CloudFront', icon: '🌐', shape: 'cloud', label: 'CloudFront CDN', defaultFill: '#EBFFF4', tags: ['network', 'cdn', 'cache', 'aws', 'amazon'] },
        { type: 'Route53', icon: '🗺️', shape: 'rect', label: 'Route53 DNS', defaultFill: '#EBFFF4', tags: ['network', 'dns', 'domain', 'aws', 'amazon'] },
        { type: 'API Gateway', icon: '🔀', shape: 'rect', label: 'API Gateway', defaultFill: '#EBFFF4', tags: ['network', 'api', 'gateway', 'aws', 'amazon'] },
        { type: 'RDS', icon: '🗃️', shape: 'cylinder', label: 'RDS Database', defaultFill: '#FFF0EB', tags: ['database', 'db', 'sql', 'mysql', 'postgres', 'aws', 'amazon', 'relational'] },
        { type: 'DynamoDB', icon: '⚡', shape: 'cylinder', label: 'DynamoDB', defaultFill: '#FFF0EB', tags: ['database', 'db', 'nosql', 'aws', 'keyvalue', 'amazon'] },
        { type: 'ElastiCache', icon: '🧠', shape: 'cylinder', label: 'ElastiCache', defaultFill: '#FFF0EB', tags: ['database', 'db', 'cache', 'redis', 'aws', 'amazon'] },
        { type: 'Redshift', icon: '📊', shape: 'cylinder', label: 'Redshift', defaultFill: '#FFF0EB', tags: ['database', 'db', 'warehouse', 'analytics', 'aws', 'amazon'] },
        { type: 'Aurora', icon: '🌅', shape: 'cylinder', label: 'Aurora DB', defaultFill: '#FFF0EB', tags: ['database', 'db', 'sql', 'postgres', 'mysql', 'aws', 'amazon'] },
        { type: 'SQS', icon: '📬', shape: 'rect', label: 'SQS Queue', defaultFill: '#F5EBFF', tags: ['messaging', 'queue', 'message', 'aws', 'amazon'] },
        { type: 'SNS', icon: '📢', shape: 'rect', label: 'SNS Topic', defaultFill: '#F5EBFF', tags: ['messaging', 'notification', 'pubsub', 'aws', 'amazon'] },
        { type: 'EventBridge', icon: '🎯', shape: 'rect', label: 'EventBridge', defaultFill: '#F5EBFF', tags: ['messaging', 'events', 'bus', 'aws', 'amazon'] },
        { type: 'IAM', icon: '🔑', shape: 'rect', label: 'IAM Policy', defaultFill: '#FFEBEE', tags: ['security', 'auth', 'login', 'permission', 'aws', 'amazon', 'users'] },
        { type: 'KMS', icon: '🔑', shape: 'rect', label: 'KMS Key', defaultFill: '#FFEBEE', tags: ['security', 'encryption', 'key', 'aws', 'amazon'] },
        { type: 'CloudWatch', icon: '📈', shape: 'rect', label: 'CloudWatch', defaultFill: '#ECEFF1', tags: ['monitoring', 'metrics', 'logs', 'alerts', 'aws', 'amazon'] },
        { type: 'CloudFormation', icon: '🧱', shape: 'rect', label: 'CloudFormation', defaultFill: '#ECEFF1', tags: ['iac', 'infrastructure', 'terraform', 'aws', 'amazon'] },
      ],
    },
    {
      id: 'gcp',
      name: 'Google Cloud Platform (GCP)',
      items: [
        { type: 'Compute Engine', icon: '🖥️', shape: 'rect', label: 'Compute Engine', defaultFill: '#FCF8E3', tags: ['compute', 'server', 'vm', 'gcp', 'google', 'virtual'] },
        { type: 'Cloud Run', icon: '🏃', shape: 'rect', label: 'Cloud Run', defaultFill: '#FCF8E3', tags: ['compute', 'serverless', 'container', 'docker', 'gcp', 'google'] },
        { type: 'GKE', icon: '☸️', shape: 'rect', label: 'GKE Cluster', defaultFill: '#FCF8E3', tags: ['compute', 'kubernetes', 'k8s', 'container', 'gcp', 'google'] },
        { type: 'Cloud Storage', icon: '🪣', shape: 'cylinder', label: 'Cloud Storage', defaultFill: '#FCF8E3', tags: ['storage', 'bucket', 'object', 'gcp', 'google', 'file'] },
        { type: 'Persistent Disk', icon: '💾', shape: 'cylinder', label: 'Persistent Disk', defaultFill: '#FCF8E3', tags: ['storage', 'disk', 'volume', 'gcp', 'google'] },
        { type: 'BigQuery', icon: '📊', shape: 'rect', label: 'BigQuery', defaultFill: '#FCF8E3', tags: ['database', 'db', 'analytics', 'warehouse', 'gcp', 'google'] },
        { type: 'Cloud SQL', icon: '🛢️', shape: 'cylinder', label: 'Cloud SQL', defaultFill: '#FCF8E3', tags: ['database', 'db', 'sql', 'mysql', 'postgres', 'gcp', 'google'] },
        { type: 'Cloud Spanner', icon: '🛢️', shape: 'cylinder', label: 'Cloud Spanner', defaultFill: '#FCF8E3', tags: ['database', 'db', 'sql', 'relational', 'gcp', 'google'] },
        { type: 'Firestore', icon: '🔥', shape: 'cylinder', label: 'Firestore', defaultFill: '#FCF8E3', tags: ['database', 'db', 'nosql', 'document', 'gcp', 'google'] },
        { type: 'Pub/Sub', icon: '📬', shape: 'rect', label: 'Pub/Sub Broker', defaultFill: '#FCF8E3', tags: ['messaging', 'pubsub', 'queue', 'gcp', 'google'] },
        { type: 'Cloud IAM', icon: '🔑', shape: 'rect', label: 'Cloud IAM', defaultFill: '#FCF8E3', tags: ['security', 'auth', 'login', 'permission', 'gcp', 'google'] },
      ],
    },
    {
      id: 'azure',
      name: 'Microsoft Azure',
      items: [
        { type: 'Azure VM', icon: '🖥️', shape: 'rect', label: 'Azure VM', defaultFill: '#E1F5FE', tags: ['compute', 'server', 'vm', 'azure', 'microsoft', 'virtual'] },
        { type: 'App Service', icon: '☁️', shape: 'rect', label: 'App Service', defaultFill: '#E1F5FE', tags: ['compute', 'web', 'serverless', 'azure', 'microsoft'] },
        { type: 'AKS', icon: '☸️', shape: 'rect', label: 'AKS Cluster', defaultFill: '#E1F5FE', tags: ['compute', 'kubernetes', 'k8s', 'container', 'azure', 'microsoft'] },
        { type: 'Blob Storage', icon: '🪣', shape: 'cylinder', label: 'Blob Storage', defaultFill: '#E1F5FE', tags: ['storage', 'bucket', 'object', 'azure', 'microsoft'] },
        { type: 'Disk Storage', icon: '💾', shape: 'cylinder', label: 'Disk Storage', defaultFill: '#E1F5FE', tags: ['storage', 'disk', 'volume', 'azure', 'microsoft'] },
        { type: 'Azure SQL', icon: '🛢️', shape: 'cylinder', label: 'Azure SQL DB', defaultFill: '#E1F5FE', tags: ['database', 'db', 'sql', 'azure', 'microsoft'] },
        { type: 'Cosmos DB', icon: '⚡', shape: 'cylinder', label: 'Cosmos DB', defaultFill: '#E1F5FE', tags: ['database', 'db', 'nosql', 'azure', 'microsoft'] },
        { type: 'Service Bus', icon: '📬', shape: 'rect', label: 'Service Bus', defaultFill: '#E1F5FE', tags: ['messaging', 'queue', 'azure', 'microsoft'] },
        { type: 'Azure AD', icon: '👥', shape: 'rect', label: 'Entra ID (AD)', defaultFill: '#E1F5FE', tags: ['security', 'auth', 'login', 'users', 'azure', 'microsoft'] },
      ],
    },
    {
      id: 'devops',
      name: 'DevOps & Containers',
      items: [
        { type: 'Docker', icon: '🐳', shape: 'rect', label: 'Docker Container', defaultFill: '#ECEFF1', tags: ['container', 'docker', 'devops', 'runtime'] },
        { type: 'Kubernetes', icon: '☸️', shape: 'rect', label: 'Kubernetes', defaultFill: '#ECEFF1', tags: ['container', 'k8s', 'kubernetes', 'orchestration', 'devops'] },
        { type: 'Helm', icon: '⚓', shape: 'rect', label: 'Helm Chart', defaultFill: '#ECEFF1', tags: ['container', 'kubernetes', 'package', 'devops', 'helm'] },
        { type: 'Terraform', icon: '🧱', shape: 'rect', label: 'Terraform IaC', defaultFill: '#ECEFF1', tags: ['iac', 'infrastructure', 'terraform', 'devops', 'deployment'] },
        { type: 'Jenkins', icon: '🤵', shape: 'rect', label: 'Jenkins CI/CD', defaultFill: '#ECEFF1', tags: ['ci', 'cd', 'jenkins', 'automation', 'pipeline', 'devops'] },
        { type: 'Prometheus', icon: '🔥', shape: 'rect', label: 'Prometheus', defaultFill: '#ECEFF1', tags: ['monitoring', 'metrics', 'alerts', 'devops', 'timeseries'] },
        { type: 'Grafana', icon: '📊', shape: 'rect', label: 'Grafana Board', defaultFill: '#ECEFF1', tags: ['monitoring', 'dashboard', 'visualize', 'charts', 'devops'] },
        { type: 'GitHub', icon: '🐙', shape: 'rect', label: 'GitHub Repo', defaultFill: '#ECEFF1', tags: ['git', 'code', 'repository', 'github', 'version'] },
        { type: 'GitLab', icon: '🦊', shape: 'rect', label: 'GitLab CI', defaultFill: '#ECEFF1', tags: ['git', 'code', 'repository', 'ci', 'cd', 'gitlab'] },
      ],
    },
    {
      id: 'database',
      name: 'Databases & Caching',
      items: [
        { type: 'PostgreSQL', icon: '🐘', shape: 'cylinder', label: 'PostgreSQL', defaultFill: '#EFEBE9', tags: ['database', 'db', 'sql', 'postgres', 'relational', 'postgres'] },
        { type: 'MySQL', icon: '🐬', shape: 'cylinder', label: 'MySQL Server', defaultFill: '#EFEBE9', tags: ['database', 'db', 'sql', 'mysql', 'relational'] },
        { type: 'SQLite', icon: '🪶', shape: 'cylinder', label: 'SQLite', defaultFill: '#EFEBE9', tags: ['database', 'db', 'sql', 'sqlite', 'local', 'file'] },
        { type: 'MongoDB', icon: '🍃', shape: 'cylinder', label: 'MongoDB', defaultFill: '#EFEBE9', tags: ['database', 'db', 'nosql', 'mongodb', 'document'] },
        { type: 'Redis', icon: '🟥', shape: 'cylinder', label: 'Redis Cache', defaultFill: '#EFEBE9', tags: ['database', 'db', 'cache', 'redis', 'keyvalue'] },
        { type: 'Elasticsearch', icon: '🔍', shape: 'rect', label: 'Elasticsearch', defaultFill: '#EFEBE9', tags: ['database', 'search', 'query', 'elasticsearch', 'logstash'] },
        { type: 'Cassandra', icon: '🗄️', shape: 'cylinder', label: 'Cassandra DB', defaultFill: '#EFEBE9', tags: ['database', 'db', 'nosql', 'cassandra', 'widecolumn'] },
        { type: 'Neo4j', icon: '🕸️', shape: 'rect', label: 'Neo4j Graph', defaultFill: '#EFEBE9', tags: ['database', 'db', 'nosql', 'graph', 'neo4j'] },
      ],
    },
    {
      id: 'languages',
      name: 'Frontend & Languages',
      items: [
        { type: 'HTML5', icon: '🌐', shape: 'rect', label: 'HTML5 Page', defaultFill: '#EDE7F6', tags: ['language', 'web', 'html', 'frontend', 'client'] },
        { type: 'CSS3', icon: '🎨', shape: 'rect', label: 'CSS3 Styles', defaultFill: '#EDE7F6', tags: ['language', 'web', 'css', 'style', 'frontend'] },
        { type: 'JavaScript', icon: '💻', shape: 'rect', label: 'JavaScript', defaultFill: '#EDE7F6', tags: ['language', 'js', 'javascript', 'web', 'code', 'frontend'] },
        { type: 'TypeScript', icon: '📘', shape: 'rect', label: 'TypeScript', defaultFill: '#EDE7F6', tags: ['language', 'ts', 'typescript', 'web', 'code', 'frontend'] },
        { type: 'React', icon: '⚛️', shape: 'rect', label: 'React.js', defaultFill: '#EDE7F6', tags: ['framework', 'ui', 'react', 'frontend', 'web', 'javascript'] },
        { type: 'NodeJS', icon: '🟢', shape: 'rect', label: 'Node.js Runtime', defaultFill: '#EDE7F6', tags: ['runtime', 'backend', 'node', 'js', 'javascript', 'server'] },
        { type: 'Python', icon: '🐍', shape: 'rect', label: 'Python Script', defaultFill: '#EDE7F6', tags: ['language', 'python', 'code', 'ai', 'backend', 'django', 'flask'] },
        { type: 'Golang', icon: '🐹', shape: 'rect', label: 'Go Executable', defaultFill: '#EDE7F6', tags: ['language', 'go', 'golang', 'backend', 'code', 'concurrency'] },
        { type: 'Rust', icon: '🦀', shape: 'rect', label: 'Rust Library', defaultFill: '#EDE7F6', tags: ['language', 'rust', 'backend', 'code', 'system', 'wasm'] },
        { type: 'Java', icon: '☕', shape: 'rect', label: 'Java Application', defaultFill: '#EDE7F6', tags: ['language', 'java', 'backend', 'code', 'spring'] },
      ],
    },
    {
      id: 'saas',
      name: 'SaaS & Integrations',
      items: [
        { type: 'Stripe', icon: '💳', shape: 'rect', label: 'Stripe Payment', defaultFill: '#F1F8E9', tags: ['saas', 'stripe', 'payment', 'billing', 'credit'] },
        { type: 'PayPal', icon: '🪙', shape: 'rect', label: 'PayPal Gateway', defaultFill: '#F1F8E9', tags: ['saas', 'paypal', 'payment', 'money'] },
        { type: 'SendGrid', icon: '✉️', shape: 'rect', label: 'SendGrid Mail', defaultFill: '#F1F8E9', tags: ['saas', 'email', 'mail', 'sendgrid', 'smtp'] },
        { type: 'Twilio', icon: '📞', shape: 'rect', label: 'Twilio API', defaultFill: '#F1F8E9', tags: ['saas', 'phone', 'sms', 'twilio', 'voice', 'communication'] },
        { type: 'Auth0', icon: '🛡️', shape: 'rect', label: 'Auth0 Portal', defaultFill: '#F1F8E9', tags: ['saas', 'security', 'auth', 'login', 'auth0', 'oauth'] },
        { type: 'Slack', icon: '💬', shape: 'rect', label: 'Slack Webhook', defaultFill: '#F1F8E9', tags: ['saas', 'chat', 'slack', 'communication', 'notification'] },
        { type: 'Discord', icon: '👾', shape: 'rect', label: 'Discord Bot', defaultFill: '#F1F8E9', tags: ['saas', 'chat', 'discord', 'communication', 'notification'] },
        { type: 'Firebase', icon: '🔥', shape: 'rect', label: 'Firebase DB', defaultFill: '#F1F8E9', tags: ['saas', 'database', 'auth', 'firebase', 'google', 'nosql'] },
        { type: 'Supabase', icon: '⚡', shape: 'rect', label: 'Supabase Server', defaultFill: '#F1F8E9', tags: ['saas', 'database', 'auth', 'supabase', 'postgres', 'sql'] },
      ],
    },
    {
      id: 'general',
      name: 'Flowchart & General',
      items: [
        { type: 'Rectangle', icon: '⬜', shape: 'rect', label: 'Rectangle', defaultFill: '#FFFFFF', tags: ['shape', 'rectangle', 'box', 'square', 'outline'] },
        { type: 'Circle', icon: '⭕', shape: 'circle', label: 'Circle', defaultFill: '#FFFFFF', tags: ['shape', 'circle', 'oval', 'round', 'outline'] },
        { type: 'Diamond', icon: '♦️', shape: 'diamond', label: 'Diamond', defaultFill: '#FFFFFF', tags: ['shape', 'diamond', 'decision', 'flow', 'branching', 'outline'] },
        { type: 'Cylinder', icon: '🥫', shape: 'cylinder', label: 'Cylinder', defaultFill: '#FFFFFF', tags: ['shape', 'cylinder', 'database', 'store', 'outline'] },
        { type: 'Cloud', icon: '☁️', shape: 'cloud', label: 'Cloud', defaultFill: '#FFFFFF', tags: ['shape', 'cloud', 'network', 'internet', 'outline'] },
        { type: 'Actor', icon: '👤', shape: 'user', label: 'Actor', defaultFill: '#FFFFFF', tags: ['shape', 'user', 'actor', 'person', 'client', 'outline'] },
        { type: 'Server', icon: '🖥️', shape: 'rect', label: 'Server Box', defaultFill: '#FFFFFF', tags: ['general', 'server', 'compute', 'hardware', 'host'] },
        { type: 'Database Server', icon: '🛢️', shape: 'cylinder', label: 'DB Server', defaultFill: '#FFFFFF', tags: ['general', 'database', 'server', 'db', 'sql'] },
        { type: 'Firewall', icon: '🧱', shape: 'rect', label: 'Firewall Gate', defaultFill: '#FFFFFF', tags: ['general', 'security', 'firewall', 'block', 'wall'] },
        { type: 'Laptop', icon: '💻', shape: 'rect', label: 'Client Laptop', defaultFill: '#FFFFFF', tags: ['general', 'client', 'computer', 'laptop', 'user'] },
        { type: 'Mobile Phone', icon: '📱', shape: 'rect', label: 'Client Phone', defaultFill: '#FFFFFF', tags: ['general', 'client', 'phone', 'mobile', 'user'] },
      ],
    },
  ];

  const handleDragStart = (e: React.DragEvent, item: SymbolDefinition) => {
    e.dataTransfer.setData('application/cloudboard-node', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Flatten all items into a single collection
  const allItems = categories.flatMap((cat) => cat.items);

  // Filter flattened items based on the search query, matching label, type, or tags
  const filteredItems = allItems.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags && item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Dynamically generate a custom match if the user is typing
  const cleanQuery = searchQuery.trim();
  if (cleanQuery) {
    const queryLower = cleanQuery.toLowerCase();
    const hasExactMatch = filteredItems.some(
      (item) => item.label.toLowerCase() === queryLower || item.type.toLowerCase() === queryLower
    );

    if (!hasExactMatch) {
      const dynamicSymbol: SymbolDefinition = {
        type: cleanQuery,
        icon: getDynamicEmoji(cleanQuery),
        shape: getDynamicShape(cleanQuery),
        label: capitalizeWords(cleanQuery),
        defaultFill: '#EBF5FF',
      };
      filteredItems.push(dynamicSymbol);
    }
  }

  return (
    <aside className="w-full h-full bg-[#1a1d27] flex flex-col overflow-hidden select-none">
      {/* Sidebar Title & Search area */}
      <div className="p-4 border-b border-[#2a2d3e]/60 bg-[#1a1d27] shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-bold text-[#6366f1] uppercase tracking-[0.15em]">
            SYMBOL LIBRARY
          </h2>
        </div>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search database, compute, security..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f1117] border border-[#2a2d3e] focus:border-[#6366f1] rounded-lg pl-9 pr-3 py-2 text-xs text-[#e2e8f0] placeholder-[#64748b] focus:outline-none transition-all duration-150 focus:ring-1 focus:ring-[#6366f1]/30"
          />
        </div>
      </div>

      {/* Scrollable Symbols Grid */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-2">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 pb-4 pt-1">
            {filteredItems.map((item, idx) => {
              const iconUrl = getSymbolIconUrl(item.type);
              return (
                <div
                  key={idx}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  className="flex flex-col items-center justify-center pt-3 pb-2.5 px-1 bg-[#1e2030] border border-[#2a2d3e] hover:border-[#6366f1] hover:bg-[#25283b] rounded-[10px] cursor-grab active:cursor-grabbing group transition-all duration-150 ease-in-out hover:scale-[1.03] hover:shadow-[0_0_12px_rgba(99,102,241,0.15)] min-w-0"
                  title={item.label}
                >
                  {iconUrl ? (
                    <img
                      src={iconUrl}
                      alt={item.label}
                      className="w-8 h-8 object-contain mb-1.5 group-hover:scale-110 transition-transform duration-150 pointer-events-none"
                    />
                  ) : (
                    <span className="text-[20px] mb-1.5 group-hover:scale-110 transition-transform duration-150">
                      {item.icon}
                    </span>
                  )}
                <span className="text-[9px] text-[#94a3b8] group-hover:text-[#e2e8f0] font-medium text-center line-clamp-1 w-full px-0.5">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-2xl mb-2 text-[#64748b]">🔍</span>
            <p className="text-xs text-[#64748b] font-medium leading-relaxed">
              No symbols found matching<br />
              <span className="text-slate-350 font-semibold">"{searchQuery}"</span>
            </p>
          </div>
        )}
      </div>

      {/* Footer Instructions */}
      <div className="p-3 border-t border-[#2a2d3e]/60 text-[10px] text-[#64748b] flex items-start gap-2 bg-[#1a1d27] shrink-0">
        <HelpCircle className="w-3.5 h-3.5 text-[#64748b] shrink-0 mt-0.5" />
        <span className="leading-normal">
          Drag any symbol onto the canvas. It will inherit its shape and custom color theme automatically.
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;

const EMOJI_DICTIONARY: Record<string, string> = {
  // Cloud & Tech
  aws: '☁️', amazon: '☁️', kubernetes: '☸️', k8s: '☸️', docker: '🐳', container: '🐳',
  github: '🐙', git: '🐙', gitlab: '🐙', bitbucket: '🐙', react: '⚛️', angular: '⚛️',
  vue: '⚛️', node: '💻', javascript: '💻', typescript: '💻', js: '💻', ts: '💻',
  python: '🐍', java: '☕', golang: '🐹', rust: '🦀', cpp: '💻', python3: '🐍',
  linux: '🐧', ubuntu: '🐧', debian: '🐧', redhat: '🐧', windows: '🪟', apple: '🍎',
  mac: '🍎', android: '🤖', google: '🤖', ai: '🧠', ml: '🧠', gpt: '🧠', bot: '🤖',
  // Infrastructure
  server: '🖥️', ec2: '🖥️', vm: '🖥️', instance: '🖥️', host: '🖥️', compute: '🖥️',
  database: '🛢️', db: '🛢️', sql: '🛢️', mysql: '🛢️', postgres: '🛢️', oracle: '🛢️',
  mongodb: '🛢️', redis: '🛢️', dynamodb: '🛢️', nosql: '🛢️', datastore: '🛢️', rds: '🗃️',
  storage: '💾', s3: '🪣', bucket: '🪣', drive: '💾', disk: '💾', volume: '💾',
  network: '🌐', vpc: '🌐', subnet: '🌐', internet: '🌐', route: '🌐', gateway: '🌐',
  firewall: '🧱', security: '🛡️', shield: '🛡️', key: '🔑', policy: '📜', auth: '🔒',
  login: '🔐', loadbalancer: '⚖️', balancer: '⚖️', proxy: '⚖️', nginx: '⚖️',
  lambda: 'λ', serverless: 'λ', cache: '⚡', queue: '📥', sqs: '📬', sns: '📢',
  kafka: '📥', message: '✉️', event: '🎯', monitor: '📈', log: '📝', metric: '📊',
  dns: '🗺️', domain: '🗺️', cdn: '🚀', cloudfront: '🚀', fastly: '🚀', cloudflare: '🚀',
  // Business
  payment: '💳', stripe: '💳', paypal: '💳', billing: '💳', price: '🏷️', pricing: '🏷️',
  money: '💵', cash: '💵', credit: '💳', card: '💳', wallet: '👛', cart: '🛒',
  shop: '🛒', store: '🛒', checkout: '🛒', ecommerce: '🛒', user: '👤', client: '👤',
  customer: '👤', admin: '👤', team: '👥', group: '👥', users: '👥', organization: '🏢',
  chat: '💬', slack: '💬', discord: '💬', feedback: '💬', email: '✉️', mail: '✉️',
  ses: '✉️', search: '🔍', query: '🔍', analytics: '📊', bi: '📊', dashboard: '📊',
  report: '📊', stats: '📊', notification: '🔔', bell: '🔔', sns_topic: '🔔',
  task: '📋', todo: '📋', project: '📋', time: '🕒', clock: '🕒', timer: '🕒',
  // Emojis for general nouns
  rocket: '🚀', home: '🏠', house: '🏠', coffee: '☕', tea: '☕', file: '📄',
  document: '📄', folder: '📁', gear: '⚙️', settings: '⚙️', config: '⚙️', lock: '🔒',
  unlock: '🔓', phone: '📱', mobile: '📱', tablet: '📟', computer: '💻', laptop: '💻',
  printer: '🖨️', camera: '📷', video: '🎥', mic: '🎙️', microphone: '🎙️', music: '🎵',
  audio: '🎵', game: '🎮', trophy: '🏆', gift: '🎁', bag: '🛍️', label: '🏷️',
  ticket: '🎫', flag: '🚩', pin: '📌', location: '📍', compass: '🧭', anchor: '⚓',
  bolt: '⚡', lightning: '⚡', leaf: '🍃', fire: '🔥', flame: '🔥', water: '💧',
  droplet: '💧', wind: '💨', cloud: '☁️', sun: '☀️', moon: '🌙', star: '⭐',
  umbrella: '☔', eye: '👁️', ear: '👂', hand: '✋', smile: '😊', info: 'ℹ️',
  help: '❓', question: '❓', warning: '⚠️', check: '✅', cross: '❌', minus: '➖',
  plus: '➕', arrow: '➡️', sync: '🔄', share: '📤', download: '📥', upload: '📤',
};

const getDynamicEmoji = (query: string): string => {
  const words = query.toLowerCase().split(/\s+/);
  // 1. Exact matches
  for (const word of words) {
    if (EMOJI_DICTIONARY[word]) {
      return EMOJI_DICTIONARY[word];
    }
  }
  // 2. Prefix/fuzzy key matches
  for (const word of words) {
    const matchedKey = Object.keys(EMOJI_DICTIONARY).find(
      (key) => word.startsWith(key) || key.startsWith(word)
    );
    if (matchedKey) {
      return EMOJI_DICTIONARY[matchedKey];
    }
  }
  // 3. Fallback
  return '📦';
};

const getDynamicShape = (query: string): 'rect' | 'circle' | 'diamond' | 'cylinder' | 'cloud' | 'user' => {
  const q = query.toLowerCase();
  if (
    q.includes('database') ||
    q.includes('db') ||
    q.includes('sql') ||
    q.includes('cache') ||
    q.includes('storage') ||
    q.includes('redis')
  ) {
    return 'cylinder';
  }
  if (
    q.includes('decision') ||
    q.includes('flow') ||
    q.includes('if') ||
    q.includes('condition') ||
    q.includes('route')
  ) {
    return 'diamond';
  }
  if (
    q.includes('user') ||
    q.includes('actor') ||
    q.includes('person') ||
    q.includes('member') ||
    q.includes('admin') ||
    q.includes('client')
  ) {
    return 'user';
  }
  if (
    q.includes('cloud') ||
    q.includes('internet') ||
    q.includes('web') ||
    q.includes('website')
  ) {
    return 'cloud';
  }
  if (
    q.includes('circle') ||
    q.includes('round') ||
    q.includes('oval') ||
    q.includes('loop')
  ) {
    return 'circle';
  }
  return 'rect';
};

const capitalizeWords = (str: string): string => {
  return str
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
