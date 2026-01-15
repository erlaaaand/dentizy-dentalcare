import type { Meta, StoryObj } from '@storybook/react';
import { 
  MoreHorizontal, 
  Heart, 
  Share2, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  ArrowRight,
  Settings,
  CreditCard
} from 'lucide-react';

// Import komponen utama dan sub-komponen
import { 
  Card, 
  StatsCard, 
  ActionCard 
} from './index';

// --- KONFIGURASI UTAMA ---
const meta: Meta<typeof Card> = {
  title: 'UI/Data Display/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'filled', 'elevated'],
      description: 'Gaya visual card',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl'],
      description: 'Padding internal card',
    },
    shadow: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl'],
      description: 'Efek bayangan (elevation)',
    },
    rounded: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl', 'full'],
      description: 'Kelengkungan sudut (border radius)',
    },
    hoverable: {
      control: 'boolean',
      description: 'Mengaktifkan efek hover (lift up)',
    },
    interactive: {
      control: 'boolean',
      description: 'Menjadikan card sebagai elemen interaktif (button behavior)',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Mengambil lebar penuh container',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

// --- BASE CARD STORIES ---

export const Default: Story = {
  args: {
    children: (
      <Card.Body>
        <Card.Title>Simple Card</Card.Title>
        <Card.Description>
          Ini adalah komponen card dasar. Konten di dalamnya dibungkus oleh Card.Body.
        </Card.Description>
      </Card.Body>
    ),
    variant: 'default',
    padding: 'md',
  },
};

export const CompleteComposition: Story = {
  render: (args) => (
    <Card {...args} className="w-[350px]">
      <Card.Header 
        action={
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        }
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            JD
          </div>
          <div>
            <Card.Title size="sm">John Doe</Card.Title>
            <Card.Description size="sm">Dental Surgeon</Card.Description>
          </div>
        </div>
      </Card.Header>

      <Card.Media 
        src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
        alt="Dental Clinic" 
        height="sm"
      />

      <Card.Body>
        <Card.Title className="mb-2">Root Canal Treatment</Card.Title>
        <Card.Description>
          Perawatan saluran akar gigi modern dengan teknologi mikroskop untuk hasil yang presisi dan minim rasa sakit.
        </Card.Description>
      </Card.Body>

      <Card.Footer>
        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
          <Heart className="w-4 h-4" /> Like
        </button>
        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-500 transition-colors">
          <Share2 className="w-4 h-4" /> Share
        </button>
      </Card.Footer>
    </Card>
  ),
};

export const Interactive: Story = {
  args: {
    interactive: true,
    hoverable: true,
    className: "w-[300px]",
    onClick: () => alert('Card clicked!'),
    children: (
      <Card.Body>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <Card.Title size="sm">Add Payment Method</Card.Title>
            <Card.Description>Connect your credit card</Card.Description>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
        </div>
      </Card.Body>
    ),
  },
};

// --- STATS CARD STORIES ---

export const StatsCardExample: StoryObj<typeof StatsCard> = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-[600px]">
      <StatsCard
        title="Total Patients"
        value="1,284"
        trend={{ value: 12.5, isPositive: true }}
        icon={<Users className="w-6 h-6 text-blue-500" />}
      />
      <StatsCard
        title="Revenue"
        value="$42,500"
        trend={{ value: 2.4, isPositive: false }}
        icon={<DollarSign className="w-6 h-6 text-green-500" />}
      />
      <StatsCard
        title="Appointments"
        value="34"
        description="Today's schedule"
        icon={<Activity className="w-6 h-6 text-purple-500" />}
      />
      <StatsCard
        title="Growth"
        value="+24%"
        trend={{ value: 4.1, isPositive: true }}
        icon={<TrendingUp className="w-6 h-6 text-orange-500" />}
      />
    </div>
  ),
};

// --- ACTION CARD STORIES ---

export const ActionCardExample: StoryObj<typeof ActionCard> = {
  render: () => (
    <div className="flex flex-col gap-4 w-[500px]">
      <ActionCard
        title="System Settings"
        description="Manage your clinic preferences and notifications."
        icon={<Settings className="w-6 h-6" />}
        action={
          <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            Configure
          </button>
        }
      />
      
      <ActionCard
        title="Subscription Plan"
        description="Your premium plan expires in 3 days."
        icon={<CreditCard className="w-6 h-6" />}
        variant="elevated"
        action={
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            Renew Now
          </button>
        }
      />
    </div>
  ),
};

// --- GRID LAYOUT EXAMPLE ---

export const GridLayout: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl p-4 bg-gray-50 rounded-xl">
      {[1, 2, 3].map((i) => (
        <Card key={i} hoverable>
          <Card.Media 
             height="sm"
             src={`https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&w=400&q=80`} 
             className="bg-gray-200" // Fallback color
          />
          <Card.Body>
            <Card.Title size="sm">Article {i}</Card.Title>
            <Card.Description className="line-clamp-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Card.Description>
          </Card.Body>
        </Card>
      ))}
    </div>
  ),
  parameters: {
    layout: 'padded',
  }
};