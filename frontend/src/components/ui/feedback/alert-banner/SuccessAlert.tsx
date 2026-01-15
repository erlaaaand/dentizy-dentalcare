import { SuccessAlertProps } from "./alert-banner.types";
import AlertBanner from "./AlertBanner";

export function SuccessAlert(props: SuccessAlertProps) {
    return <AlertBanner type="success" {...props} />;
}