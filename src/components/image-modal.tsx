import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ReactNode } from 'react';

interface ImageModalProps {
  trigger: ReactNode;
  imageUrl: string;
  alt: string;
}

export function ImageModal({ trigger, imageUrl, alt }: ImageModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-3xl w-full p-2" data-testid="dialog-image-modal">
        <div className="relative w-full">
          <img 
            src={imageUrl}
            alt={alt}
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            data-testid="img-modal-enlarged"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}