import { EmptyDataStateProps } from "./empty-state.types";
import { default as EmptyState } from "./EmptyState";
import { DefaultIcons } from "./empty-state.icons";

export function EmptyDataState({
    title,
    resource = 'data',
    createAction,
    importAction,
    ...props
}: EmptyDataStateProps) {
    const actions = [];

    if (createAction) actions.push(createAction);
    if (importAction) actions.push(importAction);

    return (
        <EmptyState
            icon={<DefaultIcons.Folder className="w-full h-full" />}
            title={title || `No ${resource} found`}
            description={`There are no ${resource} to display at the moment. ${createAction ? 'Get started by creating a new one.' : ''}`}
            action={actions.length > 0 ? (
                <div className="flex flex-col sm:flex-row gap-3">
                    {actions}
                </div>
            ) : undefined}
            {...props}
        />
    );
}