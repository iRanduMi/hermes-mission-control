import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
   <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg sm:max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-xl border border-panel-border bg-canvas-subtle p-4 sm:p-6 shadow-2xl max-h-[90dvh] overflow-y-auto touch-pan-y"
        {...props}
      >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4 text-text-muted" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-4', className)} {...props} />
);

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-[600] text-text-primary', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col sm:flex-row items-center gap-2 mt-6', className)} {...props} />
);

const DialogDescription = DialogPrimitive.Description;

export { Dialog, DialogTrigger, DialogPortal, DialogOverlay, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription };
