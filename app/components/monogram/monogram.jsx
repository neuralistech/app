import { forwardRef } from 'react';
import { classes } from '~/utils/style';
import styles from './monogram.module.css';

export const Monogram = forwardRef(({ highlight, className, ...props }, ref) => {
  return (
    <img
      ref={ref}
      src="/logo-neuralis.png"
      alt="Neuralis"
      className={classes(styles.logo, className)}
      width="120"
      height="40"
      style={{ objectFit: 'contain' }}
      {...props}
    />
  );
});
