import { ActionCardProps } from "./card.types";
import Card from "./Card";

export function ActionCard({
    title,
    description,
    action,
    icon,
    ...cardProps
}: ActionCardProps) {
    return (
        <Card {...cardProps}>
            <Card.Body padding="lg">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center">
                            {icon && <div className="mr-3 text-gray-400">{icon}</div>}
                            <div>
                                <Card.Title size="md">{title}</Card.Title>
                                {description && (
                                    <Card.Description>{description}</Card.Description>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                        {action}
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
}