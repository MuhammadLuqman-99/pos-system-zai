import { useEffect, useCallback } from 'react';

type KeyboardShortcut = {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description?: string;
};

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    shortcuts.forEach(shortcut => {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const shiftMatches = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
      const altMatches = shortcut.altKey ? event.altKey : !event.altKey;

      if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
        event.preventDefault();
        shortcut.action();
      }
    });
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

// Common POS shortcuts
export const usePOSShortcuts = (
  actions: {
    onPayment?: () => void;
    onCustomerSearch?: () => void;
    onDiscount?: () => void;
    onBarcodeScan?: () => void;
    onHelp?: () => void;
    onClearCart?: () => void;
    onSave?: () => void;
    onRefresh?: () => void;
    onDuplicate?: () => void;
  }
) => {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'F1',
      action: actions.onHelp || (() => {}),
      description: 'Help'
    },
    {
      key: 'F2',
      action: actions.onPayment || (() => {}),
      description: 'Payment'
    },
    {
      key: 'F3',
      action: actions.onCustomerSearch || (() => {}),
      description: 'Customer Search'
    },
    {
      key: 'F4',
      action: actions.onDiscount || (() => {}),
      description: 'Apply Discount'
    },
    {
      key: 'F5',
      action: actions.onRefresh || (() => {}),
      description: 'Refresh'
    },
    {
      key: 'b',
      ctrlKey: true,
      action: actions.onBarcodeScan || (() => {}),
      description: 'Toggle Barcode Scanner'
    },
    {
      key: 'd',
      ctrlKey: true,
      action: actions.onDuplicate || (() => {}),
      description: 'Duplicate Last Item'
    },
    {
      key: 's',
      ctrlKey: true,
      action: actions.onSave || (() => {}),
      description: 'Save Order'
    },
    {
      key: 'Escape',
      action: actions.onClearCart || (() => {}),
      description: 'Clear Cart'
    },
    {
      key: ' ',
      action: actions.onBarcodeScan || (() => {}),
      description: 'Toggle Barcode Scanner'
    }
  ];

  return useKeyboardShortcuts(shortcuts);
};