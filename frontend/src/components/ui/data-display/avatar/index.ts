// ✅ Gunakan Named Export untuk komponen utama juga
export { default as Avatar } from './Avatar'; 
// ATAU jika di dalam Avatar.tsx masih export default, gunakan:
// export { default as Avatar } from './Avatar';

export * from './AvatarGroup';
export * from './AvatarStack';
export * from './avatar.types';
export * from './avatar.styles';