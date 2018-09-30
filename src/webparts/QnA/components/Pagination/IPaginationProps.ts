export interface IPaginationProps {
    pages: number;
    page: number;
    PageButtonComponent: any;
    onPageChange: Function;
    previousText: string;
    nextText: string;
}


