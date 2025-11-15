import AlertBanner from "./AlertBanner";
import { ErrorAlertProps } from "./alert-banner.types";

export function ErrorAlert(props: ErrorAlertProps) {
    return <AlertBanner type="error" {...props} />;
}
