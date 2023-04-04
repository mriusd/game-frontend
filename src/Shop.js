import React from 'react';
import Grid from './Grid';

const Shop = ({ items }) => {
  return (
    <Grid images={items} isDraggable={false} onImageClick={console.log} />
  );
};

export default Shop;
