import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SpeechStatus } from '@/hooks/use-speech';

interface VoiceIndicatorProps {
  status: SpeechStatus;
  onToggle?: () => void;
  className?: string;
}

export function VoiceIndicator({ status, onToggle, className }: VoiceIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'listening':
        return 'bg-green-400 animate-pulse';
      case 'processing':
        return 'bg-blue-400 animate-pulse';
      case 'unsupported':
        return 'bg-red-400';
      default:
        return 'bg-gray-300';
    }
  };

  const getIconColor = () => {
    switch (status) {
      case 'listening':
        return 'text-green-500';
      case 'processing':
        return 'text-blue-500';
      case 'unsupported':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className={cn('w-3 h-3 rounded-full', getStatusColor())} />
      <button
        onClick={onToggle}
        disabled={status === 'unsupported'}
        className={cn(
          'transition-colors',
          getIconColor(),
          onToggle && status !== 'unsupported' && 'hover:opacity-75 cursor-pointer'
        )}
      >
        {status === 'unsupported' ? <MicOff size={20} /> : <Mic size={20} />}
      </button>
    </div>
  );
}
