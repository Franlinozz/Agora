import * as Dialog from '@radix-ui/react-dialog';
import React from 'react';

import { cn } from '../index.ts';

/** Example: <Modal.Root><Modal.Trigger>Open</Modal.Trigger><Modal.Content>...</Modal.Content></Modal.Root> */
function Content({ className, children, ...props }: Dialog.DialogContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
      <Dialog.Content className={cn('fixed left-1/2 top-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--color-bg-3)] bg-[var(--color-bg-1)] p-6 shadow-lg', className)} {...props}>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export const Modal = {
  Root: Dialog.Root,
  Trigger: Dialog.Trigger,
  Content,
  Title: Dialog.Title,
  Close: Dialog.Close,
};
