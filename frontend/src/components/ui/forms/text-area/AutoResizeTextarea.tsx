import React from "react";
import { TextareaProps } from "./text-area.types";
import { Textarea } from "./Textarea";

export function AutoResizeTextarea(props: Omit<TextareaProps, 'resize'>) {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const autoResize = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    React.useEffect(() => {
        autoResize();
    }, [props.value]);

    return (
        <Textarea
            ref={textareaRef}
            onInput={autoResize}
            resize="none"
            {...props}
        />
    );
}