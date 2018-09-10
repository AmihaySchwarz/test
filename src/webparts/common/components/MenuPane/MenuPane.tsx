import * as React from 'react';
import { IMenuPaneProps } from './IMenuPaneProps';
import { ViewType, MenuItemType } from '../../enum';
import styles from './MenuPane.module.scss';
import { DialogHeader } from '../DialogHeader';

export class MenuPane extends React.Component<IMenuPaneProps, {}> {
    constructor(props: IMenuPaneProps) {
        super(props);
        this.onMenuItemClick = this.onMenuItemClick.bind(this);
    }

    public render() {
        return (
            <div className={styles.Menu}>
                <DialogHeader title='Menu' showSaveButton={false} previousView={ViewType.Display}
                    changeView={this.props.changeView} onSaveClick={undefined} />
                {
                    this.props.menuItems.map((item, index) => {
                        return (
                            <div className={styles.MenuItem} key={index}>
                                {item.type === MenuItemType.ChangeView &&
                                    <a href="#" onClick={this.onMenuItemClick.bind(this, index)}>
                                        {item.text}
                                    </a>
                                }
                                {item.type === MenuItemType.OpenLink &&
                                    <a href={item.target} target="_blank">
                                        {item.text}
                                    </a>
                                }
                            </div>
                        );
                    })
                }
            </div>
        );
    }

    private onMenuItemClick(id): void {
        if (this.props.menuItems[id].type === MenuItemType.ChangeView) {
            this.props.changeView(this.props.menuItems[id].view);
        } else {
            console.log(this.props.menuItems[id].target);
        }
    }
}
