declare module 'react-masonry-css' {
  import * as React from 'react';
  interface MasonryProps {
    breakpointCols?: number | { [key: string]: number };
    className?: string;
    columnClassName?: string;
    children?: React.ReactNode;
  }
  export default class Masonry extends React.Component<MasonryProps> {}
} 