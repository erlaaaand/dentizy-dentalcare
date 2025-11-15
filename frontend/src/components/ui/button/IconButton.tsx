import { IconButtonProps } from "./button.types";
import Button from "./Button";

export const IconButton: React.FC<IconButtonProps> = ({
    icon,
    'aria-label': ariaLabel,
    ...props
}) => {
    return (
        <Button
            icon={icon}
            iconOnly
            aria-label={ariaLabel}
            {...props}
        />
    );
};