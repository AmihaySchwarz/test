import * as React from 'react';
import { IPlaceHolderProps } from './IPlaceHolderProps';

export class PlaceHolder extends React.Component<{}, {}> {
    public render() {
        return (
            <span>Please configure the web part.</span>
        );
    }
}
