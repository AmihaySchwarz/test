import { ViewType } from '../../enum';

export interface IDialogHeaderProps {
    title: string;
    showSaveButton?: boolean;
    closeSaveButton?: boolean;
    previousView: ViewType;
    onSaveClick: Function;
    changeView: Function;
}
