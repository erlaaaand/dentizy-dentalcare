import type { Meta, StoryObj } from '@storybook/react';
import { 
  Check, 
  X, 
  AlertTriangle, 
  Info, 
  Bell, 
  User, 
  Settings, 
  Shield 
} from 'lucide-react';

// Import komponen dari index (Barrel file folder badge)
import { 
  Badge, 
  BadgeGroup, 
  CountBadge, 
  IconBadge, 
  StatusBadge 
} from './index';

// --- KONFIGURASI UTAMA ---
const meta: Meta<typeof Badge> = {
  title: 'UI/Data Display/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'error', 'warning', 'info', 'outline', 'ghost', 'danger'],
      description: 'Gaya visual dan warna badge',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Ukuran badge',
    },
    shape: {
      control: 'select',
      options: ['pill', 'rounded', 'square'],
      description: 'Bentuk sudut badge',
    },
    gradient: {
      control: 'boolean',
      description: 'Mengaktifkan mode warna gradasi',
    },
    dot: {
      control: 'boolean',
      description: 'Menampilkan titik indikator di sebelah kiri',
    },
    pulse: {
      control: 'boolean',
      description: 'Efek animasi denyut (biasanya untuk notifikasi live)',
    },
    removable: {
      control: 'boolean',
      description: 'Menampilkan tombol hapus (X)',
    },
    children: {
      control: 'text',
      description: 'Konten teks badge',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

// --- BASE BADGE STORIES ---

export const Default: Story = {
  args: {
    children: 'Default Badge',
    variant: 'default',
    size: 'md',
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2 max-w-lg justify-center">
      <Badge {...args} variant="default">Default</Badge>
      <Badge {...args} variant="primary">Primary</Badge>
      <Badge {...args} variant="secondary">Secondary</Badge>
      <Badge {...args} variant="success">Success</Badge>
      <Badge {...args} variant="warning">Warning</Badge>
      <Badge {...args} variant="error">Error</Badge>
      <Badge {...args} variant="danger">Danger</Badge>
      <Badge {...args} variant="info">Info</Badge>
      <Badge {...args} variant="outline">Outline</Badge>
      <Badge {...args} variant="ghost">Ghost</Badge>
    </div>
  ),
  args: {
    size: 'md',
  },
};

export const Gradients: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2 max-w-lg justify-center">
      <Badge {...args} variant="primary">Primary</Badge>
      <Badge {...args} variant="success">Success</Badge>
      <Badge {...args} variant="warning">Warning</Badge>
      <Badge {...args} variant="error">Error</Badge>
      <Badge {...args} variant="secondary">Secondary</Badge>
    </div>
  ),
  args: {
    gradient: true,
    size: 'md',
  },
};

export const SpecialFeatures: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4 items-center">
      <div className="flex gap-2 items-center">
        <span className="text-sm text-gray-500 w-24">With Dot:</span>
        <Badge variant="success" dot>Online</Badge>
        <Badge variant="warning" dot>Away</Badge>
        <Badge variant="error" dot>Busy</Badge>
      </div>
      
      <div className="flex gap-2 items-center">
        <span className="text-sm text-gray-500 w-24">Pulsing:</span>
        <Badge variant="error" dot pulse>Live Recording</Badge>
        <Badge variant="primary" pulse>New Update</Badge>
      </div>

      <div className="flex gap-2 items-center">
        <span className="text-sm text-gray-500 w-24">With Icon:</span>
        <Badge variant="info" icon={Shield}>Verified</Badge>
        <Badge variant="success" icon={Check} iconPosition="right">Completed</Badge>
      </div>

      <div className="flex gap-2 items-center">
        <span className="text-sm text-gray-500 w-24">Removable:</span>
        <Badge variant="secondary" removable onRemove={() => alert('Removed!')}>Filter: Dentist</Badge>
      </div>
    </div>
  ),
};

// --- SUB-COMPONENT STORIES ---

export const StatusBadges: StoryObj<typeof StatusBadge> = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <StatusBadge status="active" />
      <StatusBadge status="inactive" />
      <StatusBadge status="pending" />
      <StatusBadge status="completed" />
      <StatusBadge status="cancelled" />
      <StatusBadge status="published" />
      <StatusBadge status="draft" />
      {/* Fallback untuk status custom */}
      <StatusBadge status="active" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '`StatusBadge` otomatis memilih warna dan label berdasarkan prop `status`.',
      },
    },
  },
};

export const CountBadges: StoryObj<typeof CountBadge> = {
  render: () => (
    <div className="flex gap-4 items-center">
      <div className="relative inline-block">
        <Bell className="w-6 h-6 text-gray-400" />
        <div className="absolute -top-2 -right-2">
          <CountBadge count={5} size="xs" />
        </div>
      </div>

      <div className="relative inline-block">
        <Bell className="w-6 h-6 text-gray-400" />
        <div className="absolute -top-2 -right-2">
          <CountBadge count={120} max={99} size="xs" />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
         <span>Inbox</span>
         <CountBadge count={3} variant="primary" size="md" />
      </div>
    </div>
  ),
};

export const IconBadges: StoryObj<typeof IconBadge> = {
  render: () => (
    <div className="flex gap-2">
      <IconBadge icon={User} aria-label="User Profile" variant="outline" />
      <IconBadge icon={Settings} aria-label="Settings" variant="secondary" />
      <IconBadge icon={Bell} aria-label="Notifications" variant="primary" size="lg" />
    </div>
  ),
};

export const Grouping: StoryObj<typeof BadgeGroup> = {
  render: () => (
    <div className="w-80 border p-4 rounded-lg">
      <p className="mb-2 text-sm text-gray-500">Skills (Wrap Enabled)</p>
      <BadgeGroup gap="sm">
        <Badge variant="secondary">React</Badge>
        <Badge variant="secondary">TypeScript</Badge>
        <Badge variant="secondary">Tailwind</Badge>
        <Badge variant="secondary">Storybook</Badge>
        <Badge variant="secondary">Next.js</Badge>
        <Badge variant="secondary">Node.js</Badge>
        <Badge variant="secondary">PostgreSQL</Badge>
        <Badge variant="secondary">Prisma</Badge>
      </BadgeGroup>
    </div>
  ),
};