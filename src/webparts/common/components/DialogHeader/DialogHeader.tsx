import * as React from 'react';
import { IDialogHeaderProps } from './IDialogHeaderProps';
import { ViewType } from '../../enum';
import styles from './DialogHeader.module.scss';

export class DialogHeader extends React.Component<IDialogHeaderProps, {}> {
    public constructor(props) {
        super(props);
        this.onCloseClick = this.onCloseClick.bind(this);
        this.onSaveClick = this.onSaveClick.bind(this);
    }

    public render() {
        return (
            <div className={styles.DialogHeaderRoot}>
                <div className={styles.Toolbar}>
                    <div className='dws-flex-left'>
                        <a href="#" onClick={this.onCloseClick}>
                            <i className="ms-Icon ms-Icon--Cancel" aria-hidden="true"></i>
                        </a>
                    </div>
                    <div className='dws-flex-center'>
                        <span className={styles.Title}>{this.props.title}</span>
                    </div>
                    <div className='dws-flex-right'>
                        {this.props.showSaveButton &&
                            <a href="#" onClick={this.onSaveClick}>
                                <i className="ms-Icon ms-Icon--Save" aria-hidden="true"></i>&nbsp;Save
                            </a>
                        }
                    </div>
                </div>
                <div className={styles.Separator}></div>
            </div>
        );
    }

    private async onCloseClick(): Promise<void> {
        if (this.props.closeSaveButton)
            await this.props.onSaveClick();
        this.props.changeView(this.props.previousView);
    }

    private onSaveClick(): void {
        // TODO: Add Save Logic Here
        this.props.onSaveClick();

    }
}
