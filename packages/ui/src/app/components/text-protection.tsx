import {
  forwardRef,
  type CSSProperties,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type MutableRefObject,
  type Ref,
  type SyntheticEvent,
  type TextareaHTMLAttributes,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  (ref as MutableRefObject<T | null>).current = value;
}

export function hasMeaningfulSelection(field: HTMLInputElement | HTMLTextAreaElement | null) {
  if (!field) return false;
  const { selectionStart, selectionEnd, value } = field;
  if (selectionStart == null || selectionEnd == null || selectionStart === selectionEnd) return false;
  return value.slice(selectionStart, selectionEnd).trim().length > 0;
}

function applyProtectedValue(field: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const prototype =
    field instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

  if (setter) {
    setter.call(field, value);
  } else {
    field.value = value;
  }

  field.dispatchEvent(new Event("input", { bubbles: true }));
}

export function protectTextSelection(field: HTMLInputElement | HTMLTextAreaElement | null) {
  if (!field) return false;

  const { selectionStart, selectionEnd, value } = field;
  if (selectionStart == null || selectionEnd == null || selectionStart === selectionEnd) return false;

  const selectedText = value.slice(selectionStart, selectionEnd);
  if (!selectedText.trim()) return false;

  const isAlreadyProtected =
    value.slice(Math.max(0, selectionStart - 2), selectionStart) === "[[" &&
    value.slice(selectionEnd, selectionEnd + 2) === "]]";

  if (isAlreadyProtected || (selectedText.startsWith("[[") && selectedText.endsWith("]]"))) {
    return false;
  }

  const nextValue = `${value.slice(0, selectionStart)}[[${selectedText}]]${value.slice(selectionEnd)}`;
  applyProtectedValue(field, nextValue);

  const nextSelectionStart = selectionStart + 2;
  const nextSelectionEnd = selectionEnd + 2;
  requestAnimationFrame(() => {
    field.focus();
    field.setSelectionRange(nextSelectionStart, nextSelectionEnd);
  });

  return true;
}

export function ProtectSelectionButton({
  disabled,
  onProtect,
}: {
  disabled: boolean;
  onProtect: () => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={(event) => {
        event.preventDefault();
        if (!disabled) {
          onProtect();
        }
      }}
      disabled={disabled}
      title="Selecione um termo e clique para impedir a tradução"
      className="rounded-md px-2 py-1 text-[10px] font-semibold tracking-[0.08em] transition-colors disabled:cursor-not-allowed disabled:opacity-35"
      style={{ border: "1px solid #2a2a2a", color: disabled ? "#555" : "#9a9a9a", backgroundColor: "#101010" }}
    >
      [[ ]]
    </button>
  );
}

function useSelectionProtection<T extends HTMLInputElement | HTMLTextAreaElement>(forwardedRef?: Ref<T>) {
  const localRef = useRef<T | null>(null);
  const [canProtect, setCanProtect] = useState(false);

  const setRef = useCallback(
    (node: T | null) => {
      localRef.current = node;
      assignRef(forwardedRef, node);
    },
    [forwardedRef],
  );

  const syncSelectionState = useCallback(() => {
    setCanProtect(hasMeaningfulSelection(localRef.current));
  }, []);

  const clearSelectionState = useCallback(() => {
    setCanProtect(false);
  }, []);

  const protectSelection = useCallback(() => {
    if (protectTextSelection(localRef.current)) {
      requestAnimationFrame(syncSelectionState);
    }
  }, [syncSelectionState]);

  return useMemo(
    () => ({
      ref: setRef,
      canProtect,
      syncSelectionState,
      clearSelectionState,
      protectSelection,
    }),
    [canProtect, clearSelectionState, protectSelection, setRef, syncSelectionState],
  );
}

type SelectionProtectedInputProps = InputHTMLAttributes<HTMLInputElement> & {
  wrapperClassName?: string;
  wrapperStyle?: CSSProperties;
};

export const SelectionProtectedInput = forwardRef<HTMLInputElement, SelectionProtectedInputProps>(
  function SelectionProtectedInput(
    {
      wrapperClassName = "flex items-center gap-2",
      wrapperStyle,
      onChange,
      onSelect,
      onKeyUp,
      onMouseUp,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) {
    const protection = useSelectionProtection<HTMLInputElement>(ref);

    return (
      <div className={wrapperClassName} style={wrapperStyle}>
        <input
          {...props}
          ref={protection.ref}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            onChange?.(event);
            protection.syncSelectionState();
          }}
          onSelect={(event: SyntheticEvent<HTMLInputElement>) => {
            onSelect?.(event);
            protection.syncSelectionState();
          }}
          onKeyUp={(event: KeyboardEvent<HTMLInputElement>) => {
            onKeyUp?.(event);
            protection.syncSelectionState();
          }}
          onMouseUp={(event: MouseEvent<HTMLInputElement>) => {
            onMouseUp?.(event);
            protection.syncSelectionState();
          }}
          onFocus={(event: FocusEvent<HTMLInputElement>) => {
            onFocus?.(event);
            protection.syncSelectionState();
          }}
          onBlur={(event: FocusEvent<HTMLInputElement>) => {
            onBlur?.(event);
            protection.clearSelectionState();
          }}
        />
        <ProtectSelectionButton disabled={!protection.canProtect} onProtect={protection.protectSelection} />
      </div>
    );
  },
);

type SelectionProtectedTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  wrapperClassName?: string;
  wrapperStyle?: CSSProperties;
};

export const SelectionProtectedTextarea = forwardRef<HTMLTextAreaElement, SelectionProtectedTextareaProps>(
  function SelectionProtectedTextarea(
    {
      wrapperClassName = "flex items-start gap-2",
      wrapperStyle,
      onChange,
      onSelect,
      onKeyUp,
      onMouseUp,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) {
    const protection = useSelectionProtection<HTMLTextAreaElement>(ref);

    return (
      <div className={wrapperClassName} style={wrapperStyle}>
        <textarea
          {...props}
          ref={protection.ref}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            onChange?.(event);
            protection.syncSelectionState();
          }}
          onSelect={(event: SyntheticEvent<HTMLTextAreaElement>) => {
            onSelect?.(event);
            protection.syncSelectionState();
          }}
          onKeyUp={(event: KeyboardEvent<HTMLTextAreaElement>) => {
            onKeyUp?.(event);
            protection.syncSelectionState();
          }}
          onMouseUp={(event: MouseEvent<HTMLTextAreaElement>) => {
            onMouseUp?.(event);
            protection.syncSelectionState();
          }}
          onFocus={(event: FocusEvent<HTMLTextAreaElement>) => {
            onFocus?.(event);
            protection.syncSelectionState();
          }}
          onBlur={(event: FocusEvent<HTMLTextAreaElement>) => {
            onBlur?.(event);
            protection.clearSelectionState();
          }}
        />
        <ProtectSelectionButton disabled={!protection.canProtect} onProtect={protection.protectSelection} />
      </div>
    );
  },
);
