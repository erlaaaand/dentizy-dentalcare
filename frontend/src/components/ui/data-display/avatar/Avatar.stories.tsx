import type { Meta, StoryObj } from '@storybook/react';
import Avatar from './Avatar';
import { AvatarGroup } from './AvatarGroup';
import { AvatarStack } from './AvatarStack';

// --- DATA DUMMY UNTUK CONTOH ---
const demoImage1 = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
const demoImage2 = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
const demoImage3 = "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
const demoImage4 = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

const meta: Meta<typeof Avatar> = {
  title: 'UI/Data Display/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
      description: 'Ukuran avatar',
    },
    shape: {
      control: 'select',
      options: ['circle', 'rounded', 'square'],
      description: 'Bentuk avatar',
    },
    status: {
      control: 'select',
      options: ['online', 'offline', 'busy', 'away', null],
      description: 'Indikator status user',
    },
    shadow: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
    src: {
      control: 'text',
      description: 'URL Gambar',
    },
    name: {
      control: 'text',
      description: 'Nama user (untuk inisial/fallback)',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

// --- VARIAN AVATAR TUNGGAL ---

export const Default: Story = {
  args: {
    src: demoImage1,
    name: 'Tom Cook',
    alt: 'Tom Cook',
    size: 'md',
    status: 'online',
  },
};

export const InitialsOnly: Story = {
  args: {
    name: 'Budi Santoso',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Jika `src` kosong, avatar akan menampilkan inisial dari `name` dengan background gradient otomatis.',
      },
    },
  },
};

export const FallbackAnonymous: Story = {
  args: {
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Jika `src` dan `name` kosong, avatar menampilkan fallback anonim.',
      },
    },
  },
};

export const Shapes: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Avatar src={demoImage1} shape="circle" size="lg" />
      <Avatar src={demoImage1} shape="rounded" size="lg" />
      <Avatar src={demoImage1} shape="square" size="lg" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Avatar src={demoImage2} size="xs" />
      <Avatar src={demoImage2} size="sm" />
      <Avatar src={demoImage2} size="md" />
      <Avatar src={demoImage2} size="lg" />
      <Avatar src={demoImage2} size="xl" />
      <Avatar src={demoImage2} size="2xl" />
    </div>
  ),
};

export const StatusIndicators: Story = {
  render: () => (
    <div className="flex gap-6">
      <Avatar src={demoImage3} status="online" size="lg" />
      <Avatar src={demoImage3} status="busy" size="lg" />
      <Avatar src={demoImage3} status="away" size="lg" />
      <Avatar src={demoImage3} status="offline" size="lg" />
    </div>
  ),
};

export const Interactive: Story = {
  args: {
    src: demoImage4,
    name: 'Interactive User',
    interactive: true,
    size: 'lg',
    status: 'online',
    onClick: () => alert('Avatar clicked!'),
  },
  parameters: {
    docs: {
      story: 'Hover untuk melihat efek scale dan border shadow.',
    },
  },
};

// --- AVATAR GROUP ---

export const Group: StoryObj<typeof AvatarGroup> = {
  render: (args) => (
    <AvatarGroup {...args}>
      <Avatar src={demoImage1} name="User 1" />
      <Avatar src={demoImage2} name="User 2" />
      <Avatar src={demoImage3} name="User 3" />
      <Avatar src={demoImage4} name="User 4" />
      <Avatar name="John Doe" />
      <Avatar name="Jane Doe" />
      <Avatar name="Guest User" />
    </AvatarGroup>
  ),
  args: {
    max: 4,
    size: 'md',
    spacing: 'md',
    direction: 'horizontal',
    overlap: true,
  },
  argTypes: {
    children: { table: { disable: true } }, // Hide children control
  },
};

// --- AVATAR STACK ---

export const Stack: StoryObj<typeof AvatarStack> = {
  args: {
    avatars: [
      { src: demoImage1, name: 'Alice' },
      { src: demoImage2, name: 'Bob' },
      { src: demoImage3, name: 'Charlie' },
      { name: 'David' }, // Initials fallback
      { name: 'Eve' },
      { name: 'Frank' },
    ],
    max: 5,
    size: 'md',
  },
};