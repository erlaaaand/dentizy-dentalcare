import type { Meta, StoryObj } from '@storybook/react';
// Pastikan package lucide-react sudah terinstall: npm install lucide-react
import { 
  Mail, 
  ArrowRight, 
  Trash2, 
  Save, 
  Plus, 
  Loader2, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react'; 

import Button from './Button';
import { IconButton } from './IconButton';
import { ButtonGroup } from './ButtonGroup';

// --- KONFIGURASI UTAMA ---
const meta: Meta<typeof Button> = {
  title: 'UI/Button', // Judul di Sidebar Storybook
  component: Button,
  tags: ['autodocs'], // Membuat dokumentasi otomatis (Docs tab)
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'success', 'warning', 'outline', 'ghost', 'link'],
      description: 'Gaya visual tombol',
      table: {
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'icon'],
      description: 'Ukuran tombol',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Apakah tombol mengambil lebar penuh container',
    },
    loading: {
      control: 'boolean',
      description: 'Menampilkan state loading spinner',
    },
    disabled: {
      control: 'boolean',
      description: 'Menonaktifkan interaksi tombol',
    },
    asChild: {
      table: {
        disable: true, // Sembunyikan prop teknikal ini dari kontrol
      },
    },
  },
  // Parameter layout agar tombol ada di tengah kanvas
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// --- VARIAN DASAR ---

export const Primary: Story = {
  args: {
    children: 'Button Primary',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Action',
    variant: 'secondary',
  },
};

export const Danger: Story = {
  args: {
    children: 'Delete Account',
    variant: 'danger',
    icon: <Trash2 className="w-4 h-4" />,
  },
};

export const Success: Story = {
  args: {
    children: 'Complete Task',
    variant: 'success',
    icon: <CheckCircle className="w-4 h-4" />,
  },
};

export const Warning: Story = {
  args: {
    children: 'Report Issue',
    variant: 'warning',
    icon: <AlertTriangle className="w-4 h-4" />,
  },
};

export const Outline: Story = {
  args: {
    children: 'Cancel',
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    children: 'View Details',
    variant: 'ghost',
  },
};

export const Link: Story = {
  args: {
    children: 'Read more',
    variant: 'link',
  },
};

// --- UKURAN (SIZES) ---

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4 flex-wrap">
      <Button size="xs" variant="secondary">Extra Small (xs)</Button>
      <Button size="sm" variant="secondary">Small (sm)</Button>
      <Button size="md" variant="secondary">Medium (md)</Button>
      <Button size="lg" variant="secondary">Large (lg)</Button>
      <Button size="xl" variant="secondary">Extra Large (xl)</Button>
    </div>
  ),
};

// --- DENGAN ICON ---

export const WithIconLeft: Story = {
  args: {
    children: 'Login with Email',
    icon: <Mail className="w-4 h-4" />,
    variant: 'primary',
  },
};

export const WithIconRight: Story = {
  args: {
    children: 'Next Step',
    icon: <ArrowRight className="w-4 h-4" />,
    iconPosition: 'right',
    variant: 'primary',
  },
};

// --- STATES (LOADING & DISABLED) ---

export const Loading: Story = {
  args: {
    children: 'Saving Data...',
    loading: true,
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button disabled variant="primary">Disabled Primary</Button>
      <Button disabled variant="secondary">Disabled Secondary</Button>
    </div>
  ),
};

export const FullWidth: Story = {
  parameters: {
    layout: 'padded', // Agar terlihat lebar penuhnya
  },
  args: {
    children: 'Full Width Button',
    fullWidth: true,
    variant: 'primary',
  },
};

// --- ICON BUTTON (Tombol Kotak/Bulat Khusus Icon) ---

export const IconButtonVariant: StoryObj<React.ComponentProps<typeof IconButton> & { 
    // Kita tambahkan properti 'hantu' ini agar TypeScript mengizinkan kita men-disable-nya
    children?: unknown;
    iconPosition?: unknown;
    fullWidth?: unknown;
    loading?: unknown;
}> = {
  render: (args) => <IconButton {...args} />,
  argTypes: {
    // Sekarang TypeScript tidak akan error di sini
    children: { table: { disable: true } },
    iconPosition: { table: { disable: true } },
    fullWidth: { table: { disable: true } },
    loading: { table: { disable: true } },
  },
  args: {
    icon: <Save className="w-4 h-4" />,
    'aria-label': 'Save Changes',
    variant: 'primary',
    size: 'icon',
  },
};

export const IconButtonsGroup: Story = {
  render: () => (
    <div className="flex gap-4">
      <IconButton icon={<Plus className="w-4 h-4" />} aria-label="Add" variant="primary" />
      <IconButton icon={<Trash2 className="w-4 h-4" />} aria-label="Delete" variant="danger" />
      <IconButton icon={<Mail className="w-4 h-4" />} aria-label="Mail" variant="outline" className="rounded-full" />
      <IconButton icon={<Loader2 className="w-4 h-4 animate-spin" />} aria-label="Loading" variant="ghost" />
    </div>
  ),
};

// --- BUTTON GROUP (Gabungan Tombol) ---

export const ButtonGroupExample: StoryObj<typeof ButtonGroup> = {
  render: () => (
    <div className="flex flex-col gap-4">
      {/* Horizontal Group */}
      <ButtonGroup>
        <Button variant="secondary">Years</Button>
        <Button variant="secondary">Months</Button>
        <Button variant="secondary">Days</Button>
      </ButtonGroup>

      {/* Vertical Group */}
      <ButtonGroup orientation="vertical">
        <Button variant="outline">Profile</Button>
        <Button variant="outline">Settings</Button>
        <Button variant="outline">Logout</Button>
      </ButtonGroup>
    </div>
  ),
};