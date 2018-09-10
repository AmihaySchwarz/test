import * as React from 'react';
import { IToolbarProps } from './IToolbarProps';
import { ViewType } from '../../enum';
import styles from './Toolbar.module.scss';

export class Toolbar extends React.Component<IToolbarProps, {}> {
    public constructor(props) {
        super(props);
        this.onToolbarButtonClick = this.onToolbarButtonClick.bind(this);
    }

    public render() {
        return (
            <div className={styles.ToolbarRoot}>
                {this.props.showSeparator &&
                    <div className={styles.Separator}></div>
                }
                <div className={styles.Toolbar}>
                    {this.props.showToolbar &&
                        <div className='dws-flex-left'>
                            <a href="#" onClick={() => this.onToolbarButtonClick(ViewType.New)}>
                                Add&nbsp;<i className="ms-Icon ms-Icon--AddTo" aria-hidden="true"></i>
                            </a>
                        </div>
                    }
                    {!!this.props.linkButtonTarget && !!this.props.linkButtonText &&
                        <div className='dws-flex-center'>
                            <a href={this.props.linkButtonTarget} target="_blank">
                                {this.props.linkButtonText}&nbsp;<i className="ms-Icon ms-Icon--ChevronRightMed" aria-hidden="true"></i>
                            </a>
                        </div>
                    }
                    {this.props.showToolbar &&
                        <div className='dws-flex-right'>
                            <a href="#" onClick={() => this.onToolbarButtonClick(ViewType.Edit)}>
                                <i className="ms-Icon ms-Icon--Edit" aria-hidden="true"></i>&nbsp;Edit
                            </a>
                        </div>
                    }
                </div>
            </div>
        );
    }

    private onToolbarButtonClick(view: ViewType): void {
        this.props.changeView(view);
    }
}
