import AlertBanner from "./AlertBanner";
import { InfoAlertProps } from "./alert-banner.types";

export function InfoAlert(props: InfoAlertProps) {
    return <AlertBanner type="info" {...props} />;
}