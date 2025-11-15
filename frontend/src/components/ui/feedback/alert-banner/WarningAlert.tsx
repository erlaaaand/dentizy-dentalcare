import AlertBanner from "./AlertBanner";
import { WarningAlertProps } from "./alert-banner.types";

export function WarningAlert(props: WarningAlertProps) {
    return <AlertBanner type="warning" {...props} />;
}